import React from 'react';
import { storage } from './StorageService';
import { shiftService } from './ShiftService';
import { dataService } from './DataService';
import { analytics, AnalyticsEvents } from './AnalyticsService';
import { notificationService } from './NotificationService';
import { CoverageGap, CareShift, ResolutionOption } from '../types/ScheduleTypes';
class CoverageService {
  private storageKeys = {
    coverageGaps: 'coverage_gaps',
    coveragePreferences: 'coverage_preferences'
  };
  // Initialize with sample data for demo purposes
  public initializeData() {
    const existingGaps = storage.get(this.storageKeys.coverageGaps, null);
    const existingPreferences = storage.get(this.storageKeys.coveragePreferences, null);
    if (!existingGaps) {
      storage.save(this.storageKeys.coverageGaps, this.generateSampleGaps());
    }
    if (!existingPreferences) {
      storage.save(this.storageKeys.coveragePreferences, this.generateSamplePreferences());
    }
  }
  // Generate sample coverage gaps for the demo
  private generateSampleGaps(): CoverageGap[] {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    // Generate tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return [{
      id: 'gap1',
      date: tomorrowStr,
      startTime: '16:00',
      endTime: '22:00',
      status: 'identified',
      priority: 'high',
      resolutionOptions: [{
        id: 'option1',
        type: 'reassign',
        description: 'Reassign to Robert who is available during this time',
        suggestedAssignee: 'robert'
      }, {
        id: 'option2',
        type: 'split',
        description: 'Split into two shifts: 16:00-19:00 and 19:00-22:00'
      }],
      identifiedAt: new Date().toISOString()
    }];
  }
  // Generate sample coverage preferences
  private generateSamplePreferences() {
    return {
      minimumCoverage: {
        weekday: {
          morning: 1,
          afternoon: 1,
          evening: 1,
          overnight: 0
        },
        weekend: {
          morning: 1,
          afternoon: 1,
          evening: 1,
          overnight: 0
        }
      },
      preferredCaregivers: {
        james: ['morning', 'afternoon'],
        linda: ['afternoon', 'evening'],
        robert: ['morning']
      },
      criticalTimeSlots: [{
        days: [1, 2, 3, 4, 5],
        startTime: '08:00',
        endTime: '10:00',
        reason: 'Morning medication and breakfast'
      }, {
        days: [1, 2, 3, 4, 5, 6, 7],
        startTime: '20:00',
        endTime: '22:00',
        reason: 'Evening medication and bedtime routine'
      }],
      autoNotify: true,
      notificationLeadTime: 48 // Hours before gap to notify
    };
  }
  // Get all coverage gaps
  public getCoverageGaps(): CoverageGap[] {
    return storage.get(this.storageKeys.coverageGaps, []);
  }
  // Get coverage gaps for a specific date
  public getCoverageGapsForDate(dateStr: string): CoverageGap[] {
    const gaps = this.getCoverageGaps();
    return gaps.filter(gap => gap.date === dateStr);
  }
  // Get coverage gap by ID
  public getCoverageGapById(id: string): CoverageGap | undefined {
    const gaps = this.getCoverageGaps();
    return gaps.find(gap => gap.id === id);
  }
  // Add a new coverage gap
  public addCoverageGap(gapData: Omit<CoverageGap, 'id' | 'identifiedAt'>): CoverageGap {
    const gaps = this.getCoverageGaps();
    const newGap: CoverageGap = {
      ...gapData,
      id: `gap_${Date.now()}`,
      identifiedAt: new Date().toISOString()
    };
    gaps.push(newGap);
    storage.save(this.storageKeys.coverageGaps, gaps);
    // Notify coordinators about the new gap
    this.notifyCoverageGap(newGap);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_gap_identified',
      priority: newGap.priority,
      date: newGap.date
    });
    return newGap;
  }
  // Update an existing coverage gap
  public updateCoverageGap(updatedGap: CoverageGap): void {
    const gaps = this.getCoverageGaps();
    const updatedGaps = gaps.map(gap => gap.id === updatedGap.id ? updatedGap : gap);
    storage.save(this.storageKeys.coverageGaps, updatedGaps);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_gap_updated',
      status: updatedGap.status
    });
  }
  // Delete a coverage gap
  public deleteCoverageGap(gapId: string): void {
    const gaps = this.getCoverageGaps();
    const filteredGaps = gaps.filter(gap => gap.id !== gapId);
    storage.save(this.storageKeys.coverageGaps, filteredGaps);
  }
  // Resolve a coverage gap
  public resolveCoverageGap(gapId: string, resolution: ResolutionOption): void {
    const gaps = this.getCoverageGaps();
    const gap = gaps.find(g => g.id === gapId);
    if (!gap) return;
    // Update gap status
    const updatedGaps = gaps.map(g => g.id === gapId ? {
      ...g,
      status: 'addressed'
    } : g);
    storage.save(this.storageKeys.coverageGaps, updatedGaps);
    // Apply the resolution
    this.applyResolution(gap, resolution);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_gap_resolved',
      resolution_type: resolution.type
    });
  }
  // Apply a resolution to a coverage gap
  private applyResolution(gap: CoverageGap, resolution: ResolutionOption): void {
    switch (resolution.type) {
      case 'reassign':
        if (resolution.suggestedAssignee) {
          // Create a new shift with the suggested assignee
          const shiftData: Omit<CareShift, 'id' | 'createdAt'> = {
            date: gap.date,
            startTime: gap.startTime,
            endTime: gap.endTime,
            assignedTo: resolution.suggestedAssignee,
            status: 'scheduled',
            coverageType: 'primary',
            createdBy: storage.get('user_id', 'unknown')
          };
          shiftService.addShift(shiftData);
        }
        break;
      case 'reschedule':
        if (resolution.suggestedTime) {
          // Create a new shift at the suggested time
          const shiftData: Omit<CareShift, 'id' | 'createdAt'> = {
            date: resolution.suggestedTime.date,
            startTime: resolution.suggestedTime.startTime,
            endTime: resolution.suggestedTime.endTime,
            assignedTo: null,
            status: 'open',
            coverageType: 'primary',
            createdBy: storage.get('user_id', 'unknown')
          };
          shiftService.addShift(shiftData);
        }
        break;
      case 'split':
        // Implementation would depend on specific split details
        // For simplicity, we're not implementing the actual split logic here
        break;
      case 'cancel':
        // No action needed as the gap is just marked as addressed
        break;
    }
  }
  // Detect coverage gaps for a date range
  public detectCoverageGaps(startDate: string, endDate: string): CoverageGap[] {
    const newGaps: CoverageGap[] = [];
    const preferences = this.getCoveragePreferences();
    // Iterate through each date in the range
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const shifts = shiftService.getShiftsForDate(dateStr);
      // Check for gaps in coverage based on preferences
      const gaps = this.identifyGapsForDate(dateStr, shifts, preferences);
      newGaps.push(...gaps);
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    // Save the newly identified gaps
    if (newGaps.length > 0) {
      const existingGaps = this.getCoverageGaps();
      storage.save(this.storageKeys.coverageGaps, [...existingGaps, ...newGaps]);
    }
    return newGaps;
  }
  // Identify gaps for a specific date
  private identifyGapsForDate(dateStr: string, shifts: CareShift[], preferences: any): CoverageGap[] {
    const gaps: CoverageGap[] = [];
    const date = new Date(dateStr);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday
    // Define time blocks to check for coverage
    const timeBlocks = [{
      name: 'morning',
      start: '06:00',
      end: '12:00'
    }, {
      name: 'afternoon',
      start: '12:00',
      end: '18:00'
    }, {
      name: 'evening',
      start: '18:00',
      end: '22:00'
    }, {
      name: 'overnight',
      start: '22:00',
      end: '06:00'
    }];
    // Check each time block for adequate coverage
    timeBlocks.forEach(block => {
      const requiredCoverage = isWeekend ? preferences.minimumCoverage.weekend[block.name] : preferences.minimumCoverage.weekday[block.name];
      // Count shifts covering this block
      const coveringShifts = shifts.filter(shift => this.shiftsOverlap(shift.startTime, shift.endTime, block.start, block.end) && shift.assignedTo !== null // Only count assigned shifts
      );
      // If coverage is inadequate, create a gap
      if (coveringShifts.length < requiredCoverage) {
        // Check if this is a critical time slot
        const isCritical = preferences.criticalTimeSlots.some(slot => slot.days.includes(date.getDay() + 1) &&
        // +1 because getDay() returns 0-6, but our days are 1-7
        this.shiftsOverlap(slot.startTime, slot.endTime, block.start, block.end));
        // Create a new gap
        const gap: CoverageGap = {
          id: `gap_${Date.now()}_${block.name}`,
          date: dateStr,
          startTime: block.start,
          endTime: block.end,
          status: 'identified',
          priority: isCritical ? 'high' : 'medium',
          identifiedAt: new Date().toISOString(),
          resolutionOptions: this.generateResolutionOptions(dateStr, block.start, block.end)
        };
        gaps.push(gap);
      }
    });
    return gaps;
  }
  // Check if two time ranges overlap
  private shiftsOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    // Convert to minutes since midnight for easier comparison
    const toMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    const start1Min = toMinutes(start1);
    const end1Min = toMinutes(end1);
    const start2Min = toMinutes(start2);
    const end2Min = toMinutes(end2);
    // Handle overnight shifts (end time is less than start time)
    const overnight1 = end1Min < start1Min;
    const overnight2 = end2Min < start2Min;
    if (overnight1 && overnight2) {
      // Both are overnight shifts - they must overlap
      return true;
    } else if (overnight1) {
      // First shift is overnight
      return start2Min < end1Min || start1Min < end2Min;
    } else if (overnight2) {
      // Second shift is overnight
      return start1Min < end2Min || start2Min < end1Min;
    } else {
      // Neither shift is overnight - standard overlap check
      return start1Min < end2Min && start2Min < end1Min;
    }
  }
  // Generate resolution options for a gap
  private generateResolutionOptions(date: string, startTime: string, endTime: string): ResolutionOption[] {
    const options: ResolutionOption[] = [];
    // Find available caregivers for reassignment
    const availableCaregivers = this.findAvailableCaregivers(date, startTime, endTime);
    // Add reassign options
    availableCaregivers.forEach(caregiver => {
      options.push({
        id: `option_reassign_${caregiver.id}_${Date.now()}`,
        type: 'reassign',
        description: `Reassign to ${caregiver.name} who is available during this time`,
        suggestedAssignee: caregiver.id
      });
    });
    // Add split option if the duration is long enough
    const duration = this.calculateDurationInMinutes(startTime, endTime);
    if (duration >= 240) {
      // 4 hours or more
      const midpoint = this.calculateMidpoint(startTime, endTime);
      options.push({
        id: `option_split_${Date.now()}`,
        type: 'split',
        description: `Split into two shifts: ${startTime}-${midpoint} and ${midpoint}-${endTime}`
      });
    }
    // Add reschedule option
    options.push({
      id: `option_reschedule_${Date.now()}`,
      type: 'reschedule',
      description: 'Reschedule to a different time'
    });
    return options;
  }
  // Find available caregivers for a time slot
  private findAvailableCaregivers(date: string, startTime: string, endTime: string): {
    id: string;
    name: string;
  }[] {
    // Get all team members
    const allMembers = dataService.getTeamMembers();
    // Get shifts for the date
    const shifts = shiftService.getShiftsForDate(date);
    // Filter out members who are already assigned to shifts that overlap
    const availableMembers = allMembers.filter(member => {
      const hasConflict = shifts.some(shift => shift.assignedTo === member.id && this.shiftsOverlap(shift.startTime, shift.endTime, startTime, endTime));
      return !hasConflict;
    });
    // Return available members
    return availableMembers.map(member => ({
      id: member.id,
      name: member.name
    }));
  }
  // Calculate duration between two times in minutes
  private calculateDurationInMinutes(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    let duration = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
    // Handle overnight shifts
    if (duration < 0) {
      duration += 24 * 60; // Add a full day
    }
    return duration;
  }
  // Calculate the midpoint between two times
  private calculateMidpoint(startTime: string, endTime: string): string {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    let startTotalMinutes = startHours * 60 + startMinutes;
    let endTotalMinutes = endHours * 60 + endMinutes;
    // Handle overnight shifts
    if (endTotalMinutes < startTotalMinutes) {
      endTotalMinutes += 24 * 60; // Add a full day
    }
    const midTotalMinutes = Math.floor((startTotalMinutes + endTotalMinutes) / 2);
    const midHours = Math.floor(midTotalMinutes % (24 * 60) / 60);
    const midMinutes = midTotalMinutes % 60;
    return `${midHours.toString().padStart(2, '0')}:${midMinutes.toString().padStart(2, '0')}`;
  }
  // Get coverage preferences
  public getCoveragePreferences() {
    return storage.get(this.storageKeys.coveragePreferences, this.generateSamplePreferences());
  }
  // Update coverage preferences
  public updateCoveragePreferences(preferences: any): void {
    storage.save(this.storageKeys.coveragePreferences, preferences);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_preferences_updated'
    });
  }
  // Notify coordinators about a coverage gap
  private notifyCoverageGap(gap: CoverageGap): void {
    // Find coordinators
    const coordinators = dataService.getTeamMembers().filter(member => member.role.toLowerCase().includes('coordinator'));
    const formattedDate = new Date(gap.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    // Create notifications for each coordinator
    coordinators.forEach(coordinator => {
      notificationService.addNotification({
        type: 'coverage',
        title: `${gap.priority === 'high' ? 'Critical ' : ''}Coverage Gap Detected`,
        message: `No caregiver assigned on ${formattedDate} from ${formatTime(gap.startTime)} to ${formatTime(gap.endTime)}`,
        priority: gap.priority === 'high' ? 'high' : 'medium',
        relatedTo: 'gap',
        relatedId: gap.id
      });
    });
  }
}
// Helper function to format time from 24-hour to 12-hour format
function formatTime(timeString: string): string {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}
// Export a singleton instance
export const coverageService = new CoverageService();