import React from 'react';
// Analytics service for tracking user interactions and app usage
export const AnalyticsEvents = {
  // Navigation events
  SCREEN_VIEW: 'screen_view',
  // Task events
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
  TASK_UPDATED: 'task_updated',
  CONFLICT_RESOLVED: 'conflict_resolved',
  // Voice input events
  VOICE_RECORDING_STARTED: 'voice_recording_started',
  VOICE_RECORDING_COMPLETED: 'voice_recording_completed',
  VOICE_RECOMMENDATION_SUBMITTED: 'voice_recommendation_submitted',
  // User events
  USER_ONBOARDED: 'user_onboarded',
  USER_ROLE_SELECTED: 'user_role_selected',
  // Feature usage
  FEATURE_USED: 'feature_used'
};
// In a real app, this would connect to an actual analytics service
// like Google Analytics, Mixpanel, etc.
class AnalyticsService {
  private enabled: boolean = true;
  private userId: string | null = null;
  private userProperties: Record<string, any> = {};
  initialize(userId?: string) {
    // In a real app, this would initialize the analytics SDK
    console.log('Analytics service initialized');
    if (userId) {
      this.setUserId(userId);
    }
    // Check if user has opted out of analytics
    const analyticsOptOut = localStorage.getItem('analytics_opt_out');
    this.enabled = analyticsOptOut !== 'true';
  }
  setUserId(userId: string) {
    this.userId = userId;
    console.log(`Analytics user ID set: ${userId}`);
  }
  setUserProperty(property: string, value: any) {
    this.userProperties[property] = value;
    console.log(`Analytics user property set: ${property} = ${value}`);
  }
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.enabled) return;
    // In a real app, this would call the analytics SDK's track method
    console.log(`Analytics event tracked: ${eventName}`, {
      userId: this.userId,
      properties,
      timestamp: new Date().toISOString()
    });
  }
  trackScreenView(screenName: string) {
    this.trackEvent(AnalyticsEvents.SCREEN_VIEW, {
      screen_name: screenName
    });
  }
  trackFeatureUsage(featureName: string, metadata?: Record<string, any>) {
    this.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: featureName,
      ...metadata
    });
  }
  // Allow users to opt out of analytics
  optOut() {
    this.enabled = false;
    localStorage.setItem('analytics_opt_out', 'true');
    console.log('User opted out of analytics');
  }
  // Allow users to opt back in to analytics
  optIn() {
    this.enabled = true;
    localStorage.setItem('analytics_opt_out', 'false');
    console.log('User opted in to analytics');
  }
}
// Export a singleton instance
export const analytics = new AnalyticsService();