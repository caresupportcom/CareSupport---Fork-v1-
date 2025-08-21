import React, { useEffect, useState, useRef } from 'react';
import { XIcon, ClockIcon, CalendarIcon, UserIcon, CheckIcon, ChevronRightIcon } from 'lucide-react';
export const QuickEventForm = ({
  date,
  timeSlot,
  position,
  onClose,
  onSave,
  onViewFull,
  isBottomPositioned = false
}) => {
  const formRef = useRef(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('task');
  const [startTime, setStartTime] = useState(timeSlot || '09:00');
  const [duration, setDuration] = useState(30);
  const [assignedTo, setAssignedTo] = useState('James');
  const [description, setDescription] = useState('');
  // Calculate end time based on start time and duration
  const calculateEndTime = () => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };
  // Format time for display
  const formatTime = timeString => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault();
    if (!title.trim()) return;
    const endTime = calculateEndTime();
    onSave({
      title,
      description,
      category,
      startTime,
      endTime,
      duration,
      assignedTo,
      date: date.toISOString().split('T')[0]
    });
  };
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  return <>
      {/* Backdrop overlay to blur the calendar */}
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-20" onClick={onClose} />
      <div ref={formRef} className="fixed left-0 right-0 bottom-0 bg-white rounded-t-xl shadow-xl border border-gray-200 z-30 max-h-[80vh] overflow-auto" style={{
      zIndex: 30
    }}>
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-base font-medium">Add Event</h3>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <XIcon className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <input type="text" placeholder="Event title" className="w-full border-0 border-b border-gray-200 pb-2 text-lg font-medium focus:outline-none focus:border-blue-500" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <ClockIcon className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div>
                <div className="text-sm text-gray-500">Start</div>
                <input type="time" className="bg-transparent border-0 text-base font-medium focus:outline-none" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="text-gray-400">|</div>
              <div>
                <div className="text-sm text-gray-500">Duration</div>
                <select className="bg-transparent border-0 text-base font-medium focus:outline-none" value={duration} onChange={e => setDuration(parseInt(e.target.value))}>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatTime(startTime)} - {formatTime(calculateEndTime())}
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <UserIcon className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium">Assign to</span>
            </div>
            <select className="w-full border border-gray-200 rounded-lg p-2 text-base" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              <option value="James">James</option>
              <option value="Maria">Maria</option>
              <option value="Linda">Linda</option>
            </select>
          </div>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium">Category</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className={`p-2 rounded-lg border ${category === 'medication' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => setCategory('medication')}>
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                <span>Medication</span>
                {category === 'medication' && <CheckIcon className="w-4 h-4 text-blue-500 ml-auto" />}
              </button>
              <button type="button" className={`p-2 rounded-lg border ${category === 'appointment' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'} flex items-center`} onClick={() => setCategory('appointment')}>
                <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                <span>Appointment</span>
                {category === 'appointment' && <CheckIcon className="w-4 h-4 text-purple-500 ml-auto" />}
              </button>
              <button type="button" className={`p-2 rounded-lg border ${category === 'therapy' ? 'border-green-500 bg-green-50' : 'border-gray-200'} flex items-center`} onClick={() => setCategory('therapy')}>
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span>Therapy</span>
                {category === 'therapy' && <CheckIcon className="w-4 h-4 text-green-500 ml-auto" />}
              </button>
              <button type="button" className={`p-2 rounded-lg border ${category === 'meal' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'} flex items-center`} onClick={() => setCategory('meal')}>
                <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                <span>Meal</span>
                {category === 'meal' && <CheckIcon className="w-4 h-4 text-yellow-500 ml-auto" />}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <textarea placeholder="Add description (optional)" className="w-full border border-gray-200 rounded-lg p-2 text-sm h-20 resize-none" value={description} onChange={e => setDescription(e.target.value)}></textarea>
          </div>
          <div className="flex space-x-3">
            <button type="button" onClick={onViewFull} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 flex items-center justify-center">
              More Options
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
            <button type="submit" className="flex-1 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center disabled:bg-blue-300" disabled={!title.trim()}>
              Add Event
            </button>
          </div>
        </form>
      </div>
    </>;
};