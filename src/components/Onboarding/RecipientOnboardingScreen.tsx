import React, { useEffect, useState } from 'react';
import { RecipientWelcomeScreen } from './RecipientWelcomeScreen';
import { TeamBuildingScreen } from './TeamBuildingScreen';
import { MedicalConditionsScreen } from './MedicalConditionsScreen';
import { DailyRoutineScreen } from './DailyRoutineScreen';
import { EmergencyContactScreen } from './EmergencyContactScreen';
import { VoiceIntroScreen } from './VoiceIntroScreen';
import { storage } from '../../services/StorageService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { UserProfile, RelationshipType, emptyResponsibilities } from '../../types/UserTypes';
interface RecipientOnboardingScreenProps {
  onComplete: () => void;
}
export const RecipientOnboardingScreen: React.FC<RecipientOnboardingScreenProps> = ({
  onComplete
}) => {
  const {
    updateUserProfile
  } = useUserProfile();
  const [step, setStep] = useState(0);
  const [animateOut, setAnimateOut] = useState(false);
  // Recipient profile information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // Team information
  const [invitedMembers, setInvitedMembers] = useState<{
    name: string;
    email: string;
    relationship: RelationshipType;
    isEmergencyContact?: boolean;
  }[]>([]);
  // Medical information
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState('');
  // Daily routine preferences
  const [selectedMealTimes, setSelectedMealTimes] = useState<string[]>([]);
  const [selectedSleepTimes, setSelectedSleepTimes] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [otherActivity, setOtherActivity] = useState('');
  // Emergency contact
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relationship: '',
    useTeamMember: false,
    teamMemberIndex: -1
  });
  // Voice command demo
  const [voiceDemoCompleted, setVoiceDemoCompleted] = useState(false);
  // Track onboarding progress
  useEffect(() => {
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'recipient_onboarding_step_viewed',
      step: step
    });
  }, [step]);
  const handleNextStep = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setStep(step + 1);
      setAnimateOut(false);
    }, 300);
  };
  const handlePreviousStep = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setStep(step - 1);
      setAnimateOut(false);
    }, 300);
  };
  const handleAddTeamMember = (member: {
    name: string;
    email: string;
    relationship: RelationshipType;
    isEmergencyContact?: boolean;
  }) => {
    setInvitedMembers([...invitedMembers, member]);
    // If marked as emergency contact, update emergency contact info
    if (member.isEmergencyContact) {
      setEmergencyContact({
        name: member.name,
        phone: '',
        relationship: getRelationshipDisplayName(member.relationship),
        useTeamMember: true,
        teamMemberIndex: invitedMembers.length // Index of the member we're adding
      });
    }
  };
  const handleRemoveTeamMember = (index: number) => {
    const updatedMembers = [...invitedMembers];
    updatedMembers.splice(index, 1);
    setInvitedMembers(updatedMembers);
    // If this was an emergency contact, reset the emergency contact info
    if (emergencyContact.useTeamMember && emergencyContact.teamMemberIndex === index) {
      setEmergencyContact({
        name: '',
        phone: '',
        relationship: '',
        useTeamMember: false,
        teamMemberIndex: -1
      });
    }
  };
  const formatMedicalInfo = () => {
    let medicalInfo = '';
    if (selectedConditions.length > 0) {
      medicalInfo += 'Medical Conditions: ' + selectedConditions.join(', ');
      if (otherCondition) {
        medicalInfo += ', ' + otherCondition;
      }
      medicalInfo += '\n\n';
    }
    if (selectedAllergies.length > 0) {
      medicalInfo += 'Allergies: ' + selectedAllergies.join(', ');
      if (otherAllergy) {
        medicalInfo += ', ' + otherAllergy;
      }
    }
    return medicalInfo;
  };
  const formatRoutinePreferences = () => {
    let routinePrefs = '';
    if (selectedMealTimes.length > 0) {
      routinePrefs += 'Meal Preferences: ' + selectedMealTimes.join(', ') + '\n\n';
    }
    if (selectedSleepTimes.length > 0) {
      routinePrefs += 'Sleep Schedule: ' + selectedSleepTimes.join(', ') + '\n\n';
    }
    if (selectedActivities.length > 0) {
      routinePrefs += 'Preferred Activities: ' + selectedActivities.join(', ');
      if (otherActivity) {
        routinePrefs += ', ' + otherActivity;
      }
    }
    return routinePrefs;
  };
  const handleCompleteOnboarding = () => {
    // Create user profile for the care recipient
    const userProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      relationship: 'care_recipient',
      responsibilities: emptyResponsibilities,
      availabilityPattern: 'as_needed'
    };
    // Save to context and storage
    updateUserProfile(userProfile);
    // Save all collected information
    storage.save('user_name', name);
    storage.save('user_email', email);
    storage.save('user_phone', phone);
    storage.save('user_role', 'care_recipient');
    // Save team members
    storage.save('invited_team_members', JSON.stringify(invitedMembers));
    // Save preferences
    storage.save('medical_info', formatMedicalInfo());
    storage.save('routine_preferences', formatRoutinePreferences());
    storage.save('emergency_contact', JSON.stringify(emergencyContact));
    // Track completion in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'recipient_onboarding_completed',
      steps_viewed: step + 1,
      team_members_invited: invitedMembers.length
    });
    onComplete();
  };
  const renderStep = () => {
    switch (step) {
      case 0:
        return <RecipientWelcomeScreen onNext={handleNextStep} animateOut={animateOut} setName={setName} setEmail={setEmail} setPhone={setPhone} name={name} email={email} phone={phone} />;
      case 1:
        return <TeamBuildingScreen onNext={handleNextStep} onBack={handlePreviousStep} animateOut={animateOut} onAddTeamMember={handleAddTeamMember} onRemoveTeamMember={handleRemoveTeamMember} invitedMembers={invitedMembers} recipientName={name} />;
      case 2:
        return <MedicalConditionsScreen onNext={handleNextStep} onBack={handlePreviousStep} animateOut={animateOut} selectedConditions={selectedConditions} setSelectedConditions={setSelectedConditions} otherCondition={otherCondition} setOtherCondition={setOtherCondition} selectedAllergies={selectedAllergies} setSelectedAllergies={setSelectedAllergies} otherAllergy={otherAllergy} setOtherAllergy={setOtherAllergy} />;
      case 3:
        return <DailyRoutineScreen onNext={handleNextStep} onBack={handlePreviousStep} animateOut={animateOut} selectedMealTimes={selectedMealTimes} setSelectedMealTimes={setSelectedMealTimes} selectedSleepTimes={selectedSleepTimes} setSelectedSleepTimes={setSelectedSleepTimes} selectedActivities={selectedActivities} setSelectedActivities={setSelectedActivities} otherActivity={otherActivity} setOtherActivity={setOtherActivity} />;
      case 4:
        return <EmergencyContactScreen onNext={handleNextStep} onBack={handlePreviousStep} animateOut={animateOut} emergencyContact={emergencyContact} setEmergencyContact={setEmergencyContact} teamMembers={invitedMembers} />;
      case 5:
        return <VoiceIntroScreen onComplete={handleCompleteOnboarding} onBack={handlePreviousStep} animateOut={animateOut} recipientName={name} setVoiceDemoCompleted={setVoiceDemoCompleted} voiceDemoCompleted={voiceDemoCompleted} />;
      default:
        return null;
    }
  };
  const getTotalSteps = () => 6; // Welcome, Team Building, Medical, Routine, Emergency, Voice Intro
  const renderProgressIndicator = () => {
    const totalSteps = getTotalSteps();
    return <div className="flex justify-center mb-8">
        {Array.from({
        length: totalSteps
      }).map((_, index) => <div key={index} className={`h-1.5 rounded-full mx-1 ${index <= step ? 'bg-blue-500 w-8' : 'bg-gray-200 w-6'} transition-all duration-300`} />)}
      </div>;
  };
  return <div className="p-6 h-full flex flex-col">
      {renderProgressIndicator()}
      <div className="flex-1 flex flex-col justify-center">{renderStep()}</div>
    </div>;
};
function getRelationshipDisplayName(relationship: RelationshipType): string {
  const displayNames = {
    care_recipient: 'Care Recipient',
    spouse_partner: 'Spouse/Partner',
    adult_child: 'Adult Child',
    parent: 'Parent',
    sibling: 'Sibling',
    other_family: 'Other Family Member',
    professional_caregiver: 'Professional Caregiver',
    nurse_medical: 'Nurse/Medical Professional',
    agency_coordinator: 'Agency Coordinator',
    healthcare_provider: 'Healthcare Provider',
    close_friend: 'Close Friend',
    neighbor: 'Neighbor',
    community_volunteer: 'Community Volunteer',
    other_helper: 'Other Helper'
  };
  return displayNames[relationship] || 'Unknown Relationship';
}