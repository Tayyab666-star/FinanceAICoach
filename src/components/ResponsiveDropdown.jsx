import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// Responsive dropdown component that handles viewport overflow
const ResponsiveDropdown = ({ 
  trigger, 
  children, 
  className = '',
  align = 'left',
  maxHeight = '80vh'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen && triggerRef.current && dropdownRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = triggerRect.bottom + 4;
      let left = align === 'right' ? triggerRect.right - dropdownRect.width : triggerRect.left;

      // Adjust if dropdown would overflow bottom of viewport
      if (top + dropdownRect.height > viewportHeight - 20) {
        top = triggerRect.top - dropdownRect.height - 4;
      }

      // Adjust if dropdown would overflow right of viewport
      if (left + dropdownRect.width > viewportWidth - 20) {
        left = viewportWidth - dropdownRect.width - 20;
      }

      // Adjust if dropdown would overflow left of viewport
      if (left < 20) {
        left = 20;
      }

      setDropdownStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        maxHeight: maxHeight,
        overflowY: 'auto',
        zIndex: 1000
      });
    }
  }, [isOpen, align, maxHeight]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('scroll', () => setIsOpen(false), true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', () => setIsOpen(false), true);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default ResponsiveDropdown;