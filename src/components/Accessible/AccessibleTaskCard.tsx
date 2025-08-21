import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  AlertTriangleIcon, 
  UserIcon,
  CalendarIcon,
  FlagIcon
} from 'lucide-react';

interface AccessibleTaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueTime: string;
    dueDate: string;
    assignedTo: string;
    hasConflict: boolean;
  };
  onComplete: (taskId: string) => void;
  onClick: () => void;
  isCompleted: boolean;
}

export const AccessibleTaskCard: React.FC<AccessibleTaskCardProps> = ({
  task,
  onComplete,
  onClick,
  isCompleted
}) => {
  // Get priority styling with semantic meaning
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'border-red-200 bg-red-50',
          icon: <FlagIcon className="w-4 h-4 text-red-600" />,
          label: 'High priority',
          description: 'Urgent task requiring immediate attention'
        };
      case 'medium':
        return {
          color: 'border-yellow-200 bg-yellow-50',
          icon: <FlagIcon className="w-4 h-4 text-yellow-600" />,
          label: 'Medium priority',
          description: 'Important task to complete today'
        };
      case 'low':
        return {
          color: 'border-green-200 bg-green-50',
          icon: <FlagIcon className="w-4 h-4 text-green-600" />,
          label: 'Low priority',
          description: 'Task can be completed when convenient'
        };
      default:
        return {
          color: 'border-gray-200 bg-gray-50',
          icon: <FlagIcon className="w-4 h-4 text-gray-600" />,
          label: 'Normal priority',
          description: 'Standard task'
        };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);

  // Get status configuration with multiple indicators
  const getStatusConfig = () => {
    if (isCompleted) {
      return {
        color: 'border-green-300 bg-green-50',
        icon: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
        label: 'Completed',
        description: 'This task has been completed'
      };
    } else if (task.hasConflict) {
      return {
        color: 'border-orange-300 bg-orange-50',
        icon: <AlertTriangleIcon className="w-5 h-5 text-orange-600" />,
        label: 'Has conflict',
        description: 'This task conflicts with another scheduled item'
      };
    } else {
      return {
        color: 'border-blue-200 bg-blue-50',
        icon: <ClockIcon className="w-5 h-5 text-blue-600" />,
        label: 'Pending',
        description: 'This task is waiting to be completed'
      };
    }
  };

  const statusConfig = getStatusConfig();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle Enter and Space for card activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const handleCompleteKeyDown = (event: React.KeyboardEvent) => {
    // Handle Enter and Space for completion toggle
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onComplete(task.id);
    }
  };

  return (
    <article
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
        ${statusConfig.color}
      `}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-labelledby={`task-title-${task.id}`}
      aria-describedby={`task-details-${task.id}`}
    >
      {/* Task header with status and priority indicators */}
      <header className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 
            id={`task-title-${task.id}`}
            className={`font-medium text-lg leading-tight ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}
          >
            {task.title}
          </h3>
          
          {/* Visual and semantic status indicators */}
          <div className="flex items-center mt-2 space-x-3">
            {/* Status indicator with icon and text */}
            <div className="flex items-center" aria-label={statusConfig.description}>
              {statusConfig.icon}
              <span className="ml-1 text-sm font-medium">
                {statusConfig.label}
              </span>
            </div>
            
            {/* Priority indicator with icon and text */}
            <div className="flex items-center" aria-label={priorityConfig.description}>
              {priorityConfig.icon}
              <span className="ml-1 text-sm font-medium">
                {priorityConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Completion toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete(task.id);
          }}
          onKeyDown={handleCompleteKeyDown}
          className={`
            ml-4 p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isCompleted 
              ? 'bg-green-100 text-green-600 focus:ring-green-500 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-600 focus:ring-blue-500 hover:bg-gray-200'
            }
          `}
          aria-label={isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'}
          aria-pressed={isCompleted}
        >
          <CheckCircleIcon className="w-5 h-5" />
        </button>
      </header>

      {/* Task details */}
      <div id={`task-details-${task.id}`} className="space-y-2">
        {task.description && (
          <p className={`text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
            {task.description}
          </p>
        )}

        {/* Task metadata with semantic structure */}
        <dl className="flex flex-wrap items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            <dt className="sr-only">Due time:</dt>
            <ClockIcon className="w-4 h-4 mr-1" aria-hidden="true" />
            <dd>{task.dueTime}</dd>
          </div>
          
          <div className="flex items-center">
            <dt className="sr-only">Due date:</dt>
            <CalendarIcon className="w-4 h-4 mr-1" aria-hidden="true" />
            <dd>{new Date(task.dueDate).toLocaleDateString()}</dd>
          </div>
          
          <div className="flex items-center">
            <dt className="sr-only">Assigned to:</dt>
            <UserIcon className="w-4 h-4 mr-1" aria-hidden="true" />
            <dd>{task.assignedTo}</dd>
          </div>
        </dl>

        {/* Conflict warning with clear messaging */}
        {task.hasConflict && (
          <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded-lg" role="alert">
            <div className="flex items-start">
              <AlertTriangleIcon className="w-4 h-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800">Schedule Conflict</p>
                <p className="text-xs text-orange-700">
                  This task conflicts with another scheduled activity. Tap to resolve.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden content for screen readers */}
      <div className="sr-only">
        Task {isCompleted ? 'completed' : 'pending'}. 
        Priority: {task.priority}. 
        {task.hasConflict ? 'Has scheduling conflict. ' : ''}
        Press Enter or Space to view details.
      </div>
    </article>
  );
};