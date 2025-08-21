import React, { useEffect, useState, createContext, useContext } from 'react';
import { dataService } from '../services/DataService';
import { shiftService } from '../services/ShiftService';
import { coverageService } from '../services/CoverageService';
import { storage } from '../services/StorageService';
import { CalendarEvent } from '../services/DataService';
import { CareShift, CoverageGap } from '../types/ScheduleTypes';
import { useUserProfile } from './UserProfileContext';
// Define the context type
interface CalendarContextType {
  // Event methods
  getEvents: () => CalendarEvent[];
  getEventsForDate: (dateStr: string) => CalendarEvent[];
  getEventById: (id: string) => CalendarEvent | undefined;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  // Task completion methods
  toggleTaskCompletion: (taskId: string) => void;
  isTaskCompleted: (taskId: string) => boolean;
  // Shift methods
  getShifts: () => CareShift[];
  getShiftsForDate: (dateStr: string) => CareShift[];
  getShiftById: (id: string) => CareShift | undefined;
  getUpcomingShifts: (limit?: number) => CareShift[];
  getMyShifts: (limit?: number) => CareShift[];
  addShift: (shift: Omit<CareShift, 'id' | 'createdAt'>) => CareShift;
  updateShift: (shift: CareShift) => void;
  deleteShift: (id: string) => void;
  claimShift: (id: string) => void;
  startShift: (id: string) => void;
  completeShift: (id: string) => void;
  // Coverage gap methods
  getCoverageGaps: () => CoverageGap[];
  getCoverageGapsForDate: (dateStr: string) => CoverageGap[];
  resolveCoverageGap: (gapId: string, resolutionId: string) => void;
  // Role-based filtering
  isVisibleToCurrentUser: (item: CalendarEvent | CareShift) => boolean;
  // View preferences
  viewMode: 'day' | 'three-day' | 'week' | 'month';
  setViewMode: (mode: 'day' | 'three-day' | 'week' | 'month') => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}
// Create the context with a default undefined value
const CalendarContext = createContext<CalendarContextType | undefined>(undefined);
// Provider component
export const CalendarProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const {
    userProfile
  } = useUserProfile();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shifts, setShifts] = useState<CareShift[]>([]);
  const [coverageGaps, setCoverageGaps] = useState<CoverageGap[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'day' | 'three-day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // Load initial data
  useEffect(() => {
    // Initialize services if needed
    shiftService.initializeData();
    coverageService.initializeData();
    // Load data
    loadEvents();
    loadShifts();
    loadCoverageGaps();
    loadCompletedTaskIds();
    // Load view preferences
    const savedViewMode = storage.get('calendar_view_mode', null);
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);
  // Save view preferences when changed
  useEffect(() => {
    storage.save('calendar_view_mode', viewMode);
  }, [viewMode]);
  // Load functions
  const loadEvents = () => {
    const loadedEvents = dataService.getEvents();
    setEvents(loadedEvents);
  };
  const loadShifts = () => {
    const loadedShifts = shiftService.getShifts();
    setShifts(loadedShifts);
  };
  const loadCoverageGaps = () => {
    const loadedGaps = coverageService.getCoverageGaps();
    setCoverageGaps(loadedGaps);
  };
  const loadCompletedTaskIds = () => {
    const completed = dataService.getCompletedTaskIds();
    setCompletedTaskIds(completed);
  };
  // Event methods
  const getEvents = () => events;
  const getEventsForDate = (dateStr: string) => {
    return events.filter(event => event.date === dateStr);
  };
  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };
  const addEvent = (event: CalendarEvent) => {
    dataService.addEvent(event);
    loadEvents(); // Reload events after adding
  };
  const updateEvent = (event: CalendarEvent) => {
    // In a real app, this would update the event in the database
    console.log('Update event:', event);
    // For now, we'll just reload events
    loadEvents();
  };
  const deleteEvent = (id: string) => {
    // In a real app, this would delete the event from the database
    console.log('Delete event:', id);
    // For now, we'll just reload events
    loadEvents();
  };
  // Task completion methods
  const toggleTaskCompletion = (taskId: string) => {
    dataService.toggleTaskCompletion(taskId);
    loadCompletedTaskIds();
  };
  const isTaskCompleted = (taskId: string) => {
    return completedTaskIds.includes(taskId);
  };
  // Shift methods
  const getShifts = () => shifts;
  const getShiftsForDate = (dateStr: string) => {
    return shifts.filter(shift => shift.date === dateStr);
  };
  const getShiftById = (id: string) => {
    return shifts.find(shift => shift.id === id);
  };
  const getUpcomingShifts = (limit: number = 5) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return shifts.filter(shift => shift.date >= todayStr && shift.status !== 'completed').sort((a, b) => {
      // Sort by date, then by start time
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    }).slice(0, limit);
  };
  const getMyShifts = (limit: number = 5) => {
    if (!userProfile) return [];
    return shifts.filter(shift => shift.assignedTo === userProfile.id && shift.status !== 'completed').sort((a, b) => {
      // Sort by date, then by start time
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    }).slice(0, limit);
  };
  const addShift = (shiftData: Omit<CareShift, 'id' | 'createdAt'>) => {
    const newShift = shiftService.addShift(shiftData);
    loadShifts();
    return newShift;
  };
  const updateShift = (shift: CareShift) => {
    shiftService.updateShift(shift);
    loadShifts();
  };
  const deleteShift = (id: string) => {
    shiftService.deleteShift(id);
    loadShifts();
  };
  const claimShift = (id: string) => {
    if (!userProfile) return;
    shiftService.claimShift(id, userProfile.id);
    loadShifts();
  };
  const startShift = (id: string) => {
    shiftService.startShift(id);
    loadShifts();
  };
  const completeShift = (id: string) => {
    shiftService.completeShift(id);
    loadShifts();
  };
  // Coverage gap methods
  const getCoverageGaps = () => coverageGaps;
  const getCoverageGapsForDate = (dateStr: string) => {
    return coverageGaps.filter(gap => gap.date === dateStr);
  };
  const resolveCoverageGap = (gapId: string, resolutionId: string) => {
    const gap = coverageGaps.find(g => g.id === gapId);
    if (!gap) return;
    const resolution = gap.resolutionOptions?.find(o => o.id === resolutionId);
    if (!resolution) return;
    coverageService.resolveCoverageGap(gapId, resolution);
    loadCoverageGaps();
    loadShifts(); // Reload shifts as they may have been updated
  };
  // Role-based filtering
  const isVisibleToCurrentUser = (item: CalendarEvent | CareShift) => {
    if (!userProfile) return true; // Default to visible if no user profile
    // Coordinators can see everything
    if (userProfile.relationship === 'agency_coordinator') return true;
    // Care recipients see a simplified view
    if (userProfile.relationship === 'care_recipient') {
      // Only show who's coming, not detailed tasks
      if ('assignedTo' in item) {
        return true; // Show all shifts (who's coming)
      } else {
        // For events, only show certain categories
        return ['appointment', 'meal', 'visitor'].includes(item.category);
      }
    }
    // Caregivers see their own assignments and team-wide events
    if ('assignedTo' in item) {
      // For shifts
      return item.assignedTo === userProfile.id || item.assignedTo === null;
    } else {
      // For events
      return item.assignedTo === userProfile.id || item.assignedTo === 'team';
    }
  };
  // Create the context value object
  const contextValue: CalendarContextType = {
    // Event methods
    getEvents,
    getEventsForDate,
    getEventById,
    addEvent,
    updateEvent,
    deleteEvent,
    // Task completion methods
    toggleTaskCompletion,
    isTaskCompleted,
    // Shift methods
    getShifts,
    getShiftsForDate,
    getShiftById,
    getUpcomingShifts,
    getMyShifts,
    addShift,
    updateShift,
    deleteShift,
    claimShift,
    startShift,
    completeShift,
    // Coverage gap methods
    getCoverageGaps,
    getCoverageGapsForDate,
    resolveCoverageGap,
    // Role-based filtering
    isVisibleToCurrentUser,
    // View preferences
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate
  };
  return <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>;
};
// Custom hook to use the calendar context
export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};