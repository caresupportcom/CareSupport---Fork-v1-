import React, { useState } from 'react';
import { CalendarIcon, ClipboardListIcon, PillIcon, MessageSquareIcon, UserIcon, HeartIcon, HomeIcon, ClockIcon, BellIcon, InfoIcon, CarIcon, ShoppingBagIcon, UsersIcon } from 'lucide-react';
import { UserResponsibilities, emptyResponsibilities } from '../../types/UserTypes';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
interface ResponsibilitySelectionScreenProps {
  onSelect: (responsibilities: UserResponsibilities) => void;
  onBack: () => void;
  initialResponsibilities?: UserResponsibilities;
}
export const ResponsibilitySelectionScreen: React.FC<ResponsibilitySelectionScreenProps> = ({
  onSelect,
  onBack,
  initialResponsibilities = emptyResponsibilities
}) => {
  const [responsibilities, setResponsibilities] = useState<UserResponsibilities>(initialResponsibilities);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const handleToggleResponsibility = (key: keyof UserResponsibilities) => {
    setResponsibilities(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const handleContinue = () => {
    // Check if at least one responsibility is selected
    const hasResponsibility = Object.values(responsibilities).some(Boolean);
    if (!hasResponsibility) {
      alert('Please select at least one responsibility.');
      return;
    }
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'responsibilities_selected',
      responsibility_count: Object.values(responsibilities).filter(Boolean).length
    });
    onSelect(responsibilities);
  };
  // Group responsibilities by category for better organization
  const administrativeResponsibilities: Array<{
    key: keyof UserResponsibilities;
    label: string;
    icon: React.ReactNode;
  }> = [{
    key: 'scheduling',
    label: 'Scheduling appointments',
    icon: <CalendarIcon className="w-4 h-4" />
  }, {
    key: 'coordinating',
    label: 'Coordinating care team',
    icon: <ClipboardListIcon className="w-4 h-4" />
  }, {
    key: 'managing_medications',
    label: 'Managing medications',
    icon: <PillIcon className="w-4 h-4" />
  }, {
    key: 'communicating',
    label: 'Communicating with providers',
    icon: <MessageSquareIcon className="w-4 h-4" />
  }];
  const directCareResponsibilities: Array<{
    key: keyof UserResponsibilities;
    label: string;
    icon: React.ReactNode;
  }> = [{
    key: 'personal_care',
    label: 'Personal care assistance',
    icon: <UserIcon className="w-4 h-4" />
  }, {
    key: 'medication_administration',
    label: 'Medication administration',
    icon: <PillIcon className="w-4 h-4" />
  }, {
    key: 'health_monitoring',
    label: 'Health monitoring',
    icon: <HeartIcon className="w-4 h-4" />
  }, {
    key: 'meal_preparation',
    label: 'Meal preparation',
    icon: <HomeIcon className="w-4 h-4" />
  }];
  const backupResponsibilities: Array<{
    key: keyof UserResponsibilities;
    label: string;
    icon: React.ReactNode;
  }> = [{
    key: 'emergency_coverage',
    label: 'Emergency coverage',
    icon: <BellIcon className="w-4 h-4" />
  }, {
    key: 'occasional_help',
    label: 'Occasional help',
    icon: <ClockIcon className="w-4 h-4" />
  }, {
    key: 'specific_tasks',
    label: 'Specific tasks only',
    icon: <ClipboardListIcon className="w-4 h-4" />
  }, {
    key: 'companionship',
    label: 'Companionship',
    icon: <UserIcon className="w-4 h-4" />
  }];
  const communityResponsibilities: Array<{
    key: keyof UserResponsibilities;
    label: string;
    icon: React.ReactNode;
  }> = [{
    key: 'transportation',
    label: 'Transportation',
    icon: <CarIcon className="w-4 h-4" />
  }, {
    key: 'shopping',
    label: 'Shopping & errands',
    icon: <ShoppingBagIcon className="w-4 h-4" />
  }, {
    key: 'home_maintenance',
    label: 'Home maintenance',
    icon: <HomeIcon className="w-4 h-4" />
  }, {
    key: 'social_activities',
    label: 'Social activities',
    icon: <UsersIcon className="w-4 h-4" />
  }];
  // Render a responsibility checkbox
  const renderResponsibilityOption = ({
    key,
    label,
    icon
  }: {
    key: keyof UserResponsibilities;
    label: string;
    icon: React.ReactNode;
  }) => <div key={key} className="mb-2">
      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
        <input type="checkbox" checked={responsibilities[key]} onChange={() => handleToggleResponsibility(key)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
        <div className="ml-3 flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            {icon}
          </div>
          <span className="text-gray-800">{label}</span>
        </div>
      </label>
    </div>;
  return <div className="p-6 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Your Responsibilities</h1>
          <button onClick={() => setShowInfoModal(true)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
            <InfoIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Select the caregiving responsibilities you typically handle
        </p>
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <ClipboardListIcon className="w-5 h-5 text-purple-500 mr-2" />
            <h2 className="text-lg font-medium">Administrative</h2>
          </div>
          <div className="pl-2">
            {administrativeResponsibilities.map(resp => renderResponsibilityOption(resp))}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <UserIcon className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-medium">Direct Care</h2>
          </div>
          <div className="pl-2">
            {directCareResponsibilities.map(resp => renderResponsibilityOption(resp))}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <ClockIcon className="w-5 h-5 text-green-500 mr-2" />
            <h2 className="text-lg font-medium">Backup Support</h2>
          </div>
          <div className="pl-2">
            {backupResponsibilities.map(resp => renderResponsibilityOption(resp))}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <HeartIcon className="w-5 h-5 text-amber-500 mr-2" />
            <h2 className="text-lg font-medium">Community Support</h2>
          </div>
          <div className="pl-2">
            {communityResponsibilities.map(resp => renderResponsibilityOption(resp))}
          </div>
        </div>
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <BracketText active={true} className="mb-1 text-blue-800 font-medium">
            Why This Matters
          </BracketText>
          <p className="text-sm text-blue-700">
            Your selected responsibilities help us personalize task suggestions
            and identify potential gaps in your care team's coverage.
          </p>
        </div>
      </div>
      <div className="mt-6 flex space-x-3">
        <Button onClick={onBack} variant="secondary" className="w-1/3">
          Back
        </Button>
        <Button onClick={handleContinue} className="w-2/3">
          Continue
        </Button>
      </div>
      {/* Info Modal */}
      {showInfoModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">
              About Responsibilities
            </h3>
            <p className="text-gray-700 mb-4">
              The Relationship + Responsibility framework recognizes that
              caregiving roles are fluid and overlapping. Rather than placing
              you in a rigid role, we focus on what you actually do.
            </p>
            <p className="text-gray-700 mb-4">
              Your selected responsibilities will help us:
            </p>
            <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
              <li>Suggest appropriate tasks for you</li>
              <li>Identify gaps in your care team's coverage</li>
              <li>Coordinate care more effectively</li>
              <li>Adjust as your responsibilities change over time</li>
            </ul>
            <Button onClick={() => setShowInfoModal(false)} className="w-full">
              Got it
            </Button>
          </div>
        </div>}
    </div>;
};