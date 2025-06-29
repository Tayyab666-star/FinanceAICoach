import React from 'react';

// Reusable loading spinner component with dark mode support
const LoadingSpinner = ({ size = 'md', className = '', message = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`}
      />
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-center">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;