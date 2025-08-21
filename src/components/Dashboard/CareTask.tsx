import React from 'react';
import { AlertTriangleIcon, CheckCircleIcon, ClockIcon, UserIcon } from 'lucide-react';
export const CareTask = ({
  task,
  onClick,
  children,
  className = ''
}) => {
  const isCompleted = task.status === 'completed';
  return <div className={`p-4 cursor-pointer transition-transform hover:scale-[1.01] ${className}`} onClick={onClick}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className={`font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          {task.description && <p className={`text-sm mt-1 ${isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center text-xs text-gray-500">
          {task.assignedTo && <div className="flex items-center mr-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-1">
                <span className="text-[10px] text-blue-600 font-medium">
                  {task.assignedToName ? task.assignedToName.charAt(0).toUpperCase() : task.assignedTo.charAt(0).toUpperCase()}
                </span>
              </div>
              <span>{task.assignedToName || task.assignedTo}</span>
            </div>}
          {isCompleted && <div className="flex items-center text-green-600 mr-3">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              <span>Completed</span>
            </div>}
        </div>
        {children}
      </div>
    </div>;
};