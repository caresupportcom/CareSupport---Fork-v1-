import React, { useEffect, useState } from 'react';
import { HandIcon, HeartIcon, CalendarIcon, MapPinIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon, StarIcon, TrendingUpIcon } from 'lucide-react';
import { dataService } from '../../../services/DataService';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';
import { storage } from '../../../services/StorageService';
interface CommunityDashboardProps {
  navigateTo: (screen: string, data?: any) => void;
}
export const CommunityDashboard: React.FC<CommunityDashboardProps> = ({
  navigateTo
}) => {
  const [helpOpportunities, setHelpOpportunities] = useState([]);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [contributionStats, setContributionStats] = useState({
    tasksCompleted: 0,
    lastContribution: null,
    preferredCategories: {}
  });
  const userId = storage.get('user_id', '');
  useEffect(() => {
    loadDashboardData();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'community_dashboard_viewed'
    });
  }, []);
  const loadDashboardData = () => {
    // Load open help opportunities
    const opportunities = dataService.getHelpOpportunitiesByStatus('open');
    setHelpOpportunities(opportunities);
    // Load accepted tasks
    const accepted = dataService.getHelpOpportunitiesAcceptedByUser(userId);
    setAcceptedTasks(accepted);
    // Load contribution stats
    const stats = dataService.getContributionHistory(userId);
    setContributionStats(stats);
  };
  // Format date for display
  const formatDate = dateStr => {
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
  // Format time
  const formatTime = timeStr => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Format relative time
  const formatRelativeTime = dateString => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  // Get category display name
  const getCategoryDisplayName = category => {
    const categoryNames = {
      transportation: 'Transportation',
      errands: 'Errands',
      meals: 'Meal Preparation',
      companionship: 'Companionship',
      household: 'Household Help'
    };
    return categoryNames[category] || category.replace('_', ' ');
  };
  // Get top preferred category
  const getTopPreferredCategory = () => {
    const categories = contributionStats.preferredCategories;
    if (Object.keys(categories).length === 0) return 'None yet';
    let topCategory = '';
    let topCount = 0;
    Object.entries(categories).forEach(([category, count]) => {
      if (count > topCount) {
        topCount = count;
        topCategory = category;
      }
    });
    return getCategoryDisplayName(topCategory);
  };
  // Handle view all opportunities
  const handleViewAllOpportunities = () => {
    navigateTo('help-needed');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'community_view_all_opportunities'
    });
  };
  // Handle accept opportunity
  const handleAcceptOpportunity = opportunityId => {
    // In a real app, this would update the opportunity status
    console.log('Accept opportunity', opportunityId);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'community_accept_opportunity',
      opportunity_id: opportunityId
    });
  };
  // Handle view opportunity details
  const handleViewOpportunity = opportunity => {
    navigateTo('help-request-detail', opportunity);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'community_view_opportunity',
      opportunity_id: opportunity.id
    });
  };
  // Handle view contribution history
  const handleViewContributions = () => {
    navigateTo('community-dashboard');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'community_view_contributions'
    });
  };
  return <div>
      {/* Contribution Stats */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <HeartIcon className="w-5 h-5 mr-2 text-red-600" />
          Your Contributions
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {contributionStats.tasksCompleted}
              </div>
              <div className="text-xs text-gray-500">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {contributionStats.lastContribution ? formatRelativeTime(contributionStats.lastContribution) : 'Never'}
              </div>
              <div className="text-xs text-gray-500">Last Helped</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {getTopPreferredCategory()}
              </div>
              <div className="text-xs text-gray-500">Top Category</div>
            </div>
          </div>
          <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center justify-center" onClick={handleViewContributions}>
            <TrendingUpIcon className="w-4 h-4 mr-1" />
            View Full Stats
          </button>
        </div>
      </div>
      {/* Available Help Opportunities */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold flex items-center">
            <HandIcon className="w-5 h-5 mr-2 text-blue-600" />
            Available Opportunities
          </h2>
          <button className="text-sm text-blue-600" onClick={handleViewAllOpportunities}>
            View All
          </button>
        </div>
        {helpOpportunities.length > 0 ? <div className="space-y-3">
            {helpOpportunities.slice(0, 3).map(opportunity => <div key={opportunity.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{opportunity.title}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${opportunity.priority === 'high' ? 'bg-red-100 text-red-800' : opportunity.priority === 'medium' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                    {opportunity.priority} priority
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {opportunity.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <div className="flex items-center">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                    {formatDate(opportunity.dueDate)}
                  </div>
                  {opportunity.dueTime && <div className="flex items-center">
                      <ClockIcon className="w-3.5 h-3.5 mr-1" />
                      {formatTime(opportunity.dueTime)}
                    </div>}
                  {opportunity.duration && <div className="flex items-center">
                      <ClockIcon className="w-3.5 h-3.5 mr-1" />
                      {opportunity.duration} min
                    </div>}
                  {opportunity.location && <div className="flex items-center">
                      <MapPinIcon className="w-3.5 h-3.5 mr-1" />
                      {opportunity.location}
                    </div>}
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm" onClick={() => handleAcceptOpportunity(opportunity.id)}>
                    I Can Help
                  </button>
                  <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm" onClick={() => handleViewOpportunity(opportunity)}>
                    View Details
                  </button>
                </div>
              </div>)}
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-gray-700">
              No help opportunities available right now
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Check back later for new requests
            </p>
          </div>}
      </div>
      {/* Your Accepted Tasks */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
          Your Accepted Tasks
        </h2>
        {acceptedTasks.length > 0 ? <div className="space-y-3">
            {acceptedTasks.map(task => <div key={task.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{task.title}</div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Accepted
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                  <div className="flex items-center">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                    {formatDate(task.dueDate)}
                  </div>
                  {task.dueTime && <div className="flex items-center">
                      <ClockIcon className="w-3.5 h-3.5 mr-1" />
                      {formatTime(task.dueTime)}
                    </div>}
                </div>
                <button className="w-full py-2 bg-white text-green-700 border border-green-300 rounded-lg text-sm" onClick={() => handleViewOpportunity(task)}>
                  View Details
                </button>
              </div>)}
          </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">You haven't accepted any tasks yet</p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm" onClick={handleViewAllOpportunities}>
              Find Opportunities
            </button>
          </div>}
      </div>
    </div>;
};