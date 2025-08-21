import React, { useEffect, useState } from 'react';
import { XIcon, CalendarIcon, ClockIcon, UserIcon, RepeatIcon } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { dataService } from '../../services/DataService';
import { CareShift } from '../../types/ScheduleTypes';
import { shiftService } from '../../services/ShiftService';
interface ShiftCreationProps {
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  shiftToEdit?: CareShift;
  onClose: () => void;
  onComplete: () => void;
}
export const ShiftCreation: React.FC<ShiftCreationProps> = ({
  initialDate,
  initialStartTime,
  initialEndTime,
  shiftToEdit,
  onClose,
  onComplete
}) => {
  const isEditMode = !!shiftToEdit;
  const {
    addShift,
    updateShift
  } = useCalendar();
  // Initialize form state
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialStartTime || '09:00');
  const [endTime, setEndTime] = useState(initialEndTime || '17:00');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [coverageType, setCoverageType] = useState<'primary' | 'backup' | 'specialist'>('primary');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [weekDays, setWeekDays] = useState<number[]>([]);
  const [color, setColor] = useState('#e6f7ff');
  const [handoffNotes, setHandoffNotes] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [error, setError] = useState('');
  // Get team members and templates
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  useEffect(() => {
    // Load team members
    setTeamMembers(dataService.getTeamMembers());
    // Load shift templates
    setTemplates(shiftService.getShiftTemplates());
    // If editing, populate form with shift data
    if (shiftToEdit) {
      setDate(shiftToEdit.date);
      setStartTime(shiftToEdit.startTime);
      setEndTime(shiftToEdit.endTime);
      setAssignedTo(shiftToEdit.assignedTo);
      setCoverageType(shiftToEdit.coverageType);
      setColor(shiftToEdit.color || '#e6f7ff');
      setHandoffNotes(shiftToEdit.handoffNotes || '');
      if (shiftToEdit.recurring) {
        setIsRecurring(true);
        const pattern = shiftToEdit.recurrencePattern;
        if (pattern) {
          setRecurrenceType(pattern.type);
          setRecurrenceInterval(pattern.interval);
          if (pattern.weekDays) {
            setWeekDays(pattern.weekDays);
          }
        }
      }
    }
  }, [shiftToEdit]);
  // Handle template selection
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setCoverageType(template.coverageType);
        setColor(template.color || '#e6f7ff');
        // Calculate end time based on template duration
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + template.duration;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;
        setEndTime(`${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`);
      }
    }
  };
  // Toggle weekday selection for weekly recurrence
  const toggleWeekDay = (day: number) => {
    if (weekDays.includes(day)) {
      setWeekDays(weekDays.filter(d => d !== day));
    } else {
      setWeekDays([...weekDays, day]);
    }
  };
  // Validate the form
  const validateForm = () => {
    if (!date) {
      setError('Please select a date');
      return false;
    }
    if (!startTime || !endTime) {
      setError('Please set both start and end times');
      return false;
    }
    // Check if end time is after start time
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    // Allow overnight shifts (end time on next day)
    if (endTotalMinutes < startTotalMinutes && endTotalMinutes !== 0) {
      // This is fine - it's an overnight shift
    } else if (startTotalMinutes === endTotalMinutes) {
      setError('Start and end time cannot be the same');
      return false;
    }
    // If recurring weekly, must select at least one day
    if (isRecurring && recurrenceType === 'weekly' && weekDays.length === 0) {
      setError('Please select at least one day of the week');
      return false;
    }
    return true;
  };
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const shiftData: Omit<CareShift, 'id' | 'createdAt'> = {
      date,
      startTime,
      endTime,
      assignedTo,
      status: assignedTo ? 'scheduled' : 'open',
      coverageType,
      color,
      createdBy: storage.get('user_id', 'maria'),
      ...(handoffNotes ? {
        handoffNotes
      } : {}),
      ...(isRecurring ? {
        recurring: true,
        recurrencePattern: {
          type: recurrenceType,
          interval: recurrenceInterval,
          ...(recurrenceType === 'weekly' ? {
            weekDays
          } : {})
        }
      } : {})
    };
    if (isEditMode && shiftToEdit) {
      // Update existing shift
      updateShift({
        ...shiftToEdit,
        ...shiftData
      });
    } else {
      // Create new shift
      addShift(shiftData);
    }
    onComplete();
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isEditMode ? 'Edit Shift' : 'Create New Shift'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
              <XIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>}
          <form onSubmit={handleSubmit}>
            {!isEditMode && <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Use Template (Optional)
                </label>
                <select value={selectedTemplate} onChange={handleTemplateChange} className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="">Select a template...</option>
                  {templates.map(template => <option key={template.id} value={template.id}>
                      {template.name} ({template.duration / 60} hours)
                    </option>)}
                </select>
              </div>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-10 p-2 border border-gray-300 rounded-lg" required />
              </div>
            </div>
            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full pl-10 p-2 border border-gray-300 rounded-lg" required />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select value={assignedTo || ''} onChange={e => setAssignedTo(e.target.value || null)} className="w-full pl-10 p-2 border border-gray-300 rounded-lg">
                  <option value="">Unassigned (Open Shift)</option>
                  {teamMembers.map(member => <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage Type
              </label>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setCoverageType('primary')} className={`flex-1 py-2 px-3 rounded-lg text-sm ${coverageType === 'primary' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'border border-gray-300'}`}>
                  Primary
                </button>
                <button type="button" onClick={() => setCoverageType('backup')} className={`flex-1 py-2 px-3 rounded-lg text-sm ${coverageType === 'backup' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'border border-gray-300'}`}>
                  Backup
                </button>
                <button type="button" onClick={() => setCoverageType('specialist')} className={`flex-1 py-2 px-3 rounded-lg text-sm ${coverageType === 'specialist' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'border border-gray-300'}`}>
                  Specialist
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Color
              </label>
              <div className="flex space-x-2">
                {['#e6f7ff', '#fff2e6', '#e6ffe6', '#f7e6ff', '#ffe6e6'].map(colorOption => <button key={colorOption} type="button" onClick={() => setColor(colorOption)} className={`w-8 h-8 rounded-full ${color === colorOption ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} style={{
                backgroundColor: colorOption
              }} aria-label={`Select color ${colorOption}`} />)}
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer" aria-label="Select custom color" />
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input type="checkbox" checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} className="w-4 h-4 text-blue-600 rounded" />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Recurring Shift
                </span>
              </label>
            </div>
            {isRecurring && <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recurrence Pattern
                  </label>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setRecurrenceType('daily')} className={`flex-1 py-1.5 px-3 rounded-lg text-sm ${recurrenceType === 'daily' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'border border-gray-300'}`}>
                      Daily
                    </button>
                    <button type="button" onClick={() => setRecurrenceType('weekly')} className={`flex-1 py-1.5 px-3 rounded-lg text-sm ${recurrenceType === 'weekly' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'border border-gray-300'}`}>
                      Weekly
                    </button>
                    <button type="button" onClick={() => setRecurrenceType('monthly')} className={`flex-1 py-1.5 px-3 rounded-lg text-sm ${recurrenceType === 'monthly' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'border border-gray-300'}`}>
                      Monthly
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repeat Every
                  </label>
                  <div className="flex items-center">
                    <input type="number" min="1" max="30" value={recurrenceInterval} onChange={e => setRecurrenceInterval(parseInt(e.target.value) || 1)} className="w-16 p-2 border border-gray-300 rounded-lg mr-2" />
                    <span className="text-sm text-gray-600">
                      {recurrenceType === 'daily' ? 'day(s)' : recurrenceType === 'weekly' ? 'week(s)' : 'month(s)'}
                    </span>
                  </div>
                </div>
                {recurrenceType === 'weekly' && <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      On These Days
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <button key={index} type="button" onClick={() => toggleWeekDay(index)} className={`w-8 h-8 rounded-full text-sm ${weekDays.includes(index) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                          {day}
                        </button>)}
                    </div>
                  </div>}
              </div>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Handoff Notes (Optional)
              </label>
              <textarea value={handoffNotes} onChange={e => setHandoffNotes(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg h-20" placeholder="Add notes for shift handoff..." />
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                {isEditMode ? 'Update Shift' : 'Create Shift'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>;
};