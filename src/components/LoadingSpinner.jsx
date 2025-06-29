import React from 'react';

// Reusable loading spinner component
const LoadingSpinner = ({ size = 'md', className = '', message = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col justify-center items-center min-h-screen ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      />
      {message && (
        <p className="mt-4 text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;