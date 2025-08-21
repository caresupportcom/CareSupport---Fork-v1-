import React, { useEffect, useState } from 'react';
import { BarChart2Icon, CheckCircleIcon, ClockIcon, UserIcon, CalendarIcon, HeartIcon, ActivityIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { shiftService } from '../../services/ShiftService';
import { dataService } from '../../services/DataService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
interface CareStatisticsProps {
  startDate: string;
  endDate: string;
  previousStartDate?: string;
  previousEndDate?: string;
}
export const CareStatistics: React.FC<CareStatisticsProps> = ({
  startDate,
  endDate,
  previousStartDate,
  previousEndDate
}) => {
  const [stats, setStats] = useState({
    careHours: {
      total: 0,
      byCaregiver: {},
      previousTotal: 0,
      percentChange: 0
    },
    tasksCompleted: {
      total: 0,
      byCategory: {},
      previousTotal: 0,
      percentChange: 0
    },
    caregiverActivity: {
      totalCaregivers: 0,
      mostActive: {
        id: '',
        name: '',
        hours: 0
      },
      previousTotalCaregivers: 0
    },
    taskCompletion: {
      onTime: 0,
      late: 0,
      completionRate: 0,
      previousCompletionRate: 0,
      percentChange: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadStatistics();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'care_statistics_viewed',
      date_range: `${startDate} to ${endDate}`
    });
  }, [startDate, endDate, previousStartDate, previousEndDate]);
  const loadStatistics = async () => {
    setIsLoading(true);
    // Get shifts and tasks for current period
    const currentShifts = getShiftsInRange(startDate, endDate);
    const currentTasks = getTasksInRange(startDate, endDate);
    // Get shifts and tasks for previous period (if provided)
    const previousShifts = previousStartDate && previousEndDate ? getShiftsInRange(previousStartDate, previousEndDate) : [];
    const previousTasks = previousStartDate && previousEndDate ? getTasksInRange(previousStartDate, previousEndDate) : [];
    // Calculate care hours statistics
    const careHours = calculateCareHours(currentShifts, previousShifts);
    // Calculate tasks completed statistics
    const tasksCompleted = calculateTasksCompleted(currentTasks, previousTasks);
    // Calculate caregiver activity statistics
    const caregiverActivity = calculateCaregiverActivity(currentShifts, previousShifts);
    // Calculate task completion statistics
    const taskCompletion = calculateTaskCompletion(currentTasks, previousTasks);
    setStats({
      careHours,
      tasksCompleted,
      caregiverActivity,
      taskCompletion
    });
    setIsLoading(false);
  };
  // Get shifts in date range
  const getShiftsInRange = (start: string, end: string) => {
    const allShifts = shiftService.getShifts();
    return allShifts.filter(shift => shift.date >= start && shift.date <= end && shift.assignedTo !== null && (shift.status === 'completed' || shift.status === 'in_progress'));
  };
  // Get tasks in date range
  const getTasksInRange = (start: string, end: string) => {
    const allTasks = dataService.getTasks();
    return allTasks.filter(task => task.dueDate >= start && task.dueDate <= end);
  };
  // Calculate care hours statistics
  const calculateCareHours = (currentShifts, previousShifts) => {
    // Calculate total care hours for current period
    let totalHours = 0;
    const byCaregiver = {};
    currentShifts.forEach(shift => {
      const hours = calculateShiftHours(shift);
      totalHours += hours;
      // Group by caregiver
      if (shift.assignedTo) {
        const caregiverId = shift.assignedTo;
        byCaregiver[caregiverId] = (byCaregiver[caregiverId] || 0) + hours;
      }
    });
    // Calculate total care hours for previous period
    let previousTotal = 0;
    previousShifts.forEach(shift => {
      previousTotal += calculateShiftHours(shift);
    });
    // Calculate percent change
    const percentChange = previousTotal > 0 ? (totalHours - previousTotal) / previousTotal * 100 : 0;
    return {
      total: Math.round(totalHours * 10) / 10,
      byCaregiver,
      previousTotal: Math.round(previousTotal * 10) / 10,
      percentChange: Math.round(percentChange)
    };
  };
  // Calculate shift hours
  const calculateShiftHours = shift => {
    const startMinutes = timeToMinutes(shift.startTime);
    const endMinutes = timeToMinutes(shift.endTime);
    let durationMinutes = 0;
    if (endMinutes < startMinutes) {
      // Overnight shift
      durationMinutes = 24 * 60 - startMinutes + endMinutes;
    } else {
      durationMinutes = endMinutes - startMinutes;
    }
    return durationMinutes / 60; // Convert to hours
  };
  // Calculate tasks completed statistics
  const calculateTasksCompleted = (currentTasks, previousTasks) => {
    // Count completed tasks for current period
    const completedTasks = currentTasks.filter(task => task.status === 'completed');
    const total = completedTasks.length;
    // Group by category
    const byCategory = {};
    completedTasks.forEach(task => {
      const category = task.category;
      byCategory[category] = (byCategory[category] || 0) + 1;
    });
    // Count completed tasks for previous period
    const previousTotal = previousTasks.filter(task => task.status === 'completed').length;
    // Calculate percent change
    const percentChange = previousTotal > 0 ? (total - previousTotal) / previousTotal * 100 : 0;
    return {
      total,
      byCategory,
      previousTotal,
      percentChange: Math.round(percentChange)
    };
  };
  // Calculate caregiver activity statistics
  const calculateCaregiverActivity = (currentShifts, previousShifts) => {
    // Count unique caregivers for current period
    const caregiverHours = {};
    currentShifts.forEach(shift => {
      if (shift.assignedTo) {
        const caregiverId = shift.assignedTo;
        caregiverHours[caregiverId] = (caregiverHours[caregiverId] || 0) + calculateShiftHours(shift);
      }
    });
    const totalCaregivers = Object.keys(caregiverHours).length;
    // Find most active caregiver
    let mostActiveId = '';
    let mostActiveHours = 0;
    Object.entries(caregiverHours).forEach(([id, hours]) => {
      if (hours > mostActiveHours) {
        mostActiveId = id;
        mostActiveHours = hours as number;
      }
    });
    const mostActiveName = mostActiveId ? dataService.getTeamMemberName(mostActiveId) : 'None';
    // Count unique caregivers for previous period
    const previousCaregivers = {};
    previousShifts.forEach(shift => {
      if (shift.assignedTo) {
        previousCaregivers[shift.assignedTo] = true;
      }
    });
    const previousTotalCaregivers = Object.keys(previousCaregivers).length;
    return {
      totalCaregivers,
      mostActive: {
        id: mostActiveId,
        name: mostActiveName,
        hours: Math.round(mostActiveHours * 10) / 10 // Round to 1 decimal
      },
      previousTotalCaregivers
    };
  };
  // Calculate task completion statistics
  const calculateTaskCompletion = (currentTasks, previousTasks) => {
    // Count on-time and late completions for current period
    let onTime = 0;
    let late = 0;
    currentTasks.filter(task => task.status === 'completed').forEach(task => {
      // In a real app, we would compare completion time with due time
      // For this demo, we'll use a random distribution
      if (Math.random() > 0.3) {
        onTime++;
      } else {
        late++;
      }
    });
    const total = onTime + late;
    const completionRate = total > 0 ? onTime / total * 100 : 0;
    // Calculate completion rate for previous period
    let previousOnTime = 0;
    let previousLate = 0;
    previousTasks.filter(task => task.status === 'completed').forEach(task => {
      if (Math.random() > 0.3) {
        previousOnTime++;
      } else {
        previousLate++;
      }
    });
    const previousTotal = previousOnTime + previousLate;
    const previousCompletionRate = previousTotal > 0 ? previousOnTime / previousTotal * 100 : 0;
    // Calculate percent change
    const percentChange = previousCompletionRate > 0 ? (completionRate - previousCompletionRate) / previousCompletionRate * 100 : 0;
    return {
      onTime,
      late,
      completionRate: Math.round(completionRate),
      previousCompletionRate: Math.round(previousCompletionRate),
      percentChange: Math.round(percentChange)
    };
  };
  // Helper function to convert time to minutes
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  // Format caregiver hours for display
  const formatCaregiverHours = () => {
    return Object.entries(stats.careHours.byCaregiver).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5) // Top 5 caregivers
    .map(([id, hours]) => ({
      id,
      name: dataService.getTeamMemberName(id),
      hours: Math.round((hours as number) * 10) / 10 // Round to 1 decimal
    }));
  };
  // Format task categories for display
  const formatTaskCategories = () => {
    return Object.entries(stats.tasksCompleted.byCategory).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5) // Top 5 categories
    .map(([category, count]) => ({
      category,
      displayName: category.charAt(0).toUpperCase() + category.slice(1),
      count
    }));
  };
  if (isLoading) {
    return <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>;
  }
  return <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold flex items-center">
          <BarChart2Icon className="w-5 h-5 mr-2 text-blue-600" />
          Care Statistics
        </h2>
        <p className="text-sm text-gray-500">
          {new Date(startDate).toLocaleDateString()} -{' '}
          {new Date(endDate).toLocaleDateString()}
        </p>
      </div>
      {/* Main Stats */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Care Hours */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-blue-800 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              Care Hours
            </h3>
            <div className={`text-xs flex items-center ${stats.careHours.percentChange > 0 ? 'text-green-600' : stats.careHours.percentChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {stats.careHours.percentChange > 0 ? <TrendingUpIcon className="w-3 h-3 mr-0.5" /> : stats.careHours.percentChange < 0 ? <TrendingDownIcon className="w-3 h-3 mr-0.5" /> : null}
              {stats.careHours.percentChange > 0 ? '+' : ''}
              {stats.careHours.percentChange}%
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {stats.careHours.total}
          </div>
          <div className="text-xs text-blue-600 mb-2">
            vs. {stats.careHours.previousTotal} in previous period
          </div>
          {/* Top Caregivers */}
          <div className="mt-2">
            <h4 className="text-xs font-medium text-blue-800 mb-1">
              Top Caregivers
            </h4>
            <div className="space-y-1">
              {formatCaregiverHours().map(caregiver => <div key={caregiver.id} className="flex justify-between items-center text-xs">
                  <span className="text-gray-700">{caregiver.name}</span>
                  <span className="font-medium">{caregiver.hours} hrs</span>
                </div>)}
            </div>
          </div>
        </div>
        {/* Tasks Completed */}
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-green-800 flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Tasks Completed
            </h3>
            <div className={`text-xs flex items-center ${stats.tasksCompleted.percentChange > 0 ? 'text-green-600' : stats.tasksCompleted.percentChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {stats.tasksCompleted.percentChange > 0 ? <TrendingUpIcon className="w-3 h-3 mr-0.5" /> : stats.tasksCompleted.percentChange < 0 ? <TrendingDownIcon className="w-3 h-3 mr-0.5" /> : null}
              {stats.tasksCompleted.percentChange > 0 ? '+' : ''}
              {stats.tasksCompleted.percentChange}%
            </div>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {stats.tasksCompleted.total}
          </div>
          <div className="text-xs text-green-600 mb-2">
            vs. {stats.tasksCompleted.previousTotal} in previous period
          </div>
          {/* Task Categories */}
          <div className="mt-2">
            <h4 className="text-xs font-medium text-green-800 mb-1">
              By Category
            </h4>
            <div className="space-y-1">
              {formatTaskCategories().map(cat => <div key={cat.category} className="flex justify-between items-center text-xs">
                  <span className="text-gray-700">{cat.displayName}</span>
                  <span className="font-medium">{cat.count}</span>
                </div>)}
            </div>
          </div>
        </div>
        {/* Caregiver Activity */}
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <h3 className="text-sm font-medium text-purple-800 flex items-center mb-1">
            <UserIcon className="w-4 h-4 mr-1" />
            Caregiver Activity
          </h3>
          <div className="text-2xl font-bold text-purple-700">
            {stats.caregiverActivity.totalCaregivers}
          </div>
          <div className="text-xs text-purple-600 mb-2">
            Active caregivers in this period
          </div>
          {/* Most Active Caregiver */}
          <div className="mt-2">
            <h4 className="text-xs font-medium text-purple-800 mb-1">
              Most Active
            </h4>
            <div className="bg-white rounded p-2 border border-purple-200">
              <div className="font-medium text-sm">
                {stats.caregiverActivity.mostActive.name}
              </div>
              <div className="text-xs text-gray-600">
                {stats.caregiverActivity.mostActive.hours} hours
              </div>
            </div>
          </div>
        </div>
        {/* Task Completion Rate */}
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-orange-800 flex items-center">
              <ActivityIcon className="w-4 h-4 mr-1" />
              On-Time Completion
            </h3>
            <div className={`text-xs flex items-center ${stats.taskCompletion.percentChange > 0 ? 'text-green-600' : stats.taskCompletion.percentChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {stats.taskCompletion.percentChange > 0 ? <TrendingUpIcon className="w-3 h-3 mr-0.5" /> : stats.taskCompletion.percentChange < 0 ? <TrendingDownIcon className="w-3 h-3 mr-0.5" /> : null}
              {stats.taskCompletion.percentChange > 0 ? '+' : ''}
              {stats.taskCompletion.percentChange}%
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-700">
            {stats.taskCompletion.completionRate}%
          </div>
          <div className="text-xs text-orange-600 mb-2">
            vs. {stats.taskCompletion.previousCompletionRate}% in previous
            period
          </div>
          {/* Completion Breakdown */}
          <div className="mt-2">
            <h4 className="text-xs font-medium text-orange-800 mb-1">
              Completion Breakdown
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-700">On-time</span>
                <span className="font-medium text-green-600">
                  {stats.taskCompletion.onTime}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-700">Late</span>
                <span className="font-medium text-red-600">
                  {stats.taskCompletion.late}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};