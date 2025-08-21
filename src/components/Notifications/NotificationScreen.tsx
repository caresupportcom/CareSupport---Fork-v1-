import React, { useState } from 'react';
import { ArrowLeftIcon, BellIcon, BellOffIcon, CheckIcon, TrashIcon, FilterIcon, XIcon } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../Common/Button';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { NotificationType } from '../../services/NotificationService';
export const NotificationScreen = ({
  onBack
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications();
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'notification_opened',
      notification_id: id
    });
  };
  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteNotification(id);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'notification_deleted',
      notification_id: id
    });
  };
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  const handleClearAll = () => {
    setShowClearConfirmation(true);
  };
  const confirmClearAll = () => {
    clearAllNotifications();
    setShowClearConfirmation(false);
  };
  const cancelClearAll = () => {
    setShowClearConfirmation(false);
  };
  const filteredNotifications = filter === 'all' ? notifications : notifications.filter(notification => notification.type === filter);
  const getNotificationTypeLabel = (type: NotificationType): string => {
    switch (type) {
      case 'task':
        return 'Task';
      case 'alert':
        return 'Alert';
      case 'reminder':
        return 'Reminder';
      case 'update':
        return 'Update';
      case 'conflict':
        return 'Conflict';
      case 'team':
        return 'Team';
      default:
        return 'Notification';
    }
  };
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
  const getNotificationBgColor = (type: NotificationType, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    switch (type) {
      case 'task':
        return 'bg-blue-50';
      case 'alert':
        return 'bg-red-50';
      case 'reminder':
        return 'bg-orange-50';
      case 'update':
        return 'bg-green-50';
      case 'conflict':
        return 'bg-purple-50';
      case 'team':
        return 'bg-indigo-50';
      default:
        return 'bg-gray-50';
    }
  };
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      });
    }
    // Otherwise show date
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center bg-white border-b border-gray-200">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold flex-1">Notifications</h1>
        <div className="flex items-center">
          {unreadCount > 0 && <button onClick={handleMarkAllAsRead} className="mr-3 text-sm text-blue-600 font-medium" aria-label="Mark all as read">
              Mark all read
            </button>}
          <button onClick={handleClearAll} className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100" aria-label="Clear all notifications">
            <TrashIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white px-6 py-3 border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-2">
          <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setFilter('all')}>
            All
          </button>
          <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === 'task' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setFilter('task')}>
            Tasks
          </button>
          <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === 'reminder' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setFilter('reminder')}>
            Reminders
          </button>
          <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === 'alert' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setFilter('alert')}>
            Alerts
          </button>
          <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === 'team' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setFilter('team')}>
            Team
          </button>
        </div>
      </div>
      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? <div className="flex flex-col items-center justify-center h-full px-6 py-10">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <BellOffIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500 text-center">
              {filter === 'all' ? "You don't have any notifications yet" : `You don't have any ${filter} notifications`}
            </p>
          </div> : <div className="divide-y divide-gray-200">
            {filteredNotifications.map(notification => <div key={notification.id} className={`${getNotificationBgColor(notification.type, notification.isRead)} hover:bg-gray-100 transition-colors`} onClick={() => handleNotificationClick(notification.id)}>
                <div className="px-6 py-4 flex items-start">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 flex-shrink-0 border border-gray-200">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${notification.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'} mr-2`}>
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                        {!notification.isRead && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <button onClick={e => handleDelete(notification.id, e)} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Delete notification">
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>)}
          </div>}
      </div>
      {/* Clear All Confirmation Modal */}
      {showClearConfirmation && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">
              Clear all notifications?
            </h3>
            <p className="text-gray-600 mb-6">
              This will remove all your notifications. This action cannot be
              undone.
            </p>
            <div className="flex space-x-3">
              <Button variant="secondary" className="flex-1" onClick={cancelClearAll}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={confirmClearAll}>
                Clear All
              </Button>
            </div>
          </div>
        </div>}
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