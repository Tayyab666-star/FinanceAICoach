import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import Toast from './Toast';

const ToastContainer = () => {
  const { toastNotifications, removeToastNotification } = useNotifications();

  if (toastNotifications.length === 0) return null;

  return (
    <>
      {/* Desktop positioning */}
      <div className="hidden sm:block fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toastNotifications.slice(0, 5).map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onRemove={removeToastNotification}
          />
        ))}
      </div>

      {/* Mobile positioning */}
      <div className="sm:hidden fixed top-4 left-4 right-4 z-50 space-y-2">
        {toastNotifications.slice(0, 3).map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onRemove={removeToastNotification}
          />
        ))}
      </div>
    </>
  );
};

export default ToastContainer;