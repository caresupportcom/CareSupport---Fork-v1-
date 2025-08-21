import React, { useState } from 'react';
import { AlertTriangleIcon, XIcon } from 'lucide-react';
import { availabilityService } from '../../../services/AvailabilityService';
import { storage } from '../../../services/StorageService';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';
import { notificationService } from '../../../services/NotificationService';
export const UnavailabilityAlert = ({
  onComplete
}) => {
  const [alertData, setAlertData] = useState({
    startDate: getTodayString(),
    endDate: getTodayString(),
    reason: '',
    findReplacement: true,
    notifyTeam: true
  });
  const handleChange = (field, value) => {
    setAlertData({
      ...alertData,
      [field]: value
    });
  };
  const handleSubmit = () => {
    // Validate dates
    if (!alertData.startDate || !alertData.endDate) {
      alert('Please select start and end dates');
      return;
    }
    const start = new Date(alertData.startDate);
    const end = new Date(alertData.endDate);
    if (end < start) {
      alert('End date cannot be before start date');
      return;
    }
    // Get user ID
    const userId = storage.get('user_id', '');
    if (!userId) {
      alert('User ID not found');
      return;
    }
    // Create unavailability record
    const record = {
      userId,
      startDate: alertData.startDate,
      endDate: alertData.endDate,
      reason: alertData.reason,
      replacementRequested: alertData.findReplacement,
      teamNotified: alertData.notifyTeam,
      affectedShifts: []
    };
    // Save to service
    const createdRecord = availabilityService.createUnavailabilityRecord(record);
    // Mark user as unavailable for this date range
    const currentDate = new Date(alertData.startDate);
    const endDate = new Date(alertData.endDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      availabilityService.setDateAvailability(userId, dateStr, 'unavailable');
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    // Show notification
    notificationService.addNotification({
      type: 'schedule',
      title: 'Unavailability Reported',
      message: `Your unavailability from ${formatDate(alertData.startDate)} to ${formatDate(alertData.endDate)} has been recorded.`,
      priority: 'medium'
    });
    // Track event
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'unavailability_reported',
      start_date: alertData.startDate,
      end_date: alertData.endDate,
      find_replacement: alertData.findReplacement,
      notify_team: alertData.notifyTeam
    });
    // Complete
    onComplete();
  };
  return <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex-1">
      <h3 className="font-medium mb-3 flex items-center text-yellow-800">
        <AlertTriangleIcon className="w-4 h-4 mr-2" />
        Report Unavailability
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" value={alertData.startDate} min={getTodayString()} onChange={e => handleChange('startDate', e.target.value)} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input type="date" value={alertData.endDate} min={alertData.startDate} onChange={e => handleChange('endDate', e.target.value)} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Reason (Optional)
          </label>
          <input type="text" value={alertData.reason} onChange={e => handleChange('reason', e.target.value)} placeholder="Brief explanation for your unavailability" className="w-full border border-gray-300 rounded-md p-2" />
        </div>
        <div className="flex items-center">
          <input type="checkbox" id="findReplacement" checked={alertData.findReplacement} onChange={e => handleChange('findReplacement', e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
          <label htmlFor="findReplacement" className="ml-2 text-sm">
            Find replacement for my shifts
          </label>
        </div>
        <div className="flex items-center">
          <input type="checkbox" id="notifyTeam" checked={alertData.notifyTeam} onChange={e => handleChange('notifyTeam', e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
          <label htmlFor="notifyTeam" className="ml-2 text-sm">
            Notify care team about my unavailability
          </label>
        </div>
        <div className="flex space-x-2 pt-2">
          <button onClick={onComplete} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Submit
          </button>
        </div>
      </div>
    </div>;
};
// Helper function to get today's date as YYYY-MM-DD
function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
// Helper function to format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}