import React, { useEffect, useState } from 'react';
import { PlusIcon, FilterIcon, BellIcon, UsersIcon, HeartIcon, HandIcon, CalendarIcon, ClockIcon, MapPinIcon, ShieldIcon } from 'lucide-react';
import { dataService, TaskRequest } from '../../services/DataService';
import { storage } from '../../services/StorageService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { getRelationshipCategory } from '../../types/UserTypes';
export const HelpNeededScreen = ({
  navigateTo
}) => {
  const {
    userProfile
  } = useUserProfile();
  const [activeTab, setActiveTab] = useState('open');
  const [taskRequests, setTaskRequests] = useState<TaskRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    priority: [],
    timeframe: 'all'
  });
  // Get user role category (family, professional, community)
  const userRoleCategory = userProfile?.relationship ? getRelationshipCategory(userProfile.relationship) : 'family';
  useEffect(() => {
    loadTaskRequests();
    // Track screen view
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_needed_screen_viewed',
      active_tab: activeTab,
      user_role: userRoleCategory
    });
  }, [activeTab, userRoleCategory]);
  const loadTaskRequests = () => {
    setIsLoading(true);
    setTimeout(() => {
      const allRequests = dataService.getTaskRequests();
      let filteredRequests: TaskRequest[] = [];
      if (activeTab === 'open') {
        filteredRequests = allRequests.filter(request => request.status === 'open');
      } else if (activeTab === 'claimed') {
        // Show tasks claimed by current user
        const userId = storage.get('user_id', '');
        filteredRequests = allRequests.filter(request => request.status === 'claimed' && request.claimedBy === userId);
      } else if (activeTab === 'my-requests') {
        // Show tasks created by current user
        const userId = storage.get('user_id', '');
        filteredRequests = allRequests.filter(request => request.createdBy === userId);
      } else if (activeTab === 'completed') {
        filteredRequests = allRequests.filter(request => request.status === 'completed');
      }
      // Apply filters if any are active
      if (filters.categories.length > 0) {
        filteredRequests = filteredRequests.filter(request => filters.categories.includes(request.category));
      }
      if (filters.priority.length > 0) {
        filteredRequests = filteredRequests.filter(request => filters.priority.includes(request.priority));
      }
      if (filters.timeframe !== 'all') {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        filteredRequests = filteredRequests.filter(request => {
          if (filters.timeframe === 'today') {
            return request.dueDate === today;
          } else if (filters.timeframe === 'tomorrow') {
            return request.dueDate === tomorrow;
          } else if (filters.timeframe === 'week') {
            return request.dueDate >= today && request.dueDate <= nextWeek;
          }
          return true;
        });
      }
      // Sort by priority and due date
      filteredRequests.sort((a, b) => {
        // First by priority
        const priorityOrder = {
          high: 0,
          medium: 1,
          low: 2
        };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // Then by due date
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      setTaskRequests(filteredRequests);
      setIsLoading(false);
    }, 500); // Simulate loading time
  };
  const handleTabChange = tab => {
    setActiveTab(tab);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_needed_tab_changed',
      tab: tab
    });
  };
  const handleRequestClick = request => {
    navigateTo('help-request-detail', request);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_request_viewed',
      request_id: request.id,
      request_status: request.status
    });
  };
  const handleCreateRequest = () => {
    navigateTo('create-help-request');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'create_help_request_initiated'
    });
  };
  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_needed_filters_toggled',
      filters_shown: !showFilters
    });
  };
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => {
      let updatedFilters = {
        ...prevFilters
      };
      if (filterType === 'categories' || filterType === 'priority') {
        // Toggle array values
        if (updatedFilters[filterType].includes(value)) {
          updatedFilters[filterType] = updatedFilters[filterType].filter(item => item !== value);
        } else {
          updatedFilters[filterType] = [...updatedFilters[filterType], value];
        }
      } else {
        // Direct assignment for other filter types
        updatedFilters[filterType] = value;
      }
      // Track filter change
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'help_needed_filter_changed',
        filter_type: filterType,
        filter_value: value
      });
      return updatedFilters;
    });
  };
  const handleApplyFilters = () => {
    setShowFilters(false);
    loadTaskRequests();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_needed_filters_applied',
      filters: filters
    });
  };
  const handleClearFilters = () => {
    setFilters({
      categories: [],
      priority: [],
      timeframe: 'all'
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_needed_filters_cleared'
    });
  };
  const getCategoryIcon = category => {
    switch (category) {
      case 'driving':
        return <MapPinIcon className="w-4 h-4" />;
      case 'grocery_shopping':
        return <ShoppingCartIcon className="w-4 h-4" />;
      case 'keeping_company':
        return <HeartIcon className="w-4 h-4" />;
      case 'home_management':
        return <HomeIcon className="w-4 h-4" />;
      case 'managing_medications':
        return <PillIcon className="w-4 h-4" />;
      default:
        return <HandIcon className="w-4 h-4" />;
    }
  };
  const getCategoryLabel = category => {
    const labels = {
      driving: 'Transportation',
      grocery_shopping: 'Grocery Shopping',
      keeping_company: 'Companionship',
      home_management: 'Home Management',
      managing_medications: 'Medication Management',
      meal_preparation: 'Meal Preparation',
      errands: 'Errands',
      appointment: 'Appointment',
      exercise: 'Exercise Support'
    };
    return labels[category] || category.replace('_', ' ');
  };
  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  const formatDate = dateString => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateString === today) {
      return 'Today';
    } else if (dateString === tomorrow) {
      return 'Tomorrow';
    } else {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  const formatTime = timeString => {
    if (!timeString) return 'Flexible';
    // Handle 24-hour format (e.g., "14:00")
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    }
    return timeString;
  };
  const formatDuration = minutes => {
    if (!minutes) return '';
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
    }
  };
  const renderEmptyState = () => <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <HandIcon className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {activeTab === 'open' ? 'No help requests available' : activeTab === 'claimed' ? "You haven't claimed any tasks yet" : activeTab === 'my-requests' ? "You haven't created any requests yet" : 'No completed tasks found'}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {activeTab === 'open' ? 'There are currently no open help requests. Check back later or create a new request.' : activeTab === 'claimed' ? 'When you claim a task to help with, it will appear here for easy tracking.' : activeTab === 'my-requests' ? 'Create a request when you need help with tasks, transportation, or other support.' : 'Completed tasks will be shown here for your reference.'}
      </p>
      {(activeTab === 'open' || activeTab === 'my-requests') && <button onClick={handleCreateRequest} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Request
        </button>}
    </div>;
  const renderTaskRequestItem = request => <div key={request.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-3 shadow-sm" onClick={() => handleRequestClick(request)}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${request.status === 'claimed' ? 'bg-blue-100' : request.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'}`}>
              {getCategoryIcon(request.category)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{request.title}</h3>
              <p className="text-sm text-gray-500">
                {getCategoryLabel(request.category)}
              </p>
            </div>
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColor(request.priority)}`}>
            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {request.description}
        </p>
        <div className="flex flex-wrap items-center text-xs text-gray-500 gap-y-1">
          <div className="flex items-center mr-4">
            <CalendarIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
            {formatDate(request.dueDate)}
          </div>
          {request.dueTime && <div className="flex items-center mr-4">
              <ClockIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
              {formatTime(request.dueTime)}
            </div>}
          {request.duration && <div className="flex items-center mr-4">
              <ClockIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
              {formatDuration(request.duration)}
            </div>}
          {request.location && <div className="flex items-center">
              <MapPinIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
              <span className="truncate max-w-[150px]">{request.location}</span>
            </div>}
        </div>
        {request.status !== 'open' && <div className="mt-3 pt-3 border-t border-gray-100 flex items-center">
            {request.status === 'claimed' ? <>
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <HandIcon className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-xs text-blue-600">
                  {request.claimedBy === storage.get('user_id', '') ? 'Claimed by you' : 'Claimed by ' + (dataService.getTeamMemberName(request.claimedBy) || 'someone')}
                </span>
              </> : request.status === 'completed' ? <>
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <CheckIcon className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-xs text-green-600">
                  Completed{' '}
                  {request.completedAt ? new Date(request.completedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            }) : ''}
                </span>
              </> : null}
          </div>}
      </div>
    </div>;
  const renderFilters = () => <div className={`fixed inset-0 bg-gray-500 bg-opacity-50 z-10 transition-opacity duration-300 ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowFilters(false)}>
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 transform transition-transform duration-300 ease-out" style={{
      transform: showFilters ? 'translateY(0)' : 'translateY(100%)',
      maxHeight: '80vh',
      overflowY: 'auto'
    }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Filter Requests</h3>
          <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-500">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          <h4 className="font-medium mb-2">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {['driving', 'grocery_shopping', 'keeping_company', 'home_management', 'managing_medications', 'meal_preparation'].map(category => <button key={category} className={`px-3 py-1.5 rounded-full text-sm ${filters.categories.includes(category) ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`} onClick={() => handleFilterChange('categories', category)}>
                {getCategoryLabel(category)}
              </button>)}
          </div>
        </div>
        <div className="mb-4">
          <h4 className="font-medium mb-2">Priority</h4>
          <div className="flex gap-2">
            <button className={`px-3 py-1.5 rounded-full text-sm ${filters.priority.includes('high') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`} onClick={() => handleFilterChange('priority', 'high')}>
              High
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm ${filters.priority.includes('medium') ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`} onClick={() => handleFilterChange('priority', 'medium')}>
              Medium
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm ${filters.priority.includes('low') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`} onClick={() => handleFilterChange('priority', 'low')}>
              Low
            </button>
          </div>
        </div>
        <div className="mb-6">
          <h4 className="font-medium mb-2">Time Frame</h4>
          <div className="flex flex-wrap gap-2">
            <button className={`px-3 py-1.5 rounded-full text-sm ${filters.timeframe === 'all' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`} onClick={() => handleFilterChange('timeframe', 'all')}>
              All
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm ${filters.timeframe === 'today' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`} onClick={() => handleFilterChange('timeframe', 'today')}>
              Today
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm ${filters.timeframe === 'tomorrow' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`} onClick={() => handleFilterChange('timeframe', 'tomorrow')}>
              Tomorrow
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm ${filters.timeframe === 'week' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`} onClick={() => handleFilterChange('timeframe', 'week')}>
              This Week
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleClearFilters} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700">
            Clear All
          </button>
          <button onClick={handleApplyFilters} className="flex-1 py-2 bg-blue-600 rounded-lg text-white">
            Apply Filters
          </button>
        </div>
      </div>
    </div>;
  // Determine if filters are active
  const hasActiveFilters = filters.categories.length > 0 || filters.priority.length > 0 || filters.timeframe !== 'all';
  return <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold">Community Support</h1>
          <div className="flex space-x-2">
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center relative" onClick={() => navigateTo('notifications')} aria-label="View notifications">
              <BellIcon className="w-4 h-4 text-gray-600" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>
            <button className={`w-8 h-8 rounded-full ${hasActiveFilters ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'} flex items-center justify-center`} onClick={handleFilterToggle} aria-label="Filter requests">
              <FilterIcon className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center" onClick={handleCreateRequest} aria-label="Create new request">
              <PlusIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-hide">
          <button className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'open' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`} onClick={() => handleTabChange('open')}>
            Open Requests
          </button>
          <button className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'claimed' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`} onClick={() => handleTabChange('claimed')}>
            My Claimed Tasks
          </button>
          <button className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'my-requests' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`} onClick={() => handleTabChange('my-requests')}>
            My Requests
          </button>
          <button className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'completed' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`} onClick={() => handleTabChange('completed')}>
            Completed
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
        {isLoading ? <div className="flex flex-col items-center justify-center py-10">
            <div className="w-10 h-10 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading requests...</p>
          </div> : taskRequests.length === 0 ? renderEmptyState() : <div>
            {activeTab === 'open' && <p className="text-sm text-gray-500 mb-3">
                {taskRequests.length} open request
                {taskRequests.length !== 1 ? 's' : ''} available
              </p>}
            {taskRequests.map(renderTaskRequestItem)}
          </div>}
      </div>
      {/* Floating Action Button (only on open tab for non-community users) */}
      {activeTab === 'open' && userRoleCategory !== 'community' && <div className="fixed bottom-20 right-4 z-10">
          <button onClick={handleCreateRequest} className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center" aria-label="Create new request">
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>}
      {/* Filters Modal */}
      {renderFilters()}
    </div>;
};
// Additional icons
const ShoppingCartIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>;
const HomeIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>;
const PillIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>;
const XIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>;
const CheckIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>;