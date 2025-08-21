import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, UsersIcon, UserPlusIcon, SettingsIcon, MessageSquareIcon, CalendarIcon, ClipboardListIcon, UserIcon, LogOutIcon, ChevronRightIcon, MoreVerticalIcon, XIcon, CheckIcon, ShareIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { Button } from '../Common/Button';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const CareTeamDetailScreen = ({
  onBack,
  teamData,
  navigateTo
}) => {
  const [activeTab, setActiveTab] = useState('members');
  const [showInviteOptions, setShowInviteOptions] = useState(false);
  const [inviteCode, setInviteCode] = useState('CARE-123-456');
  const [copiedCode, setCopiedCode] = useState(false);
  // This would come from props in a real app
  const team = {
    id: 'team1',
    name: "Dad's Care Team",
    careRecipient: 'Robert Rodriguez',
    description: "Team coordinating care for Dad's recovery after surgery",
    memberCount: 5,
    role: 'Admin',
    lastActivity: '10 minutes ago',
    members: [{
      id: 'user1',
      name: 'Maria Rodriguez',
      role: 'Admin',
      status: 'online',
      avatar: null
    }, {
      id: 'user2',
      name: 'James Wilson',
      role: 'Nurse',
      status: 'online',
      avatar: null
    }, {
      id: 'user3',
      name: 'Linda Chen',
      role: 'Caregiver',
      status: 'offline',
      avatar: null
    }, {
      id: 'user4',
      name: 'Dr. Sarah Williams',
      role: 'Doctor',
      status: 'busy',
      avatar: null
    }, {
      id: 'user5',
      name: 'Robert Johnson',
      role: 'Family Member',
      status: 'online',
      avatar: null
    }],
    settings: {
      notifications: true,
      shareCalendar: true,
      allowMemberInvites: false
    }
  };
  const handleCopyInviteCode = () => {
    // In a real app, this would use the clipboard API
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'care_team_invite_copied',
      team_id: team.id
    });
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };
  const handleInviteMember = () => {
    setShowInviteOptions(!showInviteOptions);
  };
  const handleLeaveTeam = () => {
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'care_team_left',
      team_id: team.id
    });
    // In a real app, this would call an API to leave the team
    onBack();
  };
  const handleTeamSettings = () => {
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'care_team_settings_opened',
      team_id: team.id
    });
    navigateTo('care-team-settings', {
      teamId: team.id
    });
  };
  const getStatusColor = status => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="mr-4" aria-label="Back">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold flex-1">{team.name}</h1>
          <button onClick={handleTeamSettings} className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100" aria-label="Team Settings">
            <SettingsIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <UsersIcon className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <BracketText className="text-blue-600 mb-1">
              {team.role}
            </BracketText>
            <p className="text-sm text-gray-600">
              Caring for {team.careRecipient}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {team.memberCount} members • Active {team.lastActivity}
            </p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex space-x-2 overflow-x-auto">
          <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeTab === 'members' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setActiveTab('members')}>
            Team Members
          </button>
          <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeTab === 'schedule' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setActiveTab('schedule')}>
            Care Schedule
          </button>
          <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeTab === 'tasks' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setActiveTab('tasks')}>
            Team Tasks
          </button>
          <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeTab === 'messages' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setActiveTab('messages')}>
            Messages
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'members' && <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Team Members</h2>
              <button className="text-blue-600 text-sm font-medium flex items-center" onClick={handleInviteMember}>
                <UserPlusIcon className="w-4 h-4 mr-1" />
                Invite
              </button>
            </div>
            {/* Invite Options - shown when invite button is clicked */}
            {showInviteOptions && <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Invite New Member</h3>
                  <button onClick={() => setShowInviteOptions(false)} className="text-gray-500">
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Share this code with someone to join your care team:
                </p>
                <div className="flex items-center mb-3">
                  <div className="flex-1 bg-gray-100 p-3 rounded-l-lg border border-gray-300 border-r-0 font-mono font-medium text-center">
                    {inviteCode}
                  </div>
                  <button className="bg-blue-500 text-white p-3 rounded-r-lg flex items-center" onClick={handleCopyInviteCode}>
                    {copiedCode ? <CheckIcon className="w-5 h-5" /> : <ShareIcon className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button className="flex-1 py-2 text-sm bg-gray-100 rounded-lg" onClick={() => setShowInviteOptions(false)}>
                    Cancel
                  </button>
                  <button className="flex-1 py-2 text-sm bg-blue-500 text-white rounded-lg" onClick={() => navigateTo('invite-member', {
              teamId: team.id
            })}>
                    Send Invite
                  </button>
                </div>
              </div>}
            {/* Members List */}
            <div className="space-y-3">
              {team.members.map(member => <div key={member.id} className="p-4 bg-white rounded-xl border border-gray-200 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 relative">
                    {member.avatar ? <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" /> : <UserIcon className="w-5 h-5 text-gray-600" />}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{member.name}</h3>
                    <BracketText className="text-xs text-blue-600 mt-1">
                      {member.role}
                    </BracketText>
                  </div>
                  <button className="text-gray-400">
                    <MoreVerticalIcon className="w-5 h-5" />
                  </button>
                </div>)}
            </div>
            {/* Leave Team Button */}
            <div className="mt-8">
              <button className="w-full p-3 border border-red-200 rounded-lg text-red-500 flex items-center justify-center" onClick={handleLeaveTeam}>
                <LogOutIcon className="w-5 h-5 mr-2" />
                Leave Team
              </button>
            </div>
          </div>}
        {activeTab === 'schedule' && <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-medium mb-2">Care Schedule</h3>
            <p className="text-sm text-gray-600 mb-4">
              View and manage the team's care schedule
            </p>
            <Button onClick={() => navigateTo('care-schedule', {
          teamId: team.id
        })} className="w-48">
              View Schedule
            </Button>
          </div>}
        {activeTab === 'tasks' && <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <ClipboardListIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-medium mb-2">Team Tasks</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage and assign care tasks to team members
            </p>
            <Button onClick={() => navigateTo('team-tasks', {
          teamId: team.id
        })} className="w-48">
              View Tasks
            </Button>
          </div>}
        {activeTab === 'messages' && <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <MessageSquareIcon className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="font-medium mb-2">Team Messages</h3>
            <p className="text-sm text-gray-600 mb-4">
              Communicate with the care team
            </p>
            <Button onClick={() => navigateTo('team-messages', {
          teamId: team.id
        })} className="w-48">
              Open Messages
            </Button>
          </div>}
      </div>
    </div>;
};