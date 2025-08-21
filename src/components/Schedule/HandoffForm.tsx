import React, { useEffect, useState } from 'react';
import { XIcon, ArrowRightIcon, CheckIcon } from 'lucide-react';
import { CareShift } from '../../types/ScheduleTypes';
import { dataService } from '../../services/DataService';
import { shiftService } from '../../services/ShiftService';
import { useCalendar } from '../../contexts/CalendarContext';
interface HandoffFormProps {
  shift: CareShift;
  onClose: () => void;
  onComplete: () => void;
}
export const HandoffForm: React.FC<HandoffFormProps> = ({
  shift,
  onClose,
  onComplete
}) => {
  const {
    isTaskCompleted
  } = useCalendar();
  const [notes, setNotes] = useState('');
  const [nextShift, setNextShift] = useState<CareShift | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [pendingTaskIds, setPendingTaskIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Load tasks and find next shift
  useEffect(() => {
    // Load tasks associated with this shift
    if (shift.tasks && shift.tasks.length > 0) {
      const loadedTasks = shift.tasks.map(taskId => {
        return dataService.getTaskById(taskId);
      }).filter(task => task !== undefined);
      setTasks(loadedTasks);
      // Set initial completed/pending tasks based on their status
      const completed: string[] = [];
      const pending: string[] = [];
      loadedTasks.forEach(task => {
        if (task && isTaskCompleted(task.id)) {
          completed.push(task.id);
        } else if (task) {
          pending.push(task.id);
        }
      });
      setCompletedTaskIds(completed);
      setPendingTaskIds(pending);
    }
    // Find the next shift after this one
    findNextShift();
  }, [shift, isTaskCompleted]);
  // Find the next shift (either same day or next day)
  const findNextShift = () => {
    const shifts = shiftService.getShifts();
    // First try to find a shift on the same day that starts after this one ends
    let nextShiftCandidate = shifts.find(s => s.date === shift.date && s.startTime >= shift.endTime && s.id !== shift.id && s.status !== 'completed');
    // If not found, look for the first shift on the next day
    if (!nextShiftCandidate) {
      const nextDay = new Date(shift.date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      const nextDayShifts = shifts.filter(s => s.date === nextDayStr && s.status !== 'completed');
      if (nextDayShifts.length > 0) {
        // Sort by start time and get the earliest
        nextDayShifts.sort((a, b) => a.startTime.localeCompare(b.startTime));
        nextShiftCandidate = nextDayShifts[0];
      }
    }
    setNextShift(nextShiftCandidate || null);
  };
  // Toggle task between completed and pending
  const toggleTaskStatus = (taskId: string) => {
    if (completedTaskIds.includes(taskId)) {
      setCompletedTaskIds(completedTaskIds.filter(id => id !== taskId));
      setPendingTaskIds([...pendingTaskIds, taskId]);
    } else if (pendingTaskIds.includes(taskId)) {
      setPendingTaskIds(pendingTaskIds.filter(id => id !== taskId));
      setCompletedTaskIds([...completedTaskIds, taskId]);
    }
  };
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextShift || !nextShift.assignedTo) {
      alert('No next shift found with an assigned caregiver');
      return;
    }
    setIsSubmitting(true);
    // Create handoff
    const handoffData = {
      fromShiftId: shift.id,
      toShiftId: nextShift.id,
      fromCaregiverId: shift.assignedTo || '',
      toCaregiverId: nextShift.assignedTo || '',
      notes,
      status: 'pending',
      tasksCompleted: completedTaskIds,
      tasksPending: pendingTaskIds
    };
    shiftService.createHandoff(handoffData);
    // Update the current shift with handoff notes
    if (notes) {
      shiftService.updateShift({
        ...shift,
        handoffNotes: notes
      });
    }
    setIsSubmitting(false);
    onComplete();
  };
  // Format date and time
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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
  // Get caregiver name
  const getCaregiverName = (caregiverId: string | null) => {
    if (!caregiverId) return 'Unassigned';
    return dataService.getTeamMemberName(caregiverId);
  };
  return <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Create Handoff</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
          <XIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      {!nextShift ? <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <p className="text-yellow-700">
            No upcoming shift found. Handoff can only be created when there is a
            future shift scheduled.
          </p>
          <button onClick={onClose} className="mt-3 w-full py-2 bg-white border border-gray-300 rounded-lg">
            Go Back
          </button>
        </div> : <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <div className="flex items-center justify-center mb-4">
              <div className="text-center px-4">
                <div className="text-sm text-gray-500">Current Shift</div>
                <div className="font-medium">
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </div>
                <div className="text-sm">{formatDate(shift.date)}</div>
                <div className="text-sm font-medium mt-1">
                  {getCaregiverName(shift.assignedTo)}
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400 mx-2" />
              <div className="text-center px-4">
                <div className="text-sm text-gray-500">Next Shift</div>
                <div className="font-medium">
                  {formatTime(nextShift.startTime)} -{' '}
                  {formatTime(nextShift.endTime)}
                </div>
                <div className="text-sm">{formatDate(nextShift.date)}</div>
                <div className="text-sm font-medium mt-1">
                  {getCaregiverName(nextShift.assignedTo)}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Handoff Notes
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg h-24" placeholder="Add notes about the shift, patient condition, important information for the next caregiver..." required />
            </div>
            {tasks.length > 0 && <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Tasks Status
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tasks.map(task => <div key={task.id} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <div className="flex items-start">
                        <button type="button" onClick={() => toggleTaskStatus(task.id)} className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 ${completedTaskIds.includes(task.id) ? 'bg-green-500' : 'border border-gray-300'}`}>
                          {completedTaskIds.includes(task.id) && <CheckIcon className="w-3 h-3 text-white" />}
                        </button>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-gray-600">
                            {task.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {completedTaskIds.includes(task.id) ? 'Completed' : 'Pending - will be handed off'}
                          </div>
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>}
          </div>
          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600" disabled={isSubmitting || !nextShift.assignedTo}>
              {isSubmitting ? 'Creating...' : 'Create Handoff'}
            </button>
          </div>
        </form>}
    </div>;
};