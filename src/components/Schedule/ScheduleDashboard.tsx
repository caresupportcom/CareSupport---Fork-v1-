import React, { useEffect, useState } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { CoordinatorDashboard } from './Dashboard/CoordinatorDashboard';
import { CaregiverDashboard } from './Dashboard/CaregiverDashboard';
import { FamilyDashboard } from './Dashboard/FamilyDashboard';
import { CommunityDashboard } from './Dashboard/CommunityDashboard';
import { CoverageInsightsPanel } from '../Insights/CoverageInsightsPanel';
import { ShiftPlanningTool } from '../Insights/ShiftPlanningTool';
import { CareStatistics } from '../Insights/CareStatistics';
import { CareRecipientTrends } from '../Insights/CareRecipientTrends';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const ScheduleDashboard = ({
  navigateTo
}) => {
  const {
    userRole
  } = useUserProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  const [insightType, setInsightType] = useState('coverage');
  // Date range for insights
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const oneWeekLaterStr = oneWeekLater.toISOString().split('T')[0];
  const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0];
  useEffect(() => {
    // Track dashboard view
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'schedule_dashboard_viewed',
      user_role: userRole
    });
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [userRole]);
  // Handle insight type change
  const handleInsightTypeChange = type => {
    setInsightType(type);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'insight_type_changed',
      insight_type: type
    });
  };
  // Toggle insights panel
  const toggleInsights = () => {
    setShowInsights(!showInsights);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: showInsights ? 'insights_closed' : 'insights_opened'
    });
  };
  // Render different dashboard based on user role
  const renderRoleDashboard = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center p-6">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>;
    }
    switch (userRole) {
      case 'coordinator':
        return <CoordinatorDashboard navigateTo={navigateTo} />;
      case 'professional':
        return <CaregiverDashboard navigateTo={navigateTo} />;
      case 'family':
        return <FamilyDashboard navigateTo={navigateTo} />;
      case 'community':
        return <CommunityDashboard navigateTo={navigateTo} />;
      default:
        return <div className="px-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Schedule Dashboard</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <p className="text-gray-600">
                  Please select a role in your profile settings to see a
                  personalized dashboard.
                </p>
              </div>
            </div>
          </div>;
    }
  };
  // Render insights based on selected type
  const renderInsights = () => {
    switch (insightType) {
      case 'coverage':
        return <CoverageInsightsPanel startDate={oneWeekAgoStr} endDate={oneWeekLaterStr} />;
      case 'planning':
        return <ShiftPlanningTool startDate={todayStr} endDate={oneWeekLaterStr} />;
      case 'statistics':
        return <CareStatistics startDate={oneWeekAgoStr} endDate={todayStr} previousStartDate={twoWeeksAgoStr} previousEndDate={oneWeekAgoStr} />;
      case 'trends':
        return <CareRecipientTrends startDate={oneWeekAgoStr} endDate={todayStr} previousStartDate={twoWeeksAgoStr} previousEndDate={oneWeekAgoStr} />;
      default:
        return <CoverageInsightsPanel startDate={oneWeekAgoStr} endDate={oneWeekLaterStr} />;
    }
  };
  return <div className="py-4 px-6">
      {/* Insights Toggle Button (Coordinator Only) */}
      {userRole === 'coordinator' && <div className="mb-4 flex justify-end">
          <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${showInsights ? 'bg-blue-100 text-blue-700' : 'bg-blue-500 text-white'}`} onClick={toggleInsights}>
            {showInsights ? 'Hide Insights & Planning' : 'Show Insights & Planning'}
          </button>
        </div>}

      {/* Insights Panel (Coordinator Only) */}
      {userRole === 'coordinator' && showInsights && <div className="mb-6">
          {/* Insight Type Selector */}
          <div className="bg-white rounded-lg border border-gray-200 mb-4">
            <div className="flex">
              <button className={`flex-1 py-3 text-sm font-medium ${insightType === 'coverage' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleInsightTypeChange('coverage')}>
                Coverage Insights
              </button>
              <button className={`flex-1 py-3 text-sm font-medium ${insightType === 'planning' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleInsightTypeChange('planning')}>
                Shift Planning
              </button>
              <button className={`flex-1 py-3 text-sm font-medium ${insightType === 'statistics' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleInsightTypeChange('statistics')}>
                Care Statistics
              </button>
              <button className={`flex-1 py-3 text-sm font-medium ${insightType === 'trends' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleInsightTypeChange('trends')}>
                Recipient Trends
              </button>
            </div>
          </div>
          {/* Render Selected Insight Panel */}
          {renderInsights()}
        </div>}

      {/* Role-specific Dashboard */}
      {renderRoleDashboard()}
    </div>;
};