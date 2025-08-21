import React, { useEffect, useState } from 'react';
import { AlertTriangleIcon, UserIcon, CalendarIcon, BarChart2Icon, ClockIcon, CheckCircleIcon, XCircleIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { coverageService } from '../../../services/CoverageService';
import { shiftService } from '../../../services/ShiftService';
import { dataService } from '../../../services/DataService';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';
interface CoordinatorDashboardProps {
  navigateTo: (screen: string, data?: any) => void;
}
export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  navigateTo
}) => {
  const [coverageGaps, setCoverageGaps] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [coverageMetrics, setCoverageMetrics] = useState({
    totalHours: 0,
    coveredHours: 0,
    coveragePercentage: 0,
    gapsCount: 0,
    upcomingShifts: 0,
    unassignedShifts: 0
  });
  useEffect(() => {
    loadDashboardData();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coordinator_dashboard_viewed'
    });
  }, []);
  const loadDashboardData = () => {
    // Load coverage gaps
    const gaps = coverageService.getCoverageGaps();
    setCoverageGaps(gaps);
    // Load team members
    const members = dataService.getTeamMembers();
    setTeamMembers(members);
    // Load upcoming shifts (next 7 days)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const shifts = shiftService.getShifts().filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= today && shiftDate <= nextWeek;
    });
    setUpcomingShifts(shifts);
    // Calculate coverage metrics
    const totalHours = 16 * 7; // 16 hours per day for 7 days (assuming 8am-midnight coverage)
    const coveredHours = totalHours - gaps.length * 2; // Assuming each gap is about 2 hours
    const coveragePercentage = Math.round(coveredHours / totalHours * 100);
    setCoverageMetrics({
      totalHours,
      coveredHours,
      coveragePercentage,
      gapsCount: gaps.length,
      upcomingShifts: shifts.length,
      unassignedShifts: shifts.filter(shift => !shift.assignedTo).length
    });
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
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  // Get team member name by ID
  const getTeamMemberName = id => {
    if (!id) return 'Unassigned';
    const member = teamMembers.find(m => m.id === id);
    return member ? member.name : 'Unknown';
  };
  // Handle view shifts
  const handleViewShifts = () => {
    navigateTo('schedule');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coordinator_view_shifts'
    });
  };
  // Handle view coverage gaps
  const handleViewCoverageGaps = () => {
    navigateTo('schedule');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coordinator_view_coverage_gaps'
    });
  };
  // Handle create shift
  const handleCreateShift = () => {
    // This would typically navigate to a shift creation screen
    console.log('Create shift');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coordinator_create_shift'
    });
  };
  // Handle assign shift
  const handleAssignShift = shiftId => {
    // This would typically open a modal to assign the shift
    console.log('Assign shift', shiftId);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coordinator_assign_shift',
      shift_id: shiftId
    });
  };
  return <div>
      {/* Coverage Metrics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <BarChart2Icon className="w-5 h-5 mr-2 text-blue-600" />
          Coverage Metrics
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {coverageMetrics.coveragePercentage}%
            </div>
            <div className="text-sm text-blue-600">Coverage</div>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">
              {coverageMetrics.gapsCount}
            </div>
            <div className="text-sm text-orange-600">Coverage Gaps</div>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {coverageMetrics.upcomingShifts}
            </div>
            <div className="text-sm text-green-600">Upcoming Shifts</div>
          </div>
        </div>
      </div>
      {/* Team Snapshot */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold flex items-center">
            <UsersIcon className="w-5 h-5 mr-2 text-purple-600" />
            Team Snapshot
          </h2>
          <button className="text-sm text-blue-600" onClick={() => navigateTo('care-teams')}>
            View All
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {teamMembers.slice(0, 3).map((member, index) => <div key={member.id} className={`p-3 flex items-center justify-between ${index < teamMembers.length - 1 ? 'border-b border-gray-200' : ''}`}>
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
              <div className="text-sm text-gray-500">
                {shiftService.getUpcomingShiftsForCaregiver(member.id, 1).length > 0 ? <span className="text-green-600 flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Next:{' '}
                    {formatDate(shiftService.getUpcomingShiftsForCaregiver(member.id, 1)[0].date)}
                  </span> : <span className="text-gray-500 flex items-center">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    No upcoming shifts
                  </span>}
              </div>
            </div>)}
        </div>
      </div>
      {/* Coverage Gaps */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold flex items-center">
            <AlertTriangleIcon className="w-5 h-5 mr-2 text-orange-600" />
            Coverage Gaps
          </h2>
          <button className="text-sm text-blue-600" onClick={handleViewCoverageGaps}>
            View All
          </button>
        </div>
        {coverageGaps.length > 0 ? <div className="space-y-3">
            {coverageGaps.slice(0, 3).map(gap => <div key={gap.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertTriangleIcon className="w-5 h-5 text-orange-600 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-orange-800">
                      Coverage Gap
                    </h3>
                    <p className="text-sm text-orange-700 mb-2">
                      {formatDate(gap.date)} • {formatTime(gap.startTime)} -{' '}
                      {formatTime(gap.endTime)}
                    </p>
                    <div className="flex">
                      <button className="text-xs bg-white text-orange-700 border border-orange-300 rounded px-2 py-1" onClick={handleCreateShift}>
                        Create Shift
                      </button>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs ${gap.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                    {gap.priority} priority
                  </div>
                </div>
              </div>)}
          </div> : <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-green-700">
              No coverage gaps for the next 7 days
            </p>
          </div>}
      </div>
      {/* Upcoming Shifts */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
            Upcoming Shifts
          </h2>
          <div className="flex space-x-2">
            <button className="text-sm bg-blue-500 text-white rounded-lg px-3 py-1 flex items-center" onClick={handleCreateShift}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Create
            </button>
            <button className="text-sm text-blue-600" onClick={handleViewShifts}>
              View All
            </button>
          </div>
        </div>
        {upcomingShifts.length > 0 ? <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {upcomingShifts.slice(0, 5).map((shift, index) => <div key={shift.id} className={`p-3 flex items-center justify-between ${index < 4 ? 'border-b border-gray-200' : ''}`}>
                <div>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="font-medium">
                      {formatDate(shift.date)} • {formatTime(shift.startTime)} -{' '}
                      {formatTime(shift.endTime)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {shift.assignedTo ? <span className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        {getTeamMemberName(shift.assignedTo)}
                      </span> : <span className="text-orange-600">Unassigned</span>}
                  </div>
                </div>
                {!shift.assignedTo && <button className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-1" onClick={() => handleAssignShift(shift.id)}>
                    Assign
                  </button>}
              </div>)}
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">No upcoming shifts</p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm" onClick={handleCreateShift}>
              Create Shift
            </button>
          </div>}
      </div>
    </div>;
};