import React from 'react';
import { UserIcon, BellIcon, PaletteIcon, EyeIcon, ListIcon, LockIcon, HelpCircleIcon, MessageSquareIcon, LogOutIcon, ChevronRightIcon, HeartIcon, AlertTriangleIcon } from 'lucide-react';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { storage } from '../../services/StorageService';
export const SettingsScreen = ({
  navigateTo,
  onOpenFeedback
}) => {
  const SettingsItem = ({
    icon,
    title,
    description,
    onClick
  }) => <button className="w-full flex items-center p-4 border-b border-gray-100 hover:bg-gray-50" onClick={onClick}>
      <div className="mr-4">{icon}</div>
      <div className="flex-1 text-left">
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
    </button>;
  const handleNavigation = screen => {
    navigateTo(screen);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'settings_navigation',
      destination: screen
    });
  };
  const handleSignOut = () => {
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'sign_out_completed'
    });
    // Clear relevant user data from storage
    storage.remove('current_screen');
    storage.remove('user_preferences');
    storage.remove('current_user');
    // Redirect to welcome screen
    navigateTo('welcome');
  };
  return <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {/* Emergency button at the top */}
          <SettingsItem icon={<AlertTriangleIcon className="w-5 h-5 text-red-500" />} title="Emergency" description="Quick access to emergency contacts and services" onClick={() => handleNavigation('emergency-contact')} />
          <SettingsItem icon={<UserIcon className="w-5 h-5 text-blue-500" />} title="Profile" description="View and edit your profile information" onClick={() => handleNavigation('profile')} />
          <SettingsItem icon={<HeartIcon className="w-5 h-5 text-purple-500" />} title="Support Preferences" description="Set your preferences for helping others" onClick={() => handleNavigation('support-preferences')} />
          <SettingsItem icon={<BellIcon className="w-5 h-5 text-yellow-500" />} title="Notification Preferences" description="Manage how you receive notifications" onClick={() => handleNavigation('notification-preferences')} />
          <SettingsItem icon={<EyeIcon className="w-5 h-5 text-green-500" />} title="Accessibility Settings" description="Adjust for better readability and usability" onClick={() => handleNavigation('accessibility')} />
          <SettingsItem icon={<PaletteIcon className="w-5 h-5 text-pink-500" />} title="Display Preferences" description="Customize the app's appearance" onClick={() => handleNavigation('display-preferences')} />
          <SettingsItem icon={<ListIcon className="w-5 h-5 text-indigo-500" />} title="Task Preferences" description="Set defaults for task creation" onClick={() => handleNavigation('task-preferences')} />
          <SettingsItem icon={<LockIcon className="w-5 h-5 text-red-500" />} title="Privacy Settings" description="Control your data and privacy options" onClick={() => handleNavigation('privacy-settings')} />
          <SettingsItem icon={<MessageSquareIcon className="w-5 h-5 text-orange-500" />} title="Give Feedback" description="Share your thoughts and suggestions" onClick={onOpenFeedback} />
          <SettingsItem icon={<HelpCircleIcon className="w-5 h-5 text-teal-500" />} title="Help & Support" description="FAQs, tutorials, and contact information" onClick={() => handleNavigation('help-support')} />
          <SettingsItem icon={<LogOutIcon className="w-5 h-5 text-gray-500" />} title="Sign Out" description="Log out of your account" onClick={handleSignOut} />
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">CareSupport v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">
            &copy; 2023 CareSupport Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>;
};