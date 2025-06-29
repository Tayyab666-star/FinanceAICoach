import React from 'react';

// Reusable card component with consistent styling and dark mode support
const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  hover = false 
}) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm
      ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
      ${padding}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;