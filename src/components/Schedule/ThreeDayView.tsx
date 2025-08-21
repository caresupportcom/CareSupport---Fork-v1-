import React, { useState } from 'react';
import { BracketText } from '../Common/BracketText';
import { ClockIcon, CheckIcon, CalendarIcon, UserIcon, XIcon } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { CalendarEvent } from '../../services/CalendarService';
import { EventPreviewCard } from './EventPreviewCard';
export const ThreeDayView = ({
  startDate,
  onItemClick,
  onDateClick
}) => {
  const {
    getEventsForDate,
    toggleTaskCompletion,
    isTaskCompleted
  } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  // Modal states for quick actions
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedActionEvent, setSelectedActionEvent] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  // Team members for reassignment
  const teamMembers = [{
    id: 'james',
    name: 'James',
    initial: 'J',
    color: 'blue'
  }, {
    id: 'maria',
    name: 'Maria',
    initial: 'M',
    color: 'green'
  }, {
    id: 'linda',
    name: 'Linda',
    initial: 'L',
    color: 'purple'
  }];
  // Generate 3 days starting from the given date
  const generateThreeDays = () => {
    const days = [];
    const currentDay = new Date(startDate);
    for (let i = 0; i < 3; i++) {
      const dayDate = new Date(currentDay);
      dayDate.setDate(currentDay.getDate() + i);
      days.push(dayDate);
    }
    return days;
  };
  const threeDays = generateThreeDays();
  // Format date for display
  const formatDayLabel = date => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short'
    });
  };
  const formatDayNumber = date => {
    return date.getDate();
  };
  // Check if a date is today
  const isToday = date => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  // Get events for a specific day
  const getEventsForDay = date => {
    const dateStr = date.toISOString().split('T')[0];
    return getEventsForDate(dateStr);
  };
  // Get category styling
  const getCategoryStyle = category => {
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
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };
  const handleClosePreview = () => {
    setSelectedEvent(null);
  };
  const handleEditEvent = event => {
    setSelectedEvent(null);
    onItemClick(event); // Navigate to full event details
  };
  // Quick action handlers
  const handleCompleteEvent = (event, e) => {
    e.stopPropagation();
    // Use the shared context method to toggle completion status
    toggleTaskCompletion(event.id);
  };
  // Function to open reschedule modal
  const handleOpenReschedule = (event, e) => {
    e.stopPropagation();
    setSelectedActionEvent(event);
    // Set default values to the event's current date and time
    const dateObj = event.date ? new Date(event.date) : new Date();
    const dateStr = dateObj.toISOString().split('T')[0];
    setRescheduleDate(dateStr);
    setRescheduleTime(event.startTime);
    setShowRescheduleModal(true);
  };
  // Function to handle reschedule submission
  const handleReschedule = () => {
    if (!rescheduleDate || !rescheduleTime) return;
    // In a real app, this would update the event time in the database/state
    console.log('Reschedule event:', selectedActionEvent.id, 'to', rescheduleDate, rescheduleTime);
    setShowRescheduleModal(false);
  };
  // Function to open reassign modal
  const handleOpenReassign = (event, e) => {
    e.stopPropagation();
    setSelectedActionEvent(event);
    setShowReassignModal(true);
  };
  // Function to handle reassign submission
  const handleReassign = memberId => {
    const memberName = teamMembers.find(m => m.id === memberId)?.name;
    // In a real app, this would update the event assignee in the database/state
    console.log('Reassign event:', selectedActionEvent.id, 'to', memberId);
    setShowReassignModal(false);
  };
  return <div className="h-full flex flex-col">
      {/* 3-day header */}
      <div className="grid grid-cols-3 gap-0.5 mb-2">
        {threeDays.map((day, index) => <div key={index} className="text-center cursor-pointer" onClick={() => onDateClick(day)}>
            <div className="text-xs text-gray-500 mb-0.5">
              {formatDayLabel(day)}
            </div>
            <div className={`text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center mx-auto ${isToday(day) ? 'bg-blue-500 text-white' : 'text-gray-800'}`}>
              {formatDayNumber(day)}
            </div>
          </div>)}
      </div>
      {/* 3-day grid - expanded to use full height */}
      <div className="grid grid-cols-3 gap-0.5 border rounded-lg overflow-hidden flex-1 z-0">
        {threeDays.map((day, dayIndex) => {
        const dayEvents = getEventsForDay(day);
        return <div key={dayIndex} className={`h-full min-h-[450px] p-1 ${isToday(day) ? 'bg-blue-50' : dayIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-r last:border-r-0`}>
              <div className="text-center mb-1">
                <BracketText className="text-xs font-medium" active={isToday(day)} onClick={() => onDateClick(day)}>
                  {day.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
                </BracketText>
              </div>
              <div className="space-y-1 overflow-y-auto h-[calc(100%-20px)] pb-20">
                {dayEvents.length > 0 ? dayEvents.map((event, eventIndex) => <div key={`${dayIndex}-${eventIndex}`} className={`p-1.5 text-xs rounded ${event.hasConflict ? 'border-l-4 border-l-orange-500 border-orange-300 bg-orange-50' : isTaskCompleted(event.id) ? 'border-l-4 border-l-green-500 border-green-300 bg-green-50' : `border-l-4 ${getCategoryBorderColor(event.category)} ${getCategoryStyle(event.category)}`} cursor-pointer shadow-sm border border-t border-r border-b relative`} onClick={e => handleEventClick(event, e)}>
                      {/* Swapped order: Title first, then time */}
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="flex items-center mt-0.5">
                        <ClockIcon className="w-3 h-3 text-gray-500 mr-1" />
                        <span className="text-gray-600">
                          {formatTime(event.startTime)}
                        </span>
                        {event.hasConflict && <div className="ml-auto">
                            <span className="text-[10px] bg-orange-200 text-orange-800 px-1 py-0.5 rounded">
                              Conflict
                            </span>
                          </div>}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        {event.assignedTo && <div className="text-[10px] opacity-75 truncate flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-200 mr-1 flex items-center justify-center">
                              <span className="text-[8px]">
                                {event.assignedTo.charAt(0)}
                              </span>
                            </div>
                            {event.assignedTo}
                          </div>}
                        {/* Quick action buttons - always visible but subtle */}
                        <div className="flex space-x-1 ml-auto">
                          <button onClick={e => handleCompleteEvent(event, e)} className={`w-5 h-5 rounded-full ${isTaskCompleted(event.id) ? 'bg-green-100 border-green-200' : 'bg-gray-50 border border-gray-200'} flex items-center justify-center hover:bg-green-100`} aria-label="Complete event">
                            <CheckIcon className={`w-2.5 h-2.5 ${isTaskCompleted(event.id) ? 'text-green-600' : 'text-gray-500'}`} />
                          </button>
                          <button onClick={e => handleOpenReschedule(event, e)} className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center hover:bg-blue-100 border border-gray-200" aria-label="Reschedule event">
                            <CalendarIcon className="w-2.5 h-2.5 text-gray-500" />
                          </button>
                          <button onClick={e => handleOpenReassign(event, e)} className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center hover:bg-purple-100 border border-gray-200" aria-label="Reassign event">
                            <UserIcon className="w-2.5 h-2.5 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>) : <div className="h-full w-full flex items-center justify-center">
                    <span className="text-xs text-gray-400">No events</span>
                  </div>}
              </div>
            </div>;
      })}
      </div>
      {/* Legend - more compact */}
      <div className="mt-2 flex items-center justify-end space-x-2 text-[10px] text-gray-600">
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mr-1"></div>
          <span>Medication</span>
        </div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-400 mr-1"></div>
          <span>Appointment</span>
        </div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 mr-1"></div>
          <span>Therapy</span>
        </div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-400 mr-1"></div>
          <span>Conflict</span>
        </div>
      </div>
      {/* Event Preview Card */}
      {selectedEvent && <EventPreviewCard event={selectedEvent} onClose={handleClosePreview} onEdit={handleEditEvent} />}
      {/* Reschedule Modal */}
      {showRescheduleModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowRescheduleModal(false)}>
          <div className="bg-white rounded-xl p-5 w-11/12 max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reschedule Event</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <XIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input type="time" className="w-full border border-gray-300 rounded-lg px-4 py-2" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} />
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowRescheduleModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700">
                Cancel
              </button>
              <button onClick={handleReschedule} className="flex-1 py-2 bg-blue-500 text-white rounded-lg" disabled={!rescheduleDate || !rescheduleTime}>
                Reschedule
              </button>
            </div>
          </div>
        </div>}
      {/* Reassign Modal */}
      {showReassignModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowReassignModal(false)}>
          <div className="bg-white rounded-xl p-5 w-11/12 max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reassign Event</h3>
              <button onClick={() => setShowReassignModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <XIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              {teamMembers.map(member => <button key={member.id} className="w-full p-3 rounded-lg border border-gray-200 flex items-center hover:bg-gray-50" onClick={() => handleReassign(member.id)}>
                  <div className={`w-8 h-8 rounded-full bg-${member.color}-100 flex items-center justify-center mr-3`}>
                    <span className={`text-xs text-${member.color}-600 font-medium`}>
                      {member.initial}
                    </span>
                  </div>
                  <span className="font-medium">{member.name}</span>
                </button>)}
            </div>
            <button onClick={() => setShowReassignModal(false)} className="w-full py-2 border border-gray-300 rounded-lg text-gray-700">
              Cancel
            </button>
          </div>
        </div>}
    </div>;
};
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