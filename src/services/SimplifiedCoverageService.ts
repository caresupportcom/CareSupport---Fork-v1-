import { storage } from './StorageService';
import { shiftService } from './ShiftService';
import { simplifiedAvailabilityService } from './SimplifiedAvailabilityService';
import { analytics, AnalyticsEvents } from './AnalyticsService';
import { notificationService } from './NotificationService';
import { SimplifiedCoverageGap, CoverageMetrics, CareShift } from '../types/ScheduleTypes';

/**
 * Simplified Coverage Service for MVP
 * Focuses on gap identification and basic coordination
 */
class SimplifiedCoverageService {
  private storageKeys = {
    coverageGaps: 'coverage_gaps_v2',
    coverageRequests: 'coverage_requests_v2'
  };

  // Initialize with sample data
  public initializeData() {
    const existingGaps = storage.get(this.storageKeys.coverageGaps, null);
    
    if (!existingGaps) {
      storage.save(this.storageKeys.coverageGaps, this.generateSampleGaps());
    }
  }

  // Generate sample coverage gaps for demo
  private generateSampleGaps(): SimplifiedCoverageGap[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return [
      {
        id: 'gap-critical-1',
        date: today.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '18:00',
        priority: 'critical',
        suggestedCaregivers: ['robert', 'linda'],
        requestsSent: [],
        status: 'open',
        identifiedAt: new Date().toISOString()
      },
      {
        id: 'gap-moderate-1',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '22:00',
        endTime: '06:00',
        priority: 'moderate',
        suggestedCaregivers: ['james'],
        requestsSent: [],
        status: 'open',
        identifiedAt: new Date().toISOString()
      }
    ];
  }

  // Get all coverage gaps
  public getCoverageGaps(): SimplifiedCoverageGap[] {
    return storage.get(this.storageKeys.coverageGaps, []);
  }

  // Get coverage gaps for specific date
  public getCoverageGapsForDate(date: string): SimplifiedCoverageGap[] {
    const gaps = this.getCoverageGaps();
    return gaps.filter(gap => gap.date === date);
  }

  // Get critical coverage gaps (priority focus for MVP)
  public getCriticalGaps(): SimplifiedCoverageGap[] {
    const gaps = this.getCoverageGaps();
    return gaps.filter(gap => gap.priority === 'critical' && gap.status === 'open');
  }

  // Calculate coverage metrics for dashboard
  public calculateCoverageMetrics(startDate: string, endDate: string): CoverageMetrics {
    // Get all shifts in date range
    const shifts = this.getShiftsInRange(startDate, endDate);
    
    // Get all gaps in date range
    const gaps = this.getCoverageGaps().filter(gap => 
      gap.date >= startDate && gap.date <= endDate
    );

    // Calculate basic metrics
    const totalShifts = shifts.length;
    const confirmedShifts = shifts.filter(shift => 
      shift.assignedTo && shift.status === 'scheduled'
    ).length;
    const tentativeShifts = shifts.filter(shift => 
      shift.assignedTo && shift.status === 'tentative'
    ).length;
    const openShifts = shifts.filter(shift => !shift.assignedTo).length;

    // Calculate hours (simplified)
    const totalHours = this.calculateTotalHours(shifts);
    const coveredHours = this.calculateCoveredHours(shifts);
    const coveragePercentage = totalHours > 0 ? Math.round((coveredHours / totalHours) * 100) : 0;

    // Count gaps by priority
    const criticalGaps = gaps.filter(gap => gap.priority === 'critical').length;
    const moderateGaps = gaps.filter(gap => gap.priority === 'moderate').length;

    return {
      totalHours,
      coveredHours,
      coveragePercentage,
      criticalGaps,
      moderateGaps,
      confirmedShifts,
      tentativeShifts,
      openShifts
    };
  }

  // Get shifts in date range
  private getShiftsInRange(startDate: string, endDate: string): CareShift[] {
    const allShifts = shiftService.getShifts();
    return allShifts.filter(shift => shift.date >= startDate && shift.date <= endDate);
  }

  // Calculate total hours from shifts
  private calculateTotalHours(shifts: CareShift[]): number {
    let totalMinutes = 0;
    
    shifts.forEach(shift => {
      const startMinutes = this.timeToMinutes(shift.startTime);
      const endMinutes = this.timeToMinutes(shift.endTime);
      
      // Handle overnight shifts
      if (endMinutes < startMinutes) {
        totalMinutes += (24 * 60) - startMinutes + endMinutes;
      } else {
        totalMinutes += endMinutes - startMinutes;
      }
    });
    
    return Math.round(totalMinutes / 60);
  }

  // Calculate covered hours (shifts with assigned caregivers)
  private calculateCoveredHours(shifts: CareShift[]): number {
    const coveredShifts = shifts.filter(shift => shift.assignedTo);
    return this.calculateTotalHours(coveredShifts);
  }

  // Convert time string to minutes since midnight
  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Identify coverage gaps for a date range
  public identifyCoverageGaps(startDate: string, endDate: string): SimplifiedCoverageGap[] {
    const newGaps: SimplifiedCoverageGap[] = [];
    
    // Iterate through each date in range
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayGaps = this.identifyGapsForDate(dateStr);
      newGaps.push(...dayGaps);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Save newly identified gaps
    if (newGaps.length > 0) {
      const existingGaps = this.getCoverageGaps();
      const allGaps = [...existingGaps, ...newGaps];
      storage.save(this.storageKeys.coverageGaps, allGaps);
    }
    
    return newGaps;
  }

  // Identify gaps for a specific date
  private identifyGapsForDate(date: string): SimplifiedCoverageGap[] {
    const gaps: SimplifiedCoverageGap[] = [];
    const shifts = shiftService.getShiftsForDate(date);
    
    // Define required coverage periods (simplified for MVP)
    const requiredPeriods = [
      { start: '06:00', end: '14:00', name: 'morning' },
      { start: '14:00', end: '22:00', name: 'afternoon' },
      { start: '22:00', end: '06:00', name: 'overnight' }
    ];
    
    requiredPeriods.forEach(period => {
      const hasAssignedCoverage = shifts.some(shift => 
        this.timePeriodsOverlap(shift.startTime, shift.endTime, period.start, period.end) &&
        shift.assignedTo !== null
      );
      
      if (!hasAssignedCoverage) {
        // Determine priority based on time of day
        const priority = period.name === 'overnight' ? 'moderate' : 'critical';
        
        // Get suggested caregivers
        const suggestedCaregivers = simplifiedAvailabilityService.getAvailableCaregivers(
          date, 
          period.start, 
          period.end
        );
        
        gaps.push({
          id: `gap-${date}-${period.name}`,
          date,
          startTime: period.start,
          endTime: period.end,
          priority,
          suggestedCaregivers,
          requestsSent: [],
          status: 'open',
          identifiedAt: new Date().toISOString()
        });
      }
    });
    
    return gaps;
  }

  // Check if two time periods overlap
  private timePeriodsOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const start1Min = this.timeToMinutes(start1);
    const end1Min = this.timeToMinutes(end1);
    const start2Min = this.timeToMinutes(start2);
    const end2Min = this.timeToMinutes(end2);
    
    // Handle overnight periods
    const overnight1 = end1Min < start1Min;
    const overnight2 = end2Min < start2Min;
    
    if (overnight1 && overnight2) {
      return true; // Both overnight, assume overlap
    } else if (overnight1) {
      return start2Min < end1Min || start1Min < end2Min;
    } else if (overnight2) {
      return start1Min < end2Min || start2Min < end1Min;
    } else {
      return start1Min < end2Min && start2Min < end1Min;
    }
  }

  // Request coverage for a specific gap
  public requestCoverageForGap(gapId: string, caregiverIds: string[], message?: string): void {
    const gaps = this.getCoverageGaps();
    const gap = gaps.find(g => g.id === gapId);
    
    if (!gap) return;
    
    // Update gap status
    const updatedGaps = gaps.map(g => 
      g.id === gapId 
        ? { ...g, status: 'pending_responses' as const, requestsSent: caregiverIds }
        : g
    );
    
    storage.save(this.storageKeys.coverageGaps, updatedGaps);
    
    // Send availability requests
    simplifiedAvailabilityService.requestAvailability(
      caregiverIds,
      gap.date,
      gap.startTime,
      gap.endTime,
      message
    );
    
    // Track request
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_requested',
      gap_id: gapId,
      caregiver_count: caregiverIds.length,
      gap_priority: gap.priority
    });
  }

  // Resolve a coverage gap (mark as filled)
  public resolveGap(gapId: string): void {
    const gaps = this.getCoverageGaps();
    const updatedGaps = gaps.map(gap => 
      gap.id === gapId 
        ? { ...gap, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
        : gap
    );
    
    storage.save(this.storageKeys.coverageGaps, updatedGaps);
    
    // Track resolution
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_gap_resolved',
      gap_id: gapId
    });
  }

  // Get coverage status summary for quick overview
  public getCoverageStatusSummary(date: string): {
    totalPeriods: number;
    coveredPeriods: number;
    gapCount: number;
    criticalGapCount: number;
  } {
    const shifts = shiftService.getShiftsForDate(date);
    const gaps = this.getCoverageGapsForDate(date);
    
    const totalPeriods = 3; // morning, afternoon, overnight
    const gapCount = gaps.length;
    const criticalGapCount = gaps.filter(gap => gap.priority === 'critical').length;
    const coveredPeriods = totalPeriods - gapCount;
    
    return {
      totalPeriods,
      coveredPeriods,
      gapCount,
      criticalGapCount
    };
  }
}

// Export singleton instance
export const simplifiedCoverageService = new SimplifiedCoverageService();