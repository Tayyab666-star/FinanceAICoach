import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

// Forgot password page component
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) return;
    
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Password reset instructions sent to your email');
    } catch (error) {
      setMessage('Failed to send reset email');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">Enter your email to receive reset instructions</p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            
            {message && (
              <p className="text-sm text-green-600">{message}</p>
            )}
            
            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Send Reset Instructions
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;