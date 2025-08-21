import React, { useEffect, useState } from 'react';
import { ClockIcon, UserIcon, CalendarIcon, CheckIcon, XIcon, AlertCircleIcon, ArrowRightIcon, RepeatIcon, TrashIcon, EditIcon } from 'lucide-react';
import { CareShift } from '../../types/ScheduleTypes';
import { useCalendar } from '../../contexts/CalendarContext';
import { dataService } from '../../services/DataService';
import { HandoffForm } from './HandoffForm';
interface ShiftDetailProps {
  shift: CareShift;
  onClose: () => void;
  onEdit: (shift: CareShift) => void;
  onDelete: (shiftId: string) => void;
}
export const ShiftDetail: React.FC<ShiftDetailProps> = ({
  shift,
  onClose,
  onEdit,
  onDelete
}) => {
  const {
    claimShift,
    startShift,
    completeShift,
    isTaskCompleted,
    toggleTaskCompletion
  } = useCalendar();
  const [showHandoffForm, setShowHandoffForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  // Load tasks associated with this shift
  useEffect(() => {
    if (shift.tasks && shift.tasks.length > 0) {
      const loadedTasks = shift.tasks.map(taskId => {
        return dataService.getTaskById(taskId);
      }).filter(task => task !== undefined);
      setTasks(loadedTasks);
    }
  }, [shift]);
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
  // Get caregiver info
  const getCaregiverInfo = (caregiverId: string | null) => {
    if (!caregiverId) return {
      name: 'Unassigned',
      role: 'Open Shift'
    };
    const caregiver = dataService.getTeamMemberById(caregiverId);
    return {
      name: caregiver?.name || 'Unknown',
      role: caregiver?.role || 'Caregiver'
    };
  };
  // Calculate shift duration in hours and minutes
  const getShiftDuration = () => {
    const [startHours, startMinutes] = shift.startTime.split(':').map(Number);
    const [endHours, endMinutes] = shift.endTime.split(':').map(Number);
    let durationMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
    // Handle overnight shifts
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60;
    }
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };
  // Handle shift actions
  const handleClaimShift = () => {
    claimShift(shift.id);
    onClose();
  };
  const handleStartShift = () => {
    startShift(shift.id);
    onClose();
  };
  const handleCompleteShift = () => {
    completeShift(shift.id);
    onClose();
  };
  const handleDelete = () => {
    onDelete(shift.id);
    onClose();
  };
  const handleCreateHandoff = () => {
    setShowHandoffForm(true);
  };
  const caregiver = getCaregiverInfo(shift.assignedTo);
  const creator = dataService.getTeamMemberName(shift.createdBy);
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {!showHandoffForm ? <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${shift.status === 'open' ? 'bg-yellow-100 text-yellow-800' : shift.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : shift.status === 'in_progress' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {shift.status === 'open' ? 'Open Shift' : shift.status === 'scheduled' ? 'Scheduled' : shift.status === 'in_progress' ? 'In Progress' : 'Completed'}
                </span>
                <h2 className="text-xl font-semibold mt-1">
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </h2>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => onEdit(shift)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Edit shift">
                  <EditIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
                  <XIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">{formatDate(shift.date)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-medium">{getShiftDuration()}</div>
                </div>
              </div>
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Assigned To</div>
                  <div className="font-medium">{caregiver.name}</div>
                  <div className="text-xs text-gray-500">{caregiver.role}</div>
                </div>
              </div>
              {shift.recurring && shift.recurrencePattern && <div className="flex items-center">
                  <RepeatIcon className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Recurring</div>
                    <div className="font-medium">
                      {shift.recurrencePattern.type.charAt(0).toUpperCase() + shift.recurrencePattern.type.slice(1)}
                      {shift.recurrencePattern.interval > 1 && ` (Every ${shift.recurrencePattern.interval} ${shift.recurrencePattern.type}s)`}
                    </div>
                  </div>
                </div>}
              <div className="flex items-start">
                <div className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-gray-500 mt-2 ml-1.5"></div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Created By</div>
                  <div className="font-medium">{creator}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(shift.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
                  </div>
                </div>
              </div>
            </div>
            {/* Tasks Section */}
            {tasks.length > 0 && <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Tasks</h3>
                <div className="space-y-2">
                  {tasks.map(task => <div key={task.id} className={`p-3 rounded-lg border ${isTaskCompleted(task.id) ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                      <div className="flex items-start">
                        <button onClick={() => toggleTaskCompletion(task.id)} className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 ${isTaskCompleted(task.id) ? 'bg-green-500' : 'border border-gray-300'}`}>
                          {isTaskCompleted(task.id) && <CheckIcon className="w-3 h-3 text-white" />}
                        </button>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-gray-600">
                            {task.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Due: {formatTime(task.dueTime)}
                          </div>
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>}
            {/* Handoff Notes */}
            {shift.handoffNotes && <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">
                  Handoff Notes
                </h3>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  {shift.handoffNotes}
                </div>
              </div>}
            {/* Action Buttons */}
            <div className="space-y-3">
              {shift.status === 'open' && <button onClick={handleClaimShift} className="w-full py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Claim Shift
                </button>}
              {shift.status === 'scheduled' && <button onClick={handleStartShift} className="w-full py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Start Shift
                </button>}
              {shift.status === 'in_progress' && <>
                  <button onClick={handleCompleteShift} className="w-full py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Complete Shift
                  </button>
                  <button onClick={handleCreateHandoff} className="w-full py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Create Handoff
                  </button>
                </>}
              {!showDeleteConfirm ? <button onClick={() => setShowDeleteConfirm(true)} className="w-full py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Delete Shift
                </button> : <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                  <p className="text-sm text-red-600 mb-2">
                    Are you sure you want to delete this shift?
                  </p>
                  <div className="flex space-x-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-1.5 bg-white border border-gray-300 rounded">
                      Cancel
                    </button>
                    <button onClick={handleDelete} className="flex-1 py-1.5 bg-red-600 text-white rounded">
                      Delete
                    </button>
                  </div>
                </div>}
            </div>
          </div> : <HandoffForm shift={shift} onClose={() => setShowHandoffForm(false)} onComplete={onClose} />}
      </div>
    </div>;
};