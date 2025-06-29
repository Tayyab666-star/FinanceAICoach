import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

// Custom hook for transactions
export const useTransactions = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase error fetching transactions:', error);
        throw error;
      }
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      
      // Check if it's a connection error
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to connect to the database. Please check your internet connection and try again.'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error Loading Transactions',
          message: 'Failed to load transactions. Please try again.'
        });
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setTransactions(prev => [data, ...prev]);
      
      // Add notification for user action
      addNotification({
        type: 'success',
        title: 'Transaction Added',
        message: `${transaction.type === 'income' ? 'Income' : 'Expense'} of $${Math.abs(transaction.amount).toFixed(2)} added for ${transaction.category}`
      });
      
      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to save transaction. Please check your connection and try again.'
        });
      }
      throw error;
    }
  };

  const updateTransaction = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setTransactions(prev => prev.map(t => t.id === id ? data : t));
      
      // Add notification for user action
      addNotification({
        type: 'success',
        title: 'Transaction Updated',
        message: `Transaction "${updates.description || data.description}" has been updated`
      });
      
      return data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to update transaction. Please check your connection and try again.'
        });
      }
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const transaction = transactions.find(t => t.id === id);
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Add notification for user action
      if (transaction) {
        addNotification({
          type: 'success',
          title: 'Transaction Deleted',
          message: `Transaction "${transaction.description}" has been deleted`
        });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to delete transaction. Please check your connection and try again.'
        });
      }
      throw error;
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions
  };
};

// Custom hook for goals
export const useGoals = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchGoals();
    } else {
      setGoals([]);
      setLoading(false);
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching goals:', error);
        throw error;
      }
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      
      // Check if it's a connection error
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to connect to the database. Please check your Supabase connection and try again.'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error Loading Goals',
          message: 'Failed to load goals. Please try again.'
        });
      }
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{ ...goal, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setGoals(prev => [data, ...prev]);
      
      // Add notification for user action
      addNotification({
        type: 'success',
        title: 'New Goal Created',
        message: `Goal "${goal.title}" created with target of $${goal.target_amount.toLocaleString()}`
      });
      
      return data;
    } catch (error) {
      console.error('Error adding goal:', error);
      
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to save goal. Please check your connection and try again.'
        });
      }
      throw error;
    }
  };

  const updateGoal = async (id, updates) => {
    try {
      const oldGoal = goals.find(g => g.id === id);
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setGoals(prev => prev.map(g => g.id === id ? data : g));
      
      // Check for goal completion or significant progress
      if (updates.current_amount && oldGoal) {
        const oldProgress = (oldGoal.current_amount / oldGoal.target_amount) * 100;
        const newProgress = (data.current_amount / data.target_amount) * 100;
        
        if (newProgress >= 100 && oldProgress < 100) {
          addNotification({
            type: 'success',
            title: 'Goal Achieved! 🎉',
            message: `Congratulations! You've reached your goal "${data.title}"`
          });
        } else if (updates.current_amount > oldGoal.current_amount) {
          addNotification({
            type: 'success',
            title: 'Goal Progress Updated',
            message: `Added $${(updates.current_amount - oldGoal.current_amount).toFixed(2)} to "${data.title}" (${newProgress.toFixed(1)}% complete)`
          });
        }
      } else {
        // General goal update notification
        addNotification({
          type: 'success',
          title: 'Goal Updated',
          message: `Goal "${data.title}" has been updated`
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error updating goal:', error);
      
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to update goal. Please check your connection and try again.'
        });
      }
      throw error;
    }
  };

  const deleteGoal = async (id) => {
    try {
      const goal = goals.find(g => g.id === id);
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setGoals(prev => prev.filter(g => g.id !== id));
      
      // Add notification for user action
      if (goal) {
        addNotification({
          type: 'success',
          title: 'Goal Deleted',
          message: `Goal "${goal.title}" has been deleted`
        });
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to delete goal. Please check your connection and try again.'
        });
      }
      throw error;
    }
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals
  };
};

// Custom hook for budget categories
export const useBudgetCategories = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchBudgets();
    } else {
      setBudgets({});
      setLoading(false);
    }
  }, [user]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase error fetching budgets:', error);
        throw error;
      }
      
      // Convert array to object for easier access
      const budgetObj = {};
      data?.forEach(budget => {
        budgetObj[budget.category] = budget.allocated_amount;
      });
      
      setBudgets(budgetObj);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      
      // Check if it's a connection error
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to connect to the database. Please check your Supabase connection and try again.'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error Loading Budget',
          message: 'Failed to load budget data. Please try again.'
        });
      }
      setBudgets({});
    } finally {
      setLoading(false);
    }
  };

  const updateBudgets = async (budgetData) => {
    try {
      // Delete existing budgets
      await supabase
        .from('budgets')
        .delete()
        .eq('user_id', user.id);

      // Insert new budgets
      const budgetArray = Object.entries(budgetData).map(([category, amount]) => ({
        user_id: user.id,
        category,
        allocated_amount: amount
      }));

      const { error } = await supabase
        .from('budgets')
        .insert(budgetArray);

      if (error) throw error;
      setBudgets(budgetData);
      
      // Add notification for user action
      addNotification({
        type: 'success',
        title: 'Budget Updated',
        message: `Budget categories have been updated with total allocation of $${Object.values(budgetData).reduce((sum, amount) => sum + amount, 0).toLocaleString()}`
      });
    } catch (error) {
      console.error('Error updating budgets:', error);
      
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to save budget. Please check your connection and try again.'
        });
      }
      throw error;
    }
  };

  const updateSingleBudget = async (category, amount) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          category,
          allocated_amount: amount
        }, {
          onConflict: 'user_id,category'
        });

      if (error) throw error;
      setBudgets(prev => ({ ...prev, [category]: amount }));
      
      // Add notification for user action
      addNotification({
        type: 'success',
        title: 'Budget Category Updated',
        message: `${category} budget updated to $${amount.toLocaleString()}`
      });
    } catch (error) {
      console.error('Error updating single budget:', error);
      
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Unable to update budget. Please check your connection and try again.'
        });
      }
      throw error;
    }
  };

  return {
    budgets,
    loading,
    updateBudgets,
    updateSingleBudget,
    refetch: fetchBudgets
  };
};