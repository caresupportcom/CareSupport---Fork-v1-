import React, { useEffect, useState } from 'react';
import { UserIcon, HeartIcon, ShieldIcon, UsersIcon, ChevronRightIcon, CheckIcon, ArrowLeftIcon, ShareIcon, ClipboardCopyIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { storage } from '../../services/StorageService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const OnboardingScreen = ({
  onComplete
}) => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [teamMode, setTeamMode] = useState(''); // 'create' or 'join'
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [careNeeds, setCareNeeds] = useState([]);
  const [professionalCredentials, setProfessionalCredentials] = useState('');
  const [professionalSpecialty, setProfessionalSpecialty] = useState('');
  const [professionalAvailability, setProfessionalAvailability] = useState([]);
  const [communityStrengths, setCommunityStrengths] = useState([]);
  const [communityAvailability, setCommunityAvailability] = useState([]);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [coordinatorResponsibilities, setCoordinatorResponsibilities] = useState([]);
  // Add state for coordinator responsibilities
  // Check for any pending invite code
  useEffect(() => {
    const pendingInviteCode = storage.get('pending_invite_code', null);
    if (pendingInviteCode) {
      setJoinCode(pendingInviteCode);
      setTeamMode('join');
      // Clear the pending code after using it
      storage.remove('pending_invite_code');
    }
  }, []);
  // Generate a team code when creating a team
  useEffect(() => {
    if (teamMode === 'create' && !teamCode) {
      // Generate a simple 6-character alphanumeric code
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setTeamCode(generatedCode);
    }
  }, [teamMode, teamCode]);
  const handleRoleSelect = role => {
    setSelectedRole(role);
    // If care recipient, redirect to recipient-specific onboarding
    if (role === 'recipient') {
      // Track role selection in analytics
      analytics.trackEvent(AnalyticsEvents.ONBOARDING_ROLE_SELECTED, {
        role: role
      });
      // Save the role to storage
      storage.save('user_role', 'care_recipient');
      // Use URL parameter approach to trigger screen change on page reload
      window.location.href = window.location.pathname + '?screen=recipient-onboarding';
      return;
    }
    setStep(2);
    // Track role selection in analytics
    analytics.trackEvent(AnalyticsEvents.ONBOARDING_ROLE_SELECTED, {
      role: role
    });
  };
  const handleTeamModeSelect = mode => {
    setTeamMode(mode);
    setStep(3);
    // Track team mode selection in analytics
    analytics.trackEvent(AnalyticsEvents.ONBOARDING_TEAM_MODE_SELECTED, {
      mode: mode,
      role: selectedRole
    });
  };
  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      return; // Require team name
    }
    setStep(4);
    // Track team creation in analytics
    analytics.trackEvent(AnalyticsEvents.TEAM_CREATED, {
      team_name: teamName,
      creator_role: selectedRole
    });
  };
  const handleJoinTeam = () => {
    if (!joinCode.trim()) {
      return; // Require join code
    }
    // In a real app, we would validate the join code against a database
    // For this prototype, we'll simulate validation
    if (joinCode.length < 4) {
      setJoinError('Invalid team code. Please check and try again.');
      return;
    }
    setJoinError('');
    setStep(4);
    // Track team joining in analytics
    analytics.trackEvent(AnalyticsEvents.TEAM_JOINED, {
      join_code: joinCode,
      member_role: selectedRole
    });
  };
  const handleCopyCode = () => {
    navigator.clipboard.writeText(teamCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
    // Track code copying in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'copy_team_code'
    });
  };
  const handleNameEmailSubmit = () => {
    if (!name.trim() || !email.trim()) {
      return; // Require name and email
    }
    setStep(5);
    // Track profile creation in analytics
    analytics.trackEvent(AnalyticsEvents.PROFILE_CREATED, {
      has_phone: phone.trim().length > 0,
      role: selectedRole,
      team_mode: teamMode
    });
  };
  const handleMedicalConditionsSubmit = () => {
    if (teamMode === 'create') {
      setStep(7); // Go to care needs for create team mode
    } else {
      setStep(6); // Go to care needs for join team mode
    }
  };
  const handleCareNeedsSubmit = () => {
    // Save user data and complete onboarding
    saveUserData();
    onComplete();
  };
  const handleProfessionalDetailsSubmit = () => {
    if (teamMode === 'create') {
      setStep(7); // Go to professional availability for create team mode
    } else {
      setStep(6); // Go to professional availability for join team mode
    }
  };
  const handleProfessionalAvailabilitySubmit = () => {
    setStep(teamMode === 'create' ? 8 : 7);
  };
  const handleCommunityStrengthsSubmit = () => {
    setStep(6);
  };
  const handleCommunityAvailabilitySubmit = () => {
    // Save user data and complete onboarding
    saveUserData();
    onComplete();
  };
  const handleEmergencyContactSubmit = () => {
    // Save user data and complete onboarding
    saveUserData();
    onComplete();
  };
  const handleTeamInviteSharingSubmit = () => {
    setStep(6);
  };
  const handleCoordinatorResponsibilitiesSubmit = () => {
    if (teamMode === 'create') {
      setStep(7); // Go to emergency contact
    } else {
      setStep(6); // Go to emergency contact
    }
    // Track selection in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'coordinator_responsibilities_selected',
      responsibilities_count: coordinatorResponsibilities.length
    });
  };
  const saveUserData = () => {
    // In a real app, this would save user data to a database
    const userData = {
      role: selectedRole,
      name,
      email,
      phone,
      teamMode,
      teamName: teamMode === 'create' ? teamName : '',
      teamCode: teamMode === 'create' ? teamCode : joinCode,
      medicalConditions: selectedRole === 'family' ? medicalConditions : [],
      careNeeds: selectedRole === 'family' ? careNeeds : [],
      professionalCredentials: selectedRole === 'professional' ? professionalCredentials : '',
      professionalSpecialty: selectedRole === 'professional' ? professionalSpecialty : '',
      professionalAvailability: selectedRole === 'professional' ? professionalAvailability : [],
      communityStrengths: selectedRole === 'community' ? communityStrengths : [],
      communityAvailability: selectedRole === 'community' ? communityAvailability : [],
      coordinatorResponsibilities: selectedRole === 'coordinator' ? coordinatorResponsibilities : [],
      emergencyContact: selectedRole === 'professional' || selectedRole === 'coordinator' ? {
        name: emergencyContactName,
        phone: emergencyContactPhone,
        relation: emergencyContactRelation
      } : null
    };
    // Save to local storage (in a real app, this would be saved to a server)
    storage.save('user_data', userData);
    // Also save user role for app-wide access
    storage.save('user_role', selectedRole);
    // Track onboarding completion in analytics
    analytics.trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
      role: selectedRole,
      team_mode: teamMode
    });
  };
  const renderRoleSelection = () => <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Welcome to CareCircle
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Select your role in the care team to get started
      </p>
      <div className="space-y-4">
        <button className="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => handleRoleSelect('family')}>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <HeartIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-medium">Family Caregiver</h3>
            <p className="text-sm text-gray-500">
              I'm caring for a family member or loved one
            </p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </button>
        <button className="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => handleRoleSelect('professional')}>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <UserIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-medium">Professional Caregiver</h3>
            <p className="text-sm text-gray-500">
              I provide professional care services
            </p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </button>
        <button className="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => handleRoleSelect('community')}>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <UsersIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-medium">Community Supporter</h3>
            <p className="text-sm text-gray-500">
              I'm a friend, neighbor, or volunteer helper
            </p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </button>
        <button className="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => handleRoleSelect('coordinator')}>
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
            <ShieldIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-medium">Care Coordinator</h3>
            <p className="text-sm text-gray-500">
              I'm organizing care for someone
            </p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </button>
        {/* More definitive divider with label */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-sm text-gray-500 font-medium">
              OR
            </span>
          </div>
        </div>
        <button className="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => handleRoleSelect('recipient')}>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <UserIcon className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-medium">Care Recipient</h3>
            <p className="text-sm text-gray-500">
              I'm receiving care and support
            </p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>;
  const renderTeamSelection = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Join or Create a Care Team</h1>
      <p className="text-gray-600 mb-6">
        Care teams help coordinate support for a loved one
      </p>
      <div className="space-y-4">
        <button className="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => handleTeamModeSelect('join')}>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <UsersIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-medium">Join an Existing Team</h3>
            <p className="text-sm text-gray-500">
              I have an invite code from another caregiver
            </p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </button>
        <button className="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => handleTeamModeSelect('create')}>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <PlusIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-medium">Create a New Team</h3>
            <p className="text-sm text-gray-500">
              I'm setting up care for the first time
            </p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <button className="mt-8 flex items-center text-blue-600" onClick={() => setStep(1)}>
        <ArrowLeftIcon className="w-4 h-4 mr-1" />
        Back to role selection
      </button>
    </div>;
  const renderTeamCreation = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Create a Care Team</h1>
      <p className="text-gray-600 mb-6">
        Name your team and invite other caregivers
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Team Name</label>
          <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., Dad's Care Team" value={teamName} onChange={e => setTeamName(e.target.value)} />
          <p className="text-xs text-gray-500 mt-1">
            Choose a name that identifies who you're caring for
          </p>
        </div>
      </div>
      <div className="flex space-x-3 mt-8">
        <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setStep(2)}>
          Back
        </button>
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleCreateTeam} disabled={!teamName.trim()}>
          Continue
        </button>
      </div>
    </div>;
  const renderTeamJoining = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Join a Care Team</h1>
      <p className="text-gray-600 mb-6">
        Enter the invite code shared with you
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Team Code</label>
          <input type="text" className="w-full p-3 border border-gray-300 rounded-lg uppercase" placeholder="e.g., ABC123" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} />
          {joinError && <p className="text-xs text-red-500 mt-1">{joinError}</p>}
        </div>
      </div>
      <div className="flex space-x-3 mt-8">
        <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setStep(2)}>
          Back
        </button>
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleJoinTeam} disabled={!joinCode.trim()}>
          Continue
        </button>
      </div>
    </div>;
  const renderNameEmailForm = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Your Profile</h1>
      <p className="text-gray-600 mb-6">
        This information helps identify you to other team members
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Your Name</label>
          <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Phone (optional)
          </label>
          <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="(123) 456-7890" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>
      <div className="flex space-x-3 mt-8">
        <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setStep(teamMode === 'create' ? 3 : 3)}>
          Back
        </button>
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleNameEmailSubmit} disabled={!name.trim() || !email.trim()}>
          Continue
        </button>
      </div>
    </div>;
  const renderTeamInviteSharing = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Invite Team Members</h1>
      <p className="text-gray-600 mb-6">
        Share this code with other caregivers to join your team
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="text-center text-lg font-semibold text-blue-700 mb-2">
          Your Team Code
        </h3>
        <div className="bg-white border border-blue-300 rounded-lg p-3 text-center mb-4">
          <span className="text-2xl font-mono font-bold tracking-wider">
            {teamCode}
          </span>
        </div>
        <button className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center" onClick={handleCopyCode}>
          <ClipboardCopyIcon className="w-4 h-4 mr-2" />
          {codeCopied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
        <h3 className="font-medium mb-2">How to invite others:</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start">
            <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs mr-2 mt-0.5">
              1
            </span>
            <span>Share your team code with other caregivers</span>
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs mr-2 mt-0.5">
              2
            </span>
            <span>They can enter it when joining a team</span>
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs mr-2 mt-0.5">
              3
            </span>
            <span>You'll be notified when someone joins</span>
          </li>
        </ul>
      </div>
      <button className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium" onClick={handleTeamInviteSharingSubmit}>
        Continue
      </button>
    </div>;
  const renderMedicalConditions = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Medical Conditions</h1>
      <p className="text-gray-600 mb-6">
        Select any conditions that apply to the person you're caring for
      </p>
      <div className="space-y-2 mb-8">
        {["Alzheimer's/Dementia", 'Diabetes', 'Heart Disease', 'Hypertension', 'Arthritis', 'Cancer', 'Stroke Recovery', "Parkinson's Disease", 'Respiratory Conditions', 'Mobility Issues'].map(condition => <label key={condition} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded" checked={medicalConditions.includes(condition)} onChange={e => {
          if (e.target.checked) {
            setMedicalConditions([...medicalConditions, condition]);
          } else {
            setMedicalConditions(medicalConditions.filter(c => c !== condition));
          }
        }} />
            <span className="ml-3">{condition}</span>
          </label>)}
      </div>
      <div className="flex space-x-3">
        <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setStep(4)}>
          Back
        </button>
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleMedicalConditionsSubmit}>
          Continue
        </button>
      </div>
    </div>;
  const renderCareNeeds = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Care Needs</h1>
      <p className="text-gray-600 mb-6">Select the types of care needed</p>
      <div className="space-y-2 mb-8">
        {['Medication Management', 'Meal Preparation', 'Bathing/Hygiene', 'Mobility Assistance', 'Transportation', 'Housekeeping', 'Shopping/Errands', 'Medical Appointments', 'Exercise/Physical Therapy', 'Companionship/Mental Stimulation'].map(need => <label key={need} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded" checked={careNeeds.includes(need)} onChange={e => {
          if (e.target.checked) {
            setCareNeeds([...careNeeds, need]);
          } else {
            setCareNeeds(careNeeds.filter(n => n !== need));
          }
        }} />
            <span className="ml-3">{need}</span>
          </label>)}
      </div>
      <div className="flex space-x-3">
        <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setStep(5)}>
          Back
        </button>
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleCareNeedsSubmit}>
          Complete Setup
        </button>
      </div>
    </div>;
  const renderProfessionalDetails = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Professional Details</h1>
      <p className="text-gray-600 mb-6">
        Share your professional background with the care team
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Credentials</label>
          <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., RN, CNA, etc." value={professionalCredentials} onChange={e => setProfessionalCredentials(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Specialty</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg" value={professionalSpecialty} onChange={e => setProfessionalSpecialty(e.target.value)}>
            <option value="">Select a specialty</option>
            <option value="nursing">Nursing</option>
            <option value="physical_therapy">Physical Therapy</option>
            <option value="occupational_therapy">Occupational Therapy</option>
            <option value="speech_therapy">Speech Therapy</option>
            <option value="home_health_aide">Home Health Aide</option>
            <option value="social_work">Social Work</option>
            <option value="nutrition">Nutrition</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="flex space-x-3 mt-8">
        <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setStep(4)}>
          Back
        </button>
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleProfessionalDetailsSubmit}>
          Continue
        </button>
      </div>
    </div>;
  const renderProfessionalAvailability = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Your Availability</h1>
      <p className="text-gray-600 mb-6">
        Select days when you're typically available to provide care
      </p>
      <div className="space-y-2 mb-8">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => <label key={day} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded" checked={professionalAvailability.includes(day)} onChange={e => {
          if (e.target.checked) {
            setProfessionalAvailability([...professionalAvailability, day]);
          } else {
            setProfessionalAvailability(professionalAvailability.filter(d => d !== day));
          }
        }} />
            <span className="ml-3">{day}</span>
          </label>)}
      </div>
      <div className="flex space-x-3">
        <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setStep(5)}>
          Back
        </button>
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleProfessionalAvailabilitySubmit}>
          Continue
        </button>
      </div>
    </div>;
  const renderCommunityStrengths = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Your Strengths</h1>
      <p className="text-gray-600 mb-6">
        Select areas where you can best contribute
      </p>
      <div className="space-y-2 mb-8">
        {['Transportation', 'Meal Preparation', 'Grocery Shopping', 'Companionship', 'Light Housekeeping', 'Running Errands', 'Pet Care', 'Technology Help', 'Yard Work', 'Medication Pickup'].map(strength => <label key={strength} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded" checked={communityStrengths.includes(strength)} onChange={e => {
          if (e.target.checked) {
            setCommunityStrengths([...communityStrengths, strength]);
          } else {
            setCommunityStrengths(communityStrengths.filter(s => s !== strength));
          }
        }} />
            <span className="ml-3">{strength}</span>
          </label>)}
      </div>
      <div className="flex space-x-3">
        <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setStep(4)}>
          Back
        </button>
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleCommunityStrengthsSubmit}>
          Continue
        </button>
      </div>
    </div>;
  const renderCommunityAvailability = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Your Availability</h1>
      <p className="text-gray-600 mb-6">
        Select days when you're typically available to help
      </p>
      <div className="space-y-2 mb-8">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => <label key={day} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded" checked={communityAvailability.includes(day)} onChange={e => {
          if (e.target.checked) {
            setCommunityAvailability([...communityAvailability, day]);
          } else {
            setCommunityAvailability(communityAvailability.filter(d => d !== day));
          }
        }} />
            <span className="ml-3">{day}</span>
          </label>)}
      </div>
      <div className="flex space-x-3">
        <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setStep(5)}>
          Back
        </button>
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleCommunityAvailabilitySubmit}>
          Complete Setup
        </button>
      </div>
    </div>;
  const renderEmergencyContact = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Emergency Contact</h1>
      <p className="text-gray-600 mb-6">
        Provide a contact in case of emergency
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Contact Name</label>
          <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Full name" value={emergencyContactName} onChange={e => setEmergencyContactName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Contact Phone
          </label>
          <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="(123) 456-7890" value={emergencyContactPhone} onChange={e => setEmergencyContactPhone(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Relationship</label>
          <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., Spouse, Sibling, Friend" value={emergencyContactRelation} onChange={e => setEmergencyContactRelation(e.target.value)} />
        </div>
      </div>
      <div className="flex space-x-3 mt-8">
        <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setStep(5)}>
          Back
        </button>
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleEmergencyContactSubmit} disabled={!emergencyContactName || !emergencyContactPhone}>
          Complete Setup
        </button>
      </div>
    </div>;
  const renderCoordinatorResponsibilities = () => <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Your Coordinator Role</h1>
      <p className="text-gray-600 mb-6">
        Select the coordination responsibilities you'll handle
      </p>
      <div className="space-y-2 mb-8">
        {['Schedule Management', 'Team Communication', 'Medical Appointments', 'Medication Management', 'Care Plan Development', 'Resource Coordination', 'Family Updates', 'Provider Liaison', 'Documentation', 'Crisis Management'].map(responsibility => <label key={responsibility} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded" checked={coordinatorResponsibilities.includes(responsibility)} onChange={e => {
          if (e.target.checked) {
            setCoordinatorResponsibilities([...coordinatorResponsibilities, responsibility]);
          } else {
            setCoordinatorResponsibilities(coordinatorResponsibilities.filter(r => r !== responsibility));
          }
        }} />
            <span className="ml-3">{responsibility}</span>
          </label>)}
      </div>
      <div className="flex space-x-3">
        <button className="flex-1 py-2 border border-gray-300 rounded-lg" onClick={() => setStep(4)}>
          Back
        </button>
        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg" onClick={handleCoordinatorResponsibilitiesSubmit}>
          Continue
        </button>
      </div>
    </div>;
  const renderStep = () => {
    switch (step) {
      case 1:
        return renderRoleSelection();
      case 2:
        return renderTeamSelection();
      case 3:
        return teamMode === 'create' ? renderTeamCreation() : renderTeamJoining();
      case 4:
        return renderNameEmailForm();
      case 5:
        if (teamMode === 'create') {
          return renderTeamInviteSharing();
        } else if (selectedRole === 'family') {
          return renderMedicalConditions();
        } else if (selectedRole === 'professional') {
          return renderProfessionalDetails();
        } else if (selectedRole === 'community') {
          return renderCommunityStrengths();
        } else if (selectedRole === 'coordinator') {
          return renderCoordinatorResponsibilities();
        }
        break;
      case 6:
        if (teamMode === 'create') {
          if (selectedRole === 'family') {
            return renderMedicalConditions();
          } else if (selectedRole === 'professional') {
            return renderProfessionalDetails();
          } else if (selectedRole === 'community') {
            return renderCommunityStrengths();
          } else if (selectedRole === 'coordinator') {
            return renderCoordinatorResponsibilities();
          }
        } else {
          if (selectedRole === 'family') {
            return renderCareNeeds();
          } else if (selectedRole === 'professional') {
            return renderProfessionalAvailability();
          } else if (selectedRole === 'community') {
            return renderCommunityAvailability();
          } else if (selectedRole === 'coordinator') {
            return renderEmergencyContact();
          }
        }
        break;
      case 7:
        if (teamMode === 'create') {
          if (selectedRole === 'family') {
            return renderCareNeeds();
          } else if (selectedRole === 'professional') {
            return renderProfessionalAvailability();
          } else if (selectedRole === 'community') {
            return renderCommunityAvailability();
          } else if (selectedRole === 'coordinator') {
            return renderEmergencyContact();
          }
        } else if (selectedRole === 'professional') {
          return renderEmergencyContact();
        } else {
          // Handle case where we need to complete onboarding
          saveUserData();
          onComplete();
          return null; // Add return statement to avoid fallthrough
        }
        break;
      case 8:
        if (teamMode === 'create' && selectedRole === 'professional') {
          return renderEmergencyContact();
        } else {
          // Handle case where we need to complete onboarding
          saveUserData();
          onComplete();
        }
        break;
      case 9:
        // Final step - complete onboarding for all paths
        saveUserData();
        onComplete();
        break;
      default:
        return renderRoleSelection();
    }
  };
  // Helper function to calculate total steps for current role and team mode
  const getTotalSteps = () => {
    let totalSteps = 4; // Basic steps: role selection, team selection, team creation/joining, name/email
    // Add team invite sharing step for team creators
    if (teamMode === 'create') {
      totalSteps += 1;
    }
    // Add role-specific steps
    if (selectedRole === 'family') {
      totalSteps += 2; // Medical conditions, care needs
    } else if (selectedRole === 'professional') {
      totalSteps += 3; // Professional details, availability, emergency contact
    } else if (selectedRole === 'community') {
      totalSteps += 2; // Community strengths, availability
    } else if (selectedRole === 'coordinator') {
      totalSteps += 2; // Coordinator responsibilities, emergency contact
    }
    return totalSteps;
  };
  // Progress bar calculation
  const getProgressPercentage = () => {
    // Calculate total steps based on role and team mode
    let totalSteps = 4; // Basic steps: role selection, team selection, team creation/joining, name/email
    // Add team invite sharing step for team creators
    if (teamMode === 'create') {
      totalSteps += 1;
    }
    // Add role-specific steps
    if (selectedRole === 'family') {
      totalSteps += 2; // Medical conditions, care needs
    } else if (selectedRole === 'professional') {
      totalSteps += 3; // Professional details, availability, emergency contact
    } else if (selectedRole === 'community') {
      totalSteps += 2; // Community strengths, availability
    } else if (selectedRole === 'coordinator') {
      totalSteps += 2; // Coordinator responsibilities, emergency contact
    }
    // Calculate percentage based on current step and total steps
    // Ensure we don't exceed 100% even if step somehow goes beyond totalSteps
    return Math.min(step / totalSteps * 100, 100);
  };
  return <div className="h-full flex flex-col bg-white">
      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-blue-500 transition-all duration-300" style={{
        width: `${getProgressPercentage()}%`
      }}></div>
      </div>
      {/* Step indicator */}
      <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Step {step} of {getTotalSteps()}
        </div>
        <div className="text-xs font-medium">
          <BracketText active={true}>
            {step === 1 ? 'Role Selection' : step === 2 ? 'Team Selection' : step === 3 ? teamMode === 'create' ? 'Create Team' : 'Join Team' : step === 4 ? 'Your Profile' : step === 5 ? teamMode === 'create' ? 'Invite Team Members' : selectedRole === 'family' ? 'Medical Conditions' : selectedRole === 'professional' ? 'Professional Details' : selectedRole === 'community' ? 'Your Strengths' : selectedRole === 'coordinator' ? 'Responsibilities' : '' : step === 6 ? teamMode === 'create' ? selectedRole === 'family' ? 'Medical Conditions' : selectedRole === 'professional' ? 'Professional Details' : selectedRole === 'community' ? 'Your Strengths' : selectedRole === 'coordinator' ? 'Responsibilities' : '' : selectedRole === 'family' ? 'Care Needs' : selectedRole === 'professional' ? 'Availability' : selectedRole === 'community' ? 'Availability' : selectedRole === 'coordinator' ? 'Emergency Contact' : '' : step === 7 ? teamMode === 'create' ? selectedRole === 'family' ? 'Care Needs' : selectedRole === 'professional' ? 'Availability' : selectedRole === 'community' ? 'Availability' : selectedRole === 'coordinator' ? 'Emergency Contact' : '' : selectedRole === 'professional' ? 'Emergency Contact' : 'Completing Setup' : step === 8 ? teamMode === 'create' && selectedRole === 'professional' ? 'Emergency Contact' : 'Completing Setup' : 'Completing Setup'}
          </BracketText>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">{renderStep()}</div>
    </div>;
};
// Add missing PlusIcon component
const PlusIcon = props => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>;