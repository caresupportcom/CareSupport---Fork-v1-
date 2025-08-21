import React from 'react';
import { storage } from './StorageService';
import { notificationService } from './NotificationService';
import { dataService } from './DataService';
import { analytics, AnalyticsEvents } from './AnalyticsService';
// Message and conversation interfaces
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: Attachment[];
  relatedTaskId?: string;
  relatedEventId?: string;
}
export interface Conversation {
  id: string;
  type: 'direct' | 'team';
  participants: string[];
  teamId?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
  title?: string;
}
export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'task' | 'event';
  url?: string;
  name: string;
  size?: number;
  taskId?: string;
  eventId?: string;
}
class MessageService {
  private storageKeys = {
    messages: 'messages',
    conversations: 'conversations'
  };
  // Initialize with sample data for demo purposes
  public initializeData() {
    const existingMessages = storage.get(this.storageKeys.messages, null);
    const existingConversations = storage.get(this.storageKeys.conversations, null);
    if (!existingMessages) {
      storage.save(this.storageKeys.messages, this.generateSampleMessages());
    }
    if (!existingConversations) {
      storage.save(this.storageKeys.conversations, this.generateSampleConversations());
    }
  }
  // Generate sample messages for the demo
  private generateSampleMessages(): Message[] {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return [
    // Direct conversation between James and Maria
    {
      id: 'msg1',
      conversationId: 'conv1',
      senderId: 'maria',
      content: "Hi James, can you please check Eleanor's blood pressure today? She seemed a bit dizzy this morning.",
      timestamp: yesterday.toISOString(),
      read: true
    }, {
      id: 'msg2',
      conversationId: 'conv1',
      senderId: 'james',
      content: "I'll do that right away. I'll also check her blood glucose levels to be safe.",
      timestamp: yesterday.toISOString(),
      read: true
    }, {
      id: 'msg3',
      conversationId: 'conv1',
      senderId: 'maria',
      content: 'Thanks! Let me know the results as soon as you have them.',
      timestamp: yesterday.toISOString(),
      read: true
    }, {
      id: 'msg4',
      conversationId: 'conv1',
      senderId: 'james',
      content: 'Blood pressure is 130/85, which is a bit elevated but not concerning. Blood glucose is normal at 110 mg/dL.',
      timestamp: new Date(now.getTime() - 3 * 60 * 60000).toISOString(),
      read: false
    },
    // Team conversation for Eleanor's Care Team
    {
      id: 'msg5',
      conversationId: 'conv2',
      senderId: 'linda',
      content: "Team update: Eleanor has a doctor's appointment next Tuesday at 2 PM. Who can take her?",
      timestamp: yesterday.toISOString(),
      read: true
    }, {
      id: 'msg6',
      conversationId: 'conv2',
      senderId: 'james',
      content: "I can take her. I'll add it to my calendar.",
      timestamp: yesterday.toISOString(),
      read: true
    }, {
      id: 'msg7',
      conversationId: 'conv2',
      senderId: 'maria',
      content: 'Great! James, please make sure to bring her medication list and recent blood pressure readings.',
      timestamp: yesterday.toISOString(),
      read: true
    }, {
      id: 'msg8',
      conversationId: 'conv2',
      senderId: 'robert',
      content: "Also, could someone please remind the doctor about Eleanor's knee pain? We need to discuss physical therapy options.",
      timestamp: new Date(now.getTime() - 2 * 60 * 60000).toISOString(),
      read: false
    },
    // Direct conversation between Linda and James
    {
      id: 'msg9',
      conversationId: 'conv3',
      senderId: 'linda',
      content: "James, I noticed Eleanor didn't eat much dinner yesterday. Has she been eating well during your shifts?",
      timestamp: new Date(now.getTime() - 5 * 60 * 60000).toISOString(),
      read: false
    },
    // Direct conversation between Robert and James
    {
      id: 'msg10',
      conversationId: 'conv4',
      senderId: 'robert',
      content: "Hi James, I've updated Eleanor's exercise routine. Could you help her with the new exercises tomorrow?",
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
      read: false
    }];
  }
  // Generate sample conversations for the demo
  private generateSampleConversations(): Conversation[] {
    const now = new Date();
    return [
    // Direct conversation between James and Maria
    {
      id: 'conv1',
      type: 'direct',
      participants: ['james', 'maria'],
      lastMessage: {
        content: 'Blood pressure is 130/85, which is a bit elevated but not concerning. Blood glucose is normal at 110 mg/dL.',
        timestamp: new Date(now.getTime() - 3 * 60 * 60000).toISOString(),
        senderId: 'james'
      },
      unreadCount: 1
    },
    // Team conversation for Eleanor's Care Team
    {
      id: 'conv2',
      type: 'team',
      participants: ['james', 'maria', 'linda', 'robert'],
      teamId: 'team1',
      title: "Eleanor's Care Team",
      lastMessage: {
        content: "Also, could someone please remind the doctor about Eleanor's knee pain? We need to discuss physical therapy options.",
        timestamp: new Date(now.getTime() - 2 * 60 * 60000).toISOString(),
        senderId: 'robert'
      },
      unreadCount: 1
    },
    // Direct conversation between Linda and James
    {
      id: 'conv3',
      type: 'direct',
      participants: ['linda', 'james'],
      lastMessage: {
        content: "James, I noticed Eleanor didn't eat much dinner yesterday. Has she been eating well during your shifts?",
        timestamp: new Date(now.getTime() - 5 * 60 * 60000).toISOString(),
        senderId: 'linda'
      },
      unreadCount: 1
    },
    // Direct conversation between Robert and James
    {
      id: 'conv4',
      type: 'direct',
      participants: ['robert', 'james'],
      lastMessage: {
        content: "Hi James, I've updated Eleanor's exercise routine. Could you help her with the new exercises tomorrow?",
        timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
        senderId: 'robert'
      },
      unreadCount: 1
    }];
  }
  // Get all conversations for a user
  public getConversationsForUser(userId: string): Conversation[] {
    const conversations = storage.get(this.storageKeys.conversations, []) as Conversation[];
    return conversations.filter(conv => conv.participants.includes(userId));
  }
  // Get a specific conversation by ID
  public getConversationById(conversationId: string): Conversation | undefined {
    const conversations = storage.get(this.storageKeys.conversations, []) as Conversation[];
    return conversations.find(conv => conv.id === conversationId);
  }
  // Get messages for a specific conversation
  public getMessagesForConversation(conversationId: string): Message[] {
    const messages = storage.get(this.storageKeys.messages, []) as Message[];
    return messages.filter(msg => msg.conversationId === conversationId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  // Send a new message
  public sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): Message {
    const messages = storage.get(this.storageKeys.messages, []) as Message[];
    const conversations = storage.get(this.storageKeys.conversations, []) as Conversation[];
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    // Add message to storage
    messages.push(newMessage);
    storage.save(this.storageKeys.messages, messages);
    // Update conversation's last message and unread count
    const updatedConversations = conversations.map(conv => {
      if (conv.id === message.conversationId) {
        // Increment unread count for all participants except sender
        const unreadCount = conv.participants.filter(p => p !== message.senderId).length;
        return {
          ...conv,
          lastMessage: {
            content: message.content,
            timestamp: newMessage.timestamp,
            senderId: message.senderId
          },
          unreadCount: (conv.unreadCount || 0) + unreadCount
        };
      }
      return conv;
    });
    storage.save(this.storageKeys.conversations, updatedConversations);
    // Send notification to other participants
    this.notifyMessageRecipients(newMessage, updatedConversations.find(c => c.id === message.conversationId));
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'message_sent',
      conversation_type: updatedConversations.find(c => c.id === message.conversationId)?.type,
      has_attachment: !!message.attachments && message.attachments.length > 0
    });
    return newMessage;
  }
  // Create a new conversation
  public createConversation(conversation: Omit<Conversation, 'id' | 'lastMessage' | 'unreadCount'>): Conversation {
    const conversations = storage.get(this.storageKeys.conversations, []) as Conversation[];
    // Check if a direct conversation already exists between these participants
    if (conversation.type === 'direct' && conversation.participants.length === 2) {
      const existingConv = conversations.find(conv => conv.type === 'direct' && conv.participants.length === 2 && conv.participants.includes(conversation.participants[0]) && conv.participants.includes(conversation.participants[1]));
      if (existingConv) {
        return existingConv;
      }
    }
    const newConversation: Conversation = {
      ...conversation,
      id: `conv_${Date.now()}`,
      unreadCount: 0
    };
    conversations.push(newConversation);
    storage.save(this.storageKeys.conversations, conversations);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'conversation_created',
      conversation_type: conversation.type,
      participant_count: conversation.participants.length
    });
    return newConversation;
  }
  // Mark messages as read
  public markConversationAsRead(conversationId: string, userId: string): void {
    const messages = storage.get(this.storageKeys.messages, []) as Message[];
    const conversations = storage.get(this.storageKeys.conversations, []) as Conversation[];
    // Update messages
    const updatedMessages = messages.map(msg => {
      if (msg.conversationId === conversationId && !msg.read && msg.senderId !== userId) {
        return {
          ...msg,
          read: true
        };
      }
      return msg;
    });
    // Update conversation unread count
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0
        };
      }
      return conv;
    });
    storage.save(this.storageKeys.messages, updatedMessages);
    storage.save(this.storageKeys.conversations, updatedConversations);
  }
  // Get total unread message count for a user
  public getUnreadMessageCount(userId: string): number {
    const conversations = storage.get(this.storageKeys.conversations, []) as Conversation[];
    return conversations.filter(conv => conv.participants.includes(userId)).reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  }
  // Notify message recipients
  private notifyMessageRecipients(message: Message, conversation?: Conversation): void {
    if (!conversation) return;
    // Get sender name
    const sender = dataService.getTeamMemberById(message.senderId);
    if (!sender) return;
    // For each participant (except sender), create a notification
    conversation.participants.filter(participantId => participantId !== message.senderId).forEach(recipientId => {
      const notificationTitle = conversation.type === 'team' ? `New message in ${conversation.title || 'team chat'}` : `New message from ${sender.name}`;
      notificationService.addNotification({
        type: 'message',
        title: notificationTitle,
        message: `${sender.name}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
        priority: 'medium',
        relatedTo: 'conversation',
        relatedId: conversation.id
      });
    });
  }
}
export const messageService = new MessageService();