import React from 'react';
import { ArrowLeftIcon, EyeIcon, TypeIcon, ZapIcon } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const AccessibilitySettingsScreen = ({
  onBack
}) => {
  const {
    highContrast,
    largeText,
    reduceMotion,
    toggleHighContrast,
    toggleLargeText,
    toggleReduceMotion
  } = useAccessibility();
  const handleToggleHighContrast = () => {
    toggleHighContrast();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'accessibility_high_contrast',
      enabled: !highContrast
    });
  };
  const handleToggleLargeText = () => {
    toggleLargeText();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'accessibility_large_text',
      enabled: !largeText
    });
  };
  const handleToggleReduceMotion = () => {
    toggleReduceMotion();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'accessibility_reduce_motion',
      enabled: !reduceMotion
    });
  };
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Accessibility Settings</h1>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <p className="text-gray-600 mb-6">
          Customize your experience to make the app more accessible for your
          needs.
        </p>
        <div className="space-y-6">
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4 flex-shrink-0">
                <EyeIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">High Contrast Mode</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Increase contrast to make text and elements more visible
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={highContrast} onChange={handleToggleHighContrast} aria-label="Toggle high contrast mode" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {highContrast ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                <TypeIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Large Text</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Increase text size for better readability
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={largeText} onChange={handleToggleLargeText} aria-label="Toggle large text" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {largeText ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                <ZapIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Reduce Motion</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Minimize animations throughout the app
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={reduceMotion} onChange={handleToggleReduceMotion} aria-label="Toggle reduce motion" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {reduceMotion ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};