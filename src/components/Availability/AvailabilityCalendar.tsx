import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ListIcon, FilterIcon, CheckIcon, ClockIcon, XIcon, CalendarDaysIcon } from 'lucide-react';
import { availabilityService } from '../../services/AvailabilityService';
import { AvailabilityListView } from './AvailabilityListView';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { storage } from '../../services/StorageService';
interface AvailabilityCalendarProps {
  userId?: string;
  onAvailabilityChange?: (date: string, status: string) => void;
}
export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  userId,
  onAvailabilityChange
}) => {
  // View state
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  // Date state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Date range selection
  const [isRangeSelectionMode, setIsRangeSelectionMode] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [rangeStatus, setRangeStatus] = useState<string>('available');
  // Calendar data
  const [availabilityData, setAvailabilityData] = useState<Record<string, string>>({});
  const [daysInMonth, setDaysInMonth] = useState<Date[]>([]);
  const [visibleDates, setVisibleDates] = useState<Date[]>([]);
  // Get current user ID from storage if not provided
  const currentUserId = userId || storage.get('user_id', '');
  // Load availability data
  useEffect(() => {
    loadAvailabilityData();
  }, [currentMonth, currentUserId]);
  // Calculate days to display when month changes
  useEffect(() => {
    const days = getDaysInMonth(currentMonth);
    setDaysInMonth(days);
    // For list view, show next 30 days from today
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    const visibleDays = viewMode === 'calendar' ? days : getDatesBetween(today, nextMonth);
    setVisibleDates(visibleDays);
  }, [currentMonth, viewMode]);
  // Load availability data for visible dates
  const loadAvailabilityData = () => {
    if (!currentUserId) return;
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    // For list view, get data for next 30 days
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    const start = viewMode === 'calendar' ? startOfMonth : today;
    const end = viewMode === 'calendar' ? endOfMonth : nextMonth;
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];
    const availabilityRange = availabilityService.getAvailabilityRange(currentUserId, startDateStr, endDateStr);
    setAvailabilityData(availabilityRange);
  };
  // Get all days in the current month
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Get days from previous month to fill first week
    const daysInPreviousMonth = firstDay.getDay();
    const previousMonth = new Date(year, month, 0);
    const days: Date[] = [];
    // Add days from previous month
    for (let i = daysInPreviousMonth - 1; i >= 0; i--) {
      const day = new Date(year, month - 1, previousMonth.getDate() - i);
      days.push(day);
    }
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    // Add days from next month to complete the grid (6 rows of 7 days)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };
  // Get dates between two dates (inclusive)
  const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };
  // Navigation functions
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  // Handle date click in calendar view
  const handleDateClick = (date: Date, status?: string) => {
    if (isRangeSelectionMode) {
      handleRangeSelection(date);
      return;
    }
    setSelectedDate(date);
    // If status is provided, update the availability
    if (status) {
      updateAvailability(date, status);
    }
  };
  // Handle range selection
  const handleRangeSelection = (date: Date) => {
    if (!startDate) {
      setStartDate(date);
      setEndDate(null);
    } else if (!endDate) {
      // Ensure start date is before end date
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    } else {
      // Reset and start new selection
      setStartDate(date);
      setEndDate(null);
    }
  };
  // Apply status to date range
  const applyRangeStatus = () => {
    if (!startDate || !endDate || !rangeStatus) return;
    const dates = getDatesBetween(startDate, endDate);
    // Update each date in the range
    dates.forEach(date => {
      updateAvailability(date, rangeStatus);
    });
    // Reset range selection
    setIsRangeSelectionMode(false);
    setStartDate(null);
    setEndDate(null);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_range_updated',
      range_size: dates.length,
      status: rangeStatus
    });
  };
  // Cancel range selection
  const cancelRangeSelection = () => {
    setIsRangeSelectionMode(false);
    setStartDate(null);
    setEndDate(null);
  };
  // Update availability for a single date
  const updateAvailability = (date: Date, status: string) => {
    if (!currentUserId) return;
    const dateStr = date.toISOString().split('T')[0];
    availabilityService.setDateAvailability(currentUserId, dateStr, status);
    // Update local state
    setAvailabilityData(prev => ({
      ...prev,
      [dateStr]: status
    }));
    // Call the callback if provided
    if (onAvailabilityChange) {
      onAvailabilityChange(dateStr, status);
    }
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_updated',
      status: status
    });
  };
  // Get status for a specific date
  const getDateStatus = (date: Date): string => {
    if (!date) return 'unset';
    const dateStr = date.toISOString().split('T')[0];
    return availabilityData[dateStr] || 'unset';
  };
  // Check if a date is in the current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };
  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  // Check if a date is in the selected range
  const isInSelectedRange = (date: Date): boolean => {
    if (!startDate) return false;
    if (!endDate) return isSameDay(date, startDate);
    return date >= startDate && date <= endDate;
  };
  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  };
  // Toggle between calendar and list view
  const toggleViewMode = (mode: 'calendar' | 'list') => {
    setViewMode(mode);
    // Reload data when view changes
    loadAvailabilityData();
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_view_changed',
      view_mode: mode
    });
  };
  // Render calendar view
  const renderCalendarView = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return <div className="mt-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekdays.map(day => <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>)}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const status = getDateStatus(date);
          const isCurrentMonthDay = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const inRange = isInSelectedRange(date);
          // Determine status-based styling
          let statusColor = '';
          if (status === 'available') statusColor = 'bg-green-100 text-green-800 hover:bg-green-200';else if (status === 'tentative') statusColor = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';else if (status === 'unavailable') statusColor = 'bg-red-100 text-red-800 hover:bg-red-200';
          return <button key={index} className={`
                  h-12 rounded-lg flex items-center justify-center relative
                  ${isCurrentMonthDay ? 'font-medium' : 'text-gray-400 font-normal'}
                  ${isTodayDate ? 'border-2 border-blue-500' : ''}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${inRange ? 'bg-blue-100 text-blue-800' : ''}
                  ${status !== 'unset' && !inRange ? statusColor : 'hover:bg-gray-100'}
                  ${!isCurrentMonthDay && !inRange ? 'opacity-50' : ''}
                `} onClick={() => handleDateClick(date)}>
                <span>{date.getDate()}</span>
                {/* Status indicator dot */}
                {status !== 'unset' && !inRange && <span className={`
                    absolute bottom-1 w-2 h-2 rounded-full
                    ${status === 'available' ? 'bg-green-500' : status === 'tentative' ? 'bg-yellow-500' : 'bg-red-500'}
                  `}></span>}
              </button>;
        })}
        </div>
      </div>;
  };
  // Render date status action buttons
  const renderDateActions = () => {
    return <div className="mt-4 flex justify-between">
        <button onClick={() => {
        if (selectedDate) updateAvailability(selectedDate, 'available');
      }} disabled={!selectedDate} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${!selectedDate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
          <CheckIcon className="w-4 h-4 mr-1" />
          Available
        </button>
        <button onClick={() => {
        if (selectedDate) updateAvailability(selectedDate, 'tentative');
      }} disabled={!selectedDate} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${!selectedDate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>
          <ClockIcon className="w-4 h-4 mr-1" />
          Tentative
        </button>
        <button onClick={() => {
        if (selectedDate) updateAvailability(selectedDate, 'unavailable');
      }} disabled={!selectedDate} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${!selectedDate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
          <XIcon className="w-4 h-4 mr-1" />
          Unavailable
        </button>
      </div>;
  };
  // Render range selection controls
  const renderRangeControls = () => {
    return <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Date Range Selection</h3>
          <div className="flex space-x-2">
            <button onClick={cancelRangeSelection} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">
              Cancel
            </button>
            <button onClick={applyRangeStatus} disabled={!startDate || !endDate} className={`px-3 py-1 text-sm bg-blue-500 text-white rounded-lg ${!startDate || !endDate ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Apply
            </button>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
          <div className="flex justify-between text-sm">
            <div>
              <span className="font-medium">Start:</span>{' '}
              {startDate ? startDate.toLocaleDateString() : 'Not selected'}
            </div>
            <div>
              <span className="font-medium">End:</span>{' '}
              {endDate ? endDate.toLocaleDateString() : 'Not selected'}
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <button onClick={() => setRangeStatus('available')} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center mr-2 ${rangeStatus === 'available' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-700'}`}>
            <CheckIcon className="w-4 h-4 mr-1" />
            Available
          </button>
          <button onClick={() => setRangeStatus('tentative')} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center mr-2 ${rangeStatus === 'tentative' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-100 text-gray-700'}`}>
            <ClockIcon className="w-4 h-4 mr-1" />
            Tentative
          </button>
          <button onClick={() => setRangeStatus('unavailable')} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${rangeStatus === 'unavailable' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-700'}`}>
            <XIcon className="w-4 h-4 mr-1" />
            Unavailable
          </button>
        </div>
      </div>;
  };
  return <div className="bg-white rounded-xl p-4 border border-gray-200">
      {/* Header with navigation and view toggle */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {currentMonth.toLocaleDateString('default', {
          month: 'long',
          year: 'numeric'
        })}
        </h2>
        <div className="flex items-center">
          {/* View toggle buttons */}
          <div className="flex mr-3 bg-gray-100 rounded-lg p-1">
            <button onClick={() => toggleViewMode('calendar')} className={`px-3 py-1 text-sm rounded-md flex items-center ${viewMode === 'calendar' ? 'bg-white shadow-sm' : ''}`}>
              <CalendarIcon className="w-4 h-4 mr-1.5" />
              Calendar
            </button>
            <button onClick={() => toggleViewMode('list')} className={`px-3 py-1 text-sm rounded-md flex items-center ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}>
              <ListIcon className="w-4 h-4 mr-1.5" />
              List
            </button>
          </div>
          {/* Month navigation */}
          <div className="flex space-x-2">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button onClick={goToToday} className="p-2 rounded-full hover:bg-gray-100">
              <CalendarDaysIcon className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Range selection toggle */}
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => setIsRangeSelectionMode(!isRangeSelectionMode)} className={`flex items-center text-sm ${isRangeSelectionMode ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
          <FilterIcon className="w-4 h-4 mr-1" />
          {isRangeSelectionMode ? 'Exit Range Selection' : 'Select Date Range'}
        </button>
      </div>
      {/* Range selection UI */}
      {isRangeSelectionMode && renderRangeControls()}
      {/* Calendar or List View */}
      {viewMode === 'calendar' ? <>
          {renderCalendarView()}
          {!isRangeSelectionMode && renderDateActions()}
        </> : <AvailabilityListView dates={visibleDates} availabilityData={availabilityData} onDateClick={(date, status) => handleDateClick(date, status)} />}
    </div>;
};