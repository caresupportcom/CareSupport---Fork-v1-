import React, { useEffect, useState, Component } from 'react';
import { UsersIcon, PlusIcon, SearchIcon, ChevronRightIcon, UserPlusIcon, BellIcon, HandIcon, CheckCircleIcon, CalendarIcon, ClockIcon, MapPinIcon, FilterIcon, MessageCircleIcon, UserIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { dataService } from '../../services/DataService';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { getRelationshipCategory } from '../../types/UserTypes';
import { notificationService } from '../../services/NotificationService';
import { messageService, Conversation } from '../../services/MessageService';
export const CareNetworkScreen = ({
  navigateTo
}) => {
  const {
    userProfile
  } = useUserProfile();
  const [activeTab, setActiveTab] = useState('network'); // 'network' or 'help'
  const [teams, setTeams] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [helpOpportunities, setHelpOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  // Get user role category
  const userRoleCategory = userProfile?.relationship ? getRelationshipCategory(userProfile.relationship) : 'family';
  // Determine if user is a supporter
  const isSupporter = userRoleCategory === 'community' || userRoleCategory === 'friend';
  // Get current user ID (in a real app, this would come from auth)
  const currentUserId = 'james';
  useEffect(() => {
    // Load teams
    const userTeams = dataService.getUserTeams();
    setTeams(userTeams);
    // Load conversations
    const userConversations = messageService.getConversationsForUser(currentUserId);
    setConversations(userConversations);
    // Load help opportunities
    const opportunities = dataService.getHelpOpportunities();
    setHelpOpportunities(opportunities);
    // Track screen view
    analytics.trackScreenView('care_network');
  }, []);
  const handleTeamClick = team => {
    navigateTo('care-team-detail', team);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'view_care_team',
      team_id: team.id
    });
  };
  const handleConversationClick = conversation => {
    // Mark conversation as read
    messageService.markConversationAsRead(conversation.id, currentUserId);
    // Navigate to conversation detail
    navigateTo('conversation-detail', {
      conversationId: conversation.id
    });
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'open_conversation',
      conversation_type: conversation.type
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
      feature_name: 'care_network_tab_changed',
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
  // Filter teams and conversations based on search
  const filteredTeams = teams.filter(team => searchTerm === '' || team.name.toLowerCase().includes(searchTerm.toLowerCase()) || team.description.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    // Search in conversation title for team chats
    if (conv.type === 'team' && conv.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    // Search in participant names for direct chats
    if (conv.type === 'direct') {
      const otherParticipant = conv.participants.find(p => p !== currentUserId);
      if (otherParticipant) {
        const member = dataService.getTeamMemberById(otherParticipant);
        return member?.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
    }
    // Search in last message
    return conv.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => {
    // Sort by last message timestamp (newest first)
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
  });
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
  // Helper function to get conversation title
  const getConversationTitle = conversation => {
    if (conversation.type === 'team') {
      return conversation.title || 'Team Chat';
    } else {
      // For direct chats, show the other person's name
      const otherParticipant = conversation.participants.find(p => p !== currentUserId);
      return otherParticipant ? getParticipantName(otherParticipant) : 'Chat';
    }
  };
  // Helper function to get participant name
  const getParticipantName = participantId => {
    const member = dataService.getTeamMemberById(participantId);
    return member?.name || 'Unknown User';
  };
  // Format timestamp for conversations
  const formatTimestamp = timestamp => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // Today: show time
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Within a week: show day name
      return date.toLocaleDateString([], {
        weekday: 'short'
      });
    } else {
      // Older: show date
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      });
    }
  };
  return <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Care Network</h1>
          <div className="flex space-x-3">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative" onClick={() => navigateTo('notifications')}>
              <BellIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center" onClick={activeTab === 'network' ? () => setShowNewMessageModal(true) : handleCreateHelpRequest}>
              <PlusIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        {/* Search */}
        <div className="relative mb-4">
          <input type="text" placeholder={activeTab === 'network' ? 'Search teams and conversations...' : 'Search help opportunities...'} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
            </div>
          </div>}
        {/* Tabs */}
        <div className="flex space-x-2">
          <BracketText active={activeTab === 'network'} onClick={() => handleTabChange('network')} className="text-sm">
            Care Network
          </BracketText>
          <BracketText active={activeTab === 'help'} onClick={() => handleTabChange('help')} className="text-sm">
            Help Opportunities
          </BracketText>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Network Tab */}
        {activeTab === 'network' && <>
            {/* Direct Messages Section */}
            <div className="px-4 pt-4">
              <h2 className="text-sm font-semibold mb-2 flex items-center">
                <MessageCircleIcon className="w-4 h-4 mr-1 text-blue-500" />
                <BracketText active={true}>Direct Messages</BracketText>
              </h2>
              {filteredConversations.filter(c => c.type === 'direct').length > 0 ? <div className="space-y-1 mb-4">
                  {filteredConversations.filter(c => c.type === 'direct').map(conversation => <div key={conversation.id} className="p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-100 cursor-pointer" onClick={() => handleConversationClick(conversation)}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium truncate">
                                {getConversationTitle(conversation)}
                              </h3>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {conversation.lastMessage ? formatTimestamp(conversation.lastMessage.timestamp) : ''}
                              </span>
                            </div>
                            {conversation.lastMessage && <div className="flex items-center">
                                <p className="text-xs text-gray-600 truncate flex-1">
                                  {conversation.lastMessage.senderId === currentUserId ? <span className="text-gray-400 mr-1">
                                      You:
                                    </span> : <span className="text-gray-400 mr-1">
                                      {getParticipantName(conversation.lastMessage.senderId).split(' ')[0]}
                                      :
                                    </span>}
                                  {conversation.lastMessage.content}
                                </p>
                                {conversation.unreadCount > 0 && <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </span>}
                              </div>}
                          </div>
                        </div>
                      </div>)}
                </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center mb-4">
                  <p className="text-sm text-gray-500">
                    No direct messages yet
                  </p>
                </div>}
            </div>
            {/* Team Chats Section */}
            <div className="px-4 pt-2">
              <h2 className="text-sm font-semibold mb-2 flex items-center">
                <UsersIcon className="w-4 h-4 mr-1 text-green-500" />
                <BracketText active={true}>Care Teams</BracketText>
              </h2>
              {filteredTeams.length > 0 ? <div className="space-y-1 mb-4">
                  {filteredTeams.map(team => <div key={team.id} className="p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-100 cursor-pointer" onClick={() => handleTeamClick(team)}>
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <UsersIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{team.name}</h3>
                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {team.description}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <UsersIcon className="w-3.5 h-3.5 mr-1" />
                            <span>{team.members.length} members</span>
                          </div>
                        </div>
                      </div>
                    </div>)}
                </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center mb-4">
                  <p className="text-sm text-gray-500">
                    {searchTerm ? 'No teams match your search' : "You're not part of any care teams yet"}
                  </p>
                </div>}
            </div>
            {/* Team Conversations Section */}
            <div className="px-4 pt-2">
              <h2 className="text-sm font-semibold mb-2 flex items-center">
                <MessageCircleIcon className="w-4 h-4 mr-1 text-purple-500" />
                <BracketText active={true}>Team Conversations</BracketText>
              </h2>
              {filteredConversations.filter(c => c.type === 'team').length > 0 ? <div className="space-y-1 mb-4">
                  {filteredConversations.filter(c => c.type === 'team').map(conversation => <div key={conversation.id} className="p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-100 cursor-pointer" onClick={() => handleConversationClick(conversation)}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <UsersIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium truncate">
                                {getConversationTitle(conversation)}
                              </h3>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {conversation.lastMessage ? formatTimestamp(conversation.lastMessage.timestamp) : ''}
                              </span>
                            </div>
                            {conversation.lastMessage && <div className="flex items-center">
                                <p className="text-xs text-gray-600 truncate flex-1">
                                  {conversation.lastMessage.senderId === currentUserId ? <span className="text-gray-400 mr-1">
                                      You:
                                    </span> : <span className="text-gray-400 mr-1">
                                      {getParticipantName(conversation.lastMessage.senderId).split(' ')[0]}
                                      :
                                    </span>}
                                  {conversation.lastMessage.content}
                                </p>
                                {conversation.unreadCount > 0 && <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </span>}
                              </div>}
                          </div>
                        </div>
                      </div>)}
                </div> : <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center mb-4">
                  <p className="text-sm text-gray-500">
                    No team conversations yet
                  </p>
                </div>}
            </div>
            {/* Create/Join Team Buttons */}
            <div className="p-4 flex space-x-3">
              <button className="flex-1 py-3 border border-gray-200 rounded-lg flex items-center justify-center text-blue-600" onClick={handleCreateTeam}>
                <PlusIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">Create Team</span>
              </button>
              <button className="flex-1 py-3 border border-gray-200 rounded-lg flex items-center justify-center text-blue-600" onClick={handleJoinTeam}>
                <UserPlusIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">Join Team</span>
              </button>
            </div>
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
      {/* New Message Modal */}
      {showNewMessageModal && <NewMessageModal onClose={() => setShowNewMessageModal(false)} onConversationCreated={conversation => {
      setShowNewMessageModal(false);
      handleConversationClick(conversation);
    }} currentUserId={currentUserId} />}
    </div>;
};
// New Message Modal Component
const NewMessageModal = ({
  onClose,
  onConversationCreated,
  currentUserId
}) => {
  const [selectedType, setSelectedType] = useState('direct');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const teamMembers = dataService.getTeamMembers();
  const filteredMembers = teamMembers.filter(member => member.id !== currentUserId).filter(member => !searchTerm || member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.role.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleCreateConversation = () => {
    if (selectedType === 'direct' && selectedMembers.length === 1) {
      // Create direct conversation
      const conversation = messageService.createConversation({
        type: 'direct',
        participants: [currentUserId, selectedMembers[0]]
      });
      onConversationCreated(conversation);
    } else if (selectedType === 'team' && selectedMembers.length > 0 && teamName) {
      // Create team conversation
      const conversation = messageService.createConversation({
        type: 'team',
        participants: [currentUserId, ...selectedMembers],
        title: teamName
      });
      onConversationCreated(conversation);
    }
  };
  const toggleMemberSelection = memberId => {
    if (selectedType === 'direct') {
      // For direct messages, only allow one selection
      setSelectedMembers([memberId]);
    } else {
      // For team messages, toggle selection
      if (selectedMembers.includes(memberId)) {
        setSelectedMembers(selectedMembers.filter(id => id !== memberId));
      } else {
        setSelectedMembers([...selectedMembers, memberId]);
      }
    }
  };
  const isCreateButtonDisabled = selectedType === 'direct' && selectedMembers.length !== 1 || selectedType === 'team' && (selectedMembers.length === 0 || !teamName.trim());
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-11/12 max-w-md">
        <h2 className="text-xl font-bold mb-4">New Conversation</h2>
        {/* Conversation Type */}
        <div className="mb-4">
          <div className="flex space-x-4">
            <button className={`flex-1 py-2 px-3 rounded-lg ${selectedType === 'direct' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => {
            setSelectedType('direct');
            setSelectedMembers([]);
          }}>
              <div className="flex items-center justify-center">
                <UserIcon className="w-5 h-5 mr-2" />
                <span>Direct Message</span>
              </div>
            </button>
            <button className={`flex-1 py-2 px-3 rounded-lg ${selectedType === 'team' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => {
            setSelectedType('team');
            setSelectedMembers([]);
          }}>
              <div className="flex items-center justify-center">
                <UsersIcon className="w-5 h-5 mr-2" />
                <span>Team Chat</span>
              </div>
            </button>
          </div>
        </div>
        {/* Team Name (for team chats) */}
        {selectedType === 'team' && <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Team Name</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Enter team name" value={teamName} onChange={e => setTeamName(e.target.value)} />
          </div>}
        {/* Search */}
        <div className="relative mb-4">
          <input type="text" placeholder="Search team members..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        {/* Member List */}
        <div className="max-h-60 overflow-y-auto mb-4 border border-gray-200 rounded-lg">
          {filteredMembers.length > 0 ? filteredMembers.map(member => <div key={member.id} className={`p-3 flex items-center ${selectedMembers.includes(member.id) ? 'bg-blue-50' : 'hover:bg-gray-50'} cursor-pointer`} onClick={() => toggleMemberSelection(member.id)}>
                <div className={`w-10 h-10 rounded-full bg-${member.color}-100 flex items-center justify-center mr-3`}>
                  <span className={`text-${member.color}-600 font-medium`}>
                    {member.initial}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
                {selectedMembers.includes(member.id) && <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>}
              </div>) : <div className="p-4 text-center text-gray-500">
              No team members found
            </div>}
        </div>
        {/* Selected Members Count */}
        {selectedType === 'team' && <div className="mb-4 text-sm text-gray-600">
            {selectedMembers.length} member
            {selectedMembers.length !== 1 ? 's' : ''} selected
          </div>}
        {/* Buttons */}
        <div className="flex space-x-3">
          <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={onClose}>
            Cancel
          </button>
          <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg disabled:bg-blue-300" onClick={handleCreateConversation} disabled={isCreateButtonDisabled}>
            Create
          </button>
        </div>
      </div>
    </div>;
};