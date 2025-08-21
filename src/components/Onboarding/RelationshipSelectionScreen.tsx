import React from 'react';
import { UserIcon, UsersIcon, HeartIcon } from 'lucide-react';
import { RelationshipType, getRelationshipDisplayName } from '../../types/UserTypes';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
interface RelationshipSelectionScreenProps {
  onSelect: (relationship: RelationshipType) => void;
  onBack: () => void;
}
export const RelationshipSelectionScreen: React.FC<RelationshipSelectionScreenProps> = ({
  onSelect,
  onBack
}) => {
  // Family relationships
  const familyRelationships: RelationshipType[] = ['spouse_partner', 'adult_child', 'parent', 'sibling', 'other_family'];
  // Professional relationships
  const professionalRelationships: RelationshipType[] = ['professional_caregiver', 'nurse_medical', 'agency_coordinator', 'healthcare_provider'];
  // Community relationships
  const communityRelationships: RelationshipType[] = ['close_friend', 'neighbor', 'community_volunteer', 'other_helper'];
  const handleSelect = (relationship: RelationshipType) => {
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'relationship_selected',
      relationship: relationship
    });
    onSelect(relationship);
  };
  // Render a relationship option button
  const renderRelationshipOption = (relationship: RelationshipType, colorClass: string) => <button key={relationship} className={`w-full p-3 rounded-lg border border-gray-200 hover:border-${colorClass}-500 hover:bg-${colorClass}-50 transition-all duration-200 flex items-center mb-2`} onClick={() => handleSelect(relationship)}>
      <div className={`w-10 h-10 rounded-full bg-${colorClass}-100 flex items-center justify-center mr-3`}>
        <UserIcon className={`w-5 h-5 text-${colorClass}-500`} />
      </div>
      <span className="text-gray-800">
        {getRelationshipDisplayName(relationship)}
      </span>
    </button>;
  return <div className="p-6 h-full flex flex-col">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-center mb-2">
          Your Relationship
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Select your relationship to the care recipient
        </p>
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <HeartIcon className="w-5 h-5 text-red-500 mr-2" />
            <h2 className="text-lg font-medium">Family</h2>
          </div>
          <div className="pl-2">
            {familyRelationships.map(relationship => renderRelationshipOption(relationship, 'red'))}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <UserIcon className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-medium">Professional</h2>
          </div>
          <div className="pl-2">
            {professionalRelationships.map(relationship => renderRelationshipOption(relationship, 'blue'))}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <UsersIcon className="w-5 h-5 text-green-500 mr-2" />
            <h2 className="text-lg font-medium">Community</h2>
          </div>
          <div className="pl-2">
            {communityRelationships.map(relationship => renderRelationshipOption(relationship, 'green'))}
          </div>
        </div>
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <BracketText active={true} className="mb-1 text-blue-800 font-medium">
            Relationship + Responsibility
          </BracketText>
          <p className="text-sm text-blue-700">
            We recognize that caregiving roles are fluid and overlapping. Your
            relationship is just the starting point - you'll be able to specify
            your exact responsibilities next.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <Button onClick={onBack} variant="secondary" className="w-full">
          Back
        </Button>
      </div>
    </div>;
};