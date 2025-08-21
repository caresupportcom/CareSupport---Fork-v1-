import React, { useState } from 'react';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserIcon, CheckIcon, AlertCircleIcon, XIcon, UsersIcon, RepeatIcon, MapPinIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { useCalendar, CalendarEvent } from '../../contexts/CalendarContext';
export const AddEventScreen = ({
  onBack
}) => {
  const {
    addEvent
  } = useCalendar();
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    participants: [],
    reminderTime: '15',
    category: 'appointment',
    assignedTo: '',
    isRecurring: false,
    recurrencePattern: {
      type: 'none',
      interval: 1,
      weekDays: [],
      monthDay: 1,
      endType: 'never',
      occurrences: 10,
      endDate: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const teamMembers = [{
    id: 'james',
    name: 'James',
    role: 'Nurse'
  }, {
    id: 'maria',
    name: 'Maria',
    role: 'Doctor'
  }, {
    id: 'linda',
    name: 'Linda',
    role: 'Caregiver'
  }, {
    id: 'robert',
    name: 'Robert',
    role: 'Family Member'
  }];
  const reminderOptions = [{
    value: '0',
    label: 'No reminder'
  }, {
    value: '5',
    label: '5 minutes before'
  }, {
    value: '15',
    label: '15 minutes before'
  }, {
    value: '30',
    label: '30 minutes before'
  }, {
    value: '60',
    label: '1 hour before'
  }, {
    value: '1440',
    label: '1 day before'
  }];
  const categoryOptions = [{
    id: 'medication',
    name: 'Medication',
    color: 'blue'
  }, {
    id: 'appointment',
    name: 'Appointment',
    color: 'purple'
  }, {
    id: 'task',
    name: 'Task',
    color: 'green'
  }, {
    id: 'meal',
    name: 'Meal',
    color: 'yellow'
  }];
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
    // Check for potential conflicts when changing date/time
    if (['date', 'startTime', 'endTime'].includes(field)) {
      checkForConflicts();
    }
  };
  const handleRecurrenceChange = (field, value) => {
    setFormData({
      ...formData,
      recurrencePattern: {
        ...formData.recurrencePattern,
        [field]: value
      }
    });
  };
  const toggleParticipant = id => {
    const participants = [...formData.participants];
    if (participants.includes(id)) {
      const index = participants.indexOf(id);
      participants.splice(index, 1);
    } else {
      participants.push(id);
    }
    setFormData({
      ...formData,
      participants
    });
  };
  const toggleWeekday = day => {
    const weekDays = [...formData.recurrencePattern.weekDays];
    if (weekDays.includes(day)) {
      const index = weekDays.indexOf(day);
      weekDays.splice(index, 1);
    } else {
      weekDays.push(day);
    }
    handleRecurrenceChange('weekDays', weekDays);
  };
  const checkForConflicts = () => {
    // This is a simplified example - in a real app, this would check against existing events
    if (formData.date && formData.startTime && formData.endTime) {
      // For demo purposes, just simulate a conflict with a specific time
      const isConflict = formData.startTime === '14:00' && formData.date;
      setShowConflictWarning(isConflict);
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please assign to someone';
    }
    // Validate recurrence settings if enabled
    if (formData.isRecurring) {
      if (formData.recurrencePattern.type === 'weekly' && (!formData.recurrencePattern.weekDays || formData.recurrencePattern.weekDays.length === 0)) {
        newErrors.weekDays = 'Please select at least one day of the week';
      }
      if (formData.recurrencePattern.endType === 'after' && (!formData.recurrencePattern.occurrences || formData.recurrencePattern.occurrences < 1)) {
        newErrors.occurrences = 'Please enter a valid number of occurrences';
      }
      if (formData.recurrencePattern.endType === 'on' && !formData.recurrencePattern.endDate) {
        newErrors.endDate = 'Please select an end date';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    // Calculate duration in minutes
    const startMinutes = timeToMinutes(formData.startTime);
    const endMinutes = timeToMinutes(formData.endTime);
    const duration = endMinutes - startMinutes;
    // Create event object
    const eventData: CalendarEvent = {
      id: String(Date.now()),
      title: formData.title,
      description: formData.description,
      location: formData.location,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      category: formData.category,
      assignedTo: formData.assignedTo,
      duration: duration,
      isRecurring: formData.isRecurring,
      recurrencePattern: formData.isRecurring ? {
        type: formData.recurrencePattern.type,
        interval: formData.recurrencePattern.interval,
        weekDays: formData.recurrencePattern.type === 'weekly' ? formData.recurrencePattern.weekDays : undefined,
        monthDay: formData.recurrencePattern.type === 'monthly' ? formData.recurrencePattern.monthDay : undefined,
        endDate: formData.recurrencePattern.endType === 'on' ? formData.recurrencePattern.endDate : undefined,
        occurrences: formData.recurrencePattern.endType === 'after' ? formData.recurrencePattern.occurrences : undefined
      } : undefined
    };
    // Track in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'event_added',
      has_participants: formData.participants.length > 0,
      has_reminder: formData.reminderTime !== '0',
      is_recurring: formData.isRecurring,
      recurrence_type: formData.isRecurring ? formData.recurrencePattern.type : 'none'
    });
    // Add event to calendar
    addEvent(eventData);
    // Show success and return
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Return to previous screen after showing success
      setTimeout(() => {
        onBack();
      }, 1500);
    }, 1000);
  };
  // Helper function to convert time string to minutes
  const timeToMinutes = timeString => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };
  if (isSuccess) {
    return <div className="h-full flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Event Added!</h2>
        <p className="text-gray-600">
          The event has been added to the care calendar
        </p>
        {formData.isRecurring && <p className="text-gray-500 mt-2 flex items-center">
            <RepeatIcon className="w-4 h-4 mr-1" />
            Recurring {formData.recurrencePattern.type} event
          </p>}
      </div>;
  }
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Add Event</h1>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4 border-b">
        <div className="flex space-x-4">
          <button className={`pb-2 px-1 ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`} onClick={() => setActiveTab('details')}>
            Details
          </button>
          <button className={`pb-2 px-1 ${activeTab === 'people' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`} onClick={() => setActiveTab('people')}>
            People
          </button>
          <button className={`pb-2 px-1 flex items-center ${activeTab === 'recurrence' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`} onClick={() => setActiveTab('recurrence')}>
            Recurrence
            {formData.isRecurring && <div className="ml-1.5 w-3 h-3 rounded-full bg-blue-500"></div>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {activeTab === 'details' && <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Event Title</label>
              <input type="text" className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter event title" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block font-medium mb-2">Description</label>
              <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter event description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-2">Location</label>
              <div className="relative">
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add location" value={formData.location} onChange={e => handleInputChange('location', e.target.value)} />
                <div className="absolute left-3 top-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2">Date</label>
              <div className="relative">
                <input type="date" className={`w-full border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} value={formData.date} onChange={e => handleInputChange('date', e.target.value)} />
                <div className="absolute right-3 top-3 pointer-events-none">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block font-medium mb-2">Start Time</label>
                <div className="relative">
                  <input type="time" className={`w-full border ${errors.startTime ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} value={formData.startTime} onChange={e => handleInputChange('startTime', e.target.value)} />
                  <div className="absolute right-3 top-3 pointer-events-none">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                {errors.startTime && <p className="text-red-500 text-sm mt-1">
                    {errors.startTime}
                  </p>}
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-2">End Time</label>
                <div className="relative">
                  <input type="time" className={`w-full border ${errors.endTime ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} value={formData.endTime} onChange={e => handleInputChange('endTime', e.target.value)} />
                  <div className="absolute right-3 top-3 pointer-events-none">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
              </div>
            </div>
            {showConflictWarning && <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start">
                <AlertCircleIcon className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700">
                  This time conflicts with another event. You may want to choose
                  a different time.
                </p>
              </div>}
            <div>
              <label className="block font-medium mb-2">Event Type</label>
              <div className="grid grid-cols-2 gap-2">
                {categoryOptions.map(category => <button key={category.id} className={`p-3 rounded-lg border ${formData.category === category.id ? `border-${category.color}-500 bg-${category.color}-50` : 'border-gray-200'} flex items-center`} onClick={() => handleInputChange('category', category.id)}>
                    <div className={`w-3 h-3 rounded-full bg-${category.color}-500 mr-2`}></div>
                    <span>{category.name}</span>
                    {formData.category === category.id && <CheckIcon className="w-4 h-4 ml-auto text-blue-500" />}
                  </button>)}
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2">Reminder</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.reminderTime} onChange={e => handleInputChange('reminderTime', e.target.value)}>
                {reminderOptions.map(option => <option key={option.value} value={option.value}>
                    {option.label}
                  </option>)}
              </select>
            </div>
          </div>}

        {activeTab === 'people' && <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Assigned To</label>
              <div className="space-y-2">
                {teamMembers.map(member => <button key={member.id} className={`w-full p-3 rounded-lg border ${formData.assignedTo === member.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleInputChange('assignedTo', member.id)}>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <UserIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                    {formData.assignedTo === member.id && <CheckIcon className="w-4 h-4 ml-auto text-blue-500" />}
                  </button>)}
              </div>
              {errors.assignedTo && <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>}
            </div>
            <div>
              <label className="block font-medium mb-2">Participants</label>
              <div className="space-y-2">
                {teamMembers.map(member => <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        <UserIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <button className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.participants.includes(member.id) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`} onClick={() => toggleParticipant(member.id)}>
                      {formData.participants.includes(member.id) ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                    </button>
                  </div>)}
              </div>
            </div>
          </div>}

        {activeTab === 'recurrence' && <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <RepeatIcon className="w-5 h-5 text-gray-500 mr-2" />
                <label className="font-medium">Repeat Event</label>
              </div>
              <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                <input type="checkbox" className="opacity-0 w-0 h-0" checked={formData.isRecurring} onChange={e => handleInputChange('isRecurring', e.target.checked)} />
                <span className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${formData.isRecurring ? 'bg-white transform translate-x-6' : 'bg-white'}`}></span>
                <div className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${formData.isRecurring ? 'bg-blue-500' : 'bg-gray-300'}`} onClick={() => handleInputChange('isRecurring', !formData.isRecurring)}></div>
              </div>
            </div>
            {formData.isRecurring && <>
                <div>
                  <label className="block font-medium mb-2">
                    Recurrence Pattern
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.recurrencePattern.type} onChange={e => handleRecurrenceChange('type', e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-2">Repeat every</label>
                  <div className="flex items-center">
                    <input type="number" min="1" max="99" className="w-16 border border-gray-300 rounded-lg px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.recurrencePattern.interval} onChange={e => handleRecurrenceChange('interval', parseInt(e.target.value) || 1)} />
                    <span>
                      {formData.recurrencePattern.type === 'daily' && 'day(s)'}
                      {formData.recurrencePattern.type === 'weekly' && 'week(s)'}
                      {formData.recurrencePattern.type === 'monthly' && 'month(s)'}
                      {formData.recurrencePattern.type === 'yearly' && 'year(s)'}
                    </span>
                  </div>
                </div>
                {formData.recurrencePattern.type === 'weekly' && <div>
                    <label className="block font-medium mb-2">
                      On these days
                    </label>
                    <div className="flex space-x-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <button key={index} className={`w-8 h-8 rounded-full ${formData.recurrencePattern.weekDays.includes(index) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => toggleWeekday(index)}>
                          {day}
                        </button>)}
                    </div>
                    {errors.weekDays && <p className="text-red-500 text-sm mt-1">
                        {errors.weekDays}
                      </p>}
                  </div>}
                {formData.recurrencePattern.type === 'monthly' && <div>
                    <label className="block font-medium mb-2">
                      Day of month
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.recurrencePattern.monthDay} onChange={e => handleRecurrenceChange('monthDay', parseInt(e.target.value))}>
                      {Array.from({
                length: 31
              }, (_, i) => i + 1).map(day => <option key={day} value={day}>
                          {day}
                        </option>)}
                    </select>
                  </div>}
                <div>
                  <label className="block font-medium mb-2">End</label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input type="radio" id="never" name="endType" className="mr-2" checked={formData.recurrencePattern.endType === 'never'} onChange={() => handleRecurrenceChange('endType', 'never')} />
                      <label htmlFor="never">Never</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="after" name="endType" className="mr-2" checked={formData.recurrencePattern.endType === 'after'} onChange={() => handleRecurrenceChange('endType', 'after')} />
                      <label htmlFor="after" className="mr-2">
                        After
                      </label>
                      <input type="number" min="1" className={`w-16 border ${errors.occurrences ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500`} value={formData.recurrencePattern.occurrences} onChange={e => handleRecurrenceChange('occurrences', parseInt(e.target.value) || 1)} disabled={formData.recurrencePattern.endType !== 'after'} />
                      <span>occurrences</span>
                    </div>
                    {errors.occurrences && formData.recurrencePattern.endType === 'after' && <p className="text-red-500 text-sm ml-5">
                          {errors.occurrences}
                        </p>}
                    <div className="flex items-center">
                      <input type="radio" id="on" name="endType" className="mr-2" checked={formData.recurrencePattern.endType === 'on'} onChange={() => handleRecurrenceChange('endType', 'on')} />
                      <label htmlFor="on" className="mr-2">
                        On
                      </label>
                      <input type="date" className={`flex-1 border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`} value={formData.recurrencePattern.endDate} onChange={e => handleRecurrenceChange('endDate', e.target.value)} disabled={formData.recurrencePattern.endType !== 'on'} />
                    </div>
                    {errors.endDate && formData.recurrencePattern.endType === 'on' && <p className="text-red-500 text-sm ml-5">
                          {errors.endDate}
                        </p>}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Summary: </span>
                    {formData.recurrencePattern.type === 'daily' && `Repeats every ${formData.recurrencePattern.interval} day(s)`}
                    {formData.recurrencePattern.type === 'weekly' && `Repeats every ${formData.recurrencePattern.interval} week(s) on selected days`}
                    {formData.recurrencePattern.type === 'monthly' && `Repeats every ${formData.recurrencePattern.interval} month(s) on day ${formData.recurrencePattern.monthDay}`}
                    {formData.recurrencePattern.type === 'yearly' && `Repeats every ${formData.recurrencePattern.interval} year(s)`}
                    {formData.recurrencePattern.endType === 'never' && ', never ends'}
                    {formData.recurrencePattern.endType === 'after' && `, ends after ${formData.recurrencePattern.occurrences} occurrences`}
                    {formData.recurrencePattern.endType === 'on' && `, ends on ${new Date(formData.recurrencePattern.endDate).toLocaleDateString()}`}
                  </p>
                </div>
              </>}
          </div>}

        <div className="mt-8">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            <BracketText active={true} className="text-white">
              {isSubmitting ? 'Adding Event...' : 'Add to Calendar'}
            </BracketText>
          </Button>
        </div>
      </div>
    </div>;
};
// Additional icon component
const PlusIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>;