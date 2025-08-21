import React, { useEffect, useState } from 'react';
import { ClockIcon, CheckCircleIcon, AlertCircleIcon, UserIcon, CalendarIcon, ClipboardIcon, MessageCircleIcon, HandIcon } from 'lucide-react';
import { shiftService } from '../../../services/ShiftService';
import { dataService } from '../../../services/DataService';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';
import { storage } from '../../../services/StorageService';
interface CaregiverDashboardProps {
  navigateTo: (screen: string, data?: any) => void;
}
export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  navigateTo
}) => {
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [todayShift, setTodayShift] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [handoffNotes, setHandoffNotes] = useState([]);
  const [teamOnDuty, setTeamOnDuty] = useState([]);
  const userId = storage.get('user_id', '');
  useEffect(() => {
    loadDashboardData();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'caregiver_dashboard_viewed'
    });
  }, []);
  const loadDashboardData = () => {
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    // Load upcoming shifts for this caregiver
    const shifts = shiftService.getUpcomingShiftsForCaregiver(userId, 5);
    setUpcomingShifts(shifts);
    // Find today's shift if any
    const todayShifts = shifts.filter(shift => shift.date === todayStr);
    if (todayShifts.length > 0) {
      // Sort by start time and get the first one
      todayShifts.sort((a, b) => {
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      });
      setTodayShift(todayShifts[0]);
      // Load tasks for this shift
      setTasks(dataService.getTasksForShift(todayShifts[0].id) || []);
    }
    // Load handoff notes (from previous shifts)
    const previousShifts = shiftService.getShifts().filter(shift => shift.date < todayStr && shift.handoffNotes).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    setHandoffNotes(previousShifts);
    // Get team members on duty today
    const teamShifts = shiftService.getShiftsForDate(todayStr).filter(shift => shift.assignedTo && shift.assignedTo !== userId);
    const uniqueTeamMembers = [];
    const memberIds = new Set();
    teamShifts.forEach(shift => {
      if (shift.assignedTo && !memberIds.has(shift.assignedTo)) {
        memberIds.add(shift.assignedTo);
        const member = dataService.getTeamMemberById(shift.assignedTo);
        if (member) {
          uniqueTeamMembers.push({
            ...member,
            shift
          });
        }
      }
    });
    setTeamOnDuty(uniqueTeamMembers);
  };
  // Helper to convert time to minutes for sorting
  const timeToMinutes = timeString => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };
  // Format time from 24-hour to 12-hour format
  const formatTime = timeString => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  // Handle starting a shift
  const handleStartShift = () => {
    if (todayShift) {
      // Update shift status to in_progress
      shiftService.updateShiftStatus(todayShift.id, 'in_progress');
      // Update local state
      setTodayShift({
        ...todayShift,
        status: 'in_progress'
      });
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'caregiver_start_shift',
        shift_id: todayShift.id
      });
    }
  };
  // Handle completing a shift
  const handleCompleteShift = () => {
    if (todayShift) {
      // Update shift status to completed
      shiftService.updateShiftStatus(todayShift.id, 'completed');
      // Update local state
      setTodayShift({
        ...todayShift,
        status: 'completed'
      });
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'caregiver_complete_shift',
        shift_id: todayShift.id
      });
    }
  };
  // Handle viewing all shifts
  const handleViewAllShifts = () => {
    navigateTo('schedule');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'caregiver_view_all_shifts'
    });
  };
  // Get status badge class
  const getStatusBadgeClass = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div>
      {/* Today's Shift */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <ClockIcon className="w-5 h-5 mr-2 text-blue-600" />
          Today's Shift
        </h2>
        {todayShift ? <div className="bg-white rounded-xl border border-blue-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm text-gray-500">
                  {formatDate(todayShift.date)}
                </div>
                <div className="text-lg font-medium">
                  {formatTime(todayShift.startTime)} -{' '}
                  {formatTime(todayShift.endTime)}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(todayShift.status)}`}>
                {todayShift.status.replace('_', ' ')}
              </span>
            </div>
            {tasks.length > 0 && <div className="mb-3">
                <div className="text-sm font-medium mb-2">Tasks:</div>
                <div className="space-y-2">
                  {tasks.slice(0, 3).map(task => <div key={task.id} className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${task.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'} mr-2 flex items-center justify-center`}>
                        {task.status === 'completed' && <CheckCircleIcon className="w-3 h-3 text-green-600" />}
                      </div>
                      <span className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                        {task.title}
                      </span>
                    </div>)}
                  {tasks.length > 3 && <div className="text-xs text-blue-600">
                      +{tasks.length - 3} more tasks
                    </div>}
                </div>
              </div>}
            <div className="flex space-x-2">
              {todayShift.status === 'scheduled' && <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium" onClick={handleStartShift}>
                  Start Shift
                </button>}
              {todayShift.status === 'in_progress' && <button className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium" onClick={handleCompleteShift}>
                  Complete Shift
                </button>}
              {todayShift.status === 'completed' && <div className="flex-1 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium text-center">
                  Shift Completed
                </div>}
            </div>
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500 mb-2">No shifts scheduled for today</p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm" onClick={handleViewAllShifts}>
              View Upcoming Shifts
            </button>
          </div>}
      </div>
      {/* Handoff Notes */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <ClipboardIcon className="w-5 h-5 mr-2 text-purple-600" />
          Recent Handoff Notes
        </h2>
        {handoffNotes.length > 0 ? <div className="space-y-3">
            {handoffNotes.map(shift => <div key={shift.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{formatDate(shift.date)}</div>
                  <div className="text-xs text-gray-500">
                    From: {dataService.getTeamMemberName(shift.assignedTo)}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{shift.handoffNotes}</p>
              </div>)}
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">No recent handoff notes</p>
          </div>}
      </div>
      {/* Team On Duty */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <UsersIcon className="w-5 h-5 mr-2 text-green-600" />
          Team On Duty Today
        </h2>
        {teamOnDuty.length > 0 ? <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {teamOnDuty.map((member, index) => <div key={member.id} className={`p-3 flex items-center justify-between ${index < teamOnDuty.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full bg-${member.color}-100 flex items-center justify-center mr-3`}>
                    <span className={`text-${member.color}-600 font-medium`}>
                      {member.initial}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.role}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {formatTime(member.shift.startTime)} -{' '}
                  {formatTime(member.shift.endTime)}
                </div>
              </div>)}
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">No other team members on duty today</p>
          </div>}
      </div>
      {/* Upcoming Shifts */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
            Upcoming Shifts
          </h2>
          <button className="text-sm text-blue-600" onClick={handleViewAllShifts}>
            View All
          </button>
        </div>
        {upcomingShifts.length > 0 ? <div className="space-y-3">
            {upcomingShifts.slice(todayShift ? 1 : 0, todayShift ? 4 : 3).map(shift => <div key={shift.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-500">
                        {formatDate(shift.date)}
                      </div>
                      <div className="font-medium">
                        {formatTime(shift.startTime)} -{' '}
                        {formatTime(shift.endTime)}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(shift.status)}`}>
                      {shift.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>)}
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">No upcoming shifts scheduled</p>
          </div>}
      </div>
    </div>;
};