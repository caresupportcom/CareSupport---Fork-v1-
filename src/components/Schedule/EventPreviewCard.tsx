import React from 'react';
import { XIcon } from 'lucide-react';
import { CalendarEvent } from '../../services/CalendarService';
interface EventPreviewCardProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
}
export const EventPreviewCard: React.FC<EventPreviewCardProps> = ({
  event,
  onClose,
  onEdit
}) => {
  if (!event) return null;
  // Format time from 24-hour to 12-hour format
  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  return <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl shadow-lg p-4 z-30">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">{event.title}</h3>
        <button onClick={onClose} className="p-1">
          <XIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Time:</span>{' '}
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </div>
        {event.location && <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Location:</span> {event.location}
          </div>}
        {event.description && <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Description:</span>{' '}
            {event.description}
          </div>}
        {event.assignedTo && <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Assigned to:</span> {event.assignedTo}
          </div>}
        {event.isRecurring && <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Recurring:</span>{' '}
            {event.recurrencePattern?.type || 'Yes'}
          </div>}
      </div>
      <button onClick={() => onEdit(event)} className="w-full py-2 bg-blue-500 text-white rounded-lg">
        View Details
      </button>
    </div>;
};