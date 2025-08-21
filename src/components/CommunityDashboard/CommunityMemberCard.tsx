import React from 'react';
import { UserIcon, ShieldIcon, UsersIcon, StarIcon, CalendarIcon, ClockIcon } from 'lucide-react';
export const CommunityMemberCard = ({
  member
}) => {
  // Get circle type styling
  const getCircleTypeStyle = circleType => {
    switch (circleType) {
      case 'core':
        return {
          icon: <ShieldIcon className="w-3.5 h-3.5" />,
          color: 'bg-blue-100 text-blue-700',
          label: 'Core Team'
        };
      case 'extended':
        return {
          icon: <UsersIcon className="w-3.5 h-3.5" />,
          color: 'bg-green-100 text-green-700',
          label: 'Extended Network'
        };
      case 'recipient':
        return {
          icon: <UserIcon className="w-3.5 h-3.5" />,
          color: 'bg-purple-100 text-purple-700',
          label: 'Care Recipient'
        };
      default:
        return {
          icon: <UserIcon className="w-3.5 h-3.5" />,
          color: 'bg-gray-100 text-gray-700',
          label: 'Member'
        };
    }
  };
  // Get specialty display name
  const getSpecialtyDisplayName = specialty => {
    const specialtyNames = {
      driving: 'Transportation',
      grocery_shopping: 'Grocery Shopping',
      keeping_company: 'Companionship',
      home_management: 'Home Management',
      managing_medications: 'Medication Management',
      medication_management: 'Medication Management',
      meal_preparation: 'Meal Preparation',
      health_monitoring: 'Health Monitoring'
    };
    return specialtyNames[specialty] || specialty.replace('_', ' ');
  };
  const circleStyle = getCircleTypeStyle(member.circleType);
  return <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm p-3">
      <div className="flex items-start">
        {/* Member Avatar */}
        <div className={`w-10 h-10 rounded-full bg-${member.color || 'blue'}-100 flex items-center justify-center mr-3 flex-shrink-0`}>
          <span className={`text-sm font-medium text-${member.color || 'blue'}-600`}>
            {member.initial || member.name.charAt(0)}
          </span>
        </div>
        {/* Member Info */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm">{member.name}</h3>
            <div className={`text-xs px-2 py-0.5 rounded-full flex items-center ${circleStyle.color}`}>
              {circleStyle.icon}
              <span className="ml-1">{circleStyle.label}</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-2">{member.role}</p>
          {/* Availability Info */}
          {member.availability && <div className="flex items-center text-xs text-gray-600 mb-2">
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
              <span>
                Available: {member.availability.slice(0, 3).join(', ')}
                {member.availability.length > 3 ? '...' : ''}
              </span>
            </div>}
          {/* Last Active */}
          <div className="flex items-center text-xs text-gray-600 mb-2">
            <ClockIcon className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            <span>Last active: {member.lastActive}</span>
          </div>
          {/* Specialties */}
          {member.specialties && member.specialties.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
              {member.specialties.map((specialty, index) => <div key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full flex items-center">
                  <StarIcon className="w-3 h-3 mr-1 text-yellow-500" />
                  {getSpecialtyDisplayName(specialty)}
                </div>)}
            </div>}
        </div>
      </div>
    </div>;
};