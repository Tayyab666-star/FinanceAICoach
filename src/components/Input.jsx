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
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={inputName}
        className={`
          w-full px-3 py-2 border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error 
            ? 'border-red-300 text-red-900 placeholder-red-300' 
            : 'border-gray-300 placeholder-gray-400'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;