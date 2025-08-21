import React, { useState } from 'react';
import { XIcon, ClockIcon, CalendarIcon, AlertCircleIcon, UserIcon, ArrowRightIcon, SplitIcon, CheckIcon } from 'lucide-react';
import { CoverageGap, ResolutionOption } from '../../types/ScheduleTypes';
import { useCalendar } from '../../contexts/CalendarContext';
import { dataService } from '../../services/DataService';
interface CoverageGapDetailProps {
  gap: CoverageGap;
  onClose: () => void;
  onResolved: () => void;
}
export const CoverageGapDetail: React.FC<CoverageGapDetailProps> = ({
  gap,
  onClose,
  onResolved
}) => {
  const {
    resolveCoverageGap
  } = useCalendar();
  const [selectedResolution, setSelectedResolution] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState(gap.date);
  const [customStartTime, setCustomStartTime] = useState(gap.startTime);
  const [customEndTime, setCustomEndTime] = useState(gap.endTime);
  const [customAssignee, setCustomAssignee] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Format date and time for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Calculate duration in hours and minutes
  const calculateDuration = () => {
    const [startHours, startMinutes] = gap.startTime.split(':').map(Number);
    const [endHours, endMinutes] = gap.endTime.split(':').map(Number);
    let durationMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
    // Handle overnight shifts
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60;
    }
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };
  // Handle resolution selection
  const handleResolutionSelect = (resolutionId: string) => {
    if (resolutionId === 'custom') {
      setShowCustomForm(true);
      setSelectedResolution(null);
    } else {
      setShowCustomForm(false);
      setSelectedResolution(resolutionId);
    }
  };
  // Handle form submission
  const handleSubmit = () => {
    if (!selectedResolution && !showCustomForm) return;
    setIsSubmitting(true);
    if (showCustomForm) {
      // Create a custom resolution option
      const customResolution: ResolutionOption = {
        id: `custom_${Date.now()}`,
        type: 'reschedule',
        description: 'Custom resolution',
        suggestedTime: {
          date: customDate,
          startTime: customStartTime,
          endTime: customEndTime
        },
        suggestedAssignee: customAssignee
      };
      resolveCoverageGap(gap.id, customResolution);
    } else if (selectedResolution) {
      // Find the selected resolution
      const resolution = gap.resolutionOptions?.find(opt => opt.id === selectedResolution);
      if (resolution) {
        resolveCoverageGap(gap.id, resolution);
      }
    }
    setIsSubmitting(false);
    onResolved();
  };
  // Get team members for custom resolution
  const teamMembers = dataService.getTeamMembers();
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center">
                <AlertCircleIcon className={`w-5 h-5 ${gap.priority === 'high' ? 'text-red-500' : 'text-yellow-500'} mr-2`} />
                <span className={`px-2 py-1 text-xs rounded-full ${gap.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {gap.priority === 'high' ? 'Critical' : 'Medium'} Coverage Gap
                </span>
              </div>
              <h2 className="text-xl font-semibold mt-1">Unassigned Shift</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
              <XIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-medium">{formatDate(gap.date)}</div>
              </div>
            </div>
            <div className="flex items-center">
              <ClockIcon className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Time</div>
                <div className="font-medium">
                  {formatTime(gap.startTime)} - {formatTime(gap.endTime)} (
                  {calculateDuration()})
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-gray-500 mt-2 ml-1.5"></div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Identified</div>
                <div className="text-sm">
                  {new Date(gap.identifiedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
                </div>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">
              Resolution Options
            </h3>
            <div className="space-y-3">
              {gap.resolutionOptions?.map(option => <button key={option.id} onClick={() => handleResolutionSelect(option.id)} className={`w-full p-3 text-left rounded-lg border ${selectedResolution === option.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 ${selectedResolution === option.id ? 'bg-blue-500' : 'border border-gray-300'}`}>
                      {selectedResolution === option.id && <CheckIcon className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
                        {option.type === 'reassign' && <>
                            <UserIcon className="w-4 h-4 text-blue-500 mr-1" />
                            Reassign
                          </>}
                        {option.type === 'split' && <>
                            <SplitIcon className="w-4 h-4 text-purple-500 mr-1" />
                            Split Shift
                          </>}
                        {option.type === 'reschedule' && <>
                            <CalendarIcon className="w-4 h-4 text-green-500 mr-1" />
                            Reschedule
                          </>}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </div>
                      {option.suggestedAssignee && <div className="mt-2 flex items-center text-sm text-gray-600">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-1.5">
                            <span className="text-[10px] text-blue-600 font-medium">
                              {dataService.getTeamMemberName(option.suggestedAssignee).charAt(0)}
                            </span>
                          </div>
                          <span>
                            {dataService.getTeamMemberName(option.suggestedAssignee)}
                          </span>
                        </div>}
                      {option.suggestedTime && <div className="mt-2 flex items-center text-sm text-gray-600">
                          <ClockIcon className="w-4 h-4 text-gray-500 mr-1" />
                          <span>
                            {formatTime(option.suggestedTime.startTime)} -
                            {formatTime(option.suggestedTime.endTime)} on
                            {new Date(option.suggestedTime.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                          </span>
                        </div>}
                    </div>
                  </div>
                </button>)}
              <button onClick={() => handleResolutionSelect('custom')} className={`w-full p-3 text-left rounded-lg border ${showCustomForm ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 ${showCustomForm ? 'bg-blue-500' : 'border border-gray-300'}`}>
                    {showCustomForm && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="font-medium">Custom Resolution</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Create a custom shift with specific date, time, and
                      assignee
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
          {showCustomForm && <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">
                Custom Resolution
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input type="time" value={customStartTime} onChange={e => setCustomStartTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input type="time" value={customEndTime} onChange={e => setCustomEndTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To (Optional)
                  </label>
                  <select value={customAssignee || ''} onChange={e => setCustomAssignee(e.target.value || null)} className="w-full p-2 border border-gray-300 rounded-lg">
                    <option value="">Leave Unassigned</option>
                    {teamMembers.map(member => <option key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </option>)}
                  </select>
                </div>
              </div>
            </div>}
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSubmit} className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600" disabled={isSubmitting || !selectedResolution && !showCustomForm}>
              {isSubmitting ? 'Resolving...' : 'Resolve Gap'}
            </button>
          </div>
        </div>
      </div>
    </div>;
};