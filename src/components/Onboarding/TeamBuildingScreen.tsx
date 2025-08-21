import React, { useState } from 'react';
import { UsersIcon, PlusIcon, XIcon, HeartIcon, ClipboardListIcon, UserIcon, AlertTriangleIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { RelationshipType, getRelationshipDisplayName } from '../../types/UserTypes';
interface TeamMember {
  name: string;
  email: string;
  relationship: RelationshipType;
  isEmergencyContact?: boolean;
}
interface TeamBuildingScreenProps {
  onNext: () => void;
  onBack: () => void;
  animateOut: boolean;
  onAddTeamMember: (member: TeamMember) => void;
  onRemoveTeamMember: (index: number) => void;
  invitedMembers: TeamMember[];
  recipientName: string;
}
export const TeamBuildingScreen: React.FC<TeamBuildingScreenProps> = ({
  onNext,
  onBack,
  animateOut,
  onAddTeamMember,
  onRemoveTeamMember,
  invitedMembers,
  recipientName
}) => {
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRelationship, setNewMemberRelationship] = useState<RelationshipType | ''>('');
  const [isEmergencyContact, setIsEmergencyContact] = useState(false);
  const handleAddMember = () => {
    if (newMemberName && newMemberEmail && newMemberRelationship) {
      onAddTeamMember({
        name: newMemberName,
        email: newMemberEmail,
        relationship: newMemberRelationship as RelationshipType,
        isEmergencyContact
      });
      // Reset form
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberRelationship('');
      setIsEmergencyContact(false);
      setShowAddMemberForm(false);
    }
  };
  const getRelationshipIcon = (relationship: RelationshipType) => {
    const category = relationship.includes('family') || relationship === 'spouse_partner' || relationship === 'parent' || relationship === 'sibling' || relationship === 'adult_child' ? 'family' : relationship.includes('professional') || relationship === 'nurse_medical' || relationship === 'agency_coordinator' || relationship === 'healthcare_provider' ? 'professional' : 'community';
    switch (category) {
      case 'family':
        return <HeartIcon className="w-4 h-4 text-red-500" />;
      case 'professional':
        return <ClipboardListIcon className="w-4 h-4 text-blue-500" />;
      case 'community':
        return <UserIcon className="w-4 h-4 text-green-500" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };
  return <div className={`space-y-6 transition-opacity duration-300 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
      <h1 className="text-2xl font-bold text-center mb-2">
        Build Your Care Team
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Let's start by inviting the most important people who help you.
      </p>
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <BracketText active={true} className="mb-1 text-blue-800 font-medium">
          Your support network
        </BracketText>
        <p className="text-sm text-blue-700">
          {recipientName ? recipientName : 'You'} can invite family members,
          professional caregivers, and community helpers to join your care team.
        </p>
      </div>
      {invitedMembers.length > 0 && <div className="space-y-3 mb-6">
          <h2 className="text-lg font-medium">Your Team Members</h2>
          {invitedMembers.map((member, index) => <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  {getRelationshipIcon(member.relationship)}
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">{member.name}</p>
                    {member.isEmergencyContact && <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                        <AlertTriangleIcon className="w-3 h-3 mr-1" />
                        Emergency
                      </span>}
                  </div>
                  <p className="text-sm text-gray-500">
                    {getRelationshipDisplayName(member.relationship)}
                  </p>
                </div>
              </div>
              <button onClick={() => onRemoveTeamMember(index)} className="p-1 rounded-full hover:bg-gray-100">
                <XIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>)}
        </div>}
      {!showAddMemberForm ? <button onClick={() => setShowAddMemberForm(true)} className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Team Member
        </button> : <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Add Team Member</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input type="text" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Enter team member's name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input type="email" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Enter team member's email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship to You
            </label>
            <select value={newMemberRelationship} onChange={e => setNewMemberRelationship(e.target.value as RelationshipType)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
              <option value="">Select relationship</option>
              <optgroup label="Family">
                <option value="spouse_partner">Spouse/Partner</option>
                <option value="adult_child">Adult Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other_family">Other Family Member</option>
              </optgroup>
              <optgroup label="Professional">
                <option value="professional_caregiver">
                  Professional Caregiver
                </option>
                <option value="nurse_medical">
                  Nurse/Medical Professional
                </option>
                <option value="agency_coordinator">Agency Coordinator</option>
                <option value="healthcare_provider">Healthcare Provider</option>
              </optgroup>
              <optgroup label="Community">
                <option value="close_friend">Close Friend</option>
                <option value="neighbor">Neighbor</option>
                <option value="community_volunteer">Community Volunteer</option>
                <option value="other_helper">Other Helper</option>
              </optgroup>
            </select>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="emergency-contact" checked={isEmergencyContact} onChange={() => setIsEmergencyContact(!isEmergencyContact)} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
            <label htmlFor="emergency-contact" className="ml-2 block text-sm text-gray-700">
              Mark as emergency contact
            </label>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" className="w-1/2" onClick={() => setShowAddMemberForm(false)}>
              Cancel
            </Button>
            <Button className="w-1/2" onClick={handleAddMember} disabled={!newMemberName || !newMemberEmail || !newMemberRelationship}>
              Add
            </Button>
          </div>
        </div>}
      <div className="flex space-x-3 mt-8">
        <Button onClick={onBack} variant="secondary" className="w-1/3">
          Back
        </Button>
        <Button onClick={onNext} className="w-2/3">
          Continue
        </Button>
      </div>
    </div>;
};