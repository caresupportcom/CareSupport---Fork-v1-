import React, { useState } from 'react';
import { ArrowLeftIcon, UserIcon, CheckIcon, ClipboardIcon, ClockIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const AssignTaskScreen = ({
  onBack
}) => {
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    dueDate: '',
    dueTime: '',
    assignee: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const teamMembers = [{
    id: 'james',
    name: 'James',
    role: 'Nurse',
    color: 'blue'
  }, {
    id: 'maria',
    name: 'Maria',
    role: 'Doctor',
    color: 'green'
  }, {
    id: 'linda',
    name: 'Linda',
    role: 'Caregiver',
    color: 'purple'
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
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.taskName.trim()) {
      newErrors.taskName = 'Task name is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (!formData.assignee) {
      newErrors.assignee = 'Please select a team member';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    // Track in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'task_assigned',
      assignee: formData.assignee
    });
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Return to previous screen after showing success
      setTimeout(() => {
        onBack();
      }, 1500);
    }, 1000);
  };
  if (isSuccess) {
    return <div className="h-full flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Task Assigned!</h2>
        <p className="text-gray-600">
          The task has been assigned to{' '}
          {teamMembers.find(m => m.id === formData.assignee)?.name || 'the team member'}
        </p>
      </div>;
  }
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Assign Task</h1>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <label className="block font-medium mb-2">Task Name</label>
            <input type="text" className={`w-full border ${errors.taskName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter task name" value={formData.taskName} onChange={e => handleInputChange('taskName', e.target.value)} />
            {errors.taskName && <p className="text-red-500 text-sm mt-1">{errors.taskName}</p>}
          </div>
          <div>
            <label className="block font-medium mb-2">Description</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter task description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block font-medium mb-2">Due Date</label>
              <input type="date" className={`w-full border ${errors.dueDate ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} value={formData.dueDate} onChange={e => handleInputChange('dueDate', e.target.value)} />
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-2">Due Time</label>
              <input type="time" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.dueTime} onChange={e => handleInputChange('dueTime', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-2">Assign To</label>
            <div className="space-y-3">
              {teamMembers.map(member => <button key={member.id} className={`w-full p-3 rounded-lg border ${formData.assignee === member.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleInputChange('assignee', member.id)}>
                  <div className={`w-8 h-8 rounded-full bg-${member.color}-100 flex items-center justify-center mr-3`}>
                    <span className={`text-xs text-${member.color}-600 font-medium`}>
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium">{member.name}</span>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                  {formData.assignee === member.id && <div className="ml-auto bg-blue-500 text-white p-1 rounded-full">
                      <CheckIcon className="w-4 h-4" />
                    </div>}
                </button>)}
            </div>
            {errors.assignee && <p className="text-red-500 text-sm mt-1">{errors.assignee}</p>}
          </div>
        </div>
        <div className="mt-8">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            <BracketText active={true} className="text-white">
              {isSubmitting ? 'Assigning...' : 'Assign Task'}
            </BracketText>
          </Button>
        </div>
      </div>
    </div>;
};