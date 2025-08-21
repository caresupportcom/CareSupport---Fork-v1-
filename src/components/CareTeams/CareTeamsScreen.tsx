import React, { useEffect, useState } from 'react';
import { UsersIcon, PlusIcon, SearchIcon, ChevronRightIcon, UserPlusIcon, BellIcon, HandIcon, CheckCircleIcon, CalendarIcon, ClockIcon, MapPinIcon, FilterIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { dataService } from '../../services/DataService';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { getRelationshipCategory } from '../../types/UserTypes';
import { notificationService } from '../../services/NotificationService';
export const CareTeamsScreen = ({
  navigateTo
}) => {
  const {
    userProfile
  } = useUserProfile();
  const [teams, setTeams] = useState([]);
  const [helpOpportunities, setHelpOpportunities] = useState([]);
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' or 'help'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  // Get user role category
  const userRoleCategory = userProfile?.relationship ? getRelationshipCategory(userProfile.relationship) : 'family';
  // Determine if user is a supporter
  const isSupporter = userRoleCategory === 'community' || userRoleCategory === 'friend';
  useEffect(() => {
    // Load teams
    const userTeams = dataService.getUserTeams();
    setTeams(userTeams);
    // Load help opportunities
    const opportunities = dataService.getHelpOpportunities();
    setHelpOpportunities(opportunities);
    // Track screen view
    analytics.trackScreenView('care_teams');
  }, []);
  const handleTeamClick = team => {
    navigateTo('care-team-detail', team);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'view_care_team',
      team_id: team.id
    });
  };
  const handleCreateTeam = () => {
    navigateTo('create-care-team');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'create_care_team_initiated'
    });
  };
  const handleJoinTeam = () => {
    navigateTo('join-care-team');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'join_care_team_initiated'
    });
  };
  const handleTabChange = tab => {
    setActiveTab(tab);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'care_teams_tab_changed',
      tab: tab
    });
  };
  const handleAcceptHelp = opportunity => {
    // Update the opportunity status
    const updatedOpportunity = {
      ...opportunity,
      status: 'accepted',
      acceptedBy: 'james',
      acceptedAt: new Date().toISOString()
    };
    // Update in data service
    dataService.updateHelpOpportunity(updatedOpportunity);
    // Update local state
    setHelpOpportunities(helpOpportunities.map(op => op.id === opportunity.id ? updatedOpportunity : op));
    // Send notification
    notificationService.addNotification({
      type: 'help',
      title: 'Help Accepted',
      message: `You've accepted to help with: ${opportunity.title}`,
      priority: 'medium'
    });
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_opportunity_accepted',
      opportunity_id: opportunity.id
    });
  };
  const handleViewOpportunity = opportunity => {
    navigateTo('help-request-detail', opportunity);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'view_help_opportunity',
      opportunity_id: opportunity.id
    });
  };
  const handleCreateHelpRequest = () => {
    navigateTo('create-help-request');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'create_help_request_initiated'
    });
  };
  const handleFilterChange = category => {
    setFilterCategory(category);
    setShowFilters(false);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_opportunities_filtered',
      category: category
    });
  };
  // Filter help opportunities based on search and category
  const filteredOpportunities = helpOpportunities.filter(opportunity => {
    const matchesSearch = searchTerm === '' || opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) || opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || opportunity.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
  // Filter teams based on search
  const filteredTeams = teams.filter(team => searchTerm === '' || team.name.toLowerCase().includes(searchTerm.toLowerCase()) || team.description.toLowerCase().includes(searchTerm.toLowerCase()));
  // Get category label
  const getCategoryLabel = categoryId => {
    const categories = {
      transportation: 'Transportation',
      meals: 'Meals',
      errands: 'Errands',
      household: 'Household',
      companionship: 'Companionship',
      medical: 'Medical',
      other: 'Other'
    };
    return categories[categoryId] || 'Other';
  };
  // Get category color
  const getCategoryColor = categoryId => {
    const colors = {
      transportation: 'blue',
      meals: 'green',
      errands: 'purple',
      household: 'yellow',
      companionship: 'pink',
      medical: 'red',
      other: 'gray'
    };
    return colors[categoryId] || 'gray';
  };
  return <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Care Teams</h1>
          <div className="flex space-x-3">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative" onClick={() => navigateTo('notifications')}>
              <BellIcon className="w-5 h-5 text-gray-600" />
            </button>
            {activeTab === 'teams' ? <button className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center" onClick={handleCreateTeam}>
                <PlusIcon className="w-5 h-5 text-white" />
              </button> : isSupporter ? null : <button className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center" onClick={handleCreateHelpRequest}>
                <PlusIcon className="w-5 h-5 text-white" />
              </button>}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input type="text" placeholder={activeTab === 'teams' ? 'Search teams...' : 'Search help opportunities...'} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />

          {/* Filter button for help opportunities */}
          {activeTab === 'help' && <button className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon className="w-5 h-5 text-gray-400" />
            </button>}
        </div>

        {/* Filter dropdown for help opportunities */}
        {activeTab === 'help' && showFilters && <div className="absolute z-10 right-6 mt-0 bg-white shadow-lg rounded-lg border border-gray-200 w-48">
            <div className="py-1">
              <button className={`w-full text-left px-4 py-2 text-sm ${filterCategory === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`} onClick={() => handleFilterChange('all')}>
                All Categories
              </button>
              <button className={`w-full text-left px-4 py-2 text-sm ${filterCategory === 'transportation' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`} onClick={() => handleFilterChange('transportation')}>
                Transportation
              </button>
              <button className={`w-full text-left px-4 py-2 text-sm ${filterCategory === 'meals' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`} onClick={() => handleFilterChange('meals')}>
                Meals
              </button>
              <button className={`w-full text-left px-4 py-2 text-sm ${filterCategory === 'errands' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`} onClick={() => handleFilterChange('errands')}>
                Errands
              </button>
              <button className={`w-full text-left px-4 py-2 text-sm ${filterCategory === 'household' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`} onClick={() => handleFilterChange('household')}>
                Household
              </button>
              <button className={`w-full text-left px-4 py-2 text-sm ${filterCategory === 'companionship' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`} onClick={() => handleFilterChange('companionship')}>
                Companionship
              </button>
              <button className={`w-full text-left px-4 py-2 text-sm ${filterCategory === 'medical' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`} onClick={() => handleFilterChange('medical')}>
                Medical
              </button>
              <button className={`w-full text-left px-4 py-2 text-sm ${filterCategory === 'other' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`} onClick={() => handleFilterChange('other')}>
                Other
              </button>
            </div>
          </div>}

        {/* Tabs */}
        <div className="flex space-x-2">
          <BracketText active={activeTab === 'teams'} onClick={() => handleTabChange('teams')} className="text-sm">
            Teams
          </BracketText>
          <BracketText active={activeTab === 'help'} onClick={() => handleTabChange('help')} className="text-sm">
            Help Opportunities
          </BracketText>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Teams Tab */}
        {activeTab === 'teams' && <>
            {filteredTeams.length > 0 ? <div className="divide-y divide-gray-100">
                {filteredTeams.map(team => <div key={team.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleTeamClick(team)}>
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <UsersIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{team.name}</h3>
                          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {team.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <UsersIcon className="w-4 h-4 mr-1" />
                          <span>{team.members.length} members</span>
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div> : <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <UsersIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No teams found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'No teams match your search' : "You're not part of any care teams yet"}
                </p>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={handleCreateTeam}>
                    Create Team
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg" onClick={handleJoinTeam}>
                    Join Team
                  </button>
                </div>
              </div>}
            {filteredTeams.length > 0 && <div className="p-4 flex space-x-3">
                <button className="flex-1 py-3 border border-gray-200 rounded-lg flex items-center justify-center text-blue-600" onClick={handleCreateTeam}>
                  <PlusIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">Create Team</span>
                </button>
                <button className="flex-1 py-3 border border-gray-200 rounded-lg flex items-center justify-center text-blue-600" onClick={handleJoinTeam}>
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">Join Team</span>
                </button>
              </div>}
          </>}

        {/* Help Opportunities Tab */}
        {activeTab === 'help' && <>
            {filteredOpportunities.length > 0 ? <div className="divide-y divide-gray-100">
                {filteredOpportunities.map(opportunity => <div key={opportunity.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleViewOpportunity(opportunity)}>
                    <div className="flex items-start">
                      <div className={`w-12 h-12 rounded-full bg-${getCategoryColor(opportunity.category)}-100 flex items-center justify-center mr-4`}>
                        <HandIcon className={`w-6 h-6 text-${getCategoryColor(opportunity.category)}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{opportunity.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full bg-${getCategoryColor(opportunity.category)}-100 text-${getCategoryColor(opportunity.category)}-700`}>
                            {getCategoryLabel(opportunity.category)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {opportunity.description}
                        </p>
                        <div className="flex flex-wrap mt-2 gap-y-1">
                          {opportunity.dueDate && <div className="flex items-center mr-3 text-xs text-gray-500">
                              <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                              <span>
                                {new Date(opportunity.dueDate).toLocaleDateString()}
                              </span>
                            </div>}
                          {opportunity.dueTime && <div className="flex items-center mr-3 text-xs text-gray-500">
                              <ClockIcon className="w-3.5 h-3.5 mr-1" />
                              <span>{opportunity.dueTime}</span>
                            </div>}
                          {opportunity.duration && <div className="flex items-center mr-3 text-xs text-gray-500">
                              <ClockIcon className="w-3.5 h-3.5 mr-1" />
                              <span>{opportunity.duration} min</span>
                            </div>}
                          {opportunity.location && <div className="flex items-center mr-3 text-xs text-gray-500">
                              <MapPinIcon className="w-3.5 h-3.5 mr-1" />
                              <span>{opportunity.location}</span>
                            </div>}
                        </div>
                        {isSupporter && opportunity.status === 'open' && <button className="mt-3 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg" onClick={e => {
                  e.stopPropagation();
                  handleAcceptHelp(opportunity);
                }}>
                            I Can Help
                          </button>}
                        {opportunity.status === 'accepted' && <div className="mt-3 flex items-center text-green-600 text-sm">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            <span>
                              {opportunity.acceptedBy === 'james' ? 'You accepted this task' : `Accepted by ${dataService.getTeamMemberById(opportunity.acceptedBy)?.name || 'a team member'}`}
                            </span>
                          </div>}
                      </div>
                    </div>
                  </div>)}
              </div> : <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <HandIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No help opportunities
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'No opportunities match your search' : filterCategory !== 'all' ? `No ${getCategoryLabel(filterCategory).toLowerCase()} opportunities available` : isSupporter ? 'There are no help requests at the moment' : 'Create a help request to get assistance from your care team'}
                </p>
                {!isSupporter && <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={handleCreateHelpRequest}>
                    Create Help Request
                  </button>}
              </div>}
            {!isSupporter && filteredOpportunities.length > 0 && <div className="p-4">
                <button className="w-full py-3 border border-gray-200 rounded-lg flex items-center justify-center text-blue-600" onClick={handleCreateHelpRequest}>
                  <PlusIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">Create Help Request</span>
                </button>
              </div>}
          </>}
      </div>
    </div>;
};