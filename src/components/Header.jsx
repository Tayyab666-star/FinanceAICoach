import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, LogOut, X, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

// Notification dropdown component
const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } = useNotifications();

  if (!isOpen) return null;

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'transaction': return '💳';
      case 'goal': return '🎯';
      case 'budget': return '💰';
      case 'achievement': return '🏆';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        {unreadCount > 0 && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">{unreadCount} unread notifications</p>
        )}
      </div>

      {/* Notifications list */}
      <div className="max-h-64 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-base sm:text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">{notification.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatTime(notification.timestamp)}</p>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                    title="Remove notification"
                  >
                    <Trash2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-10 sm:w-12 h-10 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs sm:text-sm">You'll see updates about your transactions, goals, and budgets here</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={clearAllNotifications}
            className="w-full text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
};

// Top header component with improved mobile layout and logo navigation
const Header = ({ onMenuClick }) => {
  const { user, userProfile, logout, getUserDisplayName } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoClick = () => {
    navigate('/app/dashboard');
  };

  // Get display name - use memoization to prevent unnecessary re-renders
  const displayName = React.useMemo(() => getUserDisplayName(), [userProfile, user]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3 transition-colors duration-200">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        {/* Desktop title */}
        <div className="hidden lg:block">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Welcome back, {displayName}!
          </h2>
        </div>
        
        {/* Mobile/Tablet centered logo with navigation */}
        <div className="lg:hidden flex-1 flex justify-center">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/WhatsApp Image 2025-06-29 at 13.46.00_d292e4a6.jpg" 
              alt="Finance AI Coach" 
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center hidden"
            >
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Finance AI
            </span>
          </button>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative transition-colors"
            >
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <NotificationDropdown 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
            />
          </div>
          
          {/* User menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-24 md:max-w-none truncate">
                {displayName}
              </span>
            </button>
            
            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg z-50">
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;