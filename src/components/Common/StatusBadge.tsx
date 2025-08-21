import React from 'react';
import { BracketText } from './BracketText';
type StatusType = 'success' | 'warning' | 'info' | 'error' | 'default';
interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}
export const StatusBadge = ({
  status,
  children,
  className = ''
}: StatusBadgeProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'info':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  return <BracketText className={`${getStatusColor()} ${className}`}>
      {children}
    </BracketText>;
};