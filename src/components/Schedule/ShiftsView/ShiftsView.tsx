import React, { useEffect, useState } from 'react';
import { PlusIcon, AlertTriangleIcon, BarChart2Icon } from 'lucide-react';
import { ShiftsHeader } from './ShiftsHeader';
import { ShiftsGrid } from './ShiftsGrid';
import { shiftService } from '../../../services/ShiftService';
import { coverageService } from '../../../services/CoverageService';
import { dataService } from '../../../services/DataService';
import { storage } from '../../../services/StorageService';
import { analytics, AnalyticsEvents } from '../../../services/AnalyticsService';
import { CoverageAnalysis } from '../CoverageAnalysis';
import { CoverageGap, CareShift } from '../../../types/ScheduleTypes';
export const ShiftsView = ({
  navigateTo
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState('all');
  const [shifts, setShifts] = useState([]);
  const [coverageGaps, setCoverageGaps] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showCoverageAnalysis, setShowCoverageAnalysis] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const userId = storage.get('user_id', '');
  // Load data when date or filter changes
  useEffect(() => {
    loadData();
  }, [selectedDate, activeFilter]);
  const loadData = () => {
    // Get date string in YYYY-MM-DD format
    const dateStr = selectedDate.toISOString().split('T')[0];
    // Load shifts for the selected date
    let shiftsForDate = shiftService.getShiftsForDate(dateStr);
    // Apply filters
    if (activeFilter === 'my-shifts') {
      shiftsForDate = shiftsForDate.filter(shift => shift.assignedTo === userId);
    } else if (activeFilter === 'open') {
      shiftsForDate = shiftsForDate.filter(shift => shift.status === 'open');
    }
    setShifts(shiftsForDate);
    // Load coverage gaps
    setCoverageGaps(coverageService.getCoverageGapsForDate(dateStr));
    // Load team members
    setTeamMembers(dataService.getTeamMembers());
  };
  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shifts_navigation',
      direction: 'previous'
    });
  };
  const goToNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shifts_navigation',
      direction: 'next'
    });
  };
  const goToToday = () => {
    setSelectedDate(new Date());
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shifts_navigation',
      action: 'go_to_today'
    });
  };
  // Handle filter change
  const handleFilterChange = filter => {
    setActiveFilter(filter);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shifts_filter_changed',
      filter: filter
    });
  };
  // Handle shift click
  const handleShiftClick = shift => {
    setSelectedShift(shift);
    // For now, just log the shift details
    console.log('Shift clicked:', shift);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'shift_details_viewed',
      shift_id: shift.id
    });
  };
  // Handle gap click
  const handleGapClick = gap => {
    // For now, just log the gap details
    console.log('Coverage gap clicked:', gap);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_gap_viewed',
      gap_id: gap.id
    });
  };
  // Toggle coverage analysis
  const toggleCoverageAnalysis = () => {
    setShowCoverageAnalysis(!showCoverageAnalysis);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coverage_analysis_toggled',
      state: !showCoverageAnalysis ? 'opened' : 'closed'
    });
  };
  // Format time from 24-hour to 12-hour format
  const formatTime = timeString => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Get team member name by ID
  const getTeamMemberName = id => {
    const member = teamMembers.find(m => m.id === id);
    return member ? member.name : 'Unassigned';
  };
  // Handle creating a new shift
  const handleCreateShift = (date, startTime, endTime) => {
    // For now, just log the details
    console.log('Create shift:', {
      date,
      startTime,
      endTime
    });
    // In a real implementation, this would open a shift creation form
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'create_shift_initiated'
    });
  };
  return <div className="h-full flex flex-col">
      {/* Header with date navigation and filters */}
      <ShiftsHeader selectedDate={selectedDate} onPrevious={goToPrevious} onNext={goToNext} onToday={goToToday} onFilterChange={handleFilterChange} activeFilter={activeFilter} />
      {/* View toggle and actions */}
      <div className="px-6 mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            Grid View
          </button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            List View
          </button>
        </div>
        <div className="flex space-x-2">
          <button onClick={toggleCoverageAnalysis} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500 text-white flex items-center">
            <BarChart2Icon className="w-4 h-4 mr-1.5" />
            Coverage Analysis
          </button>
          <button onClick={() => handleCreateShift(selectedDate.toISOString().split('T')[0], '09:00', '17:00')} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500 text-white flex items-center">
            <PlusIcon className="w-4 h-4 mr-1.5" />
            Add Shift
          </button>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {showCoverageAnalysis ? <CoverageAnalysis onClose={toggleCoverageAnalysis} onGapClick={handleGapClick} onCreateShift={handleCreateShift} /> : viewMode === 'grid' ? <div className="overflow-x-auto pb-4">
            <ShiftsGrid shifts={shifts} coverageGaps={coverageGaps} teamMembers={teamMembers} onShiftClick={handleShiftClick} onGapClick={handleGapClick} startHour={6} endHour={22} />
          </div> : <>
            {/* List view of shifts */}
            <h2 className="text-lg font-semibold mb-3">Shifts</h2>
            {shifts.length === 0 ? <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-600 mb-4">
                  No shifts scheduled for this day
                </p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center mx-auto" onClick={() => handleCreateShift(selectedDate.toISOString().split('T')[0], '09:00', '17:00')}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Shift
                </button>
              </div> : <div className="space-y-3 mb-6">
                {shifts.map(shift => <div key={shift.id} className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={() => handleShiftClick(shift)}>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-2 h-8 rounded-sm mr-3" style={{
                  backgroundColor: shift.color || '#e6f7ff'
                }}></div>
                        <div>
                          <p className="font-medium">
                            {formatTime(shift.startTime)} -{' '}
                            {formatTime(shift.endTime)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {shift.assignedTo ? getTeamMemberName(shift.assignedTo) : 'Unassigned'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full self-start ${shift.status === 'completed' ? 'bg-green-100 text-green-700' : shift.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : shift.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                        {shift.status}
                      </span>
                    </div>
                    {shift.handoffNotes && <p className="text-sm text-gray-600 mt-2 border-t border-gray-100 pt-2">
                        {shift.handoffNotes}
                      </p>}
                  </div>)}
              </div>}
            {/* Coverage Gaps */}
            {coverageGaps.length > 0 && <>
                <h2 className="text-lg font-semibold mb-3">Coverage Gaps</h2>
                <div className="space-y-3">
                  {coverageGaps.map(gap => <div key={gap.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" onClick={() => handleGapClick(gap)}>
                      <div className="flex items-start">
                        <AlertTriangleIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-yellow-800">
                            Coverage Gap
                          </h3>
                          <p className="text-sm text-yellow-700 mb-2">
                            {formatTime(gap.startTime)} -{' '}
                            {formatTime(gap.endTime)}
                          </p>
                          <div className="flex">
                            <button className="text-xs bg-white text-yellow-700 border border-yellow-300 rounded px-2 py-1">
                              Resolve
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>)}
                </div>
              </>}
          </>}
      </div>
    </div>;
};