import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, XIcon, CheckIcon } from 'lucide-react';
import { availabilityService } from '../../../services/AvailabilityService';
import { storage } from '../../../services/StorageService';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';
export const AvailabilityCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateEditor, setShowDateEditor] = useState(false);
  const [availabilityData, setAvailabilityData] = useState({});
  const [userId, setUserId] = useState('');
  // Load availability data
  useEffect(() => {
    const userId = storage.get('user_id', '');
    setUserId(userId);
    if (userId) {
      // Load availability data for the current month
      loadMonthData(currentMonth);
    }
  }, []);
  // Load data when month changes
  useEffect(() => {
    if (userId) {
      loadMonthData(currentMonth);
    }
  }, [currentMonth, userId]);
  // Load month data
  const loadMonthData = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    const data = availabilityService.getAvailabilityRange(userId, startDateStr, endDateStr);
    setAvailabilityData(data);
  };
  // Calendar navigation
  const nextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_calendar_navigation',
      direction: 'next'
    });
  };
  const prevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_calendar_navigation',
      direction: 'previous'
    });
  };
  // Date selection
  const handleDateClick = date => {
    setSelectedDate(date);
    setShowDateEditor(true);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_date_selected',
      date: date.toISOString().split('T')[0]
    });
  };
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    // Total days in the month
    const daysInMonth = lastDay.getDate();
    // Array to hold all calendar days including empty slots for proper alignment
    const calendarDays = [];
    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      calendarDays.push(date);
    }
    return calendarDays;
  };
  // Get status for a specific date
  const getDateStatus = date => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return availabilityData[dateStr] || 'unset';
  };
  // Get status color class
  const getStatusColorClass = status => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'tentative':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };
  // Check if a date is today
  const isToday = date => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  const calendarDays = generateCalendarDays();
  return <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {currentMonth.toLocaleDateString('default', {
          month: 'long',
          year: 'numeric'
        })}
        </h2>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-sm font-medium text-gray-500 py-2">
            {day}
          </div>)}
        {calendarDays.map((date, index) => {
        if (!date) {
          return <div key={`empty-${index}`} className="border border-gray-100 bg-gray-50 rounded-md h-16"></div>;
        }
        const dateStatus = getDateStatus(date);
        const statusClass = getStatusColorClass(dateStatus);
        const todayClass = isToday(date) ? 'border-2 border-blue-500' : '';
        return <div key={date.toISOString()} onClick={() => handleDateClick(date)} className={`rounded-md h-16 flex flex-col p-1 cursor-pointer transition-colors ${todayClass} ${dateStatus !== 'unset' ? statusClass : 'hover:bg-gray-100'}`}>
              <div className="text-right text-sm font-medium">
                {date.getDate()}
              </div>
              {dateStatus !== 'unset' && <div className="flex-1 flex items-center justify-center">
                  <span className="text-xs capitalize">{dateStatus}</span>
                </div>}
            </div>;
      })}
      </div>
      {showDateEditor && selectedDate && <DateAvailabilityEditor date={selectedDate} initialStatus={getDateStatus(selectedDate)} onClose={() => setShowDateEditor(false)} onSave={status => {
      // Update local state
      const dateStr = selectedDate.toISOString().split('T')[0];
      setAvailabilityData({
        ...availabilityData,
        [dateStr]: status
      });
      // Save to service
      availabilityService.setDateAvailability(userId, dateStr, status);
      // Close editor
      setShowDateEditor(false);
      // Track event
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'availability_date_updated',
        date: dateStr,
        status: status
      });
    }} />}
    </div>;
};
// Date editor component
const DateAvailabilityEditor = ({
  date,
  initialStatus = 'unset',
  onClose,
  onSave
}) => {
  const [status, setStatus] = useState(initialStatus === 'unset' ? 'available' : initialStatus);
  const [timeSlots, setTimeSlots] = useState([]);
  return <div className="mt-4 border-t border-gray-200 pt-4">
      <h3 className="font-medium mb-2">
        Set Availability for{' '}
        {date?.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      })}
      </h3>
      <div className="mb-4">
        <div className="flex space-x-2 mb-3">
          <button onClick={() => setStatus('available')} className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 ${status === 'available' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600'}`}>
            Available
          </button>
          <button onClick={() => setStatus('tentative')} className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 ${status === 'tentative' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-gray-100 text-gray-600'}`}>
            Tentative
          </button>
          <button onClick={() => setStatus('unavailable')} className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 ${status === 'unavailable' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-600'}`}>
            Unavailable
          </button>
        </div>
      </div>
      <div className="flex justify-end mt-4 space-x-2">
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg">
          Cancel
        </button>
        <button onClick={() => onSave(status)} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Save
        </button>
      </div>
    </div>;
};