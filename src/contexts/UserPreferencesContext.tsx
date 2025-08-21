import React, { useEffect, useState, createContext, useContext } from 'react';
import { storage } from '../services/StorageService';
import { analytics, AnalyticsEvents } from '../services/AnalyticsService';
// Define types for our preferences
export interface UserPreferences {
  display: {
    theme: 'light' | 'dark' | 'system';
    timeFormat: '12h' | '24h';
    defaultView: 'all' | 'pending' | 'completed';
    compactMode: boolean;
  };
  notifications: {
    enabled: boolean;
    taskReminders: boolean;
    teamUpdates: boolean;
    conflictAlerts: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  tasks: {
    defaultPriority: 'low' | 'medium' | 'high';
    defaultAssignee: string | null;
    sortOrder: 'time' | 'priority' | 'assignee';
    autoArchiveCompleted: boolean;
    showCompletedTasks: boolean;
  };
}
// Default preferences
const defaultPreferences: UserPreferences = {
  display: {
    theme: 'light',
    timeFormat: '12h',
    defaultView: 'all',
    compactMode: false
  },
  notifications: {
    enabled: true,
    taskReminders: true,
    teamUpdates: true,
    conflictAlerts: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  },
  tasks: {
    defaultPriority: 'medium',
    defaultAssignee: null,
    sortOrder: 'time',
    autoArchiveCompleted: false,
    showCompletedTasks: true
  }
};
// Create the context
interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (category: keyof UserPreferences, updates: Partial<UserPreferences[keyof UserPreferences]>) => void;
  resetPreferences: (category?: keyof UserPreferences) => void;
}
const UserPreferencesContext = createContext<UserPreferencesContextType>({
  preferences: defaultPreferences,
  updatePreferences: () => {},
  resetPreferences: () => {}
});
export const useUserPreferences = () => useContext(UserPreferencesContext);
export const UserPreferencesProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  // Load saved preferences on mount
  useEffect(() => {
    const savedPreferences = storage.get<UserPreferences>('user_preferences', null);
    if (savedPreferences) {
      setPreferences(savedPreferences);
    }
  }, []);
  // Save preferences when they change
  useEffect(() => {
    storage.save('user_preferences', preferences);
  }, [preferences]);
  // Update a specific category of preferences
  const updatePreferences = (category: keyof UserPreferences, updates: Partial<UserPreferences[keyof UserPreferences]>) => {
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        [category]: {
          ...prev[category],
          ...updates
        }
      };
      // Track preference changes in analytics
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'preferences_updated',
        preference_category: category,
        updated_fields: Object.keys(updates)
      });
      return newPreferences;
    });
  };
  // Reset preferences for a specific category or all
  const resetPreferences = (category?: keyof UserPreferences) => {
    if (category) {
      setPreferences(prev => ({
        ...prev,
        [category]: defaultPreferences[category]
      }));
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'preferences_reset',
        preference_category: category
      });
    } else {
      setPreferences(defaultPreferences);
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'preferences_reset_all'
      });
    }
  };
  return <UserPreferencesContext.Provider value={{
    preferences,
    updatePreferences,
    resetPreferences
  }}>
      {children}
    </UserPreferencesContext.Provider>;
};