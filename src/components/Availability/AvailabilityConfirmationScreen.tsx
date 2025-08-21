import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, CalendarIcon, InfoIcon, AlertTriangleIcon } from 'lucide-react';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { availabilityService } from '../../services/AvailabilityService';
import { shiftService } from '../../services/ShiftService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { storage } from '../../services/StorageService';
interface AvailabilityConfirmationScreenProps {
  onBack: () => void;
}
export const AvailabilityConfirmationScreen: React.FC<AvailabilityConfirmationScreenProps> = ({
  onBack
}) => {
  const [userId] = useState(storage.get('user_id', ''));
  const [hasConflicts, setHasConflicts] = useState(false);
  const [conflictCount, setConflictCount] = useState(0);
  useEffect(() => {
    // Check for conflicts between availability and shifts
    checkForConflicts();
    // Track screen view
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_confirmation_opened'
    });
  }, []);
  // Check for conflicts between unavailable dates and scheduled shifts
  const checkForConflicts = () => {
    if (!userId) return;
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = nextMonth.toISOString().split('T')[0];
    // Get availability for the next month
    const availabilityData = availabilityService.getAvailabilityRange(userId, startDateStr, endDateStr);
    // Get shifts for the next month
    const shifts = shiftService.getShifts();
    const userShifts = shifts.filter(shift => shift.assignedTo === userId && shift.date >= startDateStr && shift.date <= endDateStr && shift.status !== 'completed');
    // Check for dates marked as unavailable that have scheduled shifts
    let conflicts = 0;
    userShifts.forEach(shift => {
      if (availabilityData[shift.date] === 'unavailable') {
        conflicts++;
      }
    });
    setHasConflicts(conflicts > 0);
    setConflictCount(conflicts);
  };
  // Handle availability change
  const handleAvailabilityChange = (date: string, status: string) => {
    // Re-check for conflicts after any change
    setTimeout(checkForConflicts, 100);
  };
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2" aria-label="Go back">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Confirm Availability</h1>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Info card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <InfoIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-medium text-blue-800 mb-1">
                Confirm Your Availability
              </h2>
              <p className="text-sm text-blue-700">
                Please review and update your availability for the upcoming
                period. This helps us ensure proper coverage and schedule
                coordination.
              </p>
            </div>
          </div>
        </div>
        {/* Conflicts warning */}
        {hasConflicts && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <AlertTriangleIcon className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-medium text-yellow-800 mb-1">
                  Schedule Conflicts Detected
                </h2>
                <p className="text-sm text-yellow-700">
                  You have {conflictCount} scheduled shift
                  {conflictCount !== 1 ? 's' : ''} on days you've marked as
                  unavailable. Please review your schedule or update your
                  availability.
                </p>
              </div>
            </div>
          </div>}
        {/* Calendar */}
        <AvailabilityCalendar userId={userId} onAvailabilityChange={handleAvailabilityChange} />
        {/* Legend */}
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium mb-2">Status Legend</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
              <span className="text-sm">Tentative</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};