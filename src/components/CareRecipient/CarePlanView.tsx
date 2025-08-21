import React, { useEffect, useState, cloneElement } from 'react';
import { CalendarIcon, CheckIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon, PillIcon, HeartIcon, ActivityIcon, ClipboardIcon, XIcon, InfoIcon, ArrowRightIcon } from 'lucide-react';
import { dataService } from '../../services/DataService';
interface CarePlanViewProps {
  onBack: () => void;
  onTaskComplete: (taskId: string) => void;
  onTaskDetail: (taskId: string) => void;
}
export const CarePlanView: React.FC<CarePlanViewProps> = ({
  onBack,
  onTaskComplete,
  onTaskDetail
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [carePlanTasks, setCarePlanTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [careCategories, setCareCategories] = useState<any[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState<string | null>(null);
  useEffect(() => {
    // Generate dates for the current week view
    generateWeekDates(selectedDate);
    // Load care plan data
    loadCarePlanData();
  }, [selectedDate, viewMode]);
  const generateWeekDates = (currentDate: Date) => {
    const dates: Date[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start from Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    setWeekDates(dates);
  };
  const loadCarePlanData = () => {
    // In a real app, this would load from an API or service
    // For demo purposes, we'll create sample data
    // Create care categories
    const categories = [{
      id: 'medications',
      name: 'Medications',
      icon: <PillIcon className="w-5 h-5" />,
      color: 'blue'
    }, {
      id: 'health',
      name: 'Health Monitoring',
      icon: <HeartIcon className="w-5 h-5" />,
      color: 'red'
    }, {
      id: 'activity',
      name: 'Physical Activity',
      icon: <ActivityIcon className="w-5 h-5" />,
      color: 'green'
    }, {
      id: 'nutrition',
      name: 'Nutrition',
      icon: <ClipboardIcon className="w-5 h-5" />,
      color: 'yellow'
    }];
    setCareCategories(categories);
    // Create sample care plan tasks
    const selectedDateStr = formatDateForComparison(selectedDate);
    const tasks = [
    // Medications
    {
      id: 'med1',
      category: 'medications',
      title: 'Blood Pressure Medication',
      description: 'Take 1 tablet with water',
      time: '08:00',
      duration: 5,
      frequency: 'daily',
      priority: 'high',
      date: selectedDateStr,
      instructions: 'Take with food to avoid stomach upset',
      assignedTo: 'self'
    }, {
      id: 'med2',
      category: 'medications',
      title: 'Cholesterol Medication',
      description: 'Take 1 tablet',
      time: '20:00',
      duration: 5,
      frequency: 'daily',
      priority: 'high',
      date: selectedDateStr,
      instructions: 'Take in the evening',
      assignedTo: 'caregiver'
    },
    // Health Monitoring
    {
      id: 'health1',
      category: 'health',
      title: 'Blood Pressure Check',
      description: 'Measure and record blood pressure',
      time: '09:00',
      duration: 10,
      frequency: 'daily',
      priority: 'medium',
      date: selectedDateStr,
      instructions: 'Use the automatic cuff and record both numbers',
      assignedTo: 'caregiver'
    }, {
      id: 'health2',
      category: 'health',
      title: 'Blood Glucose Test',
      description: 'Check blood sugar level',
      time: '07:30',
      duration: 10,
      frequency: 'daily',
      priority: 'high',
      date: selectedDateStr,
      instructions: 'Test before breakfast',
      assignedTo: 'self'
    },
    // Physical Activity
    {
      id: 'activity1',
      category: 'activity',
      title: 'Morning Walk',
      description: '15 minute gentle walk',
      time: '10:00',
      duration: 15,
      frequency: 'daily',
      priority: 'medium',
      date: selectedDateStr,
      instructions: 'Walk at a comfortable pace, use walker if needed',
      assignedTo: 'both'
    }, {
      id: 'activity2',
      category: 'activity',
      title: 'Strength Exercises',
      description: 'Chair-based strength exercises',
      time: '15:00',
      duration: 20,
      frequency: 'mon,wed,fri',
      priority: 'medium',
      date: selectedDateStr,
      instructions: '3 sets of 10 repetitions for each exercise',
      assignedTo: 'caregiver'
    },
    // Nutrition
    {
      id: 'nutrition1',
      category: 'nutrition',
      title: 'Breakfast',
      description: 'Low sodium breakfast',
      time: '08:30',
      duration: 30,
      frequency: 'daily',
      priority: 'medium',
      date: selectedDateStr,
      instructions: 'Follow low-sodium diet plan',
      assignedTo: 'caregiver'
    }, {
      id: 'nutrition2',
      category: 'nutrition',
      title: 'Lunch',
      description: 'Balanced meal with vegetables',
      time: '12:30',
      duration: 30,
      frequency: 'daily',
      priority: 'medium',
      date: selectedDateStr,
      instructions: 'Include at least one serving of vegetables',
      assignedTo: 'caregiver'
    }, {
      id: 'nutrition3',
      category: 'nutrition',
      title: 'Dinner',
      description: 'Light dinner',
      time: '18:00',
      duration: 30,
      frequency: 'daily',
      priority: 'medium',
      date: selectedDateStr,
      instructions: 'Light protein and vegetables, avoid heavy carbs',
      assignedTo: 'caregiver'
    }];
    // Filter tasks based on view mode
    let filteredTasks = tasks;
    if (viewMode === 'day') {
      // For day view, only show tasks for the selected date
      filteredTasks = tasks.filter(task => task.date === selectedDateStr);
    } else {
      // For week view, include all tasks
      // In a real app, you'd filter based on the week dates
      filteredTasks = tasks;
    }
    // Sort tasks by time
    filteredTasks.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.time.localeCompare(b.time);
    });
    setCarePlanTasks(filteredTasks);
    // Set completed tasks (for demo purposes)
    const completed = ['med1', 'health2', 'nutrition1'];
    setCompletedTasks(completed);
  };
  // Format date for comparison (YYYY-MM-DD)
  const formatDateForComparison = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  // Format time from 24-hour to 12-hour format
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Navigate to previous day/week
  const navigatePrevious = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() - 1);
    } else {
      newDate.setDate(selectedDate.getDate() - 7);
    }
    setSelectedDate(newDate);
  };
  // Navigate to next day/week
  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + 1);
    } else {
      newDate.setDate(selectedDate.getDate() + 7);
    }
    setSelectedDate(newDate);
  };
  // Navigate to today
  const navigateToday = () => {
    setSelectedDate(new Date());
  };
  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
    }
    // Call the parent handler
    onTaskComplete(taskId);
  };
  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  // Get assignee display text
  const getAssigneeText = (assignee: string): string => {
    switch (assignee) {
      case 'self':
        return 'You';
      case 'caregiver':
        return 'Caregiver';
      case 'both':
        return 'You with caregiver';
      default:
        return 'Unassigned';
    }
  };
  // Get task status class
  const getTaskStatusClass = (task: any): string => {
    if (completedTasks.includes(task.id)) {
      return 'bg-green-50 border-green-200';
    }
    // Check if task is overdue
    const now = new Date();
    const taskTime = new Date(task.date + 'T' + task.time);
    if (taskTime < now && !completedTasks.includes(task.id)) {
      return 'bg-red-50 border-red-200';
    }
    // Upcoming task
    return 'bg-white border-gray-200';
  };
  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };
  // Get category tasks
  const getCategoryTasks = (categoryId: string) => {
    return carePlanTasks.filter(task => task.category === categoryId);
  };
  // Get category completion percentage
  const getCategoryCompletion = (categoryId: string): number => {
    const tasks = getCategoryTasks(categoryId);
    if (tasks.length === 0) return 0;
    const completedCount = tasks.filter(task => completedTasks.includes(task.id)).length;
    return Math.round(completedCount / tasks.length * 100);
  };
  return <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="mr-2 p-1 rounded-full hover:bg-gray-100" aria-label="Go back">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">My Care Plan</h1>
        </div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex space-x-2">
            <button className={`px-3 py-1 text-sm rounded-lg ${viewMode === 'day' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => setViewMode('day')}>
              Day
            </button>
            <button className={`px-3 py-1 text-sm rounded-lg ${viewMode === 'week' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => setViewMode('week')}>
              Week
            </button>
          </div>
          <button className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg" onClick={navigateToday}>
            Today
          </button>
        </div>
        {viewMode === 'day' ? <div className="flex justify-between items-center">
            <button onClick={navigatePrevious} className="p-1 rounded-full hover:bg-gray-100" aria-label="Previous day">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="font-medium">
              {selectedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
              {isToday(selectedDate) && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  Today
                </span>}
            </div>
            <button onClick={navigateNext} className="p-1 rounded-full hover:bg-gray-100" aria-label="Next day">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div> : <div className="flex justify-between items-center">
            <button onClick={navigatePrevious} className="p-1 rounded-full hover:bg-gray-100" aria-label="Previous week">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="font-medium">
              {weekDates[0].toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}{' '}
              -{' '}
              {weekDates[6].toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
            </div>
            <button onClick={navigateNext} className="p-1 rounded-full hover:bg-gray-100" aria-label="Next week">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'day' ? <>
            {/* Day View */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  Care Plan Progress
                </h2>
                <div className="text-sm text-gray-600">
                  {completedTasks.length}/{carePlanTasks.length} completed
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{
              width: `${carePlanTasks.length > 0 ? completedTasks.length / carePlanTasks.length * 100 : 0}%`
            }}></div>
              </div>
            </div>
            {/* Categories */}
            <div className="space-y-3 mb-4">
              {careCategories.map(category => <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className={`p-3 flex justify-between items-center cursor-pointer ${expandedCategory === category.id ? `bg-${category.color}-50` : 'bg-white'}`} onClick={() => toggleCategory(category.id)}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full bg-${category.color}-100 flex items-center justify-center mr-3`}>
                        {category.icon}
                      </div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500">
                          {getCategoryTasks(category.id).filter(task => completedTasks.includes(task.id)).length}
                          /{getCategoryTasks(category.id).length} completed
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 relative mr-2">
                        <svg className="w-12 h-12" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={`var(--tw-${category.color}-500, #3B82F6)`} strokeWidth="3" strokeDasharray={`${getCategoryCompletion(category.id)}, 100`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          {getCategoryCompletion(category.id)}%
                        </div>
                      </div>
                      <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategory === category.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  {expandedCategory === category.id && <div className="divide-y divide-gray-100">
                      {getCategoryTasks(category.id).map(task => <div key={task.id} className={`p-3 ${getTaskStatusClass(task)}`}>
                          <div className="flex items-start">
                            <button onClick={() => toggleTaskCompletion(task.id)} className={`w-6 h-6 rounded-full ${completedTasks.includes(task.id) ? 'bg-green-500 text-white' : 'border border-gray-300 bg-white'} flex-shrink-0 flex items-center justify-center mr-3 mt-0.5`} aria-label={completedTasks.includes(task.id) ? 'Mark as incomplete' : 'Mark as complete'}>
                              {completedTasks.includes(task.id) && <CheckIcon className="w-4 h-4" />}
                            </button>
                            <div className="flex-1" onClick={() => setShowTaskDetail(task.id)}>
                              <div className="flex justify-between items-start">
                                <div className="font-medium">{task.title}</div>
                                <div className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                  {formatTime(task.time)}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {task.description}
                              </div>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <ClockIcon className="w-3.5 h-3.5 mr-1" />
                                <span>{task.duration} min</span>
                                <div className="mx-2 w-1 h-1 bg-gray-300 rounded-full"></div>
                                <span>{getAssigneeText(task.assignedTo)}</span>
                              </div>
                            </div>
                          </div>
                        </div>)}
                    </div>}
                </div>)}
            </div>
            {/* Timeline View */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Daily Timeline
              </h2>
              <div className="relative border-l-2 border-gray-200 pl-4 ml-3 space-y-6">
                {carePlanTasks.map((task, index) => <div key={task.id} className="relative">
                    <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
                    <div className="text-xs text-gray-500 mb-1">
                      {formatTime(task.time)}
                    </div>
                    <div className={`p-3 rounded-lg border ${getTaskStatusClass(task)} cursor-pointer`} onClick={() => setShowTaskDetail(task.id)}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{task.title}</div>
                        <button onClick={e => {
                    e.stopPropagation();
                    toggleTaskCompletion(task.id);
                  }} className={`w-6 h-6 rounded-full ${completedTasks.includes(task.id) ? 'bg-green-500 text-white' : 'border border-gray-300 bg-white'} flex items-center justify-center`} aria-label={completedTasks.includes(task.id) ? 'Mark as incomplete' : 'Mark as complete'}>
                          {completedTasks.includes(task.id) && <CheckIcon className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        {task.description}
                      </div>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <ClockIcon className="w-3.5 h-3.5 mr-1" />
                        <span>{task.duration} min</span>
                        <div className="mx-2 w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span>{getAssigneeText(task.assignedTo)}</span>
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
          </> : <>
            {/* Week View */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDates.map((date, index) => <div key={index} className={`text-center py-2 ${isToday(date) ? 'bg-blue-100 text-blue-800 rounded-lg' : ''}`}>
                  <div className="text-xs text-gray-500">
                    {date.toLocaleDateString('en-US', {
                weekday: 'short'
              })}
                  </div>
                  <div className={`text-sm ${isToday(date) ? 'font-medium' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>)}
            </div>
            {/* Week Tasks */}
            <div className="space-y-4">
              {careCategories.map(category => <div key={category.id}>
                  <h3 className={`text-sm font-medium text-${category.color}-700 mb-2 flex items-center`}>
                    <div className={`w-6 h-6 rounded-full bg-${category.color}-100 flex items-center justify-center mr-2`}>
                      {cloneElement(category.icon, {
                  className: `w-3.5 h-3.5 text-${category.color}-600`
                })}
                    </div>
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-7 gap-1">
                    {weekDates.map((date, dateIndex) => {
                const dateStr = formatDateForComparison(date);
                const dateTasks = carePlanTasks.filter(task => task.category === category.id && task.date === dateStr);
                return <div key={dateIndex} className="min-h-[80px] border border-gray-200 rounded-lg p-1">
                          {dateTasks.length > 0 ? <div className="space-y-1">
                              {dateTasks.map(task => <div key={task.id} className={`p-1 text-xs rounded ${completedTasks.includes(task.id) ? `bg-${category.color}-100 text-${category.color}-800` : `bg-${category.color}-50 text-${category.color}-700`} cursor-pointer`} onClick={() => setShowTaskDetail(task.id)}>
                                  <div className="font-medium truncate">
                                    {task.title}
                                  </div>
                                  <div className="text-[10px]">
                                    {formatTime(task.time)}
                                  </div>
                                </div>)}
                            </div> : <div className="h-full flex items-center justify-center text-xs text-gray-400">
                              -
                            </div>}
                        </div>;
              })}
                  </div>
                </div>)}
            </div>
          </>}
      </div>
      {/* Task Detail Modal */}
      {showTaskDetail && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              {(() => {
            const task = carePlanTasks.find(t => t.id === showTaskDetail);
            if (!task) return null;
            const category = careCategories.find(c => c.id === task.category);
            return <>
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold">{task.title}</h2>
                      <button onClick={() => setShowTaskDetail(null)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
                        <XIcon className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full bg-${category?.color || 'blue'}-100 flex items-center justify-center mr-3`}>
                          {category?.icon}
                        </div>
                        <div className="font-medium">{category?.name}</div>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Date</div>
                          <div className="font-medium">
                            {new Date(task.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Time</div>
                          <div className="font-medium">
                            {formatTime(task.time)} ({task.duration} minutes)
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <InfoIcon className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-500">
                            Instructions
                          </div>
                          <div className="font-medium">{task.instructions}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <UserIcon className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">
                            Assigned to
                          </div>
                          <div className="font-medium">
                            {getAssigneeText(task.assignedTo)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button onClick={() => {
                  toggleTaskCompletion(task.id);
                  setShowTaskDetail(null);
                }} className={`flex-1 py-2.5 ${completedTasks.includes(task.id) ? 'bg-gray-100 text-gray-700' : 'bg-green-500 text-white'} rounded-lg flex items-center justify-center`}>
                        {completedTasks.includes(task.id) ? <>
                            <XIcon className="w-5 h-5 mr-1" />
                            Mark Incomplete
                          </> : <>
                            <CheckIcon className="w-5 h-5 mr-1" />
                            Mark Complete
                          </>}
                      </button>
                      <button onClick={() => {
                  onTaskDetail(task.id);
                  setShowTaskDetail(null);
                }} className="flex-1 py-2.5 border border-gray-300 rounded-lg flex items-center justify-center">
                        <ArrowRightIcon className="w-5 h-5 mr-1" />
                        Details
                      </button>
                    </div>
                  </>;
          })()}
            </div>
          </div>
        </div>}
    </div>;
};