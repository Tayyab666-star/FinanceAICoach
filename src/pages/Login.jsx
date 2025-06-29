import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, Shield, ArrowRight, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const Login = () => {
  const [step, setStep] = useState('email'); // 'email' or 'verification'
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const { user, sendVerificationCode, verifyCode, checkUserExists, isLoading } = useAuth();
  const { addNotification } = useNotifications();

  // Redirect if already logged in
  if (user) return <Navigate to="/dashboard" replace />;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Check if user exists
      const userCheck = await checkUserExists(email);
      setIsReturningUser(userCheck.exists);
      
      // Send verification code
      const result = await sendVerificationCode(email);
      
      if (result.success) {
        setStep('verification');
        addNotification({
          type: 'success',
          title: 'Verification Code Sent',
          message: `We've sent a verification code to ${email}`
        });
      }
    } catch (error) {
      console.error('Email submission error:', error);
      
      if (error.message?.includes('Email address') && error.message?.includes('invalid')) {
        setError('This email domain is not allowed. Please contact support or try a different email.');
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await verifyCode(email, verificationCode);
      
      if (result.success) {
        addNotification({
          type: 'success',
          title: isReturningUser ? 'Welcome Back!' : 'Account Created!',
          message: isReturningUser ? 'You have successfully logged in.' : 'Your account has been created and you are now logged in.'
        });
        // Navigation will happen automatically via auth state change
      }
    } catch (error) {
      console.error('Code verification error:', error);
      
      if (error.message?.includes('Invalid') || error.message?.includes('expired')) {
        setError('Invalid or expired verification code. Please try again.');
      } else {
        setError('Failed to verify code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await sendVerificationCode(email);
      
      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Code Resent',
          message: 'A new verification code has been sent to your email'
        });
      }
    } catch (error) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setVerificationCode('');
    setError('');
    setIsReturningUser(false);
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
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">F</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {step === 'email' ? 'Welcome to FinanceApp' : 'Verify Your Email'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {step === 'email' 
              ? 'Enter your email to get started - no password required!' 
              : `Enter the verification code sent to ${email}`
            }
          </p>
        </div>
        
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
          {step === 'email' ? (
            // Email Step
            <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                  placeholder="Enter your email address"
                  className="pl-12 text-lg"
                  disabled={isSubmitting}
                  error={error}
                />
              </div>
              
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full text-lg py-3"
              >
                {isSubmitting ? 'Sending Code...' : (
                  <>
                    Send Verification Code
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              
              {/* Security note */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center text-blue-800 dark:text-blue-200">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Secure & Passwordless</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  We'll send a secure verification code to your email. No passwords to remember!
                </p>
              </div>
            </form>
          ) : (
            // Verification Step
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              {/* Status indicator */}
              <div className={`p-4 rounded-lg border-l-4 ${
                isReturningUser 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-400' 
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
              }`}>
                <div className="flex items-center">
                  <CheckCircle className={`w-5 h-5 mr-2 ${
                    isReturningUser ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <span className={`font-medium ${
                    isReturningUser ? 'text-green-900 dark:text-green-300' : 'text-blue-900 dark:text-blue-300'
                  }`}>
                    {isReturningUser ? 'Welcome back!' : 'Creating your account...'}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${
                  isReturningUser ? 'text-green-700 dark:text-green-200' : 'text-blue-700 dark:text-blue-200'
                }`}>
                  {isReturningUser 
                    ? 'We found your existing account. Enter the code to sign in.' 
                    : 'We\'ll set up your new account once you verify your email.'
                  }
                </p>
              </div>

              {/* Important note about email type */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Check your email for the verification
                    </p>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                      <p><strong>If you received a 6-digit code:</strong> Enter it below</p>
                      <p><strong>If you received a "Magic Link":</strong> Click the link in your email to login automatically</p>
                    </div>
                    <div className="mt-2">
                      <a 
                        href={`https://mail.google.com`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 underline"
                      >
                        Open Gmail
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <Input
                  label="Verification Code (if received)"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    // Only allow numbers and limit to 6 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                    setError('');
                  }}
                  placeholder="Enter 6-digit code"
                  className="text-center text-2xl tracking-widest font-mono"
                  disabled={isSubmitting}
                  error={error}
                  maxLength={6}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting || verificationCode.length !== 6}
                  className="flex-1 text-lg py-3"
                >
                  {isSubmitting ? 'Verifying...' : 'Continue to Dashboard'}
                </Button>
              </div>
              
              {/* Resend and back options */}
              <div className="flex flex-col space-y-2 text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isSubmitting}
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Didn't receive anything? Resend
                </button>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  disabled={isSubmitting}
                  className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Use a different email address
                </button>
              </div>
            </form>
          )}
        </Card>
        
        {/* Help text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {step === 'email' 
              ? 'New users will automatically get an account created upon email verification.'
              : 'Check your spam folder if you don\'t see the email within a few minutes.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;