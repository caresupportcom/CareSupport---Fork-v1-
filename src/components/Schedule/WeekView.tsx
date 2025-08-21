import React, { useState } from 'react';
import { ClockIcon, CheckIcon, AlertTriangleIcon, CalendarIcon, ChevronRightIcon, ChevronDownIcon, RepeatIcon, PlusIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { useCalendar } from '../../contexts/CalendarContext';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const WeekView = ({
  startDate,
  onItemClick,
  onTimeSlotClick,
  activeFilter = 'all'
}) => {
  const [expandedDays, setExpandedDays] = useState({});
  // Get calendar context
  const calendarContext = useCalendar();
  const getEventsForDate = calendarContext?.getEventsForDate || (() => []);
  const isTaskCompleted = calendarContext?.isTaskCompleted || (() => false);
  const toggleTaskCompletion = calendarContext?.toggleTaskCompletion || (() => {});
  // Generate dates for the week
  const generateWeekDates = startDate => {
    const dates = [];
    const currentDate = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };
  const weekDates = generateWeekDates(startDate);
  // Toggle day expansion
  const toggleDayExpansion = dateStr => {
    setExpandedDays(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'week_view_toggle_day',
      expanded: !expandedDays[dateStr]
    });
  };
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
  // Group events by time of day
  const groupEventsByTime = events => {
    const morning = [];
    const afternoon = [];
    const evening = [];
    events.forEach(event => {
      const timeStr = event.startTime;
      const hour = parseInt(timeStr.split(':')[0]);
      if (hour < 12) {
        morning.push(event);
      } else if (hour < 17) {
        afternoon.push(event);
      } else {
        evening.push(event);
      }
    });
    return {
      morning,
      afternoon,
      evening
    };
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
  // Handle adding an event at a specific time
  const handleAddEvent = (date, timeOfDay) => {
    let timeSlot;
    // Set default time based on time of day
    switch (timeOfDay) {
      case 'morning':
        timeSlot = '09:00';
        break;
      case 'afternoon':
        timeSlot = '13:00';
        break;
      case 'evening':
        timeSlot = '18:00';
        break;
      default:
        timeSlot = '12:00';
    }
    onTimeSlotClick(timeSlot);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'week_view_add_event',
      time_of_day: timeOfDay,
      date: date.toISOString().split('T')[0]
    });
  };
  // Handle task completion toggle
  const handleCompleteEvent = (event, e) => {
    e.stopPropagation();
    toggleTaskCompletion(event.id);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'task_completion_toggled_week_view',
      event_category: event.category,
      new_status: isTaskCompleted(event.id) ? 'incomplete' : 'complete'
    });
  };
  // Render a single day in the week
  const renderDay = date => {
    const dateStr = date.toISOString().split('T')[0];
    const events = getFilteredEventsForDate(date);
    const isExpanded = expandedDays[dateStr];
    const {
      morning,
      afternoon,
      evening
    } = groupEventsByTime(events);
    // Get counts for the summary
    const totalEvents = events.length;
    const completedEvents = events.filter(event => isTaskCompleted(event.id)).length;
    const pendingEvents = totalEvents - completedEvents;
    const hasConflicts = events.some(event => event.hasConflict);
    return <div key={dateStr} className={`mb-3 rounded-xl border ${isToday(date) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
        {/* Day Header */}
        <div className={`p-4 flex justify-between items-center cursor-pointer ${isToday(date) ? 'bg-blue-100' : 'bg-gray-50'} rounded-t-xl`} onClick={() => toggleDayExpansion(dateStr)}>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${isToday(date) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              <span className="text-sm font-bold">{date.getDate()}</span>
            </div>
            <div>
              <h3 className={`font-medium ${isToday(date) ? 'text-blue-800' : 'text-gray-800'}`}>
                {date.toLocaleDateString('en-US', {
                weekday: 'long'
              })}
              </h3>
              <div className="flex items-center text-sm">
                <span className={isToday(date) ? 'text-blue-600' : 'text-gray-500'}>
                  {totalEvents} {totalEvents === 1 ? 'event' : 'events'}
                </span>
                {pendingEvents > 0 && <span className="ml-2 text-orange-500 flex items-center">
                    <ClockIcon className="w-3.5 h-3.5 mr-1" />
                    {pendingEvents} pending
                  </span>}
                {hasConflicts && <span className="ml-2 text-red-500 flex items-center">
                    <AlertTriangleIcon className="w-3.5 h-3.5 mr-1" />
                    Conflicts
                  </span>}
              </div>
            </div>
          </div>
          {isExpanded ? <ChevronDownIcon className="w-5 h-5 text-gray-500" /> : <ChevronRightIcon className="w-5 h-5 text-gray-500" />}
        </div>

        {/* Expanded Day Content */}
        {isExpanded && <div className="p-4">
            {events.length === 0 ? <div className="text-center py-4 text-gray-500">
                <p className="mb-3">No events scheduled</p>
                <div className="flex justify-center space-x-2">
                  <button onClick={() => handleAddEvent(date, 'morning')} className="px-2 py-1 text-xs text-blue-600 border border-blue-300 rounded-lg bg-blue-50 flex items-center">
                    <PlusIcon className="w-3 h-3 mr-1" />
                    Morning
                  </button>
                  <button onClick={() => handleAddEvent(date, 'afternoon')} className="px-2 py-1 text-xs text-blue-600 border border-blue-300 rounded-lg bg-blue-50 flex items-center">
                    <PlusIcon className="w-3 h-3 mr-1" />
                    Afternoon
                  </button>
                  <button onClick={() => handleAddEvent(date, 'evening')} className="px-2 py-1 text-xs text-blue-600 border border-blue-300 rounded-lg bg-blue-50 flex items-center">
                    <PlusIcon className="w-3 h-3 mr-1" />
                    Evening
                  </button>
                </div>
              </div> : <div className="space-y-4">
                {/* Morning Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-500">
                      Morning
                    </h4>
                    <button onClick={() => handleAddEvent(date, 'morning')} className="p-1 text-blue-600">
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {morning.length > 0 ? morning.map(event => renderEvent(event)) : <div className="text-xs text-gray-400 py-2 text-center border border-dashed border-gray-200 rounded-lg">
                      No morning events
                    </div>}
                </div>
                {/* Afternoon Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-500">
                      Afternoon
                    </h4>
                    <button onClick={() => handleAddEvent(date, 'afternoon')} className="p-1 text-blue-600">
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {afternoon.length > 0 ? afternoon.map(event => renderEvent(event)) : <div className="text-xs text-gray-400 py-2 text-center border border-dashed border-gray-200 rounded-lg">
                      No afternoon events
                    </div>}
                </div>
                {/* Evening Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-500">
                      Evening
                    </h4>
                    <button onClick={() => handleAddEvent(date, 'evening')} className="p-1 text-blue-600">
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {evening.length > 0 ? evening.map(event => renderEvent(event)) : <div className="text-xs text-gray-400 py-2 text-center border border-dashed border-gray-200 rounded-lg">
                      No evening events
                    </div>}
                </div>
              </div>}
          </div>}
      </div>;
  };
  // Render a single event
  const renderEvent = event => {
    const isCompleted = isTaskCompleted(event.id);
    // Get category styling
    const getCategoryStyle = category => {
      switch (category) {
        case 'medication':
          return 'border-blue-400 bg-blue-50';
        case 'appointment':
          return 'border-purple-400 bg-purple-50';
        case 'task':
        case 'therapy':
          return 'border-green-400 bg-green-50';
        case 'meal':
          return 'border-yellow-400 bg-yellow-50';
        default:
          return 'border-gray-300 bg-gray-50';
      }
    };
    // Get border color for category
    const getCategoryBorderColor = category => {
      switch (category) {
        case 'medication':
          return 'border-l-blue-500';
        case 'appointment':
          return 'border-l-purple-500';
        case 'task':
        case 'therapy':
          return 'border-l-green-500';
        case 'meal':
          return 'border-l-yellow-500';
        default:
          return 'border-l-gray-400';
      }
    };
    return <div key={event.id} className={`p-3 rounded-lg border-l-4 ${getCategoryBorderColor(event.category)} border ${event.hasConflict ? 'border-orange-300 bg-orange-50' : isCompleted ? 'border-green-300 bg-green-50' : getCategoryStyle(event.category)} cursor-pointer mb-2`} onClick={() => onItemClick(event)}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-sm">{event.title}</h3>
            <div className="flex items-center mt-1">
              <ClockIcon className="w-3.5 h-3.5 text-gray-500 mr-1" />
              <span className="text-xs text-gray-600">
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
            {event.isRecurring && <div className="flex items-center mt-1">
                <RepeatIcon className="w-3.5 h-3.5 text-gray-500 mr-1" />
                <span className="text-xs text-gray-600">
                  {event.recurrencePattern?.type.charAt(0).toUpperCase() + event.recurrencePattern?.type.slice(1)}
                </span>
              </div>}
          </div>
          <div className="flex">
            {isCompleted && <div className="bg-green-100 rounded-full p-1 mr-1">
                <CheckIcon className="w-4 h-4 text-green-600" />
              </div>}
            {event.hasConflict && <div className="bg-orange-100 rounded-full p-1">
                <AlertTriangleIcon className="w-4 h-4 text-orange-600" />
              </div>}
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          {event.location && <div className="flex items-center">
              <div className="w-3.5 h-3.5 flex items-center justify-center mr-1">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
              </div>
              <span className="text-xs text-gray-600 truncate max-w-[150px]">
                {event.location}
              </span>
            </div>}
          <button onClick={e => handleCompleteEvent(event, e)} className={`w-6 h-6 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center ml-auto`}>
            <CheckIcon className={`w-3.5 h-3.5 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>;
  };
  return <div className="h-full flex flex-col">
      <div className="mb-4">
        <BracketText className="text-blue-600">
          Week of{' '}
          {startDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })}
        </BracketText>
      </div>
      <div className="space-y-2">
        {weekDates.map(date => renderDay(date))}
      </div>
    </div>;
};