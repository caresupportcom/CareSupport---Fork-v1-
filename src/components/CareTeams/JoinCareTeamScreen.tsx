import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, CheckIcon, XIcon, UsersIcon, LinkIcon, ClipboardIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { storage } from '../../services/StorageService';
export const JoinCareTeamScreen = ({
  onBack
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  // Check for pre-filled invite code from deep link
  useEffect(() => {
    const pendingInviteCode = storage.get('pending_invite_code', '');
    if (pendingInviteCode) {
      setInviteCode(pendingInviteCode);
      validateInviteCode(pendingInviteCode);
      // Clear the pending code once used
      storage.remove('pending_invite_code');
    }
  }, []);
  const validateInviteCode = code => {
    setIsValidating(true);
    setValidationResult(null);
    // In a real app, this would be an API call to validate the code
    // Simulating network request with timeout
    setTimeout(() => {
      // For demo purposes, accept any 6-character code
      if (code && code.length === 6) {
        const mockTeamInfo = {
          id: 'team-123',
          name: 'Smith Family Care Team',
          description: 'Care team for Eleanor Smith',
          members: 3,
          createdBy: 'Linda Chen'
        };
        setValidationResult('success');
        setTeamInfo(mockTeamInfo);
        // Track successful validation
        analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
          feature_name: 'team_invite_validated',
          invite_code: code
        });
      } else {
        setValidationResult('error');
        setTeamInfo(null);
        // Track failed validation
        analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
          feature_name: 'team_invite_invalid',
          invite_code: code
        });
      }
      setIsValidating(false);
    }, 1000);
  };
  const handleCodeChange = e => {
    const newCode = e.target.value.toUpperCase();
    setInviteCode(newCode);
    // Clear previous validation when code changes
    if (validationResult) {
      setValidationResult(null);
      setTeamInfo(null);
    }
  };
  const handleSubmit = e => {
    e.preventDefault();
    validateInviteCode(inviteCode);
  };
  const handleJoinTeam = () => {
    // In a real app, this would call an API to join the team
    setJoinSuccess(true);
    // Save team info to storage
    storage.save('user_team_id', teamInfo.id);
    storage.save('user_team_name', teamInfo.name);
    storage.save('user_team_role', 'member');
    // Track team joined in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'team_joined',
      team_id: teamInfo.id,
      invite_code: inviteCode
    });
    // Simulate API call with timeout
    setTimeout(() => {
      onBack();
    }, 1500);
  };
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      // Extract just alphanumeric characters that might be an invite code
      const potentialCode = clipboardText.replace(/[^A-Za-z0-9]/g, '').substring(0, 6).toUpperCase();
      if (potentialCode) {
        setInviteCode(potentialCode);
        validateInviteCode(potentialCode);
        analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
          feature_name: 'invite_code_pasted'
        });
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      // Fallback for browsers that don't support clipboard API
      alert('Please paste the invite code manually.');
    }
  };
  return <div className="p-6 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100" aria-label="Go back">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Join a Care Team</h1>
      </div>
      <div className="flex-1">
        {joinSuccess ? <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Successfully Joined!</h2>
            <p className="text-gray-600 mb-6">
              You are now a member of "{teamInfo.name}"
            </p>
          </div> : <>
            <p className="text-gray-600 mb-6">
              Enter the invite code shared with you by the care team creator or
              coordinator.
            </p>
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="relative mb-4">
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Code
                </label>
                <div className="flex">
                  <input type="text" id="inviteCode" value={inviteCode} onChange={handleCodeChange} className={`w-full p-3 border rounded-l-lg focus:outline-none ${validationResult === 'success' ? 'border-green-500 bg-green-50' : validationResult === 'error' ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder="Enter 6-character code" maxLength={6} autoCapitalize="characters" disabled={isValidating} />
                  <button type="button" onClick={handlePasteFromClipboard} className="p-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200" aria-label="Paste from clipboard">
                    <ClipboardIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {validationResult === 'success' && <div className="absolute right-12 top-9 text-green-600">
                    <CheckIcon className="w-5 h-5" />
                  </div>}
                {validationResult === 'error' && <div className="absolute right-12 top-9 text-red-600">
                    <XIcon className="w-5 h-5" />
                  </div>}
              </div>
              {validationResult === 'error' && <p className="text-red-600 text-sm mb-4">
                  Invalid invite code. Please check and try again.
                </p>}
              <Button type="submit" className="w-full" disabled={!inviteCode || inviteCode.length < 6 || isValidating} loading={isValidating}>
                {isValidating ? 'Validating...' : 'Validate Code'}
              </Button>
            </form>
            {teamInfo && validationResult === 'success' && <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-800 mb-2">
                  Team Information
                </h3>
                <div className="space-y-2">
                  <p className="text-blue-700">
                    <span className="font-medium">Name:</span> {teamInfo.name}
                  </p>
                  {teamInfo.description && <p className="text-blue-700">
                      <span className="font-medium">Description:</span>{' '}
                      {teamInfo.description}
                    </p>}
                  <p className="text-blue-700">
                    <span className="font-medium">Created by:</span>{' '}
                    {teamInfo.createdBy}
                  </p>
                  <p className="text-blue-700">
                    <span className="font-medium">Members:</span>{' '}
                    {teamInfo.members}
                  </p>
                </div>
                <Button onClick={handleJoinTeam} className="w-full mt-4">
                  Join This Team
                </Button>
              </div>}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-start">
                <LinkIcon className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">
                    Where to find the invite code?
                  </h3>
                  <p className="text-sm text-gray-600">
                    The care team creator or coordinator should have shared a
                    6-character invite code with you via text message, email, or
                    directly.
                  </p>
                </div>
              </div>
            </div>
          </>}
      </div>
    </div>;
};