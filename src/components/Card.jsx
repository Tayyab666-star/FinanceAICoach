import React from 'react';

// Reusable card component with consistent styling
const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  hover = false 
}) => {
  return (
    <div className={`
      bg-white rounded-lg border border-gray-200 shadow-sm
      ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
      ${padding}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;