import React, { useState } from 'react';
import { AlertTriangleIcon, UserIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { RelationshipType } from '../../types/UserTypes';
interface EmergencyContactScreenProps {
  onNext: () => void;
  onBack: () => void;
  animateOut: boolean;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
    useTeamMember: boolean;
    teamMemberIndex: number;
  };
  setEmergencyContact: (contact: {
    name: string;
    phone: string;
    relationship: string;
    useTeamMember: boolean;
    teamMemberIndex: number;
  }) => void;
  teamMembers: {
    name: string;
    email: string;
    relationship: RelationshipType;
    isEmergencyContact?: boolean;
  }[];
}
export const EmergencyContactScreen: React.FC<EmergencyContactScreenProps> = ({
  onNext,
  onBack,
  animateOut,
  emergencyContact,
  setEmergencyContact,
  teamMembers
}) => {
  const [useTeamMember, setUseTeamMember] = useState(emergencyContact.useTeamMember);
  const handleEmergencyContactChange = (field: string, value: string) => {
    setEmergencyContact({
      ...emergencyContact,
      [field]: value
    });
  };
  const selectTeamMember = (index: number) => {
    const member = teamMembers[index];
    setEmergencyContact({
      name: member.name,
      phone: emergencyContact.phone,
      relationship: getRelationshipDisplayName(member.relationship),
      useTeamMember: true,
      teamMemberIndex: index
    });
    setUseTeamMember(true);
  };
  const handleUseNewContact = () => {
    setEmergencyContact({
      ...emergencyContact,
      useTeamMember: false,
      teamMemberIndex: -1
    });
    setUseTeamMember(false);
  };
  return <div className={`space-y-6 transition-opacity duration-300 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
      <h1 className="text-2xl font-bold text-center mb-2">Emergency Contact</h1>
      <p className="text-center text-gray-600 mb-6">
        Who should be contacted in case of emergency?
      </p>
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <BracketText active={true} className="mb-1 text-blue-800 font-medium">
          Optional information
        </BracketText>
        <p className="text-sm text-blue-700">
          You can select someone from your care team or add a new contact.
        </p>
      </div>
      {teamMembers.length > 0 && <div className="space-y-3">
          <h2 className="text-lg font-medium">Select from your care team</h2>
          <div className="grid grid-cols-1 gap-2">
            {teamMembers.map((member, index) => <button key={index} onClick={() => selectTeamMember(index)} className={`p-3 rounded-lg text-left flex items-center ${useTeamMember && emergencyContact.teamMemberIndex === index ? 'bg-orange-100 border border-orange-300' : 'bg-gray-100 border border-gray-200'}`}>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">
                    {getRelationshipDisplayName(member.relationship)}
                  </p>
                </div>
              </button>)}
          </div>
          <div className="flex items-center py-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
        </div>}
      <button onClick={handleUseNewContact} className={`w-full p-3 rounded-lg text-left flex items-center ${!useTeamMember ? 'bg-orange-100 border border-orange-300' : 'bg-gray-100 border border-gray-200'}`}>
        <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center mr-3">
          <AlertTriangleIcon className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <p className="font-medium">Add a new emergency contact</p>
        </div>
      </button>
      {!useTeamMember && <div className="space-y-3 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input type="text" value={emergencyContact.name} onChange={e => handleEmergencyContactChange('name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Emergency contact name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input type="tel" value={emergencyContact.phone} onChange={e => handleEmergencyContactChange('phone', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Emergency contact phone" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship to You
            </label>
            <input type="text" value={emergencyContact.relationship} onChange={e => handleEmergencyContactChange('relationship', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g., Spouse, Sibling, Friend" />
          </div>
        </div>}
      <div className="flex space-x-3 mt-8">
        <Button onClick={onBack} variant="secondary" className="w-1/3">
          Back
        </Button>
        <Button onClick={onNext} className="w-2/3" disabled={useTeamMember ? false : !emergencyContact.name || !emergencyContact.phone}>
          Continue
        </Button>
      </div>
    </div>;
};
function getRelationshipDisplayName(relationship: RelationshipType): string {
  const displayNames = {
    care_recipient: 'Care Recipient',
    spouse_partner: 'Spouse/Partner',
    adult_child: 'Adult Child',
    parent: 'Parent',
    sibling: 'Sibling',
    other_family: 'Other Family Member',
    professional_caregiver: 'Professional Caregiver',
    nurse_medical: 'Nurse/Medical Professional',
    agency_coordinator: 'Agency Coordinator',
    healthcare_provider: 'Healthcare Provider',
    close_friend: 'Close Friend',
    neighbor: 'Neighbor',
    community_volunteer: 'Community Volunteer',
    other_helper: 'Other Helper'
  };
  return displayNames[relationship] || 'Unknown Relationship';
}