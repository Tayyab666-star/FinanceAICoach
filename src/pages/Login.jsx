import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { createTestUsers, testUsers } from '../utils/createTestUsers';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Eye, EyeOff, Mail, Lock, Users } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingUsers, setIsCreatingUsers] = useState(false);
  const { user, signIn, isLoading } = useAuth();
  const { addNotification } = useNotifications();

  // Redirect if already logged in
  if (user) return <Navigate to="/dashboard" replace />;

  // Create test users on component mount
  useEffect(() => {
    const initializeTestUsers = async () => {
      setIsCreatingUsers(true);
      try {
        await createTestUsers();
        addNotification({
          type: 'success',
          title: 'Test Users Created',
          message: 'Demo accounts are ready! Check the login credentials below.'
        });
      } catch (error) {
        console.error('Error creating test users:', error);
      } finally {
        setIsCreatingUsers(false);
      }
    };

    initializeTestUsers();
  }, [addNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await signIn(formData.email, formData.password);
      
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have successfully logged in.'
      });
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message.includes('Invalid email or password')) {
        setErrors({ 
          general: 'Invalid email or password. Please check your credentials and try again.' 
        });
      } else {
        setErrors({ 
          general: 'Login failed. Please try again.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestUserLogin = (testUser) => {
    setFormData({
      email: testUser.email,
      password: testUser.password
    });
  };

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in to your FinanceApp account</p>
          </div>
          
          <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="pl-12"
                  error={errors.email}
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="pl-12 pr-12"
                  error={errors.password}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* General Error */}
              {errors.general && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                </div>
              )}
              
              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full text-lg py-3"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            
            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </Card>
        </div>

        {/* Test Users Panel */}
        <div className="max-w-md w-full mx-auto">
          <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Demo Accounts</h3>
            </div>
            
            {isCreatingUsers ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Setting up demo accounts...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Click any demo account to auto-fill login credentials:
                </p>
                
                {testUsers.map((testUser, index) => (
                  <button
                    key={index}
                    onClick={() => handleTestUserLogin(testUser)}
                    className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{testUser.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{testUser.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-blue-600 dark:text-blue-400">
                          Password: {testUser.password}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Income: ${testUser.monthly_income.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    💡 <strong>Tip:</strong> These demo accounts come with sample financial data including transactions, budgets, and goals to showcase the full application features.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;