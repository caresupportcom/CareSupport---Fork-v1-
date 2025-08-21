import React, { useEffect, useState } from 'react';
import { CalendarIcon, HeartIcon, UserIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon, MessageCircleIcon, PhoneIcon } from 'lucide-react';
import { shiftService } from '../../../services/ShiftService';
import { dataService } from '../../../services/DataService';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';
import { storage } from '../../../services/StorageService';
interface FamilyDashboardProps {
  navigateTo: (screen: string, data?: any) => void;
}
export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  navigateTo
}) => {
  const [todayShifts, setTodayShifts] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [currentCaregiver, setCurrentCaregiver] = useState(null);
  const [carePlanProgress, setCarePlanProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0
  });
  const [coverageOverview, setCoverageOverview] = useState({
    nextWeekHours: 0,
    coveredHours: 0,
    percentage: 0
  });
  const userId = storage.get('user_id', '');
  useEffect(() => {
    loadDashboardData();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'family_dashboard_viewed'
    });
  }, []);
  const loadDashboardData = () => {
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    // Load today's shifts
    const shiftsToday = shiftService.getShiftsForDate(todayStr);
    setTodayShifts(shiftsToday.sort((a, b) => {
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    }));
    // Find current caregiver
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentShift = shiftsToday.find(shift => isTimeInRange(currentTime, shift.startTime, shift.endTime) && shift.assignedTo !== null);
    if (currentShift && currentShift.assignedTo) {
      const caregiver = dataService.getTeamMemberById(currentShift.assignedTo);
      if (caregiver) {
        setCurrentCaregiver({
          ...caregiver,
          shift: currentShift
        });
      }
    }
    // Load upcoming shifts (next 7 days excluding today)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    const upcoming = shiftService.getShifts().filter(shift => shift.date > todayStr && shift.date <= nextWeekStr).sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });
    setUpcomingShifts(upcoming);
    // Calculate care plan progress
    const tasks = dataService.getTodayTasks();
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;
    const percentage = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
    setCarePlanProgress({
      completed: completedTasks,
      total: totalTasks,
      percentage
    });
    // Calculate coverage overview for next week
    const nextWeekHours = 16 * 7; // 16 hours per day for 7 days (assuming 8am-midnight coverage)
    // Calculate covered hours based on shifts
    let coveredMinutes = 0;
    const allShifts = [...shiftsToday, ...upcoming];
    allShifts.forEach(shift => {
      const startMinutes = timeToMinutes(shift.startTime);
      const endMinutes = timeToMinutes(shift.endTime);
      // Handle overnight shifts
      if (endMinutes < startMinutes) {
        coveredMinutes += 24 * 60 - startMinutes + endMinutes;
      } else {
        coveredMinutes += endMinutes - startMinutes;
      }
    });
    const coveredHours = Math.round(coveredMinutes / 60);
    const coveragePercentage = Math.round(coveredHours / nextWeekHours * 100);
    setCoverageOverview({
      nextWeekHours,
      coveredHours,
      percentage: coveragePercentage
    });
  };
  // Helper to check if a time is within a range (handles overnight shifts)
  const isTimeInRange = (time, start, end) => {
    const [timeHour, timeMin] = time.split(':').map(Number);
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const timeMinutes = timeHour * 60 + timeMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    // Handle overnight shifts (end time earlier than start time)
    if (endMinutes < startMinutes) {
      return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    } else {
      return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
    }
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
  // Handle view schedule
  const handleViewSchedule = () => {
    navigateTo('schedule');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'family_view_schedule'
    });
  };
  // Handle view care plan
  const handleViewCarePlan = () => {
    navigateTo('home');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'family_view_care_plan'
    });
  };
  // Handle message caregiver
  const handleMessageCaregiver = caregiverId => {
    // In a real app, this would navigate to a messaging screen
    console.log('Message caregiver', caregiverId);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'family_message_caregiver',
      caregiver_id: caregiverId
    });
  };
  // Handle call caregiver
  const handleCallCaregiver = caregiverId => {
    // In a real app, this would initiate a call
    console.log('Call caregiver', caregiverId);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'family_call_caregiver',
      caregiver_id: caregiverId
    });
  };
  return <div>
      {/* Care Coverage Overview */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
          Care Coverage
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium text-blue-800">
              Next 7 Days Coverage
            </div>
            <div className="text-sm font-medium text-blue-800">
              {coverageOverview.coveredHours}/{coverageOverview.nextWeekHours}{' '}
              hours
            </div>
          </div>
          <div className="w-full bg-white rounded-full h-2.5 mb-3">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{
            width: `${coverageOverview.percentage}%`
          }}></div>
          </div>
          <div className="flex justify-between text-sm text-blue-700">
            <div>{coverageOverview.percentage}% covered</div>
            <button className="text-blue-700 font-medium" onClick={handleViewSchedule}>
              View Schedule
            </button>
          </div>
        </div>
      </div>
      {/* Current Caregiver */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <UserIcon className="w-5 h-5 mr-2 text-green-600" />
          Current Caregiver
        </h2>
        {currentCaregiver ? <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className={`w-12 h-12 rounded-full bg-${currentCaregiver.color || 'blue'}-100 flex items-center justify-center mr-3`}>
                <span className={`text-lg text-${currentCaregiver.color || 'blue'}-600 font-medium`}>
                  {currentCaregiver.initial}
                </span>
              </div>
              <div>
                <div className="font-medium">{currentCaregiver.name}</div>
                <div className="text-sm text-gray-600">
                  {currentCaregiver.role}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-700 mb-3">
              <div className="flex items-center mb-1">
                <ClockIcon className="w-4 h-4 mr-1 text-gray-500" />
                <span>
                  {formatTime(currentCaregiver.shift.startTime)} -{' '}
                  {formatTime(currentCaregiver.shift.endTime)}
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                <span>On duty now</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 py-2 bg-white border border-green-300 rounded-lg text-green-700 text-sm flex items-center justify-center" onClick={() => handleMessageCaregiver(currentCaregiver.id)}>
                <MessageCircleIcon className="w-4 h-4 mr-1" />
                Message
              </button>
              <button className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center justify-center" onClick={() => handleCallCaregiver(currentCaregiver.id)}>
                <PhoneIcon className="w-4 h-4 mr-1" />
                Call
              </button>
            </div>
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-gray-500 mb-2">
              No caregiver is currently on duty
            </div>
            <button className="py-2 px-4 bg-blue-500 text-white rounded-lg text-sm" onClick={handleViewSchedule}>
              View Schedule
            </button>
          </div>}
      </div>
      {/* Care Plan Progress */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <HeartIcon className="w-5 h-5 mr-2 text-red-600" />
          Care Plan Progress
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium text-red-800">Today's Progress</div>
            <div className="text-sm font-medium text-red-800">
              {carePlanProgress.completed}/{carePlanProgress.total} completed
            </div>
          </div>
          <div className="w-full bg-white rounded-full h-2.5 mb-3">
            <div className="bg-red-600 h-2.5 rounded-full" style={{
            width: `${carePlanProgress.percentage}%`
          }}></div>
          </div>
          <button className="w-full py-2 bg-white border border-red-300 rounded-lg text-red-700 text-sm" onClick={handleViewCarePlan}>
            View Care Plan
          </button>
        </div>
      </div>
      {/* Today's Schedule */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-purple-600" />
            Today's Schedule
          </h2>
          <button className="text-sm text-blue-600" onClick={handleViewSchedule}>
            Full Schedule
          </button>
        </div>
        {todayShifts.length > 0 ? <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
            {todayShifts.map(shift => <div key={shift.id} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {formatTime(shift.startTime)} -{' '}
                      {formatTime(shift.endTime)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {shift.assignedTo ? dataService.getTeamMemberName(shift.assignedTo) : 'Unassigned'}
                    </div>
                  </div>
                  {shift.assignedTo && <div className={`w-8 h-8 rounded-full bg-${shift.color || 'blue'}-100 flex items-center justify-center`}>
                      <span className={`text-xs text-${shift.color || 'blue'}-600 font-medium`}>
                        {dataService.getTeamMemberById(shift.assignedTo)?.initial || shift.assignedTo.charAt(0).toUpperCase()}
                      </span>
                    </div>}
                </div>
              </div>)}
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">No caregivers scheduled for today</p>
          </div>}
      </div>
      {/* Upcoming Caregivers */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
          Upcoming Caregivers
        </h2>
        {upcomingShifts.length > 0 ? <div className="space-y-2">
            {upcomingShifts.slice(0, 3).map(shift => <div key={shift.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500">
                      {formatDate(shift.date)}
                    </div>
                    <div className="font-medium">
                      {formatTime(shift.startTime)} -{' '}
                      {formatTime(shift.endTime)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {shift.assignedTo ? dataService.getTeamMemberName(shift.assignedTo) : 'Unassigned'}
                    </div>
                  </div>
                  {shift.assignedTo && <div className={`w-8 h-8 rounded-full bg-${shift.color || 'blue'}-100 flex items-center justify-center`}>
                      <span className={`text-xs text-${shift.color || 'blue'}-600 font-medium`}>
                        {dataService.getTeamMemberById(shift.assignedTo)?.initial || shift.assignedTo.charAt(0).toUpperCase()}
                      </span>
                    </div>}
                </div>
              </div>)}
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">No upcoming caregivers scheduled</p>
          </div>}
      </div>
    </div>;
};