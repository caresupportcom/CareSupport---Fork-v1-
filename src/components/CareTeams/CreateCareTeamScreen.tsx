import React, { useState } from 'react';
import { ArrowLeftIcon, UsersIcon, CheckIcon, UserPlusIcon, LinkIcon, CopyIcon, ShareIcon, MailIcon, MessageSquareIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { storage } from '../../services/StorageService';
export const CreateCareTeamScreen = ({
  onBack
}) => {
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [careRecipient, setCareRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  // Role options for team members
  const roleOptions = [{
    id: 'family',
    label: 'Family Caregiver'
  }, {
    id: 'professional',
    label: 'Professional Caregiver'
  }, {
    id: 'coordinator',
    label: 'Care Coordinator'
  }, {
    id: 'community',
    label: 'Community Supporter'
  }];
  const handleCreateTeam = e => {
    e.preventDefault();
    setIsCreating(true);
    // In a real app, this would be an API call to create the team
    // Simulating network request with timeout
    setTimeout(() => {
      // Generate a random invite code
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setInviteCode(generatedCode);
      // Generate invite link (in a real app this would be a proper deep link)
      const generatedLink = `https://caresupport.app/join?code=${generatedCode}`;
      setInviteLink(generatedLink);
      // Save team info to storage
      const teamId = `team-${Date.now()}`;
      storage.save('user_team_id', teamId);
      storage.save('user_team_name', teamName);
      storage.save('user_team_role', 'creator');
      storage.save('user_team_invite_code', generatedCode);
      // Track team created in analytics
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'team_created',
        team_name: teamName,
        care_recipient: careRecipient || 'Not specified'
      });
      setIsCreating(false);
      setCreationSuccess(true);
      setStep(2);
    }, 1500);
  };
  const handleCopyInviteCode = () => {
    // In a real app, this would copy to clipboard
    navigator.clipboard.writeText(inviteCode).then(() => {
      alert('Invite code copied to clipboard!');
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'invite_code_copied'
      });
    }, err => {
      console.error('Could not copy text: ', err);
    });
  };
  const handleCopyInviteLink = () => {
    // In a real app, this would copy to clipboard
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('Invite link copied to clipboard!');
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'invite_link_copied'
      });
    }, err => {
      console.error('Could not copy text: ', err);
    });
  };
  const handleShare = method => {
    // In a real app, this would use the Web Share API or native sharing
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'invite_shared',
      share_method: method
    });
    alert(`Shared via ${method}!`);
    setShowShareOptions(false);
  };
  const renderStep1 = () => <form onSubmit={handleCreateTeam}>
      <div className="space-y-6">
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name*
          </label>
          <input type="text" id="teamName" value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g., Smith Family Care Team" required />
        </div>
        <div>
          <label htmlFor="careRecipient" className="block text-sm font-medium text-gray-700 mb-1">
            Care Recipient Name
          </label>
          <input type="text" id="careRecipient" value={careRecipient} onChange={e => setCareRecipient(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g., Eleanor Smith" />
          <p className="text-xs text-gray-500 mt-1">
            The person receiving care (optional)
          </p>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Brief description of the care team's purpose" rows={3} />
        </div>
        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={!teamName || isCreating} loading={isCreating}>
            {isCreating ? 'Creating Team...' : 'Create Care Team'}
          </Button>
        </div>
      </div>
    </form>;
  const renderStep2 = () => <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">
          Team Created Successfully!
        </h2>
        <p className="text-gray-600">
          Share the invite code with others to build your care team
        </p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
        <p className="text-sm text-gray-500 mb-2">Invite Code</p>
        <div className="text-2xl font-mono font-bold tracking-wider text-blue-700 mb-2">
          {inviteCode}
        </div>
        <button className="text-blue-600 text-sm font-medium hover:underline flex items-center justify-center mx-auto" onClick={handleCopyInviteCode}>
          <CopyIcon className="w-4 h-4 mr-1" />
          Copy to clipboard
        </button>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Invite Link</p>
        <div className="text-sm text-gray-700 truncate mb-2 bg-white p-2 rounded border border-gray-200">
          {inviteLink}
        </div>
        <button className="text-blue-600 text-sm font-medium hover:underline flex items-center" onClick={handleCopyInviteLink}>
          <CopyIcon className="w-4 h-4 mr-1" />
          Copy link
        </button>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">
          Share invitation via:
        </p>
        <div className="flex space-x-3">
          <button className="flex-1 py-2 px-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" onClick={() => handleShare('text')}>
            <div className="flex items-center justify-center">
              <MessageSquareIcon className="w-4 h-4 mr-2" />
              <span>Text</span>
            </div>
          </button>
          <button className="flex-1 py-2 px-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" onClick={() => handleShare('email')}>
            <div className="flex items-center justify-center">
              <MailIcon className="w-4 h-4 mr-2" />
              <span>Email</span>
            </div>
          </button>
          <button className="flex-1 py-2 px-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" onClick={() => setShowShareOptions(!showShareOptions)}>
            <div className="flex items-center justify-center">
              <ShareIcon className="w-4 h-4 mr-2" />
              <span>More</span>
            </div>
          </button>
        </div>
      </div>
      {showShareOptions && <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-md">
          <h3 className="font-medium text-gray-800 mb-3">Share via</h3>
          <div className="grid grid-cols-3 gap-3">
            {['WhatsApp', 'Facebook', 'Twitter', 'LinkedIn', 'Copy', 'More'].map(option => <button key={option} className="p-2 text-sm text-center hover:bg-gray-100 rounded" onClick={() => handleShare(option.toLowerCase())}>
                {option}
              </button>)}
          </div>
        </div>}
      <div className="pt-4">
        <Button onClick={onBack} className="w-full">
          Done
        </Button>
      </div>
    </div>;
  return <div className="p-6 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100" aria-label="Go back">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">
          {step === 1 ? 'Create a Care Team' : 'Invite Team Members'}
        </h1>
      </div>
      <div className="flex-1">
        {step === 1 && <>
            <p className="text-gray-600 mb-6">
              Set up a team to coordinate care with family, friends, and
              professionals
            </p>
            {renderStep1()}
          </>}
        {step === 2 && renderStep2()}
      </div>
    </div>;
};