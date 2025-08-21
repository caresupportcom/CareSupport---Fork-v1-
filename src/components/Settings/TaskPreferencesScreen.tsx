import React from 'react';
import { ArrowLeftIcon, ListIcon, UserIcon, FilterIcon, ArchiveIcon, EyeIcon } from 'lucide-react';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const TaskPreferencesScreen = ({
  onBack
}) => {
  const {
    preferences,
    updatePreferences
  } = useUserPreferences();
  const {
    defaultPriority,
    sortOrder,
    autoArchiveCompleted,
    showCompletedTasks
  } = preferences.tasks;
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
  }, {
    id: null,
    name: 'No Default',
    initial: '✓',
    color: 'gray'
  }];
  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    updatePreferences('tasks', {
      defaultPriority: priority
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'default_priority_changed',
      priority
    });
  };
  const handleSortOrderChange = (order: 'time' | 'priority' | 'assignee') => {
    updatePreferences('tasks', {
      sortOrder: order
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'sort_order_changed',
      order
    });
  };
  const handleDefaultAssigneeChange = (assigneeId: string | null) => {
    updatePreferences('tasks', {
      defaultAssignee: assigneeId
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'default_assignee_changed',
      assignee_id: assigneeId
    });
  };
  const handleToggleAutoArchive = () => {
    updatePreferences('tasks', {
      autoArchiveCompleted: !autoArchiveCompleted
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'auto_archive_toggled',
      enabled: !autoArchiveCompleted
    });
  };
  const handleToggleShowCompleted = () => {
    updatePreferences('tasks', {
      showCompletedTasks: !showCompletedTasks
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'show_completed_toggled',
      enabled: !showCompletedTasks
    });
  };
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Task Preferences</h1>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <p className="text-gray-600 mb-6">
          Customize how tasks are created and displayed.
        </p>
        <div className="space-y-6">
          {/* Default Priority */}
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                <ListIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Default Priority</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Choose the default priority for new tasks
                </p>
                <div className="flex space-x-3">
                  <button className={`flex-1 py-2 px-4 rounded-full text-sm font-medium ${defaultPriority === 'low' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handlePriorityChange('low')}>
                    <BracketText active={defaultPriority === 'low'}>
                      Low
                    </BracketText>
                  </button>
                  <button className={`flex-1 py-2 px-4 rounded-full text-sm font-medium ${defaultPriority === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handlePriorityChange('medium')}>
                    <BracketText active={defaultPriority === 'medium'}>
                      Medium
                    </BracketText>
                  </button>
                  <button className={`flex-1 py-2 px-4 rounded-full text-sm font-medium ${defaultPriority === 'high' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handlePriorityChange('high')}>
                    <BracketText active={defaultPriority === 'high'}>
                      High
                    </BracketText>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Default Assignee */}
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                <UserIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Default Assignee</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Choose who new tasks are assigned to by default
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {teamMembers.map(member => <button key={member.id || 'none'} className={`p-3 rounded-lg border ${preferences.tasks.defaultAssignee === member.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleDefaultAssigneeChange(member.id)}>
                      <div className={`w-8 h-8 rounded-full bg-${member.color}-100 flex items-center justify-center mr-3`}>
                        <span className={`text-xs text-${member.color}-600 font-medium`}>
                          {member.initial}
                        </span>
                      </div>
                      <span className="font-medium">{member.name}</span>
                      {preferences.tasks.defaultAssignee === member.id && <div className="ml-auto bg-blue-500 text-white p-1 rounded-full">
                          <CheckIcon className="w-4 h-4" />
                        </div>}
                    </button>)}
                </div>
              </div>
            </div>
          </div>
          {/* Sort Order */}
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4 flex-shrink-0">
                <FilterIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Default Sort Order</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Choose how tasks are sorted by default
                </p>
                <div className="space-y-2">
                  <button className={`w-full p-3 rounded-lg border ${sortOrder === 'time' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleSortOrderChange('time')}>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <ClockIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">By Time</span>
                    {sortOrder === 'time' && <div className="ml-auto bg-blue-500 text-white p-1 rounded-full">
                        <CheckIcon className="w-4 h-4" />
                      </div>}
                  </button>
                  <button className={`w-full p-3 rounded-lg border ${sortOrder === 'priority' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleSortOrderChange('priority')}>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <AlertTriangleIcon className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="font-medium">By Priority</span>
                    {sortOrder === 'priority' && <div className="ml-auto bg-blue-500 text-white p-1 rounded-full">
                        <CheckIcon className="w-4 h-4" />
                      </div>}
                  </button>
                  <button className={`w-full p-3 rounded-lg border ${sortOrder === 'assignee' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleSortOrderChange('assignee')}>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <UserIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">By Assignee</span>
                    {sortOrder === 'assignee' && <div className="ml-auto bg-blue-500 text-white p-1 rounded-full">
                        <CheckIcon className="w-4 h-4" />
                      </div>}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Task Display Options */}
          <div className="p-4 border border-gray-200 rounded-xl">
            <h3 className="font-medium mb-4">Task Display Options</h3>
            <div className="space-y-4">
              {/* Auto-archive Completed Tasks */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <ArchiveIcon className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">
                      Auto-archive Completed
                    </h4>
                    <p className="text-xs text-gray-500">
                      Automatically archive tasks after completion
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={autoArchiveCompleted} onChange={handleToggleAutoArchive} aria-label="Toggle auto-archive completed tasks" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {/* Show Completed Tasks */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <EyeIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">
                      Show Completed Tasks
                    </h4>
                    <p className="text-xs text-gray-500">
                      Display completed tasks in the task list
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={showCompletedTasks} onChange={handleToggleShowCompleted} aria-label="Toggle show completed tasks" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
// Additional icons
const ClockIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>;
const AlertTriangleIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>;
const CheckIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>;