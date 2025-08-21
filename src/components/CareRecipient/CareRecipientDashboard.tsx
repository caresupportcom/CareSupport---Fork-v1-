import React, { useEffect, useState } from 'react';
import { CalendarIcon, ClockIcon, UserIcon, MessageCircleIcon, PhoneIcon, AlertCircleIcon, HeartIcon, StarIcon, CheckCircleIcon, PlusIcon } from 'lucide-react';
import { shiftService } from '../../services/ShiftService';
import { dataService } from '../../services/DataService';
import { messageService } from '../../services/MessageService';
import { CareShift } from '../../types/ScheduleTypes';
import { storage } from '../../services/StorageService';
interface CareRecipientDashboardProps {
  onMessageCaregiver: (caregiverId: string) => void;
  onCallCaregiver: (caregiverId: string) => void;
  onViewCarePlan: () => void;
  onViewSchedule: () => void;
  onProvideFeedback: (caregiverId: string) => void;
}
export const CareRecipientDashboard: React.FC<CareRecipientDashboardProps> = ({
  onMessageCaregiver,
  onCallCaregiver,
  onViewCarePlan,
  onViewSchedule,
  onProvideFeedback
}) => {
  const [upcomingShifts, setUpcomingShifts] = useState<CareShift[]>([]);
  const [currentCaregiver, setCurrentCaregiver] = useState<any | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<CareShift[]>([]);
  const [caregiverHistory, setCaregiverHistory] = useState<any[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [carePlanProgress, setCarePlanProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0
  });
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = () => {
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    // Get upcoming shifts (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    const allShifts = shiftService.getShifts().filter(shift => shift.date >= todayStr && shift.date <= nextWeekStr);
    // Get today's shifts
    const todayShifts = allShifts.filter(shift => shift.date === todayStr);
    setTodaySchedule(todayShifts.sort((a, b) => {
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    }));
    // Get upcoming shifts (excluding today)
    const upcoming = allShifts.filter(shift => shift.date !== todayStr).sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    }).slice(0, 5);
    setUpcomingShifts(upcoming);
    // Find current caregiver (if any)
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentShift = todayShifts.find(shift => isTimeInRange(currentTime, shift.startTime, shift.endTime) && shift.assignedTo !== null);
    if (currentShift && currentShift.assignedTo) {
      const caregiver = dataService.getTeamMemberById(currentShift.assignedTo);
      if (caregiver) {
        setCurrentCaregiver({
          ...caregiver,
          shift: currentShift
        });
      }
    }
    // Get caregiver history
    const pastShifts = shiftService.getShifts().filter(shift => shift.date < todayStr && shift.status === 'completed' && shift.assignedTo !== null).slice(-10);
    const caregiverCounts = {};
    pastShifts.forEach(shift => {
      if (shift.assignedTo) {
        caregiverCounts[shift.assignedTo] = (caregiverCounts[shift.assignedTo] || 0) + 1;
      }
    });
    const caregiverStats = Object.entries(caregiverCounts).map(([id, count]) => {
      const caregiver = dataService.getTeamMemberById(id);
      return {
        id,
        name: caregiver ? caregiver.name : 'Unknown',
        avatar: caregiver ? caregiver.avatar : null,
        color: caregiver ? caregiver.color : 'gray',
        initial: caregiver ? caregiver.initial : '?',
        shiftsCompleted: count
      };
    }).sort((a, b) => (b.shiftsCompleted as number) - (a.shiftsCompleted as number));
    setCaregiverHistory(caregiverStats.slice(0, 3));
    // Load recent feedback
    const feedback = [{
      id: 'feedback1',
      caregiverId: 'maria',
      caregiverName: 'Maria Rodriguez',
      date: '2023-11-15',
      rating: 5,
      comment: 'Maria was very attentive and helped me with all my needs.'
    }, {
      id: 'feedback2',
      caregiverId: 'james',
      caregiverName: 'James Wilson',
      date: '2023-11-10',
      rating: 4,
      comment: 'James was professional and on time.'
    }];
    setRecentFeedback(feedback);
    // Load care plan progress
    const carePlanItems = [{
      id: 'cp1',
      title: 'Morning medication',
      completed: true
    }, {
      id: 'cp2',
      title: 'Breakfast',
      completed: true
    }, {
      id: 'cp3',
      title: 'Physical therapy exercises',
      completed: false
    }, {
      id: 'cp4',
      title: 'Lunch',
      completed: true
    }, {
      id: 'cp5',
      title: 'Afternoon walk',
      completed: false
    }, {
      id: 'cp6',
      title: 'Evening medication',
      completed: false
    }, {
      id: 'cp7',
      title: 'Dinner',
      completed: false
    }];
    const completed = carePlanItems.filter(item => item.completed).length;
    const total = carePlanItems.length;
    const percentage = Math.round(completed / total * 100);
    setCarePlanProgress({
      completed,
      total,
      percentage
    });
  };
  // Helper to check if a time is within a range (handles overnight shifts)
  const isTimeInRange = (time: string, start: string, end: string): boolean => {
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
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };
  // Format time from 24-hour to 12-hour format
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
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
  // Get caregiver name by ID
  const getCaregiverName = (id: string | null): string => {
    if (!id) return 'Unassigned';
    const member = dataService.getTeamMemberById(id);
    return member ? member.name : 'Unknown';
  };
  // Handle requesting help
  const handleRequestHelp = () => {
    // In a real app, this would send a notification to all available caregivers
    console.log('Help requested');
    // For demo, we'll just show an alert
    alert('Help request sent to your care team');
  };
  return <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">My Care Dashboard</h2>
        <p className="text-sm text-gray-500">Welcome back, Eleanor</p>
      </div>
      {/* Emergency Help Button */}
      <button className="mb-4 py-3 bg-red-500 text-white rounded-lg font-medium flex items-center justify-center" onClick={handleRequestHelp}>
        <AlertCircleIcon className="w-5 h-5 mr-2" />
        Request Immediate Help
      </button>
      {/* Current Caregiver */}
      {currentCaregiver ? <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-green-700 flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              Current Caregiver
            </h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              Now
            </span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
              <button className="flex-1 py-2 bg-white border border-green-300 rounded-lg text-green-700 text-sm flex items-center justify-center" onClick={() => onMessageCaregiver(currentCaregiver.id)}>
                <MessageCircleIcon className="w-4 h-4 mr-1" />
                Message
              </button>
              <button className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center justify-center" onClick={() => onCallCaregiver(currentCaregiver.id)}>
                <PhoneIcon className="w-4 h-4 mr-1" />
                Call
              </button>
            </div>
          </div>
        </div> : <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              Current Caregiver
            </h3>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-gray-500 mb-2">
              No caregiver is currently on duty
            </div>
            <button className="py-2 px-4 bg-blue-500 text-white rounded-lg text-sm" onClick={onViewSchedule}>
              View Schedule
            </button>
          </div>
        </div>}
      {/* Today's Schedule */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold flex items-center">
            <CalendarIcon className="w-4 h-4 mr-1" />
            Today's Schedule
          </h3>
          <button className="text-blue-600 text-sm" onClick={onViewSchedule}>
            Full Schedule
          </button>
        </div>
        {todaySchedule.length > 0 ? <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
            {todaySchedule.map(shift => <div key={shift.id} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {formatTime(shift.startTime)} -{' '}
                      {formatTime(shift.endTime)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {shift.assignedTo ? getCaregiverName(shift.assignedTo) : 'Unassigned'}
                    </div>
                  </div>
                  {shift.assignedTo && <div className={`w-8 h-8 rounded-full bg-${shift.color ? shift.color.replace('#', '') : 'blue'}-100 flex items-center justify-center`}>
                      <span className={`text-xs text-${shift.color ? shift.color.replace('#', '') : 'blue'}-600 font-medium`}>
                        {shift.assignedTo.charAt(0).toUpperCase()}
                      </span>
                    </div>}
                </div>
              </div>)}
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">No caregivers scheduled for today</p>
          </div>}
      </div>
      {/* Care Plan Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold flex items-center">
            <HeartIcon className="w-4 h-4 mr-1" />
            Today's Care Plan
          </h3>
          <button className="text-blue-600 text-sm" onClick={onViewCarePlan}>
            View Details
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-blue-800">Progress</div>
            <div className="text-sm font-medium text-blue-800">
              {carePlanProgress.completed}/{carePlanProgress.total} completed
            </div>
          </div>
          <div className="w-full bg-white rounded-full h-2.5 mb-3">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{
            width: `${carePlanProgress.percentage}%`
          }}></div>
          </div>
          <button className="w-full py-2 bg-white border border-blue-300 rounded-lg text-blue-700 text-sm" onClick={onViewCarePlan}>
            Continue Care Plan
          </button>
        </div>
      </div>
      {/* Upcoming Caregivers */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            Upcoming Caregivers
          </h3>
        </div>
        {upcomingShifts.length > 0 ? <div className="space-y-2">
            {upcomingShifts.map(shift => <div key={shift.id} className="bg-white border border-gray-200 rounded-lg p-3">
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
                      {shift.assignedTo ? getCaregiverName(shift.assignedTo) : 'Unassigned'}
                    </div>
                  </div>
                  {shift.assignedTo && <div className={`w-8 h-8 rounded-full bg-${shift.color ? shift.color.replace('#', '') : 'blue'}-100 flex items-center justify-center`}>
                      <span className={`text-xs text-${shift.color ? shift.color.replace('#', '') : 'blue'}-600 font-medium`}>
                        {shift.assignedTo.charAt(0).toUpperCase()}
                      </span>
                    </div>}
                </div>
              </div>)}
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">No upcoming caregivers scheduled</p>
          </div>}
      </div>
      {/* Frequent Caregivers */}
      {caregiverHistory.length > 0 && <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              Your Frequent Caregivers
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {caregiverHistory.map(caregiver => <div key={caregiver.id} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className={`w-10 h-10 rounded-full bg-${caregiver.color || 'blue'}-100 flex items-center justify-center mx-auto mb-2`}>
                  <span className={`text-sm text-${caregiver.color || 'blue'}-600 font-medium`}>
                    {caregiver.initial}
                  </span>
                </div>
                <div className="font-medium text-sm truncate">
                  {caregiver.name}
                </div>
                <div className="text-xs text-gray-500">
                  {caregiver.shiftsCompleted} visits
                </div>
                <button className="mt-2 w-full py-1 text-xs bg-blue-50 text-blue-600 rounded-lg" onClick={() => onProvideFeedback(caregiver.id)}>
                  Rate
                </button>
              </div>)}
          </div>
        </div>}
      {/* Recent Feedback */}
      {recentFeedback.length > 0 && <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold flex items-center">
              <StarIcon className="w-4 h-4 mr-1" />
              Your Recent Feedback
            </h3>
          </div>
          <div className="space-y-2">
            {recentFeedback.map(feedback => <div key={feedback.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{feedback.caregiverName}</div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => <StarIcon key={star} className={`w-4 h-4 ${star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                  </div>
                </div>
                <div className="text-sm text-gray-600">{feedback.comment}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(feedback.date).toLocaleDateString()}
                </div>
              </div>)}
          </div>
        </div>}
    </div>;
};