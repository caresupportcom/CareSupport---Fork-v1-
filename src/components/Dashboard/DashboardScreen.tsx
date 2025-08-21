import React, { useState } from 'react';
import { MicIcon, BellIcon, SettingsIcon, AlertTriangleIcon, CheckCircleIcon, ClockIcon } from 'lucide-react';
import { ActivityFeed } from './ActivityFeed';
import { CareTask } from './CareTask';
export const DashboardScreen = ({
  navigateTo
}) => {
  const [tasks, setTasks] = useState([{
    id: 1,
    title: 'Give medication',
    description: 'Administer 10mg of medication with food',
    status: 'pending',
    dueTime: '9:00 AM',
    hasConflict: true,
    assignedTo: 'James',
    createdBy: 'Maria'
  }, {
    id: 2,
    title: 'Check blood pressure',
    description: 'Record reading in the app',
    status: 'completed',
    dueTime: '10:30 AM',
    hasConflict: false,
    assignedTo: 'Linda',
    createdBy: 'James'
  }, {
    id: 3,
    title: 'Physical therapy exercises',
    description: 'Complete the set of exercises prescribed by the PT',
    status: 'pending',
    dueTime: '2:00 PM',
    hasConflict: false,
    assignedTo: 'Maria',
    createdBy: 'Linda'
  }]);
  const activities = [{
    id: 1,
    user: 'James',
    action: 'completed',
    task: 'Blood pressure check',
    time: '10 minutes ago'
  }, {
    id: 2,
    user: 'Maria',
    action: 'added',
    task: 'Give medication',
    time: '1 hour ago'
  }, {
    id: 3,
    user: 'Linda',
    action: 'flagged conflict',
    task: 'Give medication',
    time: '30 minutes ago'
  }];
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Care Plan</h1>
          <div className="flex space-x-4">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={() => navigateTo('settings')}>
              <SettingsIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative">
              <BellIcon className="w-5 h-5 text-gray-600" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
        <div className="flex space-x-3 mb-4">
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            All Tasks
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Pending
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Completed
          </button>
        </div>
      </div>
      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="space-y-4">
          {tasks.map(task => <CareTask key={task.id} task={task} onClick={() => navigateTo('task-detail', task)} />)}
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <ActivityFeed activities={activities} />
        </div>
      </div>
      {/* Voice Record Button */}
      <div className="p-6 border-t border-gray-200 flex justify-center">
        <button className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg" onClick={() => navigateTo('voice-input')}>
          <MicIcon className="w-8 h-8 text-white" />
        </button>
      </div>
      {/* Bottom Navigation */}
      <div className="flex justify-around border-t border-gray-200 py-4 px-6 bg-white">
        <button className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className="text-xs mt-1 text-blue-500 font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span className="text-xs mt-1 text-gray-500">Team</span>
        </button>
        <div className="w-16"></div> {/* Placeholder for mic button */}
        <button className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <span className="text-xs mt-1 text-gray-500">Notes</span>
        </button>
        <button className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span className="text-xs mt-1 text-gray-500">Help</span>
        </button>
      </div>
    </div>;
};