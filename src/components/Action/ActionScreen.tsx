import React, { useEffect, useState } from 'react';
import { PlusIcon, BellIcon, ClockIcon, CalendarIcon, AlertTriangleIcon, PhoneCallIcon, HeartPulseIcon, PillIcon, UserPlusIcon, SendIcon, ArrowRightIcon, HandIcon, HelpCircleIcon, CheckCircleIcon, UsersIcon, ShieldIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { dataService } from '../../services/DataService';
import { storage } from '../../services/StorageService';
export const ActionScreen = ({
  navigateTo
}) => {
  const [helpNeededTasks, setHelpNeededTasks] = useState([]);
  const [userId, setUserId] = useState('');
  useEffect(() => {
    // Get current user ID
    const currentUserId = storage.get('user_id', '');
    setUserId(currentUserId);
    // Load help needed tasks (open task requests)
    const taskRequests = dataService.getTaskRequests();
    const openRequests = taskRequests.filter(request => request.status === 'open');
    setHelpNeededTasks(openRequests);
    // Track screen view
    analytics.trackScreenView('action');
  }, []);
  const handleActionClick = actionType => {
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'action_selected',
      action_type: actionType
    });
    navigateTo(actionType);
  };
  const handleHelpRequestClick = request => {
    navigateTo('help-request-detail', request);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_request_viewed_from_action',
      request_id: request.id
    });
  };
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Actions</h1>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative" onClick={() => navigateTo('notifications')} aria-label="Notifications">
            <BellIcon className="w-5 h-5 text-gray-600" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-2">
          What would you like to do today?
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Primary Actions */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <PlusIcon className="w-4 h-4 mr-1.5 text-blue-500" />
              <BracketText active={true}>Create</BracketText>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => handleActionClick('create-task')}>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Create Task</span>
                <span className="text-xs text-gray-500 mt-1">
                  Assign to team member
                </span>
              </button>
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => handleActionClick('create-help-request')}>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <HandIcon className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium">Request Help</span>
                <span className="text-xs text-gray-500 mt-1">
                  Open to care network
                </span>
              </button>
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => handleActionClick('add-event')}>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <CalendarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Add Event</span>
                <span className="text-xs text-gray-500 mt-1">
                  Schedule an activity
                </span>
              </button>
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => handleActionClick('task-template')}>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                  <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-sm font-medium">Use Template</span>
                <span className="text-xs text-gray-500 mt-1">
                  Common care tasks
                </span>
              </button>
            </div>
          </div>

          {/* Help Needed Section */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <HandIcon className="w-4 h-4 mr-1.5 text-amber-500" />
              <BracketText active={true}>Help Needed</BracketText>
              {helpNeededTasks.length > 0 && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  {helpNeededTasks.length}
                </span>}
            </h2>
            {helpNeededTasks.length > 0 ? <div className="space-y-3 mb-4">
                {helpNeededTasks.slice(0, 3).map(request => <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => handleHelpRequestClick(request)}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <HandIcon className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {request.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Due:{' '}
                            {new Date(request.dueDate).toLocaleDateString()}{' '}
                            {request.dueTime}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${request.priority === 'high' ? 'bg-red-100 text-red-700' : request.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {request.description}
                    </p>
                    <div className="flex justify-end">
                      <button className="text-xs text-blue-600 font-medium flex items-center">
                        View details <ArrowRightIcon className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </div>)}
                {helpNeededTasks.length > 3 && <button className="w-full py-2 text-sm text-blue-600 flex items-center justify-center" onClick={() => navigateTo('help-needed')}>
                    View all {helpNeededTasks.length} help requests{' '}
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </button>}
              </div> : <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HandIcon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-gray-700 font-medium mb-1">
                  No help needed right now
                </h3>
                <p className="text-gray-500 text-sm mb-3">
                  There are currently no open help requests.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm" onClick={() => handleActionClick('create-help-request')}>
                  Create Help Request
                </button>
              </div>}
          </div>

          {/* Communication Actions */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <SendIcon className="w-4 h-4 mr-1.5 text-blue-500" />
              <BracketText active={true}>Communicate</BracketText>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => handleActionClick('send-alert')}>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-2">
                  <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm font-medium">Send Alert</span>
              </button>
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => handleActionClick('send-update')}>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <SendIcon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Send Update</span>
              </button>
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => handleActionClick('make-call')}>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <PhoneCallIcon className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium">Make Call</span>
              </button>
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => navigateTo('care-network')}>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <UsersIcon className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Care Network</span>
              </button>
            </div>
          </div>

          {/* Health Tracking */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <HeartPulseIcon className="w-4 h-4 mr-1.5 text-red-500" />
              <BracketText active={true}>Health</BracketText>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => handleActionClick('record-vitals')}>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-2">
                  <HeartPulseIcon className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm font-medium">Record Vitals</span>
              </button>
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => handleActionClick('medication-reminder')}>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <PillIcon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Medication</span>
              </button>
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => handleActionClick('schedule-appointment')}>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <UserPlusIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium">Appointment</span>
              </button>
              <button className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 hover:shadow transition-all" onClick={() => handleActionClick('emergency-contact')}>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-2">
                  <ShieldIcon className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm font-medium">Emergency</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};