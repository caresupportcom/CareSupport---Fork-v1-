import React from 'react';
import { storage } from './StorageService';
import { dataService } from './DataService';
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority?: 'low' | 'medium' | 'high';
}
export type NotificationType = 'task' | 'alert' | 'reminder' | 'update' | 'conflict' | 'team';
class NotificationService {
  private storageKey = 'notifications';
  private toastListeners: Array<(notification: Notification) => void> = [];
  private notificationListeners: Array<(notifications: Notification[]) => void> = [];
  // Get all notifications
  getNotifications() {
    return dataService.getNotifications();
  }
  // Add a new notification
  addNotification(notification: Partial<Notification>) {
    const notifications = this.getNotifications();
    const newNotification = {
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    } as Notification;
    const updatedNotifications = [newNotification, ...notifications];
    storage.save(this.storageKey, updatedNotifications);
    // Notify toast listeners of the new notification
    this.toastListeners.forEach(listener => listener(newNotification));
    // Notify notification listeners of the updated list
    this.notificationListeners.forEach(listener => listener(updatedNotifications));
    return newNotification;
  }
  // Subscribe to all notifications (for context)
  subscribe(callback: (notifications: Notification[]) => void) {
    this.notificationListeners.push(callback);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(listener => listener !== callback);
    };
  }
  // Subscribe to toast notifications
  subscribeToToasts(callback: (notification: Notification) => void) {
    this.toastListeners.push(callback);
    return () => {
      this.toastListeners = this.toastListeners.filter(listener => listener !== callback);
    };
  }
  // Mark a notification as read
  markAsRead(notificationId: string) {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(notif => notif.id === notificationId ? {
      ...notif,
      read: true
    } : notif);
    storage.save(this.storageKey, updatedNotifications);
    this.notificationListeners.forEach(listener => listener(updatedNotifications));
  }
  // Mark all notifications as read
  markAllAsRead() {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      read: true
    }));
    storage.save(this.storageKey, updatedNotifications);
    this.notificationListeners.forEach(listener => listener(updatedNotifications));
  }
  // Delete a notification
  deleteNotification(id: string) {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    storage.save(this.storageKey, updatedNotifications);
    this.notificationListeners.forEach(listener => listener(updatedNotifications));
  }
  // Clear all notifications
  clearAllNotifications() {
    storage.save(this.storageKey, []);
    this.notificationListeners.forEach(listener => listener([]));
  }
  // Get unread notification count
  getUnreadCount() {
    const notifications = this.getNotifications();
    return notifications.filter(notif => !notif.read).length;
  }
  // Add demo notifications for testing
  addDemoNotifications() {
    dataService.initializeData();
  }
}
export const notificationService = new NotificationService();