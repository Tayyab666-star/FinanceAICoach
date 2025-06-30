import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, Shield, ArrowRight, CheckCircle, AlertCircle, ExternalLink, RefreshCw, LogIn, Clock, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' or 'verification'
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [lastCodeSentAt, setLastCodeSentAt] = useState(null);
  const [userExists, setUserExists] = useState(false);
  const { user, sendVerificationCode, verifyCode, checkUserExists, isLoading, error: authError, clearError } = useAuth();
  const { addNotification } = useNotifications();

  // Redirect if already logged in
  if (user) return <Navigate to="/app/dashboard" replace />;

  // Clear auth errors when component mounts or step changes
  React.useEffect(() => {
    if (authError) {
      clearError();
    }
  }, [step, authError, clearError]);

  const canResendCode = () => {
    if (!lastCodeSentAt) return true;
    const timeSinceLastSent = Date.now() - lastCodeSentAt;
    return timeSinceLastSent > 30000; // 30 seconds cooldown
  };

  const getResendCooldown = () => {
    if (!lastCodeSentAt) return 0;
    const timeSinceLastSent = Date.now() - lastCodeSentAt;
    const cooldownRemaining = 30000 - timeSinceLastSent;
    return Math.max(0, Math.ceil(cooldownRemaining / 1000));
  };

  const getTimeRemaining = () => {
    if (!lastCodeSentAt) return null;
    const timeSinceLastSent = Date.now() - lastCodeSentAt;
    const timeRemaining = 600000 - timeSinceLastSent; // 10 minutes in milliseconds
    if (timeRemaining <= 0) return null;
    
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
      setUserExists(userCheck.exists);
      
      // Send verification code for both new and existing users
      const result = await sendVerificationCode(email);
      
      if (result.success) {
        setStep('verification');
        setLastCodeSentAt(Date.now());
        
        if (userCheck.exists) {
          addNotification({
            type: 'success',
            title: 'Welcome Back!',
            message: `We've sent a verification code to ${email}`
          });
        } else {
          addNotification({
            type: 'success',
            title: 'Verification Code Sent',
            message: `We've sent a 6-digit verification code to ${email}`
          });
        }
      }
    } catch (error) {
      console.error('Email submission error:', error);
      setError(error.message || 'Failed to process email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
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
      
      // Check if it's an expiration error and suggest resending
      if (error.message?.includes('expired') || error.message?.includes('invalid')) {
        setError(`${error.message} Click "Get New Code" below to receive a fresh verification code.`);
      } else {
        setError(error.message || 'Failed to verify code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResendCode()) {
      setError(`Please wait ${getResendCooldown()} seconds before requesting a new code.`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await sendVerificationCode(email);
      
      if (result.success) {
        setLastCodeSentAt(Date.now());
        setVerificationCode(''); // Clear the input
        addNotification({
          type: 'success',
          title: 'New Code Sent',
          message: 'A new verification code has been sent to your email. Previous codes are now invalid.'
        });
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError(error.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setVerificationCode('');
    setError('');
    setIsReturningUser(false);
    setUserExists(false);
    setLastCodeSentAt(null);
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          {authError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg max-w-md mx-auto">
              <p className="text-red-800 dark:text-red-200 text-sm">{authError}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Back to Landing Button */}
        <div className="mb-6">
          <button
            onClick={handleBackToLanding}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          {/* Logo - Centered on mobile/tablet, left-aligned on desktop */}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-center items-center mb-4 space-y-3 sm:space-y-0 sm:space-x-3">
            <img 
              src="/WhatsApp Image 2025-06-29 at 13.46.00_d292e4a6.jpg" 
              alt="Finance AI Coach" 
              className="h-12 sm:h-16 w-auto object-contain"
              onError={(e) => {
                // Fallback to gradient icon if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg hidden"
            >
              <span className="text-xl sm:text-2xl font-bold text-white">F</span>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Finance AI Coach
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                Intelligent Financial Companion
              </p>
            </div>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {step === 'email' ? 'Welcome' : 'Check Your Email'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {step === 'email' 
              ? 'Your intelligent financial companion - no password required!' 
              : `We sent a 6-digit code to ${email}`
            }
          </p>
        </div>

        {/* Global Error Display */}
        {(error || authError) && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-200 text-sm">{error || authError}</p>
            </div>
          </div>
        )}
        
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 p-4 sm:p-6">
          {step === 'email' ? (
            // Email Step
            <form onSubmit={handleEmailSubmit} className="space-y-4 sm:space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email address"
                className="text-base sm:text-lg"
                disabled={isSubmitting}
                icon={Mail}
              />
              
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting || !email}
                className="w-full text-base sm:text-lg py-3"
              >
                {isSubmitting ? 'Sending Code...' : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              
              {/* Security note */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center text-blue-800 dark:text-blue-200">
                  <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">Secure & Passwordless</span>
                </div>
                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                  We'll send you a verification code to access your account securely.
                </p>
              </div>
            </form>
          ) : (
            // Verification Step
            <form onSubmit={handleCodeSubmit} className="space-y-4 sm:space-y-6">
              {/* Status indicator */}
              <div className="p-3 sm:p-4 rounded-lg border-l-4 bg-blue-50 dark:bg-blue-900/20 border-blue-400">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-sm sm:text-base text-blue-900 dark:text-blue-300">
                    {isReturningUser ? 'Welcome back!' : 'Creating your account...'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm mt-1 text-blue-700 dark:text-blue-200">
                  {isReturningUser 
                    ? 'Enter the verification code to access your account.'
                    : 'We\'ll set up your new account once you verify your email.'
                  }
                </p>
              </div>

              {/* Code expiration warning - more prominent */}
              {lastCodeSentAt && getTimeRemaining() && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 sm:p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Code expires in {getTimeRemaining()}
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                        Enter your code quickly or request a new one if it expires.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Code input */}
              <Input
                label="6-Digit Verification Code"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  // Only allow numbers and limit to 6 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError('');
                }}
                placeholder="000000"
                className="text-center text-xl sm:text-2xl tracking-widest font-mono"
                disabled={isSubmitting}
                maxLength={6}
              />

              {/* Email check reminder */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Check your email for the 6-digit code
                    </p>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                      <p>• Check your spam/junk folder if you don't see it</p>
                      <p>• The code expires in 10 minutes</p>
                      <p>• Requesting a new code will invalidate previous ones</p>
                      <p>• Make sure to enter all 6 digits</p>
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
              
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting || verificationCode.length !== 6}
                  className="flex-1 text-base sm:text-lg py-3"
                >
                  {isSubmitting ? 'Verifying...' : (
                    <>
                      {isReturningUser ? 'Sign In' : 'Complete Setup'}
                      <LogIn className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              
              {/* Resend and back options */}
              <div className="flex flex-col space-y-3 text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isSubmitting || !canResendCode()}
                    className={`text-sm font-medium inline-flex items-center ${
                      canResendCode() 
                        ? 'text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300' 
                        : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    {canResendCode() ? 'Get New Code' : `Wait ${getResendCooldown()}s`}
                  </button>
                  
                  <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>
                  
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    disabled={isSubmitting}
                    className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Use Different Email
                  </button>
                </div>
                
                {/* Important note about code invalidation */}
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Important:</strong> Requesting a new code will make any previous codes invalid. 
                    Only use the most recent code you received.
                  </p>
                </div>
              </div>
            </form>
          )}
        </Card>
        
        {/* Help text */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4">
            {step === 'email' 
              ? 'We\'ll send you a secure verification code to access your account.'
              : 'Having trouble? Make sure to check your spam folder and that you entered the correct email address.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;