import React, { useEffect, useState } from 'react';
import { UsersIcon, HeartIcon, CalendarIcon, MapPinIcon, ClockIcon, ArrowRightIcon, TrendingUpIcon, ShieldIcon, HandIcon, UserPlusIcon, CheckIcon, StarIcon, AwardIcon, BellIcon, FilterIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { dataService } from '../../services/DataService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { TaskRequestCard } from './TaskRequestCard';
import { CommunityMemberCard } from './CommunityMemberCard';
import { ContributionStats } from './ContributionStats';
const ShoppingCartIcon = props => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>;
const HomeIcon = props => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>;
const PillIcon = props => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>;
const UtensilsIcon = props => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>;
const ActivityIcon = props => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>;
export const CommunityDashboardScreen = ({
  navigateTo
}) => {
  const [activeTab, setActiveTab] = useState('requests');
  const [taskRequests, setTaskRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    urgency: [],
    distance: 'any'
  });
  const [userStats, setUserStats] = useState({
    tasksCompleted: 0,
    tasksCreated: 0,
    lastContribution: null
  });
  const [communityMembers, setCommunityMembers] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  // Load data on component mount
  useEffect(() => {
    // Get task requests
    const requests = dataService.getTaskRequests();
    setTaskRequests(requests);
    setFilteredRequests(requests);
    // Get user stats - using a placeholder user ID for demo
    const currentUserId = 'james';
    const userContributions = dataService.getContributionHistory(currentUserId);
    setUserStats({
      tasksCompleted: userContributions.tasksCompleted || 0,
      tasksCreated: requests.filter(r => r.createdBy === currentUserId).length,
      lastContribution: userContributions.lastContribution
    });
    // Get team members for community display
    const members = dataService.getTeamMembers();
    setCommunityMembers(members);
    // Create sample top contributors
    setTopContributors([{
      id: 'maria',
      name: 'Maria Rodriguez',
      tasksCompleted: 12,
      specialties: ['transportation', 'meal_preparation'],
      badge: 'gold'
    }, {
      id: 'james',
      name: 'James Wilson',
      tasksCompleted: 8,
      specialties: ['medication_management', 'health_monitoring'],
      badge: 'silver'
    }, {
      id: 'linda',
      name: 'Linda Chen',
      tasksCompleted: 5,
      specialties: ['companionship', 'grocery_shopping'],
      badge: 'bronze'
    }]);
    // Track screen view
    analytics.trackScreenView('community_dashboard');
  }, []);
  // Apply filters to task requests
  const applyFilters = () => {
    let filtered = [...taskRequests];
    // Filter by category
    if (filters.categories.length > 0) {
      filtered = filtered.filter(request => filters.categories.includes(request.category));
    }
    // Filter by urgency/priority
    if (filters.urgency.length > 0) {
      filtered = filtered.filter(request => filters.urgency.includes(request.priority));
    }
    // In a real app, we would filter by distance based on user location
    // For now, we'll just simulate this filter
    if (filters.distance !== 'any') {
      const distanceMap = {
        nearby: ['request1', 'request3'],
        medium: ['request2', 'request4'],
        far: ['request5']
      };
      filtered = filtered.filter(request => distanceMap[filters.distance].includes(request.id));
    }
    setFilteredRequests(filtered);
    setShowFilters(false);
    // Track filter usage
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'community_filters',
      filter_categories: filters.categories.join(','),
      filter_urgency: filters.urgency.join(','),
      filter_distance: filters.distance
    });
  };
  // Handle claiming a task
  const handleClaimTask = taskId => {
    // In a real app, we would update the task status in the database
    dataService.claimTaskRequest(taskId, 'james'); // Using a placeholder user ID
    // Update the local state
    const updatedRequests = taskRequests.map(request => request.id === taskId ? {
      ...request,
      status: 'claimed',
      claimedBy: 'james',
      claimedAt: new Date().toISOString()
    } : request);
    setTaskRequests(updatedRequests);
    setFilteredRequests(updatedRequests.filter(request => request.status === 'open'));
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'claim_community_task',
      task_id: taskId
    });
  };
  // Handle viewing task details
  const handleViewTaskDetails = task => {
    navigateTo('help-request-detail', task);
  };
  // Get category display name
  const getCategoryDisplayName = category => {
    const categoryNames = {
      driving: 'Transportation',
      grocery_shopping: 'Grocery Shopping',
      keeping_company: 'Companionship',
      home_management: 'Home Management',
      managing_medications: 'Medication Management',
      meal_preparation: 'Meal Preparation',
      health_monitoring: 'Health Monitoring'
    };
    return categoryNames[category] || category.replace('_', ' ');
  };
  // Get category icon
  const getCategoryIcon = category => {
    switch (category) {
      case 'driving':
        return <MapPinIcon className="w-4 h-4" />;
      case 'grocery_shopping':
        return <ShoppingCartIcon className="w-4 h-4" />;
      case 'keeping_company':
        return <UsersIcon className="w-4 h-4" />;
      case 'home_management':
        return <HomeIcon className="w-4 h-4" />;
      case 'managing_medications':
        return <PillIcon className="w-4 h-4" />;
      case 'meal_preparation':
        return <UtensilsIcon className="w-4 h-4" />;
      case 'health_monitoring':
        return <ActivityIcon className="w-4 h-4" />;
      default:
        return <HandIcon className="w-4 h-4" />;
    }
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
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold">Community</h1>
          <div className="flex space-x-2">
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" onClick={() => navigateTo('notifications')} aria-label="Notifications">
              <BellIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button className={`w-8 h-8 rounded-full ${showFilters ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'} flex items-center justify-center`} onClick={() => setShowFilters(!showFilters)} aria-label="Filter requests">
              <FilterIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button className={`pb-2 px-1 text-sm font-medium ${activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab('requests')}>
            Help Requests
          </button>
          <button className={`pb-2 px-1 text-sm font-medium ${activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab('members')}>
            Community Members
          </button>
          <button className={`pb-2 px-1 text-sm font-medium ${activeTab === 'contributions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab('contributions')}>
            Contributions
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && <div className="bg-white p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium mb-3">Filter Help Requests</h3>
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {['driving', 'grocery_shopping', 'keeping_company', 'home_management', 'managing_medications'].map(category => <button key={category} className={`px-3 py-1 text-xs rounded-full ${filters.categories.includes(category) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => {
            const updated = filters.categories.includes(category) ? filters.categories.filter(c => c !== category) : [...filters.categories, category];
            setFilters({
              ...filters,
              categories: updated
            });
          }}>
                  {getCategoryDisplayName(category)}
                </button>)}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-2">Urgency</label>
            <div className="flex gap-2">
              {['high', 'medium', 'low'].map(urgency => <button key={urgency} className={`px-3 py-1 text-xs rounded-full ${filters.urgency.includes(urgency) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => {
            const updated = filters.urgency.includes(urgency) ? filters.urgency.filter(u => u !== urgency) : [...filters.urgency, urgency];
            setFilters({
              ...filters,
              urgency: updated
            });
          }}>
                  {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                </button>)}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-2">Distance</label>
            <select className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={filters.distance} onChange={e => setFilters({
          ...filters,
          distance: e.target.value
        })}>
              <option value="any">Any distance</option>
              <option value="nearby">Nearby ( 2 miles)</option>
              <option value="medium">Medium (2-5 miles)</option>
              <option value="far">Far ({'>'} 5 miles)</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm" onClick={() => {
          setFilters({
            categories: [],
            urgency: [],
            distance: 'any'
          });
          setFilteredRequests(taskRequests);
          setShowFilters(false);
        }}>
              Reset
            </button>
            <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </div>}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Help Requests Tab */}
        {activeTab === 'requests' && <div>
            {/* Your Stats Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <h2 className="text-sm font-semibold mb-3">
                Your Contribution Stats
              </h2>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {userStats.tasksCompleted}
                  </div>
                  <div className="text-xs text-gray-500">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {userStats.tasksCreated}
                  </div>
                  <div className="text-xs text-gray-500">Tasks Created</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {userStats.lastContribution ? formatRelativeTime(userStats.lastContribution) : 'Never'}
                  </div>
                  <div className="text-xs text-gray-500">Last Helped</div>
                </div>
              </div>
              <button className="w-full mt-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center justify-center" onClick={() => setActiveTab('contributions')}>
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                View Full Stats
              </button>
            </div>

            {/* Create Help Request Button */}
            <button className="w-full mb-4 py-3 bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center justify-center" onClick={() => navigateTo('create-help-request')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create New Help Request
            </button>

            {/* Open Requests */}
            <h2 className="text-sm font-semibold mb-2 flex items-center">
              <HandIcon className="w-4 h-4 mr-1 text-blue-500" />
              <BracketText active={true}>Open Help Requests</BracketText>
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                {filteredRequests.filter(r => r.status === 'open').length}
              </span>
            </h2>
            {filteredRequests.filter(r => r.status === 'open').length > 0 ? <div className="space-y-3 mb-6">
                {filteredRequests.filter(request => request.status === 'open').map(request => <TaskRequestCard key={request.id} request={request} onClaim={() => handleClaimTask(request.id)} onView={() => handleViewTaskDetails(request)} getCategoryDisplayName={getCategoryDisplayName} />)}
              </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-gray-700 font-medium mb-1">
                  No open requests
                </h3>
                <p className="text-gray-500 text-sm mb-3">
                  All current help requests have been claimed. Check back later
                  or create a new request.
                </p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm" onClick={() => {
            setFilters({
              categories: [],
              urgency: [],
              distance: 'any'
            });
            setFilteredRequests(taskRequests);
          }}>
                  Clear Filters
                </button>
              </div>}

            {/* In Progress Requests */}
            <h2 className="text-sm font-semibold mb-2 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1 text-orange-500" />
              <BracketText active={true}>In Progress</BracketText>
              <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full">
                {taskRequests.filter(r => r.status === 'claimed').length}
              </span>
            </h2>
            {taskRequests.filter(r => r.status === 'claimed').length > 0 ? <div className="space-y-3">
                {taskRequests.filter(request => request.status === 'claimed').map(request => <TaskRequestCard key={request.id} request={request} onView={() => handleViewTaskDetails(request)} getCategoryDisplayName={getCategoryDisplayName} showClaimButton={false} />)}
              </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">
                  No tasks currently in progress
                </p>
              </div>}
          </div>}

        {/* Community Members Tab */}
        {activeTab === 'members' && <div>
            {/* Community Overview Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <h2 className="text-sm font-semibold mb-3">Community Overview</h2>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {communityMembers.length}
                  </div>
                  <div className="text-xs text-gray-500">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">12</div>
                  <div className="text-xs text-gray-500">Tasks This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">4</div>
                  <div className="text-xs text-gray-500">Care Recipients</div>
                </div>
              </div>
              <button className="w-full mt-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center justify-center" onClick={() => navigateTo('join-care-team')}>
                <UserPlusIcon className="w-4 h-4 mr-1" />
                Invite New Member
              </button>
            </div>

            {/* Core Team Members */}
            <h2 className="text-sm font-semibold mb-2 flex items-center">
              <ShieldIcon className="w-4 h-4 mr-1 text-blue-500" />
              <BracketText active={true}>Core Care Team</BracketText>
            </h2>
            <div className="space-y-3 mb-6">
              {communityMembers.slice(0, 2).map(member => <CommunityMemberCard key={member.id} member={{
            ...member,
            role: member.role,
            lastActive: '2 hours ago',
            specialties: ['medication_management', 'health_monitoring'],
            circleType: 'core'
          }} />)}
            </div>

            {/* Extended Team Members */}
            <h2 className="text-sm font-semibold mb-2 flex items-center">
              <UsersIcon className="w-4 h-4 mr-1 text-green-500" />
              <BracketText active={true}>Extended Support Network</BracketText>
            </h2>
            <div className="space-y-3">
              {communityMembers.slice(2).map(member => <CommunityMemberCard key={member.id} member={{
            ...member,
            role: member.role,
            lastActive: '1 day ago',
            specialties: ['driving', 'grocery_shopping'],
            circleType: 'extended'
          }} />)}
            </div>
          </div>}

        {/* Contributions Tab */}
        {activeTab === 'contributions' && <div>
            <ContributionStats userStats={userStats} />
            {/* Top Contributors */}
            <h2 className="text-sm font-semibold mt-6 mb-2 flex items-center">
              <AwardIcon className="w-4 h-4 mr-1 text-yellow-500" />
              <BracketText active={true}>Top Contributors</BracketText>
            </h2>
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 mb-6">
              {topContributors.map((contributor, index) => <div key={contributor.id} className={`p-3 flex items-center justify-between ${index < topContributors.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'}`}>
                      <span className={`text-sm ${index === 0 ? 'text-yellow-700' : index === 1 ? 'text-gray-700' : 'text-orange-700'}`}>
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {contributor.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <StarIcon className="w-3 h-3 mr-1 text-yellow-500" />
                        {contributor.tasksCompleted} tasks completed
                      </div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'} flex items-center justify-center`}>
                    <AwardIcon className={`w-3.5 h-3.5 ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : 'text-orange-600'}`} />
                  </div>
                </div>)}
            </div>

            {/* Your Recent Contributions */}
            <h2 className="text-sm font-semibold mb-2 flex items-center">
              <HeartIcon className="w-4 h-4 mr-1 text-red-500" />
              <BracketText active={true}>Your Recent Contributions</BracketText>
            </h2>
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              {taskRequests.filter(request => request.status === 'completed' && request.claimedBy === 'james').slice(0, 3).map((request, index) => <div key={request.id} className={`p-3 ${index < 2 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm">{request.title}</div>
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                        Completed
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {formatRelativeTime(request.completedAt)}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                      <span>
                        {new Date(request.dueDate).toLocaleDateString()}
                      </span>
                      <div className="mx-2 w-1 h-1 bg-gray-300 rounded-full"></div>
                      <ClockIcon className="w-3.5 h-3.5 mr-1" />
                      <span>{request.duration} min</span>
                    </div>
                  </div>)}
              {taskRequests.filter(request => request.status === 'completed' && request.claimedBy === 'james').length === 0 && <div className="p-4 text-center">
                  <p className="text-gray-500 text-sm">
                    No completed contributions yet
                  </p>
                </div>}
            </div>
          </div>}
      </div>
    </div>;
};