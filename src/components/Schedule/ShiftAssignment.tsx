import React, { useEffect, useState } from 'react';
import { UserIcon, CalendarIcon, ClockIcon, CheckIcon, XIcon, SearchIcon, FilterIcon, ChevronLeftIcon, ChevronRightIcon, AlertCircleIcon } from 'lucide-react';
import { shiftService } from '../../services/ShiftService';
import { dataService } from '../../services/DataService';
import { CareShift } from '../../types/ScheduleTypes';
import { TeamMember } from '../../services/DataService';
interface ShiftAssignmentProps {
  onClose: () => void;
  onShiftClick: (shift: CareShift) => void;
}
export const ShiftAssignment: React.FC<ShiftAssignmentProps> = ({
  onClose,
  onShiftClick
}) => {
  // State for shifts and caregivers
  const [shifts, setShifts] = useState<CareShift[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
  });
  // Filter states
  const [showAssigned, setShowAssigned] = useState(true);
  const [showUnassigned, setShowUnassigned] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // Load initial data
  useEffect(() => {
    loadData();
  }, [dateRange]);
  const loadData = () => {
    // Get all shifts within the date range
    const allShifts = shiftService.getShifts().filter(shift => shift.date >= dateRange.start && shift.date <= dateRange.end);
    setShifts(allShifts);
    // Get all team members
    setTeamMembers(dataService.getTeamMembers());
  };
  // Format date for display
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  // Format time from 24-hour to 12-hour format
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Handle shift selection
  const toggleShiftSelection = (shiftId: string) => {
    if (selectedShifts.includes(shiftId)) {
      setSelectedShifts(selectedShifts.filter(id => id !== shiftId));
    } else {
      setSelectedShifts([...selectedShifts, shiftId]);
    }
  };
  // Handle caregiver selection
  const selectCaregiver = (caregiverId: string) => {
    setSelectedCaregiver(caregiverId);
  };
  // Handle bulk assignment
  const assignSelectedShifts = () => {
    if (!selectedCaregiver || selectedShifts.length === 0) return;
    // Update each selected shift
    selectedShifts.forEach(shiftId => {
      const shift = shifts.find(s => s.id === shiftId);
      if (shift) {
        shiftService.updateShift({
          ...shift,
          assignedTo: selectedCaregiver,
          status: 'scheduled'
        });
      }
    });
    // Reload data and clear selections
    loadData();
    setSelectedShifts([]);
    setSelectedCaregiver(null);
  };
  // Navigate to previous/next week
  const navigatePreviousWeek = () => {
    const startDate = new Date(dateRange.start);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(dateRange.end);
    endDate.setDate(endDate.getDate() - 7);
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
  };
  const navigateNextWeek = () => {
    const startDate = new Date(dateRange.start);
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(dateRange.end);
    endDate.setDate(endDate.getDate() + 7);
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
  };
  // Filter shifts based on criteria
  const filteredShifts = shifts.filter(shift => {
    // Filter by assignment status
    if (!showAssigned && shift.assignedTo !== null) return false;
    if (!showUnassigned && shift.assignedTo === null) return false;
    // Filter by search query (date, time, or caregiver name)
    if (searchQuery) {
      const date = formatDate(shift.date).toLowerCase();
      const time = `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`.toLowerCase();
      const caregiver = shift.assignedTo ? dataService.getTeamMemberName(shift.assignedTo).toLowerCase() : 'unassigned';
      const query = searchQuery.toLowerCase();
      return date.includes(query) || time.includes(query) || caregiver.includes(query);
    }
    return true;
  });
  // Group shifts by date
  const shiftsByDate: Record<string, CareShift[]> = {};
  filteredShifts.forEach(shift => {
    if (!shiftsByDate[shift.date]) {
      shiftsByDate[shift.date] = [];
    }
    shiftsByDate[shift.date].push(shift);
  });
  // Sort dates
  const sortedDates = Object.keys(shiftsByDate).sort();
  // Check caregiver availability for a specific shift
  const isCaregiverAvailable = (caregiver: TeamMember, shift: CareShift): boolean => {
    // Check if caregiver has shifts that overlap with this one
    const caregiverShifts = shifts.filter(s => s.assignedTo === caregiver.id && s.date === shift.date);
    return !caregiverShifts.some(s => {
      // Skip the current shift if it's already assigned to this caregiver
      if (s.id === shift.id) return false;
      // Convert times to minutes for easier comparison
      const [shiftStartHour, shiftStartMin] = shift.startTime.split(':').map(Number);
      const [shiftEndHour, shiftEndMin] = shift.endTime.split(':').map(Number);
      const [existingStartHour, existingStartMin] = s.startTime.split(':').map(Number);
      const [existingEndHour, existingEndMin] = s.endTime.split(':').map(Number);
      const shiftStart = shiftStartHour * 60 + shiftStartMin;
      const shiftEnd = shiftEndHour * 60 + shiftEndMin;
      const existingStart = existingStartHour * 60 + existingStartMin;
      const existingEnd = existingEndHour * 60 + existingEndMin;
      // Handle overnight shifts
      const shiftOvernight = shiftEnd < shiftStart;
      const existingOvernight = existingEnd < existingStart;
      if (shiftOvernight && existingOvernight) {
        // Both shifts are overnight - they must overlap
        return true;
      } else if (shiftOvernight) {
        // The new shift is overnight
        return existingStart < shiftEnd || shiftStart < existingEnd;
      } else if (existingOvernight) {
        // The existing shift is overnight
        return shiftStart < existingEnd || existingStart < shiftEnd;
      } else {
        // Neither shift is overnight - standard overlap check
        return shiftStart < existingEnd && existingStart < shiftEnd;
      }
    });
  };
  // Get availability color for a caregiver
  const getAvailabilityColor = (caregiver: TeamMember, shift: CareShift): string => {
    // Check if the shift is already assigned to this caregiver
    if (shift.assignedTo === caregiver.id) {
      return 'bg-green-100 text-green-800';
    }
    // Check if caregiver is available for this shift
    if (isCaregiverAvailable(caregiver, shift)) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };
  // Assign a caregiver to a shift
  const assignShift = (shift: CareShift, caregiverId: string) => {
    shiftService.updateShift({
      ...shift,
      assignedTo: caregiverId,
      status: 'scheduled'
    });
    loadData();
  };
  // Unassign a caregiver from a shift
  const unassignShift = (shift: CareShift) => {
    shiftService.updateShift({
      ...shift,
      assignedTo: null,
      status: 'open'
    });
    loadData();
  };
  return <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Shift Assignment</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
          <XIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      {/* Date Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={navigatePreviousWeek} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="text-sm font-medium">
          {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </div>
        <button onClick={navigateNextWeek} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      {/* Search and Filters */}
      <div className="mb-4">
        <div className="relative mb-2">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search shifts..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex space-x-2 text-sm">
          <label className="flex items-center">
            <input type="checkbox" checked={showAssigned} onChange={() => setShowAssigned(!showAssigned)} className="mr-1 w-4 h-4" />
            Assigned
          </label>
          <label className="flex items-center">
            <input type="checkbox" checked={showUnassigned} onChange={() => setShowUnassigned(!showUnassigned)} className="mr-1 w-4 h-4" />
            Unassigned
          </label>
        </div>
      </div>
      {/* Bulk Assignment */}
      {selectedShifts.length > 0 && <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-blue-800">
              {selectedShifts.length} shift
              {selectedShifts.length !== 1 ? 's' : ''} selected
            </div>
            <button onClick={() => setSelectedShifts([])} className="text-xs text-blue-700">
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {teamMembers.map(member => <button key={member.id} onClick={() => selectCaregiver(member.id)} className={`px-3 py-1 rounded-lg text-xs ${selectedCaregiver === member.id ? 'bg-blue-600 text-white' : 'bg-white border border-blue-300 text-blue-700'}`}>
                {member.name}
              </button>)}
          </div>
          <button onClick={assignSelectedShifts} disabled={!selectedCaregiver} className={`w-full py-2 rounded-lg text-sm ${selectedCaregiver ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
            Assign Selected Shifts
          </button>
        </div>}
      {/* Shifts by Date */}
      <div className="flex-1 overflow-y-auto">
        {sortedDates.length > 0 ? <div className="space-y-4">
            {sortedDates.map(date => <div key={date}>
                <h3 className="font-medium text-gray-800 mb-2">
                  {formatDate(date)}
                </h3>
                <div className="space-y-2">
                  {shiftsByDate[date].map(shift => <div key={shift.id} className={`border rounded-lg p-3 ${shift.assignedTo ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} ${selectedShifts.includes(shift.id) ? 'ring-2 ring-blue-500' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <input type="checkbox" checked={selectedShifts.includes(shift.id)} onChange={() => toggleShiftSelection(shift.id)} className="mr-3 w-4 h-4" />
                            <div>
                              <div className="font-medium">
                                {formatTime(shift.startTime)} -{' '}
                                {formatTime(shift.endTime)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {shift.assignedTo ? dataService.getTeamMemberName(shift.assignedTo) : 'Unassigned'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => onShiftClick(shift)} className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200" aria-label="View shift details">
                            <ClockIcon className="w-4 h-4 text-gray-600" />
                          </button>
                          {shift.assignedTo && <button onClick={() => unassignShift(shift)} className="p-1.5 bg-red-100 rounded-lg hover:bg-red-200" aria-label="Unassign caregiver">
                              <XIcon className="w-4 h-4 text-red-600" />
                            </button>}
                        </div>
                      </div>
                      {/* Caregiver Assignment */}
                      {!shift.assignedTo && <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-2">
                            Assign to:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {teamMembers.map(member => <button key={member.id} onClick={() => assignShift(shift, member.id)} className={`px-2 py-1 rounded-lg text-xs ${getAvailabilityColor(member, shift)}`} disabled={!isCaregiverAvailable(member, shift)}>
                                {member.name}
                              </button>)}
                          </div>
                        </div>}
                    </div>)}
                </div>
              </div>)}
          </div> : <div className="text-center py-10">
            <p className="text-gray-500">
              No shifts found for the selected criteria
            </p>
          </div>}
      </div>
    </div>;
};