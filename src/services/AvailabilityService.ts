import { storage } from './StorageService';
import { notificationService } from './NotificationService';
import { shiftService } from './ShiftService';
import { analytics, AnalyticsEvents } from './AnalyticsService';
import { dataService } from './DataService';
// Types for availability management
interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}
interface DateAvailability {
  userId: string;
  date: string;
  status: 'available' | 'tentative' | 'unavailable';
  timeSlots?: TimeSlot[];
  reason?: string;
  createdAt: string;
  updatedAt?: string;
}
interface WeeklyAvailability {
  [dayOfWeek: string]: TimeSlot[];
}
interface UnavailabilityRecord {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'processed' | 'resolved';
  affectedShifts: string[];
  replacementRequested: boolean;
  teamNotified: boolean;
  createdAt: string;
  resolvedAt?: string;
}
class AvailabilityService {
  private storageKeys = {
    dateAvailability: 'date_availability',
    weeklyAvailability: 'weekly_availability',
    unavailabilityRecords: 'unavailability_records',
    currentStatus: 'current_availability_status'
  };
  // Initialize with default data
  public initializeData() {
    const existingDateAvailability = storage.get(this.storageKeys.dateAvailability, null);
    const existingWeeklyAvailability = storage.get(this.storageKeys.weeklyAvailability, null);
    const existingUnavailabilityRecords = storage.get(this.storageKeys.unavailabilityRecords, null);
    const existingCurrentStatus = storage.get(this.storageKeys.currentStatus, null);
    if (!existingDateAvailability) {
      storage.save(this.storageKeys.dateAvailability, []);
    }
    if (!existingWeeklyAvailability) {
      storage.save(this.storageKeys.weeklyAvailability, {});
    }
    if (!existingUnavailabilityRecords) {
      storage.save(this.storageKeys.unavailabilityRecords, []);
    }
    if (!existingCurrentStatus) {
      storage.save(this.storageKeys.currentStatus, {});
    }
  }
  // Current status methods
  public getCurrentStatus(userId: string): string {
    const statuses = storage.get(this.storageKeys.currentStatus, {});
    return statuses[userId] || 'available';
  }
  public updateCurrentStatus(userId: string, status: string): void {
    const statuses = storage.get(this.storageKeys.currentStatus, {});
    statuses[userId] = status;
    storage.save(this.storageKeys.currentStatus, statuses);
  }
  // Date availability methods
  public getAvailabilityForDate(userId: string, date: string): string {
    const availabilities = storage.get<DateAvailability[]>(this.storageKeys.dateAvailability, []);
    const found = availabilities.find(a => a.userId === userId && a.date === date);
    return found ? found.status : 'unset';
  }
  public getAvailabilityRange(userId: string, startDate: string, endDate: string): Record<string, string> {
    const availabilities = storage.get<DateAvailability[]>(this.storageKeys.dateAvailability, []);
    const result: Record<string, string> = {};
    const filtered = availabilities.filter(a => a.userId === userId && a.date >= startDate && a.date <= endDate);
    filtered.forEach(a => {
      result[a.date] = a.status;
    });
    return result;
  }
  public setDateAvailability(userId: string, date: string, status: string): void {
    const availabilities = storage.get<DateAvailability[]>(this.storageKeys.dateAvailability, []);
    // Check if an entry already exists for this user and date
    const existingIndex = availabilities.findIndex(a => a.userId === userId && a.date === date);
    if (existingIndex >= 0) {
      // Update existing entry
      availabilities[existingIndex] = {
        ...availabilities[existingIndex],
        status: status as 'available' | 'tentative' | 'unavailable',
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new entry
      availabilities.push({
        userId,
        date,
        status: status as 'available' | 'tentative' | 'unavailable',
        createdAt: new Date().toISOString()
      });
    }
    storage.save(this.storageKeys.dateAvailability, availabilities);
    // Check if this affects any scheduled shifts
    this.checkForAffectedShifts(userId, date, status);
  }
  // Weekly availability methods
  public getWeeklyAvailability(userId: string): WeeklyAvailability {
    const allWeeklyAvailability = storage.get(this.storageKeys.weeklyAvailability, {});
    return allWeeklyAvailability[userId] || this.generateDefaultWeeklyAvailability();
  }
  public updateWeeklyAvailability(userId: string, weeklySchedule: WeeklyAvailability): void {
    const allWeeklyAvailability = storage.get(this.storageKeys.weeklyAvailability, {});
    allWeeklyAvailability[userId] = weeklySchedule;
    storage.save(this.storageKeys.weeklyAvailability, allWeeklyAvailability);
  }
  private generateDefaultWeeklyAvailability(): WeeklyAvailability {
    // Default to weekdays 9-5
    return {
      0: [],
      // Sunday
      1: [{
        id: 'mon1',
        startTime: '09:00',
        endTime: '17:00'
      }],
      // Monday
      2: [{
        id: 'tue1',
        startTime: '09:00',
        endTime: '17:00'
      }],
      // Tuesday
      3: [{
        id: 'wed1',
        startTime: '09:00',
        endTime: '17:00'
      }],
      // Wednesday
      4: [{
        id: 'thu1',
        startTime: '09:00',
        endTime: '17:00'
      }],
      // Thursday
      5: [{
        id: 'fri1',
        startTime: '09:00',
        endTime: '17:00'
      }],
      // Friday
      6: [] // Saturday
    };
  }
  // Unavailability record methods
  public createUnavailabilityRecord(record: Omit<UnavailabilityRecord, 'id' | 'createdAt' | 'status'>): UnavailabilityRecord {
    const records = storage.get<UnavailabilityRecord[]>(this.storageKeys.unavailabilityRecords, []);
    // Find affected shifts
    const affectedShifts = this.findAffectedShifts(record.userId, record.startDate, record.endDate);
    const newRecord: UnavailabilityRecord = {
      ...record,
      id: `unavail_${Date.now()}`,
      status: 'pending',
      affectedShifts,
      createdAt: new Date().toISOString()
    };
    records.push(newRecord);
    storage.save(this.storageKeys.unavailabilityRecords, records);
    // Handle notifications and replacement requests
    this.processUnavailabilityRecord(newRecord);
    return newRecord;
  }
  public getActiveUnavailabilityRecords(userId: string): UnavailabilityRecord[] {
    const records = storage.get<UnavailabilityRecord[]>(this.storageKeys.unavailabilityRecords, []);
    const today = new Date().toISOString().split('T')[0];
    return records.filter(r => r.userId === userId && r.status !== 'resolved' && r.endDate >= today);
  }
  public resolveUnavailabilityRecord(recordId: string): void {
    const records = storage.get<UnavailabilityRecord[]>(this.storageKeys.unavailabilityRecords, []);
    const updatedRecords = records.map(record => record.id === recordId ? {
      ...record,
      status: 'resolved',
      resolvedAt: new Date().toISOString()
    } : record);
    storage.save(this.storageKeys.unavailabilityRecords, updatedRecords);
  }
  // Helper methods
  private findAffectedShifts(userId: string, startDate: string, endDate: string): string[] {
    // Get all shifts for this user in the date range
    const shifts = shiftService.getShifts();
    return shifts.filter(shift => shift.assignedTo === userId && shift.date >= startDate && shift.date <= endDate && shift.status !== 'completed').map(shift => shift.id);
  }
  private checkForAffectedShifts(userId: string, date: string, status: string): void {
    if (status !== 'unavailable') return;
    // Get shifts for this user on this date
    const shifts = shiftService.getShifts();
    const affectedShifts = shifts.filter(shift => shift.assignedTo === userId && shift.date === date && shift.status !== 'completed');
    if (affectedShifts.length === 0) return;
    // Notify the user about affected shifts
    notificationService.addNotification({
      type: 'schedule',
      title: 'Shifts Affected by Unavailability',
      message: `You have ${affectedShifts.length} shift(s) scheduled on ${formatDate(date)} that may need coverage.`,
      priority: 'high'
    });
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_conflicts_detected',
      date: date,
      affected_shifts: affectedShifts.length
    });
  }
  private processUnavailabilityRecord(record: UnavailabilityRecord): void {
    // If no affected shifts, nothing to do
    if (record.affectedShifts.length === 0) return;
    // If team notification requested, notify coordinator
    if (record.teamNotified) {
      // Get user name
      const userName = this.getUserName(record.userId);
      // Find coordinators
      const coordinators = dataService.getTeamMembers().filter(member => member.role?.toLowerCase().includes('coordinator'));
      // Notify each coordinator
      coordinators.forEach(coordinator => {
        notificationService.addNotification({
          type: 'availability',
          title: 'Caregiver Unavailability',
          message: `${userName} will be unavailable from ${formatDate(record.startDate)} to ${formatDate(record.endDate)}. ${record.affectedShifts.length} shifts affected.`,
          priority: 'high'
        });
      });
    }
    // If replacement requested, mark shifts as needing coverage
    if (record.replacementRequested) {
      // In a real app, this would initiate the coverage request process
      // For this prototype, we'll just mark the record as processed
      const records = storage.get<UnavailabilityRecord[]>(this.storageKeys.unavailabilityRecords, []);
      const updatedRecords = records.map(r => r.id === record.id ? {
        ...r,
        status: 'processed'
      } : r);
      storage.save(this.storageKeys.unavailabilityRecords, updatedRecords);
    }
  }
  private getUserName(userId: string): string {
    const user = dataService.getTeamMemberById(userId);
    return user ? user.name : 'Unknown User';
  }
}
// Helper function to format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
// Export a singleton instance
export const availabilityService = new AvailabilityService();