import React, { useEffect, useState } from 'react';
import { CalendarIcon, ClockIcon, UsersIcon, PlusIcon, CheckCircleIcon, XCircleIcon, RotateCcwIcon, SaveIcon } from 'lucide-react';
import { shiftService } from '../../services/ShiftService';
import { dataService } from '../../services/DataService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
interface ShiftPlanningToolProps {
  startDate: string;
  endDate: string;
  onShiftCreated?: () => void;
}
export const ShiftPlanningTool: React.FC<ShiftPlanningToolProps> = ({
  startDate,
  endDate,
  onShiftCreated
}) => {
  const [shiftTemplates, setShiftTemplates] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('09:00');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [dateRange, setDateRange] = useState<string[]>([]);
  const [recurringOptions, setRecurringOptions] = useState({
    isRecurring: false,
    pattern: 'weekly',
    interval: 1,
    weekDays: [1, 3, 5],
    occurrences: 4
  });
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [recommendedSlots, setRecommendedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadData();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shift_planning_tool_opened'
    });
  }, [startDate, endDate]);
  const loadData = async () => {
    setIsLoading(true);
    // Load shift templates
    const templates = shiftService.getShiftTemplates();
    setShiftTemplates(templates);
    // Load team members
    const members = dataService.getTeamMembers();
    setTeamMembers(members);
    // Set initial date to start date
    setSelectedDate(startDate);
    // Generate date range
    const range = generateDateRange(startDate, endDate);
    setDateRange(range);
    // Generate recommended slots
    const recommended = generateRecommendedSlots(range);
    setRecommendedSlots(recommended);
    setIsLoading(false);
  };
  // Generate an array of date strings between start and end dates
  const generateDateRange = (start: string, end: string) => {
    const dates: string[] = [];
    const currentDate = new Date(start);
    const lastDate = new Date(end);
    while (currentDate <= lastDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };
  // Generate recommended shift slots based on existing patterns
  const generateRecommendedSlots = (dates: string[]) => {
    const recommended = [];
    // Look at existing shifts to find patterns
    const existingShifts = shiftService.getShifts();
    // Group shifts by time
    const timePatterns: Record<string, number> = {};
    existingShifts.forEach(shift => {
      const timeKey = `${shift.startTime}-${shift.endTime}`;
      timePatterns[timeKey] = (timePatterns[timeKey] || 0) + 1;
    });
    // Sort patterns by frequency
    const sortedPatterns = Object.entries(timePatterns).sort((a, b) => b[1] - a[1]).slice(0, 3); // Take top 3 patterns
    // Generate recommendations for each date
    dates.forEach(date => {
      // Check if we already have shifts for this date
      const existingForDate = existingShifts.filter(shift => shift.date === date);
      // If we have less than 2 shifts for this date, recommend based on patterns
      if (existingForDate.length < 2) {
        sortedPatterns.forEach(([timeKey, count]) => {
          const [startTime, endTime] = timeKey.split('-');
          // Check if this time slot is already covered
          const isTimeCovered = existingForDate.some(shift => shift.startTime === startTime && shift.endTime === endTime);
          if (!isTimeCovered) {
            // Find a template that matches this time pattern
            const matchingTemplate = shiftTemplates.find(template => {
              const duration = template.duration;
              const templateEndHours = Math.floor(duration / 60);
              const templateEndMinutes = duration % 60;
              const [startHours, startMinutes] = startTime.split(':').map(Number);
              const calculatedEndHours = (startHours + templateEndHours) % 24;
              const calculatedEndMinutes = (startMinutes + templateEndMinutes) % 60;
              const calculatedEndTime = `${calculatedEndHours.toString().padStart(2, '0')}:${calculatedEndMinutes.toString().padStart(2, '0')}`;
              return calculatedEndTime === endTime;
            });
            recommended.push({
              date,
              startTime,
              endTime,
              templateId: matchingTemplate?.id || null,
              score: count // Higher score means more common pattern
            });
          }
        });
      }
    });
    return recommended.sort((a, b) => {
      // Sort by date first
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      // Then by score (descending)
      return b.score - a.score;
    });
  };
  // Calculate end time based on template duration and start time
  const calculateEndTime = () => {
    if (!selectedTemplate) return '';
    const duration = selectedTemplate.duration;
    const [hours, minutes] = selectedStartTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };
  // Handle template selection
  const handleTemplateSelect = templateId => {
    const template = shiftTemplates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shift_template_selected',
      template_id: templateId
    });
  };
  // Handle creating a shift
  const handleCreateShift = () => {
    if (!selectedTemplate || !selectedDate || !selectedStartTime) {
      alert('Please select a template, date, and start time');
      return;
    }
    const endTime = calculateEndTime();
    if (recurringOptions.isRecurring) {
      // Create recurring shifts
      createRecurringShifts();
    } else {
      // Create a single shift
      const shiftData = {
        date: selectedDate,
        startTime: selectedStartTime,
        endTime,
        assignedTo: selectedAssignee || null,
        status: selectedAssignee ? 'scheduled' : 'open',
        coverageType: selectedTemplate.coverageType,
        tasks: [...selectedTemplate.defaultTasks],
        createdBy: 'current_user',
        color: selectedTemplate.color
      };
      shiftService.addShift(shiftData);
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'shift_created',
        is_recurring: false,
        has_assignee: !!selectedAssignee
      });
    }
    // Reset form
    resetForm();
    // Notify parent component
    if (onShiftCreated) {
      onShiftCreated();
    }
  };
  // Create recurring shifts
  const createRecurringShifts = () => {
    if (!selectedTemplate || !selectedDate || !selectedStartTime) return;
    const endTime = calculateEndTime();
    const startDateObj = new Date(selectedDate);
    // Create base shift data
    const baseShiftData = {
      startTime: selectedStartTime,
      endTime,
      assignedTo: selectedAssignee || null,
      status: selectedAssignee ? 'scheduled' : 'open',
      coverageType: selectedTemplate.coverageType,
      tasks: [...selectedTemplate.defaultTasks],
      createdBy: 'current_user',
      color: selectedTemplate.color,
      recurring: true,
      recurrencePattern: {
        type: recurringOptions.pattern,
        interval: recurringOptions.interval,
        weekDays: recurringOptions.pattern === 'weekly' ? recurringOptions.weekDays : undefined,
        occurrences: recurringOptions.occurrences
      }
    };
    // Create first shift
    const firstShift = {
      ...baseShiftData,
      date: selectedDate
    };
    shiftService.addShift(firstShift);
    // Create subsequent shifts based on pattern
    if (recurringOptions.pattern === 'daily') {
      for (let i = 1; i < recurringOptions.occurrences; i++) {
        const nextDate = new Date(startDateObj);
        nextDate.setDate(startDateObj.getDate() + i * recurringOptions.interval);
        const nextShift = {
          ...baseShiftData,
          date: nextDate.toISOString().split('T')[0]
        };
        shiftService.addShift(nextShift);
      }
    } else if (recurringOptions.pattern === 'weekly') {
      // For weekly pattern, create shifts for selected days of the week
      const daysToGenerate = recurringOptions.occurrences * recurringOptions.weekDays.length;
      let shiftsCreated = 1; // Already created the first shift
      let currentDate = new Date(startDateObj);
      currentDate.setDate(currentDate.getDate() + 1); // Start from next day
      while (shiftsCreated < daysToGenerate) {
        const dayOfWeek = currentDate.getDay(); // 0-6, Sunday-Saturday
        const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to 1-7, Monday-Sunday
        if (recurringOptions.weekDays.includes(adjustedDayOfWeek)) {
          const nextShift = {
            ...baseShiftData,
            date: currentDate.toISOString().split('T')[0]
          };
          shiftService.addShift(nextShift);
          shiftsCreated++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'recurring_shifts_created',
      pattern: recurringOptions.pattern,
      occurrences: recurringOptions.occurrences,
      has_assignee: !!selectedAssignee
    });
  };
  // Reset the form
  const resetForm = () => {
    setSelectedTemplate(null);
    setSelectedStartTime('09:00');
    setSelectedAssignee('');
    setRecurringOptions({
      isRecurring: false,
      pattern: 'weekly',
      interval: 1,
      weekDays: [1, 3, 5],
      occurrences: 4
    });
    setShowRecurringOptions(false);
  };
  // Handle using a recommended slot
  const handleUseRecommendedSlot = slot => {
    setSelectedDate(slot.date);
    setSelectedStartTime(slot.startTime);
    if (slot.templateId) {
      const template = shiftTemplates.find(t => t.id === slot.templateId);
      setSelectedTemplate(template);
    }
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'recommended_slot_selected'
    });
  };
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  if (isLoading) {
    return <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>;
  }
  return <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
          Shift Planning Tool
        </h2>
        <p className="text-sm text-gray-500">
          Plan and create shifts for {formatDate(startDate)} -{' '}
          {formatDate(endDate)}
        </p>
      </div>
      {/* Recommended Slots */}
      {recommendedSlots.length > 0 && <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Recommended Shift Slots
          </h3>
          <div className="space-y-2">
            {recommendedSlots.slice(0, 3).map((slot, index) => <div key={`${slot.date}-${slot.startTime}-${index}`} className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => handleUseRecommendedSlot(slot)}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{formatDate(slot.date)}</div>
                    <div className="text-sm text-gray-600">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                  <button className="text-xs bg-white text-blue-700 border border-blue-300 rounded px-2 py-1">
                    Use
                  </button>
                </div>
              </div>)}
          </div>
        </div>}
      {/* Create Shift Form */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Create New Shift
        </h3>
        {/* Shift Template Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shift Template
          </label>
          <div className="grid grid-cols-2 gap-2">
            {shiftTemplates.map(template => <div key={template.id} className={`p-3 rounded-lg border cursor-pointer ${selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`} onClick={() => handleTemplateSelect(template.id)}>
                <div className="font-medium">{template.name}</div>
                <div className="text-xs text-gray-500">
                  {Math.floor(template.duration / 60)}h {template.duration % 60}
                  m
                </div>
              </div>)}
          </div>
        </div>
        {/* Date and Time Selection */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
              {dateRange.map(date => <option key={date} value={date}>
                  {formatDate(date)}
                </option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md" value={selectedStartTime} onChange={e => setSelectedStartTime(e.target.value)}>
              {Array.from({
              length: 24
            }).map((_, i) => <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                  {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                </option>)}
            </select>
          </div>
        </div>
        {/* Assignee Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To (optional)
          </label>
          <select className="w-full p-2 border border-gray-300 rounded-md" value={selectedAssignee} onChange={e => setSelectedAssignee(e.target.value)}>
            <option value="">Unassigned (Open Shift)</option>
            {teamMembers.map(member => <option key={member.id} value={member.id}>
                {member.name} ({member.role})
              </option>)}
          </select>
        </div>
        {/* Recurring Options Toggle */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-blue-600 cursor-pointer" onClick={() => setShowRecurringOptions(!showRecurringOptions)}>
            <RotateCcwIcon className="w-4 h-4 mr-1" />
            {showRecurringOptions ? 'Hide recurring options' : 'Show recurring options'}
          </div>
        </div>
        {/* Recurring Options */}
        {showRecurringOptions && <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mb-2">
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" checked={recurringOptions.isRecurring} onChange={e => setRecurringOptions({
              ...recurringOptions,
              isRecurring: e.target.checked
            })} />
                <span className="ml-2 text-sm text-gray-700">
                  Make this a recurring shift
                </span>
              </label>
            </div>
            {recurringOptions.isRecurring && <>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Pattern
                    </label>
                    <select className="w-full p-2 text-sm border border-gray-300 rounded-md" value={recurringOptions.pattern} onChange={e => setRecurringOptions({
                ...recurringOptions,
                pattern: e.target.value
              })}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {recurringOptions.pattern === 'daily' ? 'Every X days' : 'Every X weeks'}
                    </label>
                    <select className="w-full p-2 text-sm border border-gray-300 rounded-md" value={recurringOptions.interval} onChange={e => setRecurringOptions({
                ...recurringOptions,
                interval: parseInt(e.target.value)
              })}>
                      {[1, 2, 3, 4].map(num => <option key={num} value={num}>
                          {num}
                        </option>)}
                    </select>
                  </div>
                </div>
                {recurringOptions.pattern === 'weekly' && <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Days of Week
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {[{
                value: 1,
                label: 'M'
              }, {
                value: 2,
                label: 'T'
              }, {
                value: 3,
                label: 'W'
              }, {
                value: 4,
                label: 'T'
              }, {
                value: 5,
                label: 'F'
              }, {
                value: 6,
                label: 'S'
              }, {
                value: 7,
                label: 'S'
              }].map(day => <div key={day.value} className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm ${recurringOptions.weekDays.includes(day.value) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => {
                const updatedDays = recurringOptions.weekDays.includes(day.value) ? recurringOptions.weekDays.filter(d => d !== day.value) : [...recurringOptions.weekDays, day.value];
                setRecurringOptions({
                  ...recurringOptions,
                  weekDays: updatedDays
                });
              }}>
                          {day.label}
                        </div>)}
                    </div>
                  </div>}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Number of Occurrences
                  </label>
                  <select className="w-full p-2 text-sm border border-gray-300 rounded-md" value={recurringOptions.occurrences} onChange={e => setRecurringOptions({
              ...recurringOptions,
              occurrences: parseInt(e.target.value)
            })}>
                    {[2, 3, 4, 5, 6, 7, 8].map(num => <option key={num} value={num}>
                        {num}
                      </option>)}
                  </select>
                </div>
              </>}
          </div>}
        {/* Summary */}
        {selectedTemplate && <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-1">Shift Summary</h4>
            <div className="text-sm text-blue-700">
              <div>
                <strong>Template:</strong> {selectedTemplate.name}
              </div>
              <div>
                <strong>Date:</strong> {formatDate(selectedDate)}
              </div>
              <div>
                <strong>Time:</strong> {selectedStartTime} -{' '}
                {calculateEndTime()}
              </div>
              <div>
                <strong>Assignee:</strong>{' '}
                {selectedAssignee ? teamMembers.find(m => m.id === selectedAssignee)?.name || 'Unknown' : 'Unassigned (Open Shift)'}
              </div>
              {recurringOptions.isRecurring && <div>
                  <strong>Recurring:</strong>{' '}
                  {recurringOptions.pattern === 'daily' ? `Every ${recurringOptions.interval} day(s)` : `Weekly on selected days`}
                  , {recurringOptions.occurrences} occurrences
                </div>}
            </div>
          </div>}
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm" onClick={resetForm}>
            Reset
          </button>
          <button className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center ${selectedTemplate ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} onClick={handleCreateShift} disabled={!selectedTemplate}>
            <PlusIcon className="w-4 h-4 mr-1" />
            {recurringOptions.isRecurring ? 'Create Recurring Shifts' : 'Create Shift'}
          </button>
        </div>
      </div>
    </div>;
};