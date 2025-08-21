import React, { useEffect, useState } from 'react';
import { CalendarIcon, ClockIcon, UserIcon, ChevronRightIcon, BellIcon, CheckIcon, AlertCircleIcon, BarChart2Icon } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { shiftService } from '../../services/ShiftService';
import { dataService } from '../../services/DataService';
import { coverageService } from '../../services/CoverageService';
import { storage } from '../../services/StorageService';
import { CareShift } from '../../types/ScheduleTypes';
interface CaregiverDashboardProps {
  onShiftClick: (shift: CareShift) => void;
  onViewSchedule: () => void;
  onViewCoverage: () => void;
}
export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  onShiftClick,
  onViewSchedule,
  onViewCoverage
}) => {
  const {
    isTaskCompleted
  } = useCalendar();
  const [upcomingShifts, setUpcomingShifts] = useState<CareShift[]>([]);
  const [activeShift, setActiveShift] = useState<CareShift | null>(null);
  const [coverageGaps, setCoverageGaps] = useState<number>(0);
  const [totalShifts, setTotalShifts] = useState<number>(0);
  const [coveredShifts, setCoveredShifts] = useState<number>(0);
  const [userId, setUserId] = useState<string>('maria'); // Default to Maria for demo
  useEffect(() => {
    // Load upcoming shifts for the current user
    const user = storage.get('user_id', 'maria');
    setUserId(user);
    loadDashboardData(user);
  }, []);
  const loadDashboardData = (userId: string) => {
    // Get upcoming shifts for this caregiver
    const upcoming = shiftService.getUpcomingShiftsForCaregiver(userId, 5);
    setUpcomingShifts(upcoming);
    // Check if there's an active shift right now
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const todayShifts = shiftService.getShiftsForDate(today);
    const current = todayShifts.find(shift => shift.assignedTo === userId && shift.status === 'in_progress' && isTimeInRange(currentTime, shift.startTime, shift.endTime));
    setActiveShift(current || null);
    // Get coverage stats for the next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    // Get all shifts for the next 7 days
    const allShifts = shiftService.getShifts().filter(shift => shift.date >= today && shift.date <= nextWeekStr);
    setTotalShifts(allShifts.length);
    setCoveredShifts(allShifts.filter(shift => shift.assignedTo !== null).length);
    // Get all coverage gaps
    const gaps = coverageService.getCoverageGaps();
    const activeGaps = gaps.filter(gap => gap.status === 'identified' && gap.date >= today && gap.date <= nextWeekStr);
    setCoverageGaps(activeGaps.length);
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
  // Handle starting a shift
  const handleStartShift = (shift: CareShift, e: React.MouseEvent) => {
    e.stopPropagation();
    shiftService.startShift(shift.id);
    loadDashboardData(userId);
  };
  // Handle completing a shift
  const handleCompleteShift = (shift: CareShift, e: React.MouseEvent) => {
    e.stopPropagation();
    shiftService.completeShift(shift.id);
    loadDashboardData(userId);
  };
  // Get shift tasks
  const getShiftTasks = (shift: CareShift) => {
    if (!shift.tasks) return [];
    return shift.tasks.map(taskId => dataService.getTaskById(taskId)).filter(task => task !== undefined);
  };
  // Calculate completion percentage for shift tasks
  const getTaskCompletionPercentage = (shift: CareShift): number => {
    if (!shift.tasks || shift.tasks.length === 0) return 0;
    const tasks = getShiftTasks(shift);
    if (tasks.length === 0) return 0;
    const completedCount = tasks.filter(task => isTaskCompleted(task.id)).length;
    return Math.round(completedCount / tasks.length * 100);
  };
  return <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">Caregiver Dashboard</h2>
        <p className="text-sm text-gray-500">Manage your shifts and coverage</p>
      </div>

      {/* Coverage Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{totalShifts}</div>
          <div className="text-xs text-blue-700">Total Shifts</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-3xl font-bold text-green-600">
            {coveredShifts}
          </div>
          <div className="text-xs text-green-700">Covered</div>
        </div>
        <div className={`${coverageGaps > 0 ? 'bg-red-50' : 'bg-gray-50'} p-3 rounded-lg`}>
          <div className={`text-3xl font-bold ${coverageGaps > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {coverageGaps}
          </div>
          <div className={`text-xs ${coverageGaps > 0 ? 'text-red-700' : 'text-gray-700'}`}>
            Coverage Gaps
          </div>
        </div>
      </div>

      {/* Active Shift */}
      {activeShift && <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-green-700 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              Active Shift
            </h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              In Progress
            </span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer" onClick={() => onShiftClick(activeShift)}>
            <div className="flex justify-between">
              <div>
                <div className="font-medium">
                  {formatTime(activeShift.startTime)} -{' '}
                  {formatTime(activeShift.endTime)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(activeShift.date)}
                </div>
              </div>
              <div>
                <button onClick={e => handleCompleteShift(activeShift, e)} className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                  Complete
                </button>
              </div>
            </div>
            {activeShift.tasks && activeShift.tasks.length > 0 && <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Task Completion</span>
                  <span className="text-xs font-medium">
                    {getTaskCompletionPercentage(activeShift)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{
              width: `${getTaskCompletionPercentage(activeShift)}%`
            }}></div>
                </div>
              </div>}
          </div>
        </div>}

      {/* Upcoming Shifts */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Upcoming Shifts</h3>
          <button className="text-blue-600 text-sm flex items-center" onClick={onViewSchedule}>
            View All <ChevronRightIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
        {upcomingShifts.length > 0 ? <div className="space-y-2">
            {upcomingShifts.map(shift => <div key={shift.id} className={`border rounded-lg p-3 cursor-pointer ${shift.status === 'scheduled' ? 'bg-blue-50 border-blue-200' : shift.status === 'in_progress' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`} onClick={() => onShiftClick(shift)}>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">
                      {formatTime(shift.startTime)} -{' '}
                      {formatTime(shift.endTime)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(shift.date)}
                    </div>
                  </div>
                  {shift.status === 'scheduled' && <button onClick={e => handleStartShift(shift, e)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Start
                    </button>}
                </div>
                {shift.tasks && shift.tasks.length > 0 && <div className="mt-2 text-xs text-gray-600">
                    {shift.tasks.length} task
                    {shift.tasks.length !== 1 ? 's' : ''} assigned
                  </div>}
              </div>)}
          </div> : <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">No upcoming shifts</p>
          </div>}
      </div>

      {/* Coverage Gaps Alert */}
      {coverageGaps > 0 && <div className="mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 cursor-pointer" onClick={onViewCoverage}>
            <div className="flex items-start">
              <AlertCircleIcon className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-red-800">
                  Coverage Gaps Detected
                </div>
                <div className="text-sm text-red-700">
                  {coverageGaps} shift{coverageGaps !== 1 ? 's' : ''} need
                  {coverageGaps === 1 ? 's' : ''} coverage in the next 7 days
                </div>
                <button className="mt-2 text-xs bg-white border border-red-300 text-red-700 px-3 py-1 rounded-lg">
                  View Gaps
                </button>
              </div>
            </div>
          </div>
        </div>}

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center bg-blue-50 border border-blue-200 rounded-lg p-3 hover:bg-blue-100" onClick={onViewSchedule}>
            <CalendarIcon className="w-4 h-4 text-blue-700 mr-2" />
            <span className="text-sm text-blue-800">View Schedule</span>
          </button>
          <button className="flex items-center justify-center bg-purple-50 border border-purple-200 rounded-lg p-3 hover:bg-purple-100" onClick={onViewCoverage}>
            <BarChart2Icon className="w-4 h-4 text-purple-700 mr-2" />
            <span className="text-sm text-purple-800">Coverage Analysis</span>
          </button>
        </div>
      </div>
    </div>;
};