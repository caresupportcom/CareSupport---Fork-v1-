import React, { useState } from 'react';
import { ArrowLeftIcon, MessageCircleIcon, AlertTriangleIcon, CheckCircleIcon, ClockIcon, UserIcon, CalendarIcon, XIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { StatusBadge } from '../Common/StatusBadge';
import { ConflictTag } from '../Common/ConflictTag';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { useCalendar } from '../../contexts/CalendarContext';
const defaultTask = {
  id: 1,
  title: 'Give medication',
  description: 'Administer 10mg of medication with food',
  status: 'pending',
  dueTime: '9:00 AM',
  hasConflict: true,
  assignedTo: 'James',
  createdBy: 'Maria',
  comments: [{
    id: 1,
    user: 'Linda',
    text: 'This conflicts with the other medication scheduled at the same time.',
    time: '30 minutes ago',
    isConflict: true
  }, {
    id: 2,
    user: 'Maria',
    text: "I'll check with the doctor about this.",
    time: '15 minutes ago'
  }]
};
export const TaskDetailScreen = ({
  task: initialTask,
  onBack,
  navigateTo
}) => {
  const {
    setCurrentView,
    toggleTaskCompletion,
    isTaskCompleted
  } = useCalendar();
  const [task, setTask] = useState(() => {
    if (!initialTask) return defaultTask;
    return {
      ...defaultTask,
      ...initialTask,
      comments: initialTask.comments || defaultTask.comments
    };
  });
  const [newComment, setNewComment] = useState('');
  // Modal states for reschedule and reassign
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  // Team members for reassignment
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
  }];
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      user: 'You',
      text: newComment,
      time: 'Just now'
    };
    setTask({
      ...task,
      comments: [...task.comments, comment]
    });
    setNewComment('');
  };
  const handleComplete = () => {
    // Use the shared context method to toggle completion status
    toggleTaskCompletion(task.id);
    // Also update the local task state
    setTask({
      ...task,
      status: isTaskCompleted(task.id) ? 'completed' : 'pending'
    });
    analytics.trackEvent(AnalyticsEvents.TASK_COMPLETED, {
      task_id: task.id,
      from_screen: 'task_detail'
    });
  };
  // Function to open reschedule modal
  const handleOpenReschedule = () => {
    // Set default values to today and now
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setRescheduleDate(dateStr);
    setRescheduleTime(timeStr);
    setShowRescheduleModal(true);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'reschedule_opened',
      task_id: task.id,
      from_screen: 'task_detail'
    });
  };
  // Function to handle reschedule submission
  const handleReschedule = () => {
    if (!rescheduleDate || !rescheduleTime) return;
    // Convert 24h time to 12h time format for display
    const timeParts = rescheduleTime.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const formattedTime = `${hours12}:${minutes} ${period}`;
    setTask({
      ...task,
      dueTime: formattedTime
    });
    setShowRescheduleModal(false);
    analytics.trackEvent(AnalyticsEvents.TASK_UPDATED, {
      task_id: task.id,
      update_type: 'reschedule',
      new_time: formattedTime,
      from_screen: 'task_detail'
    });
  };
  // Function to open reassign modal
  const handleOpenReassign = () => {
    setShowReassignModal(true);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'reassign_opened',
      task_id: task.id,
      from_screen: 'task_detail'
    });
  };
  // Function to handle reassign submission
  const handleReassign = memberId => {
    const memberName = teamMembers.find(m => m.id === memberId)?.name;
    setTask({
      ...task,
      assignedTo: memberName
    });
    setShowReassignModal(false);
    analytics.trackEvent(AnalyticsEvents.TASK_UPDATED, {
      task_id: task.id,
      update_type: 'reassign',
      assigned_to: memberName,
      from_screen: 'task_detail'
    });
  };
  const getStatusBadge = () => {
    if (task.status === 'completed') {
      return <StatusBadge status="success">Completed</StatusBadge>;
    } else {
      return <StatusBadge status="info">Pending</StatusBadge>;
    }
  };
  const handleResolveConflict = () => {
    // Navigate to conflict resolution screen
    if (typeof navigateTo === 'function') {
      navigateTo('resolve-conflict', task);
    }
  };
  const handleBack = () => {
    // If this is a calendar event and we should return to schedule
    if (task.returnScreen === 'schedule' && task.returnView) {
      // Set the calendar view to what it was before
      setCurrentView(task.returnView);
      // Navigate back to the schedule screen
      navigateTo('schedule');
    } else {
      // Default behavior - go back to today screen
      onBack();
    }
  };
  // Determine if this is a calendar event
  const isCalendarEvent = task.startTime && task.endTime && task.category;
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={handleBack} className="mr-4">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">
          {isCalendarEvent ? 'Event Details' : 'Task Details'}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className={`p-4 rounded-xl border ${task.hasConflict ? 'border-orange-300 bg-orange-50' : isTaskCompleted(task.id) ? 'border-green-300 bg-green-50' : 'border-gray-200'} mb-6`}>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-medium">{task.title}</h2>
            <div className="flex items-center">
              {task.hasConflict ? <ConflictTag /> : getStatusBadge()}
            </div>
          </div>
          <p className="text-gray-600 mb-4">{task.description}</p>
          <div className="flex justify-between text-sm text-gray-500 mb-3">
            <BracketText>Due: {task.dueTime}</BracketText>
            <BracketText>Created by: {task.createdBy}</BracketText>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <span className="text-xs text-blue-600 font-medium">
                {task.assignedTo.charAt(0)}
              </span>
            </div>
            <BracketText className="text-sm">
              Assigned to {task.assignedTo}
            </BracketText>
          </div>

          {/* Action buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <Button variant={isTaskCompleted(task.id) ? 'success' : 'secondary'} onClick={handleComplete} size="sm">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                {isTaskCompleted(task.id) ? 'Completed' : 'Complete'}
              </Button>
              <Button variant="secondary" onClick={handleOpenReschedule} size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button variant="secondary" onClick={handleOpenReassign} size="sm">
                <UserIcon className="w-4 h-4 mr-2" />
                Reassign
              </Button>
            </div>
            {task.hasConflict && <div className="mt-3">
                <Button variant="warning" onClick={handleResolveConflict} size="sm" className="w-full">
                  <AlertTriangleIcon className="w-4 h-4 mr-2" />
                  <BracketText className="text-orange-600">
                    Resolve Conflict
                  </BracketText>
                </Button>
              </div>}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3">Comments & Conflicts</h3>
          <div className="space-y-4">
            {task.comments.map(comment => <div key={comment.id} className={`p-4 rounded-xl ${comment.isConflict ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{comment.user}</div>
                    <div className="text-xs text-gray-500">{comment.time}</div>
                  </div>
                  {comment.isConflict && <div className="ml-auto">
                      <StatusBadge status="warning">Conflict</StatusBadge>
                    </div>}
                </div>
                <p className="text-sm text-gray-700">{comment.text}</p>
              </div>)}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3">Add Comment</h3>
          <div className="flex">
            <input type="text" className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type your comment..." value={newComment} onChange={e => setNewComment(e.target.value)} />
            <button className="bg-blue-500 text-white px-4 rounded-r-lg" onClick={handleAddComment}>
              <MessageCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reschedule Task</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <XIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input type="time" className="w-full border border-gray-300 rounded-lg px-4 py-2" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} />
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowRescheduleModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700">
                Cancel
              </button>
              <button onClick={handleReschedule} className="flex-1 py-2 bg-blue-500 text-white rounded-lg" disabled={!rescheduleDate || !rescheduleTime}>
                Reschedule
              </button>
            </div>
          </div>
        </div>}

      {/* Reassign Modal */}
      {showReassignModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reassign Task</h3>
              <button onClick={() => setShowReassignModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <XIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              {teamMembers.map(member => <button key={member.id} className="w-full p-3 rounded-lg border border-gray-200 flex items-center hover:bg-gray-50" onClick={() => handleReassign(member.id)}>
                  <div className={`w-8 h-8 rounded-full bg-${member.color}-100 flex items-center justify-center mr-3`}>
                    <span className={`text-xs text-${member.color}-600 font-medium`}>
                      {member.initial}
                    </span>
                  </div>
                  <span className="font-medium">{member.name}</span>
                </button>)}
            </div>
            <button onClick={() => setShowReassignModal(false)} className="w-full py-2 border border-gray-300 rounded-lg text-gray-700">
              Cancel
            </button>
          </div>
        </div>}
    </div>;
};