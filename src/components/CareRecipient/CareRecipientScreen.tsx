import React, { useState } from 'react';
import { CareRecipientDashboard } from './CareRecipientDashboard';
import { CarePlanView } from './CarePlanView';
import { CaregiverFeedback } from './CaregiverFeedback';
interface CareRecipientScreenProps {
  navigateTo: (screen: string, data?: any) => void;
}
export const CareRecipientScreen: React.FC<CareRecipientScreenProps> = ({
  navigateTo
}) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'care-plan' | 'feedback'>('dashboard');
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | undefined>(undefined);
  const [selectedShiftId, setSelectedShiftId] = useState<string | undefined>(undefined);
  // Handle messaging a caregiver
  const handleMessageCaregiver = (caregiverId: string) => {
    // In a real app, this would navigate to a conversation with the caregiver
    console.log('Message caregiver:', caregiverId);
    // Find or create a conversation with this caregiver
    const conversationData = {
      conversationId: `conv_${caregiverId}`
    };
    // Navigate to the conversation screen
    navigateTo('conversation-detail', conversationData);
  };
  // Handle calling a caregiver
  const handleCallCaregiver = (caregiverId: string) => {
    // In a real app, this would initiate a call to the caregiver
    console.log('Call caregiver:', caregiverId);
    // For demo purposes, just show an alert
    alert(`Calling caregiver... (This would initiate a call to the caregiver in a real app)`);
  };
  // Handle providing feedback for a caregiver
  const handleProvideFeedback = (caregiverId: string) => {
    setSelectedCaregiverId(caregiverId);
    setActiveView('feedback');
  };
  // Handle completing a care plan task
  const handleTaskComplete = (taskId: string) => {
    // In a real app, this would update the task completion status
    console.log('Task completed:', taskId);
  };
  // Handle viewing task details
  const handleTaskDetail = (taskId: string) => {
    // In a real app, this would navigate to the task detail screen
    console.log('View task details:', taskId);
  };
  // Render the appropriate view
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <CareRecipientDashboard onMessageCaregiver={handleMessageCaregiver} onCallCaregiver={handleCallCaregiver} onViewCarePlan={() => setActiveView('care-plan')} onViewSchedule={() => navigateTo('schedule')} onProvideFeedback={handleProvideFeedback} />;
      case 'care-plan':
        return <CarePlanView onBack={() => setActiveView('dashboard')} onTaskComplete={handleTaskComplete} onTaskDetail={handleTaskDetail} />;
      case 'feedback':
        return <CaregiverFeedback onBack={() => setActiveView('dashboard')} caregiverId={selectedCaregiverId} shiftId={selectedShiftId} />;
      default:
        return <CareRecipientDashboard onMessageCaregiver={handleMessageCaregiver} onCallCaregiver={handleCallCaregiver} onViewCarePlan={() => setActiveView('care-plan')} onViewSchedule={() => navigateTo('schedule')} onProvideFeedback={handleProvideFeedback} />;
    }
  };
  return <div className="h-full flex flex-col">{renderView()}</div>;
};