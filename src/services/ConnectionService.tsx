import React from 'react';
import { analytics, AnalyticsEvents } from './AnalyticsService';
// Connection status monitoring service
class ConnectionService {
  private online: boolean = navigator.onLine;
  private listeners: Array<(online: boolean) => void> = [];
  constructor() {
    // Initialize and set up event listeners
    this.initialize();
  }
  private initialize() {
    // Set initial state
    this.online = navigator.onLine;
    // Add event listeners for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }
  private handleOnline = () => {
    this.online = true;
    // Track reconnection in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'connection_restored'
    });
    // Notify all listeners
    this.notifyListeners();
    // Attempt to sync any pending offline data
    this.syncOfflineData();
  };
  private handleOffline = () => {
    this.online = false;
    // Track connection loss in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'connection_lost'
    });
    // Notify all listeners
    this.notifyListeners();
  };
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.online));
  }
  private syncOfflineData() {
    // In a real app, this would sync any data that was created or modified while offline
    console.log('Syncing offline data...');
  }
  // Check if the device is currently online
  isOnline(): boolean {
    return this.online;
  }
  // Subscribe to connection status changes
  subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  // Clean up event listeners (should be called when app is unmounted)
  cleanup() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}
// Export a singleton instance
export const connection = new ConnectionService();