import React from 'react';
import { analytics, AnalyticsEvents } from './AnalyticsService';
class OfflineService {
  private isOnline: boolean = navigator.onLine;
  private listeners: Array<(online: boolean) => void> = [];
  constructor() {
    this.setupEventListeners();
  }
  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncOfflineData();
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'connection_restored'
      });
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'offline_mode_entered'
      });
    });
  }
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }
  private syncOfflineData() {
    // In a real app, this would sync any data stored locally while offline
    const offlineActions = this.getOfflineActions();
    if (offlineActions.length > 0) {
      console.log('Syncing offline data:', offlineActions);
      // Process each action
      offlineActions.forEach(action => {
        // In a real app, this would send the action to the server
        console.log('Processing offline action:', action);
      });
      // Clear processed actions
      this.clearOfflineActions();
    }
  }
  // Get connection status
  isNetworkOnline(): boolean {
    return this.isOnline;
  }
  // Subscribe to connection status changes
  subscribeToConnectionChanges(callback: (online: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
  // Store an action to be processed when back online
  storeOfflineAction(action: any) {
    const offlineActions = this.getOfflineActions();
    offlineActions.push({
      ...action,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('offline_actions', JSON.stringify(offlineActions));
  }
  // Get all stored offline actions
  getOfflineActions(): any[] {
    const storedActions = localStorage.getItem('offline_actions');
    return storedActions ? JSON.parse(storedActions) : [];
  }
  // Clear all stored offline actions
  clearOfflineActions() {
    localStorage.setItem('offline_actions', JSON.stringify([]));
  }
  // Cache data for offline use
  cacheDataForOffline(key: string, data: any) {
    localStorage.setItem(`offline_cache_${key}`, JSON.stringify(data));
  }
  // Get cached data
  getCachedData(key: string): any | null {
    const cachedData = localStorage.getItem(`offline_cache_${key}`);
    return cachedData ? JSON.parse(cachedData) : null;
  }
}
// Export a singleton instance
export const offlineService = new OfflineService();