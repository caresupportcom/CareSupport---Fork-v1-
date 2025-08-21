import React from 'react';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from 'lucide-react';
import { AvailabilityStatus } from '../../../types/ScheduleTypes';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';

interface QuickStatusToggleProps {
  currentStatus: AvailabilityStatus;
  onStatusChange: (status: AvailabilityStatus) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const QuickStatusToggle: React.FC<QuickStatusToggleProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  size = 'medium'
}) => {
  const handleStatusChange = (status: AvailabilityStatus) => {
    if (disabled) return;
    
    onStatusChange(status);
    
    // Track status change
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'quick_status_toggle',
      previous_status: currentStatus,
      new_status: status
    });
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'gap-2',
          button: 'px-3 py-2 text-sm',
          icon: 'w-4 h-4'
        };
      case 'large':
        return {
          container: 'gap-4',
          button: 'px-6 py-4 text-lg',
          icon: 'w-6 h-6'
        };
      default:
        return {
          container: 'gap-3',
          button: 'px-4 py-3 text-base',
          icon: 'w-5 h-5'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Status configurations using OKLCH color system
  const statusConfigs = {
    available: {
      icon: <CheckCircleIcon className={sizeClasses.icon} />,
      label: 'Available',
      description: 'Ready for shifts',
      bgClass: 'bg-cs-covered-confirmed',
      textClass: 'text-cs-text-on-dark',
      borderClass: 'border-cs-covered-confirmed',
      hoverClass: 'hover:bg-cs-covered-confirmed/90'
    },
    tentative: {
      icon: <ClockIcon className={sizeClasses.icon} />,
      label: 'Tentative',
      description: 'May be available',
      bgClass: 'bg-cs-maybe-available',
      textClass: 'text-cs-text-primary',
      borderClass: 'border-cs-maybe-available',
      hoverClass: 'hover:bg-cs-maybe-available/90'
    },
    unavailable: {
      icon: <XCircleIcon className={sizeClasses.icon} />,
      label: 'Unavailable',
      description: 'Not available',
      bgClass: 'bg-cs-gap-critical',
      textClass: 'text-cs-text-on-dark',
      borderClass: 'border-cs-gap-critical',
      hoverClass: 'hover:bg-cs-gap-critical/90'
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-cs-text-primary">
          Current Availability Status
        </h3>
        <p className="text-xs text-cs-text-secondary">
          Let your team know when you're available for shifts
        </p>
      </div>
      
      <div 
        className={`grid grid-cols-1 sm:grid-cols-3 ${sizeClasses.container}`}
        role="radiogroup"
        aria-label="Availability status"
      >
        {(Object.keys(statusConfigs) as AvailabilityStatus[]).map((status) => {
          const config = statusConfigs[status];
          const isSelected = currentStatus === status;
          
          return (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={disabled}
              className={`
                ${sizeClasses.button}
                rounded-lg border-2 font-medium
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-cs-interactive-primary focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected 
                  ? `${config.bgClass} ${config.textClass} ${config.borderClass}` 
                  : `bg-cs-bg-card text-cs-text-secondary border-cs-gray-300 hover:border-cs-gray-400`
                }
                ${!disabled && !isSelected ? config.hoverClass : ''}
              `}
              role="radio"
              aria-checked={isSelected}
              aria-describedby={`status-${status}-description`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center justify-center">
                  {config.icon}
                </div>
                <div className="text-center">
                  <div className="font-medium">{config.label}</div>
                  <div 
                    id={`status-${status}-description`}
                    className={`text-xs ${isSelected ? 'opacity-90' : 'opacity-70'}`}
                  >
                    {config.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Status explanation */}
      <div className="mt-4 p-3 bg-cs-bg-card rounded-lg border border-cs-gray-200">
        <div className="text-xs text-cs-text-secondary">
          <strong className="text-cs-text-primary">
            {statusConfigs[currentStatus].label}:
          </strong>{' '}
          {currentStatus === 'available' && 
            'You can be assigned to new shifts and will appear in available caregiver lists.'
          }
          {currentStatus === 'tentative' && 
            'You may be contacted for urgent shifts, but coordinators will confirm before assigning.'
          }
          {currentStatus === 'unavailable' && 
            'You will not be assigned new shifts until your status changes.'
          }
        </div>
      </div>
    </div>
  );
};