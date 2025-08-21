import React, { useEffect, useState } from 'react';
import { UserIcon, HeartIcon, ChevronRightIcon, UsersIcon } from 'lucide-react';
import { OnboardingScreen } from './components/Onboarding/OnboardingScreen';
import { WelcomeScreen } from './components/Onboarding/WelcomeScreen';
import { RecipientOnboardingScreen } from './components/Onboarding/RecipientOnboardingScreen';
import { HomeScreen } from './components/Home/HomeScreen';
import { ScheduleScreen } from './components/Schedule/ScheduleScreen';
import { ActionScreen } from './components/Action/ActionScreen';
import { SettingsScreen } from './components/Settings/SettingsScreen';
import { VoiceInputScreen } from './components/Voice/VoiceInputScreen';
import { TaskDetailScreen } from './components/Tasks/TaskDetailScreen';
import { TaskCreationScreen } from './components/Tasks/TaskCreationScreen';
import { TaskTemplateScreen } from './components/Action/TaskTemplateScreen';
import { SendAlertScreen } from './components/Action/SendAlertScreen';
import { AssignTaskScreen } from './components/Action/AssignTaskScreen';
import { SendUpdateScreen } from './components/Action/SendUpdateScreen';
import { MakeCallScreen } from './components/Action/MakeCallScreen';
import { AddEventScreen } from './components/Action/AddEventScreen';
import { ScheduleAppointmentScreen } from './components/Action/ScheduleAppointmentScreen';
import { RecordVitalsScreen } from './components/Action/RecordVitalsScreen';
import { MedicationReminderScreen } from './components/Action/MedicationReminderScreen';
import { EmergencyContactScreen } from './components/Action/EmergencyContactScreen';
import { ConflictResolutionScreen } from './components/Tasks/ConflictResolutionScreen';
import { AccessibilitySettingsScreen } from './components/Settings/AccessibilitySettingsScreen';
import { DisplayPreferencesScreen } from './components/Settings/DisplayPreferencesScreen';
import { NotificationPreferencesScreen } from './components/Settings/NotificationPreferencesScreen';
import { TaskPreferencesScreen } from './components/Settings/TaskPreferencesScreen';
import { ProfileScreen } from './components/Settings/ProfileScreen';
import { PrivacySettingsScreen } from './components/Settings/PrivacySettingsScreen';
import { HelpSupportScreen } from './components/Support/HelpSupportScreen';
import { CareTeamsScreen } from './components/CareTeams/CareTeamsScreen';
import { CareTeamDetailScreen } from './components/CareTeams/CareTeamDetailScreen';
import { CreateCareTeamScreen } from './components/CareTeams/CreateCareTeamScreen';
import { JoinCareTeamScreen } from './components/CareTeams/JoinCareTeamScreen';
import { BottomNavigation } from './components/Navigation/BottomNavigation';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { UserPreferencesProvider } from './contexts/UserPreferencesContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { OfflineBanner } from './components/Common/OfflineBanner';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { FeedbackDialog } from './components/Feedback/FeedbackDialog';
import { analytics, AnalyticsEvents } from './services/AnalyticsService';
import { storage } from './services/StorageService';
import { RecommendationsScreen } from './components/Voice/RecommendationsScreen';
import { NotificationScreen } from './components/Notifications/NotificationScreen';
import { NotificationToast } from './components/Notifications/NotificationToast';
import { notificationService } from './services/NotificationService';
import { CalendarProvider } from './contexts/CalendarContext';
import { dataService } from './services/DataService';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { HelpNeededScreen } from './components/HelpNeeded/HelpNeededScreen';
import { HelpRequestDetailScreen } from './components/HelpNeeded/HelpRequestDetailScreen';
import { TaskRequestScreen } from './components/Tasks/TaskRequestScreen';
import { SupportPreferencesScreen } from './components/Settings/SupportPreferencesScreen';
import { recommendationService } from './services/RecommendationService';
import { CommunityDashboardScreen } from './components/CommunityDashboard/CommunityDashboardScreen';
import { MessagesScreen } from './components/Messages/MessagesScreen';
import { ConversationScreen } from './components/Messages/ConversationScreen';
import { messageService } from './services/MessageService';
import { CareNetworkScreen } from './components/CareNetwork/CareNetworkScreen';
import { shiftService } from './services/ShiftService';
import { coverageService } from './services/CoverageService';
import { CareRecipientScreen } from './components/CareRecipient/CareRecipientScreen';
export function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [currentTask, setCurrentTask] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  // Initialize data and analytics
  useEffect(() => {
    const userId = storage.get('user_id', 'user-' + Math.floor(Math.random() * 1000000));
    storage.save('user_id', userId);
    analytics.initialize(userId);
    // Initialize our consistent data
    dataService.initializeData();
    // Initialize message data
    messageService.initializeData();
    // Initialize shift and coverage data
    shiftService.initializeData();
    coverageService.initializeData();
    // Check if we have saved screen state
    const savedScreen = storage.get('current_screen', null);
    if (savedScreen && savedScreen !== 'welcome' && savedScreen !== 'onboarding') {
      // Convert any 'today' saved screens to 'home'
      const screenToUse = savedScreen === 'today' ? 'home' : savedScreen;
      setCurrentScreen(screenToUse);
    }
    // Check for deep link or invitation code
    checkForInvitation();
    // Check for recipient-onboarding parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const screenParam = urlParams.get('screen');
    if (screenParam === 'recipient-onboarding') {
      setCurrentScreen('recipient-onboarding');
      // Clear the URL parameter after using it
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  // Function to check for invitation codes from deep links
  const checkForInvitation = () => {
    // In a real app, this would parse URL parameters or deep link data
    // For this prototype, we'll simulate an invitation code
    // Check URL for invite code (simulated here)
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    if (inviteCode) {
      // Store the invite code for the onboarding process
      storage.save('pending_invite_code', inviteCode);
      // Track the invite link usage
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'invite_link_opened',
        invite_code: inviteCode
      });
      // Ensure we start at welcome screen for proper onboarding
      setCurrentScreen('welcome');
    }
  };
  // Save current screen to localStorage whenever it changes
  useEffect(() => {
    storage.save('current_screen', currentScreen);
  }, [currentScreen]);
  const navigateTo = (screen, data = null) => {
    setCurrentScreen(screen);
    if (data) {
      if (data.teamId) {
        setCurrentTeam(data);
      } else if (data.conversationId) {
        setCurrentConversation(data);
      } else if (data.id) {
        setCurrentTask(data);
      } else if (data.transcription) {
        // Handle voice transcription data
        setCurrentTask(data);
      }
    }
    // Track screen view in analytics
    analytics.trackScreenView(screen);
  };
  const handleCreateTask = taskData => {
    // In a real app, this would save the task to a database
    console.log('New task created:', taskData);
    // Track task creation in analytics
    analytics.trackEvent(AnalyticsEvents.TASK_CREATED, {
      task_title: taskData.title,
      task_priority: taskData.priority,
      assigned_to: taskData.assignedTo,
      from_template: taskData.isTemplate || false
    });
    // Add notification for task creation
    notificationService.addNotification({
      type: 'task',
      title: 'New Task Created',
      message: `You created "${taskData.title}"`,
      priority: 'medium'
    });
    navigateTo('home');
  };
  const handleResolveConflict = resolution => {
    // In a real app, this would update the task in the database
    console.log('Conflict resolved:', resolution);
    // Track conflict resolution in analytics
    analytics.trackEvent(AnalyticsEvents.CONFLICT_RESOLVED, {
      resolution_type: resolution.resolution,
      task_id: currentTask?.id
    });
    // Add notification for conflict resolution
    notificationService.addNotification({
      type: 'conflict',
      title: 'Conflict Resolved',
      message: `The scheduling conflict for "${currentTask?.title}" has been resolved.`,
      priority: 'medium'
    });
    navigateTo('home');
  };
  const handleOpenFeedback = () => {
    setShowFeedback(true);
    analytics.trackFeatureUsage('feedback_opened');
  };
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onComplete={() => navigateTo('onboarding')} />;
      case 'onboarding':
        // Directly show the OnboardingScreen without the initial role selection
        return <OnboardingScreen onComplete={() => navigateTo('home')} />;
      case 'recipient-onboarding':
        return <RecipientOnboardingScreen onComplete={() => navigateTo('home')} />;
      case 'home':
        return <HomeScreen navigateTo={navigateTo} />;
      case 'today':
        return <HomeScreen navigateTo={navigateTo} />;
      case 'schedule':
        return <ScheduleScreen navigateTo={navigateTo} />;
      case 'action':
        return <ActionScreen navigateTo={navigateTo} />;
      case 'more':
        return <SettingsScreen navigateTo={navigateTo} onOpenFeedback={handleOpenFeedback} />;
      case 'profile':
        return <ProfileScreen onBack={() => navigateTo('more')} />;
      case 'accessibility':
        return <AccessibilitySettingsScreen onBack={() => navigateTo('more')} />;
      case 'display-preferences':
        return <DisplayPreferencesScreen onBack={() => navigateTo('more')} />;
      case 'notification-preferences':
        return <NotificationPreferencesScreen onBack={() => navigateTo('more')} />;
      case 'task-preferences':
        return <TaskPreferencesScreen onBack={() => navigateTo('more')} />;
      case 'privacy-settings':
        return <PrivacySettingsScreen onBack={() => navigateTo('more')} />;
      case 'help-support':
        return <HelpSupportScreen onBack={() => navigateTo('more')} />;
      case 'notifications':
        return <NotificationScreen onBack={() => navigateTo('home')} />;
      case 'care-network':
        return <CareNetworkScreen navigateTo={navigateTo} />;
      case 'care-teams':
        return <CareTeamsScreen navigateTo={navigateTo} />;
      case 'care-team-detail':
        return <CareTeamDetailScreen onBack={() => navigateTo('care-network')} teamData={currentTeam} navigateTo={navigateTo} />;
      case 'create-care-team':
        return <CreateCareTeamScreen onBack={() => navigateTo('care-network')} />;
      case 'join-care-team':
        return <JoinCareTeamScreen onBack={() => navigateTo('care-network')} />;
      case 'voice-input':
        return <VoiceInputScreen onComplete={() => navigateTo('home')} navigateTo={navigateTo} />;
      case 'voice-recommendations':
        return <RecommendationsScreen onComplete={() => navigateTo('home')} transcription={currentTask?.transcription || ''} privacyLevel={currentTask?.privacyLevel || 'team'} />;
      case 'task-detail':
        return <TaskDetailScreen task={currentTask} onBack={() => navigateTo('home')} navigateTo={navigateTo} />;
      case 'create-task':
        return <TaskCreationScreen onBack={() => navigateTo('home')} onCreateTask={handleCreateTask} />;
      case 'task-template':
        return <TaskTemplateScreen onBack={() => navigateTo('action')} onCreateTask={templateData => {
          setCurrentTask(templateData);
          navigateTo('create-task');
        }} />;
      case 'send-alert':
        return <SendAlertScreen onBack={() => navigateTo('action')} />;
      case 'assign-task':
        return <AssignTaskScreen onBack={() => navigateTo('action')} />;
      case 'send-update':
        return <SendUpdateScreen onBack={() => navigateTo('action')} />;
      case 'make-call':
        return <MakeCallScreen onBack={() => navigateTo('action')} />;
      case 'add-event':
        return <AddEventScreen onBack={() => navigateTo('action')} />;
      case 'schedule-appointment':
        return <ScheduleAppointmentScreen onBack={() => navigateTo('action')} />;
      case 'record-vitals':
        return <RecordVitalsScreen onBack={() => navigateTo('action')} />;
      case 'medication-reminder':
        return <MedicationReminderScreen onBack={() => navigateTo('action')} />;
      case 'emergency-contact':
        return <EmergencyContactScreen onBack={() => navigateTo('action')} />;
      case 'resolve-conflict':
        return <ConflictResolutionScreen task={currentTask} onBack={() => navigateTo('task-detail', currentTask)} onResolve={handleResolveConflict} />;
      case 'help-needed':
        return <HelpNeededScreen navigateTo={navigateTo} />;
      case 'help-request-detail':
        return <HelpRequestDetailScreen request={currentTask} onBack={() => navigateTo('help-needed')} onUpdate={updatedRequest => {
          // Update the current task state
          setCurrentTask(updatedRequest);
          // Add notification based on status change
          if (updatedRequest.status === 'claimed') {
            notificationService.addNotification({
              type: 'task',
              title: 'Help Request Claimed',
              message: `You've claimed the task "${updatedRequest.title}"`,
              priority: 'medium'
            });
          } else if (updatedRequest.status === 'completed') {
            notificationService.addNotification({
              type: 'task',
              title: 'Help Request Completed',
              message: `You've completed the task "${updatedRequest.title}"`,
              priority: 'medium'
            });
          }
        }} />;
      case 'create-help-request':
        return <TaskRequestScreen onBack={() => navigateTo('help-needed')} onCreateRequest={request => {
          dataService.addTaskRequest(request);
          notificationService.addNotification({
            type: 'task',
            title: 'New Help Request',
            message: `New request posted: "${request.title}"`,
            priority: 'medium'
          });
          navigateTo('help-needed');
        }} />;
      case 'support-preferences':
        return <SupportPreferencesScreen onBack={() => navigateTo('more')} />;
      case 'community-dashboard':
        return <CommunityDashboardScreen navigateTo={navigateTo} />;
      case 'messages':
        return <MessagesScreen navigateTo={navigateTo} />;
      case 'conversation-detail':
        return <ConversationScreen onBack={() => navigateTo('care-network')} conversationId={currentConversation?.conversationId} />;
      case 'care-recipient':
        return <CareRecipientScreen navigateTo={navigateTo} />;
      default:
        return <WelcomeScreen onComplete={() => navigateTo('onboarding')} />;
    }
  };
  // Show navigation only when not in welcome, onboarding, voice input, or detail screens
  const showNavigation = !['welcome', 'onboarding', 'voice-input', 'voice-recommendations', 'task-detail', 'create-task', 'task-template', 'send-alert', 'assign-task', 'send-update', 'make-call', 'add-event', 'schedule-appointment', 'record-vitals', 'medication-reminder', 'emergency-contact', 'resolve-conflict', 'accessibility', 'display-preferences', 'notification-preferences', 'task-preferences', 'privacy-settings', 'help-support', 'profile', 'care-team-detail', 'create-care-team', 'join-care-team', 'notifications', 'help-request-detail', 'create-help-request', 'support-preferences', 'conversation-detail'].includes(currentScreen);
  return <UserPreferencesProvider>
      <AccessibilityProvider>
        <ConnectionProvider>
          <NotificationProvider>
            <UserProfileProvider>
              <CalendarProvider>
                <div className="w-full min-h-screen bg-gray-100 flex justify-center">
                  <div className="w-full max-w-md bg-white min-h-screen relative overflow-hidden flex flex-col">
                    <OfflineBanner />
                    <ErrorBoundary>
                      <div className="flex-1 overflow-hidden pb-20" role="main">
                        {renderScreen()}
                      </div>
                      {showNavigation && <BottomNavigation currentScreen={currentScreen} navigateTo={navigateTo} />}
                    </ErrorBoundary>
                    <FeedbackDialog isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
                    <NotificationToast />
                  </div>
                </div>
              </CalendarProvider>
            </UserProfileProvider>
          </NotificationProvider>
        </ConnectionProvider>
      </AccessibilityProvider>
    </UserPreferencesProvider>;
}