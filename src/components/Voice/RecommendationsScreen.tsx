import React, { useEffect, useState } from 'react';
import { XIcon, LightbulbIcon, CheckIcon, FilterIcon, InfoIcon, ChevronDownIcon, ChevronUpIcon, ArrowLeftIcon, SaveIcon, ClockIcon, CalendarIcon, BellIcon, UserIcon, CheckCircleIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { ActionRecommendation } from './ActionRecommendation';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { BracketText } from '../Common/BracketText';
import { useAccessibility } from '../../contexts/AccessibilityContext';
export const RecommendationsScreen = ({
  onComplete,
  transcription,
  privacyLevel
}) => {
  const {
    highContrast
  } = useAccessibility();
  const [selectedRecommendations, setSelectedRecommendations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('analyzing');
  // Simulate processing stages with progress
  useEffect(() => {
    if (isLoading) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setProcessingProgress(Math.min(progress, 100));
        if (progress === 30) {
          setProcessingStage('identifying');
        } else if (progress === 60) {
          setProcessingStage('generating');
        } else if (progress === 90) {
          setProcessingStage('finalizing');
        } else if (progress >= 100) {
          clearInterval(interval);
          // Generate recommendations after progress reaches 100%
          setTimeout(() => {
            generateRecommendations();
          }, 500);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isLoading]);
  // Generate recommendations based on transcription
  const generateRecommendations = () => {
    // In a real app, this would be an API call to an AI service
    // Generate recommendations based on the transcription content
    let generatedRecommendations = [];
    // If no transcription is provided, use a default example
    if (!transcription || transcription.trim() === '') {
      setRecommendations([{
        id: 'no-input',
        title: 'No Input Detected',
        type: 'Error',
        description: 'Please provide some information to get recommendations',
        audience: 'Only you',
        icon: 'alert-circle',
        priority: 'high',
        category: 'system',
        explanation: 'We need some details about your care activities to provide relevant recommendations.'
      }]);
      setIsLoading(false);
      return;
    }
    // Handle specific example prompts with pre-defined recommendations
    if (transcription === "I just finished Eleanor's grocery shopping and she seemed in good spirits today") {
      // Example 1: Grocery shopping and mood observation
      generatedRecommendations = [{
        id: 'shopping-complete',
        title: 'Log Shopping Completion',
        type: 'Task',
        description: 'Mark grocery shopping task as completed',
        audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
        icon: 'check-circle',
        priority: 'high',
        category: 'tasks',
        explanation: 'Marking tasks as complete helps the care team track what has been done and what still needs attention.'
      }, {
        id: 'mood-log-positive',
        title: 'Log Positive Mood',
        type: 'Health',
        description: 'Record that Eleanor was in good spirits today',
        audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
        icon: 'smile',
        priority: 'medium',
        category: 'health',
        explanation: 'Tracking mood helps identify patterns and ensures the care team is aware of the emotional wellbeing of the care recipient.'
      }, {
        id: 'update-shopping-list',
        title: 'Update Shopping List',
        type: 'Task',
        description: 'Record what was purchased and update future needs',
        audience: 'Care team',
        icon: 'shopping-cart',
        priority: 'medium',
        category: 'tasks',
        explanation: 'Keeping the shopping list current ensures needed items are obtained and prevents duplicate purchases.'
      }, {
        id: 'share-positive-update',
        title: 'Share Positive Update',
        type: 'Communication',
        description: "Let the care team know about Eleanor's good mood",
        audience: 'Care team',
        icon: 'message-square',
        priority: 'low',
        category: 'communication',
        explanation: "Sharing positive updates boosts team morale and provides important context about the care recipient's wellbeing."
      }];
    } else if (transcription === "I'm available to drive Eleanor to her appointment next Tuesday") {
      // Example 2: Transportation availability
      generatedRecommendations = [{
        id: 'update-availability',
        title: 'Update Availability',
        type: 'Schedule',
        description: 'Record your availability for Tuesday in the team calendar',
        audience: 'Care team',
        icon: 'calendar',
        priority: 'high',
        category: 'schedule',
        explanation: 'Updating your availability helps the care team coordinate schedules and ensures care coverage.'
      }, {
        id: 'transportation-assignment',
        title: 'Assign Transportation Task',
        type: 'Task',
        description: "Officially assign yourself as driver for Tuesday's appointment",
        audience: 'Care team',
        icon: 'car',
        priority: 'high',
        category: 'tasks',
        explanation: 'Formally assigning transportation responsibilities ensures clarity about who is handling this task.'
      }, {
        id: 'appointment-details',
        title: 'Confirm Appointment Details',
        type: 'Schedule',
        description: 'Verify time, location, and any special instructions',
        audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
        icon: 'info',
        priority: 'medium',
        category: 'schedule',
        explanation: 'Confirming details in advance helps avoid confusion and ensures proper preparation for the appointment.'
      }, {
        id: 'transportation-checklist',
        title: 'Create Transportation Checklist',
        type: 'Task',
        description: 'List items needed for the appointment (insurance card, medication list, etc.)',
        audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
        icon: 'list',
        priority: 'low',
        category: 'tasks',
        explanation: 'A checklist helps ensure all necessary items are brought to the appointment.'
      }];
    } else if (transcription === "Eleanor's medication was refilled today - we now have a 30-day supply") {
      // Example 3: Medication refill
      generatedRecommendations = [{
        id: 'update-medication-inventory',
        title: 'Update Medication Inventory',
        type: 'Health',
        description: 'Record the refill and update the medication supply tracker',
        audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
        icon: 'package',
        priority: 'high',
        category: 'health',
        explanation: 'Keeping medication inventory up to date helps prevent running out of important medications.'
      }, {
        id: 'set-refill-reminder',
        title: 'Set Next Refill Reminder',
        type: 'Reminder',
        description: 'Schedule a reminder to refill in 25 days',
        audience: 'Care team',
        icon: 'bell',
        priority: 'medium',
        category: 'health',
        explanation: 'Setting a reminder in advance ensures the next refill is requested before the supply runs out.'
      }, {
        id: 'medication-expense-log',
        title: 'Log Medication Expense',
        type: 'Finance',
        description: 'Record the cost of the medication refill',
        audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
        icon: 'dollar-sign',
        priority: 'low',
        category: 'finance',
        explanation: 'Tracking medication expenses helps with budgeting and potential insurance reimbursements.'
      }, {
        id: 'medication-schedule-check',
        title: 'Review Medication Schedule',
        type: 'Health',
        description: 'Ensure the medication administration schedule is up to date',
        audience: 'Care team',
        icon: 'clock',
        priority: 'medium',
        category: 'health',
        explanation: 'Regularly reviewing the medication schedule helps ensure proper administration and dosing.'
      }];
    } else if (transcription === 'Dad had trouble sleeping last night and seemed confused this morning') {
      // Example 4: Sleep issues and confusion
      generatedRecommendations = [{
        id: 'health-alert',
        title: 'Create Health Alert',
        type: 'Alert',
        description: 'Notify care team about sleep issues and confusion',
        audience: 'Care team',
        icon: 'alert-triangle',
        priority: 'high',
        category: 'health',
        explanation: 'Sleep disturbances and confusion can be signs of health issues that require attention.'
      }, {
        id: 'symptom-log',
        title: 'Log Sleep and Cognitive Symptoms',
        type: 'Health',
        description: 'Record details about sleep issues and confusion',
        audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
        icon: 'activity',
        priority: 'high',
        category: 'health',
        explanation: 'Detailed symptom tracking helps identify patterns and provides valuable information for healthcare providers.'
      }, {
        id: 'provider-notification',
        title: 'Notify Healthcare Provider',
        type: 'Communication',
        description: 'Contact doctor about these new symptoms',
        audience: 'Healthcare providers',
        icon: 'phone',
        priority: 'high',
        category: 'health',
        explanation: 'Sudden confusion can be a sign of various medical issues that may require professional evaluation.'
      }, {
        id: 'monitoring-schedule',
        title: 'Create Monitoring Schedule',
        type: 'Task',
        description: 'Set up regular checks throughout the day',
        audience: 'Care team',
        icon: 'eye',
        priority: 'medium',
        category: 'tasks',
        explanation: 'Regular monitoring helps track if symptoms are improving or worsening and ensures safety.'
      }, {
        id: 'sleep-environment-check',
        title: 'Review Sleep Environment',
        type: 'Task',
        description: 'Check bedroom conditions and nighttime routine',
        audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
        icon: 'moon',
        priority: 'medium',
        category: 'tasks',
        explanation: 'Environmental factors like light, noise, and temperature can affect sleep quality.'
      }];
    } else if (transcription === "I noticed Mom's appetite has improved since starting the new medication") {
      // Example 5: Improved appetite
      generatedRecommendations = [{
        id: 'positive-medication-effect',
        title: 'Log Medication Effect',
        type: 'Health',
        description: 'Record the positive effect of new medication on appetite',
        audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
        icon: 'thumbs-up',
        priority: 'high',
        category: 'health',
        explanation: 'Tracking medication effects helps evaluate if treatments are working as expected.'
      }, {
        id: 'provider-update',
        title: 'Update Healthcare Provider',
        type: 'Communication',
        description: 'Share positive medication response with doctor',
        audience: 'Healthcare providers',
        icon: 'message-square',
        priority: 'medium',
        category: 'communication',
        explanation: 'Keeping healthcare providers informed about medication effects helps with treatment planning.'
      }, {
        id: 'nutrition-tracking',
        title: 'Start Nutrition Tracking',
        type: 'Health',
        description: 'Monitor food intake to maintain improvement',
        audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
        icon: 'clipboard',
        priority: 'medium',
        category: 'health',
        explanation: 'Tracking nutrition helps ensure adequate intake and continued improvement.'
      }, {
        id: 'meal-planning',
        title: 'Update Meal Plan',
        type: 'Task',
        description: 'Adjust meal planning to support improved appetite',
        audience: 'Care team',
        icon: 'coffee',
        priority: 'low',
        category: 'tasks',
        explanation: 'Adapting meal plans to changing appetite helps ensure proper nutrition and enjoyment of food.'
      }];
    } else {
      // Default pattern matching for other inputs
      const lowerTranscription = transcription.toLowerCase();
      // Medication related recommendations
      if (lowerTranscription.includes('medication') || lowerTranscription.includes('pill') || lowerTranscription.includes('medicine') || lowerTranscription.includes('dose') || lowerTranscription.includes('prescription') || lowerTranscription.includes('refill')) {
        generatedRecommendations.push({
          id: 'medication-reminder',
          title: 'Set Medication Reminder',
          type: 'Reminder',
          description: 'Create an automated reminder for medication administration',
          audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
          icon: 'pill',
          priority: 'high',
          category: 'health',
          explanation: 'Medication reminders help ensure consistent administration and reduce missed doses. Based on your message mentioning medication, this will create a structured reminder with time and dosage details.'
        });
        generatedRecommendations.push({
          id: 'medication-log',
          title: 'Log Medication Administration',
          type: 'Health',
          description: 'Record that medication was given with relevant details',
          audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
          icon: 'clipboard',
          priority: 'medium',
          category: 'health',
          explanation: 'Tracking medication administration creates a historical record that can be useful for healthcare providers and ensures everyone knows what medications have been given.'
        });
        // If refill is mentioned
        if (lowerTranscription.includes('refill') || lowerTranscription.includes('prescription') || lowerTranscription.includes('pharmacy') || lowerTranscription.includes('supply')) {
          generatedRecommendations.push({
            id: 'medication-supply',
            title: 'Update Medication Supply',
            type: 'Inventory',
            description: 'Track current supply and set refill reminders',
            audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
            icon: 'package',
            priority: 'medium',
            category: 'health',
            explanation: 'Tracking medication supply helps prevent running out of important medications and provides advance notice when refills are needed.'
          });
        }
      }
      // Transportation/appointment related recommendations
      if (lowerTranscription.includes('appointment') || lowerTranscription.includes('drive') || lowerTranscription.includes('doctor') || lowerTranscription.includes('visit') || lowerTranscription.includes('hospital') || lowerTranscription.includes('next') && (lowerTranscription.includes('tuesday') || lowerTranscription.includes('monday') || lowerTranscription.includes('wednesday') || lowerTranscription.includes('thursday') || lowerTranscription.includes('friday'))) {
        generatedRecommendations.push({
          id: 'calendar-event',
          title: 'Add to Calendar',
          type: 'Calendar',
          description: 'Schedule this appointment or transportation need',
          audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
          icon: 'calendar',
          priority: 'high',
          category: 'schedule',
          explanation: 'Adding transportation and appointments to the shared calendar ensures everyone knows about upcoming commitments and can plan accordingly.'
        });
        generatedRecommendations.push({
          id: 'transportation-coordination',
          title: 'Coordinate Transportation',
          type: 'Task',
          description: 'Assign driving responsibilities and confirm details',
          audience: 'Care team',
          icon: 'car',
          priority: 'medium',
          category: 'schedule',
          explanation: 'This will help coordinate who is responsible for transportation, including pickup times, locations, and any special requirements.'
        });
        // If it's about availability
        if (lowerTranscription.includes('available') || lowerTranscription.includes('can drive') || lowerTranscription.includes('can take') || lowerTranscription.includes("i'm free")) {
          generatedRecommendations.push({
            id: 'update-availability',
            title: 'Update Availability',
            type: 'Notification',
            description: 'Let the care team know when you can help',
            audience: 'Care team',
            icon: 'clock',
            priority: 'medium',
            category: 'communication',
            explanation: 'Sharing your availability helps the care team coordinate schedules more effectively and ensures care coverage.'
          });
        }
      }
      // Shopping/errands related recommendations
      if (lowerTranscription.includes('grocery') || lowerTranscription.includes('shopping') || lowerTranscription.includes('store') || lowerTranscription.includes('bought') || lowerTranscription.includes('purchased') || lowerTranscription.includes('errand')) {
        generatedRecommendations.push({
          id: 'shopping-list',
          title: 'Update Shopping List',
          type: 'Task',
          description: 'Add or mark items as purchased',
          audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
          icon: 'shopping-cart',
          priority: 'medium',
          category: 'tasks',
          explanation: 'Keeping the shopping list updated helps prevent duplicate purchases and ensures needed items are obtained in a timely manner.'
        });
        generatedRecommendations.push({
          id: 'expense-tracking',
          title: 'Log Care Expenses',
          type: 'Finance',
          description: 'Track purchases made for care recipient',
          audience: privacyLevel === 'team' ? 'Care team' : privacyLevel === 'private' ? 'Only you' : 'Public',
          icon: 'dollar-sign',
          priority: 'low',
          category: 'finance',
          explanation: 'Tracking care-related expenses helps with budgeting, reimbursement, and financial planning for ongoing care needs.'
        });
      }
      // Mood/condition observations
      if (lowerTranscription.includes('mood') || lowerTranscription.includes('spirit') || lowerTranscription.includes('happy') || lowerTranscription.includes('sad') || lowerTranscription.includes('depressed') || lowerTranscription.includes('anxious') || lowerTranscription.includes('confused') || lowerTranscription.includes('agitated') || lowerTranscription.includes('calm') || lowerTranscription.includes('good spirit')) {
        generatedRecommendations.push({
          id: 'mood-log',
          title: 'Log Mood Observation',
          type: 'Health',
          description: 'Record observations about emotional state',
          audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
          icon: 'heart',
          priority: 'high',
          category: 'health',
          explanation: 'Tracking mood and emotional states helps identify patterns, triggers, and the effectiveness of interventions or medications.'
        });
        // If negative mood indicators
        if (lowerTranscription.includes('sad') || lowerTranscription.includes('depressed') || lowerTranscription.includes('anxious') || lowerTranscription.includes('confused') || lowerTranscription.includes('agitated') || lowerTranscription.includes('worried') || lowerTranscription.includes('concern')) {
          generatedRecommendations.push({
            id: 'wellbeing-check',
            title: 'Schedule Wellbeing Check',
            type: 'Task',
            description: 'Plan a follow-up to monitor emotional state',
            audience: 'Care team',
            icon: 'activity',
            priority: 'high',
            category: 'health',
            explanation: 'When mood concerns are noted, scheduling a follow-up check helps ensure the situation is monitored and addressed appropriately.'
          });
        }
      }
      // Physical health observations
      if (lowerTranscription.includes('pain') || lowerTranscription.includes('symptom') || lowerTranscription.includes('fell') || lowerTranscription.includes('dizzy') || lowerTranscription.includes('appetite') || lowerTranscription.includes('sleep') || lowerTranscription.includes('tired') || lowerTranscription.includes('energy')) {
        generatedRecommendations.push({
          id: 'symptom-tracker',
          title: 'Log Health Observation',
          type: 'Health',
          description: 'Record physical symptoms or health changes',
          audience: privacyLevel === 'private' ? 'Only you' : 'Care team',
          icon: 'activity',
          priority: 'high',
          category: 'health',
          explanation: 'Documenting health observations creates a record that can help healthcare providers identify patterns and make better treatment decisions.'
        });
        // If potentially serious
        if (lowerTranscription.includes('fell') || lowerTranscription.includes('pain') || lowerTranscription.includes('severe') || lowerTranscription.includes('worse')) {
          generatedRecommendations.push({
            id: 'provider-alert',
            title: 'Alert Healthcare Provider',
            type: 'Alert',
            description: 'Notify doctor or nurse about this observation',
            audience: 'Healthcare providers',
            icon: 'alert-circle',
            priority: 'high',
            category: 'health',
            explanation: 'Some health changes warrant prompt medical attention. This alert will notify the appropriate healthcare providers about your observation.'
          });
        }
      }
      // Always add a general update option
      generatedRecommendations.push({
        id: 'general-update',
        title: 'Share Care Update',
        type: 'Notification',
        description: 'Post this information to the care feed',
        audience: privacyLevel === 'private' ? 'Only you' : privacyLevel === 'team' ? 'Care team' : 'Public',
        icon: 'message',
        priority: 'medium',
        category: 'communication',
        explanation: "Sharing general updates keeps everyone informed about the care recipient's status, activities, and needs without requiring specific actions."
      });
    }
    // Sort by priority
    const priorityOrder = {
      high: 0,
      medium: 1,
      low: 2
    };
    generatedRecommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    setRecommendations(generatedRecommendations);
    setIsLoading(false);
    // Auto-select high priority recommendations
    const highPriorityIds = generatedRecommendations.filter(rec => rec.priority === 'high').map(rec => rec.id);
    setSelectedRecommendations(highPriorityIds);
    analytics.trackEvent(AnalyticsEvents.VOICE_RECOMMENDATIONS_GENERATED, {
      recommendation_count: generatedRecommendations.length,
      transcription_length: transcription.length,
      high_priority_count: highPriorityIds.length,
      privacy_level: privacyLevel
    });
  };
  const toggleRecommendation = id => {
    setSelectedRecommendations(prev => {
      if (prev.includes(id)) {
        return prev.filter(recId => recId !== id);
      } else {
        return [...prev, id];
      }
    });
    // Find the recommendation to get its details
    const recommendation = recommendations.find(rec => rec.id === id);
    if (recommendation) {
      analytics.trackFeatureUsage('recommendation_toggled', {
        recommendation_id: id,
        recommendation_type: recommendation.type,
        recommendation_priority: recommendation.priority,
        selected: !selectedRecommendations.includes(id)
      });
    }
  };
  const handleCreateSelected = () => {
    // In a real app, this would create the selected actions in the system
    // Get the selected recommendations for analytics
    const selectedRecs = recommendations.filter(rec => selectedRecommendations.includes(rec.id));
    analytics.trackEvent(AnalyticsEvents.VOICE_RECOMMENDATIONS_CREATED, {
      selected_count: selectedRecommendations.length,
      total_count: recommendations.length,
      selected_types: selectedRecs.map(rec => rec.type).join(','),
      selected_priorities: selectedRecs.map(rec => rec.priority).join(','),
      privacy_level: privacyLevel
    });
    onComplete();
  };
  const handleCancel = () => {
    analytics.trackFeatureUsage('recommendations_cancelled', {
      stage: isLoading ? 'loading' : 'review',
      recommendations_count: recommendations.length,
      selected_count: selectedRecommendations.length
    });
    onComplete();
  };
  const handleSelectAll = () => {
    if (selectedRecommendations.length === recommendations.length) {
      // If all are selected, deselect all
      setSelectedRecommendations([]);
      analytics.trackFeatureUsage('deselect_all_recommendations');
    } else {
      // Otherwise select all
      setSelectedRecommendations(recommendations.map(rec => rec.id));
      analytics.trackFeatureUsage('select_all_recommendations');
    }
  };
  const handleFilterChange = filter => {
    setActiveFilter(filter);
    analytics.trackFeatureUsage('filter_recommendations', {
      filter_type: filter
    });
  };
  // Filter recommendations based on active filter
  const filteredRecommendations = activeFilter === 'all' ? recommendations : recommendations.filter(rec => rec.category === activeFilter);
  // Group recommendations by category for better organization
  const groupedRecommendations = filteredRecommendations.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});
  // Count recommendations by category
  const categoryCounts = recommendations.reduce((counts, item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
    return counts;
  }, {});
  // Get category label
  const getCategoryLabel = category => {
    switch (category) {
      case 'health':
        return 'Health & Wellbeing';
      case 'schedule':
        return 'Schedule & Appointments';
      case 'tasks':
        return 'Tasks & To-Dos';
      case 'communication':
        return 'Updates & Communication';
      case 'finance':
        return 'Financial & Resources';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };
  // Get category icon
  const getCategoryIcon = category => {
    switch (category) {
      case 'health':
        return <ActivityIcon className="w-5 h-5" />;
      case 'schedule':
        return <CalendarIcon className="w-5 h-5" />;
      case 'tasks':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'communication':
        return <MessageSquareIcon className="w-5 h-5" />;
      case 'finance':
        return <DollarSignIcon className="w-5 h-5" />;
      default:
        return <InfoIcon className="w-5 h-5" />;
    }
  };
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center bg-white border-b border-gray-200">
        <button onClick={handleCancel} className="mr-4" aria-label="Close recommendations">
          <XIcon className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center flex-1 justify-center">
          <LightbulbIcon className="w-5 h-5 text-green-500 mr-2" />
          <h1 className="text-xl font-semibold pr-6">Smart Recommendations</h1>
        </div>
      </div>

      {!isLoading && <div className="px-6 py-3 bg-white border-b border-gray-200 flex justify-between items-center">
          <p className="text-gray-500 text-sm">Based on your input</p>
          <div className="flex items-center">
            <button onClick={() => setShowExplanation(!showExplanation)} className="text-blue-500 text-sm flex items-center mr-4" aria-label="Show recommendation explanations">
              <InfoIcon className="w-4 h-4 mr-1" />
              Why these suggestions?
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center ${showFilters ? 'text-blue-500' : 'text-gray-500'}`} aria-label="Filter recommendations">
              <FilterIcon className="w-5 h-5" />
            </button>
          </div>
        </div>}

      {/* Filters Bar - Only show when filters are active and loading is complete */}
      {showFilters && !isLoading && <div className="bg-white border-b border-gray-200 px-6 py-2 overflow-x-auto">
          <div className="flex space-x-2">
            <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleFilterChange('all')}>
              All ({recommendations.length})
            </button>
            {Object.keys(categoryCounts).map(category => <button key={category} className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center ${activeFilter === category ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleFilterChange(category)}>
                {getCategoryIcon(category)}
                <span className="ml-1">
                  {getCategoryLabel(category)} ({categoryCounts[category]})
                </span>
              </button>)}
          </div>
        </div>}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className={`${highContrast ? 'bg-white border-2 border-gray-400' : 'bg-gray-100 rounded-xl'} p-4 mb-6`}>
            <h2 className="text-sm font-medium text-gray-500 mb-2">
              You said:
            </h2>
            <p className="text-gray-800 font-medium">"{transcription}"</p>
          </div>

          {isLoading ? <div className="py-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 relative mb-6">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" style={{
              clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`
            }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-500">
                    {processingProgress}%
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Analyzing your input...
              </h3>
              <p className="text-gray-500 text-center mb-6">
                {processingStage === 'analyzing' && 'Analyzing context and intent...'}
                {processingStage === 'identifying' && 'Identifying care needs and priorities...'}
                {processingStage === 'generating' && 'Generating personalized recommendations...'}
                {processingStage === 'finalizing' && 'Finalizing your suggestions...'}
              </p>
              <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start">
                  <LightbulbIcon className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">
                      How this works
                    </h4>
                    <p className="text-sm text-gray-600">
                      Voice-to-Recommend™ analyzes your input to understand
                      context, identifies care needs, and generates personalized
                      action recommendations based on care best practices.
                    </p>
                  </div>
                </div>
              </div>
            </div> : <>
              {showExplanation && <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-blue-700 mb-1">
                        How these recommendations were created
                      </h3>
                      <p className="text-sm text-blue-700 mb-2">
                        Based on your input, our AI identified key care needs
                        and generated personalized recommendations. These
                        suggestions are designed to help you track important
                        information, coordinate care, and maintain consistent
                        communication with your care team.
                      </p>
                      <button onClick={() => setShowExplanation(false)} className="text-sm font-medium text-blue-700 underline">
                        Hide explanation
                      </button>
                    </div>
                  </div>
                </div>}

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">
                  <BracketText active={true}>Recommended Actions</BracketText>
                </h2>
                <button onClick={handleSelectAll} className="text-sm text-blue-600 font-medium">
                  {selectedRecommendations.length === recommendations.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {Object.keys(groupedRecommendations).length === 0 ? <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FilterIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    No matching recommendations
                  </h3>
                  <p className="text-gray-500">
                    Try changing your filter selection
                  </p>
                  <button onClick={() => handleFilterChange('all')} className="mt-4 text-blue-600 font-medium">
                    Show all recommendations
                  </button>
                </div> : <div className="space-y-6 mb-6">
                  {Object.entries(groupedRecommendations).map(([category, recs]) => <div key={category}>
                        <div className="flex items-center mb-3">
                          {getCategoryIcon(category)}
                          <h3 className="text-lg font-medium ml-2">
                            {getCategoryLabel(category)}
                          </h3>
                        </div>
                        <div className="space-y-4">
                          {recs.map(recommendation => <ActionRecommendation key={recommendation.id} recommendation={recommendation} isSelected={selectedRecommendations.includes(recommendation.id)} onToggle={() => toggleRecommendation(recommendation.id)} showExplanation={showExplanation} />)}
                        </div>
                      </div>)}
                </div>}

              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-700 font-medium">
                      {selectedRecommendations.length} of{' '}
                      {recommendations.length} recommendations selected
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                      Selected items will be created and shared according to
                      your privacy settings
                    </p>
                  </div>
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center border border-blue-200">
                    <span className="text-xl font-semibold text-blue-500">
                      {selectedRecommendations.length}
                    </span>
                  </div>
                </div>
              </div>
            </>}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white flex space-x-4">
        <Button variant="secondary" onClick={handleCancel} className="flex-1" ariaLabel="Not now">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleCreateSelected} className="flex-1" disabled={selectedRecommendations.length === 0 || isLoading} ariaLabel="Create selected recommendations">
          <SaveIcon className="w-4 h-4 mr-2" />
          Create Selected ({selectedRecommendations.length})
        </Button>
      </div>
    </div>;
};
// Additional icons needed
const ActivityIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>;
const MessageSquareIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>;
const DollarSignIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>;