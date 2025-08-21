import React from 'react';
import { storage } from './StorageService';
import { CareShift } from '../types/ScheduleTypes';
// Define our consistent data types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initial: string;
  color: string;
  availability?: string[];
}
export interface CareTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueTime: string;
  dueDate: string;
  hasConflict: boolean;
  assignedTo: string;
  createdBy: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  comments?: Comment[];
}
// New Task Request model for the supporter agency approach
export interface TaskRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  dueTime?: string;
  duration: number;
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  status: 'open' | 'claimed' | 'completed' | 'expired';
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  location?: string;
  recurring?: boolean;
  recurrencePattern?: any;
  comments?: Comment[];
}
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  category: string;
  assignedTo: string;
  location?: string;
  priority?: string;
  isRecurring?: boolean;
  hasConflict?: boolean;
  recurrencePattern?: {
    type: string;
    interval: number;
    weekDays?: number[];
    monthDay?: number;
    endDate?: string;
    occurrences?: number;
  };
}
export interface Comment {
  id: string;
  user: string;
  text: string;
  time: string;
  isConflict?: boolean;
}
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: string;
  relatedTo?: string;
  relatedId?: string;
}
export interface Patient {
  id: string;
  name: string;
  age: number;
  conditions: string[];
  medications: Medication[];
}
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  instructions: string;
}
export interface HelpOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate?: string;
  dueTime?: string;
  duration?: number;
  location?: string;
  createdBy: string;
  createdAt: string;
  status: 'open' | 'accepted' | 'completed' | 'cancelled';
  acceptedBy?: string;
  acceptedAt?: string;
  completedBy?: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
}
export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdBy: string;
  createdAt: string;
}
class DataService {
  private storageKeys = {
    teamMembers: 'team_members',
    tasks: 'tasks',
    events: 'calendar_events',
    notifications: 'notifications',
    completedTaskIds: 'completed_task_ids',
    patient: 'patient',
    taskRequests: 'task_requests',
    helpOpportunities: 'help_opportunities',
    teams: 'user_teams'
  };
  // Core team members data
  private defaultTeamMembers: TeamMember[] = [{
    id: 'james',
    name: 'James Wilson',
    role: 'Nurse',
    initial: 'J',
    color: 'blue',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Friday']
  }, {
    id: 'maria',
    name: 'Maria Rodriguez',
    role: 'Doctor',
    initial: 'M',
    color: 'green',
    availability: ['Monday', 'Thursday']
  }, {
    id: 'linda',
    name: 'Linda Chen',
    role: 'Family Caregiver',
    initial: 'L',
    color: 'purple',
    availability: ['Saturday', 'Sunday', 'Wednesday']
  }, {
    id: 'robert',
    name: 'Robert Johnson',
    role: 'Physical Therapist',
    initial: 'R',
    color: 'yellow',
    availability: ['Tuesday', 'Thursday']
  }];
  // Patient data
  private defaultPatient: Patient = {
    id: 'patient1',
    name: 'Eleanor Smith',
    age: 78,
    conditions: ['Diabetes Type 2', 'Hypertension', 'Early-stage Dementia'],
    medications: [{
      id: 'med1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      time: ['9:00', '18:00'],
      instructions: 'Take with food'
    }, {
      id: 'med2',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      time: ['9:00'],
      instructions: 'Take in the morning'
    }, {
      id: 'med3',
      name: 'Donepezil',
      dosage: '5mg',
      frequency: 'Once daily',
      time: ['21:00'],
      instructions: 'Take before bedtime'
    }]
  };
  // Create consistent tasks based on the patient's care needs
  private generateDefaultTasks(): CareTask[] {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    // Generate tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return [{
      id: 'task1',
      title: 'Morning medication',
      description: 'Administer Metformin 500mg and Lisinopril 10mg with breakfast',
      status: 'pending',
      dueTime: '9:00 AM',
      dueDate: todayStr,
      hasConflict: false,
      assignedTo: 'james',
      createdBy: 'maria',
      priority: 'high',
      category: 'medication',
      comments: [{
        id: 'comment1',
        user: 'Maria Rodriguez',
        text: 'Please ensure Eleanor takes these with a full meal to avoid stomach upset.',
        time: '1 day ago'
      }]
    }, {
      id: 'task2',
      title: 'Blood glucose check',
      description: 'Check blood glucose levels before lunch and record in the app',
      status: 'pending',
      dueTime: '11:30 AM',
      dueDate: todayStr,
      hasConflict: false,
      assignedTo: 'linda',
      createdBy: 'james',
      priority: 'medium',
      category: 'health'
    }, {
      id: 'task3',
      title: 'Physical therapy exercises',
      description: 'Complete the set of mobility exercises prescribed by Robert',
      status: 'pending',
      dueTime: '2:00 PM',
      dueDate: todayStr,
      hasConflict: true,
      assignedTo: 'linda',
      createdBy: 'robert',
      priority: 'medium',
      category: 'therapy',
      comments: [{
        id: 'comment2',
        user: 'Linda Chen',
        text: "This conflicts with Eleanor's doctor appointment at the same time.",
        time: '2 hours ago',
        isConflict: true
      }, {
        id: 'comment3',
        user: 'Robert Johnson',
        text: "Let's reschedule this to 4:00 PM then.",
        time: '1 hour ago'
      }]
    }, {
      id: 'task4',
      title: 'Evening medication',
      description: 'Administer Metformin 500mg with dinner and Donepezil 5mg before bed',
      status: 'pending',
      dueTime: '6:00 PM',
      dueDate: todayStr,
      hasConflict: false,
      assignedTo: 'james',
      createdBy: 'maria',
      priority: 'high',
      category: 'medication'
    }, {
      id: 'task5',
      title: 'Blood pressure check',
      description: 'Measure blood pressure and record in the health log',
      status: 'pending',
      dueTime: '8:00 PM',
      dueDate: todayStr,
      hasConflict: false,
      assignedTo: 'linda',
      createdBy: 'maria',
      priority: 'medium',
      category: 'health'
    }, {
      id: 'task6',
      title: 'Grocery shopping',
      description: 'Pick up items from the grocery list: fresh vegetables, whole grain bread, and low-sugar yogurt',
      status: 'pending',
      dueTime: '10:00 AM',
      dueDate: tomorrowStr,
      hasConflict: false,
      assignedTo: 'linda',
      createdBy: 'linda',
      priority: 'low',
      category: 'errands'
    }];
  }
  // Create default task requests for the supporter agency model
  private generateDefaultTaskRequests(): TaskRequest[] {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    // Generate tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    // Generate day after tomorrow
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];
    return [{
      id: 'request1',
      title: 'Transportation to doctor appointment',
      description: 'Need someone to drive Eleanor to her cardiology appointment and back home.',
      category: 'driving',
      dueDate: tomorrowStr,
      dueTime: '14:00',
      duration: 120,
      priority: 'high',
      createdBy: 'linda',
      createdAt: new Date(new Date().getTime() - 2 * 60 * 60000).toISOString(),
      status: 'open',
      location: 'Memorial Hospital, 123 Main St'
    }, {
      id: 'request2',
      title: 'Grocery shopping assistance',
      description: 'Help needed with weekly grocery shopping. List will be provided.',
      category: 'grocery_shopping',
      dueDate: todayStr,
      dueTime: '16:00',
      duration: 60,
      priority: 'medium',
      createdBy: 'maria',
      createdAt: new Date(new Date().getTime() - 5 * 60 * 60000).toISOString(),
      status: 'claimed',
      claimedBy: 'james',
      claimedAt: new Date(new Date().getTime() - 3 * 60 * 60000).toISOString(),
      location: 'Safeway on Oak Street'
    }, {
      id: 'request3',
      title: 'Companionship for afternoon',
      description: 'Looking for someone to keep Eleanor company for a few hours, maybe play cards or watch a movie.',
      category: 'keeping_company',
      dueDate: dayAfterStr,
      dueTime: '13:00',
      duration: 180,
      priority: 'low',
      createdBy: 'linda',
      createdAt: new Date(new Date().getTime() - 12 * 60 * 60000).toISOString(),
      status: 'open',
      location: "Eleanor's home"
    }, {
      id: 'request4',
      title: 'Help with laundry',
      description: 'Need assistance with doing a few loads of laundry and folding.',
      category: 'home_management',
      dueDate: tomorrowStr,
      dueTime: '10:00',
      duration: 90,
      priority: 'medium',
      createdBy: 'james',
      createdAt: new Date(new Date().getTime() - 8 * 60 * 60000).toISOString(),
      status: 'open',
      location: "Eleanor's home"
    }, {
      id: 'request5',
      title: 'Medication pickup from pharmacy',
      description: "Pick up Eleanor's prescription refill from the pharmacy.",
      category: 'managing_medications',
      dueDate: todayStr,
      dueTime: '17:00',
      duration: 30,
      priority: 'high',
      createdBy: 'maria',
      createdAt: new Date(new Date().getTime() - 6 * 60 * 60000).toISOString(),
      status: 'completed',
      claimedBy: 'linda',
      claimedAt: new Date(new Date().getTime() - 5 * 60 * 60000).toISOString(),
      completedAt: new Date(new Date().getTime() - 1 * 60 * 60000).toISOString(),
      location: 'CVS Pharmacy on 5th Ave'
    }];
  }
  // Create consistent calendar events based on the patient's care needs
  private generateDefaultEvents(): CalendarEvent[] {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    // Generate tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    // Generate dates for the next week
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    return [{
      id: 'event1',
      title: 'Doctor Appointment',
      description: 'Regular checkup with Dr. Rodriguez',
      date: todayStr,
      startTime: '14:00',
      endTime: '15:00',
      duration: 60,
      category: 'appointment',
      assignedTo: 'linda',
      location: 'Memorial Hospital, Room 305',
      priority: 'high',
      hasConflict: true
    }, {
      id: 'event2',
      title: 'Morning Medication',
      description: 'Metformin 500mg and Lisinopril 10mg with breakfast',
      date: todayStr,
      startTime: '09:00',
      endTime: '09:15',
      duration: 15,
      category: 'medication',
      assignedTo: 'james',
      isRecurring: true,
      recurrencePattern: {
        type: 'daily',
        interval: 1
      }
    }, {
      id: 'event3',
      title: 'Evening Medication',
      description: 'Metformin 500mg with dinner',
      date: todayStr,
      startTime: '18:00',
      endTime: '18:15',
      duration: 15,
      category: 'medication',
      assignedTo: 'james',
      isRecurring: true,
      recurrencePattern: {
        type: 'daily',
        interval: 1
      }
    }, {
      id: 'event4',
      title: 'Bedtime Medication',
      description: 'Donepezil 5mg before sleep',
      date: todayStr,
      startTime: '21:00',
      endTime: '21:15',
      duration: 15,
      category: 'medication',
      assignedTo: 'linda',
      isRecurring: true,
      recurrencePattern: {
        type: 'daily',
        interval: 1
      }
    }, {
      id: 'event5',
      title: 'Physical Therapy Session',
      description: 'In-home session with Robert',
      date: tomorrowStr,
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      category: 'therapy',
      assignedTo: 'robert',
      isRecurring: true,
      recurrencePattern: {
        type: 'weekly',
        interval: 1,
        weekDays: [2, 4] // Tuesday and Thursday
      }
    }, {
      id: 'event6',
      title: 'Memory Care Group',
      description: 'Group therapy session at the community center',
      date: nextWeekStr,
      startTime: '15:00',
      endTime: '16:30',
      duration: 90,
      category: 'therapy',
      assignedTo: 'linda',
      location: 'Sunset Community Center, Room B',
      isRecurring: true,
      recurrencePattern: {
        type: 'weekly',
        interval: 2,
        weekDays: [1] // Monday every other week
      }
    }];
  }
  // Create consistent notifications
  private generateDefaultNotifications(): Notification[] {
    return [{
      id: 'notif1',
      type: 'task',
      title: 'Task Due Soon',
      message: 'Morning medication is due in 30 minutes',
      timestamp: new Date(new Date().getTime() - 30 * 60000).toISOString(),
      read: false,
      priority: 'high',
      relatedTo: 'task',
      relatedId: 'task1'
    }, {
      id: 'notif2',
      type: 'conflict',
      title: 'Schedule Conflict',
      message: 'Physical therapy exercises conflicts with doctor appointment',
      timestamp: new Date(new Date().getTime() - 2 * 60 * 60000).toISOString(),
      read: false,
      priority: 'high',
      relatedTo: 'task',
      relatedId: 'task3'
    }, {
      id: 'notif3',
      type: 'update',
      title: 'Task Completed',
      message: 'James completed the blood glucose check',
      timestamp: new Date(new Date().getTime() - 4 * 60 * 60000).toISOString(),
      read: true,
      priority: 'medium',
      relatedTo: 'task',
      relatedId: 'task2'
    }, {
      id: 'notif4',
      type: 'reminder',
      title: 'Appointment Tomorrow',
      message: 'Physical therapy session with Robert at 10:00 AM',
      timestamp: new Date(new Date().getTime() - 12 * 60 * 60000).toISOString(),
      read: true,
      priority: 'medium',
      relatedTo: 'event',
      relatedId: 'event5'
    }, {
      id: 'notif5',
      type: 'message',
      title: 'New Message',
      message: "Maria: Please monitor Eleanor's blood pressure closely today",
      timestamp: new Date(new Date().getTime() - 1 * 60 * 60000).toISOString(),
      read: false,
      priority: 'medium'
    }, {
      id: 'notif6',
      type: 'help_needed',
      title: 'Help Needed',
      message: 'New help request: Transportation to doctor appointment',
      timestamp: new Date(new Date().getTime() - 2 * 60 * 60000).toISOString(),
      read: false,
      priority: 'medium',
      relatedTo: 'task_request',
      relatedId: 'request1'
    }];
  }
  // Initialize data in storage if it doesn't exist
  public initializeData() {
    // Check if data already exists
    const existingTeamMembers = storage.get(this.storageKeys.teamMembers, null);
    const existingTasks = storage.get(this.storageKeys.tasks, null);
    const existingEvents = storage.get(this.storageKeys.events, null);
    const existingNotifications = storage.get(this.storageKeys.notifications, null);
    const existingPatient = storage.get(this.storageKeys.patient, null);
    const existingTaskRequests = storage.get(this.storageKeys.taskRequests, null);
    // Initialize with default data if not present
    if (!existingTeamMembers) {
      storage.save(this.storageKeys.teamMembers, this.defaultTeamMembers);
    }
    if (!existingTasks) {
      storage.save(this.storageKeys.tasks, this.generateDefaultTasks());
    }
    if (!existingEvents) {
      storage.save(this.storageKeys.events, this.generateDefaultEvents());
    }
    if (!existingNotifications) {
      storage.save(this.storageKeys.notifications, this.generateDefaultNotifications());
    }
    if (!existingPatient) {
      storage.save(this.storageKeys.patient, this.defaultPatient);
    }
    if (!existingTaskRequests) {
      storage.save(this.storageKeys.taskRequests, this.generateDefaultTaskRequests());
    }
    // Initialize help opportunities
    const existingOpportunities = storage.get(this.storageKeys.helpOpportunities, null);
    if (!existingOpportunities) {
      storage.save(this.storageKeys.helpOpportunities, this.generateSampleHelpOpportunities());
    }
    // Initialize teams
    const existingTeams = storage.get(this.storageKeys.teams, null);
    if (!existingTeams) {
      storage.save(this.storageKeys.teams, this.generateDefaultTeams());
    }
  }
  // Generate sample help opportunities
  private generateSampleHelpOpportunities(): HelpOpportunity[] {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return [{
      id: 'help_1',
      title: 'Drive Eleanor to Doctor Appointment',
      description: 'Need someone to drive Eleanor to her cardiology appointment at Memorial Hospital and wait during the appointment (approx. 1 hour).',
      category: 'transportation',
      dueDate: tomorrow.toISOString().split('T')[0],
      dueTime: '2:00 PM',
      duration: 120,
      location: 'Memorial Hospital, 123 Medical Blvd',
      createdBy: 'maria',
      createdAt: new Date().toISOString(),
      status: 'open',
      priority: 'high'
    }, {
      id: 'help_2',
      title: 'Pick up Prescription',
      description: "Eleanor's blood pressure medication is ready for pickup at the pharmacy.",
      category: 'errands',
      dueDate: tomorrow.toISOString().split('T')[0],
      dueTime: '4:00 PM',
      duration: 30,
      location: 'Walgreens, 456 Main St',
      createdBy: 'linda',
      createdAt: new Date().toISOString(),
      status: 'open',
      priority: 'medium'
    }, {
      id: 'help_3',
      title: 'Prepare Dinner',
      description: 'Looking for someone to prepare a simple dinner for Eleanor. She enjoys chicken soup and vegetables. Ingredients will be provided.',
      category: 'meals',
      dueDate: tomorrow.toISOString().split('T')[0],
      dueTime: '5:30 PM',
      duration: 60,
      location: "Eleanor's Home",
      createdBy: 'james',
      createdAt: new Date().toISOString(),
      status: 'open',
      priority: 'medium'
    }, {
      id: 'help_4',
      title: 'Afternoon Companionship',
      description: 'Eleanor would enjoy some company for a few hours in the afternoon. Activities she enjoys: card games, reading, and watching classic movies.',
      category: 'companionship',
      dueDate: dayAfterTomorrow.toISOString().split('T')[0],
      dueTime: '2:00 PM',
      duration: 180,
      location: "Eleanor's Home",
      createdBy: 'maria',
      createdAt: new Date().toISOString(),
      status: 'open',
      priority: 'low'
    }, {
      id: 'help_5',
      title: 'Help with Laundry',
      description: 'Need assistance with doing a couple loads of laundry (washing, drying, and folding).',
      category: 'household',
      dueDate: dayAfterTomorrow.toISOString().split('T')[0],
      dueTime: '10:00 AM',
      duration: 90,
      location: "Eleanor's Home",
      createdBy: 'linda',
      createdAt: new Date().toISOString(),
      status: 'accepted',
      acceptedBy: 'robert',
      acceptedAt: new Date().toISOString(),
      priority: 'medium'
    }];
  }
  // Generate default teams
  private generateDefaultTeams(): Team[] {
    return [{
      id: 'team1',
      name: 'Primary Care Team',
      description: 'Core team responsible for daily care coordination',
      members: ['james', 'maria'],
      createdBy: 'maria',
      createdAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60000).toISOString()
    }, {
      id: 'team2',
      name: 'Support Network',
      description: 'Extended family and community support team',
      members: ['linda', 'robert'],
      createdBy: 'linda',
      createdAt: new Date(new Date().getTime() - 15 * 24 * 60 * 60000).toISOString()
    }, {
      id: 'team3',
      name: 'Medical Specialists',
      description: 'Team of medical specialists and healthcare providers',
      members: ['maria', 'robert'],
      createdBy: 'maria',
      createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60000).toISOString()
    }];
  }
  // Get all help opportunities
  public getHelpOpportunities(): HelpOpportunity[] {
    return storage.get(this.storageKeys.helpOpportunities, []);
  }
  // Get a specific help opportunity by ID
  public getHelpOpportunityById(id: string): HelpOpportunity | undefined {
    const opportunities = this.getHelpOpportunities();
    return opportunities.find(opportunity => opportunity.id === id);
  }
  // Add a new help opportunity
  public addHelpOpportunity(opportunity: Omit<HelpOpportunity, 'id' | 'createdAt'>): HelpOpportunity {
    const opportunities = this.getHelpOpportunities();
    const newOpportunity: HelpOpportunity = {
      ...opportunity,
      id: `help_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    opportunities.push(newOpportunity);
    storage.save(this.storageKeys.helpOpportunities, opportunities);
    return newOpportunity;
  }
  // Update an existing help opportunity
  public updateHelpOpportunity(updatedOpportunity: HelpOpportunity): void {
    const opportunities = this.getHelpOpportunities();
    const updatedOpportunities = opportunities.map(opportunity => opportunity.id === updatedOpportunity.id ? updatedOpportunity : opportunity);
    storage.save(this.storageKeys.helpOpportunities, updatedOpportunities);
  }
  // Delete a help opportunity
  public deleteHelpOpportunity(id: string): void {
    const opportunities = this.getHelpOpportunities();
    const filteredOpportunities = opportunities.filter(opportunity => opportunity.id !== id);
    storage.save(this.storageKeys.helpOpportunities, filteredOpportunities);
  }
  // Get help opportunities by status
  public getHelpOpportunitiesByStatus(status: 'open' | 'accepted' | 'completed' | 'cancelled'): HelpOpportunity[] {
    const opportunities = this.getHelpOpportunities();
    return opportunities.filter(opportunity => opportunity.status === status);
  }
  // Get help opportunities accepted by a specific user
  public getHelpOpportunitiesAcceptedByUser(userId: string): HelpOpportunity[] {
    const opportunities = this.getHelpOpportunities();
    return opportunities.filter(opportunity => opportunity.status === 'accepted' && opportunity.acceptedBy === userId);
  }
  // Get team members
  public getTeamMembers(): TeamMember[] {
    return storage.get(this.storageKeys.teamMembers, this.defaultTeamMembers);
  }
  // Get team member by ID
  public getTeamMemberById(id: string): TeamMember | undefined {
    const teamMembers = this.getTeamMembers();
    return teamMembers.find(member => member.id === id);
  }
  // Get team member name by ID
  public getTeamMemberName(id: string): string {
    const member = this.getTeamMemberById(id);
    return member ? member.name : 'Unknown';
  }
  // Get all tasks
  public getTasks(): CareTask[] {
    return storage.get(this.storageKeys.tasks, this.generateDefaultTasks());
  }
  // Get tasks for today
  public getTodayTasks(): CareTask[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getTasks().filter(task => task.dueDate === today);
  }
  // Get task by ID
  public getTaskById(id: string): CareTask | undefined {
    const tasks = this.getTasks();
    return tasks.find(task => task.id === id);
  }
  // Update task status
  public updateTaskStatus(id: string, status: 'pending' | 'completed'): void {
    const tasks = this.getTasks();
    const updatedTasks = tasks.map(task => task.id === id ? {
      ...task,
      status
    } : task);
    storage.save(this.storageKeys.tasks, updatedTasks);
  }
  // Get all calendar events
  public getEvents(): CalendarEvent[] {
    return storage.get(this.storageKeys.events, this.generateDefaultEvents());
  }
  // Get events for a specific date
  public getEventsForDate(dateStr: string): CalendarEvent[] {
    return this.getEvents().filter(event => event.date === dateStr);
  }
  // Get event by ID
  public getEventById(id: string): CalendarEvent | undefined {
    const events = this.getEvents();
    return events.find(event => event.id === id);
  }
  // Add a new event
  public addEvent(event: CalendarEvent): void {
    const events = this.getEvents();
    const updatedEvents = [...events, event];
    storage.save(this.storageKeys.events, updatedEvents);
  }
  // Get all notifications
  public getNotifications(): Notification[] {
    return storage.get(this.storageKeys.notifications, this.generateDefaultNotifications());
  }
  // Mark notification as read
  public markNotificationAsRead(id: string): void {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(notif => notif.id === id ? {
      ...notif,
      read: true
    } : notif);
    storage.save(this.storageKeys.notifications, updatedNotifications);
  }
  // Get patient data
  public getPatient(): Patient {
    return storage.get(this.storageKeys.patient, this.defaultPatient);
  }
  // Get completed task IDs
  public getCompletedTaskIds(): string[] {
    return storage.get(this.storageKeys.completedTaskIds, []);
  }
  // Toggle task completion
  public toggleTaskCompletion(taskId: string): void {
    const completedIds = this.getCompletedTaskIds();
    let updatedIds: string[];
    if (completedIds.includes(taskId)) {
      updatedIds = completedIds.filter(id => id !== taskId);
    } else {
      updatedIds = [...completedIds, taskId];
    }
    storage.save(this.storageKeys.completedTaskIds, updatedIds);
    // Also update the task status in the tasks list
    const isCompleted = updatedIds.includes(taskId);
    this.updateTaskStatus(taskId, isCompleted ? 'completed' : 'pending');
  }
  // Check if a task is completed
  public isTaskCompleted(taskId: string): boolean {
    const completedIds = this.getCompletedTaskIds();
    return completedIds.includes(taskId);
  }
  // Task Request Methods
  // Get all task requests
  public getTaskRequests(): TaskRequest[] {
    return storage.get(this.storageKeys.taskRequests, this.generateDefaultTaskRequests());
  }
  // Get task requests for today
  public getTodayTaskRequests(): TaskRequest[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getTaskRequests().filter(request => request.dueDate === today && request.status === 'open');
  }
  // Get task request by ID
  public getTaskRequestById(id: string): TaskRequest | undefined {
    const requests = this.getTaskRequests();
    return requests.find(request => request.id === id);
  }
  // Add a new task request
  public addTaskRequest(request: TaskRequest): void {
    const requests = this.getTaskRequests();
    const updatedRequests = [...requests, request];
    storage.save(this.storageKeys.taskRequests, updatedRequests);
  }
  // Claim a task request
  public claimTaskRequest(id: string, userId: string): void {
    const requests = this.getTaskRequests();
    const updatedRequests = requests.map(req => req.id === id ? {
      ...req,
      status: 'claimed',
      claimedBy: userId,
      claimedAt: new Date().toISOString()
    } : req);
    storage.save(this.storageKeys.taskRequests, updatedRequests);
    // Update contribution history
    this.updateContributionHistory(userId, id, 'claimed');
  }
  // Complete a task request
  public completeTaskRequest(id: string): void {
    const requests = this.getTaskRequests();
    const request = requests.find(req => req.id === id);
    if (request && request.claimedBy) {
      const updatedRequests = requests.map(req => req.id === id ? {
        ...req,
        status: 'completed',
        completedAt: new Date().toISOString()
      } : req);
      storage.save(this.storageKeys.taskRequests, updatedRequests);
      // Update contribution history
      this.updateContributionHistory(request.claimedBy, id, 'completed');
    }
  }
  // Update contribution history
  private updateContributionHistory(userId: string, taskId: string, action: 'claimed' | 'completed'): void {
    const historyKey = `contribution_history_${userId}`;
    const history = storage.get(historyKey, {
      tasksCompleted: 0,
      lastContribution: null,
      preferredCategories: {}
    });
    // Only increment completed count for completed tasks
    if (action === 'completed') {
      history.tasksCompleted += 1;
    }
    history.lastContribution = new Date().toISOString();
    // Update category preferences
    const request = this.getTaskRequestById(taskId);
    if (request) {
      const category = request.category;
      if (!history.preferredCategories[category]) {
        history.preferredCategories[category] = 0;
      }
      history.preferredCategories[category] += 1;
    }
    storage.save(historyKey, history);
  }
  // Get user contribution history
  public getContributionHistory(userId: string): {
    tasksCompleted: number;
    lastContribution: string | null;
    preferredCategories: Record<string, number>;
  } {
    const historyKey = `contribution_history_${userId}`;
    return storage.get(historyKey, {
      tasksCompleted: 0,
      lastContribution: null,
      preferredCategories: {}
    });
  }
  // Get teams for the current user
  public getUserTeams(): Team[] {
    return storage.get(this.storageKeys.teams, this.generateDefaultTeams());
  }
  // Get team by ID
  public getTeamById(id: string): Team | undefined {
    const teams = this.getUserTeams();
    return teams.find(team => team.id === id);
  }
  // Create a new team
  public createTeam(team: Omit<Team, 'id' | 'createdAt'>): Team {
    const teams = this.getUserTeams();
    const newTeam: Team = {
      ...team,
      id: `team_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    teams.push(newTeam);
    storage.save(this.storageKeys.teams, teams);
    return newTeam;
  }
  // Update an existing team
  public updateTeam(updatedTeam: Team): void {
    const teams = this.getUserTeams();
    const updatedTeams = teams.map(team => team.id === updatedTeam.id ? updatedTeam : team);
    storage.save(this.storageKeys.teams, updatedTeams);
  }
  // New method to associate tasks with shifts
  public associateTaskWithShift(taskId: string, shiftId: string): void {
    const tasks = this.getTasks();
    const updatedTasks = tasks.map(task => task.id === taskId ? {
      ...task,
      shiftId // Add shift reference to task
    } : task);
    storage.save(this.storageKeys.tasks, updatedTasks);
  }
  // New method to get tasks associated with a shift
  public getTasksForShift(shiftId: string): CareTask[] {
    const tasks = this.getTasks();
    return tasks.filter(task => task.shiftId === shiftId);
  }
  // New method to check for scheduling conflicts
  public checkForConflicts(date: string, startTime: string, endTime: string, caregiverId: string, excludeEventId?: string): CalendarEvent[] {
    const events = this.getEventsForDate(date);
    return events.filter(event => {
      // Skip the event being checked (for updates)
      if (excludeEventId && event.id === excludeEventId) return false;
      // Only check events assigned to this caregiver
      if (event.assignedTo !== caregiverId) return false;
      // Check for time overlap
      return this.timesOverlap(startTime, endTime, event.startTime, event.endTime);
    });
  }
  // Helper to check if two time ranges overlap
  private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    // Convert to minutes for easier comparison
    const toMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    const start1Min = toMinutes(start1);
    const end1Min = toMinutes(end1);
    const start2Min = toMinutes(start2);
    const end2Min = toMinutes(end2);
    // Handle overnight shifts
    const overnight1 = end1Min < start1Min;
    const overnight2 = end2Min < start2Min;
    if (overnight1 && overnight2) {
      // Both overnight - they must overlap
      return true;
    } else if (overnight1) {
      // First is overnight
      return start2Min < end1Min || start1Min < end2Min;
    } else if (overnight2) {
      // Second is overnight
      return start1Min < end2Min || start2Min < end1Min;
    } else {
      // Neither is overnight - standard check
      return start1Min < end2Min && start2Min < end1Min;
    }
  }
}
export const dataService = new DataService();