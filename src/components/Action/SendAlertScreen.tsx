import React, { useState } from 'react';
import { ArrowLeftIcon, AlertCircleIcon, UserIcon, CheckIcon, XIcon } from 'lucide-react';
import { BracketText } from '../Common/BracketText';
import { Button } from '../Common/Button';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { useConnection } from '../../contexts/ConnectionContext';
export const SendAlertScreen = ({
  onBack
}) => {
  const {
    isOnline
  } = useConnection();
  const [alertType, setAlertType] = useState('general');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState(['james', 'maria']);
  const [urgency, setUrgency] = useState('medium');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const alertTypes = [{
    id: 'general',
    label: 'General Update',
    icon: AlertCircleIcon,
    color: 'blue'
  }, {
    id: 'medication',
    label: 'Medication Issue',
    icon: AlertCircleIcon,
    color: 'orange'
  }, {
    id: 'emergency',
    label: 'Emergency',
    icon: AlertCircleIcon,
    color: 'red'
  }, {
    id: 'health',
    label: 'Health Change',
    icon: AlertCircleIcon,
    color: 'green'
  }];
  const careTeamMembers = [{
    id: 'james',
    name: 'James',
    role: 'Nurse'
  }, {
    id: 'maria',
    name: 'Maria',
    role: 'Doctor'
  }, {
    id: 'linda',
    name: 'Linda',
    role: 'Caregiver'
  }, {
    id: 'robert',
    name: 'Robert',
    role: 'Family Member'
  }];
  const handleSendAlert = () => {
    if (!isOnline) {
      // Handle offline case
      return;
    }
    setIsSending(true);
    // Track alert in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'alert_sent',
      alert_type: alertType,
      alert_urgency: urgency,
      recipient_count: recipients.length
    });
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      // Reset after showing success
      setTimeout(() => {
        onBack();
      }, 1500);
    }, 1000);
  };
  const toggleRecipient = id => {
    if (recipients.includes(id)) {
      setRecipients(recipients.filter(r => r !== id));
    } else {
      setRecipients([...recipients, id]);
    }
  };
  const getUrgencyClass = level => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  if (isSent) {
    return <div className="h-full flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Alert Sent!</h2>
        <p className="text-gray-600">
          Your alert has been sent to the care team
        </p>
      </div>;
  }
  return <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center border-b border-gray-200">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Send Alert</h1>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Alert Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alert Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {alertTypes.map(type => <button key={type.id} className={`p-3 rounded-xl border ${alertType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} flex items-center`} onClick={() => setAlertType(type.id)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${type.color === 'blue' ? 'bg-blue-100 text-blue-600' : type.color === 'red' ? 'bg-red-100 text-red-600' : type.color === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                  <type.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{type.label}</span>
              </button>)}
          </div>
        </div>
        {/* Urgency */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urgency
          </label>
          <div className="flex space-x-2">
            {['low', 'medium', 'high'].map(level => <button key={level} className={`flex-1 py-2 px-3 rounded-lg border ${urgency === level ? getUrgencyClass(level) : 'border-gray-200 bg-white text-gray-700'}`} onClick={() => setUrgency(level)}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>)}
          </div>
        </div>
        {/* Message */}
        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea id="message" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Describe the situation..." value={message} onChange={e => setMessage(e.target.value)} />
        </div>
        {/* Recipients */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Send To
          </label>
          <div className="space-y-2">
            {careTeamMembers.map(member => <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
                <button className={`w-6 h-6 rounded-full flex items-center justify-center ${recipients.includes(member.id) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`} onClick={() => toggleRecipient(member.id)}>
                  {recipients.includes(member.id) ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
                </button>
              </div>)}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <Button onClick={handleSendAlert} disabled={!message.trim() || recipients.length === 0 || isSending || !isOnline} className="w-full">
          {isSending ? 'Sending...' : 'Send Alert'}
        </Button>
        {!isOnline && <p className="mt-2 text-sm text-red-500 text-center">
            You need to be online to send alerts
          </p>}
      </div>
    </div>;
};