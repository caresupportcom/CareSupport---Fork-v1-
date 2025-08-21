import React from 'react';
import { ArrowLeftIcon, BellIcon, BellOffIcon, ClockIcon, AlertTriangleIcon, UsersIcon } from 'lucide-react';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const NotificationPreferencesScreen = ({
  onBack
}) => {
  const {
    preferences,
    updatePreferences
  } = useUserPreferences();
  const {
    enabled,
    taskReminders,
    teamUpdates,
    conflictAlerts,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd
  } = preferences.notifications;
  const handleToggleNotifications = () => {
    updatePreferences('notifications', {
      enabled: !enabled
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'notifications_toggled',
      enabled: !enabled
    });
  };
  const handleToggleTaskReminders = () => {
    updatePreferences('notifications', {
      taskReminders: !taskReminders
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'task_reminders_toggled',
      enabled: !taskReminders
    });
  };
  const handleToggleTeamUpdates = () => {
    updatePreferences('notifications', {
      teamUpdates: !teamUpdates
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'team_updates_toggled',
      enabled: !teamUpdates
    });
  };
  const handleToggleConflictAlerts = () => {
    updatePreferences('notifications', {
      conflictAlerts: !conflictAlerts
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'conflict_alerts_toggled',
      enabled: !conflictAlerts
    });
  };
  const handleToggleQuietHours = () => {
    updatePreferences('notifications', {
      quietHoursEnabled: !quietHoursEnabled
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'quiet_hours_toggled',
      enabled: !quietHoursEnabled
    });
  };
  const handleQuietHoursStartChange = e => {
    updatePreferences('notifications', {
      quietHoursStart: e.target.value
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'quiet_hours_start_changed',
      time: e.target.value
    });
  };
  const handleQuietHoursEndChange = e => {
    updatePreferences('notifications', {
      quietHoursEnd: e.target.value
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'quiet_hours_end_changed',
      time: e.target.value
    });
  };
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Notification Preferences</h1>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <p className="text-gray-600 mb-6">
          Customize how and when you receive notifications.
        </p>
        <div className="space-y-6">
          {/* Master Notification Toggle */}
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                <BellIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Enable or disable all notifications
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={enabled} onChange={handleToggleNotifications} aria-label="Toggle all notifications" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>
          </div>
          {enabled && <>
              {/* Notification Types */}
              <div className="p-4 border border-gray-200 rounded-xl">
                <h3 className="font-medium mb-4">Notification Types</h3>
                <div className="space-y-4">
                  {/* Task Reminders */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <ClockIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Task Reminders</h4>
                        <p className="text-xs text-gray-500">
                          Notifications for upcoming tasks
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={taskReminders} onChange={handleToggleTaskReminders} aria-label="Toggle task reminders" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {/* Team Updates */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <UsersIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Team Updates</h4>
                        <p className="text-xs text-gray-500">
                          Updates from care team members
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={teamUpdates} onChange={handleToggleTeamUpdates} aria-label="Toggle team updates" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {/* Conflict Alerts */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                        <AlertTriangleIcon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Conflict Alerts</h4>
                        <p className="text-xs text-gray-500">
                          Alerts for schedule conflicts
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={conflictAlerts} onChange={handleToggleConflictAlerts} aria-label="Toggle conflict alerts" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              {/* Quiet Hours */}
              <div className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <BellOffIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Quiet Hours</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Silence notifications during specific hours
                    </p>
                    <label className="relative inline-flex items-center cursor-pointer mb-4">
                      <input type="checkbox" className="sr-only peer" checked={quietHoursEnabled} onChange={handleToggleQuietHours} aria-label="Toggle quiet hours" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {quietHoursEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                    {quietHoursEnabled && <div className="flex space-x-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={quietHoursStart} onChange={handleQuietHoursStartChange} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                          </label>
                          <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={quietHoursEnd} onChange={handleQuietHoursEndChange} />
                        </div>
                      </div>}
                  </div>
                </div>
              </div>
            </>}
        </div>
      </div>
    </div>;
};