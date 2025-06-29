import React from 'react';

// Reusable card component with consistent styling, dark mode support, and responsive design
const Card = ({ 
  children, 
  className = '', 
  padding = 'p-4 sm:p-6',
  hover = false 
}) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg
      ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
      ${padding}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;