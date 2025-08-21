import React, { useEffect, useState } from 'react';
import { XIcon, CalendarIcon, ClockIcon, RepeatIcon, MapPinIcon, UserIcon, AlertTriangleIcon } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { dataService } from '../../services/DataService';
interface EventCreationModalProps {
  onClose: () => void;
  onSave: (event: any) => void;
  initialDate?: string;
  initialTime?: string;
  editingEvent?: any;
  isQuickAdd?: boolean;
}
export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  onClose,
  onSave,
  initialDate,
  initialTime,
  editingEvent,
  isQuickAdd = false
}) => {
  const calendarContext = useCalendar();
  const isEditing = !!editingEvent;
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState('task');
  const [location, setLocation] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  // Get team members for assignment
  const teamMembers = dataService.getTeamMembers();
  // Initialize form with data if editing
  useEffect(() => {
    if (isEditing && editingEvent) {
      setTitle(editingEvent.title || '');
      setDescription(editingEvent.description || '');
      setDate(editingEvent.date || '');
      setStartTime(editingEvent.startTime || '');
      setEndTime(editingEvent.endTime || '');
      setDuration(editingEvent.duration || 30);
      setCategory(editingEvent.category || 'task');
      setLocation(editingEvent.location || '');
      setAssignedTo(editingEvent.assignedTo || '');
      setPriority(editingEvent.priority || 'medium');
      setIsRecurring(editingEvent.isRecurring || false);
      if (editingEvent.recurrencePattern) {
        setRecurrenceType(editingEvent.recurrencePattern.type || 'daily');
        setRecurrenceInterval(editingEvent.recurrencePattern.interval || 1);
        setRecurrenceEndDate(editingEvent.recurrencePattern.endDate || '');
        setShowRecurrenceOptions(true);
      }
    } else {
      // Set initial values for new event
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      if (initialTime) {
        setStartTime(initialTime);
        // Calculate end time (30 min later by default)
        const [hours, minutes] = initialTime.split(':').map(Number);
        let endHours = hours;
        let endMinutes = minutes + 30;
        if (endMinutes >= 60) {
          endHours += 1;
          endMinutes -= 60;
        }
        if (endHours >= 24) endHours = 23;
        const formattedEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        setEndTime(formattedEndTime);
      } else {
        // Default times if none provided
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        // Round to nearest 30 minutes
        const roundedMinute = currentMinute < 30 ? 30 : 0;
        const hourAdjustment = currentMinute < 30 ? 0 : 1;
        const startHour = (currentHour + hourAdjustment) % 24;
        const endHour = (startHour + 1) % 24;
        setStartTime(`${startHour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`);
        setEndTime(`${endHour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`);
      }
    }
  }, [isEditing, editingEvent, initialDate, initialTime]);
  // Update duration when start or end time changes
  useEffect(() => {
    if (startTime && endTime) {
      const duration = calculateDuration(startTime, endTime);
      setDuration(duration);
    }
  }, [startTime, endTime]);
  // Check for conflicts when date, time, or assignee changes
  useEffect(() => {
    if (date && startTime && endTime && assignedTo) {
      const eventId = isEditing ? editingEvent.id : undefined;
      const conflictingEvents = dataService.checkForConflicts(date, startTime, endTime, assignedTo, eventId);
      setConflicts(conflictingEvents);
    } else {
      setConflicts([]);
    }
  }, [date, startTime, endTime, assignedTo, isEditing, editingEvent]);
  // Calculate duration between two times in minutes
  const calculateDuration = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    let durationMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
    // Handle overnight events
    if (durationMinutes <= 0) {
      durationMinutes += 24 * 60; // Add 24 hours
    }
    return durationMinutes;
  };
  // Update end time when duration changes
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value);
    setDuration(newDuration);
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes + newDuration;
      const newEndHours = Math.floor(totalMinutes / 60) % 24;
      const newEndMinutes = totalMinutes % 60;
      setEndTime(`${newEndHours.toString().padStart(2, '0')}:${newEndMinutes.toString().padStart(2, '0')}`);
    }
  };
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create event object
    const event = {
      id: isEditing ? editingEvent.id : `event_${Date.now()}`,
      title,
      description,
      date,
      startTime,
      endTime,
      duration,
      category,
      location,
      assignedTo,
      priority,
      isRecurring,
      hasConflict: conflicts.length > 0,
      recurrencePattern: isRecurring ? {
        type: recurrenceType,
        interval: parseInt(recurrenceInterval.toString()),
        endDate: recurrenceEndDate || undefined
      } : undefined
    };
    // Track event creation/update
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: isEditing ? 'event_updated' : 'event_created',
      event_category: category,
      is_recurring: isRecurring,
      has_conflicts: conflicts.length > 0,
      from_quick_add: isQuickAdd
    });
    onSave(event);
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-11/12 max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Event' : isQuickAdd ? 'Quick Add Event' : 'Create Event'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <XIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" required />
          </div>
          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add details" rows={2} />
          </div>
          {/* Date and Time */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <div className="relative">
                <div className="absolute left-3 top-2.5">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                </div>
                <input type="date" className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="task">Task</option>
                <option value="appointment">Appointment</option>
                <option value="medication">Medication</option>
                <option value="therapy">Therapy</option>
                <option value="meal">Meal</option>
              </select>
            </div>
          </div>
          {/* Time Range */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Time
              </label>
              <div className="relative">
                <div className="absolute left-3 top-2.5">
                  <ClockIcon className="w-4 h-4 text-gray-500" />
                </div>
                <input type="time" className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2" value={startTime} onChange={e => setStartTime(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <div className="relative">
                <div className="absolute left-3 top-2.5">
                  <ClockIcon className="w-4 h-4 text-gray-500" />
                </div>
                <input type="time" className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2" value={endTime} onChange={e => setEndTime(e.target.value)} required />
              </div>
            </div>
          </div>
          {/* Duration */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Duration: {duration} minutes
            </label>
            <input type="range" min="5" max="240" step="5" className="w-full" value={duration} onChange={handleDurationChange} />
          </div>
          {/* Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Location (optional)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5">
                <MapPinIcon className="w-4 h-4 text-gray-500" />
              </div>
              <input type="text" className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2" value={location} onChange={e => setLocation(e.target.value)} placeholder="Add location" />
            </div>
          </div>
          {/* Assign To */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Assign To</label>
            <div className="relative">
              <div className="absolute left-3 top-2.5">
                <UserIcon className="w-4 h-4 text-gray-500" />
              </div>
              <select className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required>
                <option value="">Select person</option>
                {teamMembers.map(member => <option key={member.id} value={member.id}>
                    {member.name}
                  </option>)}
                <option value="team">Entire Team</option>
              </select>
            </div>
          </div>
          {/* Priority */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Priority</label>
            <div className="flex space-x-2">
              <button type="button" className={`flex-1 py-2 px-3 rounded-lg border ${priority === 'low' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'}`} onClick={() => setPriority('low')}>
                Low
              </button>
              <button type="button" className={`flex-1 py-2 px-3 rounded-lg border ${priority === 'medium' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'}`} onClick={() => setPriority('medium')}>
                Medium
              </button>
              <button type="button" className={`flex-1 py-2 px-3 rounded-lg border ${priority === 'high' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'}`} onClick={() => setPriority('high')}>
                High
              </button>
            </div>
          </div>
          {/* Recurring Options */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" checked={isRecurring} onChange={e => {
                setIsRecurring(e.target.checked);
                if (e.target.checked) {
                  setShowRecurrenceOptions(true);
                }
              }} />
                <span className="text-sm font-medium flex items-center">
                  <RepeatIcon className="w-4 h-4 mr-1 text-gray-500" />
                  Recurring Event
                </span>
              </label>
              {isRecurring && <button type="button" className="text-sm text-blue-600" onClick={() => setShowRecurrenceOptions(!showRecurrenceOptions)}>
                  {showRecurrenceOptions ? 'Hide Options' : 'Show Options'}
                </button>}
            </div>
            {isRecurring && showRecurrenceOptions && <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Repeat
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2" value={recurrenceType} onChange={e => setRecurrenceType(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Every {recurrenceInterval}{' '}
                    {recurrenceType === 'daily' ? 'day(s)' : recurrenceType === 'weekly' ? 'week(s)' : 'month(s)'}
                  </label>
                  <input type="number" min="1" max="30" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={recurrenceInterval} onChange={e => setRecurrenceInterval(parseInt(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date (optional)
                  </label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={recurrenceEndDate} onChange={e => setRecurrenceEndDate(e.target.value)} min={date} />
                </div>
              </div>}
          </div>
          {/* Conflicts Warning */}
          {conflicts.length > 0 && <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangleIcon className="w-5 h-5 text-orange-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800">
                    Scheduling Conflict
                  </h4>
                  <p className="text-xs text-orange-700 mt-1">
                    This event conflicts with {conflicts.length} other{' '}
                    {conflicts.length === 1 ? 'event' : 'events'}:
                  </p>
                  <ul className="mt-1 text-xs text-orange-700">
                    {conflicts.slice(0, 2).map(event => <li key={event.id} className="ml-4 list-disc">
                        {event.title} ({event.startTime} - {event.endTime})
                      </li>)}
                    {conflicts.length > 2 && <li className="ml-4 list-disc">
                        And {conflicts.length - 2} more...
                      </li>}
                  </ul>
                </div>
              </div>
            </div>}
          {/* Submit Buttons */}
          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg" disabled={!title || !date || !startTime || !endTime || !assignedTo}>
              {isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>;
};