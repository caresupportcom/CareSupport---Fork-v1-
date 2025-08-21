import React from 'react';
import { ClockIcon } from 'lucide-react';
export const GapTag = ({
  small = false
}) => {
  return <div className={`flex items-center ${small ? 'px-1 py-0.5 text-xs' : 'px-2 py-1 text-sm'} bg-purple-100 text-purple-800 rounded-full`}>
      <ClockIcon className={`${small ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
      <span className="font-medium">{small ? 'Gap' : 'Care Gap'}</span>
    </div>;
};