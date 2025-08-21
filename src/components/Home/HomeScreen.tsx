import React, { useEffect, useState } from 'react';
import { BellIcon, AlertTriangleIcon, CheckCircleIcon, ClockIcon, WifiOffIcon, SunIcon, SunriseIcon, MoonIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon, CheckIcon, CalendarIcon, UserIcon, XIcon, HeartIcon, ShieldIcon, UsersIcon, HomeIcon, InfoIcon, StarIcon, CalendarDaysIcon, Calendar as CalendarIcon2, ChevronLeftIcon } from 'lucide-react';
import { CareTask } from '../Dashboard/CareTask';
import { BracketText } from '../Common/BracketText';
import { offlineService } from '../../services/OfflineService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { Button } from '../Common/Button';
import { notificationService } from '../../services/NotificationService';
import { storage } from '../../services/StorageService';
import { useCalendar } from '../../contexts/CalendarContext';
import { dataService, CareTask as CareTaskType, TeamMember } from '../../services/DataService';
import { recommendationService } from '../../services/RecommendationService';
import { getUserCircleType, getRelationshipDisplayName } from '../../types/UserTypes';
import { DayView } from '../Schedule/DayView';
import { WeekView } from '../Schedule/WeekView';
import { MonthView } from '../Schedule/MonthView';
export const HomeScreen = ({
  navigateTo
}) => {
  const {
    toggleTaskCompletion,
    isTaskCompleted,
    getEventsForDate
  } = useCalendar();
  const [tasks, setTasks] = useState<CareTaskType[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isOffline, setIsOffline] = useState(!offlineService.isNetworkOnline());
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedSections, setExpandedSections] = useState({
    morning: true,
    afternoon: true,
    evening: true
  });
  // New state for time scale functionality
  const [viewMode, setViewMode] = useState('day'); // 'day', '3-day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  // Recommended tasks state
  const [recommendedTasks, setRecommendedTasks] = useState([]);
  // User role state
  const [userRole, setUserRole] = useState('');
  const [userRelationship, setUserRelationship] = useState('');
  const [userCircle, setUserCircle] = useState('');
  // Function to handle task completion directly from the list
  const handleCompleteTask = taskId => {
    // Get the current completion status before toggling
    const isCurrentlyCompleted = isTaskCompleted(taskId);
    // Toggle the completion status
    toggleTaskCompletion(taskId);
    // Update the local tasks state with the NEW status (opposite of current)
    setTasks(tasks.map(task => task.id === taskId ? {
      ...task,
      status: isCurrentlyCompleted ? 'pending' : 'completed'
    } : task));
    // Show a toast notification for better feedback
    notificationService.addNotification({
      type: 'task',
      title: isCurrentlyCompleted ? 'Task Marked Incomplete' : 'Task Completed',
      message: isCurrentlyCompleted ? `Task has been marked as pending` : `Task has been marked as completed`,
      priority: 'low'
    });
    // Track the event with the new status
    analytics.trackEvent(AnalyticsEvents.TASK_COMPLETED, {
      task_id: taskId,
      from_screen: 'home',
      new_status: isCurrentlyCompleted ? 'pending' : 'completed'
    });
  };
  // Function to handle filter changes
  const handleFilterChange = filter => {
    setActiveFilter(filter);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'task_filter_changed',
      filter: filter
    });
  };
  // Function to handle time scale changes
  const handleTimeScaleChange = scale => {
    setViewMode(scale);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'home_time_scale_changed',
      new_scale: scale,
      previous_scale: viewMode
    });
  };
  // Navigation functions for different time scales
  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() - 1);
    } else if (viewMode === '3-day') {
      newDate.setDate(selectedDate.getDate() - 3);
    } else if (viewMode === 'week') {
      newDate.setDate(selectedDate.getDate() - 7);
    } else {
      newDate.setMonth(selectedDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'home_navigation',
      direction: 'previous',
      time_scale: viewMode
    });
  };
  const goToNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + 1);
    } else if (viewMode === '3-day') {
      newDate.setDate(selectedDate.getDate() + 3);
    } else if (viewMode === 'week') {
      newDate.setDate(selectedDate.getDate() + 7);
    } else {
      newDate.setMonth(selectedDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'home_navigation',
      direction: 'next',
      time_scale: viewMode
    });
  };
  const goToToday = () => {
    setSelectedDate(new Date());
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'home_navigation',
      action: 'go_to_today',
      time_scale: viewMode
    });
  };
  // Check if a date is today
  const isToday = date => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  // Format the date for display
  const formatDate = date => {
    if (viewMode === 'day') {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    } else if (viewMode === '3-day') {
      const endOfPeriod = new Date(date);
      endOfPeriod.setDate(date.getDate() + 2);
      return `${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${endOfPeriod.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })}`;
    } else if (viewMode === 'week') {
      const endOfWeek = new Date(date);
      endOfWeek.setDate(date.getDate() + 6);
      return `${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${endOfWeek.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }
  };
  // Function to open reschedule modal
  const handleOpenReschedule = (taskId, e) => {
    e.stopPropagation();
    setSelectedTaskId(taskId);
    // Get the task
    const task = tasks.find(t => t.id === taskId);
    // Set default values to the task's date and time
    const now = new Date();
    const dateStr = task?.dueDate || now.toISOString().split('T')[0];
    // Parse the time from 12-hour format to 24-hour format
    let timeStr = '';
    if (task?.dueTime) {
      const timeParts = task.dueTime.match(/(\d+):(\d+)\s*([AP]M)/);
      if (timeParts) {
        let hours = parseInt(timeParts[1]);
        const minutes = timeParts[2];
        const period = timeParts[3];
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        timeStr = `${String(hours).padStart(2, '0')}:${minutes}`;
      }
    }
    if (!timeStr) {
      timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    setRescheduleDate(dateStr);
    setRescheduleTime(timeStr);
    setShowRescheduleModal(true);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'quick_reschedule_opened',
      task_id: taskId
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
    // Update the task in our local state
    setTasks(tasks.map(task => task.id === selectedTaskId ? {
      ...task,
      dueTime: formattedTime,
      dueDate: rescheduleDate
    } : task));
    // Also update in storage
    const allTasks = dataService.getTasks();
    const updatedTasks = allTasks.map(task => task.id === selectedTaskId ? {
      ...task,
      dueTime: formattedTime,
      dueDate: rescheduleDate
    } : task);
    storage.save('tasks', updatedTasks);
    setShowRescheduleModal(false);
    analytics.trackEvent(AnalyticsEvents.TASK_UPDATED, {
      task_id: selectedTaskId,
      update_type: 'reschedule',
      new_time: formattedTime,
      new_date: rescheduleDate
    });
  };
  // Function to open reassign modal
  const handleOpenReassign = (taskId, e) => {
    e.stopPropagation();
    setSelectedTaskId(taskId);
    setShowReassignModal(true);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'quick_reassign_opened',
      task_id: taskId
    });
  };
  // Function to handle reassign submission
  const handleReassign = memberId => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    // Update the task in our local state
    setTasks(tasks.map(task => task.id === selectedTaskId ? {
      ...task,
      assignedTo: memberId
    } : task));
    // Also update in storage
    const allTasks = dataService.getTasks();
    const updatedTasks = allTasks.map(task => task.id === selectedTaskId ? {
      ...task,
      assignedTo: memberId
    } : task);
    storage.save('tasks', updatedTasks);
    setShowReassignModal(false);
    analytics.trackEvent(AnalyticsEvents.TASK_UPDATED, {
      task_id: selectedTaskId,
      update_type: 'reassign',
      assigned_to: memberId
    });
  };
  // Toggle section expansion
  const toggleSection = section => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  // Handle item click for schedule views
  const handleItemClick = item => {
    navigateTo('task-detail', item);
  };
  // Handle time slot click for quick add
  const handleTimeSlotClick = timeSlot => {
    navigateTo('create-task');
  };
  useEffect(() => {
    // Initialize data
    dataService.initializeData();
    // Load user role data
    const userData = storage.get('user_data', {});
    const storedRole = storage.get('user_role', 'family');
    setUserRole(storedRole);
    if (userData && userData.relationship) {
      setUserRelationship(userData.relationship);
      setUserCircle(getUserCircleType(userData.relationship));
    }
    // Load tasks from the data service
    const loadTasks = () => {
      const online = offlineService.isNetworkOnline();
      setIsOffline(!online);
      // Get today's tasks from the data service
      const todayTasks = dataService.getTodayTasks();
      setTasks(todayTasks);
      // Get team members
      setTeamMembers(dataService.getTeamMembers());
    };
    loadTasks();
    // Load recommended tasks based on user role
    const userId = storage.get('user_id', '');
    if (storedRole === 'community') {
      const recommended = recommendationService.getRecommendedTasks(userId);
      setRecommendedTasks(recommended);
    }
    // Subscribe to connection status changes
    const unsubscribe = offlineService.subscribeToConnectionChanges(online => {
      setIsOffline(!online);
      loadTasks();
    });
    // Load saved time scale preference if available
    const savedTimeScale = storage.get('home_preferred_time_scale', 'day');
    setViewMode(savedTimeScale);
    return () => {
      unsubscribe();
    };
  }, []);
  // Save time scale preference when it changes
  useEffect(() => {
    storage.save('home_preferred_time_scale', viewMode);
  }, [viewMode]);
  // Filter tasks based on active filter
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return task.status === 'pending';
    if (activeFilter === 'completed') return task.status === 'completed';
    return true;
  });
  // Group tasks by time of day
  const groupTasksByTime = tasks => {
    const morning = [];
    const afternoon = [];
    const evening = [];
    tasks.forEach(task => {
      const timeStr = task.dueTime;
      const hour = parseInt(timeStr.split(':')[0]);
      const isPM = timeStr.includes('PM');
      // Convert to 24-hour time for easier comparison
      const hour24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;
      if (hour24 < 12) {
        morning.push(task);
      } else if (hour24 < 17) {
        afternoon.push(task);
      } else {
        evening.push(task);
      }
    });
    return {
      morning,
      afternoon,
      evening
    };
  };
  const {
    morning,
    afternoon,
    evening
  } = groupTasksByTime(filteredTasks);
  // Calculate task completion stats
  const completedTasks = tasks.filter(task => isTaskCompleted(task.id) || task.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
  // Get team member name by ID
  const getTeamMemberName = id => {
    const member = teamMembers.find(m => m.id === id);
    return member ? member.name : id;
  };
  // Calculate the start date of the week (Sunday)
  const getStartOfWeek = date => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Set to Sunday
    return startOfWeek;
  };
  // Calculate the start date of the month
  const getStartOfMonth = date => {
    const startOfMonth = new Date(date);
    startOfMonth.setDate(1);
    return startOfMonth;
  };
  // Render a task with quick actions
  const renderTaskWithActions = task => <div key={task.id} className="relative mb-4">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
        {/* Time indicator at the top with rounded corners that match the card */}
        <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center">
            <ClockIcon className="w-3.5 h-3.5 text-gray-500 mr-1.5" />
            <span className="text-sm font-medium text-gray-700">
              {task.dueTime}
            </span>
          </div>
          {/* Priority indicator moved to header */}
          {task.priority && <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
              {task.priority}
            </span>}
        </div>
        {/* Task content with action buttons */}
        <CareTask task={{
        ...task,
        status: isTaskCompleted(task.id) ? 'completed' : task.status,
        assignedToName: getTeamMemberName(task.assignedTo),
        createdByName: getTeamMemberName(task.createdBy)
      }} onClick={() => navigateTo('task-detail', task)} className="rounded-t-none">
          <div className="flex">
            <button onClick={e => {
            e.stopPropagation();
            handleCompleteTask(task.id);
          }} className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${isTaskCompleted(task.id) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`} aria-label={isTaskCompleted(task.id) ? 'Mark as pending' : 'Mark as completed'}>
              <CheckIcon className="w-4 h-4" />
            </button>
            <button onClick={e => handleOpenReschedule(task.id, e)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2" aria-label="Reschedule">
              <CalendarIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={e => handleOpenReassign(task.id, e)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" aria-label="Reassign">
              <UserIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </CareTask>
      </div>
    </div>;
  // Render a time section
  const renderTimeSection = (title, tasks, icon, sectionKey) => {
    if (tasks.length === 0) return null;
    return <div className="mb-6">
        <button className="flex items-center justify-between w-full mb-2" onClick={() => toggleSection(sectionKey)}>
          <div className="flex items-center">
            {icon}
            <h2 className="text-lg font-semibold ml-2">{title}</h2>
            <span className="ml-2 text-sm text-gray-500">({tasks.length})</span>
          </div>
          {expandedSections[sectionKey] ? <ChevronDownIcon className="w-5 h-5 text-gray-500" /> : <ChevronRightIcon className="w-5 h-5 text-gray-500" />}
        </button>
        {expandedSections[sectionKey] && <div className="space-y-4">
            {tasks.map(task => renderTaskWithActions(task))}
          </div>}
      </div>;
  };
  // Get the currently on-duty team member
  const getOnDutyMember = () => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', {
      weekday: 'long'
    });
    // Find a team member available today
    const availableMember = teamMembers.find(member => member.availability?.includes(dayOfWeek));
    return availableMember ? availableMember.name : 'No one';
  };
  // Render role-specific welcome message
  const renderWelcomeMessage = () => {
    const userName = storage.get('user_name', 'User');
    const firstName = userName.split(' ')[0];
    // Get current time of day for greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    switch (userRole) {
      case 'family':
        return <div className="mb-4">
            <h1 className="text-2xl font-bold mb-1">
              {greeting}, {firstName}
            </h1>
            <p className="text-gray-600">Your family care dashboard</p>
          </div>;
      case 'professional':
        return <div className="mb-4">
            <h1 className="text-2xl font-bold mb-1">
              {greeting}, {firstName}
            </h1>
            <p className="text-gray-600">Professional care dashboard</p>
          </div>;
      case 'community':
        return <div className="mb-4">
            <h1 className="text-2xl font-bold mb-1">
              {greeting}, {firstName}
            </h1>
            <p className="text-gray-600">Community support dashboard</p>
          </div>;
      case 'coordinator':
        return <div className="mb-4">
            <h1 className="text-2xl font-bold mb-1">
              {greeting}, {firstName}
            </h1>
            <p className="text-gray-600">Care coordination dashboard</p>
          </div>;
      case 'care_recipient':
        return <div className="mb-4">
            <h1 className="text-2xl font-bold mb-1">
              {greeting}, {firstName}
            </h1>
            <p className="text-gray-600">Your personal care dashboard</p>
          </div>;
      default:
        return <div className="mb-4">
            <h1 className="text-2xl font-bold mb-1">{greeting}</h1>
            <p className="text-gray-600">Your care dashboard</p>
          </div>;
    }
  };
  // Render role-specific status card
  const renderRoleStatusCard = () => {
    switch (userRole) {
      case 'family':
        return <div className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center mb-2">
              <HeartIcon className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium text-blue-800">
                Family Caregiver
              </h2>
            </div>
            <div className="flex justify-between items-center">
              <BracketText className="text-blue-600">
                On Duty: {getOnDutyMember()}
              </BracketText>
              <button onClick={() => navigateTo('care-recipient')} className="text-sm font-medium text-blue-600">
                View Care Plan
              </button>
            </div>
          </div>;
      case 'professional':
        // Get the current shift information
        const now = new Date();
        const currentTime = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
        const shiftEnd = '18:00'; // Example shift end time
        return <div className="mb-4 bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center mb-2">
              <UserIcon className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-medium text-green-800">
                Professional Caregiver
              </h2>
            </div>
            <div className="flex justify-between items-center">
              <BracketText className="text-green-600">
                Shift: {currentTime} - {shiftEnd}
              </BracketText>
              <button onClick={() => navigateTo('schedule')} className="text-sm font-medium text-green-600">
                View Schedule
              </button>
            </div>
          </div>;
      case 'community':
        return <div className="mb-4 bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center mb-2">
              <UsersIcon className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-medium text-purple-800">
                Community Supporter
              </h2>
            </div>
            <div className="flex justify-between items-center">
              <BracketText className="text-purple-600">
                Support Network: {teamMembers.length} members
              </BracketText>
              <button onClick={() => navigateTo('help-needed')} className="text-sm font-medium text-purple-600">
                View Opportunities
              </button>
            </div>
          </div>;
      case 'coordinator':
        // Count any tasks with conflicts
        const conflictTasks = tasks.filter(task => task.hasConflict).length;
        return <div className="mb-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center mb-2">
              <ShieldIcon className="w-5 h-5 text-yellow-600 mr-2" />
              <h2 className="text-lg font-medium text-yellow-800">
                Care Coordinator
              </h2>
            </div>
            <div className="flex justify-between items-center">
              <BracketText className="text-yellow-600">
                {conflictTasks > 0 ? `${conflictTasks} conflicts to resolve` : 'No schedule conflicts'}
              </BracketText>
              <button onClick={() => navigateTo('care-network')} className="text-sm font-medium text-yellow-600">
                View Care Network
              </button>
            </div>
          </div>;
      case 'care_recipient':
        return null;
      default:
        return <div className="mb-4">
            <div className="flex justify-between items-center">
              <BracketText className="text-green-600">
                On Duty: {getOnDutyMember()}
              </BracketText>
            </div>
          </div>;
    }
  };
  // Render role-specific quick actions
  const renderQuickActions = () => {
    switch (userRole) {
      case 'family':
        return <div className="mb-6 grid grid-cols-2 gap-3">
            <button onClick={() => navigateTo('create-task')} className="py-3 px-4 bg-blue-500 text-white rounded-lg flex items-center justify-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>Add Task</span>
            </button>
            <button onClick={() => navigateTo('send-update')} className="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center">
              <InfoIcon className="w-4 h-4 mr-2" />
              <span>Send Update</span>
            </button>
          </div>;
      case 'professional':
        return <div className="mb-6 grid grid-cols-2 gap-3">
            <button onClick={() => navigateTo('create-task')} className="py-3 px-4 bg-blue-500 text-white rounded-lg flex items-center justify-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>Add Task</span>
            </button>
            <button onClick={() => navigateTo('medication-reminder')} className="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              <span>Medications</span>
            </button>
          </div>;
      case 'community':
        return <div className="mb-6 grid grid-cols-2 gap-3">
            <button onClick={() => navigateTo('create-task')} className="py-3 px-4 bg-blue-500 text-white rounded-lg flex items-center justify-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>Add Task</span>
            </button>
            <button onClick={() => navigateTo('help-needed')} className="py-3 px-4 bg-purple-500 text-white rounded-lg flex items-center justify-center">
              <UsersIcon className="w-4 h-4 mr-2" />
              <span>Help Needed</span>
            </button>
          </div>;
      case 'coordinator':
        return <div className="mb-6 grid grid-cols-2 gap-3">
            <button onClick={() => navigateTo('create-task')} className="py-3 px-4 bg-blue-500 text-white rounded-lg flex items-center justify-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>Add Task</span>
            </button>
            <button onClick={() => navigateTo('send-alert')} className="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center">
              <AlertTriangleIcon className="w-4 h-4 mr-2" />
              <span>Send Alert</span>
            </button>
          </div>;
      case 'care_recipient':
        return <div className="mb-6 grid grid-cols-2 gap-3">
            <button onClick={() => navigateTo('create-task')} className="py-3 px-4 bg-blue-500 text-white rounded-lg flex items-center justify-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>Add Task</span>
            </button>
            <button onClick={() => navigateTo('create-help-request')} className="py-3 px-4 bg-blue-500 text-white rounded-lg flex items-center justify-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>Request Help</span>
            </button>
          </div>;
      default:
        return <div className="mb-6 grid grid-cols-2 gap-3">
            <button onClick={() => navigateTo('create-task')} className="py-3 px-4 bg-blue-500 text-white rounded-lg flex items-center justify-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>Add Task</span>
            </button>
            <button onClick={() => navigateTo('create-task')} className="py-3 px-4 bg-blue-500 text-white rounded-lg flex items-center justify-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>Add Task</span>
            </button>
          </div>;
    }
  };
  // Render community supporter recommended tasks
  const renderCommunityRecommendations = () => {
    if (userRole !== 'community' || recommendedTasks.length === 0) return null;
    return <div className="mt-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Help Needed</h2>
          <button className="text-sm text-purple-600 font-medium" onClick={() => navigateTo('help-needed')}>
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recommendedTasks.map(request => <div key={request.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3" onClick={() => navigateTo('help-request-detail', request)}>
              <h3 className="font-medium text-purple-800">{request.title}</h3>
              <p className="text-sm text-purple-700 line-clamp-1 mb-2">
                {request.description}
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-purple-600">
                  {new Date(request.dueDate).toLocaleDateString()}{' '}
                  {request.dueTime ? formatTime(request.dueTime) : ''}
                </span>
                <button className="font-medium text-purple-700">
                  I Can Help
                </button>
              </div>
            </div>)}
        </div>
      </div>;
  };
  // Render coordinator-specific conflicts section
  const renderCoordinatorConflicts = () => {
    if (userRole !== 'coordinator') return null;
    const conflictTasks = tasks.filter(task => task.hasConflict);
    if (conflictTasks.length === 0) return null;
    return <div className="mt-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Schedule Conflicts</h2>
        </div>
        <div className="space-y-3">
          {conflictTasks.map(task => <div key={task.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3" onClick={() => navigateTo('task-detail', task)}>
              <div className="flex items-start">
                <AlertTriangleIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">{task.title}</h3>
                  <p className="text-sm text-yellow-700 line-clamp-1 mb-2">
                    Conflict with another scheduled task
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-yellow-600">
                  {task.dueTime} - Assigned to{' '}
                  {getTeamMemberName(task.assignedTo)}
                </span>
                <button className="font-medium text-yellow-700">Resolve</button>
              </div>
            </div>)}
        </div>
      </div>;
  };
  // Render professional-specific patient info
  const renderPatientInfo = () => {
    if (userRole !== 'professional') return null;
    const patient = dataService.getPatient();
    if (!patient) return null;
    return <div className="mt-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Patient Information</h2>
          <button className="text-sm text-green-600 font-medium" onClick={() => navigateTo('care-recipient')}>
            View Details
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between">
              <h3 className="font-medium">{patient.name}</h3>
              <span className="text-sm text-gray-500">{patient.age} years</span>
            </div>
          </div>
          <div className="p-4">
            <h4 className="text-sm font-medium mb-2">Medical Conditions</h4>
            <div className="flex flex-wrap gap-2">
              {patient.conditions.map((condition, index) => <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {condition}
                </span>)}
            </div>
          </div>
        </div>
      </div>;
  };
  // Render the appropriate view based on time scale
  const renderTimeScaleView = () => {
    if (viewMode === 'day') {
      return <>
          {renderTimeSection('Morning', morning, <SunriseIcon className="w-5 h-5 text-orange-500" />, 'morning')}
          {renderTimeSection('Afternoon', afternoon, <SunIcon className="w-5 h-5 text-yellow-500" />, 'afternoon')}
          {renderTimeSection('Evening', evening, <MoonIcon className="w-5 h-5 text-blue-500" />, 'evening')}
        </>;
    } else if (viewMode === '3-day') {
      // For 3-day view, we'll adapt part of the week view
      // Create a date range for 3 days
      const dates = [];
      const startDate = new Date(selectedDate);
      for (let i = 0; i < 3; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }
      return <div className="space-y-4">
          {dates.map(date => {
          const dateStr = date.toISOString().split('T')[0];
          const dateEvents = getEventsForDate(dateStr);
          const isToday = new Date().toDateString() === date.toDateString();
          return <div key={dateStr} className={`border rounded-lg p-4 ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                <h3 className={`text-lg font-medium mb-3 ${isToday ? 'text-blue-700' : ''}`}>
                  {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
                </h3>
                {dateEvents.length === 0 ? <div className="text-center py-4 text-gray-500">
                    <p>No tasks scheduled</p>
                    <div className="mt-2 flex justify-center space-x-2">
                      <button onClick={() => navigateTo('create-task')} className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-lg bg-blue-50 inline-flex items-center">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Task
                      </button>
                      <button onClick={() => navigateTo('create-help-request')} className="px-3 py-1 text-sm text-purple-600 border border-purple-300 rounded-lg bg-purple-50 inline-flex items-center">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Request Help
                      </button>
                    </div>
                  </div> : <div className="space-y-3">
                    {dateEvents.map(event => <div key={event.id} className="p-3 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50" onClick={() => handleItemClick(event)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {formatTime(event.startTime)}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <button onClick={e => {
                      e.stopPropagation();
                      toggleTaskCompletion(event.id);
                    }} className={`w-7 h-7 rounded-full flex items-center justify-center ${isTaskCompleted(event.id) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                              <CheckIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>)}
                  </div>}
              </div>;
        })}
        </div>;
    } else if (viewMode === 'week') {
      return <WeekView startDate={getStartOfWeek(selectedDate)} onItemClick={handleItemClick} onTimeSlotClick={handleTimeSlotClick} activeFilter={activeFilter} />;
    } else if (viewMode === 'month') {
      return <MonthView startDate={getStartOfMonth(selectedDate)} onItemClick={handleItemClick} onDateClick={date => {
        setSelectedDate(date);
        setViewMode('day');
      }} activeFilter={activeFilter} />;
    }
  };
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          {renderWelcomeMessage()}
          <div className="flex space-x-4">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative" onClick={() => navigateTo('notifications')} aria-label="View notifications">
              <BellIcon className="w-5 h-5 text-gray-600" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
        {/* Role-specific status card */}
        {renderRoleStatusCard()}
        {/* Task Progress */}
        <div className="mb-4 bg-white p-3 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-sm font-medium">Today's Progress</h2>
            <span className="text-sm font-medium">
              {completedTasks}/{totalTasks} complete
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-green-500 rounded-full" style={{
            width: `${completionPercentage}%`
          }}></div>
          </div>
          <div className="flex space-x-2 pt-1">
            <button onClick={() => handleFilterChange('all')} className={`px-3 py-1 rounded-full text-xs font-medium ${activeFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              All Tasks
            </button>
            <button onClick={() => handleFilterChange('pending')} className={`px-3 py-1 rounded-full text-xs font-medium ${activeFilter === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              Pending
            </button>
            <button onClick={() => handleFilterChange('completed')} className={`px-3 py-1 rounded-full text-xs font-medium ${activeFilter === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              Completed
            </button>
          </div>
        </div>
        {/* Time Scale Selector */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button onClick={() => handleTimeScaleChange('day')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center ${viewMode === 'day' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              <ClockIcon className="w-4 h-4 mr-1.5" />
              Day
            </button>
            <button onClick={() => handleTimeScaleChange('3-day')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center ${viewMode === '3-day' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              <CalendarIcon className="w-4 h-4 mr-1.5" />3 Days
            </button>
            <button onClick={() => handleTimeScaleChange('week')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center ${viewMode === 'week' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              <CalendarDaysIcon className="w-4 h-4 mr-1.5" />
              Week
            </button>
            <button onClick={() => handleTimeScaleChange('month')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center ${viewMode === 'month' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              <CalendarIcon2 className="w-4 h-4 mr-1.5" />
              Month
            </button>
          </div>
        </div>
        {/* Date Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={goToPrevious} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" aria-label="Previous">
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold">{formatDate(selectedDate)}</h2>
          <button onClick={goToNext} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" aria-label="Next">
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {/* Role-specific quick actions */}
        {renderQuickActions()}
        {/* Offline indicator */}
        <div className="mb-3 flex justify-end items-center">
          {isOffline && <div className="flex items-center text-orange-500 text-sm">
              <WifiOffIcon className="w-4 h-4 mr-1" />
              <span>Offline Mode</span>
            </div>}
        </div>
      </div>
      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {filteredTasks.length === 0 && viewMode === 'day' ? <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ClockIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {activeFilter === 'completed' ? 'No completed tasks yet' : activeFilter === 'pending' ? 'No pending tasks' : 'No tasks for today'}
            </h3>
            <p className="text-gray-500 mb-4">
              {activeFilter === 'completed' ? 'Complete some tasks to see them here' : activeFilter === 'pending' ? 'All tasks are completed!' : 'Add a task to get started'}
            </p>
            <Button onClick={() => navigateTo('create-task')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div> : renderTimeScaleView()}
        {/* Role-specific sections */}
        {renderCommunityRecommendations()}
        {renderCoordinatorConflicts()}
        {renderPatientInfo()}
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
// Helper function to format time
const formatTime = timeStr => {
  if (!timeStr) return '';
  // Handle 24-hour format
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  }
  return timeStr;
};