import React, { useEffect, useState, Component } from 'react';
import { PlusIcon, SearchIcon, UserIcon, UsersIcon, MessageCircleIcon, BellIcon, CheckIcon } from 'lucide-react';
import { messageService, Conversation } from '../../services/MessageService';
import { dataService } from '../../services/DataService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { BracketText } from '../Common/BracketText';
export const MessagesScreen = ({
  navigateTo
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'direct' | 'team'>('all');
  // Get current user ID (in a real app, this would come from auth)
  const currentUserId = 'james';
  useEffect(() => {
    // Initialize message data
    messageService.initializeData();
    // Load conversations
    loadConversations();
    // Track screen view
    analytics.trackScreenView('messages');
  }, []);
  const loadConversations = () => {
    const userConversations = messageService.getConversationsForUser(currentUserId);
    setConversations(userConversations);
  };
  const handleConversationClick = (conversation: Conversation) => {
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
  const filteredConversations = conversations.filter(conv => {
    // Filter by tab
    if (selectedTab === 'direct' && conv.type !== 'direct') return false;
    if (selectedTab === 'team' && conv.type !== 'team') return false;
    // Filter by search term
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
  const getParticipantName = (participantId: string) => {
    const member = dataService.getTeamMemberById(participantId);
    return member?.name || 'Unknown User';
  };
  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.type === 'team') {
      return conversation.title || 'Team Chat';
    } else {
      // For direct chats, show the other person's name
      const otherParticipant = conversation.participants.find(p => p !== currentUserId);
      return otherParticipant ? getParticipantName(otherParticipant) : 'Chat';
    }
  };
  const formatTimestamp = (timestamp: string) => {
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
          <h1 className="text-2xl font-bold">Messages</h1>
          <div className="flex space-x-3">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative" onClick={() => navigateTo('notifications')}>
              <BellIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center" onClick={() => setShowNewMessageModal(true)}>
              <PlusIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        {/* Search */}
        <div className="relative mb-4">
          <input type="text" placeholder="Search messages..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        {/* Tabs */}
        <div className="flex space-x-2">
          <BracketText active={selectedTab === 'all'} onClick={() => setSelectedTab('all')} className="text-sm">
            All
          </BracketText>
          <BracketText active={selectedTab === 'direct'} onClick={() => setSelectedTab('direct')} className="text-sm">
            Direct
          </BracketText>
          <BracketText active={selectedTab === 'team'} onClick={() => setSelectedTab('team')} className="text-sm">
            Teams
          </BracketText>
        </div>
      </div>
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? <div className="divide-y divide-gray-100">
            {filteredConversations.map(conversation => <div key={conversation.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleConversationClick(conversation)}>
                <div className="flex items-start">
                  {/* Avatar/Icon */}
                  <div className="mr-3">
                    {conversation.type === 'direct' ? <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-blue-600" />
                      </div> : <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-purple-600" />
                      </div>}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium truncate">
                        {getConversationTitle(conversation)}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {conversation.lastMessage ? formatTimestamp(conversation.lastMessage.timestamp) : ''}
                      </span>
                    </div>
                    {conversation.lastMessage && <div className="flex items-center">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {conversation.lastMessage.senderId === currentUserId ? <span className="text-gray-400 mr-1">You:</span> : <span className="text-gray-400 mr-1">
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
          </div> : <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircleIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No messages
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No messages match your search' : selectedTab === 'all' ? 'Start a conversation to connect with your care team' : selectedTab === 'direct' ? 'No direct messages yet' : 'No team messages yet'}
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={() => setShowNewMessageModal(true)}>
              Start a Conversation
            </button>
          </div>}
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
  const [selectedType, setSelectedType] = useState<'direct' | 'team'>('direct');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
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
  const toggleMemberSelection = (memberId: string) => {
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