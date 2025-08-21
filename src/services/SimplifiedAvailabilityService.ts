import { storage } from './StorageService';
import { notificationService } from './NotificationService';
import { analytics, AnalyticsEvents } from './AnalyticsService';
import { 
  UserAvailability, 
  AvailabilityStatus, 
  WeeklyAvailabilityPattern, 
  SimpleTimeSlot 
} from '../types/ScheduleTypes';

/**
 * Simplified Availability Service for MVP
 * Focuses on core availability input and status management
 */
class SimplifiedAvailabilityService {
  private storageKeys = {
    userAvailability: 'user_availability_v2',
    teamAvailability: 'team_availability_v2'
  };

  // Initialize with default availability data
  public initializeData() {
    const existingAvailability = storage.get(this.storageKeys.userAvailability, null);
    
    if (!existingAvailability) {
      // Create default availability for current user
      const userId = storage.get('user_id', 'user-default');
      const defaultAvailability: UserAvailability = {
        userId,
        status: 'available',
        dateOverrides: {},
        recurringPattern: this.generateDefaultWeeklyPattern(),
        lastUpdated: new Date().toISOString()
      };
      
      storage.save(this.storageKeys.userAvailability, defaultAvailability);
    }
  }

  // Generate default weekly pattern (weekdays 9-5)
  private generateDefaultWeeklyPattern(): WeeklyAvailabilityPattern {
    const pattern: WeeklyAvailabilityPattern = {};
    
    // Initialize all days as empty
    for (let day = 0; day < 7; day++) {
      pattern[day] = [];
    }
    
    // Add default weekday availability (Monday-Friday, 9-5)
    for (let day = 1; day <= 5; day++) {
      pattern[day] = [{
        id: `default-${day}`,
        startTime: '09:00',
        endTime: '17:00',
        status: 'available'
      }];
    }
    
    return pattern;
  }

  // Get user's current availability
  public getUserAvailability(userId: string): UserAvailability {
    const availability = storage.get(this.storageKeys.userAvailability, null);
    
    if (!availability || availability.userId !== userId) {
      // Create new availability for this user
      const newAvailability: UserAvailability = {
        userId,
        status: 'available',
        dateOverrides: {},
        recurringPattern: this.generateDefaultWeeklyPattern(),
        lastUpdated: new Date().toISOString()
      };
      
      storage.save(this.storageKeys.userAvailability, newAvailability);
      return newAvailability;
    }
    
    return availability;
  }

  // Update user's overall availability status
  public updateAvailabilityStatus(userId: string, status: AvailabilityStatus): void {
    const availability = this.getUserAvailability(userId);
    
    const updatedAvailability: UserAvailability = {
      ...availability,
      status,
      lastUpdated: new Date().toISOString()
    };
    
    storage.save(this.storageKeys.userAvailability, updatedAvailability);
    
    // Notify coordinators of status change
    this.notifyStatusChange(userId, status);
    
    // Track in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_status_updated',
      user_id: userId,
      new_status: status
    });
  }

  // Set availability for specific date
  public setDateAvailability(userId: string, date: string, status: AvailabilityStatus): void {
    const availability = this.getUserAvailability(userId);
    
    const updatedAvailability: UserAvailability = {
      ...availability,
      dateOverrides: {
        ...availability.dateOverrides,
        [date]: status
      },
      lastUpdated: new Date().toISOString()
    };
    
    storage.save(this.storageKeys.userAvailability, updatedAvailability);
    
    // Track in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'date_availability_set',
      user_id: userId,
      date,
      status
    });
  }

  // Get availability for specific date
  public getDateAvailability(userId: string, date: string): AvailabilityStatus {
    const availability = this.getUserAvailability(userId);
    
    // Check for date-specific override first
    if (availability.dateOverrides[date]) {
      return availability.dateOverrides[date];
    }
    
    // Fall back to recurring pattern
    const dayOfWeek = new Date(date).getDay();
    const dayPattern = availability.recurringPattern[dayOfWeek];
    
    if (dayPattern && dayPattern.length > 0) {
      // If there are time slots for this day, use the first one's status
      return dayPattern[0].status;
    }
    
    // Fall back to overall status
    return availability.status;
  }

  // Update recurring weekly pattern
  public updateWeeklyPattern(userId: string, pattern: WeeklyAvailabilityPattern): void {
    const availability = this.getUserAvailability(userId);
    
    const updatedAvailability: UserAvailability = {
      ...availability,
      recurringPattern: pattern,
      lastUpdated: new Date().toISOString()
    };
    
    storage.save(this.storageKeys.userAvailability, updatedAvailability);
    
    // Track in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'weekly_pattern_updated',
      user_id: userId,
      days_with_availability: Object.values(pattern).filter(slots => slots.length > 0).length
    });
  }

  // Get all team members' availability for a date range
  public getTeamAvailability(startDate: string, endDate: string): Record<string, Record<string, AvailabilityStatus>> {
    // In MVP, we'll simulate team availability
    // In production, this would fetch from all team members
    const teamMembers = ['james', 'maria', 'linda', 'robert'];
    const teamAvailability: Record<string, Record<string, AvailabilityStatus>> = {};
    
    teamMembers.forEach(memberId => {
      teamAvailability[memberId] = {};
      
      // Generate date range
      const currentDate = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      while (currentDate <= endDateObj) {
        const dateStr = currentDate.toISOString().split('T')[0];
        teamAvailability[memberId][dateStr] = this.getDateAvailability(memberId, dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return teamAvailability;
  }

  // Get available caregivers for a specific time slot
  public getAvailableCaregivers(date: string, startTime: string, endTime: string): string[] {
    const teamMembers = ['james', 'maria', 'linda', 'robert'];
    const available: string[] = [];
    
    teamMembers.forEach(memberId => {
      const status = this.getDateAvailability(memberId, date);
      if (status === 'available' || status === 'tentative') {
        // In MVP, we assume if they're available for the day, they're available for any time
        // Future versions would check specific time slots
        available.push(memberId);
      }
    });
    
    return available;
  }

  // Request availability from specific caregivers
  public requestAvailability(caregiverIds: string[], date: string, startTime: string, endTime: string, message?: string): void {
    caregiverIds.forEach(caregiverId => {
      // Send notification to caregiver
      notificationService.addNotification({
        type: 'schedule',
        title: 'Availability Request',
        message: `Can you cover ${date} from ${this.formatTime(startTime)} to ${this.formatTime(endTime)}?${message ? ` Note: ${message}` : ''}`,
        priority: 'medium',
        relatedTo: 'availability_request',
        relatedId: `${date}-${startTime}-${endTime}`
      });
    });
    
    // Track in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_requested',
      caregiver_count: caregiverIds.length,
      date,
      time_slot: `${startTime}-${endTime}`
    });
  }

  // Notify coordinators of status changes
  private notifyStatusChange(userId: string, status: AvailabilityStatus): void {
    // Get user name for notification
    const userName = storage.get('user_name', 'Team member');
    
    // Create status-specific message
    let message = '';
    switch (status) {
      case 'available':
        message = `${userName} is now available for shifts`;
        break;
      case 'tentative':
        message = `${userName} is tentatively available (may need confirmation)`;
        break;
      case 'unavailable':
        message = `${userName} is currently unavailable for shifts`;
        break;
    }
    
    // Send notification to coordinators
    notificationService.addNotification({
      type: 'team',
      title: 'Availability Update',
      message,
      priority: status === 'unavailable' ? 'high' : 'medium',
      relatedTo: 'availability_change',
      relatedId: userId
    });
  }

  // Helper to format time for display
  private formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  }

  // Clear date override (revert to recurring pattern)
  public clearDateOverride(userId: string, date: string): void {
    const availability = this.getUserAvailability(userId);
    
    const updatedOverrides = { ...availability.dateOverrides };
    delete updatedOverrides[date];
    
    const updatedAvailability: UserAvailability = {
      ...availability,
      dateOverrides: updatedOverrides,
      lastUpdated: new Date().toISOString()
    };
    
    storage.save(this.storageKeys.userAvailability, updatedAvailability);
  }

  // Bulk update availability for multiple dates
  public bulkUpdateDates(userId: string, dates: string[], status: AvailabilityStatus): void {
    const availability = this.getUserAvailability(userId);
    
    const updatedOverrides = { ...availability.dateOverrides };
    dates.forEach(date => {
      updatedOverrides[date] = status;
    });
    
    const updatedAvailability: UserAvailability = {
      ...availability,
      dateOverrides: updatedOverrides,
      lastUpdated: new Date().toISOString()
    };
    
    storage.save(this.storageKeys.userAvailability, updatedAvailability);
    
    // Track bulk update
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'bulk_availability_update',
      user_id: userId,
      dates_count: dates.length,
      status
    });
  }
}

// Export singleton instance
export const simplifiedAvailabilityService = new SimplifiedAvailabilityService();