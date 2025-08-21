import React from 'react';
import { CareShift } from '../../../types/ScheduleTypes';
import { ClockIcon } from 'lucide-react';
interface ShiftBlockProps {
  shift: CareShift;
  timeToPosition: (time: string) => number;
  onClick: () => void;
}
export const ShiftBlock: React.FC<ShiftBlockProps> = ({
  shift,
  timeToPosition,
  onClick
}) => {
  // Calculate position and width based on start and end times
  const left = timeToPosition(shift.startTime);
  const right = timeToPosition(shift.endTime);
  const width = right - left;
  // Determine background color based on shift status
  const getBackgroundColor = () => {
    if (shift.color) return shift.color;
    switch (shift.status) {
      case 'open':
        return '#fff9e6';
      // Light yellow
      case 'in_progress':
        return '#e6f7ff';
      // Light blue
      case 'completed':
        return '#e6ffe6';
      // Light green
      default:
        return '#f0f0f0';
      // Light gray
    }
  };
  // Format time to 12-hour format
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  return <div className="absolute top-2 bottom-2 rounded-lg border shadow-sm flex flex-col overflow-hidden cursor-pointer hover:shadow-md transition-shadow" style={{
    left: left,
    width: Math.max(width, 60),
    backgroundColor: getBackgroundColor(),
    borderColor: shift.status === 'open' ? '#ffd666' : '#d9d9d9'
  }} onClick={onClick}>
      <div className="px-2 py-1 text-xs font-medium truncate">
        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
      </div>
      <div className="px-2 flex items-center">
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${shift.status === 'open' ? 'bg-yellow-100 text-yellow-800' : shift.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : shift.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {shift.status}
        </span>
      </div>
    </div>;
};