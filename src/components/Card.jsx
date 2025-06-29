import React from 'react';

// Reusable card component with sharp edges and consistent styling
const Card = ({ 
  children, 
  className = '', 
  padding = 'p-4 sm:p-6',
  hover = false 
}) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm
      ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
      ${padding}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;