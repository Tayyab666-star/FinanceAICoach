import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { user, login, isLoading } = useAuth();

  // Redirect if already logged in
  if (user) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e) => {
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

    try {
      setError('');
      await login(email);
    } catch (error) {
      setError('Failed to access account. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">F</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FinanceApp</h1>
          <p className="text-gray-600 mt-2">Enter your email to access your financial dashboard</p>
        </div>
        
        <Card className="shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email (e.g., 382ahmadraza@gmail.com)"
              className="text-lg"
            />
            
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}
            
            <Button
              type="submit"
              loading={isLoading}
              className="w-full text-lg py-3"
            >
              {isLoading ? 'Accessing Account...' : 'Access Dashboard'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              New users will automatically get a demo account with sample data
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;