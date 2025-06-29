import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  const { addNotification } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      await resetPassword(email);
      setEmailSent(true);
      
      addNotification({
        type: 'success',
        title: 'Reset Email Sent',
        message: 'Check your email for password reset instructions.'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full">
          <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Check Your Email</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We've sent password reset instructions to <strong>{email}</strong>. 
              Please check your email and follow the link to reset your password.
            </p>
            <div className="space-y-3">
              <Link to="/login">
                <Button className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
              <button
                onClick={() => setEmailSent(false)}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">F</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Enter your email to receive reset instructions</p>
        </div>
        
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email"
                className="pl-12"
                error={error}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full text-lg py-3"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </form>
          
          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;