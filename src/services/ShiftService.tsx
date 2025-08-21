import React from 'react';
import { storage } from './StorageService';
import { dataService } from './DataService';
import { analytics, AnalyticsEvents } from './AnalyticsService';
import { notificationService } from './NotificationService';
import { CareShift, ShiftHandoff, ShiftTemplate, RecurrencePattern } from '../types/ScheduleTypes';
class ShiftService {
  private storageKeys = {
    shifts: 'care_shifts',
    handoffs: 'shift_handoffs',
    shiftTemplates: 'shift_templates'
  };
  // Initialize with sample data for demo purposes
  public initializeData() {
    const existingShifts = storage.get(this.storageKeys.shifts, null);
    const existingHandoffs = storage.get(this.storageKeys.handoffs, null);
    const existingTemplates = storage.get(this.storageKeys.shiftTemplates, null);
    if (!existingShifts) {
      storage.save(this.storageKeys.shifts, this.generateSampleShifts());
    }
    if (!existingHandoffs) {
      storage.save(this.storageKeys.handoffs, this.generateSampleHandoffs());
    }
    if (!existingTemplates) {
      storage.save(this.storageKeys.shiftTemplates, this.generateShiftTemplates());
    }
  }
  // Generate sample shifts for the demo
  private generateSampleShifts(): CareShift[] {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    // Generate tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return [{
      id: 'shift1',
      date: todayStr,
      startTime: '08:00',
      endTime: '16:00',
      assignedTo: 'james',
      status: 'scheduled',
      coverageType: 'primary',
      tasks: ['task1', 'task2'],
      createdBy: 'maria',
      createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60000).toISOString(),
      color: '#e6f7ff'
    }, {
      id: 'shift2',
      date: todayStr,
      startTime: '16:00',
      endTime: '22:00',
      assignedTo: 'linda',
      status: 'scheduled',
      coverageType: 'primary',
      handoffNotes: 'Eleanor had lunch at 12:30, please make sure she has dinner by 6:30pm.',
      tasks: ['task4', 'task5'],
      createdBy: 'maria',
      createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60000).toISOString(),
      color: '#fff2e6'
    }, {
      id: 'shift3',
      date: tomorrowStr,
      startTime: '08:00',
      endTime: '16:00',
      assignedTo: null,
      status: 'open',
      coverageType: 'primary',
      createdBy: 'maria',
      createdAt: new Date(new Date().getTime() - 3 * 24 * 60 * 60000).toISOString(),
      color: '#e6f7ff'
    }, {
      id: 'shift4',
      date: tomorrowStr,
      startTime: '16:00',
      endTime: '22:00',
      assignedTo: 'james',
      status: 'scheduled',
      coverageType: 'primary',
      recurring: true,
      recurrencePattern: {
        type: 'weekly',
        interval: 1,
        weekDays: [1, 3, 5] // Monday, Wednesday, Friday
      },
      createdBy: 'maria',
      createdAt: new Date(new Date().getTime() - 14 * 24 * 60 * 60000).toISOString(),
      color: '#e6f7ff'
    }];
  }
  // Generate sample handoffs for the demo
  private generateSampleHandoffs(): ShiftHandoff[] {
    return [{
      id: 'handoff1',
      fromShiftId: 'shift1',
      toShiftId: 'shift2',
      fromCaregiverId: 'james',
      toCaregiverId: 'linda',
      notes: 'Eleanor had a good morning. She took all her medications and had a light lunch. She mentioned feeling a bit tired, so she might want to rest in the afternoon.',
      status: 'completed',
      tasksCompleted: ['task1'],
      tasksPending: ['task2'],
      createdAt: new Date(new Date().getTime() - 1 * 60 * 60000).toISOString(),
      acknowledgedAt: new Date(new Date().getTime() - 55 * 60000).toISOString()
    }];
  }
  // Generate sample shift templates
  private generateShiftTemplates(): ShiftTemplate[] {
    return [{
      id: 'template1',
      name: 'Morning Shift',
      description: 'Standard morning care shift including medication, breakfast, and morning activities',
      duration: 480,
      coverageType: 'primary',
      defaultTasks: [],
      color: '#e6f7ff',
      createdBy: 'maria'
    }, {
      id: 'template2',
      name: 'Evening Shift',
      description: 'Standard evening care shift including dinner, medication, and bedtime routine',
      duration: 360,
      coverageType: 'primary',
      defaultTasks: [],
      color: '#fff2e6',
      createdBy: 'maria'
    }, {
      id: 'template3',
      name: 'Specialist Visit',
      description: 'Short shift for specialist care providers',
      duration: 120,
      coverageType: 'specialist',
      defaultTasks: [],
      color: '#e6ffe6',
      createdBy: 'maria'
    }];
  }
  // Get all shifts
  public getShifts(): CareShift[] {
    return storage.get(this.storageKeys.shifts, []);
  }
  // Get shifts for a specific date
  public getShiftsForDate(dateStr: string): CareShift[] {
    const shifts = this.getShifts();
    return shifts.filter(shift => shift.date === dateStr);
  }
  // Get shifts for a specific caregiver
  public getShiftsForCaregiver(caregiverId: string): CareShift[] {
    const shifts = this.getShifts();
    return shifts.filter(shift => shift.assignedTo === caregiverId);
  }
  // Get upcoming shifts for a caregiver
  public getUpcomingShiftsForCaregiver(caregiverId: string, limit: number = 5): CareShift[] {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const shifts = this.getShifts();
    return shifts.filter(shift => shift.assignedTo === caregiverId && (shift.date > todayStr || shift.date === todayStr && this.isShiftUpcoming(shift))).sort((a, b) => {
      // Sort by date, then by start time
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    }).slice(0, limit);
  }
  // Check if a shift is upcoming (not yet started) on the current day
  private isShiftUpcoming(shift: CareShift): boolean {
    const now = new Date();
    const [hours, minutes] = shift.startTime.split(':').map(Number);
    return now.getHours() < hours || now.getHours() === hours && now.getMinutes() < minutes;
  }
  // Get a specific shift by ID
  public getShiftById(id: string): CareShift | undefined {
    const shifts = this.getShifts();
    return shifts.find(shift => shift.id === id);
  }
  // Add a new shift
  public addShift(shiftData: Omit<CareShift, 'id' | 'createdAt'>): CareShift {
    const shifts = this.getShifts();
    const newShift: CareShift = {
      ...shiftData,
      id: `shift_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    shifts.push(newShift);
    storage.save(this.storageKeys.shifts, shifts);
    // Create notifications for assigned caregiver
    if (newShift.assignedTo) {
      this.notifyShiftAssignment(newShift);
    }
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shift_created',
      coverage_type: newShift.coverageType,
      has_assignee: !!newShift.assignedTo
    });
    return newShift;
  }
  // Update an existing shift
  public updateShift(updatedShift: CareShift): void {
    const shifts = this.getShifts();
    const originalShift = shifts.find(s => s.id === updatedShift.id);
    const updatedShifts = shifts.map(shift => shift.id === updatedShift.id ? {
      ...updatedShift,
      updatedAt: new Date().toISOString()
    } : shift);
    storage.save(this.storageKeys.shifts, updatedShifts);
    // If assignee changed, send notifications
    if (originalShift && originalShift.assignedTo !== updatedShift.assignedTo) {
      // Notify new assignee
      if (updatedShift.assignedTo) {
        this.notifyShiftAssignment(updatedShift);
      }
      // Notify previous assignee about unassignment
      if (originalShift.assignedTo) {
        this.notifyShiftUnassignment(originalShift, updatedShift);
      }
    }
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shift_updated',
      coverage_type: updatedShift.coverageType,
      assignee_changed: originalShift && originalShift.assignedTo !== updatedShift.assignedTo
    });
  }
  // Delete a shift
  public deleteShift(shiftId: string): void {
    const shifts = this.getShifts();
    const shiftToDelete = shifts.find(s => s.id === shiftId);
    if (!shiftToDelete) return;
    const updatedShifts = shifts.filter(shift => shift.id !== shiftId);
    storage.save(this.storageKeys.shifts, updatedShifts);
    // Notify assignee about deletion
    if (shiftToDelete.assignedTo) {
      this.notifyShiftCancellation(shiftToDelete);
    }
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shift_deleted',
      had_assignee: !!shiftToDelete.assignedTo
    });
  }
  // Claim an open shift
  public claimShift(shiftId: string, caregiverId: string): void {
    const shifts = this.getShifts();
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift || shift.status !== 'open' || shift.assignedTo) {
      return; // Cannot claim if not open or already assigned
    }
    const updatedShifts = shifts.map(s => s.id === shiftId ? {
      ...s,
      assignedTo: caregiverId,
      status: 'scheduled',
      updatedAt: new Date().toISOString()
    } : s);
    storage.save(this.storageKeys.shifts, updatedShifts);
    // Notify coordinator about the claim
    this.notifyShiftClaimed(shift, caregiverId);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shift_claimed',
      coverage_type: shift.coverageType
    });
  }
  // Start a shift
  public startShift(shiftId: string): void {
    const shifts = this.getShifts();
    const updatedShifts = shifts.map(shift => shift.id === shiftId ? {
      ...shift,
      status: 'in_progress',
      updatedAt: new Date().toISOString()
    } : shift);
    storage.save(this.storageKeys.shifts, updatedShifts);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shift_started'
    });
  }
  // Complete a shift
  public completeShift(shiftId: string): void {
    const shifts = this.getShifts();
    const updatedShifts = shifts.map(shift => shift.id === shiftId ? {
      ...shift,
      status: 'completed',
      updatedAt: new Date().toISOString()
    } : shift);
    storage.save(this.storageKeys.shifts, updatedShifts);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shift_completed'
    });
  }
  // Create a handoff between shifts
  public createHandoff(handoffData: Omit<ShiftHandoff, 'id' | 'createdAt'>): ShiftHandoff {
    const handoffs = this.getHandoffs();
    const newHandoff: ShiftHandoff = {
      ...handoffData,
      id: `handoff_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    handoffs.push(newHandoff);
    storage.save(this.storageKeys.handoffs, handoffs);
    // Notify the receiving caregiver
    this.notifyHandoff(newHandoff);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'handoff_created',
      tasks_completed: handoffData.tasksCompleted.length,
      tasks_pending: handoffData.tasksPending.length
    });
    return newHandoff;
  }
  // Get all handoffs
  public getHandoffs(): ShiftHandoff[] {
    return storage.get(this.storageKeys.handoffs, []);
  }
  // Get handoff by ID
  public getHandoffById(id: string): ShiftHandoff | undefined {
    const handoffs = this.getHandoffs();
    return handoffs.find(handoff => handoff.id === id);
  }
  // Get handoffs for a specific shift
  public getHandoffsForShift(shiftId: string): ShiftHandoff[] {
    const handoffs = this.getHandoffs();
    return handoffs.filter(handoff => handoff.fromShiftId === shiftId || handoff.toShiftId === shiftId);
  }
  // Acknowledge a handoff
  public acknowledgeHandoff(handoffId: string): void {
    const handoffs = this.getHandoffs();
    const updatedHandoffs = handoffs.map(handoff => handoff.id === handoffId ? {
      ...handoff,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString()
    } : handoff);
    storage.save(this.storageKeys.handoffs, updatedHandoffs);
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'handoff_acknowledged'
    });
  }
  // Get all shift templates
  public getShiftTemplates(): ShiftTemplate[] {
    return storage.get(this.storageKeys.shiftTemplates, []);
  }
  // Get shift template by ID
  public getShiftTemplateById(id: string): ShiftTemplate | undefined {
    const templates = this.getShiftTemplates();
    return templates.find(template => template.id === id);
  }
  // Create a shift from a template
  public createShiftFromTemplate(templateId: string, date: string, startTime: string, assignedTo: string | null = null): CareShift | null {
    const template = this.getShiftTemplateById(templateId);
    if (!template) return null;
    // Calculate end time based on duration
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const totalMinutes = startHours * 60 + startMinutes + template.duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    const shiftData: Omit<CareShift, 'id' | 'createdAt'> = {
      date,
      startTime,
      endTime,
      assignedTo,
      status: assignedTo ? 'scheduled' : 'open',
      coverageType: template.coverageType,
      tasks: [...template.defaultTasks],
      createdBy: storage.get('user_id', 'unknown'),
      color: template.color
    };
    return this.addShift(shiftData);
  }
  // Add a task to a shift
  public addTaskToShift(shiftId: string, taskId: string): void {
    const shifts = this.getShifts();
    const updatedShifts = shifts.map(shift => {
      if (shift.id === shiftId) {
        const tasks = shift.tasks || [];
        if (!tasks.includes(taskId)) {
          return {
            ...shift,
            tasks: [...tasks, taskId],
            updatedAt: new Date().toISOString()
          };
        }
      }
      return shift;
    });
    storage.save(this.storageKeys.shifts, updatedShifts);
  }
  // Remove a task from a shift
  public removeTaskFromShift(shiftId: string, taskId: string): void {
    const shifts = this.getShifts();
    const updatedShifts = shifts.map(shift => {
      if (shift.id === shiftId && shift.tasks) {
        return {
          ...shift,
          tasks: shift.tasks.filter(id => id !== taskId),
          updatedAt: new Date().toISOString()
        };
      }
      return shift;
    });
    storage.save(this.storageKeys.shifts, updatedShifts);
  }
  // Get all tasks for a shift
  public getTasksForShift(shiftId: string): string[] {
    const shift = this.getShiftById(shiftId);
    return shift?.tasks || [];
  }
  // Notification methods
  private notifyShiftAssignment(shift: CareShift): void {
    if (!shift.assignedTo) return;
    const caregiverName = dataService.getTeamMemberName(shift.assignedTo);
    const formattedDate = new Date(shift.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    notificationService.addNotification({
      type: 'schedule',
      title: 'New Shift Assigned',
      message: `You have been assigned a shift on ${formattedDate} from ${formatTime(shift.startTime)} to ${formatTime(shift.endTime)}`,
      priority: 'medium',
      relatedTo: 'shift',
      relatedId: shift.id
    });
  }
  private notifyShiftUnassignment(originalShift: CareShift, updatedShift: CareShift): void {
    if (!originalShift.assignedTo) return;
    const caregiverName = dataService.getTeamMemberName(originalShift.assignedTo);
    const formattedDate = new Date(originalShift.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    notificationService.addNotification({
      type: 'schedule',
      title: 'Shift Unassigned',
      message: `Your shift on ${formattedDate} from ${formatTime(originalShift.startTime)} to ${formatTime(originalShift.endTime)} has been reassigned`,
      priority: 'high',
      relatedTo: 'shift',
      relatedId: originalShift.id
    });
  }
  private notifyShiftCancellation(shift: CareShift): void {
    if (!shift.assignedTo) return;
    const caregiverName = dataService.getTeamMemberName(shift.assignedTo);
    const formattedDate = new Date(shift.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    notificationService.addNotification({
      type: 'schedule',
      title: 'Shift Cancelled',
      message: `Your shift on ${formattedDate} from ${formatTime(shift.startTime)} to ${formatTime(shift.endTime)} has been cancelled`,
      priority: 'high',
      relatedTo: 'shift',
      relatedId: shift.id
    });
  }
  private notifyShiftClaimed(shift: CareShift, caregiverId: string): void {
    const caregiverName = dataService.getTeamMemberName(caregiverId);
    const formattedDate = new Date(shift.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    // Notify coordinators
    const coordinators = dataService.getTeamMembers().filter(member => member.role.toLowerCase().includes('coordinator'));
    coordinators.forEach(coordinator => {
      notificationService.addNotification({
        type: 'schedule',
        title: 'Open Shift Claimed',
        message: `${caregiverName} has claimed the open shift on ${formattedDate} from ${formatTime(shift.startTime)} to ${formatTime(shift.endTime)}`,
        priority: 'medium',
        relatedTo: 'shift',
        relatedId: shift.id
      });
    });
  }
  private notifyHandoff(handoff: ShiftHandoff): void {
    const fromCaregiver = dataService.getTeamMemberName(handoff.fromCaregiverId);
    notificationService.addNotification({
      type: 'handoff',
      title: 'New Shift Handoff',
      message: `${fromCaregiver} has created a handoff for your upcoming shift`,
      priority: 'high',
      relatedTo: 'handoff',
      relatedId: handoff.id
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
export const shiftService = new ShiftService();