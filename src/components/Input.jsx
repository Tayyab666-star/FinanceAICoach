import React from 'react';

// Reusable input component with consistent styling and proper form attributes
const Input = ({ 
  label, 
  error, 
  className = '',
  id,
  name,
  ...props 
}) => {
  // Generate unique ID if not provided
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const inputName = name || inputId;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={inputName}
        className={`
          w-full px-3 py-2 border text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          ${error 
            ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-400' 
            : 'border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;