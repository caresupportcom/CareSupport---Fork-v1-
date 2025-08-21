import React, { useEffect, useState } from 'react';
import { BarChart2Icon, AlertCircleIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, ClockIcon, CalendarIcon, CheckIcon } from 'lucide-react';
import { shiftService } from '../../services/ShiftService';
import { dataService } from '../../services/DataService';
import { coverageService } from '../../services/CoverageService';
import { CoverageGap, CareShift } from '../../types/ScheduleTypes';
interface CoverageAnalysisProps {
  onClose: () => void;
  onGapClick: (gap: CoverageGap) => void;
  onCreateShift: (date: string, startTime: string, endTime: string) => void;
}
export const CoverageAnalysis: React.FC<CoverageAnalysisProps> = ({
  onClose,
  onGapClick,
  onCreateShift
}) => {
  // State for date range and data
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
  });
  const [coverageGaps, setCoverageGaps] = useState<CoverageGap[]>([]);
  const [shifts, setShifts] = useState<CareShift[]>([]);
  const [dailyCoverage, setDailyCoverage] = useState<Record<string, {
    total: number;
    covered: number;
    gaps: number;
  }>>({});
  const [caregiverWorkload, setCaregiverWorkload] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'gaps' | 'recommendations'>('overview');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  // Load initial data
  useEffect(() => {
    loadData();
  }, [dateRange]);
  const loadData = () => {
    // Get all gaps within the date range
    const gaps = coverageService.getCoverageGaps().filter(gap => gap.date >= dateRange.start && gap.date <= dateRange.end && gap.status === 'identified');
    setCoverageGaps(gaps);
    // Get all shifts within the date range
    const allShifts = shiftService.getShifts().filter(shift => shift.date >= dateRange.start && shift.date <= dateRange.end);
    setShifts(allShifts);
    // Calculate daily coverage stats
    const coverage: Record<string, {
      total: number;
      covered: number;
      gaps: number;
    }> = {};
    // Initialize dates in the range
    let currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      coverage[dateStr] = {
        total: 0,
        covered: 0,
        gaps: 0
      };
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    // Count shifts by date
    allShifts.forEach(shift => {
      if (coverage[shift.date]) {
        coverage[shift.date].total += 1;
        if (shift.assignedTo) {
          coverage[shift.date].covered += 1;
        }
      }
    });
    // Count gaps by date
    gaps.forEach(gap => {
      if (coverage[gap.date]) {
        coverage[gap.date].gaps += 1;
      }
    });
    setDailyCoverage(coverage);
    // Calculate caregiver workload
    const workload: Record<string, number> = {};
    allShifts.forEach(shift => {
      if (shift.assignedTo) {
        if (!workload[shift.assignedTo]) {
          workload[shift.assignedTo] = 0;
        }
        // Calculate shift duration in hours
        const [startHour, startMin] = shift.startTime.split(':').map(Number);
        const [endHour, endMin] = shift.endTime.split(':').map(Number);
        let durationHours = endHour - startHour + (endMin - startMin) / 60;
        if (durationHours < 0) {
          durationHours += 24; // Handle overnight shifts
        }
        workload[shift.assignedTo] += durationHours;
      }
    });
    setCaregiverWorkload(workload);
    // Generate recommendations
    generateRecommendations(gaps, allShifts, workload);
  };
  // Generate scheduling recommendations
  const generateRecommendations = (gaps: CoverageGap[], shifts: CareShift[], workload: Record<string, number>) => {
    const recommendations = [];
    // 1. Recommend filling high-priority gaps first
    const criticalGaps = gaps.filter(gap => gap.priority === 'high');
    if (criticalGaps.length > 0) {
      recommendations.push({
        type: 'critical_gaps',
        title: 'Critical Coverage Needed',
        description: `${criticalGaps.length} high-priority coverage gap${criticalGaps.length !== 1 ? 's' : ''} detected`,
        gaps: criticalGaps,
        priority: 'high'
      });
    }
    // 2. Identify caregivers with low workload who could take more shifts
    const teamMembers = dataService.getTeamMembers();
    const underutilizedCaregivers = teamMembers.filter(member => {
      const hours = workload[member.id] || 0;
      return hours < 20; // Less than 20 hours in the date range
    });
    if (underutilizedCaregivers.length > 0 && gaps.length > 0) {
      recommendations.push({
        type: 'underutilized',
        title: 'Available Caregivers',
        description: `${underutilizedCaregivers.length} caregiver${underutilizedCaregivers.length !== 1 ? 's' : ''} with availability`,
        caregivers: underutilizedCaregivers,
        priority: 'medium'
      });
    }
    // 3. Identify days with uneven workload distribution
    const dateKeys = Object.keys(dailyCoverage);
    const overloadedDays = dateKeys.filter(date => {
      const dayShifts = shifts.filter(shift => shift.date === date);
      // Count shifts by caregiver
      const caregiverCounts: Record<string, number> = {};
      dayShifts.forEach(shift => {
        if (shift.assignedTo) {
          if (!caregiverCounts[shift.assignedTo]) {
            caregiverCounts[shift.assignedTo] = 0;
          }
          caregiverCounts[shift.assignedTo] += 1;
        }
      });
      // Check if any caregiver has more than 2 shifts on this day
      return Object.values(caregiverCounts).some(count => count > 2);
    });
    if (overloadedDays.length > 0) {
      recommendations.push({
        type: 'workload_balance',
        title: 'Workload Imbalance',
        description: `${overloadedDays.length} day${overloadedDays.length !== 1 ? 's' : ''} with uneven workload distribution`,
        dates: overloadedDays,
        priority: 'medium'
      });
    }
    // 4. Suggest creating recurring shifts for consistent coverage
    const consistentGapPatterns = identifyConsistentGapPatterns(gaps);
    if (consistentGapPatterns.length > 0) {
      recommendations.push({
        type: 'recurring_shifts',
        title: 'Create Recurring Shifts',
        description: 'Consistent coverage gaps detected that could be filled with recurring shifts',
        patterns: consistentGapPatterns,
        priority: 'medium'
      });
    }
    setRecommendations(recommendations);
  };
  // Identify consistent patterns in coverage gaps
  const identifyConsistentGapPatterns = (gaps: CoverageGap[]) => {
    const patterns = [];
    // Group gaps by time
    const timeGroups: Record<string, CoverageGap[]> = {};
    gaps.forEach(gap => {
      const timeKey = `${gap.startTime}-${gap.endTime}`;
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = [];
      }
      timeGroups[timeKey].push(gap);
    });
    // Look for time slots that have multiple gaps
    Object.entries(timeGroups).forEach(([timeKey, gapGroup]) => {
      if (gapGroup.length >= 2) {
        // Check if these gaps fall on the same day of week
        const dayOfWeekCounts: Record<number, number> = {};
        gapGroup.forEach(gap => {
          const dayOfWeek = new Date(gap.date).getDay();
          if (!dayOfWeekCounts[dayOfWeek]) {
            dayOfWeekCounts[dayOfWeek] = 0;
          }
          dayOfWeekCounts[dayOfWeek] += 1;
        });
        // If we have at least 2 gaps on the same day of week with the same time
        const consistentDays = Object.entries(dayOfWeekCounts).filter(([_, count]) => count >= 2).map(([day]) => parseInt(day));
        if (consistentDays.length > 0) {
          const [startTime, endTime] = timeKey.split('-');
          patterns.push({
            startTime,
            endTime,
            daysOfWeek: consistentDays,
            gaps: gapGroup.filter(gap => consistentDays.includes(new Date(gap.date).getDay()))
          });
        }
      }
    });
    return patterns;
  };
  // Format date for display
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  // Format time from 24-hour to 12-hour format
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Navigate to previous/next week
  const navigatePreviousWeek = () => {
    const startDate = new Date(dateRange.start);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(dateRange.end);
    endDate.setDate(endDate.getDate() - 7);
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
  };
  const navigateNextWeek = () => {
    const startDate = new Date(dateRange.start);
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(dateRange.end);
    endDate.setDate(endDate.getDate() + 7);
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
  };
  // Get day of week name
  const getDayOfWeekName = (dayNumber: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };
  // Create a recurring shift from a pattern
  const createRecurringShift = (pattern: any) => {
    // Get the first day of week from the pattern
    const dayOfWeek = pattern.daysOfWeek[0];
    // Find the next occurrence of this day
    const today = new Date();
    const daysUntilNext = (dayOfWeek - today.getDay() + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    // Create the shift
    onCreateShift(nextDate.toISOString().split('T')[0], pattern.startTime, pattern.endTime);
  };
  return <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Coverage Analysis</h2>
        <button onClick={onClose} className="text-sm px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
          Close
        </button>
      </div>
      {/* Date Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={navigatePreviousWeek} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="text-sm font-medium">
          {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </div>
        <button onClick={navigateNextWeek} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'gaps' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('gaps')}>
          Coverage Gaps ({coverageGaps.length})
        </button>
        <button className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'recommendations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('recommendations')}>
          Recommendations
        </button>
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {shifts.length}
                </div>
                <div className="text-xs text-blue-700">Total Shifts</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {shifts.filter(s => s.assignedTo !== null).length}
                </div>
                <div className="text-xs text-green-700">Covered Shifts</div>
              </div>
              <div className={`${coverageGaps.length > 0 ? 'bg-red-50' : 'bg-gray-50'} p-3 rounded-lg`}>
                <div className={`text-3xl font-bold ${coverageGaps.length > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {coverageGaps.length}
                </div>
                <div className={`text-xs ${coverageGaps.length > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                  Coverage Gaps
                </div>
              </div>
            </div>
            {/* Daily Coverage Chart */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Daily Coverage</h3>
              <div className="space-y-3">
                {Object.entries(dailyCoverage).map(([date, data]) => <div key={date} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{formatDate(date)}</div>
                      <div className="text-xs text-gray-500">
                        {data.covered}/{data.total} shifts covered
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div className={`h-2.5 rounded-full ${data.total > 0 ? 'bg-blue-600' : 'bg-gray-300'}`} style={{
                  width: `${data.total > 0 ? data.covered / data.total * 100 : 0}%`
                }}></div>
                    </div>
                    {data.gaps > 0 && <div className="flex items-center mt-2 text-xs text-red-600">
                        <AlertCircleIcon className="w-3 h-3 mr-1" />
                        {data.gaps} coverage gap{data.gaps !== 1 ? 's' : ''}
                      </div>}
                  </div>)}
              </div>
            </div>
            {/* Caregiver Workload */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">
                Caregiver Workload
              </h3>
              <div className="space-y-3">
                {Object.entries(caregiverWorkload).sort(([_, hoursA], [__, hoursB]) => hoursB - hoursA).map(([caregiverId, hours]) => {
              const caregiver = dataService.getTeamMemberById(caregiverId);
              if (!caregiver) return null;
              return <div key={caregiverId} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full bg-${caregiver.color || 'blue'}-100 flex items-center justify-center mr-2`}>
                              <span className={`text-xs text-${caregiver.color || 'blue'}-600 font-medium`}>
                                {caregiver.initial}
                              </span>
                            </div>
                            <div className="font-medium">{caregiver.name}</div>
                          </div>
                          <div className="text-sm font-medium">
                            {Math.round(hours * 10) / 10} hrs
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full bg-${caregiver.color || 'blue'}-500`} style={{
                    width: `${Math.min(hours / 40 * 100, 100)}%`
                  }}></div>
                        </div>
                      </div>;
            })}
              </div>
            </div>
          </div>}
        {activeTab === 'gaps' && <div>
            <div className="mb-4">
              <div className="text-sm text-gray-600">
                {coverageGaps.length > 0 ? `${coverageGaps.length} coverage gap${coverageGaps.length !== 1 ? 's' : ''} found` : 'No coverage gaps found for this period'}
              </div>
            </div>
            {coverageGaps.length > 0 ? <div className="space-y-3">
                {coverageGaps.map(gap => <div key={gap.id} className={`border rounded-lg p-3 cursor-pointer ${gap.priority === 'high' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`} onClick={() => onGapClick(gap)}>
                    <div className="flex items-start">
                      <AlertCircleIcon className={`w-5 h-5 ${gap.priority === 'high' ? 'text-red-500' : 'text-yellow-500'} mr-2 flex-shrink-0 mt-0.5`} />
                      <div>
                        <div className="font-medium">
                          {formatTime(gap.startTime)} -{' '}
                          {formatTime(gap.endTime)}
                        </div>
                        <div className="text-sm">{formatDate(gap.date)}</div>
                        <div className="flex mt-2">
                          <button className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-lg">
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div> : <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-center mb-3">
                  <CheckIcon className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">
                  All Shifts Covered
                </h3>
                <p className="text-sm text-gray-600">
                  There are no coverage gaps for this period
                </p>
              </div>}
          </div>}
        {activeTab === 'recommendations' && <div>
            {recommendations.length > 0 ? <div className="space-y-4">
                {recommendations.map((recommendation, index) => <div key={index} className={`border rounded-lg p-4 ${recommendation.priority === 'high' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                    <h3 className="font-medium text-gray-800 mb-1">
                      {recommendation.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {recommendation.description}
                    </p>
                    {recommendation.type === 'critical_gaps' && <div className="space-y-2">
                        {recommendation.gaps.map((gap: CoverageGap) => <div key={gap.id} className="bg-white border border-red-200 rounded-lg p-2 flex justify-between items-center cursor-pointer" onClick={() => onGapClick(gap)}>
                            <div>
                              <div className="font-medium text-sm">
                                {formatDate(gap.date)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {formatTime(gap.startTime)} -{' '}
                                {formatTime(gap.endTime)}
                              </div>
                            </div>
                            <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              Resolve
                            </button>
                          </div>)}
                      </div>}
                    {recommendation.type === 'underutilized' && <div className="space-y-2">
                        {recommendation.caregivers.map((caregiver: TeamMember) => <div key={caregiver.id} className="bg-white border border-blue-200 rounded-lg p-2 flex items-center">
                              <div className={`w-6 h-6 rounded-full bg-${caregiver.color || 'blue'}-100 flex items-center justify-center mr-2`}>
                                <span className={`text-xs text-${caregiver.color || 'blue'}-600 font-medium`}>
                                  {caregiver.initial}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {caregiver.name}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {caregiverWorkload[caregiver.id] || 0} hours
                                  scheduled
                                </div>
                              </div>
                            </div>)}
                      </div>}
                    {recommendation.type === 'recurring_shifts' && <div className="space-y-2">
                        {recommendation.patterns.map((pattern: any, i: number) => <div key={i} className="bg-white border border-blue-200 rounded-lg p-2">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-medium text-sm">
                                    {formatTime(pattern.startTime)} -{' '}
                                    {formatTime(pattern.endTime)}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Every{' '}
                                    {pattern.daysOfWeek.map((day: number) => getDayOfWeekName(day)).join(', ')}
                                  </div>
                                </div>
                                <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded" onClick={() => createRecurringShift(pattern)}>
                                  Create Shift
                                </button>
                              </div>
                              <div className="text-xs text-gray-500">
                                {pattern.gaps.length} gaps detected with this
                                pattern
                              </div>
                            </div>)}
                      </div>}
                  </div>)}
              </div> : <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">
                  No recommendations available for this period
                </p>
              </div>}
          </div>}
      </div>
    </div>;
};