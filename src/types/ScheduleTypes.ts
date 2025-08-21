// Core shift model - the foundation of schedule-centric care coordination
export interface CareShift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedTo: string | null; // null = open/unassigned shift
  status: 'scheduled' | 'in_progress' | 'completed' | 'open';
  handoffNotes?: string;
  coverageType: 'primary' | 'backup' | 'specialist';
  recurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  tasks?: string[]; // IDs of tasks associated with this shift
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  color?: string; // For visual distinction in the UI
}

// Simplified Availability Status for MVP
export type AvailabilityStatus = 'available' | 'tentative' | 'unavailable';

// Simplified User Availability Model
export interface UserAvailability {
  userId: string;
  status: AvailabilityStatus;
  dateOverrides: Record<string, AvailabilityStatus>;
  recurringPattern: WeeklyAvailabilityPattern;
  lastUpdated: string;
}

// Weekly availability pattern (simplified)
export interface WeeklyAvailabilityPattern {
  [dayOfWeek: number]: SimpleTimeSlot[];
}

// Simplified time slot
export interface SimpleTimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  status: 'available' | 'tentative';
}

// Coverage metrics for dashboard
export interface CoverageMetrics {
  totalHours: number;
  coveredHours: number;
  coveragePercentage: number;
  criticalGaps: number;
  moderateGaps: number;
  confirmedShifts: number;
  tentativeShifts: number;
  openShifts: number;
}

// Simplified coverage gap with action focus
export interface SimplifiedCoverageGap {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  priority: 'critical' | 'moderate' | 'minor';
  suggestedCaregivers: string[];
  requestsSent: string[];
  status: 'open' | 'pending_responses' | 'resolved';
  identifiedAt: string;
  resolvedAt?: string;
}
// Model for coverage gaps in the schedule
export interface CoverageGap {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'identified' | 'addressed' | 'critical';
  priority: 'low' | 'medium' | 'high';
  resolutionOptions?: ResolutionOption[];
  notifiedCoordinators?: string[]; // IDs of coordinators who have been notified
  identifiedAt: string;
}
// Options for resolving coverage gaps
export interface ResolutionOption {
  id: string;
  type: 'reassign' | 'reschedule' | 'split' | 'cancel';
  description: string;
  suggestedAssignee?: string;
  suggestedTime?: {
    date: string;
    startTime: string;
    endTime: string;
  };
}
// Handoff record between caregivers
export interface ShiftHandoff {
  id: string;
  fromShiftId: string;
  toShiftId: string;
  fromCaregiverId: string;
  toCaregiverId: string;
  notes: string;
  status: 'pending' | 'acknowledged' | 'completed';
  tasksCompleted: string[]; // IDs of completed tasks
  tasksPending: string[]; // IDs of pending tasks
  createdAt: string;
  acknowledgedAt?: string;
}
// Enhanced recurrence pattern
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number; // Every X days/weeks/months
  weekDays?: number[]; // 0-6, Sunday-Saturday
  monthDay?: number; // Day of month (1-31)
  endDate?: string; // ISO date string
  occurrences?: number; // Number of occurrences
}
// Shift template for quick creation of common shifts
// Simplified Availability Status for MVP
export type AvailabilityStatus = 'available' | 'tentative' | 'unavailable';

// Simplified User Availability Model
export interface UserAvailability {
  userId: string;
  status: AvailabilityStatus;
  dateOverrides: Record<string, AvailabilityStatus>;
  recurringPattern: WeeklyAvailabilityPattern;
  lastUpdated: string;
}

// Weekly availability pattern (simplified)
export interface WeeklyAvailabilityPattern {
  [dayOfWeek: number]: SimpleTimeSlot[];
}

// Simplified time slot
export interface SimpleTimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  status: 'available' | 'tentative';
}

// Coverage metrics for dashboard
export interface CoverageMetrics {
  totalHours: number;
  coveredHours: number;
  coveragePercentage: number;
  criticalGaps: number;
  moderateGaps: number;
  confirmedShifts: number;
  tentativeShifts: number;
  openShifts: number;
}

// Simplified coverage gap with action focus
export interface SimplifiedCoverageGap {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  priority: 'critical' | 'moderate' | 'minor';
  suggestedCaregivers: string[];
  requestsSent: string[];
  status: 'open' | 'pending_responses' | 'resolved';
  identifiedAt: string;
  resolvedAt?: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  coverageType: 'primary' | 'backup' | 'specialist';
  defaultTasks: string[]; // IDs of default tasks
  color?: string;
  createdBy: string;
}
// Role-based view preferences for schedule
export interface ScheduleViewPreferences {
  defaultView: 'day' | 'three-day' | 'week' | 'month';
  showCompletedTasks: boolean;
  showHandoffNotes: boolean;
  colorCoding: 'caregiver' | 'task-type' | 'coverage-type';
  timeFormat: '12h' | '24h';
  dayStartHour: number; // 0-23
  dayEndHour: number; // 0-23
}