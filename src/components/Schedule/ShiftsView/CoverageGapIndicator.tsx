import React from 'react';
import { CoverageGap } from '../../../types/ScheduleTypes';
import { AlertTriangleIcon } from 'lucide-react';
interface CoverageGapIndicatorProps {
  gap: CoverageGap;
  timeToPosition: (time: string) => number;
  onGapClick: (gap: CoverageGap) => void;
  totalHours: number;
  hourWidth: number;
}
export const CoverageGapIndicator: React.FC<CoverageGapIndicatorProps> = ({
  gap,
  timeToPosition,
  onGapClick,
  totalHours,
  hourWidth
}) => {
  // Calculate position and width
  const left = timeToPosition(gap.startTime);
  const right = timeToPosition(gap.endTime);
  const width = right - left;
  return <div className={`absolute h-6 flex items-center justify-center cursor-pointer ${gap.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'} border-2 ${gap.priority === 'high' ? 'border-red-400' : 'border-yellow-400'} rounded-lg`} style={{
    left: left + 32,
    width: width,
    top: 0
  }} onClick={() => onGapClick(gap)}>
      <AlertTriangleIcon className={`w-4 h-4 ${gap.priority === 'high' ? 'text-red-500' : 'text-yellow-500'} mr-1`} />
      <span className={`text-xs font-medium ${gap.priority === 'high' ? 'text-red-700' : 'text-yellow-700'}`}>
        Coverage Gap
      </span>
    </div>;
};