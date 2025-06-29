import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, LogOut, X, Check, Trash2 } from 'lucide-react';
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
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        {unreadCount > 0 && (
          <p className="text-sm text-gray-600 mt-1">{unreadCount} unread notifications</p>
        )}
      </div>

      {/* Notifications list */}
      <div className="max-h-64 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatTime(notification.timestamp)}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3 text-gray-500" />
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Remove notification"
                  >
                    <Trash2 className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No notifications yet</p>
            <p className="text-sm">You'll see updates about your transactions, goals, and budgets here</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={clearAllNotifications}
            className="w-full text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
};

// Top header component with user info and mobile menu
const Header = ({ onMenuClick }) => {
  const { user, userProfile, logout, getUserDisplayName } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get display name - use memoization to prevent unnecessary re-renders
  const displayName = React.useMemo(() => getUserDisplayName(), [userProfile, user]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Page title - hidden on mobile */}
        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {displayName}!
          </h2>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100 relative transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
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
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {displayName}
              </span>
            </button>
            
            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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