import React, { useState } from 'react';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, InfoIcon, AlertTriangleIcon, PillIcon, ClipboardIcon, PackageIcon, CalendarIcon, CarIcon, ShoppingCartIcon, DollarSignIcon, HeartIcon, ActivityIcon, AlertCircleIcon, MessageSquareIcon, CheckCircleIcon, ClockIcon, EyeIcon, MoonIcon, ThumbsUpIcon, PhoneIcon, ListIcon, CoffeeIcon, SmileIcon } from 'lucide-react';
export const ActionRecommendation = ({
  recommendation,
  isSelected,
  onToggle,
  showExplanation = false
}) => {
  const [expanded, setExpanded] = useState(false);
  // Get icon based on icon name in recommendation
  const getIcon = iconName => {
    switch (iconName) {
      case 'alert-triangle':
        return <AlertTriangleIcon className="w-5 h-5" />;
      case 'alert-circle':
        return <AlertCircleIcon className="w-5 h-5" />;
      case 'pill':
        return <PillIcon className="w-5 h-5" />;
      case 'clipboard':
        return <ClipboardIcon className="w-5 h-5" />;
      case 'package':
        return <PackageIcon className="w-5 h-5" />;
      case 'calendar':
        return <CalendarIcon className="w-5 h-5" />;
      case 'car':
        return <CarIcon className="w-5 h-5" />;
      case 'shopping-cart':
        return <ShoppingCartIcon className="w-5 h-5" />;
      case 'dollar-sign':
        return <DollarSignIcon className="w-5 h-5" />;
      case 'heart':
        return <HeartIcon className="w-5 h-5" />;
      case 'activity':
        return <ActivityIcon className="w-5 h-5" />;
      case 'message':
      case 'message-square':
        return <MessageSquareIcon className="w-5 h-5" />;
      case 'check-circle':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'clock':
        return <ClockIcon className="w-5 h-5" />;
      case 'eye':
        return <EyeIcon className="w-5 h-5" />;
      case 'moon':
        return <MoonIcon className="w-5 h-5" />;
      case 'thumbs-up':
        return <ThumbsUpIcon className="w-5 h-5" />;
      case 'phone':
        return <PhoneIcon className="w-5 h-5" />;
      case 'list':
        return <ListIcon className="w-5 h-5" />;
      case 'coffee':
        return <CoffeeIcon className="w-5 h-5" />;
      case 'smile':
        return <SmileIcon className="w-5 h-5" />;
      case 'info':
        return <InfoIcon className="w-5 h-5" />;
      default:
        return <InfoIcon className="w-5 h-5" />;
    }
  };
  // Get priority styling
  const getPriorityStyle = priority => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  // Get category styling
  const getCategoryStyle = category => {
    switch (category) {
      case 'health':
        return 'border-blue-200';
      case 'schedule':
        return 'border-purple-200';
      case 'tasks':
        return 'border-green-200';
      case 'communication':
        return 'border-yellow-200';
      case 'finance':
        return 'border-orange-200';
      default:
        return 'border-gray-200';
    }
  };
  // Get type badge styling
  const getTypeBadgeStyle = type => {
    switch (type.toLowerCase()) {
      case 'health':
        return 'bg-blue-50 text-blue-700';
      case 'reminder':
        return 'bg-purple-50 text-purple-700';
      case 'task':
        return 'bg-green-50 text-green-700';
      case 'calendar':
        return 'bg-indigo-50 text-indigo-700';
      case 'notification':
      case 'communication':
        return 'bg-yellow-50 text-yellow-700';
      case 'alert':
        return 'bg-red-50 text-red-700';
      case 'inventory':
        return 'bg-cyan-50 text-cyan-700';
      case 'finance':
        return 'bg-orange-50 text-orange-700';
      case 'schedule':
        return 'bg-violet-50 text-violet-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };
  return <div className={`border rounded-xl overflow-hidden ${getCategoryStyle(recommendation.category)} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="bg-white">
        <div className="p-4">
          <div className="flex items-start">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {getIcon(recommendation.icon)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{recommendation.title}</h3>
                <button onClick={onToggle} className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`} aria-label={isSelected ? 'Deselect recommendation' : 'Select recommendation'}>
                  {isSelected && <CheckIcon className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {recommendation.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadgeStyle(recommendation.type)}`}>
                  {recommendation.type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityStyle(recommendation.priority)}`}>
                  {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)}{' '}
                  Priority
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 flex items-center">
                  <UserGroupIcon className="w-3 h-3 mr-1" />
                  {recommendation.audience}
                </span>
              </div>
            </div>
          </div>
          {(showExplanation || expanded) && recommendation.explanation && <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-start text-sm text-gray-600">
                <InfoIcon className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <p>{recommendation.explanation}</p>
              </div>
            </div>}
        </div>
        {recommendation.explanation && !showExplanation && <button className="w-full py-2 border-t border-gray-100 text-sm text-gray-500 flex items-center justify-center" onClick={() => setExpanded(!expanded)}>
            {expanded ? <>
                <ChevronUpIcon className="w-4 h-4 mr-1" />
                Hide details
              </> : <>
                <ChevronDownIcon className="w-4 h-4 mr-1" />
                Show details
              </>}
          </button>}
      </div>
    </div>;
};
// Additional icon needed
const UserGroupIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>;