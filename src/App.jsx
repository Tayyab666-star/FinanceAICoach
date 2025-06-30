import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import LandingPage from './pages/LandingPage';
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
  const { user, isLoading, error } = useAuth();
  
  // Show loading spinner only if actively loading (not just checking auth)
  if (isLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }
  
  // Show error state if there's an authentication error
  if (error) {
    return (
      <LoadingSpinner 
        error={error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Render protected content
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading, error } = useAuth();
  
  // Show loading spinner only if actively loading
  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }
  
  // Show error state if there's an authentication error
  if (error) {
    return (
      <LoadingSpinner 
        error={error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }
  
  // Redirect to dashboard if already authenticated
  if (user) {
    console.log('User found, redirecting to dashboard');
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
                {/* Public Routes - Landing page and login */}
                <Route path="/" element={<LandingPage />} />
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
                  path="/app" 
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="budget" element={<Budget />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="ai-coach" element={<AICoach />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* Legacy dashboard route redirect */}
                <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                
                {/* Catch-all route - redirect to landing page */}
                <Route path="*" element={<Navigate to="/" replace />} />
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