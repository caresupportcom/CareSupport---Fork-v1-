import React, { useState, useEffect } from 'react'
import {
  ArrowLeftIcon,
  CheckIcon,
  BellIcon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  MapPinIcon,
  ShoppingCartIcon,
  HomeIcon,
  PillIcon,
  UtensilsIcon,
  ShoppingBagIcon,
  ClipboardIcon,
  ActivityIcon,
  InfoIcon,
} from 'lucide-react'
import { storage } from '../../services/StorageService'
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService'
import { useUserProfile } from '../../contexts/UserProfileContext'
import { getRelationshipCategory } from '../../types/UserTypes'
export const SupportPreferencesScreen = ({ onBack }) => {
  const { userProfile, updateUserProfile } = useUserProfile()
  const userId = storage.get('user_id', 'user-123')
  // Get user role category (family, professional, community)
  const userRoleCategory = userProfile?.relationship
    ? getRelationshipCategory(userProfile.relationship)
    : 'community'
  // Determine if this is a community supporter
  const isCommunitySupporter = userRoleCategory === 'community'
  // Task categories the user is interested in helping with
  const [selectedCategories, setSelectedCategories] = useState([])
  // Days of the week the user is available
  const [availableDays, setAvailableDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  })
  // Time range the user is available
  const [timeStart, setTimeStart] = useState('09:00')
  const [timeEnd, setTimeEnd] = useState('17:00')
  // Notification preferences
  const [notifyNewTasks, setNotifyNewTasks] = useState(true)
  const [notifyTaskUpdates, setNotifyTaskUpdates] = useState(true)
  const [notifyTaskReminders, setNotifyTaskReminders] = useState(true)
  // Distance willing to travel
  const [supportDistance, setSupportDistance] = useState('local')
  // Contribution frequency
  const [supportFrequency, setSupportFrequency] = useState('occasional')
  // Loading and success states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  // Fetch user preferences on load
  useEffect(() => {
    // Load saved preferences
    const savedCategories = storage.get(`support_categories_${userId}`, [])
    const savedDays = storage.get(`support_days_${userId}`, {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    })
    const savedTimeStart = storage.get(`support_time_start_${userId}`, '09:00')
    const savedTimeEnd = storage.get(`support_time_end_${userId}`, '17:00')
    const savedNotifyNewTasks = storage.get(`notify_new_tasks_${userId}`, true)
    const savedNotifyTaskUpdates = storage.get(
      `notify_task_updates_${userId}`,
      true,
    )
    const savedNotifyTaskReminders = storage.get(
      `notify_task_reminders_${userId}`,
      true,
    )
    const savedSupportDistance = storage.get(
      `support_distance_${userId}`,
      'local',
    )
    const savedSupportFrequency = storage.get(
      `support_frequency_${userId}`,
      'occasional',
    )
    // Set state with saved values
    setSelectedCategories(savedCategories)
    setAvailableDays(savedDays)
    setTimeStart(savedTimeStart)
    setTimeEnd(savedTimeEnd)
    setNotifyNewTasks(savedNotifyNewTasks)
    setNotifyTaskUpdates(savedNotifyTaskUpdates)
    setNotifyTaskReminders(savedNotifyTaskReminders)
    setSupportDistance(savedSupportDistance)
    setSupportFrequency(savedSupportFrequency)
    setIsLoading(false)
    // Track screen view
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'support_preferences_viewed',
      user_role: userRoleCategory,
    })
  }, [userId, userRoleCategory])
  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category)
      } else {
        return [...prev, category]
      }
    })
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'support_category_toggled',
      category,
    })
  }
  const handleDayToggle = (day) => {
    setAvailableDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }))
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'support_day_toggled',
      day,
    })
  }
  const handleDistanceChange = (distance) => {
    setSupportDistance(distance)
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'support_distance_changed',
      distance,
    })
  }
  const handleFrequencyChange = (frequency) => {
    setSupportFrequency(frequency)
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'support_frequency_changed',
      frequency,
    })
  }
  const handleSavePreferences = () => {
    setIsSaving(true)
    // Save all preferences to storage
    storage.save(`support_categories_${userId}`, selectedCategories)
    storage.save(`support_days_${userId}`, availableDays)
    storage.save(`support_time_start_${userId}`, timeStart)
    storage.save(`support_time_end_${userId}`, timeEnd)
    storage.save(`notify_new_tasks_${userId}`, notifyNewTasks)
    storage.save(`notify_task_updates_${userId}`, notifyTaskUpdates)
    storage.save(`notify_task_reminders_${userId}`, notifyTaskReminders)
    storage.save(`support_distance_${userId}`, supportDistance)
    storage.save(`support_frequency_${userId}`, supportFrequency)
    // Update user profile if available
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        availabilityDetails: {
          scheduledDays: Object.entries(availableDays)
            .filter(([_, isSelected]) => isSelected)
            .map(([day]) => day),
          scheduledHours: {
            start: timeStart,
            end: timeEnd,
          },
        },
        supportPreferences: {
          taskCategories: selectedCategories,
          preferredDays: availableDays,
          preferredTimes: {
            start: timeStart,
            end: timeEnd,
          },
          notificationPreferences: {
            newTasks: notifyNewTasks,
            taskUpdates: notifyTaskUpdates,
            taskReminders: notifyTaskReminders,
          },
          supportDistance,
          supportFrequency,
        },
      }
      updateUserProfile(updatedProfile)
    }
    // Track preferences saved
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'support_preferences_saved',
      categories_count: selectedCategories.length,
      days_selected: Object.values(availableDays).filter(Boolean).length,
    })
    // Show success message
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)
      // Hide success message after a delay
      setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
    }, 1000)
  }
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'driving':
        return <MapPinIcon className="w-5 h-5 text-blue-500" />
      case 'grocery_shopping':
        return <ShoppingCartIcon className="w-5 h-5 text-green-500" />
      case 'keeping_company':
        return <HeartIcon className="w-5 h-5 text-red-500" />
      case 'home_management':
        return <HomeIcon className="w-5 h-5 text-amber-500" />
      case 'managing_medications':
        return <PillIcon className="w-5 h-5 text-purple-500" />
      case 'meal_preparation':
        return <UtensilsIcon className="w-5 h-5 text-orange-500" />
      case 'errands':
        return <ShoppingBagIcon className="w-5 h-5 text-indigo-500" />
      case 'appointment':
        return <ClipboardIcon className="w-5 h-5 text-cyan-500" />
      case 'exercise':
        return <ActivityIcon className="w-5 h-5 text-pink-500" />
      default:
        return <HeartIcon className="w-5 h-5 text-gray-500" />
    }
  }
  const getCategoryLabel = (category) => {
    const labels = {
      driving: 'Transportation',
      grocery_shopping: 'Grocery Shopping',
      keeping_company: 'Companionship',
      home_management: 'Home Management',
      managing_medications: 'Medication Management',
      meal_preparation: 'Meal Preparation',
      errands: 'Errands',
      appointment: 'Appointment Assistance',
      exercise: 'Exercise Support',
    }
    return labels[category] || category.replace('_', ' ')
  }
  const getCategoryDescription = (category) => {
    const descriptions = {
      driving: 'Provide rides to appointments, errands, or social activities',
      grocery_shopping: 'Help with shopping for groceries and household items',
      keeping_company:
        'Provide companionship, conversation, and social interaction',
      home_management:
        'Assist with light housekeeping, laundry, or organization',
      managing_medications: 'Help with medication pickups or reminders',
      meal_preparation: 'Assist with preparing or delivering meals',
      errands: 'Help with various errands like post office, bank, etc.',
      appointment: 'Accompany to medical or other appointments',
      exercise: 'Provide support for walks, physical therapy exercises, etc.',
    }
    return descriptions[category] || ''
  }
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center">
        <button
          onClick={onBack}
          className="mr-3 p-1 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold">Support Preferences</h1>
      </div>

      {/* Success message */}
      {showSuccess && (
        <div className="fixed top-16 inset-x-0 flex justify-center z-50">
          <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg shadow-lg flex items-center">
            <CheckIcon className="w-5 h-5 mr-2" />
            Preferences saved successfully
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Introduction for community supporters */}
        {isCommunitySupporter && (
          <div className="bg-blue-50 p-4 rounded-lg mb-5">
            <div className="flex">
              <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1">
                  Your Support Matters
                </h3>
                <p className="text-sm text-blue-700">
                  By setting your preferences, you'll receive notifications for
                  help requests that match your availability and interests. This
                  helps you provide support in ways that work best for you.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Support Categories */}
        <section className="mb-6">
          <h2 className="text-lg font-medium mb-3">
            {isCommunitySupporter
              ? 'How would you like to help?'
              : 'What kind of help do you need?'}
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            {isCommunitySupporter
              ? `Select the types of tasks you`
              : `re comfortable helping with`}
            {isCommunitySupporter
              ? 'Select the types of tasks you'
              : 'Select the types of tasks you typically need help with'}
          </p>{' '}
          <div className="space-y-3">
            {[
              'driving',
              'grocery_shopping',
              'keeping_company',
              'home_management',
              'managing_medications',
              'meal_preparation',
              'errands',
              'appointment',
              'exercise',
            ].map((category) => (
              <div
                key={category}
                className={`p-3 rounded-lg border ${
                  selectedCategories.includes(category)
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200'
                } cursor-pointer hover:bg-gray-50`}
                onClick={() => handleCategoryToggle(category)}
              >
                <div className="flex items-center">
                  <div className="mr-3">{getCategoryIcon(category)}</div>
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {getCategoryLabel(category)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getCategoryDescription(category)}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-500 flex items-center justify-center'
                        : 'border border-gray-300'
                    }`}
                  >
                    {selectedCategories.includes(category) && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Availability */}
        <section className="mb-6">
          <h2 className="text-lg font-medium mb-3">Availability</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium mb-3 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
              Days of the week
            </h3>
            <div className="grid grid-cols-7 gap-2 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div
                  key={index}
                  className="text-center text-xs font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[
                { key: 'sunday', label: 'S' },
                { key: 'monday', label: 'M' },
                { key: 'tuesday', label: 'T' },
                { key: 'wednesday', label: 'W' },
                { key: 'thursday', label: 'T' },
                { key: 'friday', label: 'F' },
                { key: 'saturday', label: 'S' },
              ].map((day) => (
                <button
                  key={day.key}
                  className={`w-full aspect-square rounded-full ${
                    availableDays[day.key]
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => handleDayToggle(day.key)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <ClockIcon className="w-4 h-4 mr-2 text-blue-500" />
              Time of day
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Start time
                </label>
                <input
                  type="time"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  End time
                </label>
                <input
                  type="time"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* For community supporters: Distance willing to travel */}
        {isCommunitySupporter && (
          <section className="mb-6">
            <h2 className="text-lg font-medium mb-3">Distance</h2>
            <p className="text-sm text-gray-500 mb-3">
              How far are you willing to travel to provide help?
            </p>
            <div className="space-y-2">
              {[
                {
                  id: 'neighborhood',
                  label: 'My Neighborhood',
                  description: 'Within walking distance',
                },
                {
                  id: 'local',
                  label: 'Local Area',
                  description: 'Within 5-10 miles',
                },
                {
                  id: 'regional',
                  label: 'Regional',
                  description: 'Within 25 miles',
                },
                {
                  id: 'remote',
                  label: 'Remote Support',
                  description: 'Virtual assistance only',
                },
              ].map((option) => (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg border ${
                    supportDistance === option.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200'
                  } cursor-pointer hover:bg-gray-50`}
                  onClick={() => handleDistanceChange(option.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-3 ${
                        supportDistance === option.id
                          ? 'border-4 border-blue-500'
                          : 'border border-gray-300'
                      }`}
                    ></div>
                    <div>
                      <h3 className="font-medium">{option.label}</h3>
                      <p className="text-xs text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* For community supporters: Frequency */}
        {isCommunitySupporter && (
          <section className="mb-6">
            <h2 className="text-lg font-medium mb-3">Frequency</h2>
            <p className="text-sm text-gray-500 mb-3">
              How often are you available to help?
            </p>
            <div className="space-y-2">
              {[
                {
                  id: 'weekly',
                  label: 'Weekly',
                  description: 'Regular weekly commitment',
                },
                {
                  id: 'monthly',
                  label: 'Monthly',
                  description: 'Several times per month',
                },
                {
                  id: 'occasional',
                  label: 'Occasional',
                  description: 'As needed, no regular schedule',
                },
                {
                  id: 'emergency',
                  label: 'Emergency Only',
                  description: 'Only in urgent situations',
                },
              ].map((option) => (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg border ${
                    supportFrequency === option.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200'
                  } cursor-pointer hover:bg-gray-50`}
                  onClick={() => handleFrequencyChange(option.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-3 ${
                        supportFrequency === option.id
                          ? 'border-4 border-blue-500'
                          : 'border border-gray-300'
                      }`}
                    ></div>
                    <div>
                      <h3 className="font-medium">{option.label}</h3>
                      <p className="text-xs text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notification Preferences */}
        <section className="mb-6">
          <h2 className="text-lg font-medium mb-3">Notifications</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BellIcon className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-sm">New help requests</span>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="notifyNewTasks"
                    checked={notifyNewTasks}
                    onChange={() => setNotifyNewTasks(!notifyNewTasks)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="notifyNewTasks"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${notifyNewTasks ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BellIcon className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-sm">Task updates</span>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="notifyTaskUpdates"
                    checked={notifyTaskUpdates}
                    onChange={() => setNotifyTaskUpdates(!notifyTaskUpdates)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="notifyTaskUpdates"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${notifyTaskUpdates ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BellIcon className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-sm">Task reminders</span>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="notifyTaskReminders"
                    checked={notifyTaskReminders}
                    onChange={() =>
                      setNotifyTaskReminders(!notifyTaskReminders)
                    }
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="notifyTaskReminders"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${notifyTaskReminders ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          className={`w-full py-3 rounded-lg font-medium ${isSaving ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white'}`}
          onClick={handleSavePreferences}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: white;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #3b82f6;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          border-color: #e5e7eb;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: background-color 0.3s;
        }
      `}</style>
    </div>
  )
}
