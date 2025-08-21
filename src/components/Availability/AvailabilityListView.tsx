import React from 'react';
import { CalendarIcon, CheckIcon, ClockIcon, XIcon } from 'lucide-react';
interface AvailabilityListViewProps {
  dates: Date[];
  availabilityData: Record<string, string>;
  onDateClick: (date: Date, status: string) => void;
}
export const AvailabilityListView: React.FC<AvailabilityListViewProps> = ({
  dates,
  availabilityData,
  onDateClick
}) => {
  // Get status for a specific date
  const getDateStatus = (date: Date | null): string => {
    if (!date) return 'unset';
    const dateStr = date.toISOString().split('T')[0];
    return availabilityData[dateStr] || 'unset';
  };
  // Format date for display
  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  // Check if a date is today
  const isDateToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  return <div className="space-y-4 mt-4">
      {dates.map(date => {
      const status = getDateStatus(date);
      const isToday = isDateToday(date);
      return <div key={date.toISOString()} className={`border rounded-lg overflow-hidden ${isToday ? 'border-blue-300' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-500 mr-2" />
                <span className="font-medium">{formatDateDisplay(date)}</span>
                {isToday && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Today
                  </span>}
              </div>
              <span className={`text-sm px-3 py-1 rounded-full
                ${status === 'available' ? 'bg-green-100 text-green-800' : status === 'tentative' ? 'bg-yellow-100 text-yellow-800' : status === 'unavailable' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                {status === 'unset' ? 'Not Set' : capitalizeFirstLetter(status)}
              </span>
            </div>
            <div className="p-3 grid grid-cols-3 gap-2">
              <button onClick={() => onDateClick(date, 'available')} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${status === 'available' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                <CheckIcon className="w-4 h-4 mr-1" />
                Available
              </button>
              <button onClick={() => onDateClick(date, 'tentative')} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${status === 'tentative' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                <ClockIcon className="w-4 h-4 mr-1" />
                Tentative
              </button>
              <button onClick={() => onDateClick(date, 'unavailable')} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${status === 'unavailable' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                <XIcon className="w-4 h-4 mr-1" />
                Unavailable
              </button>
            </div>
          </div>;
    })}
    </div>;
};