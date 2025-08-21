import React, { useEffect, useState } from 'react';
import { CalendarIcon, ClockIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { RecurringAvailability } from './RecurringAvailability';
import { UnavailabilityAlert } from './UnavailabilityAlert';
import { useUserProfile } from '../../../contexts/UserProfileContext';
import { availabilityService } from '../../../services/AvailabilityService';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';
import { storage } from '../../../services/StorageService';
export const AvailabilityView = ({
  navigateTo
}) => {
  const [activeSection, setActiveSection] = useState('calendar');
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [showUnavailabilityForm, setShowUnavailabilityForm] = useState(false);
  const {
    userProfile
  } = useUserProfile();
  // Load saved availability status
  useEffect(() => {
    // Initialize availability service
    availabilityService.initializeData();
    // Load saved status
    const userId = storage.get('user_id', '');
    if (userId) {
      const currentStatus = availabilityService.getCurrentStatus(userId);
      if (currentStatus) {
        setAvailabilityStatus(currentStatus);
      }
    }
    // Track page view
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_view_opened',
      initial_section: activeSection
    });
  }, []);
  // Handle status change
  const handleStatusChange = status => {
    setAvailabilityStatus(status);
    // Save to service
    const userId = storage.get('user_id', '');
    if (userId) {
      availabilityService.updateCurrentStatus(userId, status);
    }
    // Track status change
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_status_changed',
      new_status: status
    });
    // Show unavailability form if status is unavailable
    if (status === 'unavailable') {
      setShowUnavailabilityForm(true);
    }
  };
  // Handle section change
  const handleSectionChange = section => {
    setActiveSection(section);
    // Track section change
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_section_changed',
      new_section: section
    });
  };
  return <div className="p-4">
      {/* Quick status update banner */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-3">
          Current Availability Status
        </h2>
        <div className="flex flex-col space-y-3 sm:space-y-4 md:space-y-0 md:flex-row md:items-start md:space-x-4">
          <StatusSelector currentStatus={availabilityStatus} onStatusChange={handleStatusChange} />
          <div className="w-full min-w-0">
            {showUnavailabilityForm ? <UnavailabilityAlert onComplete={() => setShowUnavailabilityForm(false)} /> : <StatusDisplay status={availabilityStatus} />}
          </div>
        </div>
      </div>
      {/* Section tabs */}
      <div className="mb-4 flex border-b border-gray-200">
        <button className={`px-4 py-2 font-medium text-sm border-b-2 ${activeSection === 'calendar' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`} onClick={() => handleSectionChange('calendar')}>
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar View
          </div>
        </button>
        <button className={`px-4 py-2 font-medium text-sm border-b-2 ${activeSection === 'recurring' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`} onClick={() => handleSectionChange('recurring')}>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-2" />
            Recurring Schedule
          </div>
        </button>
      </div>
      {/* Section content */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {activeSection === 'calendar' ? <AvailabilityCalendar /> : <RecurringAvailability />}
      </div>
    </div>;
};
// Status selector component
const StatusSelector = ({
  currentStatus,
  onStatusChange
}) => {
  return <div className="w-full md:w-auto">
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onStatusChange('available')} className={`px-2 py-2 rounded-lg text-xs sm:text-sm font-medium flex flex-col items-center justify-center ${currentStatus === 'available' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600'}`}>
          <CheckCircleIcon className="w-4 h-4 mb-1" />
          Available
        </button>
        <button onClick={() => onStatusChange('tentative')} className={`px-2 py-2 rounded-lg text-xs sm:text-sm font-medium flex flex-col items-center justify-center ${currentStatus === 'tentative' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-gray-100 text-gray-600'}`}>
          <ClockIcon className="w-4 h-4 mb-1" />
          Tentative
        </button>
        <button onClick={() => onStatusChange('unavailable')} className={`px-2 py-2 rounded-lg text-xs sm:text-sm font-medium flex flex-col items-center justify-center ${currentStatus === 'unavailable' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-600'}`}>
          <AlertTriangleIcon className="w-4 h-4 mb-1" />
          Unavailable
        </button>
      </div>
    </div>;
};
// Status display component
const StatusDisplay = ({
  status
}) => {
  const statusInfo = {
    available: {
      icon: <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />,
      text: "You're currently available for shifts",
      description: "Team members can assign tasks to you and you'll appear in the available caregivers list"
    },
    tentative: {
      icon: <ClockIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
      text: "You're tentatively available",
      description: "You may be contacted for urgent shifts, but aren't fully available"
    },
    unavailable: {
      icon: <AlertTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />,
      text: "You're currently unavailable",
      description: "You won't be assigned new shifts until your status changes"
    }
  };
  const info = statusInfo[status] || statusInfo.available;
  return <div className="flex items-start">
      <div className="mr-3 mt-0.5">{info.icon}</div>
      <div className="min-w-0">
        <p className="font-medium">{info.text}</p>
        <p className="text-sm text-gray-600">{info.description}</p>
      </div>
    </div>;
};