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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

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

// Profile settings component
const ProfileSettings = () => {
  const { user, userProfile, updateUserProfile, getUserDisplayName } = useAuth();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    timezone: 'UTC-05:00'
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || getUserDisplayName(),
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || '',
        timezone: userProfile.timezone || 'UTC-05:00'
      });
    }
  }, [userProfile, user, getUserDisplayName]);

  // Track changes
  useEffect(() => {
    if (userProfile) {
      const hasChanged = 
        formData.name !== (userProfile.name || getUserDisplayName()) ||
        formData.phone !== (userProfile.phone || '') ||
        formData.timezone !== (userProfile.timezone || 'UTC-05:00');
      setHasChanges(hasChanged);
    }
  }, [formData, userProfile, getUserDisplayName]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        timezone: formData.timezone
      });
      
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
        <h3 className="text-lg font-semibold">Profile Information</h3>
        {hasChanges && (
          <div className="flex items-center text-orange-600 text-sm">
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
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500 -mt-2">Email cannot be changed</p>
        
        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
          >
            <option value="UTC-08:00">Pacific Time (UTC-8)</option>
            <option value="UTC-07:00">Mountain Time (UTC-7)</option>
            <option value="UTC-06:00">Central Time (UTC-6)</option>
            <option value="UTC-05:00">Eastern Time (UTC-5)</option>
          </select>
        </div>
        
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
  const { userProfile, updateUserProfile } = useAuth();
  const { addNotification } = useNotifications();
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
      await updateUserProfile({
        monthly_income: parseFloat(formData.monthly_income),
        monthly_budget: parseFloat(formData.monthly_budget)
      });
      
      addNotification({
        type: 'success',
        title: 'Financial Settings Updated',
        message: `Monthly income: $${parseFloat(formData.monthly_income).toLocaleString()}, Budget: $${parseFloat(formData.monthly_budget).toLocaleString()}`
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
        <h3 className="text-lg font-semibold">Financial Settings</h3>
        {hasChanges && (
          <div className="flex items-center text-orange-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Unsaved changes
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Current financial info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Current Financial Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Monthly Income:</span>
              <span className="font-semibold text-blue-900 ml-2">
                ${(userProfile?.monthly_income || 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Monthly Budget:</span>
              <span className="font-semibold text-blue-900 ml-2">
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
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">💡 Budget Recommendation</h4>
            <p className="text-sm text-green-800">
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
          <h4 className="font-medium text-gray-900 mb-3">Preferences</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Auto-categorize transactions</p>
                <p className="text-sm text-gray-600">Automatically assign categories to new transactions</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Budget alerts</p>
                <p className="text-sm text-gray-600">Get notified when approaching budget limits</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Security settings component
const SecuritySettings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    alert('Password updated successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        
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
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
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
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
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
        <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
        <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">SMS Authentication</p>
            <p className="text-sm text-gray-600">Receive codes via text message</p>
          </div>
          <Button variant="outline">Enable</Button>
        </div>
      </Card>

      {/* Login Sessions */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
        
        <div className="space-y-3">
          {[
            { device: 'Chrome on MacBook Pro', location: 'New York, NY', current: true },
            { device: 'Safari on iPhone', location: 'New York, NY', current: false },
            { device: 'Chrome on Windows', location: 'Los Angeles, CA', current: false }
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  {session.device}
                  {session.current && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Current</span>}
                </p>
                <p className="text-sm text-gray-600">{session.location}</p>
              </div>
              {!session.current && (
                <Button size="sm" variant="outline">Revoke</Button>
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
    setNotifications({ ...notifications, [key]: !notifications[key] });
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
      <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
      
      <div className="space-y-4">
        {notificationOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{option.label}</p>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
            <button
              onClick={() => handleToggle(option.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications[option.key] ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications[option.key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Connected accounts component
const ConnectedAccounts = () => {
  const accounts = [
    { name: 'Chase Checking', type: 'Bank Account', status: 'Connected', balance: '$12,450' },
    { name: 'Wells Fargo Savings', type: 'Savings Account', status: 'Connected', balance: '$8,200' },
    { name: 'Chase Freedom', type: 'Credit Card', status: 'Connected', balance: '-$1,250' },
    { name: 'Vanguard 401k', type: 'Investment', status: 'Disconnected', balance: '$45,600' }
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Connected Accounts</h3>
      
      <div className="space-y-3">
        {accounts.map((account, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{account.name}</p>
                <p className="text-sm text-gray-600">{account.type}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-medium text-gray-900">{account.balance}</p>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  account.status === 'Connected' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {account.status}
                </span>
                <Button size="sm" variant="outline">
                  {account.status === 'Connected' ? 'Refresh' : 'Connect'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <Button variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add New Account
        </Button>
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
        return (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Data Export</h4>
                <p className="text-sm text-blue-800 mb-3">Download all your financial data</p>
                <Button size="sm" variant="outline">Export Data</Button>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                <p className="text-sm text-red-800 mb-3">Permanently delete your account and all data</p>
                <Button size="sm" variant="danger">Delete Account</Button>
              </div>
            </div>
          </Card>
        );
      case 'advanced':
        return (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Developer Mode</p>
                  <p className="text-sm text-gray-600">Enable advanced features and API access</p>
                </div>
                <Button size="sm" variant="outline">Enable</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Beta Features</p>
                  <p className="text-sm text-gray-600">Try new features before they're released</p>
                </div>
                <Button size="sm" variant="outline">Join Beta</Button>
              </div>
            </div>
          </Card>
        );
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
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
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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