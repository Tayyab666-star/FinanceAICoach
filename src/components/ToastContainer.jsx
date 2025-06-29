import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import Toast from './Toast';

const ToastContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.slice(0, 5).map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default ToastContainer;