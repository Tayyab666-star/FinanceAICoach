import React from 'react';

// Enhanced loading spinner component with better error states and dark mode support
const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  message = '', 
  error = null,
  onRetry = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  if (error) {
    return (
      <div className={`flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 ${className}`}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 ${className}`}>
      <div className="text-center">
        <div 
          className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4`}
        />
        {message && (
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">{message}</p>
        )}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Loading your financial data...
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;