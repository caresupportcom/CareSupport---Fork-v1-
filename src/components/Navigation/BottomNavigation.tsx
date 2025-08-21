import React from 'react';
import { CalendarIcon, ClockIcon, PlusCircleIcon, UsersIcon, SettingsIcon, HomeIcon, MenuIcon } from 'lucide-react';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const BottomNavigation = ({
  currentScreen,
  navigateTo
}) => {
  const navigationItems = [{
    id: 'home',
    label: 'Home',
    icon: <HomeIcon className="w-5 h-5" />
  }, {
    id: 'schedule',
    label: 'Schedule',
    icon: <CalendarIcon className="w-5 h-5" />
  }, {
    id: 'action',
    label: 'Action',
    icon: <PlusCircleIcon className="w-5 h-5" />
  }, {
    id: 'care-network',
    label: 'Network',
    icon: <UsersIcon className="w-5 h-5" />
  }, {
    id: 'more',
    label: 'More',
    icon: <MenuIcon className="w-5 h-5" />
  }];
  const handleNavigate = screen => {
    if (currentScreen !== screen) {
      navigateTo(screen);
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'bottom_navigation',
        destination: screen
      });
    }
  };
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-4 max-w-md mx-auto">
      <button onClick={() => handleNavigate('home')} className={`flex flex-col items-center justify-center w-16 py-1 ${currentScreen === 'home' ? 'text-blue-600' : 'text-gray-500'}`} aria-label="Home">
        <HomeIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Home</span>
      </button>
      <button onClick={() => handleNavigate('schedule')} className={`flex flex-col items-center justify-center w-16 py-1 ${currentScreen === 'schedule' ? 'text-blue-600' : 'text-gray-500'}`} aria-label="Schedule">
        <CalendarIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Schedule</span>
      </button>
      <button onClick={() => handleNavigate('action')} className={`flex flex-col items-center justify-center w-16 py-1 ${currentScreen === 'action' ? 'text-blue-600' : 'text-gray-500'}`} aria-label="Action">
        <PlusCircleIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Action</span>
      </button>
      <button onClick={() => handleNavigate('care-network')} className={`flex flex-col items-center justify-center w-16 py-1 ${currentScreen === 'care-network' ? 'text-blue-600' : 'text-gray-500'}`} aria-label="Care Network">
        <UsersIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Network</span>
      </button>
      <button onClick={() => handleNavigate('more')} className={`flex flex-col items-center justify-center w-16 py-1 ${currentScreen === 'more' ? 'text-blue-600' : 'text-gray-500'}`} aria-label="More">
        <SettingsIcon className="w-6 h-6" />
        <span className="text-xs mt-1">More</span>
      </button>
    </div>;
};