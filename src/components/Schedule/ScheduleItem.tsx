import React from 'react';
import { ClockIcon, UserIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { ConflictTag } from '../Common/ConflictTag';
import { GapTag } from '../Common/GapTag';
export const ScheduleItem = ({
  item,
  onClick
}) => {
  // Get category styling
  const getCategoryStyle = category => {
    switch (category) {
      case 'medication':
        return 'border-blue-300 bg-blue-50';
      case 'appointment':
        return 'border-purple-300 bg-purple-50';
      case 'therapy':
        return 'border-green-300 bg-green-50';
      case 'meal':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-gray-200';
    }
  };
  return <div className={`p-4 rounded-xl border ${item.hasConflict ? 'border-orange-300 bg-orange-50' : item.hasGap ? 'border-purple-300 bg-purple-50' : getCategoryStyle(item.category)} cursor-pointer transition-transform hover:scale-[1.01]`} onClick={() => onClick(item)}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 text-gray-500 mr-1" />
            <BracketText className="font-medium text-gray-900">
              {item.time} ({item.duration} min)
            </BracketText>
          </div>
          <h3 className="font-medium mt-1">{item.title}</h3>
          {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
        </div>
        {item.hasConflict && <ConflictTag />}
        {item.hasGap && <GapTag />}
      </div>
      <div className="flex items-center mt-2">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
          <span className="text-xs text-blue-600 font-medium">
            {item.assignedTo.charAt(0)}
          </span>
        </div>
        <BracketText className="text-xs text-gray-500">
          Assigned to {item.assignedTo}
        </BracketText>
      </div>
    </div>;
};