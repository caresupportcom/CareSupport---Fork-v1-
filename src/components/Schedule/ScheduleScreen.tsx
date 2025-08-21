import React, { useEffect, useState } from 'react';
import { CalendarIcon, LayoutDashboardIcon, ClockIcon } from 'lucide-react';
import { storage } from '../../services/StorageService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { ScheduleDashboard } from './ScheduleDashboard';
import { ShiftsView } from './ShiftsView/ShiftsView';
import { AvailabilityView } from './Availability/AvailabilityView';
export const ScheduleScreen = ({
  navigateTo
}) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    userRole
  } = useUserProfile();
  // Load saved tab preference
  useEffect(() => {
    const savedTab = storage.get('schedule_active_tab', 'dashboard');
    setActiveTab(savedTab);
  }, []);
  // Save tab preference when it changes
  useEffect(() => {
    storage.save('schedule_active_tab', activeTab);
    // Track tab change in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'schedule.tab_switched',
      tab: activeTab
    });
  }, [activeTab]);
  // Handle tab change
  const handleTabChange = tab => {
    setActiveTab(tab);
  };
  return <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-4">Schedule</h1>
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => handleTabChange('dashboard')} aria-current={activeTab === 'dashboard' ? 'page' : undefined}>
            <LayoutDashboardIcon className="w-4 h-4 mr-2" />
            Dashboard
          </button>
          <button className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'shifts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => handleTabChange('shifts')} aria-current={activeTab === 'shifts' ? 'page' : undefined}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Shifts
          </button>
          <button className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'availability' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} onClick={() => handleTabChange('availability')} aria-current={activeTab === 'availability' ? 'page' : undefined}>
            <ClockIcon className="w-4 h-4 mr-2" />
            Availability
          </button>
        </div>
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' ? <ScheduleDashboard navigateTo={navigateTo} /> : activeTab === 'shifts' ? <ShiftsView navigateTo={navigateTo} /> : <AvailabilityView navigateTo={navigateTo} />}
      </div>
    </div>;
};