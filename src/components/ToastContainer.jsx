import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import Toast from './Toast';

const ToastContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Desktop positioning */}
      <div className="hidden sm:block fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.slice(0, 5).map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>

      {/* Mobile positioning */}
      <div className="sm:hidden fixed top-4 left-4 right-4 z-50 space-y-2">
        {notifications.slice(0, 3).map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </>
  );
};

export default ToastContainer;