import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, FilterIcon, UsersIcon } from 'lucide-react';
export const ShiftsHeader = ({
  selectedDate,
  onPrevious,
  onNext,
  onToday,
  onFilterChange,
  activeFilter
}) => {
  // Format the date for display
  const formatDate = date => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };
  // Check if date is today
  const isToday = date => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  return <div className="px-6 mb-4">
      {/* Date Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={onPrevious} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" aria-label="Previous day">
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold">{formatDate(selectedDate)}</h2>
          {!isToday(selectedDate) && <button onClick={onToday} className="text-sm text-blue-600">
              Today
            </button>}
        </div>
        <button onClick={onNext} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" aria-label="Next day">
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button onClick={() => onFilterChange('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center ${activeFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
          <CalendarIcon className="w-4 h-4 mr-1.5" />
          All Shifts
        </button>
        <button onClick={() => onFilterChange('my-shifts')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center ${activeFilter === 'my-shifts' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
          <UsersIcon className="w-4 h-4 mr-1.5" />
          My Shifts
        </button>
        <button onClick={() => onFilterChange('open')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center ${activeFilter === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
          <FilterIcon className="w-4 h-4 mr-1.5" />
          Open Shifts
        </button>
      </div>
    </div>;
};