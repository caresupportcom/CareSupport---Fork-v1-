import React, { useState } from 'react';
import { ArrowLeftIcon, MessageSquareIcon, UserIcon, CheckIcon, XIcon, ImageIcon, Paperclip } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const SendUpdateScreen = ({
  onBack
}) => {
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState(['james', 'maria']);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
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
  const handleSendUpdate = () => {
    setIsSending(true);
    // Track update in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'update_sent',
      recipient_count: recipients.length,
      message_length: message.length
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
  if (isSent) {
    return <div className="h-full flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Update Sent!</h2>
        <p className="text-gray-600">
          Your update has been sent to the care team
        </p>
      </div>;
  }
  return <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center border-b border-gray-200">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Send Update</h1>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Message */}
        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Update Message
          </label>
          <textarea id="message" rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Share an update with the care team..." value={message} onChange={e => setMessage(e.target.value)} />
        </div>
        {/* Attachment Options */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button className="flex items-center p-2 border border-gray-300 rounded-lg text-sm text-gray-600">
              <ImageIcon className="w-4 h-4 mr-1" />
              <span>Add Photo</span>
            </button>
            <button className="flex items-center p-2 border border-gray-300 rounded-lg text-sm text-gray-600">
              <Paperclip className="w-4 h-4 mr-1" />
              <span>Attach File</span>
            </button>
          </div>
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
        <Button onClick={handleSendUpdate} disabled={!message.trim() || recipients.length === 0 || isSending} className="w-full">
          {isSending ? 'Sending...' : 'Send Update'}
        </Button>
      </div>
    </div>;
};