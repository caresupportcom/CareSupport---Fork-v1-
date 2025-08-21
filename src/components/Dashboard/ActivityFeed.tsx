import React from 'react';
export const ActivityFeed = ({
  activities
}) => {
  const getActionColor = action => {
    switch (action) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'added':
        return 'bg-blue-100 text-blue-800';
      case 'flagged conflict':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div className="space-y-3">
      {activities.map(activity => <div key={activity.id} className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
            <span className="text-xs font-medium">
              {activity.user.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-medium text-sm">{activity.user}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${getActionColor(activity.action)}`}>
                {activity.action}
              </span>
            </div>
            <p className="text-sm text-gray-600">{activity.task}</p>
            <span className="text-xs text-gray-500">{activity.time}</span>
          </div>
        </div>)}
    </div>;
};