import React from 'react';
import { AlertTriangleIcon, CheckCircleIcon, ClockIcon, UsersIcon, CalendarIcon } from 'lucide-react';
import { CoverageMetrics, SimplifiedCoverageGap } from '../../../types/ScheduleTypes';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';

interface CoverageOverviewProps {
  metrics: CoverageMetrics | null;
  criticalGaps: SimplifiedCoverageGap[];
  onViewGap: (gapId: string) => void;
  onRequestCoverage: (gapId: string) => void;
  selectedDate: Date;
  isLoading?: boolean;
}

export const CoverageOverview: React.FC<CoverageOverviewProps> = ({
  metrics,
  criticalGaps,
  onViewGap,
  onRequestCoverage,
  selectedDate,
  isLoading = false
}) => {
  // Format time for display
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

  // Handle gap action
  const handleGapAction = (gap: SimplifiedCoverageGap, action: 'view' | 'request') => {
    if (action === 'view') {
      onViewGap(gap.id);
    } else {
      onRequestCoverage(gap.id);
    }
    
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_gap_action',
      action,
      gap_id: gap.id,
      gap_priority: gap.priority
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-cs-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-cs-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-32 bg-cs-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cs-text-primary mb-2">
          Coverage Overview
        </h1>
        <p className="text-cs-text-secondary">
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Critical Gaps Alert */}
      {criticalGaps.length > 0 && (
        <div className="bg-cs-bg-urgent border-l-4 border-cs-gap-critical rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangleIcon className="w-6 h-6 text-cs-gap-critical mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-cs-text-primary mb-1">
                {criticalGaps.length} Critical Coverage Gap{criticalGaps.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-cs-text-secondary mb-3">
                Immediate attention required to ensure continuous care
              </p>
              <div className="space-y-2">
                {criticalGaps.slice(0, 2).map(gap => (
                  <div 
                    key={gap.id}
                    className="bg-white rounded-lg p-3 border border-cs-gap-critical/20"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-cs-text-primary">
                          {formatDate(gap.date)}
                        </div>
                        <div className="text-sm text-cs-text-secondary">
                          {formatTime(gap.startTime)} - {formatTime(gap.endTime)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleGapAction(gap, 'view')}
                          className="px-3 py-1 text-xs bg-cs-gray-100 text-cs-text-primary rounded-lg hover:bg-cs-gray-200 focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleGapAction(gap, 'request')}
                          className="px-3 py-1 text-xs bg-cs-gap-critical text-cs-text-on-dark rounded-lg hover:bg-cs-gap-critical/90 focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
                        >
                          Request Coverage
                        </button>
                      </div>
                    </div>
                    {gap.suggestedCaregivers.length > 0 && (
                      <div className="text-xs text-cs-text-secondary">
                        Available: {gap.suggestedCaregivers.length} caregiver{gap.suggestedCaregivers.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {criticalGaps.length > 2 && (
                <div className="mt-3">
                  <button
                    onClick={() => analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
                      feature_name: 'view_all_critical_gaps'
                    })}
                    className="text-sm text-cs-gap-critical font-medium hover:underline"
                  >
                    View all {criticalGaps.length} critical gaps →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coverage Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall Coverage */}
          <div className="bg-cs-bg-card border border-cs-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-cs-interactive-primary/10 flex items-center justify-center mr-3">
                <CheckCircleIcon className="w-5 h-5 text-cs-interactive-primary" />
              </div>
              <div>
                <h3 className="font-medium text-cs-text-primary">Coverage</h3>
                <p className="text-xs text-cs-text-secondary">This week</p>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-cs-text-primary">
                {metrics.coveragePercentage}%
              </div>
              <div className="text-sm text-cs-text-secondary">
                {metrics.coveredHours} of {metrics.totalHours} hours covered
              </div>
            </div>
            <div className="w-full bg-cs-gray-200 rounded-full h-2">
              <div 
                className="bg-cs-covered-confirmed h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.coveragePercentage}%` }}
              />
            </div>
          </div>

          {/* Critical Issues */}
          <div className="bg-cs-bg-card border border-cs-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-cs-gap-critical/10 flex items-center justify-center mr-3">
                <AlertTriangleIcon className="w-5 h-5 text-cs-gap-critical" />
              </div>
              <div>
                <h3 className="font-medium text-cs-text-primary">Critical Gaps</h3>
                <p className="text-xs text-cs-text-secondary">Need immediate attention</p>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-cs-text-primary">
                {metrics.criticalGaps}
              </div>
              <div className="text-sm text-cs-text-secondary">
                {metrics.moderateGaps} moderate gaps
              </div>
            </div>
            {metrics.criticalGaps > 0 && (
              <div className="text-xs text-cs-gap-critical font-medium">
                Requires immediate action
              </div>
            )}
          </div>

          {/* Team Status */}
          <div className="bg-cs-bg-card border border-cs-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-cs-maybe-available/10 flex items-center justify-center mr-3">
                <UsersIcon className="w-5 h-5 text-cs-maybe-available" />
              </div>
              <div>
                <h3 className="font-medium text-cs-text-primary">Team Status</h3>
                <p className="text-xs text-cs-text-secondary">Shift assignments</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-cs-text-secondary">Confirmed:</span>
                <span className="font-medium text-cs-covered-confirmed">
                  {metrics.confirmedShifts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cs-text-secondary">Tentative:</span>
                <span className="font-medium text-cs-maybe-available">
                  {metrics.tentativeShifts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cs-text-secondary">Open:</span>
                <span className="font-medium text-cs-gap-critical">
                  {metrics.openShifts}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Critical Gaps State */}
      {criticalGaps.length === 0 && metrics && metrics.criticalGaps === 0 && (
        <div className="bg-cs-covered-confirmed/10 border border-cs-covered-confirmed/20 rounded-lg p-6 text-center">
          <CheckCircleIcon className="w-12 h-12 text-cs-covered-confirmed mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-cs-text-primary mb-2">
            All Critical Periods Covered
          </h2>
          <p className="text-cs-text-secondary">
            Great work! All essential care periods have confirmed coverage.
          </p>
          {metrics.moderateGaps > 0 && (
            <p className="text-sm text-cs-text-secondary mt-2">
              {metrics.moderateGaps} moderate gap{metrics.moderateGaps !== 1 ? 's' : ''} remain for optimal coverage.
            </p>
          )}
        </div>
      )}
    </div>
  );
};