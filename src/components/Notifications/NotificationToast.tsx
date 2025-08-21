import React, { useEffect, useState } from 'react';
import { XIcon, BellIcon } from 'lucide-react';
import { notificationService, Notification, NotificationType } from '../../services/NotificationService';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
export const NotificationToast: React.FC = () => {
  const [toast, setToast] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);
  const {
    preferences
  } = useUserPreferences();
  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'task':
        return <TaskIcon className="w-5 h-5 text-blue-500" />;
      case 'alert':
        return <AlertIcon className="w-5 h-5 text-red-500" />;
      case 'reminder':
        return <ClockIcon className="w-5 h-5 text-orange-500" />;
      case 'update':
        return <UpdateIcon className="w-5 h-5 text-green-500" />;
      case 'conflict':
        return <ConflictIcon className="w-5 h-5 text-purple-500" />;
      case 'team':
        return <TeamIcon className="w-5 h-5 text-indigo-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };
  useEffect(() => {
    // Subscribe to new notifications
    const unsubscribe = notificationService.subscribeToToasts(notification => {
      // Check if notifications are enabled
      if (!preferences.notifications.enabled) {
        return;
      }
      // Check if we're in quiet hours
      if (preferences.notifications.quietHoursEnabled) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        const [startHour, startMinute] = preferences.notifications.quietHoursStart.split(':').map(Number);
        const [endHour, endMinute] = preferences.notifications.quietHoursEnd.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        // Check if current time is within quiet hours
        if (startTime < endTime) {
          // Simple case: start time is before end time (e.g., 22:00 to 06:00)
          if (currentTime >= startTime && currentTime <= endTime) {
            return;
          }
        } else {
          // Complex case: start time is after end time (e.g., 22:00 to 06:00)
          if (currentTime >= startTime || currentTime <= endTime) {
            return;
          }
        }
      }
      // Show toast notification
      setToast(notification);
      setVisible(true);
      // Hide toast after 5 seconds
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => setToast(null), 300); // Wait for fade out animation
      }, 5000);
    });
    return unsubscribe;
  }, [preferences]);
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setToast(null), 300); // Wait for fade out animation
  };
  if (!toast) {
    return null;
  }
  return <div className={`fixed top-4 right-4 left-4 md:left-auto md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`} role="alert">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 flex-shrink-0 border border-gray-200">
            {getNotificationIcon(toast.type)}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{toast.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
          </div>
          <button onClick={handleClose} className="ml-4 text-gray-400 hover:text-gray-600" aria-label="Close notification">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>;
};
// Icons
const TaskIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>;
const AlertIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>;
const ClockIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>;
const UpdateIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>;
const ConflictIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>;
const TeamIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>;