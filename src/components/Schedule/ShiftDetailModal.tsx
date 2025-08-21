import React, { useState } from 'react';
import { X, Clock, Calendar, User, CheckCircle, AlertTriangle } from 'lucide-react';
import { CareShift } from '../../types/ScheduleTypes';
import { dataService } from '../../services/DataService';
interface ShiftDetailModalProps {
  shift: CareShift;
  onClose: () => void;
  onStartShift: (shiftId: string) => void;
  onCompleteShift: (shiftId: string) => void;
  onClaimShift: (shiftId: string, userId: string) => void;
  onEditShift: (shift: CareShift) => void;
}
export const ShiftDetailModal: React.FC<ShiftDetailModalProps> = ({
  shift,
  onClose,
  onStartShift,
  onCompleteShift,
  onClaimShift,
  onEditShift
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const userId = localStorage.getItem('user_id') || '';
  // Format time to 12-hour format
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };
  // Get assignee name
  const getAssigneeName = (): string => {
    if (!shift.assignedTo) return 'Unassigned';
    const member = dataService.getTeamMemberById(shift.assignedTo);
    return member ? member.name : 'Unknown';
  };
  // Get shift tasks
  const getShiftTasks = () => {
    if (!shift.tasks || shift.tasks.length === 0) return [];
    return shift.tasks.map(taskId => dataService.getTaskById(taskId)).filter(Boolean);
  };
  // Determine if current user can claim this shift
  const canClaim = shift.status === 'open' && !shift.assignedTo;
  // Determine if current user can start/complete this shift
  const canManage = shift.assignedTo === userId;
  // Handle claim shift
  const handleClaimShift = () => {
    onClaimShift(shift.id, userId);
  };
  // Handle start shift
  const handleStartShift = () => {
    onStartShift(shift.id);
  };
  // Handle complete shift
  const handleCompleteShift = () => {
    onCompleteShift(shift.id);
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Shift Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Shift time and date */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-lg font-medium">
                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-600">{formatDate(shift.date)}</span>
            </div>
          </div>
          {/* Status badge */}
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${shift.status === 'completed' ? 'bg-green-100 text-green-800' : shift.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : shift.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
              {shift.status.replace('_', ' ').charAt(0).toUpperCase() + shift.status.replace('_', ' ').slice(1)}
            </span>
          </div>
          {/* Assignee */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">Assigned to</div>
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <span className="font-medium">{getAssigneeName()}</span>
            </div>
          </div>
          {/* Tasks */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Tasks</div>
            {getShiftTasks().length > 0 ? <div className="space-y-2">
                {getShiftTasks().map(task => <div key={task.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {task.description}
                    </div>
                    <div className="flex items-center mt-2">
                      {task.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : task.hasConflict ? <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" /> : null}
                      <span className={`text-xs ${task.status === 'completed' ? 'text-green-600' : task.hasConflict ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {task.status === 'completed' ? 'Completed' : task.hasConflict ? 'Has conflict' : 'Pending'}
                      </span>
                    </div>
                  </div>)}
              </div> : <div className="text-gray-500 italic">
                No tasks assigned to this shift
              </div>}
          </div>
          {/* Handoff notes */}
          {shift.handoffNotes && <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Handoff Notes</div>
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                {shift.handoffNotes}
              </div>
            </div>}
        </div>
        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
          {canClaim && <button onClick={handleClaimShift} className="px-4 py-2 bg-green-500 text-white rounded-lg">
              Claim Shift
            </button>}
          {canManage && shift.status === 'scheduled' && <button onClick={handleStartShift} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Start Shift
            </button>}
          {canManage && shift.status === 'in_progress' && <button onClick={handleCompleteShift} className="px-4 py-2 bg-green-500 text-white rounded-lg">
              Complete Shift
            </button>}
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>;
};