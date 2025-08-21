import React, { useEffect, useState, useRef } from 'react';
import { ClockIcon, UserIcon, RepeatIcon, CheckIcon, CalendarIcon, XIcon, PlusIcon, AlertTriangleIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { useCalendar } from '../../contexts/CalendarContext';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
// Helper function to get border color for category
function getCategoryBorderColor(category) {
  switch (category) {
    case 'medication':
      return 'border-l-blue-500';
    case 'appointment':
      return 'border-l-purple-500';
    case 'task':
    case 'therapy':
      // Keep backward compatibility for existing events
      return 'border-l-green-500';
    case 'meal':
      return 'border-l-yellow-500';
    default:
      return 'border-l-gray-400';
  }
}
export const DayView = ({
  date,
  onItemClick,
  onTimeSlotClick,
  activeFilter = 'all'
}) => {
  // Safely access calendar context
  const calendarContext = useCalendar();
  const getEventsForDate = calendarContext?.getEventsForDate || (() => []);
  const toggleTaskCompletion = calendarContext?.toggleTaskCompletion || (() => {});
  const isTaskCompleted = calendarContext?.isTaskCompleted || (() => false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentTimeIndicatorRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);
  // Scroll to current time when component mounts
  useEffect(() => {
    if (isToday(date) && currentTimeIndicatorRef.current) {
      // Use setTimeout to ensure the DOM is fully rendered
      setTimeout(() => {
        currentTimeIndicatorRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
    }
  }, [date]);
  // Get events for this date
  const dateStr = date.toISOString().split('T')[0];
  const eventsForDate = getEventsForDate(dateStr);
  // Apply filters
  const filteredEvents = eventsForDate.filter(event => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return !isTaskCompleted(event.id);
    if (activeFilter === 'completed') return isTaskCompleted(event.id);
    return event.category === activeFilter;
  });
  // Sort items by time
  const sortedItems = [...filteredEvents].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
  // Generate time slots for the day, including half-hour increments
  const generateTimeSlots = () => {
    const slots = [];
    // Generate slots from midnight (0) to 11:30 PM (23:30)
    for (let hour = 0; hour < 24; hour++) {
      const hourFormatted = hour.toString().padStart(2, '0');
      slots.push(`${hourFormatted}:00`);
      slots.push(`${hourFormatted}:30`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();
  // Helper function to convert time string to minutes
  function timeToMinutes(timeString: string): number {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
  // Get category styling
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'medication':
        return 'border-blue-400 bg-blue-50';
      case 'appointment':
        return 'border-purple-400 bg-purple-50';
      case 'task':
      case 'therapy':
        // Keep backward compatibility for existing events
        return 'border-green-400 bg-green-50';
      case 'meal':
        return 'border-yellow-400 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };
  // Format time from 24-hour to 12-hour format
  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Find events for a specific time slot
  const getEventsForTimeSlot = (timeSlot: string) => {
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
    const slotMinutes = slotHour * 60 + slotMinute;
    return sortedItems.filter(item => {
      if (!item || !item.startTime) return false;
      const [itemHour, itemMinute] = item.startTime.split(':').map(Number);
      const itemMinutes = itemHour * 60 + itemMinute;
      // Check if event starts within this 30-minute slot
      return Math.abs(slotMinutes - itemMinutes) < 30;
    });
  };
  // Check if the date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  // Calculate current time position for the time indicator
  const calculateTimeIndicatorPosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    // Position is based on percentage of day passed
    const percentage = totalMinutes / (24 * 60) * 100;
    return `${percentage}%`;
  };
  // Group events by time slot for better visualization of overlaps
  const groupEventsByTimeSlot = () => {
    const eventsByHour = {};
    timeSlots.forEach(slot => {
      const hour = parseInt(slot.split(':')[0]);
      eventsByHour[slot] = [];
    });
    // Add events to their respective slots
    sortedItems.forEach(event => {
      if (!event || !event.startTime) return;
      const startHour = parseInt(event.startTime.split(':')[0]);
      const startMinute = parseInt(event.startTime.split(':')[1]);
      // Find the closest time slot
      const closestSlot = startMinute < 15 ? `${startHour}:00` : startMinute < 45 ? `${startHour}:30` : `${startHour + 1}:00`;
      if (eventsByHour[event.startTime]) {
        eventsByHour[event.startTime].push(event);
      } else if (eventsByHour[closestSlot]) {
        eventsByHour[closestSlot].push(event);
      }
    });
    return eventsByHour;
  };
  const eventsByHour = groupEventsByTimeSlot();
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    onItemClick(event);
  };
  // Function to handle time slot click for quick add
  const handleTimeSlotClick = timeSlot => {
    onTimeSlotClick(timeSlot);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'day_view_time_slot_clicked',
      time_slot: timeSlot,
      date: dateStr
    });
  };
  // Function to handle task completion toggle
  const handleCompleteEvent = (event, e) => {
    e.stopPropagation();
    toggleTaskCompletion(event.id);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'task_completion_toggled',
      event_category: event.category,
      new_status: isTaskCompleted(event.id) ? 'incomplete' : 'complete'
    });
  };
  const renderTimeSlots = () => {
    return timeSlots.map((timeSlot, index) => {
      const eventsInSlot = getEventsForTimeSlot(timeSlot);
      const hasEvents = eventsInSlot.length > 0;
      const [hourStr, minuteStr] = timeSlot.split(':');
      const hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      const isHalfHour = minute === 30;
      // Create a consistent display for all time slots
      const isEmptySlot = !hasEvents;
      // Adjust height based on time slot type
      const slotHeight = isHalfHour ? 'min-h-[20px]' : 'min-h-[40px]';
      return <div key={timeSlot} className={`relative ${slotHeight} ${hasEvents ? 'mb-2' : 'mb-0'}`}>
          {!isHalfHour && <>
              <div className="absolute -left-3 top-0 w-2.5 h-2.5 rounded-full bg-gray-300 -ml-1.5"></div>
              <div className="text-xs font-medium text-gray-500 mb-1">
                {formatTime(timeSlot)}
              </div>
            </>}
          {isHalfHour && <div className="absolute -left-3 top-0 w-1.5 h-1.5 rounded-full bg-gray-200 -ml-1.25"></div>}
          <div className="relative">
            {hasEvents ? <div className="space-y-2">
                {eventsInSlot.map(item => <div key={item.id} className={`p-3 rounded-lg border-l-4 ${getCategoryBorderColor(item.category)} border ${item.hasConflict ? 'border-orange-300 bg-orange-50 border-l-orange-500' : isTaskCompleted(item.id) ? 'border-green-300 bg-green-50 border-l-green-500' : getCategoryStyle(item.category)} cursor-pointer transition-transform hover:scale-[1.01] shadow-sm mb-2 relative`} onClick={e => handleEventClick(item, e)} style={{
              minHeight: `${Math.max(item.duration / 4, 15)}px`,
              zIndex: item.hasConflict ? 10 : 1
            }}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-medium text-sm">{item.title}</h3>
                        <div className="flex items-center mt-1">
                          <ClockIcon className="w-3.5 h-3.5 text-gray-500 mr-1" />
                          <BracketText className="text-xs text-gray-600">
                            {formatTime(item.startTime)} -{' '}
                            {formatTime(item.endTime)} ({item.duration} min)
                          </BracketText>
                        </div>
                        {item.description && <p className="text-xs text-gray-600 mt-1">
                            {item.description}
                          </p>}
                        {item.location && <div className="flex items-center mt-1">
                            <div className="w-3.5 h-3.5 flex items-center justify-center mr-1">
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              {item.location}
                            </span>
                          </div>}
                      </div>
                      {item.hasConflict && <span className="text-[10px] bg-orange-200 text-orange-800 px-1 py-0.5 rounded">
                          Conflict
                        </span>}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        {item.assignedTo && <>
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-1.5">
                              <span className="text-[10px] text-blue-600 font-medium">
                                {item.assignedTo === 'team' ? 'T' : item.assignedTo.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <BracketText className="text-[10px] text-gray-500">
                              {item.assignedTo === 'team' ? 'Team' : item.assignedTo}
                            </BracketText>
                          </>}
                        {item.isRecurring && <div className="flex items-center ml-auto">
                            <RepeatIcon className="w-3.5 h-3.5 text-gray-400 mr-0.5" />
                            <span className="text-[10px] text-gray-500">
                              {item.recurrencePattern?.type.charAt(0).toUpperCase() + item.recurrencePattern?.type.slice(1)}
                            </span>
                          </div>}
                      </div>
                      {/* Quick action buttons */}
                      <div className="flex space-x-1">
                        <button onClick={e => handleCompleteEvent(item, e)} className={`w-7 h-7 rounded-full ${isTaskCompleted(item.id) ? 'bg-green-100 border-green-200' : 'bg-gray-50 border border-gray-200'} flex items-center justify-center hover:bg-green-100`} aria-label="Complete event">
                          <CheckIcon className={`w-3.5 h-3.5 ${isTaskCompleted(item.id) ? 'text-green-600' : 'text-gray-500'}`} />
                        </button>
                      </div>
                    </div>
                  </div>)}
              </div> :
          // Make all time slots clickable with consistent styling
          <div className={`${isHalfHour ? 'h-4' : 'h-6'} border border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center`} onClick={() => handleTimeSlotClick(timeSlot)}>
                {!isHalfHour && <PlusIcon className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />}
              </div>}
          </div>
        </div>;
    });
  };
  return <div className="h-full flex flex-col">
      <div className="mb-2">
        <BracketText className="text-blue-600">
          {date.toLocaleDateString('en-US', {
          weekday: 'long'
        })}
        </BracketText>
      </div>
      <div className="border-l border-gray-200 pl-3 space-y-1 flex-1 overflow-y-auto relative z-0">
        {renderTimeSlots()}
        {/* Add a hard stop after 11:30 PM */}
        <div className="border-t-2 border-gray-300 mt-2 pt-2 pb-4 text-center text-xs text-gray-500 sticky bottom-0 bg-white">
          End of day
        </div>
        {/* Current time indicator - only show for today */}
        {isToday(date) && <div ref={currentTimeIndicatorRef} className="absolute left-0 right-0 border-t-2 border-red-500 z-20 flex items-center" style={{
        top: calculateTimeIndicatorPosition(),
        transform: 'translateY(-50%)'
      }}>
            <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 absolute left-0"></div>
            <div className="text-xs font-medium text-red-500 bg-white px-1 ml-3">
              {currentTime.getHours().toString().padStart(2, '0')}:
              {currentTime.getMinutes().toString().padStart(2, '0')}
            </div>
          </div>}
        {sortedItems.length === 0 && <div className="text-center py-8 mt-4">
            <div className="w-14 h-14 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <CalendarIcon className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              No events scheduled
            </h3>
            <p className="text-sm text-gray-500">
              Tap any time slot to add a new event
            </p>
          </div>}
      </div>
    </div>;
};