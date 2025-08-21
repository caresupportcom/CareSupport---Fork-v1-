import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, ClockIcon, XCircleIcon, InfoIcon } from 'lucide-react';
import { availabilityService } from '../../../services/AvailabilityService';
import { storage } from '../../../services/StorageService';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';

export const AvailabilityCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState({});
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load availability data
  useEffect(() => {
    const userId = storage.get('user_id', '');
    setUserId(userId);
    if (userId) {
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
  const loadMonthData = (date) => {
    setIsLoading(true);
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const data = availabilityService.getAvailabilityRange(userId, startDateStr, endDateStr);
    setAvailabilityData(data);
    setIsLoading(false);
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

  // Quick status toggle - simplified for MVP
  const toggleDateStatus = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const currentStatus = availabilityData[dateStr] || 'unset';
    
    // Simple cycle: unset -> available -> unavailable -> unset
    let newStatus;
    switch (currentStatus) {
      case 'unset':
        newStatus = 'available';
        break;
      case 'available':
        newStatus = 'unavailable';
        break;
      case 'unavailable':
        newStatus = 'unset';
        break;
      default:
        newStatus = 'available';
    }

    // Update local state immediately for responsive UI
    setAvailabilityData({
      ...availabilityData,
      [dateStr]: newStatus
    });

    // Save to service
    if (newStatus === 'unset') {
      // Remove the entry if setting back to unset
      availabilityService.setDateAvailability(userId, dateStr, 'available');
      const updatedData = { ...availabilityData };
      delete updatedData[dateStr];
      setAvailabilityData(updatedData);
    } else {
      availabilityService.setDateAvailability(userId, dateStr, newStatus);
    }

    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_quick_toggle',
      date: dateStr,
      new_status: newStatus
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

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
  const getDateStatus = (date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return availabilityData[dateStr] || 'unset';
  };

  // Get status styling - using OKLCH color system
  const getStatusStyling = (status) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-cs-covered-confirmed',
          text: 'text-cs-text-on-dark',
          icon: <CheckCircleIcon className="w-4 h-4" />,
          label: 'Available'
        };
      case 'tentative':
        return {
          bg: 'bg-cs-maybe-available',
          text: 'text-cs-text-primary',
          icon: <ClockIcon className="w-4 h-4" />,
          label: 'Maybe'
        };
      case 'unavailable':
        return {
          bg: 'bg-cs-gap-critical',
          text: 'text-cs-text-on-dark',
          icon: <XCircleIcon className="w-4 h-4" />,
          label: 'Unavailable'
        };
      default:
        return {
          bg: 'bg-cs-gray-100',
          text: 'text-cs-text-secondary',
          icon: null,
          label: 'Not set'
        };
    }
  };

  // Check if a date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Check if a date is in the past
  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const calendarDays = generateCalendarDays();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cs-interactive-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-cs-text-primary">
          {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg bg-cs-gray-100 hover:bg-cs-gray-200 text-cs-text-primary focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-cs-gray-100 hover:bg-cs-gray-200 text-cs-text-primary focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
            aria-label="Next month"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 p-3 bg-cs-bg-card rounded-lg border border-cs-gray-200">
        <div className="flex items-center mb-2">
          <InfoIcon className="w-4 h-4 text-cs-interactive-primary mr-2" />
          <span className="text-sm font-medium text-cs-text-primary">Quick Setup</span>
        </div>
        <p className="text-xs text-cs-text-secondary mb-3">
          Tap any date to cycle through: Available → Unavailable → Not Set
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-cs-covered-confirmed rounded mr-2"></div>
            <span className="text-cs-text-primary">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-cs-gap-critical rounded mr-2"></div>
            <span className="text-cs-text-primary">Unavailable</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-cs-gray-200 rounded mr-2"></div>
            <span className="text-cs-text-primary">Not Set</span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-sm font-medium text-cs-text-secondary py-3">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square border border-cs-gray-200 bg-cs-gray-50 rounded-lg"
              ></div>
            );
          }

          const dateStatus = getDateStatus(date);
          const styling = getStatusStyling(dateStatus);
          const isDateToday = isToday(date);
          const isDatePast = isPastDate(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => !isDatePast && toggleDateStatus(date)}
              disabled={isDatePast}
              className={`
                aspect-square rounded-lg border-2 transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary focus:ring-offset-2
                ${isDateToday ? 'border-cs-interactive-primary' : 'border-transparent'}
                ${styling.bg} ${styling.text}
                ${isDatePast ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
                flex flex-col items-center justify-center p-1
              `}
              aria-label={`${date.getDate()} ${currentMonth.toLocaleDateString('default', { month: 'long' })}, ${styling.label}`}
              aria-pressed={dateStatus !== 'unset'}
            >
              <div className="text-sm font-medium mb-1">
                {date.getDate()}
              </div>
              {styling.icon && (
                <div className="flex items-center justify-center">
                  {styling.icon}
                </div>
              )}
              {isDateToday && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cs-interactive-primary rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick actions for bulk updates */}
      <div className="mt-6 p-4 bg-cs-bg-card rounded-lg border border-cs-gray-200">
        <h3 className="text-sm font-medium text-cs-text-primary mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              // Set all weekdays as available
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const updates = {};
              
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();
                if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
                  const dateStr = date.toISOString().split('T')[0];
                  if (!isPastDate(date)) {
                    updates[dateStr] = 'available';
                    availabilityService.setDateAvailability(userId, dateStr, 'available');
                  }
                }
              }
              setAvailabilityData({ ...availabilityData, ...updates });
            }}
            className="px-3 py-2 text-xs bg-cs-covered-confirmed text-cs-text-on-dark rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
          >
            Available Weekdays
          </button>
          <button
            onClick={() => {
              // Set all weekends as available
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const updates = {};
              
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                  const dateStr = date.toISOString().split('T')[0];
                  if (!isPastDate(date)) {
                    updates[dateStr] = 'available';
                    availabilityService.setDateAvailability(userId, dateStr, 'available');
                  }
                }
              }
              setAvailabilityData({ ...availabilityData, ...updates });
            }}
            className="px-3 py-2 text-xs bg-cs-covered-confirmed text-cs-text-on-dark rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
          >
            Available Weekends
          </button>
          <button
            onClick={() => {
              // Clear all availability for the month
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const updates = {};
              
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateStr = date.toISOString().split('T')[0];
                if (!isPastDate(date)) {
                  updates[dateStr] = 'unset';
                  // Remove from service
                  availabilityService.setDateAvailability(userId, dateStr, 'available');
                }
              }
              setAvailabilityData({});
            }}
            className="px-3 py-2 text-xs bg-cs-gray-300 text-cs-text-primary rounded-lg hover:bg-cs-gray-400 focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
          >
            Clear Month
          </button>
        </div>
      </div>
    </div>
  );
};