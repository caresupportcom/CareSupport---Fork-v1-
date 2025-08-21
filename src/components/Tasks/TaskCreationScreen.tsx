import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, AlertTriangleIcon, UserIcon, CheckIcon, RepeatIcon, HandIcon, UsersIcon, InfoIcon, XIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { dataService } from '../../services/DataService';
import { storage } from '../../services/StorageService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const TaskCreationScreen = ({
  onBack,
  onCreateTask
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('general');
  const [assignmentType, setAssignmentType] = useState('team_member'); // 'team_member' or 'help_request'
  const [assignedTo, setAssignedTo] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState({
    type: 'daily',
    interval: 1,
    weekDays: [],
    endDate: '',
    occurrences: 0
  });
  const [showInfoTip, setShowInfoTip] = useState(false);
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState(30);
  const [teamMembers, setTeamMembers] = useState([]);
  useEffect(() => {
    // Get team members
    const members = dataService.getTeamMembers();
    setTeamMembers(members);
    // Set default due date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDueDate(formattedDate);
    // Track screen view
    analytics.trackScreenView('create_task');
  }, []);
  const handleSubmit = e => {
    e.preventDefault();
    const userId = storage.get('user_id', '');
    if (assignmentType === 'team_member') {
      // Create a directly assigned task
      const taskData = {
        id: `task_${Date.now()}`,
        title,
        description,
        dueDate,
        dueTime,
        priority,
        category,
        assignedTo,
        status: 'pending',
        hasConflict: false,
        createdBy: userId,
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : undefined
      };
      onCreateTask(taskData);
      analytics.trackEvent(AnalyticsEvents.TASK_CREATED, {
        task_title: title,
        task_priority: priority,
        assigned_to: assignedTo,
        assignment_type: 'direct'
      });
    } else {
      // Create a help request
      const helpRequestData = {
        id: `request_${Date.now()}`,
        title,
        description,
        category,
        dueDate,
        dueTime,
        duration: parseInt(duration) || 30,
        priority,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        status: 'open',
        location,
        recurring: isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : undefined
      };
      // Add to task requests
      dataService.addTaskRequest(helpRequestData);
      analytics.trackEvent(AnalyticsEvents.TASK_CREATED, {
        task_title: title,
        task_priority: priority,
        assignment_type: 'help_request'
      });
      // Navigate back (the parent component will handle notifications)
      onBack();
    }
  };
  const handlePriorityChange = newPriority => {
    setPriority(newPriority);
    analytics.trackFeatureUsage('task_priority_changed');
  };
  const handleAssignmentTypeChange = type => {
    setAssignmentType(type);
    analytics.trackFeatureUsage('task_assignment_type_changed', {
      type: type
    });
  };
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Create Task</h1>
      </div>

      {/* Info Tip */}
      {showInfoTip && <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
          <div className="flex items-start">
            <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-700 mb-1">
                Assignment Types
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                <strong>Assign to Team Member:</strong> Directly assign this
                task to a specific person on the care team.
              </p>
              <p className="text-sm text-blue-700">
                <strong>Request Help:</strong> Open this task to the care
                network for someone to volunteer to help.
              </p>
            </div>
            <button onClick={() => setShowInfoTip(false)} className="ml-2 text-blue-500" aria-label="Close help tip">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Task Title*
              </label>
              <input type="text" id="title" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea id="description" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24" placeholder="Add details about this task..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          {/* Assignment Type */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Assignment Type*
              </label>
              <button type="button" onClick={() => setShowInfoTip(!showInfoTip)} className="text-blue-600" aria-label="Learn more about assignment types">
                <InfoIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className={`p-3 border rounded-lg flex items-center ${assignmentType === 'team_member' ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'}`} onClick={() => handleAssignmentTypeChange('team_member')}>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-sm">Team Member</span>
                  <span className="block text-xs text-gray-500">
                    Assign directly
                  </span>
                </div>
                {assignmentType === 'team_member' && <CheckIcon className="w-5 h-5 text-blue-600 ml-auto" />}
              </button>
              <button type="button" className={`p-3 border rounded-lg flex items-center ${assignmentType === 'help_request' ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'}`} onClick={() => handleAssignmentTypeChange('help_request')}>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <HandIcon className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-sm">Help Request</span>
                  <span className="block text-xs text-gray-500">
                    Open to network
                  </span>
                </div>
                {assignmentType === 'help_request' && <CheckIcon className="w-5 h-5 text-green-600 ml-auto" />}
              </button>
            </div>
          </div>

          {/* Team Member Assignment (conditional) */}
          {assignmentType === 'team_member' && <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To*
              </label>
              <div className="grid grid-cols-2 gap-3">
                {teamMembers.map(member => <button key={member.id} type="button" className={`p-3 border rounded-lg flex items-center ${assignedTo === member.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'}`} onClick={() => setAssignedTo(member.id)}>
                    <div className={`w-8 h-8 rounded-full bg-${member.color}-100 flex items-center justify-center mr-3`}>
                      <span className={`text-xs text-${member.color}-600 font-medium`}>
                        {member.initial}
                      </span>
                    </div>
                    <span className="font-medium text-sm">{member.name}</span>
                    {assignedTo === member.id && <CheckIcon className="w-5 h-5 text-blue-600 ml-auto" />}
                  </button>)}
              </div>
            </div>}

          {/* Help Request Fields (conditional) */}
          {assignmentType === 'help_request' && <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input type="text" id="location" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Where will this task take place?" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Duration (minutes)
                </label>
                <input type="number" id="duration" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="30" min="5" max="480" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
            </div>}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input type="date" id="dueDate" className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              </div>
            </div>
            <div>
              <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 mb-1">
                Due Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input type="time" id="dueTime" className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={dueTime} onChange={e => setDueTime(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex space-x-3">
              <button type="button" className={`flex-1 py-2 px-4 rounded-full text-sm font-medium ${priority === 'low' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handlePriorityChange('low')}>
                <BracketText active={priority === 'low'}>Low</BracketText>
              </button>
              <button type="button" className={`flex-1 py-2 px-4 rounded-full text-sm font-medium ${priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handlePriorityChange('medium')}>
                <BracketText active={priority === 'medium'}>Medium</BracketText>
              </button>
              <button type="button" className={`flex-1 py-2 px-4 rounded-full text-sm font-medium ${priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handlePriorityChange('high')}>
                <BracketText active={priority === 'high'}>High</BracketText>
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select id="category" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="general">General</option>
              <option value="medication">Medication</option>
              <option value="appointment">Appointment</option>
              <option value="therapy">Therapy</option>
              <option value="health">Health Monitoring</option>
              <option value="errands">Errands</option>
              <option value="meal">Meal Preparation</option>
              <option value="driving">Transportation</option>
              <option value="keeping_company">Companionship</option>
              <option value="home_management">Home Management</option>
            </select>
          </div>

          {/* Recurrence */}
          <div className="flex items-center">
            <input type="checkbox" id="isRecurring" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
            <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700 flex items-center">
              <RepeatIcon className="w-4 h-4 mr-1 text-gray-500" />
              Make this a recurring task
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium" disabled={!title || !dueDate || assignmentType === 'team_member' && !assignedTo}>
              {assignmentType === 'team_member' ? 'Create Task' : 'Create Help Request'}
            </button>
          </div>
        </form>
      </div>
    </div>;
};