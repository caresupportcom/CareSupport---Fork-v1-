import React, { useEffect, useState } from 'react';
import { BarChart2Icon, CalendarIcon, AlertTriangleIcon, ClockIcon, UsersIcon, TrendingUpIcon, CheckCircleIcon } from 'lucide-react';
import { coverageService } from '../../services/CoverageService';
import { shiftService } from '../../services/ShiftService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
interface CoverageInsightsPanelProps {
  startDate: string;
  endDate: string;
  onViewGap?: (gapId: string) => void;
}
export const CoverageInsightsPanel: React.FC<CoverageInsightsPanelProps> = ({
  startDate,
  endDate,
  onViewGap
}) => {
  const [coverageMetrics, setCoverageMetrics] = useState({
    totalHours: 0,
    coveredHours: 0,
    coveragePercentage: 0,
    gapsCount: 0,
    criticalGapsCount: 0
  });
  const [coverageByDay, setCoverageByDay] = useState<Record<string, number>>({});
  const [coverageGaps, setCoverageGaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadInsights();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_insights_viewed',
      date_range: `${startDate} to ${endDate}`
    });
  }, [startDate, endDate]);
  const loadInsights = async () => {
    setIsLoading(true);
    // Get all shifts in the date range
    const shifts = getShiftsInRange(startDate, endDate);
    // Get all coverage gaps in the date range
    const gaps = getCoverageGapsInRange(startDate, endDate);
    setCoverageGaps(gaps);
    // Calculate coverage metrics
    const metrics = calculateCoverageMetrics(shifts, gaps, startDate, endDate);
    setCoverageMetrics(metrics);
    // Calculate coverage by day
    const byDay = calculateCoverageByDay(shifts, startDate, endDate);
    setCoverageByDay(byDay);
    setIsLoading(false);
  };
  // Get all shifts in the date range
  const getShiftsInRange = (start: string, end: string) => {
    const allShifts = shiftService.getShifts();
    return allShifts.filter(shift => shift.date >= start && shift.date <= end && shift.assignedTo !== null);
  };
  // Get all coverage gaps in the date range
  const getCoverageGapsInRange = (start: string, end: string) => {
    const allGaps = coverageService.getCoverageGaps();
    return allGaps.filter(gap => gap.date >= start && gap.date <= end);
  };
  // Calculate coverage metrics
  const calculateCoverageMetrics = (shifts, gaps, start: string, end: string) => {
    // Calculate total hours in the date range (16 hours per day, 8am-midnight)
    const days = getDaysBetweenDates(start, end);
    const totalHours = days * 16;
    // Calculate covered hours based on shifts
    let coveredMinutes = 0;
    shifts.forEach(shift => {
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
    const coveragePercentage = Math.round(coveredHours / totalHours * 100);
    // Count gaps by priority
    const gapsCount = gaps.length;
    const criticalGapsCount = gaps.filter(gap => gap.priority === 'high').length;
    return {
      totalHours,
      coveredHours,
      coveragePercentage,
      gapsCount,
      criticalGapsCount
    };
  };
  // Calculate coverage percentage by day
  const calculateCoverageByDay = (shifts, start: string, end: string) => {
    const coverage: Record<string, number> = {};
    const currentDate = new Date(start);
    const lastDate = new Date(end);
    // Initialize coverage for each day
    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      coverage[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    // Calculate coverage for each day
    shifts.forEach(shift => {
      const date = shift.date;
      if (coverage[date] !== undefined) {
        const startMinutes = timeToMinutes(shift.startTime);
        const endMinutes = timeToMinutes(shift.endTime);
        // Calculate minutes covered
        let minutesCovered = 0;
        if (endMinutes < startMinutes) {
          minutesCovered = 24 * 60 - startMinutes + endMinutes;
        } else {
          minutesCovered = endMinutes - startMinutes;
        }
        // Convert to hours and add to coverage
        coverage[date] += Math.round(minutesCovered / 60);
      }
    });
    // Convert hours to percentage (out of 16 hours)
    Object.keys(coverage).forEach(date => {
      coverage[date] = Math.min(100, Math.round(coverage[date] / 16 * 100));
    });
    return coverage;
  };
  // Helper function to get number of days between dates
  const getDaysBetweenDates = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  };
  // Helper function to convert time to minutes
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  // Format time from 24-hour to 12-hour format
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Handle clicking on a gap
  const handleGapClick = (gapId: string) => {
    if (onViewGap) {
      onViewGap(gapId);
    }
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_gap_viewed',
      gap_id: gapId
    });
  };
  if (isLoading) {
    return <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>;
  }
  return <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold flex items-center">
          <BarChart2Icon className="w-5 h-5 mr-2 text-blue-600" />
          Coverage Insights
        </h2>
        <p className="text-sm text-gray-500">
          {formatDate(startDate)} - {formatDate(endDate)}
        </p>
      </div>
      {/* Coverage Metrics */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {coverageMetrics.coveragePercentage}%
            </div>
            <div className="text-sm text-blue-600">Coverage</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-700">
              {coverageMetrics.gapsCount}
            </div>
            <div className="text-sm text-orange-600">Coverage Gaps</div>
          </div>
          <div className={`rounded-lg p-3 text-center ${coverageMetrics.criticalGapsCount > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className={`text-2xl font-bold ${coverageMetrics.criticalGapsCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {coverageMetrics.criticalGapsCount}
            </div>
            <div className={`text-sm ${coverageMetrics.criticalGapsCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              Critical Gaps
            </div>
          </div>
        </div>
      </div>
      {/* Coverage by Day */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
          Coverage by Day
        </h3>
        <div className="space-y-2">
          {Object.entries(coverageByDay).map(([date, percentage]) => <div key={date} className="flex items-center">
              <div className="w-24 text-sm text-gray-600">
                {formatDate(date)}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${percentage < 50 ? 'bg-red-500' : percentage < 80 ? 'bg-orange-500' : 'bg-green-500'}`} style={{
                width: `${percentage}%`
              }}></div>
                </div>
              </div>
              <div className="w-12 text-right text-sm text-gray-600">
                {percentage}%
              </div>
            </div>)}
        </div>
      </div>
      {/* Coverage Gaps */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <AlertTriangleIcon className="w-4 h-4 mr-1 text-orange-500" />
          Identified Coverage Gaps
        </h3>
        {coverageGaps.length > 0 ? <div className="space-y-2">
            {coverageGaps.slice(0, 3).map(gap => <div key={gap.id} className={`p-3 rounded-lg border ${gap.priority === 'high' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'} cursor-pointer hover:shadow-md transition-shadow`} onClick={() => handleGapClick(gap.id)}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{formatDate(gap.date)}</div>
                    <div className="text-sm text-gray-600">
                      {formatTime(gap.startTime)} - {formatTime(gap.endTime)}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${gap.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                    {gap.priority} priority
                  </span>
                </div>
              </div>)}
            {coverageGaps.length > 3 && <div className="text-sm text-blue-600 text-center">
                +{coverageGaps.length - 3} more gaps
              </div>}
          </div> : <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-green-800">No coverage gaps identified</p>
          </div>}
      </div>
    </div>;
};