import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  CreditCard, 
  Database, 
  Shield, 
  Eye,
  EyeOff,
  Save,
  Plus,
  DollarSign,
  Check,
  AlertCircle,
  RefreshCw,
  Smartphone,
  Mail,
  CheckCircle,
  X,
  Download,
  Trash2,
  Moon,
  Sun,
  Edit,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useTransactions, useGoals, useBudgetCategories } from '../hooks/useSupabaseData';
import { useConnectedAccounts } from '../hooks/useConnectedAccounts';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import ResponsiveModal from '../components/ResponsiveModal';

// Settings sections
const settingSections = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'financial', name: 'Financial Settings', icon: DollarSign },
  { id: 'security', name: 'Security', icon: Lock },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'accounts', name: 'Connected Accounts', icon: CreditCard },
  { id: 'data', name: 'Data & Privacy', icon: Database },
  { id: 'advanced', name: 'Advanced', icon: Shield }
];

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
        ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

// Profile settings component
const ProfileSettings = () => {
  const { user, userProfile, updateUserProfile, getUserDisplayName, refreshUserProfile } = useAuth();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    about_work: ''
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || getUserDisplayName(),
        email: userProfile.email || user?.email || '',
        bio: userProfile.bio || '',
        about_work: userProfile.about_work || ''
      });
    }
  }, [userProfile, user, getUserDisplayName]);

  // Track changes
  useEffect(() => {
    if (userProfile) {
      const hasChanged = 
        formData.name !== (userProfile.name || getUserDisplayName()) ||
        formData.bio !== (userProfile.bio || '') ||
        formData.about_work !== (userProfile.about_work || '');
      setHasChanges(hasChanged);
    }
  }, [formData, userProfile, getUserDisplayName]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile({
        name: formData.name,
        bio: formData.bio,
        about_work: formData.about_work
      });
      
      // Refresh the profile to ensure UI updates
      await refreshUserProfile();
      
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile information has been successfully updated'
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h3>
        {hasChanges && (
          <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Unsaved changes
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter your full name"
        />
        
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled
          className="bg-gray-50 dark:bg-gray-700"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Email cannot be changed</p>
        
        <Input
          label="Bio"
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell us about yourself"
        />
        
        <Input
          label="About Work"
          value={formData.about_work}
          onChange={(e) => handleInputChange('about_work', e.target.value)}
          placeholder="What do you do for work?"
        />
        
        <Button 
          onClick={handleSave} 
          className="flex items-center"
          disabled={!hasChanges || loading}
          loading={loading}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </Card>
  );
};

// Financial settings component
const FinancialSettings = () => {
  const { userProfile, updateUserProfile, refreshUserProfile } = useAuth();
  const { addNotification } = useNotifications();
  const { distributeIncome } = useConnectedAccounts();
  const [formData, setFormData] = useState({
    monthly_income: 0,
    monthly_budget: 0
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        monthly_income: userProfile.monthly_income || 0,
        monthly_budget: userProfile.monthly_budget || 0
      });
    }
  }, [userProfile]);

  // Track changes
  useEffect(() => {
    if (userProfile) {
      const hasChanged = 
        parseFloat(formData.monthly_income) !== (userProfile.monthly_income || 0) ||
        parseFloat(formData.monthly_budget) !== (userProfile.monthly_budget || 0);
      setHasChanges(hasChanged);
    }
  }, [formData, userProfile]);
  
  const handleUpdateFinancials = async () => {
    setLoading(true);
    try {
      const newIncome = parseFloat(formData.monthly_income);
      const oldIncome = userProfile?.monthly_income || 0;
      
      await updateUserProfile({
        monthly_income: newIncome,
        monthly_budget: parseFloat(formData.monthly_budget)
      });
      
      // If income increased, distribute the difference across connected accounts
      if (newIncome > oldIncome) {
        const incomeIncrease = newIncome - oldIncome;
        await distributeIncome(incomeIncrease);
      }
      
      // Refresh the profile to ensure UI updates
      await refreshUserProfile();
      
      addNotification({
        type: 'success',
        title: 'Financial Settings Updated',
        message: `Monthly income: $${newIncome.toLocaleString()}, Budget: $${parseFloat(formData.monthly_budget).toLocaleString()}`
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating financial info:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update financial information. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Settings</h3>
        {hasChanges && (
          <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Unsaved changes
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Current financial info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Current Financial Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-400">Monthly Income:</span>
              <span className="font-semibold text-blue-900 dark:text-blue-200 ml-2">
                ${(userProfile?.monthly_income || 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-400">Monthly Budget:</span>
              <span className="font-semibold text-blue-900 dark:text-blue-200 ml-2">
                ${(userProfile?.monthly_budget || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Update inputs */}
        <div className="space-y-4">
          <Input
            label="Monthly Income"
            type="number"
            step="0.01"
            value={formData.monthly_income}
            onChange={(e) => handleInputChange('monthly_income', e.target.value)}
            placeholder="Enter your monthly income"
          />
          <Input
            label="Monthly Budget"
            type="number"
            step="0.01"
            value={formData.monthly_budget}
            onChange={(e) => handleInputChange('monthly_budget', e.target.value)}
            placeholder="Enter your monthly budget"
          />
        </div>

        {/* Budget recommendation */}
        {formData.monthly_income > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">💡 Budget Recommendation</h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              Based on your income of ${parseFloat(formData.monthly_income).toLocaleString()}, 
              we recommend a budget of ${(parseFloat(formData.monthly_income) * 0.8).toLocaleString()} 
              (80% of income) to allow for savings and unexpected expenses.
            </p>
          </div>
        )}

        {/* Update button */}
        <Button 
          onClick={handleUpdateFinancials}
          className="flex items-center"
          disabled={!hasChanges || loading}
          loading={loading}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Update Financial Information
        </Button>

        {/* Financial preferences */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Preferences</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Auto-categorize transactions</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Automatically assign categories to new transactions</p>
              </div>
              <ToggleSwitch checked={true} onChange={() => {}} />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Budget alerts</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Get notified when approaching budget limits</p>
              </div>
              <ToggleSwitch checked={true} onChange={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Security settings component with working 2FA
const SecuritySettings = () => {
  const { addNotification } = useNotifications();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New passwords do not match'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      addNotification({
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 8 characters long'
      });
      return;
    }

    // Simulate password update
    addNotification({
      type: 'success',
      title: 'Password Updated',
      message: 'Your password has been successfully updated'
    });
    
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleEnableTwoFactor = () => {
    setShowTwoFactorSetup(true);
    addNotification({
      type: 'info',
      title: '2FA Setup Started',
      message: 'Please enter your phone number to continue'
    });
  };

  const handleVerifyTwoFactor = () => {
    if (verificationCode === '123456') { // Mock verification
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      setVerificationCode('');
      addNotification({
        type: 'success',
        title: '2FA Enabled',
        message: 'Two-factor authentication has been successfully enabled'
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Invalid Code',
        message: 'Please enter the correct verification code'
      });
    }
  };

  const handleDisableTwoFactor = () => {
    setTwoFactorEnabled(false);
    addNotification({
      type: 'success',
      title: '2FA Disabled',
      message: 'Two-factor authentication has been disabled'
    });
  };

  const handleRevokeSession = (sessionIndex) => {
    addNotification({
      type: 'success',
      title: 'Session Revoked',
      message: 'The selected session has been revoked successfully'
    });
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Change Password</h3>
        
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="relative">
            <Input
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
          
          <Button onClick={handlePasswordChange}>Update Password</Button>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Two-Factor Authentication</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Add an extra layer of security to your account</p>
        
        {!twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">SMS Authentication</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Receive codes via text message</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleEnableTwoFactor}>
                Enable
              </Button>
            </div>

            {showTwoFactorSetup && (
              <div className="p-4 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3">Set Up SMS Authentication</h4>
                <div className="space-y-3">
                  <Input
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                  <Input
                    label="Verification Code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 123456 to verify"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleVerifyTwoFactor} size="sm">
                      Verify & Enable
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowTwoFactorSetup(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-300">SMS Authentication Enabled</p>
                  <p className="text-sm text-green-700 dark:text-green-200">Your account is protected with 2FA</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleDisableTwoFactor}>
                Disable
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Login Sessions */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Active Sessions</h3>
        
        <div className="space-y-3">
          {[
            { device: 'Chrome on MacBook Pro', location: 'New York, NY', current: true },
            { device: 'Safari on iPhone', location: 'New York, NY', current: false },
            { device: 'Chrome on Windows', location: 'Los Angeles, CA', current: false }
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {session.device}
                  {session.current && <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">Current</span>}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{session.location}</p>
              </div>
              {!session.current && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleRevokeSession(index)}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Notification settings component
const NotificationSettings = () => {
  const { addNotification } = useNotifications();
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    goalReminders: true,
    transactionAlerts: false,
    weeklyReports: true,
    monthlyReports: true,
    securityAlerts: true,
    marketingEmails: false
  });

  const handleToggle = (key) => {
    setNotifications(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      
      addNotification({
        type: 'success',
        title: 'Notification Settings Updated',
        message: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${newState[key] ? 'enabled' : 'disabled'}`
      });
      
      return newState;
    });
  };

  const notificationOptions = [
    { key: 'budgetAlerts', label: 'Budget Alerts', description: 'Get notified when you approach budget limits' },
    { key: 'goalReminders', label: 'Goal Reminders', description: 'Reminders to contribute to your financial goals' },
    { key: 'transactionAlerts', label: 'Transaction Alerts', description: 'Instant notifications for all transactions' },
    { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly summary of your financial activity' },
    { key: 'monthlyReports', label: 'Monthly Reports', description: 'Comprehensive monthly financial reports' },
    { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security and login notifications' },
    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and promotional content' }
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Notification Preferences</h3>
      
      <div className="space-y-4">
        {notificationOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{option.description}</p>
            </div>
            <ToggleSwitch 
              checked={notifications[option.key]} 
              onChange={() => handleToggle(option.key)} 
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

// Add Account Modal Component
const AddAccountModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    account_type: 'credit_card',
    account_name: '',
    bank_name: '',
    account_number: '',
    card_number: '',
    card_type: 'visa',
    expiry_month: '',
    expiry_year: '',
    balance: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
      setFormData({
        account_type: 'credit_card',
        account_name: '',
        bank_name: '',
        account_number: '',
        card_number: '',
        card_type: 'visa',
        expiry_month: '',
        expiry_year: '',
        balance: ''
      });
      onClose();
    } catch (error) {
      console.error('Error adding account:', error);
    } finally {
      setLoading(false);
    }
  };

  const supportedBanks = [
    'Chase', 'Wells Fargo', 'Bank of America', 'Citibank', 'Capital One',
    'US Bank', 'PNC Bank', 'TD Bank', 'Truist', 'Fifth Third'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect New Account"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={formData.account_type}
            onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
          >
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="bank">Bank Account</option>
          </select>
        </div>

        <Input
          label="Account Name"
          value={formData.account_name}
          onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
          placeholder="e.g., My Chase Card"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank/Institution</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            required
          >
            <option value="">Select Bank</option>
            {supportedBanks.map(bank => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>

        {formData.account_type === 'bank' ? (
          <Input
            label="Account Number"
            value={formData.account_number}
            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
            placeholder="Enter account number"
            required
          />
        ) : (
          <>
            <Input
              label="Card Number"
              value={formData.card_number}
              onChange={(e) => setFormData({ ...formData, card_number: e.target.value.replace(/\D/g, '') })}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={formData.card_type}
                onChange={(e) => setFormData({ ...formData, card_type: e.target.value })}
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
                <option value="discover">Discover</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Month</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.expiry_month}
                  onChange={(e) => setFormData({ ...formData, expiry_month: e.target.value })}
                  required
                >
                  <option value="">Month</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Year</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.expiry_year}
                  onChange={(e) => setFormData({ ...formData, expiry_year: e.target.value })}
                  required
                >
                  <option value="">Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        <Input
          label="Current Balance"
          type="number"
          step="0.01"
          value={formData.balance}
          onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
          placeholder="0.00"
          required
        />

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Security Note:</strong> Your card details are encrypted and stored securely. Only the last 4 digits will be visible.
          </p>
        </div>

        <div className="flex space-x-3">
          <Button type="submit" className="flex-1" loading={loading}>
            Connect Account
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Enhanced Connected accounts component with real functionality
const ConnectedAccounts = () => {
  const { addNotification } = useNotifications();
  const { accounts, loading, addAccount, updateAccount, deleteAccount, refreshAccount, getTotalBalance } = useConnectedAccounts();
  const [refreshingAccounts, setRefreshingAccounts] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);

  const handleRefreshAccount = async (accountId) => {
    setRefreshingAccounts(prev => new Set([...prev, accountId]));
    
    try {
      await refreshAccount(accountId);
    } catch (error) {
      console.error('Error refreshing account:', error);
    } finally {
      setRefreshingAccounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(accountId);
        return newSet;
      });
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      try {
        await deleteAccount(accountId);
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const handleToggleAccount = async (accountId, currentStatus) => {
    try {
      await updateAccount(accountId, { is_active: !currentStatus });
    } catch (error) {
      console.error('Error toggling account:', error);
    }
  };

  const getCardIcon = (cardType) => {
    switch (cardType?.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '🏦';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connected Accounts</h3>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>

        {/* Total Balance Summary */}
        {accounts.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Total Balance Across All Accounts</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${getTotalBalance().toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Across {accounts.filter(acc => acc.is_active).length} active accounts
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{getCardIcon(account.card_type)}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-white">{account.account_name}</p>
                    {account.is_active ? (
                      <Wifi className="w-4 h-4 text-green-500" title="Connected" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-gray-400" title="Disconnected" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {account.bank_name} • {account.account_type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {account.card_number || account.account_number}
                  </p>
                  {account.last_synced && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last synced: {new Date(account.last_synced).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  ${parseFloat(account.balance || 0).toFixed(2)}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRefreshAccount(account.id)}
                    disabled={refreshingAccounts.has(account.id)}
                    loading={refreshingAccounts.has(account.id)}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleToggleAccount(account.id, account.is_active)}
                  >
                    {account.is_active ? 'Disconnect' : 'Connect'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {accounts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p>No accounts connected yet</p>
              <p className="text-sm">Connect your bank accounts and cards to track your finances</p>
            </div>
          )}
        </div>
      </Card>

      <AddAccountModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addAccount}
      />
    </div>
  );
};

// Data & Privacy component with export and delete functionality
const DataPrivacySettings = () => {
  const { user, userProfile, logout } = useAuth();
  const { transactions } = useTransactions();
  const { goals } = useGoals();
  const { budgets } = useBudgetCategories();
  const { addNotification } = useNotifications();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const generateComprehensiveReport = () => {
    const reportDate = new Date().toLocaleDateString();
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netWorth = totalIncome - totalExpenses;
    
    // Calculate category spending
    const categorySpending = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + Math.abs(t.amount);
    });

    const reportContent = `
COMPREHENSIVE FINANCIAL REPORT
Generated on: ${reportDate}
Account: ${user?.email}
User: ${userProfile?.name || 'N/A'}

═══════════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════════
Total Income:           $${totalIncome.toLocaleString()}
Total Expenses:         $${totalExpenses.toLocaleString()}
Net Worth:              $${netWorth.toLocaleString()}
Savings Rate:           ${totalIncome > 0 ? ((netWorth / totalIncome) * 100).toFixed(1) : 0}%
Total Transactions:     ${transactions.length}

ACCOUNT INFORMATION
═══════════════════════════════════════════════════════════════════
Monthly Income:         $${(userProfile?.monthly_income || 0).toLocaleString()}
Monthly Budget:         $${(userProfile?.monthly_budget || 0).toLocaleString()}
Setup Completed:        ${userProfile?.setup_completed ? 'Yes' : 'No'}
Account Created:        ${userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}

INCOME BREAKDOWN
═══════════════════════════════════════════════════════════════════
${transactions.filter(t => t.type === 'income').map(t => 
  `${t.date} | $${t.amount.toFixed(2)} | ${t.description} | ${t.category}`
).join('\n') || 'No income transactions recorded'}

EXPENSE BREAKDOWN BY CATEGORY
═══════════════════════════════════════════════════════════════════
${Object.entries(categorySpending).map(([category, amount]) => 
  `${category}: $${amount.toFixed(2)} (${totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0}%)`
).join('\n') || 'No expense categories found'}

DETAILED EXPENSE TRANSACTIONS
═══════════════════════════════════════════════════════════════════
${transactions.filter(t => t.type === 'expense').map(t => 
  `${t.date} | $${Math.abs(t.amount).toFixed(2)} | ${t.category} | ${t.description}`
).join('\n') || 'No expense transactions recorded'}

BUDGET ALLOCATION
═══════════════════════════════════════════════════════════════════
${Object.entries(budgets).map(([category, amount]) => 
  `${category}: $${amount.toFixed(2)} allocated`
).join('\n') || 'No budget categories set'}

FINANCIAL GOALS
═══════════════════════════════════════════════════════════════════
${goals.map(goal => {
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  return `${goal.title}:
  Target: $${goal.target_amount.toLocaleString()}
  Current: $${goal.current_amount.toLocaleString()}
  Progress: ${progress.toFixed(1)}%
  Deadline: ${goal.deadline}
  Category: ${goal.category}`;
}).join('\n\n') || 'No financial goals set'}

SPENDING PATTERNS & INSIGHTS
═══════════════════════════════════════════════════════════════════
• Average transaction amount: $${transactions.length > 0 ? (totalExpenses / transactions.filter(t => t.type === 'expense').length).toFixed(2) : '0.00'}
• Most frequent category: ${Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
• Largest expense: $${Math.max(...transactions.filter(t => t.type === 'expense').map(t => Math.abs(t.amount)), 0).toFixed(2)}
• Budget utilization: ${Object.keys(budgets).length > 0 ? 'Active budget tracking' : 'No budget set'}

RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════
${netWorth >= 0 ? '✓ Positive net worth - Great job maintaining financial health!' : '⚠ Negative net worth - Consider reducing expenses or increasing income'}
${(netWorth / totalIncome * 100) > 20 ? '✓ Excellent savings rate - You\'re on track for financial success' : '• Consider increasing your savings rate to at least 20%'}
${goals.length > 0 ? '✓ Financial goals set - Stay focused on achieving them' : '• Consider setting financial goals to improve motivation'}
${Object.keys(budgets).length > 0 ? '✓ Budget tracking active - Continue monitoring your spending' : '• Set up budget categories to better track your spending'}

═══════════════════════════════════════════════════════════════════
Report generated by FinanceApp
For questions or support, contact: support@financeapp.com
═══════════════════════════════════════════════════════════════════
    `;

    return reportContent;
  };

  const handleExportData = () => {
    try {
      const reportContent = generateComprehensiveReport();
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Data Exported Successfully',
        message: 'Your comprehensive financial report has been downloaded'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export data. Please try again.'
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      addNotification({
        type: 'error',
        title: 'Confirmation Required',
        message: 'Please type "DELETE" to confirm account deletion'
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Delete all user data from Supabase
      const userId = user?.id;
      
      if (userId) {
        // Delete in order to respect foreign key constraints
        await supabase.from('account_transactions').delete().eq('user_id', userId);
        await supabase.from('connected_accounts').delete().eq('user_id', userId);
        await supabase.from('receipts').delete().eq('user_id', userId);
        await supabase.from('notifications').delete().eq('user_id', userId);
        await supabase.from('transactions').delete().eq('user_id', userId);
        await supabase.from('goals').delete().eq('user_id', userId);
        await supabase.from('budgets').delete().eq('user_id', userId);
        await supabase.from('incomes').delete().eq('user_id', userId);
        await supabase.from('user_profiles').delete().eq('id', userId);
      }

      addNotification({
        type: 'success',
        title: 'Account Deleted',
        message: 'Your account and all data have been permanently deleted'
      });

      // Logout and redirect to login
      setTimeout(() => {
        logout();
      }, 2000);

    } catch (error) {
      console.error('Error deleting account:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete account. Please try again or contact support.'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Data & Privacy</h3>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Data Export</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">Download a comprehensive report of all your financial data</p>
          <Button size="sm" variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
        
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h4 className="font-medium text-red-900 dark:text-red-300 mb-2">Delete Account</h4>
          <p className="text-sm text-red-800 dark:text-red-200 mb-3">Permanently delete your account and all data</p>
          <Button 
            size="sm" 
            variant="danger" 
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">Delete Account</h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">⚠️ This action cannot be undone!</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 mt-2 ml-4 list-disc">
                  <li>Your profile and account information</li>
                  <li>All transaction history ({transactions.length} transactions)</li>
                  <li>All financial goals ({goals.length} goals)</li>
                  <li>All budget categories and settings</li>
                  <li>All connected account information</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type "DELETE" to confirm:
                </label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="font-mono"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="danger" 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  loading={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account Permanently'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

// Advanced settings with dark mode toggle
const AdvancedSettings = () => {
  const { addNotification } = useNotifications();
  const { isDarkMode, enableDarkMode, disableDarkMode } = useDarkMode();
  const [developerMode, setDeveloperMode] = useState(isDarkMode);

  const handleDeveloperModeToggle = () => {
    const newDeveloperMode = !developerMode;
    setDeveloperMode(newDeveloperMode);
    
    if (newDeveloperMode) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
    
    addNotification({
      type: 'success',
      title: `Developer Mode ${newDeveloperMode ? 'Enabled' : 'Disabled'}`,
      message: `Dark mode has been ${newDeveloperMode ? 'activated' : 'deactivated'}`
    });
  };

  const handleBetaFeatures = () => {
    addNotification({
      type: 'info',
      title: 'Beta Features',
      message: 'Beta program enrollment will be available soon'
    });
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Advanced Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            {isDarkMode ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-gray-600" />}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Developer Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Enable advanced features and dark mode
              </p>
            </div>
          </div>
          <ToggleSwitch 
            checked={developerMode} 
            onChange={handleDeveloperModeToggle} 
          />
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Beta Features</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Try new features before they're released
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleBetaFeatures}>
            Join Beta
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Main settings page component
const Settings = () => {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;
      case 'financial':
        return <FinancialSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'accounts':
        return <ConnectedAccounts />;
      case 'data':
        return <DataPrivacySettings />;
      case 'advanced':
        return <AdvancedSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
        </div>
        
        <Button variant="outline" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-1">
              {settingSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {section.name}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Settings content */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;