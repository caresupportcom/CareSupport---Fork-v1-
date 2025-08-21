import React, { useEffect, useState, createContext, useContext } from 'react';
import { notificationService, Notification } from '../services/NotificationService';
import { useUserPreferences } from './UserPreferencesContext';
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
  clearAllNotifications: () => {}
});
export const useNotifications = () => useContext(NotificationContext);
export const NotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const {
    preferences
  } = useUserPreferences();
  // Load notifications on mount
  useEffect(() => {
    const currentNotifications = notificationService.getNotifications();
    setNotifications(currentNotifications);
    setUnreadCount(notificationService.getUnreadCount());
    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe(updatedNotifications => {
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.isRead).length);
    });
    return unsubscribe;
  }, []);
  // Filter notifications based on user preferences
  const filteredNotifications = notifications.filter(notification => {
    // If notifications are disabled in user preferences, don't show any
    if (!preferences.notifications.enabled) {
      return false;
    }
    // Check notification type against user preferences
    switch (notification.type) {
      case 'task':
      case 'reminder':
        return preferences.notifications.taskReminders;
      case 'team':
      case 'update':
        return preferences.notifications.teamUpdates;
      case 'conflict':
      case 'alert':
        return preferences.notifications.conflictAlerts;
      default:
        return true;
    }
  });
  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };
  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };
  const deleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
  };
  const clearAllNotifications = () => {
    notificationService.clearAllNotifications();
  };
  return <NotificationContext.Provider value={{
    notifications: filteredNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  }}>
      {children}
    </NotificationContext.Provider>;
};