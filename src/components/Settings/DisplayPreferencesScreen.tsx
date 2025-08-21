import React from 'react';
import { ArrowLeftIcon, MonitorIcon, ClockIcon, LayoutIcon, EyeIcon } from 'lucide-react';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const DisplayPreferencesScreen = ({
  onBack
}) => {
  const {
    preferences,
    updatePreferences
  } = useUserPreferences();
  const {
    theme,
    timeFormat,
    defaultView,
    compactMode
  } = preferences.display;
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    updatePreferences('display', {
      theme: newTheme
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'display_theme_changed',
      theme: newTheme
    });
  };
  const handleTimeFormatChange = (newFormat: '12h' | '24h') => {
    updatePreferences('display', {
      timeFormat: newFormat
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'time_format_changed',
      format: newFormat
    });
  };
  const handleDefaultViewChange = (newView: 'all' | 'pending' | 'completed') => {
    updatePreferences('display', {
      defaultView: newView
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'default_view_changed',
      view: newView
    });
  };
  const handleCompactModeToggle = () => {
    updatePreferences('display', {
      compactMode: !compactMode
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'compact_mode_toggled',
      enabled: !compactMode
    });
  };
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Display Preferences</h1>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <p className="text-gray-600 mb-6">
          Customize how the app looks and displays information.
        </p>
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                <MonitorIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Theme</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Choose your preferred color theme
                </p>
                <div className="space-y-2">
                  <button className={`w-full p-3 rounded-lg border ${theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleThemeChange('light')}>
                    <div className="w-6 h-6 rounded-full bg-white border border-gray-300 mr-3"></div>
                    <span className="font-medium">Light</span>
                    {theme === 'light' && <div className="ml-auto bg-blue-500 text-white p-1 rounded-full">
                        <CheckIcon className="w-4 h-4" />
                      </div>}
                  </button>
                  <button className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleThemeChange('dark')}>
                    <div className="w-6 h-6 rounded-full bg-gray-800 mr-3"></div>
                    <span className="font-medium">Dark</span>
                    {theme === 'dark' && <div className="ml-auto bg-blue-500 text-white p-1 rounded-full">
                        <CheckIcon className="w-4 h-4" />
                      </div>}
                  </button>
                  <button className={`w-full p-3 rounded-lg border ${theme === 'system' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleThemeChange('system')}>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-white to-gray-800 mr-3"></div>
                    <span className="font-medium">System Default</span>
                    {theme === 'system' && <div className="ml-auto bg-blue-500 text-white p-1 rounded-full">
                        <CheckIcon className="w-4 h-4" />
                      </div>}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Time Format */}
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                <ClockIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Time Format</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Choose how times are displayed
                </p>
                <div className="flex space-x-3">
                  <button className={`flex-1 py-2 px-4 rounded-full text-sm font-medium ${timeFormat === '12h' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleTimeFormatChange('12h')}>
                    <BracketText active={timeFormat === '12h'}>
                      12-hour (AM/PM)
                    </BracketText>
                  </button>
                  <button className={`flex-1 py-2 px-4 rounded-full text-sm font-medium ${timeFormat === '24h' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleTimeFormatChange('24h')}>
                    <BracketText active={timeFormat === '24h'}>
                      24-hour
                    </BracketText>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Default View */}
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4 flex-shrink-0">
                <LayoutIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Default Task View</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Choose which tasks to show by default
                </p>
                <div className="flex space-x-3">
                  <button className={`flex-1 py-2 px-4 rounded-full text-sm font-medium ${defaultView === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleDefaultViewChange('all')}>
                    <BracketText active={defaultView === 'all'}>
                      All
                    </BracketText>
                  </button>
                  <button className={`flex-1 py-2 px-4 rounded-full text-sm font-medium ${defaultView === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleDefaultViewChange('pending')}>
                    <BracketText active={defaultView === 'pending'}>
                      Pending
                    </BracketText>
                  </button>
                  <button className={`flex-1 py-2 px-4 rounded-full text-sm font-medium ${defaultView === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleDefaultViewChange('completed')}>
                    <BracketText active={defaultView === 'completed'}>
                      Completed
                    </BracketText>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Compact Mode */}
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-4 flex-shrink-0">
                <EyeIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Compact Mode</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Show more content with less spacing
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={compactMode} onChange={handleCompactModeToggle} aria-label="Toggle compact mode" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {compactMode ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
// CheckIcon component
const CheckIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>;