import React, { useState } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, UserIcon, AlertCircleIcon } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { CareShift, CoverageGap } from '../../types/ScheduleTypes';
import { dataService } from '../../services/DataService';
interface ShiftCalendarViewProps {
  onShiftClick: (shift: CareShift) => void;
  onGapClick: (gap: CoverageGap) => void;
  onAddShift: (date: string, startTime?: string) => void;
}
export const ShiftCalendarView: React.FC<ShiftCalendarViewProps> = ({
  onShiftClick,
  onGapClick,
  onAddShift
}) => {
  const {
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    getShiftsForDate,
    getCoverageGapsForDate,
    isVisibleToCurrentUser
  } = useCalendar();
  // Format dates for display
  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  // Navigate to previous/next day, week, or month
  const navigatePrevious = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'three-day') {
      newDate.setDate(newDate.getDate() - 3);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };
  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'three-day') {
      newDate.setDate(newDate.getDate() + 3);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };
  // Helper to generate dates for the current view
  const getDatesForCurrentView = () => {
    const dates = [];
    const startDate = new Date(selectedDate);
    // Adjust to start of week for week view
    if (viewMode === 'week') {
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
    }
    // For month view, go to the 1st of the month
    if (viewMode === 'month') {
      startDate.setDate(1);
    }
    // Generate the appropriate number of dates
    const daysToShow = viewMode === 'day' ? 1 : viewMode === 'three-day' ? 3 : viewMode === 'week' ? 7 : getDaysInMonth(startDate.getFullYear(), startDate.getMonth());
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };
  // Helper to get days in a month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  // Format time from 24-hour to 12-hour format
  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Get team member name and color
  const getTeamMemberInfo = (memberId: string | null) => {
    if (!memberId) return {
      name: 'Unassigned',
      color: 'gray'
    };
    const member = dataService.getTeamMemberById(memberId);
    return {
      name: member?.name || 'Unknown',
      color: member?.color || 'gray'
    };
  };
  // Render the calendar header with navigation controls
  const renderCalendarHeader = () => {
    const dateFormat = viewMode === 'month' ? {
      month: 'long',
      year: 'numeric'
    } as const : {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    } as const;
    let headerText = selectedDate.toLocaleDateString('en-US', dateFormat);
    if (viewMode === 'week') {
      const dates = getDatesForCurrentView();
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      if (firstDate.getMonth() === lastDate.getMonth()) {
        headerText = `${firstDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })}`;
      } else {
        headerText = `${firstDate.toLocaleDateString('en-US', {
          month: 'short'
        })} - ${lastDate.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        })}`;
      }
    } else if (viewMode === 'three-day') {
      const dates = getDatesForCurrentView();
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      headerText = `${firstDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${lastDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}`;
    }
    return <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button onClick={navigatePrevious} className="p-2 rounded-full hover:bg-gray-100" aria-label="Previous">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold mx-2">{headerText}</h2>
          <button onClick={navigateNext} className="p-2 rounded-full hover:bg-gray-100" aria-label="Next">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setViewMode('day')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'day' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            Day
          </button>
          <button onClick={() => setViewMode('three-day')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'three-day' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            3 Days
          </button>
          <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'week' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            Week
          </button>
          <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'month' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            Month
          </button>
        </div>
      </div>;
  };
  // Render a single day's shifts
  const renderDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const shifts = getShiftsForDate(dateStr).filter(isVisibleToCurrentUser);
    const gaps = getCoverageGapsForDate(dateStr);
    const isToday = new Date().toDateString() === date.toDateString();
    return <div key={dateStr} className={`border rounded-lg p-3 ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className={`text-sm font-medium ${isToday ? 'text-blue-700' : ''}`}>
            {date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric'
          })}
          </h3>
          <button onClick={() => onAddShift(dateStr)} className="text-blue-600 text-xs hover:text-blue-800">
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {shifts.length === 0 && gaps.length === 0 && <div className="text-center py-4 text-gray-500 text-sm">
              No shifts scheduled
            </div>}
          {shifts.map(shift => {
          const memberInfo = getTeamMemberInfo(shift.assignedTo);
          return <div key={shift.id} onClick={() => onShiftClick(shift)} className={`p-2 rounded-md cursor-pointer hover:opacity-90 ${shift.color || 'bg-blue-50'}`} style={{
            backgroundColor: shift.color || undefined
          }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <ClockIcon className="w-3 h-3 text-gray-600 mr-1" />
                    <span className="text-xs text-gray-600">
                      {formatTime(shift.startTime)} -{' '}
                      {formatTime(shift.endTime)}
                    </span>
                  </div>
                  <div className={`text-xs px-1.5 py-0.5 rounded-full bg-${shift.status === 'open' ? 'yellow' : shift.status === 'in_progress' ? 'green' : shift.status === 'completed' ? 'gray' : 'blue'}-100 text-${shift.status === 'open' ? 'yellow' : shift.status === 'in_progress' ? 'green' : shift.status === 'completed' ? 'gray' : 'blue'}-700`}>
                    {shift.status === 'open' ? 'Open' : shift.status === 'in_progress' ? 'Active' : shift.status === 'completed' ? 'Done' : 'Scheduled'}
                  </div>
                </div>
                <div className="mt-1 flex items-center">
                  <div className={`w-4 h-4 rounded-full bg-${memberInfo.color}-100 flex items-center justify-center mr-1.5`}>
                    <span className={`text-[10px] text-${memberInfo.color}-600 font-medium`}>
                      {memberInfo.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-xs font-medium truncate">
                    {memberInfo.name}
                  </span>
                </div>
              </div>;
        })}
          {gaps.map(gap => <div key={gap.id} onClick={() => onGapClick(gap)} className={`p-2 rounded-md cursor-pointer bg-red-50 border border-dashed border-red-200 hover:bg-red-100`}>
              <div className="flex items-center">
                <AlertCircleIcon className="w-3 h-3 text-red-600 mr-1" />
                <span className="text-xs font-medium text-red-600">
                  Coverage Gap
                </span>
                {gap.priority === 'high' && <span className="ml-1 text-[10px] bg-red-200 text-red-800 px-1 py-0.5 rounded">
                    Critical
                  </span>}
              </div>
              <div className="flex items-center mt-1">
                <ClockIcon className="w-3 h-3 text-red-600 mr-1" />
                <span className="text-xs text-red-600">
                  {formatTime(gap.startTime)} - {formatTime(gap.endTime)}
                </span>
              </div>
            </div>)}
        </div>
      </div>;
  };
  // Render day view (single day)
  const renderDayView = () => {
    const dates = getDatesForCurrentView();
    return <div className="h-full overflow-y-auto">{renderDay(dates[0])}</div>;
  };
  // Render three-day view
  const renderThreeDayView = () => {
    const dates = getDatesForCurrentView();
    return <div className="grid grid-cols-3 gap-3 h-full overflow-y-auto">
        {dates.map(date => renderDay(date))}
      </div>;
  };
  // Render week view
  const renderWeekView = () => {
    const dates = getDatesForCurrentView();
    return <div className="grid grid-cols-7 gap-2 h-full overflow-y-auto">
        {dates.map(date => renderDay(date))}
      </div>;
  };
  // Render month view
  const renderMonthView = () => {
    const dates = getDatesForCurrentView();
    const firstDay = new Date(dates[0]);
    const startingDayOfWeek = firstDay.getDay();
    // Add padding for the first week
    const paddedDates = [];
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      paddedDates.push(null);
    }
    // Add the actual dates
    paddedDates.push(...dates);
    return <div className="h-full overflow-y-auto">
        {/* Day of week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-xs font-medium text-gray-500">
              {day}
            </div>)}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 auto-rows-fr">
          {paddedDates.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="border border-gray-100 bg-gray-50 rounded-md"></div>;
          }
          const dateStr = date.toISOString().split('T')[0];
          const shifts = getShiftsForDate(dateStr).filter(isVisibleToCurrentUser);
          const gaps = getCoverageGapsForDate(dateStr);
          const isToday = new Date().toDateString() === date.toDateString();
          return <div key={dateStr} className={`border rounded-md p-1 overflow-hidden ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${isToday ? 'font-medium text-blue-700' : ''}`}>
                    {date.getDate()}
                  </span>
                  <button onClick={() => onAddShift(dateStr)} className="text-blue-600 text-[10px] hover:text-blue-800">
                    +
                  </button>
                </div>
                <div className="mt-1 space-y-1">
                  {shifts.slice(0, 2).map(shift => {
                const memberInfo = getTeamMemberInfo(shift.assignedTo);
                return <div key={shift.id} onClick={() => onShiftClick(shift)} className={`p-1 rounded text-[10px] cursor-pointer truncate ${shift.color || 'bg-blue-50'}`} style={{
                  backgroundColor: shift.color || undefined
                }}>
                        {formatTime(shift.startTime)} · {memberInfo.name}
                      </div>;
              })}
                  {shifts.length > 2 && <div className="text-[10px] text-gray-500 pl-1">
                      +{shifts.length - 2} more
                    </div>}
                  {gaps.length > 0 && <div onClick={() => onGapClick(gaps[0])} className="p-1 rounded text-[10px] cursor-pointer bg-red-50 text-red-600 truncate">
                      {gaps.length} coverage{' '}
                      {gaps.length === 1 ? 'gap' : 'gaps'}
                    </div>}
                </div>
              </div>;
        })}
        </div>
      </div>;
  };
  // Render the appropriate view based on the current mode
  const renderCalendarView = () => {
    switch (viewMode) {
      case 'day':
        return renderDayView();
      case 'three-day':
        return renderThreeDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return renderDayView();
    }
  };
  return <div className="h-full flex flex-col">
      {renderCalendarHeader()}
      <div className="flex-1 overflow-hidden">{renderCalendarView()}</div>
    </div>;
};