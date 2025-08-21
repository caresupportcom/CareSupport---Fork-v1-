import React from 'react';
import { CareShift, CoverageGap } from '../../../types/ScheduleTypes';
import { CaregiverLane } from './CaregiverLane';
import { TimeHeader } from './TimeHeader';
import { CoverageGapIndicator } from './CoverageGapIndicator';
interface ShiftsGridProps {
  shifts: CareShift[];
  coverageGaps: CoverageGap[];
  teamMembers: any[];
  onShiftClick: (shift: CareShift) => void;
  onGapClick: (gap: CoverageGap) => void;
  startHour?: number;
  endHour?: number;
}
export const ShiftsGrid: React.FC<ShiftsGridProps> = ({
  shifts,
  coverageGaps,
  teamMembers,
  onShiftClick,
  onGapClick,
  startHour = 6,
  // Default start at 6 AM
  endHour = 22 // Default end at 10 PM
}) => {
  // Group shifts by caregiver
  const shiftsByCaregiver = {};
  // Add an "Unassigned" lane for open shifts
  shiftsByCaregiver['unassigned'] = shifts.filter(shift => !shift.assignedTo);
  // Group the rest by caregiver ID
  teamMembers.forEach(member => {
    shiftsByCaregiver[member.id] = shifts.filter(shift => shift.assignedTo === member.id);
  });
  // Calculate grid dimensions
  const hourWidth = 120; // pixels per hour
  const gridWidth = (endHour - startHour) * hourWidth;
  const totalHours = endHour - startHour;
  // Convert time string (HH:MM) to position on grid
  const timeToPosition = timeString => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const hourPosition = hours - startHour;
    const minutePosition = minutes / 60;
    return (hourPosition + minutePosition) * hourWidth;
  };
  return <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Time header showing hours */}
      <TimeHeader startHour={startHour} endHour={endHour} hourWidth={hourWidth} />
      {/* Caregiver lanes */}
      <div className="relative">
        {/* Unassigned lane first */}
        <CaregiverLane key="unassigned" name="Unassigned" initial="U" color="gray" shifts={shiftsByCaregiver['unassigned']} timeToPosition={timeToPosition} gridWidth={gridWidth} onShiftClick={onShiftClick} />
        {/* Then lanes for each caregiver */}
        {teamMembers.map(member => <CaregiverLane key={member.id} name={member.name} initial={member.initial} color={member.color || 'blue'} shifts={shiftsByCaregiver[member.id] || []} timeToPosition={timeToPosition} gridWidth={gridWidth} onShiftClick={onShiftClick} />)}
      </div>
      {/* Coverage gap indicators */}
      <div className="absolute top-10 left-0 right-0">
        {coverageGaps.map(gap => <CoverageGapIndicator key={gap.id} gap={gap} timeToPosition={timeToPosition} onGapClick={onGapClick} totalHours={totalHours} hourWidth={hourWidth} />)}
      </div>
    </div>;
};