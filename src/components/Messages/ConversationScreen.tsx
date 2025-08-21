import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeftIcon, SendIcon, PaperclipIcon, UserIcon, UsersIcon, MoreVerticalIcon, ImageIcon, FileIcon, CalendarIcon, ListIcon, InfoIcon } from 'lucide-react';
import { messageService, Message, Conversation } from '../../services/MessageService';
import { dataService } from '../../services/DataService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const ConversationScreen = ({
  onBack,
  conversationId
}) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Get current user ID (in a real app, this would come from auth)
  const currentUserId = 'james';
  useEffect(() => {
    if (conversationId) {
      // Load conversation
      const conv = messageService.getConversationById(conversationId);
      if (conv) {
        setConversation(conv);
        // Load messages
        const msgs = messageService.getMessagesForConversation(conversationId);
        setMessages(msgs);
        // Mark conversation as read
        messageService.markConversationAsRead(conversationId, currentUserId);
      }
    }
    // Track screen view
    analytics.trackScreenView('conversation_detail');
  }, [conversationId]);
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversation) return;
    // Send message
    const sentMessage = messageService.sendMessage({
      conversationId: conversation.id,
      senderId: currentUserId,
      content: newMessage
    });
    // Update local state
    setMessages([...messages, sentMessage]);
    setNewMessage('');
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'send_message',
      conversation_type: conversation.type
    });
  };
  const getParticipantName = (participantId: string) => {
    const member = dataService.getTeamMemberById(participantId);
    return member?.name || 'Unknown User';
  };
  const getConversationTitle = () => {
    if (!conversation) return 'Conversation';
    if (conversation.type === 'team') {
      return conversation.title || 'Team Chat';
    } else {
      // For direct chats, show the other person's name
      const otherParticipant = conversation.participants.find(p => p !== currentUserId);
      return otherParticipant ? getParticipantName(otherParticipant) : 'Chat';
    }
  };
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: {
      date: string;
      messages: Message[];
    }[] = [];
    messages.forEach(message => {
      const messageDate = formatMessageDate(message.timestamp);
      const existingGroup = groups.find(group => group.date === messageDate);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message]
        });
      }
    });
    return groups;
  };
  const messageGroups = groupMessagesByDate();
  // Determine if we should show the sender's name (for group chats or when sender changes)
  const shouldShowSender = (message: Message, index: number, messages: Message[]) => {
    if (conversation?.type === 'team') return true;
    if (index === 0) return true;
    return messages[index - 1].senderId !== message.senderId;
  };
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center">
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3" onClick={onBack}>
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            {conversation?.type === 'direct' ? <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div> : <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <UsersIcon className="w-5 h-5 text-purple-600" />
              </div>}
            <div>
              <h2 className="font-medium truncate">{getConversationTitle()}</h2>
              {conversation?.type === 'team' && <p className="text-xs text-gray-500">
                  {conversation.participants.length} members
                </p>}
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ml-2" onClick={() => setShowMoreOptions(!showMoreOptions)}>
          <MoreVerticalIcon className="w-5 h-5 text-gray-600" />
        </button>
        {/* More Options Dropdown */}
        {showMoreOptions && <div className="absolute right-4 top-16 bg-white shadow-lg rounded-lg z-10 w-48 py-1 border border-gray-200">
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center">
              <InfoIcon className="w-4 h-4 mr-2 text-gray-500" />
              Conversation Info
            </button>
            {conversation?.type === 'team' && <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center">
                <UsersIcon className="w-4 h-4 mr-2 text-gray-500" />
                Manage Members
              </button>}
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center text-red-500">
              Leave Conversation
            </button>
          </div>}
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messageGroups.map((group, groupIndex) => <div key={groupIndex} className="mb-4">
            {/* Date Header */}
            <div className="flex justify-center mb-4">
              <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
                {group.date}
              </div>
            </div>
            {/* Messages for this date */}
            {group.messages.map((message, messageIndex) => {
          const isSender = message.senderId === currentUserId;
          const showSender = shouldShowSender(message, messageIndex, group.messages);
          return <div key={message.id} className={`mb-4 ${isSender ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                  {/* Sender name for group chats */}
                  {showSender && !isSender && <div className="text-xs text-gray-500 mb-1 ml-12">
                      {getParticipantName(message.senderId)}
                    </div>}
                  <div className="flex items-end">
                    {/* Avatar (only show for others' messages) */}
                    {!isSender && <div className="mr-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs text-blue-600 font-medium">
                            {getParticipantName(message.senderId).charAt(0)}
                          </span>
                        </div>
                      </div>}
                    {/* Message bubble */}
                    <div className={`px-3 py-2 rounded-lg max-w-xs sm:max-w-md break-words ${isSender ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}`}>
                      {message.content}
                      <div className={`text-xs mt-1 text-right ${isSender ? 'text-blue-200' : 'text-gray-500'}`}>
                        {formatMessageTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>;
        })}
          </div>)}
        {/* Empty state */}
        {messages.length === 0 && <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <SendIcon className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No messages yet
            </h3>
            <p className="text-gray-500 mb-4">
              Send a message to start the conversation
            </p>
          </div>}
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      {/* Message Input */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-end">
          <div className="relative mr-2">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}>
              <PaperclipIcon className="w-5 h-5 text-gray-600" />
            </button>
            {/* Attachment Options */}
            {showAttachmentOptions && <div className="absolute bottom-12 left-0 bg-white shadow-lg rounded-lg z-10 w-48 py-1 border border-gray-200">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2 text-gray-500" />
                  Photo
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center">
                  <FileIcon className="w-4 h-4 mr-2 text-gray-500" />
                  Document
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                  Event
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center">
                  <ListIcon className="w-4 h-4 mr-2 text-gray-500" />
                  Task
                </button>
              </div>}
          </div>
          <div className="flex-1 relative">
            <textarea className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 resize-none" placeholder="Type a message..." rows={1} value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }} />
            <button className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center disabled:bg-blue-300" onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <SendIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>;
};