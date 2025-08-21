import React, { useEffect, useState } from 'react';
import { PlusIcon, XIcon, InfoIcon } from 'lucide-react';
import { availabilityService } from '../../../services/AvailabilityService';
import { storage } from '../../../services/StorageService';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';
export const RecurringAvailability = () => {
  const [weeklySchedule, setWeeklySchedule] = useState({
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [] // Saturday
  });
  const [userId, setUserId] = useState('');
  const [showTip, setShowTip] = useState(false);
  // Load saved weekly schedule
  useEffect(() => {
    const userId = storage.get('user_id', '');
    setUserId(userId);
    if (userId) {
      const savedSchedule = availabilityService.getWeeklyAvailability(userId);
      if (savedSchedule) {
        setWeeklySchedule(savedSchedule);
      }
    }
  }, []);
  // Add time slot to a day
  const addTimeSlot = day => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: [...weeklySchedule[day], {
        id: Date.now().toString(),
        startTime: '09:00',
        endTime: '17:00'
      }]
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'recurring_availability_slot_added',
      day: day
    });
  };
  // Remove time slot
  const removeTimeSlot = (day, id) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: weeklySchedule[day].filter(slot => slot.id !== id)
    });
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'recurring_availability_slot_removed',
      day: day
    });
  };
  // Update time slot
  const updateTimeSlot = (day, id, field, value) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: weeklySchedule[day].map(slot => slot.id === id ? {
        ...slot,
        [field]: value
      } : slot)
    });
  };
  // Save schedule
  const saveSchedule = () => {
    if (userId) {
      availabilityService.updateWeeklyAvailability(userId, weeklySchedule);
      // Show save confirmation
      // In a real app, this would be a toast notification
      alert('Your weekly availability has been saved.');
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'recurring_availability_saved',
        days_with_slots: Object.entries(weeklySchedule).filter(([_, slots]) => slots.length > 0).length
      });
    }
  };
  // Get day name
  const getDayName = day => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };
  return <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Weekly Availability</h2>
        <button onClick={() => setShowTip(!showTip)} className="text-blue-500 flex items-center text-sm">
          <InfoIcon className="w-4 h-4 mr-1" />
          <span>How This Works</span>
        </button>
      </div>
      {showTip && <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-700">
          <p className="mb-2">
            <strong>Recurring Availability Schedule</strong> helps the team know
            when you're regularly available for care shifts.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Add time slots for each day you're typically available</li>
            <li>
              This repeats weekly unless you set specific exceptions in the
              Calendar view
            </li>
            <li>Coordinators use this to schedule shifts and find coverage</li>
          </ul>
          <button onClick={() => setShowTip(false)} className="text-blue-600 font-medium mt-2">
            Got it
          </button>
        </div>}
      <div className="space-y-4">
        {Object.entries(weeklySchedule).map(([day, slots]) => <div key={day} className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{getDayName(day)}</h3>
              <button onClick={() => addTimeSlot(day)} className="text-blue-500 flex items-center text-sm">
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Time Slot
              </button>
            </div>
            {slots.length === 0 ? <p className="text-sm text-gray-500">Not available</p> : <div className="space-y-2">
                {slots.map(slot => <div key={slot.id} className="flex items-center space-x-2">
                    <input type="time" value={slot.startTime} onChange={e => updateTimeSlot(day, slot.id, 'startTime', e.target.value)} className="border border-gray-300 rounded-md p-2" />
                    <span>to</span>
                    <input type="time" value={slot.endTime} onChange={e => updateTimeSlot(day, slot.id, 'endTime', e.target.value)} className="border border-gray-300 rounded-md p-2" />
                    <button onClick={() => removeTimeSlot(day, slot.id)} className="text-red-500">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>)}
              </div>}
          </div>)}
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={saveSchedule} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Save Schedule
        </button>
      </div>
    </div>;
};