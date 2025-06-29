import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toastNotifications, setToastNotifications] = useState([]);

  // Load notifications from Supabase when user logs in
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Load notifications from database
  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to last 50 notifications

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Add notification (both persistent and toast)
  const addNotification = async (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      user_id: user?.id,
      ...notification,
      // Ensure title and message are strings and not too long
      title: String(notification.title || 'Notification').substring(0, 100),
      message: String(notification.message || '').substring(0, 250)
    };

    // Add to toast notifications (temporary)
    setToastNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 toasts

    // Save to database if user is logged in
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert([{
            user_id: user.id,
            type: newNotification.type || 'info',
            title: newNotification.title,
            message: newNotification.message,
            read: false
          }])
          .select()
          .single();

        if (!error && data) {
          // Add to persistent notifications with database ID
          setNotifications(prev => [data, ...prev.slice(0, 49)]); // Keep max 50 notifications
        }
      } catch (error) {
        console.error('Error saving notification:', error);
        // Still add to local state even if database save fails
        setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
      }
    } else {
      // If no user, just add to local state
      setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
    }
  };

  // Mark notification as read in database
  const markAsRead = async (id) => {
    // Update local state immediately
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    // Update in database if user is logged in
    if (user?.id) {
      try {
        await supabase
          .from('notifications')
          .update({ read: true, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // Update local state immediately
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );

    // Update in database if user is logged in
    if (user?.id) {
      try {
        await supabase
          .from('notifications')
          .update({ read: true, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('read', false);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  // Remove notification from database
  const removeNotification = async (id) => {
    // Update local state immediately
    setNotifications(prev => prev.filter(notif => notif.id !== id));

    // Remove from database if user is logged in
    if (user?.id) {
      try {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error removing notification:', error);
      }
    }
  };

  // Clear all notifications from database
  const clearAllNotifications = async () => {
    // Update local state immediately
    setNotifications([]);

    // Clear from database if user is logged in
    if (user?.id) {
      try {
        await supabase
          .from('notifications')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error clearing all notifications:', error);
      }
    }
  };

  // Remove toast notification (doesn't affect persistent notifications)
  const removeToastNotification = (id) => {
    setToastNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Calculate unread count from persistent notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications, // Persistent notifications from database
      toastNotifications, // Temporary toast notifications
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      removeToastNotification,
      loadNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};