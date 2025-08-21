import React from 'react';
import { ClockIcon, CalendarIcon, MapPinIcon, UserIcon, ArrowRightIcon, AlertCircleIcon } from 'lucide-react';
export const TaskRequestCard = ({
  request,
  onClaim,
  onView,
  getCategoryDisplayName,
  showClaimButton = true
}) => {
  // Format date for display
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  // Format time from 24-hour to 12-hour format
  const formatTime = timeString => {
    if (!timeString) return 'Flexible';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Get priority styling
  const getPriorityStyle = priority => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  // Format relative time
  const formatRelativeTime = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  // Check if task is urgent (due within 24 hours)
  const isUrgent = () => {
    if (!request.dueDate) return false;
    const dueDate = new Date(request.dueDate);
    if (request.dueTime) {
      const [hours, minutes] = request.dueTime.split(':');
      dueDate.setHours(parseInt(hours), parseInt(minutes));
    }
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 && diffHours < 24;
  };
  return <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-sm">{request.title}</h3>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getPriorityStyle(request.priority)}`}>
            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {request.description}
        </p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3">
          <div className="flex items-center text-xs text-gray-600">
            <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {formatDate(request.dueDate)}
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <ClockIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {request.dueTime ? formatTime(request.dueTime) : 'Flexible'}
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <UserIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {request.createdBy.charAt(0).toUpperCase() + request.createdBy.slice(1)}
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <ClockIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {request.duration} min
          </div>
        </div>
        {request.location && <div className="flex items-center text-xs text-gray-600 mb-3">
            <MapPinIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
            <span className="truncate">{request.location}</span>
          </div>}
        {/* Category and Posted Time */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
            {getCategoryDisplayName(request.category)}
          </div>
          <div className="text-xs text-gray-500">
            Posted {formatRelativeTime(request.createdAt)}
          </div>
        </div>
        {/* Urgent Warning if applicable */}
        {isUrgent() && <div className="flex items-center bg-red-50 text-red-700 p-2 rounded-md mb-3 text-xs">
            <AlertCircleIcon className="w-4 h-4 mr-1.5" />
            Urgent: Needed within 24 hours
          </div>}
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium" onClick={onView}>
            View Details
          </button>
          {showClaimButton ? <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center justify-center" onClick={onClaim}>
              I'll Help
              <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
            </button> : <button className="flex-1 py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium" disabled>
              {request.claimedBy === 'james' ? 'You Claimed' : 'Claimed'}
            </button>}
        </div>
      </div>
    </div>;
};