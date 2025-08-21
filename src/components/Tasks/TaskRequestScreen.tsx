import React, { useState } from 'react';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, CheckIcon, PlusIcon, XIcon, AlertTriangleIcon, HandIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const TaskRequestScreen = ({
  onBack,
  onCreateRequest
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('medium');
  // Validation
  const isValid = title.trim() !== '';
  const handleSubmit = e => {
    e.preventDefault();
    if (!isValid) return;
    const helpRequest = {
      title,
      description,
      category,
      dueDate,
      dueTime,
      duration: Number(duration || 30),
      location,
      priority,
      createdBy: 'james',
      status: 'open'
    };
    // Track in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_request_created',
      category: category,
      priority: priority
    });
    // Call the parent handler
    onCreateRequest(helpRequest);
  };
  return <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center border-b border-gray-200">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Create Help Request</h1>
      </div>
      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="What help do you need?" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea className="w-full p-3 border border-gray-300 rounded-lg h-24" placeholder="Provide details about what help is needed..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="transportation">Transportation</option>
              <option value="meals">Meals</option>
              <option value="errands">Errands</option>
              <option value="household">Household</option>
              <option value="companionship">Companionship</option>
              <option value="medical">Medical</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <input type="date" className="w-full p-3 border border-gray-300 rounded-lg" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                <CalendarIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <div className="relative">
                <input type="time" className="w-full p-3 border border-gray-300 rounded-lg" value={dueTime} onChange={e => setDueTime(e.target.value)} />
                <ClockIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input type="number" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="30" min="5" step="5" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Where is help needed?" value={location} onChange={e => setLocation(e.target.value)} />
                <MapPinIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex space-x-3">
              <button type="button" className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${priority === 'low' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600'}`} onClick={() => setPriority('low')}>
                <BracketText active={priority === 'low'}>Low</BracketText>
              </button>
              <button type="button" className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-gray-100 text-gray-600'}`} onClick={() => setPriority('medium')}>
                <BracketText active={priority === 'medium'}>Medium</BracketText>
              </button>
              <button type="button" className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${priority === 'high' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-600'}`} onClick={() => setPriority('high')}>
                <BracketText active={priority === 'high'}>High</BracketText>
              </button>
            </div>
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={!isValid}>
              <HandIcon className="w-5 h-5 mr-2" />
              Post Help Request
            </Button>
            <p className="text-xs text-gray-500 mt-2">* Required fields</p>
          </div>
        </form>
      </div>
    </div>;
};