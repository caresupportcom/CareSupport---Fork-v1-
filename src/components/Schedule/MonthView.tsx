import React, { useState, Fragment } from 'react';
import { CalendarIcon, CheckIcon, AlertTriangleIcon, ChevronRightIcon, RepeatIcon, PlusIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { useCalendar } from '../../contexts/CalendarContext';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const MonthView = ({
  startDate,
  onItemClick,
  onDateClick,
  activeFilter = 'all'
}) => {
  // State for selected day
  const [selectedDay, setSelectedDay] = useState(null);
  // Get calendar context
  const calendarContext = useCalendar();
  const getEventsForDate = calendarContext?.getEventsForDate || (() => []);
  const isTaskCompleted = calendarContext?.isTaskCompleted || (() => false);
  const toggleTaskCompletion = calendarContext?.toggleTaskCompletion || (() => {});
  // Generate all dates for the month view
  const generateMonthDates = startDate => {
    const dates = [];
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    // Add dates from previous month to fill the first row
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      dates.push({
        date,
        isCurrentMonth: false
      });
    }
    // Add all days of the current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      dates.push({
        date,
        isCurrentMonth: true
      });
    }
    // Add dates from next month to complete the grid (6 rows x 7 days = 42 cells)
    const remainingCells = 42 - dates.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      dates.push({
        date,
        isCurrentMonth: false
      });
    }
    return dates;
  };
  const monthDates = generateMonthDates(startDate);
  // Group dates into weeks for rendering
  const weeks = [];
  for (let i = 0; i < monthDates.length; i += 7) {
    weeks.push(monthDates.slice(i, i + 7));
  }
  // Check if a date is today
  const isToday = date => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  // Get events for a specific date that match the active filter
  const getFilteredEventsForDate = date => {
    const dateStr = date.toISOString().split('T')[0];
    const events = getEventsForDate(dateStr);
    if (activeFilter === 'all') return events;
    if (activeFilter === 'pending') return events.filter(event => !isTaskCompleted(event.id));
    if (activeFilter === 'completed') return events.filter(event => isTaskCompleted(event.id));
    return events.filter(event => event.category === activeFilter);
  };
  // Handle day selection
  const handleDayClick = date => {
    const dateStr = date.toISOString().split('T')[0];
    if (selectedDay === dateStr) {
      setSelectedDay(null);
    } else {
      setSelectedDay(dateStr);
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'month_view_select_day',
        has_events: getFilteredEventsForDate(date).length > 0
      });
    }
  };
  // Handle view in day view
  const handleViewInDay = date => {
    if (onDateClick) {
      onDateClick(date);
    }
    setSelectedDay(null);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'month_view_switch_to_day',
      date: date.toISOString().split('T')[0]
    });
  };
  // Handle task completion toggle
  const handleCompleteEvent = (event, e) => {
    e.stopPropagation();
    toggleTaskCompletion(event.id);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'task_completion_toggled_month_view',
      event_category: event.category,
      new_status: isTaskCompleted(event.id) ? 'incomplete' : 'complete'
    });
  };
  // Format time from 24-hour to 12-hour format
  const formatTime = timeString => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Get category styling
  const getCategoryStyle = category => {
    switch (category) {
      case 'medication':
        return 'bg-blue-100';
      case 'appointment':
        return 'bg-purple-100';
      case 'task':
      case 'therapy':
        return 'bg-green-100';
      case 'meal':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };
  // Get category text color
  const getCategoryTextColor = category => {
    switch (category) {
      case 'medication':
        return 'text-blue-800';
      case 'appointment':
        return 'text-purple-800';
      case 'task':
      case 'therapy':
        return 'text-green-800';
      case 'meal':
        return 'text-yellow-800';
      default:
        return 'text-gray-800';
    }
  };
  // Render day cell
  const renderDayCell = ({
    date,
    isCurrentMonth
  }) => {
    const dateStr = date.toISOString().split('T')[0];
    const events = getFilteredEventsForDate(date);
    const isSelected = selectedDay === dateStr;
    const dayEvents = events.slice(0, 3); // Limit to 3 events for display
    const hasMoreEvents = events.length > 3;
    // Calculate stats
    const completedCount = events.filter(event => isTaskCompleted(event.id)).length;
    const pendingCount = events.length - completedCount;
    const hasConflicts = events.some(event => event.hasConflict);
    const hasRecurringEvents = events.some(event => event.isRecurring);
    return <div key={dateStr} className={`relative border border-gray-200 min-h-[100px] p-1 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${isToday(date) ? 'border-blue-400' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''} cursor-pointer`} onClick={() => handleDayClick(date)}>
        {/* Day number */}
        <div className={`text-right mb-1 ${isCurrentMonth ? 'font-medium' : 'text-gray-400'}`}>
          {date.getDate()}
        </div>
        {/* Events */}
        <div className="space-y-1">
          {dayEvents.map(event => <div key={event.id} className={`text-xs px-1 py-0.5 rounded truncate ${getCategoryStyle(event.category)} ${getCategoryTextColor(event.category)} ${isTaskCompleted(event.id) ? 'line-through opacity-70' : ''}`} onClick={e => {
          e.stopPropagation();
          onItemClick(event);
        }}>
              {event.title}
            </div>)}
          {hasMoreEvents && <div className="text-xs text-gray-500 px-1">
              +{events.length - 3} more
            </div>}
        </div>
        {/* Indicators */}
        {events.length > 0 && <div className="absolute bottom-1 right-1 flex space-x-1">
            {completedCount > 0 && <div className="bg-green-100 rounded-full p-0.5">
                <CheckIcon className="w-3 h-3 text-green-600" />
              </div>}
            {hasConflicts && <div className="bg-orange-100 rounded-full p-0.5">
                <AlertTriangleIcon className="w-3 h-3 text-orange-600" />
              </div>}
            {hasRecurringEvents && <div className="bg-blue-100 rounded-full p-0.5">
                <RepeatIcon className="w-3 h-3 text-blue-600" />
              </div>}
          </div>}
      </div>;
  };
  // Render selected day details
  const renderSelectedDayDetails = () => {
    if (!selectedDay) return null;
    const selectedDate = new Date(selectedDay);
    const events = getFilteredEventsForDate(selectedDate);
    return <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">
            {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
          </h3>
          <button className="text-sm text-blue-600 font-medium flex items-center" onClick={() => handleViewInDay(selectedDate)}>
            View in Day <ChevronRightIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
        {events.length === 0 ? <div className="text-center py-4">
            <p className="text-gray-500 mb-3">No events scheduled</p>
            <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center mx-auto" onClick={() => {
          onItemClick({
            date: selectedDay,
            startTime: '12:00'
          });
        }}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Event
            </button>
          </div> : <div className="space-y-2">
            {events.map(event => <div key={event.id} className={`p-3 rounded-lg border ${isTaskCompleted(event.id) ? 'bg-green-50 border-green-200' : event.hasConflict ? 'bg-orange-50 border-orange-200' : getCategoryStyle(event.category)} cursor-pointer`} onClick={() => onItemClick(event)}>
                <div className="flex justify-between">
                  <h4 className="font-medium">{event.title}</h4>
                  <div className="flex items-center">
                    {event.isRecurring && <RepeatIcon className="w-4 h-4 text-gray-500 mr-1" />}
                    <button onClick={e => handleCompleteEvent(event, e)} className={`w-6 h-6 rounded-full ${isTaskCompleted(event.id) ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                      <CheckIcon className={`w-3.5 h-3.5 ${isTaskCompleted(event.id) ? 'text-green-600' : 'text-gray-400'}`} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
                {event.location && <div className="flex items-center mt-1 text-sm text-gray-600">
                    <div className="w-3.5 h-3.5 flex items-center justify-center mr-1">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                    </div>
                    <span>{event.location}</span>
                  </div>}
                {event.description && <div className="text-sm text-gray-600 mt-1">
                    {event.description}
                  </div>}
              </div>)}
          </div>}
      </div>;
  };
  return <div className="h-full flex flex-col">
      <div className="mb-4">
        <BracketText className="text-blue-600">
          {startDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })}
        </BracketText>
      </div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>)}
      </div>
      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 border-t border-l border-gray-200">
          {monthDates.map((dateObj, index) => <Fragment key={index}>{renderDayCell(dateObj)}</Fragment>)}
        </div>
        {/* Selected day details */}
        {renderSelectedDayDetails()}
      </div>
    </div>;
};