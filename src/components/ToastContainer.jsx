import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import Toast from './Toast';

const ToastContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full sm:max-w-none sm:w-auto">
      <div className="flex flex-col space-y-2">
        {notifications.slice(0, 5).map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;