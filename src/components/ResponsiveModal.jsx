import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// Responsive modal component that handles overflow and mobile optimization
const ResponsiveModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div 
        className={`
          w-full ${sizeClasses[size]} 
          max-h-[90vh] overflow-y-auto
          bg-white dark:bg-gray-800 shadow-xl rounded-lg
          transform transition-all duration-200 ease-out
        `}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg">
          {(title || showCloseButton) && (
            <div className="flex justify-between items-center p-4 sm:p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
              {showCloseButton && (
                <button 
                  onClick={onClose} 
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          )}
          
          <div className={`${title || showCloseButton ? 'p-4 sm:p-6 pt-0' : 'p-4 sm:p-6'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveModal;