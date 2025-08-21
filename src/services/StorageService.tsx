import React from 'react';
// Local storage service for data persistence
class StorageService {
  // Save data to local storage with a specific key
  save<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
    }
  }
  // Get data from local storage by key
  get<T>(key: string, defaultValue: T = null as unknown as T): T {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return defaultValue;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return defaultValue;
    }
  }
  // Remove data from local storage by key
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
    }
  }
  // Clear all app data from local storage
  clearAll(): void {
    try {
      // Only clear keys that start with our app prefix to avoid affecting other apps
      const appPrefix = 'care_app_';
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(appPrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
  // Check if a key exists in local storage
  exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
// Export a singleton instance
export const storage = new StorageService();