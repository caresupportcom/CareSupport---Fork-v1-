import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
export const ConflictTag = ({
  small = false
}) => {
  return <div className={`flex items-center ${small ? 'px-1 py-0.5 text-xs' : 'px-2 py-1 text-sm'} bg-orange-100 text-orange-800 rounded-full`}>
      <AlertTriangleIcon className={`${small ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
      <span className="font-medium">
        {small ? 'Conflict' : 'Schedule Conflict'}
      </span>
    </div>;
};