import React from 'react';
import { storage } from './StorageService';
import { dataService, TaskRequest } from './DataService';
import { findTaskById, findCategoryById } from './CareTaskTaxonomy';
class RecommendationService {
  // Get task requests that match user preferences
  getRecommendedTasks(userId: string): TaskRequest[] {
    const allRequests = dataService.getTaskRequests();
    const openRequests = allRequests.filter(req => req.status === 'open');
    // Get user preferences
    const preferredCategories = storage.get(`support_categories_${userId}`, []);
    const preferredDays = storage.get(`support_days_${userId}`, {});
    const preferredTimeStart = storage.get(`support_time_start_${userId}`, '09:00');
    const preferredTimeEnd = storage.get(`support_time_end_${userId}`, '17:00');
    // If no preferences are set, return all open requests
    if (preferredCategories.length === 0 && Object.values(preferredDays).every(val => val === false)) {
      return openRequests.slice(0, 3); // Return top 3 requests
    }
    // Filter by preferences
    let recommended = [...openRequests];
    // Filter by category if preferences exist
    if (preferredCategories.length > 0) {
      recommended = recommended.filter(req => {
        const task = findTaskById(req.category);
        if (!task) return false;
        const category = findCategoryById(task.category);
        if (!category) return false;
        return preferredCategories.includes(category.id);
      });
    }
    // Filter by day if preferences exist
    if (Object.values(preferredDays).some(Boolean)) {
      recommended = recommended.filter(req => {
        const date = new Date(req.dueDate);
        const dayOfWeek = date.toLocaleDateString('en-US', {
          weekday: 'long'
        }).toLowerCase();
        return preferredDays[dayOfWeek];
      });
    }
    // Filter by time if time preferences exist
    if (preferredTimeStart && preferredTimeEnd) {
      recommended = recommended.filter(req => {
        if (!req.dueTime) return true; // Include if no specific time
        // Convert times to minutes for comparison
        const requestTime = this.timeToMinutes(req.dueTime);
        const startTime = this.timeToMinutes(preferredTimeStart);
        const endTime = this.timeToMinutes(preferredTimeEnd);
        return requestTime >= startTime && requestTime <= endTime;
      });
    }
    // Sort by priority and recency
    recommended.sort((a, b) => {
      // First by priority
      const priorityOrder = {
        high: 0,
        medium: 1,
        low: 2
      };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      // Then by recency (newer first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return recommended.slice(0, 3); // Return top 3 recommendations
  }
  // Helper to convert time string (HH:MM) to minutes since midnight
  private timeToMinutes(timeStr: string): number {
    // Handle formats like "14:00" or "2:00 PM"
    let hours = 0;
    let minutes = 0;
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      hours = parseInt(parts[0]);
      // Handle minutes part which might include AM/PM
      const minutePart = parts[1];
      if (minutePart.includes('PM') && hours < 12) {
        hours += 12;
      } else if (minutePart.includes('AM') && hours === 12) {
        hours = 0;
      }
      minutes = parseInt(minutePart);
    }
    return hours * 60 + minutes;
  }
  // Get badge level based on contribution count
  getBadgeLevel(tasksCompleted: number): {
    level: string;
    color: string;
    description: string;
  } {
    if (tasksCompleted >= 20) {
      return {
        level: 'Gold',
        color: 'yellow',
        description: 'Gold supporter - completed 20+ tasks'
      };
    } else if (tasksCompleted >= 10) {
      return {
        level: 'Silver',
        color: 'gray',
        description: 'Silver supporter - completed 10+ tasks'
      };
    } else if (tasksCompleted >= 5) {
      return {
        level: 'Bronze',
        color: 'amber',
        description: 'Bronze supporter - completed 5+ tasks'
      };
    } else {
      return {
        level: 'New',
        color: 'blue',
        description: 'New supporter'
      };
    }
  }
}
export const recommendationService = new RecommendationService();