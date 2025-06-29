import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

// Custom hook for managing connected accounts
export const useConnectedAccounts = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAccounts();
    } else {
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching accounts:', error);
        throw error;
      }
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      addNotification({
        type: 'error',
        title: 'Error Loading Accounts',
        message: 'Failed to load connected accounts. Please try again.'
      });
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData) => {
    try {
      // Validate card details if it's a card
      if (accountData.account_type !== 'bank') {
        const isValidCard = validateCardDetails(accountData);
        if (!isValidCard.valid) {
          throw new Error(isValidCard.error);
        }
      }

      // Mask sensitive information
      const maskedData = {
        ...accountData,
        user_id: user.id,
        account_number: accountData.account_number ? maskAccountNumber(accountData.account_number) : null,
        card_number: accountData.card_number ? maskCardNumber(accountData.card_number) : null,
        balance: parseFloat(accountData.balance) || 0
      };

      const { data, error } = await supabase
        .from('connected_accounts')
        .insert([maskedData])
        .select()
        .single();

      if (error) throw error;
      
      setAccounts(prev => [data, ...prev]);
      
      addNotification({
        type: 'success',
        title: 'Account Connected',
        message: `${accountData.account_name} has been successfully connected`
      });
      
      return data;
    } catch (error) {
      console.error('Error adding account:', error);
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: error.message || 'Failed to connect account. Please check your details and try again.'
      });
      throw error;
    }
  };

  const updateAccount = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('connected_accounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setAccounts(prev => prev.map(acc => acc.id === id ? data : acc));
      
      addNotification({
        type: 'success',
        title: 'Account Updated',
        message: `${data.account_name} has been updated`
      });
      
      return data;
    } catch (error) {
      console.error('Error updating account:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update account. Please try again.'
      });
      throw error;
    }
  };

  const deleteAccount = async (id) => {
    try {
      const account = accounts.find(acc => acc.id === id);
      
      const { error } = await supabase
        .from('connected_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      
      if (account) {
        addNotification({
          type: 'success',
          title: 'Account Removed',
          message: `${account.account_name} has been disconnected`
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      addNotification({
        type: 'error',
        title: 'Removal Failed',
        message: 'Failed to remove account. Please try again.'
      });
      throw error;
    }
  };

  const refreshAccount = async (id) => {
    try {
      const account = accounts.find(acc => acc.id === id);
      if (!account) return;

      // Get the current balance from the database (this reflects any transaction updates)
      const { data: currentAccount, error: fetchError } = await supabase
        .from('connected_accounts')
        .select('balance')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Update the last_synced timestamp to show it was refreshed
      const { data, error } = await supabase
        .from('connected_accounts')
        .update({
          last_synced: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setAccounts(prev => prev.map(acc => acc.id === id ? data : acc));
      
      addNotification({
        type: 'success',
        title: 'Account Refreshed',
        message: `${account.account_name} has been refreshed. Current balance: $${parseFloat(data.balance).toFixed(2)}`
      });
      
      return data;
    } catch (error) {
      console.error('Error refreshing account:', error);
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh account. Please try again.'
      });
      throw error;
    }
  };

  // Calculate total balance across all accounts
  const getTotalBalance = () => {
    return accounts.reduce((total, account) => {
      if (account.is_active) {
        return total + (parseFloat(account.balance) || 0);
      }
      return total;
    }, 0);
  };

  // Distribute income across connected accounts
  const distributeIncome = async (totalIncome) => {
    try {
      const activeAccounts = accounts.filter(acc => acc.is_active);
      if (activeAccounts.length === 0) return;

      // Distribute income proportionally based on current balances
      const totalCurrentBalance = activeAccounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);
      
      for (const account of activeAccounts) {
        const proportion = totalCurrentBalance > 0 
          ? (parseFloat(account.balance) || 0) / totalCurrentBalance 
          : 1 / activeAccounts.length; // Equal distribution if all balances are 0
        
        const distributedAmount = totalIncome * proportion;
        const newBalance = (parseFloat(account.balance) || 0) + distributedAmount;

        await supabase
          .from('connected_accounts')
          .update({
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', account.id)
          .eq('user_id', user.id);
      }

      // Refresh accounts to show updated balances
      await fetchAccounts();
      
      addNotification({
        type: 'success',
        title: 'Income Distributed',
        message: `$${totalIncome.toFixed(2)} has been distributed across your connected accounts`
      });
    } catch (error) {
      console.error('Error distributing income:', error);
      addNotification({
        type: 'error',
        title: 'Distribution Failed',
        message: 'Failed to distribute income across accounts'
      });
    }
  };

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    refreshAccount,
    getTotalBalance,
    distributeIncome,
    refetch: fetchAccounts
  };
};

// Utility functions for card validation and masking
const validateCardDetails = (cardData) => {
  const { card_number, expiry_month, expiry_year, card_type } = cardData;

  // Validate card number (basic Luhn algorithm)
  if (!card_number || !isValidCardNumber(card_number)) {
    return { valid: false, error: 'Invalid card number. Please enter a valid Visa or Mastercard number.' };
  }

  // Validate expiry date
  if (!expiry_month || !expiry_year || expiry_month < 1 || expiry_month > 12) {
    return { valid: false, error: 'Invalid expiry date. Please enter a valid month (1-12) and year.' };
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  if (expiry_year < currentYear || (expiry_year === currentYear && expiry_month < currentMonth)) {
    return { valid: false, error: 'Card has expired. Please use a valid card.' };
  }

  // Validate card type
  if (!card_type || !['visa', 'mastercard', 'amex', 'discover'].includes(card_type.toLowerCase())) {
    return { valid: false, error: 'Unsupported card type. We support Visa, Mastercard, American Express, and Discover.' };
  }

  return { valid: true };
};

const isValidCardNumber = (cardNumber) => {
  // Remove spaces and non-digits
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  // Check length
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

const maskCardNumber = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  if (cleanNumber.length < 4) return cardNumber;
  
  const lastFour = cleanNumber.slice(-4);
  const masked = '*'.repeat(cleanNumber.length - 4) + lastFour;
  
  // Format with spaces
  return masked.replace(/(.{4})/g, '$1 ').trim();
};

const maskAccountNumber = (accountNumber) => {
  const cleanNumber = accountNumber.replace(/\D/g, '');
  if (cleanNumber.length < 4) return accountNumber;
  
  const lastFour = cleanNumber.slice(-4);
  return '*'.repeat(cleanNumber.length - 4) + lastFour;
};