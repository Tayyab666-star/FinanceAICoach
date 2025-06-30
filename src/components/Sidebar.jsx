import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  BarChart3, 
  PiggyBank, 
  Target, 
  Bot, 
  FileText, 
  Settings,
  X
} from 'lucide-react';

// Navigation items configuration
const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/transactions', icon: CreditCard, label: 'Transactions' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/app/budget', icon: PiggyBank, label: 'Budget' },
  { to: '/app/goals', icon: Target, label: 'Goals' },
  { to: '/app/ai-coach', icon: Bot, label: 'AI Coach' },
  { to: '/app/reports', icon: FileText, label: 'Reports' },
  { to: '/app/settings', icon: Settings, label: 'Settings' }
];

// Responsive sidebar component
const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/app/dashboard');
    onClose(); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer min-w-0 flex-1"
          >
            <img 
              src="/WhatsApp Image 2025-06-29 at 13.46.00_d292e4a6.jpg" 
              alt="Finance AI Coach" 
              className="h-8 w-auto object-contain flex-shrink-0"
              onError={(e) => {
                // Fallback to a gradient icon if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center hidden flex-shrink-0"
            >
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
              Finance AI Coach
            </span>
          </button>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 px-3 pb-4 overflow-y-auto h-full">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;