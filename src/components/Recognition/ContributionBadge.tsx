import React from 'react';
import { AwardIcon, StarIcon, TrophyIcon } from 'lucide-react';
import { storage } from '../../services/StorageService';
import { recommendationService } from '../../services/RecommendationService';
import { defaultContributionHistory } from '../../types/UserTypes';
export const ContributionBadge = ({
  userId,
  size = 'medium'
}) => {
  // Get contribution history from storage
  const historyKey = `contribution_history_${userId}`;
  const history = storage.get(historyKey, defaultContributionHistory);
  // Get badge info based on contribution count
  const badgeInfo = recommendationService.getBadgeLevel(history.tasksCompleted);
  // Determine icon based on level
  const getBadgeIcon = () => {
    switch (badgeInfo.level) {
      case 'Gold':
        return <TrophyIcon className={size === 'small' ? 'w-3.5 h-3.5' : 'w-5 h-5'} />;
      case 'Silver':
        return <StarIcon className={size === 'small' ? 'w-3.5 h-3.5' : 'w-5 h-5'} />;
      case 'Bronze':
        return <AwardIcon className={size === 'small' ? 'w-3.5 h-3.5' : 'w-5 h-5'} />;
      default:
        return <StarIcon className={size === 'small' ? 'w-3.5 h-3.5' : 'w-5 h-5'} />;
    }
  };
  // Get color classes based on level
  const getColorClasses = () => {
    switch (badgeInfo.level) {
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Silver':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Bronze':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  return <div className={`inline-flex items-center px-2 py-1 rounded-full ${getColorClasses()} border`}>
      <span className={`${badgeInfo.color}-500 mr-1`}>{getBadgeIcon()}</span>
      <span className={`${size === 'small' ? 'text-xs' : 'text-sm'} font-medium`}>
        {badgeInfo.level} Supporter
      </span>
    </div>;
};