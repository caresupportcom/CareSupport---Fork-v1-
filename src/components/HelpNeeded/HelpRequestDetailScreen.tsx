import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, UserIcon, CheckIcon, XIcon, AlertTriangleIcon, MessageCircleIcon, ShareIcon, HandIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { dataService, HelpOpportunity } from '../../services/DataService';
import { notificationService } from '../../services/NotificationService';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { getRelationshipCategory } from '../../types/UserTypes';
export const HelpRequestDetailScreen = ({
  request,
  onBack,
  onUpdate
}) => {
  const [helpRequest, setHelpRequest] = useState<HelpOpportunity | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const {
    userProfile
  } = useUserProfile();
  // Get user role category
  const userRoleCategory = userProfile?.relationship ? getRelationshipCategory(userProfile.relationship) : 'family';
  // Determine if user is a supporter
  const isSupporter = userRoleCategory === 'community' || userRoleCategory === 'friend';
  // Current user ID (in a real app, this would come from auth)
  const currentUserId = 'james';
  useEffect(() => {
    // Load the request data
    if (request?.id) {
      const requestData = dataService.getHelpOpportunityById(request.id);
      if (requestData) {
        setHelpRequest(requestData);
      }
    }
    // Track screen view
    analytics.trackScreenView('help_request_detail');
  }, [request]);
  const handleAccept = () => {
    if (!helpRequest) return;
    const updatedRequest = {
      ...helpRequest,
      status: 'accepted',
      acceptedBy: currentUserId,
      acceptedAt: new Date().toISOString()
    };
    // Update in data service
    dataService.updateHelpOpportunity(updatedRequest);
    // Update local state
    setHelpRequest(updatedRequest);
    // Send notification
    notificationService.addNotification({
      type: 'help',
      title: 'Help Request Accepted',
      message: `You've accepted to help with: ${updatedRequest.title}`,
      priority: 'medium'
    });
    // Call parent update handler
    if (onUpdate) {
      onUpdate(updatedRequest);
    }
    // Close modal
    setShowConfirmModal(false);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_request_accepted',
      request_id: updatedRequest.id
    });
  };
  const handleComplete = () => {
    if (!helpRequest) return;
    const updatedRequest = {
      ...helpRequest,
      status: 'completed',
      completedBy: currentUserId,
      completedAt: new Date().toISOString(),
      completionNotes: completionNotes
    };
    // Update in data service
    dataService.updateHelpOpportunity(updatedRequest);
    // Update local state
    setHelpRequest(updatedRequest);
    // Send notification
    notificationService.addNotification({
      type: 'help',
      title: 'Help Request Completed',
      message: `You've completed the task: ${updatedRequest.title}`,
      priority: 'medium'
    });
    // Call parent update handler
    if (onUpdate) {
      onUpdate(updatedRequest);
    }
    // Close modal
    setShowCompleteModal(false);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_request_completed',
      request_id: updatedRequest.id
    });
  };
  const handleCancel = () => {
    if (!helpRequest) return;
    const updatedRequest = {
      ...helpRequest,
      status: 'open',
      acceptedBy: undefined,
      acceptedAt: undefined
    };
    // Update in data service
    dataService.updateHelpOpportunity(updatedRequest);
    // Update local state
    setHelpRequest(updatedRequest);
    // Send notification
    notificationService.addNotification({
      type: 'help',
      title: 'Help Request Cancelled',
      message: `You've cancelled your help with: ${updatedRequest.title}`,
      priority: 'medium'
    });
    // Call parent update handler
    if (onUpdate) {
      onUpdate(updatedRequest);
    }
    // Close modal
    setShowCancelModal(false);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_request_cancelled',
      request_id: updatedRequest.id
    });
  };
  const handleMessageCreator = () => {
    // In a real app, this would navigate to a conversation with the creator
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'message_help_request_creator',
      request_id: helpRequest?.id,
      creator_id: helpRequest?.createdBy
    });
  };
  const handleShare = () => {
    // In a real app, this would open a share dialog
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'share_help_request',
      request_id: helpRequest?.id
    });
  };
  if (!helpRequest) {
    return <div className="h-full flex items-center justify-center">
        <p>Loading request details...</p>
      </div>;
  }
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
  // Get creator name
  const getCreatorName = () => {
    const creator = dataService.getTeamMemberById(helpRequest.createdBy);
    return creator?.name || 'Unknown';
  };
  // Get acceptor name
  const getAcceptorName = () => {
    if (!helpRequest.acceptedBy) return 'No one yet';
    if (helpRequest.acceptedBy === currentUserId) return 'You';
    const acceptor = dataService.getTeamMemberById(helpRequest.acceptedBy);
    return acceptor?.name || 'Unknown';
  };
  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'No date specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Help Request</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Request Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          {/* Category Banner */}
          <div className={`px-4 py-2 bg-${getCategoryColor(helpRequest.category)}-100 border-b border-${getCategoryColor(helpRequest.category)}-200 flex items-center`}>
            <HandIcon className={`w-4 h-4 text-${getCategoryColor(helpRequest.category)}-600 mr-2`} />
            <span className={`text-sm font-medium text-${getCategoryColor(helpRequest.category)}-700`}>
              {getCategoryLabel(helpRequest.category)}
            </span>
          </div>

          {/* Request Details */}
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">{helpRequest.title}</h2>
            <p className="text-gray-700 mb-4">{helpRequest.description}</p>

            <div className="space-y-3 mb-4">
              {helpRequest.dueDate && <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-gray-700">
                      {formatDate(helpRequest.dueDate)}
                    </p>
                  </div>
                </div>}

              {helpRequest.dueTime && <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-gray-700">{helpRequest.dueTime}</p>
                  </div>
                </div>}

              {helpRequest.duration && <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-gray-700">
                      {helpRequest.duration >= 60 ? `${Math.floor(helpRequest.duration / 60)} hour${Math.floor(helpRequest.duration / 60) !== 1 ? 's' : ''}${helpRequest.duration % 60 > 0 ? ` ${helpRequest.duration % 60} minutes` : ''}` : `${helpRequest.duration} minutes`}
                    </p>
                  </div>
                </div>}

              {helpRequest.location && <div className="flex items-center">
                  <MapPinIcon className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-gray-700">{helpRequest.location}</p>
                  </div>
                </div>}

              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium">Requested By</p>
                  <p className="text-gray-700">{getCreatorName()}</p>
                </div>
              </div>

              <div className="flex items-center">
                <AlertTriangleIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <p className={`${helpRequest.priority === 'high' ? 'text-red-600' : helpRequest.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {helpRequest.priority.charAt(0).toUpperCase() + helpRequest.priority.slice(1)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className={`${helpRequest.status === 'completed' ? 'text-green-600' : helpRequest.status === 'accepted' ? 'text-blue-600' : helpRequest.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {helpRequest.status.charAt(0).toUpperCase() + helpRequest.status.slice(1)}
                    {helpRequest.status === 'accepted' && ` by ${getAcceptorName()}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              {isSupporter && helpRequest.status === 'open' && <Button className="flex-1" onClick={() => setShowConfirmModal(true)}>
                  <BracketText active={true} className="text-white">
                    I Can Help
                  </BracketText>
                </Button>}

              {helpRequest.status === 'accepted' && helpRequest.acceptedBy === currentUserId && <>
                    <Button variant="secondary" className="flex-1" onClick={() => setShowCancelModal(true)}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={() => setShowCompleteModal(true)}>
                      <BracketText active={true} className="text-white">
                        Mark Complete
                      </BracketText>
                    </Button>
                  </>}

              {helpRequest.status === 'completed' && <div className="w-full py-3 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
                  <CheckIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">Task Completed</span>
                </div>}
            </div>

            {/* Secondary Actions */}
            <div className="flex space-x-3 mt-4">
              <button className="flex-1 py-2 border border-gray-200 rounded-lg flex items-center justify-center text-gray-700" onClick={handleMessageCreator}>
                <MessageCircleIcon className="w-4 h-4 mr-2" />
                <span>Message</span>
              </button>
              <button className="flex-1 py-2 border border-gray-200 rounded-lg flex items-center justify-center text-gray-700" onClick={handleShare}>
                <ShareIcon className="w-4 h-4 mr-2" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Completion Notes (if completed) */}
        {helpRequest.status === 'completed' && helpRequest.completionNotes && <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <h3 className="font-medium mb-2">Completion Notes</h3>
            <p className="text-gray-700">{helpRequest.completionNotes}</p>
          </div>}
      </div>

      {/* Confirm Accept Modal */}
      {showConfirmModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Help</h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to help with "{helpRequest.title}"? By
              accepting, you're committing to complete this task.
            </p>
            <div className="flex space-x-3">
              <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleAccept}>
                Yes, I'll Help
              </button>
            </div>
          </div>
        </div>}

      {/* Cancel Help Modal */}
      {showCancelModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Cancel Help</h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel your help with "
              {helpRequest.title}"? The task will be made available for others
              to help with.
            </p>
            <div className="flex space-x-3">
              <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setShowCancelModal(false)}>
                Keep Task
              </button>
              <button className="flex-1 py-2 bg-red-500 text-white rounded-lg" onClick={handleCancel}>
                Cancel Help
              </button>
            </div>
          </div>
        </div>}

      {/* Complete Task Modal */}
      {showCompleteModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Mark Task Complete</h2>
            <p className="text-gray-700 mb-4">
              Are you ready to mark "{helpRequest.title}" as complete?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Completion Notes (Optional)
              </label>
              <textarea className="w-full border border-gray-300 rounded-lg p-2 h-24" placeholder="Add any notes about how the task went..." value={completionNotes} onChange={e => setCompletionNotes(e.target.value)}></textarea>
            </div>
            <div className="flex space-x-3">
              <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setShowCompleteModal(false)}>
                Cancel
              </button>
              <button className="flex-1 py-2 bg-green-500 text-white rounded-lg" onClick={handleComplete}>
                Mark Complete
              </button>
            </div>
          </div>
        </div>}
    </div>;
};