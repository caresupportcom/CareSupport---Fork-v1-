import React, { useState } from 'react';
import { ClockIcon, CalendarIcon, MoonIcon, BellIcon, HelpCircleIcon } from 'lucide-react';
import { AvailabilityPattern } from '../../types/UserTypes';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
interface AvailabilityPatternScreenProps {
  onSelect: (pattern: AvailabilityPattern, details?: {
    scheduledDays?: string[];
    scheduledHours?: {
      start: string;
      end: string;
    };
  }) => void;
  onBack: () => void;
  initialPattern?: AvailabilityPattern;
}
export const AvailabilityPatternScreen: React.FC<AvailabilityPatternScreenProps> = ({
  onSelect,
  onBack,
  initialPattern
}) => {
  const [selectedPattern, setSelectedPattern] = useState<AvailabilityPattern>(initialPattern || 'as_needed');
  // For scheduled shifts pattern
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const handlePatternSelect = (pattern: AvailabilityPattern) => {
    setSelectedPattern(pattern);
  };
  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  const handleContinue = () => {
    // Validate inputs for scheduled shifts
    if (selectedPattern === 'scheduled_shifts' && selectedDays.length === 0) {
      alert('Please select at least one day for your scheduled shifts.');
      return;
    }
    // Prepare details object based on selected pattern
    let details;
    if (selectedPattern === 'scheduled_shifts') {
      details = {
        scheduledDays: selectedDays,
        scheduledHours: {
          start: startTime,
          end: endTime
        }
      };
    }
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'availability_pattern_selected',
      pattern: selectedPattern,
      days_selected: selectedPattern === 'scheduled_shifts' ? selectedDays.length : 0
    });
    onSelect(selectedPattern, details);
  };
  // Availability pattern options
  const availabilityPatterns = [{
    value: 'scheduled_shifts',
    label: 'Scheduled Shifts',
    description: 'I have specific days and times when I provide care',
    icon: <CalendarIcon className="w-5 h-5" />
  }, {
    value: 'business_hours',
    label: 'Business Hours',
    description: "I'm generally available on weekdays from 9am-5pm",
    icon: <ClockIcon className="w-5 h-5" />
  }, {
    value: 'evenings_weekends',
    label: 'Evenings & Weekends',
    description: 'I help out in the evenings after work and on weekends',
    icon: <MoonIcon className="w-5 h-5" />
  }, {
    value: 'emergency_only',
    label: 'Emergency Only',
    description: "I'm only available for urgent situations",
    icon: <BellIcon className="w-5 h-5" />
  }, {
    value: 'as_needed',
    label: 'As Needed',
    description: "I'm flexible and can adjust my schedule as needed",
    icon: <HelpCircleIcon className="w-5 h-5" />
  }];
  // Days of the week for scheduled shifts
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return <div className="p-6 h-full flex flex-col">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-center mb-2">
          Your Availability
        </h1>
        <p className="text-center text-gray-600 mb-6">
          When are you typically available to provide care?
        </p>
        <div className="mb-6 space-y-3">
          {availabilityPatterns.map(pattern => <button key={pattern.value} className={`w-full p-4 rounded-lg border-2 ${selectedPattern === pattern.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'} transition-all duration-200 flex items-start text-left`} onClick={() => handlePatternSelect(pattern.value)}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                {pattern.icon}
              </div>
              <div>
                <h3 className="font-medium">{pattern.label}</h3>
                <p className="text-sm text-gray-500">{pattern.description}</p>
              </div>
            </button>)}
        </div>
        {/* Additional fields for scheduled shifts */}
        {selectedPattern === 'scheduled_shifts' && <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Select Your Schedule</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Days
              </label>
              <div className="grid grid-cols-4 gap-2">
                {daysOfWeek.map(day => <button key={day} type="button" onClick={() => handleDayToggle(day)} className={`py-2 px-1 text-xs sm:text-sm rounded-lg ${selectedDays.includes(day) ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                    {day.substring(0, 3)}
                  </button>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <BracketText active={true} className="mb-1 text-blue-800 font-medium">
            Flexible Scheduling
          </BracketText>
          <p className="text-sm text-blue-700">
            Your availability pattern helps us suggest tasks that fit your
            schedule, but you can always adjust individual task assignments as
            needed.
          </p>
        </div>
      </div>
      <div className="mt-6 flex space-x-3">
        <Button onClick={onBack} variant="secondary" className="w-1/3">
          Back
        </Button>
        <Button onClick={handleContinue} className="w-2/3">
          Continue
        </Button>
      </div>
    </div>;
};