import React, { useEffect, useState } from 'react';
import { CalendarIcon, UsersIcon, SettingsIcon, BellIcon } from 'lucide-react';
import { QuickStatusToggle } from './QuickStatusToggle';
import { CoverageOverview } from './CoverageOverview';
import { useSimplifiedSchedule } from '../../../contexts/SimplifiedScheduleContext';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';
import { useUserProfile } from '../../../contexts/UserProfileContext';

interface SimplifiedSchedulePageProps {
  navigateTo: (screen: string, data?: any) => void;
}

export const SimplifiedSchedulePage: React.FC<SimplifiedSchedulePageProps> = ({
  navigateTo
}) => {
  const {
    userAvailability,
    updateAvailabilityStatus,
    coverageGaps,
    coverageMetrics,
    refreshCoverage,
    requestCoverageForGap,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    isLoading,
    teamMembers
  } = useSimplifiedSchedule();

  const { userRole } = useUserProfile();
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Track page view
  useEffect(() => {
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'simplified_schedule_viewed',
      user_role: userRole,
      view_mode: viewMode
    });
  }, [userRole, viewMode]);

  // Get critical gaps for display
  const criticalGaps = coverageGaps.filter(gap => 
    gap.priority === 'critical' && gap.status === 'open'
  );

  // Handle view mode change
  const handleViewModeChange = (mode: 'overview' | 'availability' | 'coordination') => {
    setViewMode(mode);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'schedule_view_mode_changed',
      new_mode: mode,
      previous_mode: viewMode
    });
  };

  // Handle gap view
  const handleViewGap = (gapId: string) => {
    // In MVP, this could navigate to a detailed gap view or open a modal
    console.log('View gap:', gapId);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_gap_viewed',
      gap_id: gapId
    });
  };

  // Handle coverage request
  const handleRequestCoverage = (gapId: string) => {
    const gap = coverageGaps.find(g => g.id === gapId);
    if (!gap) return;

    // For MVP, request from all suggested caregivers
    if (gap.suggestedCaregivers.length > 0) {
      requestCoverageForGap(gapId, gap.suggestedCaregivers);
    }
    
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_requested_from_overview',
      gap_id: gapId,
      caregiver_count: gap.suggestedCaregivers.length
    });
  };

  // Handle availability status change
  const handleAvailabilityChange = (status: any) => {
    updateAvailabilityStatus(status);
  };

  // Determine if user is a coordinator
  const isCoordinator = userRole === 'coordinator' || userRole === 'family';

  return (
    <div className="h-full flex flex-col bg-cs-bg-page">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-cs-bg-card border-b border-cs-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-cs-text-primary">Schedule</h1>
          <div className="flex space-x-3">
            <button 
              className="w-10 h-10 rounded-full bg-cs-gray-100 flex items-center justify-center relative hover:bg-cs-gray-200 focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
              onClick={() => navigateTo('notifications')}
              aria-label="View notifications"
            >
              <BellIcon className="w-5 h-5 text-cs-text-secondary" />
              {criticalGaps.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-cs-gap-critical rounded-full"></span>
              )}
            </button>
            <button 
              className="w-10 h-10 rounded-full bg-cs-gray-100 flex items-center justify-center hover:bg-cs-gray-200 focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
              onClick={() => setShowQuickActions(!showQuickActions)}
              aria-label="Schedule settings"
            >
              <SettingsIcon className="w-5 h-5 text-cs-text-secondary" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex space-x-1 bg-cs-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleViewModeChange('overview')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary ${
              viewMode === 'overview'
                ? 'bg-cs-bg-card text-cs-interactive-primary shadow-sm'
                : 'text-cs-text-secondary hover:text-cs-text-primary'
            }`}
            aria-pressed={viewMode === 'overview'}
          >
            <CalendarIcon className="w-4 h-4 mr-2 inline" />
            Coverage
          </button>
          <button
            onClick={() => handleViewModeChange('availability')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary ${
              viewMode === 'availability'
                ? 'bg-cs-bg-card text-cs-interactive-primary shadow-sm'
                : 'text-cs-text-secondary hover:text-cs-text-primary'
            }`}
            aria-pressed={viewMode === 'availability'}
          >
            <UsersIcon className="w-4 h-4 mr-2 inline" />
            My Availability
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {viewMode === 'overview' && (
          <CoverageOverview
            metrics={coverageMetrics}
            criticalGaps={criticalGaps}
            onViewGap={handleViewGap}
            onRequestCoverage={handleRequestCoverage}
            selectedDate={selectedDate}
            isLoading={isLoading}
          />
        )}

        {viewMode === 'availability' && (
          <div className="space-y-6">
            <QuickStatusToggle
              currentStatus={userAvailability?.status || 'available'}
              onStatusChange={handleAvailabilityChange}
              disabled={isLoading}
            />
            
            {/* Calendar input will be added in Phase 2 */}
            <div className="bg-cs-bg-card border border-cs-gray-200 rounded-lg p-6 text-center">
              <CalendarIcon className="w-12 h-12 text-cs-text-secondary mx-auto mb-3" />
              <h3 className="text-lg font-medium text-cs-text-primary mb-2">
                Calendar Input
              </h3>
              <p className="text-cs-text-secondary">
                Detailed calendar availability input will be available in the next update.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
          <div className="bg-cs-bg-card rounded-t-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-cs-text-primary mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  refreshCoverage();
                  setShowQuickActions(false);
                }}
                className="w-full py-3 bg-cs-interactive-primary text-cs-text-on-dark rounded-lg font-medium hover:bg-cs-interactive-hover focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
              >
                Refresh Coverage Data
              </button>
              {isCoordinator && (
                <button
                  onClick={() => {
                    navigateTo('create-shift');
                    setShowQuickActions(false);
                  }}
                  className="w-full py-3 bg-cs-gray-100 text-cs-text-primary rounded-lg font-medium hover:bg-cs-gray-200 focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
                >
                  Create New Shift
                </button>
              )}
              <button
                onClick={() => setShowQuickActions(false)}
                className="w-full py-3 bg-cs-gray-100 text-cs-text-primary rounded-lg font-medium hover:bg-cs-gray-200 focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};