import React from 'react';
import { BellIcon } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
interface NotificationBadgeProps {
  onClick: () => void;
  className?: string;
}
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  onClick,
  className = ''
}) => {
  const {
    unreadCount
  } = useNotifications();
  return <button className={`relative ${className}`} onClick={onClick} aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}>
      <BellIcon className="w-6 h-6 text-gray-600" />
      {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount > 99 ? <span className="px-1">99+</span> : unreadCount > 9 ? <span className="px-1">{unreadCount}</span> : <span className="w-4 h-4">{unreadCount}</span>}
        </span>}
    </button>;
};