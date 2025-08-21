import React from 'react';
interface TimeHeaderProps {
  startHour: number;
  endHour: number;
  hourWidth: number;
}
export const TimeHeader: React.FC<TimeHeaderProps> = ({
  startHour,
  endHour,
  hourWidth
}) => {
  // Generate array of hours to display
  const hours = Array.from({
    length: endHour - startHour
  }, (_, i) => startHour + i);
  // Format hour for display (12-hour format with AM/PM)
  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  };
  return <div className="relative h-10 border-b border-gray-200 flex">
      {/* Left column for caregiver names */}
      <div className="w-32 min-w-[8rem] border-r border-gray-200 bg-gray-50 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-500">Caregivers</span>
      </div>
      {/* Time indicators */}
      <div className="flex-1 flex relative">
        {hours.map(hour => <div key={hour} className="absolute top-0 bottom-0 flex items-center justify-center border-r border-gray-200" style={{
        left: (hour - startHour) * hourWidth,
        width: hourWidth
      }}>
            <span className="text-xs font-medium text-gray-500">
              {formatHour(hour)}
            </span>
          </div>)}
      </div>
    </div>;
};