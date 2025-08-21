import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { simplifiedAvailabilityService } from '../services/SimplifiedAvailabilityService';
import { simplifiedCoverageService } from '../services/SimplifiedCoverageService';
import { shiftService } from '../services/ShiftService';
import { dataService } from '../services/DataService';
import { storage } from '../services/StorageService';
import { 
  UserAvailability, 
  AvailabilityStatus, 
  SimplifiedCoverageGap, 
  CoverageMetrics,
  CareShift,
  WeeklyAvailabilityPattern 
} from '../types/ScheduleTypes';

// Context type definition
interface SimplifiedScheduleContextType {
  // Availability Management
  userAvailability: UserAvailability | null;
  updateAvailabilityStatus: (status: AvailabilityStatus) => void;
  setDateAvailability: (date: string, status: AvailabilityStatus) => void;
  getDateAvailability: (date: string) => AvailabilityStatus;
  updateWeeklyPattern: (pattern: WeeklyAvailabilityPattern) => void;
  bulkUpdateDates: (dates: string[], status: AvailabilityStatus) => void;
  
  // Coverage Management
  coverageGaps: SimplifiedCoverageGap[];
  coverageMetrics: CoverageMetrics | null;
  shifts: CareShift[];
  refreshCoverage: () => void;
  getCoverageStatusSummary: (date: string) => any;
  
  // Coordination
  requestCoverageForGap: (gapId: string, caregiverIds: string[], message?: string) => void;
  resolveGap: (gapId: string) => void;
  getAvailableCaregivers: (date: string, startTime: string, endTime: string) => string[];
  
  // UI State
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  viewMode: 'overview' | 'availability' | 'coordination';
  setViewMode: (mode: 'overview' | 'availability' | 'coordination') => void;
  isLoading: boolean;
  
  // Team data
  teamMembers: any[];
}

// Create context
const SimplifiedScheduleContext = createContext<SimplifiedScheduleContextType | undefined>(undefined);

// Provider component
export const SimplifiedScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State management
  const [userAvailability, setUserAvailability] = useState<UserAvailability | null>(null);
  const [coverageGaps, setCoverageGaps] = useState<SimplifiedCoverageGap[]>([]);
  const [coverageMetrics, setCoverageMetrics] = useState<CoverageMetrics | null>(null);
  const [shifts, setShifts] = useState<CareShift[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'overview' | 'availability' | 'coordination'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Get current user ID
  const userId = storage.get('user_id', 'user-default');

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, [userId]);

  // Refresh data when selected date changes
  useEffect(() => {
    if (!isLoading) {
      refreshCoverage();
    }
  }, [selectedDate]);

  // Initialize all data
  const initializeData = async () => {
    setIsLoading(true);
    
    try {
      // Initialize services
      simplifiedAvailabilityService.initializeData();
      simplifiedCoverageService.initializeData();
      
      // Load user availability
      const availability = simplifiedAvailabilityService.getUserAvailability(userId);
      setUserAvailability(availability);
      
      // Load team members
      const members = dataService.getTeamMembers();
      setTeamMembers(members);
      
      // Load initial coverage data
      await refreshCoverageData();
      
    } catch (error) {
      console.error('Error initializing schedule data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh coverage data
  const refreshCoverageData = async () => {
    // Calculate date range (current week)
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startDateStr = startOfWeek.toISOString().split('T')[0];
    const endDateStr = endOfWeek.toISOString().split('T')[0];
    
    // Load coverage gaps
    const gaps = simplifiedCoverageService.getCoverageGaps();
    setCoverageGaps(gaps);
    
    // Load shifts
    const weekShifts = shiftService.getShifts().filter(shift => 
      shift.date >= startDateStr && shift.date <= endDateStr
    );
    setShifts(weekShifts);
    
    // Calculate metrics
    const metrics = simplifiedCoverageService.calculateCoverageMetrics(startDateStr, endDateStr);
    setCoverageMetrics(metrics);
    
    // Identify new gaps
    simplifiedCoverageService.identifyCoverageGaps(startDateStr, endDateStr);
  };

  // Update availability status
  const updateAvailabilityStatus = (status: AvailabilityStatus) => {
    simplifiedAvailabilityService.updateAvailabilityStatus(userId, status);
    
    // Update local state
    if (userAvailability) {
      setUserAvailability({
        ...userAvailability,
        status,
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Refresh coverage to reflect changes
    refreshCoverageData();
  };

  // Set availability for specific date
  const setDateAvailability = (date: string, status: AvailabilityStatus) => {
    simplifiedAvailabilityService.setDateAvailability(userId, date, status);
    
    // Update local state
    if (userAvailability) {
      setUserAvailability({
        ...userAvailability,
        dateOverrides: {
          ...userAvailability.dateOverrides,
          [date]: status
        },
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Refresh coverage
    refreshCoverageData();
  };

  // Get availability for specific date
  const getDateAvailability = (date: string): AvailabilityStatus => {
    return simplifiedAvailabilityService.getDateAvailability(userId, date);
  };

  // Update weekly pattern
  const updateWeeklyPattern = (pattern: WeeklyAvailabilityPattern) => {
    simplifiedAvailabilityService.updateWeeklyPattern(userId, pattern);
    
    // Update local state
    if (userAvailability) {
      setUserAvailability({
        ...userAvailability,
        recurringPattern: pattern,
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Refresh coverage
    refreshCoverageData();
  };

  // Bulk update multiple dates
  const bulkUpdateDates = (dates: string[], status: AvailabilityStatus) => {
    simplifiedAvailabilityService.bulkUpdateDates(userId, dates, status);
    
    // Update local state
    if (userAvailability) {
      const updatedOverrides = { ...userAvailability.dateOverrides };
      dates.forEach(date => {
        updatedOverrides[date] = status;
      });
      
      setUserAvailability({
        ...userAvailability,
        dateOverrides: updatedOverrides,
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Refresh coverage
    refreshCoverageData();
  };

  // Request coverage for gap
  const requestCoverageForGap = (gapId: string, caregiverIds: string[], message?: string) => {
    simplifiedCoverageService.requestCoverageForGap(gapId, caregiverIds, message);
    
    // Update local state
    const updatedGaps = coverageGaps.map(gap => 
      gap.id === gapId 
        ? { ...gap, status: 'pending_responses' as const, requestsSent: caregiverIds }
        : gap
    );
    setCoverageGaps(updatedGaps);
  };

  // Resolve gap
  const resolveGap = (gapId: string) => {
    simplifiedCoverageService.resolveGap(gapId);
    
    // Update local state
    const updatedGaps = coverageGaps.map(gap => 
      gap.id === gapId 
        ? { ...gap, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
        : gap
    );
    setCoverageGaps(updatedGaps);
  };

  // Get available caregivers for time slot
  const getAvailableCaregivers = (date: string, startTime: string, endTime: string): string[] => {
    return simplifiedAvailabilityService.getAvailableCaregivers(date, startTime, endTime);
  };

  // Get coverage status summary
  const getCoverageStatusSummary = (date: string) => {
    return simplifiedCoverageService.getCoverageStatusSummary(date);
  };

  // Refresh coverage (public method)
  const refreshCoverage = () => {
    refreshCoverageData();
  };

  // Context value
  const contextValue: SimplifiedScheduleContextType = {
    // Availability Management
    userAvailability,
    updateAvailabilityStatus,
    setDateAvailability,
    getDateAvailability,
    updateWeeklyPattern,
    bulkUpdateDates,
    
    // Coverage Management
    coverageGaps,
    coverageMetrics,
    shifts,
    refreshCoverage,
    getCoverageStatusSummary,
    
    // Coordination
    requestCoverageForGap,
    resolveGap,
    getAvailableCaregivers,
    
    // UI State
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    isLoading,
    
    // Team data
    teamMembers
  };

  return (
    <SimplifiedScheduleContext.Provider value={contextValue}>
      {children}
    </SimplifiedScheduleContext.Provider>
  );
};

// Custom hook to use the context
export const useSimplifiedSchedule = () => {
  const context = useContext(SimplifiedScheduleContext);
  if (context === undefined) {
    throw new Error('useSimplifiedSchedule must be used within a SimplifiedScheduleProvider');
  }
  return context;
};