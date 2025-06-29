import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import AICoach from './pages/AICoach';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ToastContainer from './components/ToastContainer';
 
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  console.log('ProtectedRoute - User:', user, 'Loading:', isLoading);
  
  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('User authenticated, rendering protected content');
  // Render protected content
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  console.log('PublicRoute - User:', user, 'Loading:', isLoading);
  
  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to dashboard if already authenticated
  if (user) {
    console.log('User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Render public content
  return children;
};

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Routes>
                {/* Public Routes - Show when no user is logged in */}
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                
                {/* Protected Routes - Show only when user is logged in */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="budget" element={<Budget />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="ai-coach" element={<AICoach />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* Default route - redirect to login when no user */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              <ToastContainer />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;