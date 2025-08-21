import React from 'react';
import { ShiftBlock } from './ShiftBlock';
import { CareShift } from '../../../types/ScheduleTypes';
interface CaregiverLaneProps {
  name: string;
  initial: string;
  color: string;
  shifts: CareShift[];
  timeToPosition: (time: string) => number;
  gridWidth: number;
  onShiftClick: (shift: CareShift) => void;
}
export const CaregiverLane: React.FC<CaregiverLaneProps> = ({
  name,
  initial,
  color,
  shifts,
  timeToPosition,
  gridWidth,
  onShiftClick
}) => {
  return <div className="flex h-20 border-b border-gray-200 relative">
      {/* Caregiver info */}
      <div className="w-32 min-w-[8rem] border-r border-gray-200 bg-gray-50 flex items-center p-2">
        <div className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center mr-2`}>
          <span className={`text-sm font-medium text-${color}-600`}>
            {initial}
          </span>
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium truncate">{name}</p>
        </div>
      </div>
      {/* Shifts area */}
      <div className="flex-1 relative" style={{
      minWidth: gridWidth
    }}>
        {/* Hour grid lines */}
        <div className="absolute inset-0 grid grid-cols-16" style={{
        gridTemplateColumns: `repeat(${gridWidth / 120}, 120px)`
      }}>
          {Array.from({
          length: gridWidth / 120
        }).map((_, i) => <div key={i} className="h-full border-r border-gray-100"></div>)}
        </div>
        {/* Shift blocks */}
        {shifts.map(shift => <ShiftBlock key={shift.id} shift={shift} timeToPosition={timeToPosition} onClick={() => onShiftClick(shift)} />)}
      </div>
    </div>;
};