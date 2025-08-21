import React, { useState } from 'react';
import { ArrowLeftIcon, LockIcon, EyeIcon, MapPinIcon, UsersIcon, ClipboardIcon, TrashIcon, DownloadIcon, ShieldIcon, BellIcon, CalendarIcon, AlertTriangleIcon, InfoIcon, XCircleIcon } from 'lucide-react';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const PrivacySettingsScreen = ({
  onBack
}) => {
  // In a real app, these would be part of the user preferences context
  // For now, we'll use local state to demonstrate the UI
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: {
      shareUsageData: false,
      shareHealthData: false,
      shareCareActivities: true,
      allowAnonymizedResearch: true
    },
    locationSharing: {
      shareWithTeam: true,
      shareWithCareRecipient: true,
      preciseLocation: false,
      shareWhenOffline: false
    },
    profileVisibility: {
      showOnlineStatus: true,
      showRoleInformation: true,
      showContactInfo: false,
      allowSearchByEmail: true,
      allowSearchByName: true
    },
    teamSharing: {
      shareScheduleWithTeam: true,
      shareNotesWithTeam: true,
      allowMembersToInvite: false,
      showMemberActivity: true
    },
    dataRetention: {
      messageRetention: '30days',
      activityLogsRetention: '90days',
      autoDeleteCompletedTasks: false
    }
  });
  const [showDataDeletionConfirm, setShowDataDeletionConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState('all');
  const handleToggleSetting = (category, setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'privacy_setting_changed',
      category: category,
      setting: setting,
      new_value: !privacySettings[category][setting]
    });
  };
  const handleRetentionChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      dataRetention: {
        ...prev.dataRetention,
        [setting]: value
      }
    }));
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'retention_setting_changed',
      setting: setting,
      new_value: value
    });
  };
  const handleExportData = () => {
    // In a real app, this would trigger a data export process
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'data_export_requested'
    });
    alert('Your data export has been initiated. You will receive a download link via email shortly.');
  };
  const handleDeleteAllData = () => {
    // In a real app, this would trigger a data deletion process
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'data_deletion_confirmed'
    });
    setShowDataDeletionConfirm(false);
    alert('Your data deletion request has been received. This process may take up to 30 days to complete.');
  };
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center bg-white border-b border-gray-200">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Privacy Settings</h1>
      </div>
      {/* Section Tabs */}
      <div className="px-6 pt-4 pb-2 flex space-x-2 overflow-x-auto bg-white border-b border-gray-200">
        <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeSection === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setActiveSection('all')}>
          All Settings
        </button>
        <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeSection === 'dataSharing' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setActiveSection('dataSharing')}>
          Data Sharing
        </button>
        <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeSection === 'location' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setActiveSection('location')}>
          Location
        </button>
        <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeSection === 'visibility' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setActiveSection('visibility')}>
          Visibility
        </button>
        <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeSection === 'dataManagement' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => setActiveSection('dataManagement')}>
          Data Management
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <p className="text-gray-600 mb-6">
          Control how your information is shared and used within the app and
          with your care teams.
        </p>
        <div className="space-y-6">
          {/* Data Sharing */}
          {(activeSection === 'all' || activeSection === 'dataSharing') && <div className="p-4 border border-gray-200 rounded-xl bg-white">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                  <ClipboardIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Data Sharing</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Control what data is shared with care teams and services
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Usage Data</h4>
                        <p className="text-xs text-gray-500">
                          Share app usage data to improve services
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.dataSharing.shareUsageData} onChange={() => handleToggleSetting('dataSharing', 'shareUsageData')} aria-label="Toggle usage data sharing" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Health Data</h4>
                        <p className="text-xs text-gray-500">
                          Share health data with care providers
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.dataSharing.shareHealthData} onChange={() => handleToggleSetting('dataSharing', 'shareHealthData')} aria-label="Toggle health data sharing" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Care Activities</h4>
                        <p className="text-xs text-gray-500">
                          Share caregiving activities with team
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.dataSharing.shareCareActivities} onChange={() => handleToggleSetting('dataSharing', 'shareCareActivities')} aria-label="Toggle care activities sharing" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Research Contribution
                        </h4>
                        <p className="text-xs text-gray-500">
                          Allow anonymized data for caregiving research
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.dataSharing.allowAnonymizedResearch} onChange={() => handleToggleSetting('dataSharing', 'allowAnonymizedResearch')} aria-label="Toggle research data contribution" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          {/* Location Sharing */}
          {(activeSection === 'all' || activeSection === 'location') && <div className="p-4 border border-gray-200 rounded-xl bg-white">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4 flex-shrink-0">
                  <MapPinIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Location Sharing</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Control how your location is shared with others
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Share with Care Team
                        </h4>
                        <p className="text-xs text-gray-500">
                          Allow team members to see your location
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.locationSharing.shareWithTeam} onChange={() => handleToggleSetting('locationSharing', 'shareWithTeam')} aria-label="Toggle location sharing with team" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Share with Care Recipient
                        </h4>
                        <p className="text-xs text-gray-500">
                          Allow care recipient to see your location
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.locationSharing.shareWithCareRecipient} onChange={() => handleToggleSetting('locationSharing', 'shareWithCareRecipient')} aria-label="Toggle location sharing with care recipient" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Precise Location
                        </h4>
                        <p className="text-xs text-gray-500">
                          Share exact location vs. approximate area
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.locationSharing.preciseLocation} onChange={() => handleToggleSetting('locationSharing', 'preciseLocation')} aria-label="Toggle precise location sharing" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Share When Offline
                        </h4>
                        <p className="text-xs text-gray-500">
                          Continue sharing last known location when offline
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.locationSharing.shareWhenOffline} onChange={() => handleToggleSetting('locationSharing', 'shareWhenOffline')} aria-label="Toggle offline location sharing" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          {/* Profile Visibility */}
          {(activeSection === 'all' || activeSection === 'visibility') && <div className="p-4 border border-gray-200 rounded-xl bg-white">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-4 flex-shrink-0">
                  <EyeIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Profile Visibility</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Control what others can see about you
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Online Status</h4>
                        <p className="text-xs text-gray-500">
                          Show when you're online to team members
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.profileVisibility.showOnlineStatus} onChange={() => handleToggleSetting('profileVisibility', 'showOnlineStatus')} aria-label="Toggle online status visibility" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Role Information
                        </h4>
                        <p className="text-xs text-gray-500">
                          Show your caregiving role to others
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.profileVisibility.showRoleInformation} onChange={() => handleToggleSetting('profileVisibility', 'showRoleInformation')} aria-label="Toggle role information visibility" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Contact Information
                        </h4>
                        <p className="text-xs text-gray-500">
                          Show contact details to care team members
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.profileVisibility.showContactInfo} onChange={() => handleToggleSetting('profileVisibility', 'showContactInfo')} aria-label="Toggle contact information visibility" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Email Search</h4>
                        <p className="text-xs text-gray-500">
                          Allow others to find you by email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.profileVisibility.allowSearchByEmail} onChange={() => handleToggleSetting('profileVisibility', 'allowSearchByEmail')} aria-label="Toggle email search visibility" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Name Search</h4>
                        <p className="text-xs text-gray-500">
                          Allow others to find you by name
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.profileVisibility.allowSearchByName} onChange={() => handleToggleSetting('profileVisibility', 'allowSearchByName')} aria-label="Toggle name search visibility" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          {/* Team Information Sharing */}
          {(activeSection === 'all' || activeSection === 'visibility') && <div className="p-4 border border-gray-200 rounded-xl bg-white">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                  <UsersIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Team Information Sharing</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Control how information is shared within care teams
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Schedule Sharing
                        </h4>
                        <p className="text-xs text-gray-500">
                          Share your care schedule with team members
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.teamSharing.shareScheduleWithTeam} onChange={() => handleToggleSetting('teamSharing', 'shareScheduleWithTeam')} aria-label="Toggle schedule sharing" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Notes Sharing</h4>
                        <p className="text-xs text-gray-500">
                          Share your care notes with team members
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.teamSharing.shareNotesWithTeam} onChange={() => handleToggleSetting('teamSharing', 'shareNotesWithTeam')} aria-label="Toggle notes sharing" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Member Invitations
                        </h4>
                        <p className="text-xs text-gray-500">
                          Allow team members to invite others
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.teamSharing.allowMembersToInvite} onChange={() => handleToggleSetting('teamSharing', 'allowMembersToInvite')} aria-label="Toggle member invitation permission" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Activity Visibility
                        </h4>
                        <p className="text-xs text-gray-500">
                          Show your activity to other team members
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.teamSharing.showMemberActivity} onChange={() => handleToggleSetting('teamSharing', 'showMemberActivity')} aria-label="Toggle activity visibility" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          {/* Data Retention */}
          {(activeSection === 'all' || activeSection === 'dataManagement') && <div className="p-4 border border-gray-200 rounded-xl bg-white">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4 flex-shrink-0">
                  <ShieldIcon className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Data Retention</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Control how long your data is stored
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Message Retention
                      </h4>
                      <div className="flex flex-col space-y-2">
                        <label className="flex items-center">
                          <input type="radio" name="messageRetention" value="forever" checked={privacySettings.dataRetention.messageRetention === 'forever'} onChange={() => handleRetentionChange('messageRetention', 'forever')} className="w-4 h-4 text-blue-600" />
                          <span className="ml-2 text-sm">Keep forever</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="messageRetention" value="1year" checked={privacySettings.dataRetention.messageRetention === '1year'} onChange={() => handleRetentionChange('messageRetention', '1year')} className="w-4 h-4 text-blue-600" />
                          <span className="ml-2 text-sm">Keep for 1 year</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="messageRetention" value="90days" checked={privacySettings.dataRetention.messageRetention === '90days'} onChange={() => handleRetentionChange('messageRetention', '90days')} className="w-4 h-4 text-blue-600" />
                          <span className="ml-2 text-sm">Keep for 90 days</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="messageRetention" value="30days" checked={privacySettings.dataRetention.messageRetention === '30days'} onChange={() => handleRetentionChange('messageRetention', '30days')} className="w-4 h-4 text-blue-600" />
                          <span className="ml-2 text-sm">Keep for 30 days</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Activity Logs Retention
                      </h4>
                      <div className="flex flex-col space-y-2">
                        <label className="flex items-center">
                          <input type="radio" name="activityLogsRetention" value="forever" checked={privacySettings.dataRetention.activityLogsRetention === 'forever'} onChange={() => handleRetentionChange('activityLogsRetention', 'forever')} className="w-4 h-4 text-blue-600" />
                          <span className="ml-2 text-sm">Keep forever</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="activityLogsRetention" value="1year" checked={privacySettings.dataRetention.activityLogsRetention === '1year'} onChange={() => handleRetentionChange('activityLogsRetention', '1year')} className="w-4 h-4 text-blue-600" />
                          <span className="ml-2 text-sm">Keep for 1 year</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="activityLogsRetention" value="90days" checked={privacySettings.dataRetention.activityLogsRetention === '90days'} onChange={() => handleRetentionChange('activityLogsRetention', '90days')} className="w-4 h-4 text-blue-600" />
                          <span className="ml-2 text-sm">Keep for 90 days</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="activityLogsRetention" value="30days" checked={privacySettings.dataRetention.activityLogsRetention === '30days'} onChange={() => handleRetentionChange('activityLogsRetention', '30days')} className="w-4 h-4 text-blue-600" />
                          <span className="ml-2 text-sm">Keep for 30 days</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Auto-Delete Completed Tasks
                        </h4>
                        <p className="text-xs text-gray-500">
                          Automatically delete tasks after completion
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={privacySettings.dataRetention.autoDeleteCompletedTasks} onChange={() => handleToggleSetting('dataRetention', 'autoDeleteCompletedTasks')} aria-label="Toggle auto-delete completed tasks" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          {/* Data Management */}
          {(activeSection === 'all' || activeSection === 'dataManagement') && <div className="p-4 border border-gray-200 rounded-xl bg-white">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
                  <DownloadIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Data Management</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Export or delete your personal data
                  </p>
                  <div className="space-y-4">
                    <Button onClick={handleExportData} className="w-full flex items-center justify-center" variant="secondary">
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Export All My Data
                    </Button>
                    <Button onClick={() => setShowDataDeletionConfirm(true)} className="w-full flex items-center justify-center" variant="danger">
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete All My Data
                    </Button>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                      <InfoIcon className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-700">
                        Exporting data will include all your personal
                        information, care tasks, team information, and activity
                        history. Data deletion is permanent and cannot be
                        undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
        </div>
      </div>
      {/* Data Deletion Confirmation Modal */}
      {showDataDeletionConfirm && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-red-600">
                Delete All Data
              </h3>
              <button onClick={() => setShowDataDeletionConfirm(false)} className="text-gray-500">
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-700 mb-4">
                This action will permanently delete all your data from
                CareSupport, including:
              </p>
              <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
                <li>Personal profile information</li>
                <li>Care team memberships and data</li>
                <li>Tasks, schedules, and care history</li>
                <li>Messages and communications</li>
                <li>App settings and preferences</li>
              </ul>
              <p className="text-gray-700 font-medium">
                This action cannot be undone. Are you sure you want to proceed?
              </p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => setShowDataDeletionConfirm(false)} className="flex-1" variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleDeleteAllData} className="flex-1" variant="danger">
                Yes, Delete All Data
              </Button>
            </div>
          </div>
        </div>}
    </div>;
};