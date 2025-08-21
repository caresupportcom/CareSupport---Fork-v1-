import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, PhoneIcon, MicOffIcon, PhoneOffIcon, UserIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const MakeCallScreen = ({
  onBack
}) => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState(null);
  const contacts = [{
    id: 'james',
    name: 'James Wilson',
    role: 'Nurse',
    phoneNumber: '(555) 123-4567',
    availability: 'available',
    avatar: null
  }, {
    id: 'maria',
    name: 'Dr. Maria Rodriguez',
    role: 'Primary Physician',
    phoneNumber: '(555) 987-6543',
    availability: 'available',
    avatar: null
  }, {
    id: 'linda',
    name: 'Linda Chen',
    role: 'Caregiver',
    phoneNumber: '(555) 456-7890',
    availability: 'busy',
    avatar: null
  }, {
    id: 'robert',
    name: 'Robert Johnson',
    role: 'Family Member',
    phoneNumber: '(555) 234-5678',
    availability: 'available',
    avatar: null
  }, {
    id: 'sarah',
    name: 'Sarah Williams',
    role: 'Physical Therapist',
    phoneNumber: '(555) 345-6789',
    availability: 'offline',
    avatar: null
  }];
  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (callTimer) {
        clearInterval(callTimer);
      }
    };
  }, [callTimer]);
  const formatCallDuration = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  const handleSelectContact = contact => {
    setSelectedContact(contact);
  };
  const handleStartCall = () => {
    if (!selectedContact) return;
    setCallStatus('calling');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'call_started',
      contact_id: selectedContact.id,
      contact_name: selectedContact.name
    });
    // Simulate call connecting after a delay
    setTimeout(() => {
      setCallStatus('connected');
      // Start call duration timer
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setCallTimer(timer);
    }, 2000);
  };
  const handleEndCall = () => {
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
    setCallStatus('ended');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'call_ended',
      contact_id: selectedContact.id,
      contact_name: selectedContact.name,
      call_duration: callDuration
    });
    // Return to contact selection after a delay
    setTimeout(() => {
      setCallStatus('idle');
      setCallDuration(0);
      setSelectedContact(null);
    }, 2000);
  };
  const getAvailabilityColor = availability => {
    switch (availability) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };
  // Show call interface when in calling or connected state
  if (callStatus === 'calling' || callStatus === 'connected') {
    return <div className="h-full flex flex-col bg-gray-50">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {callStatus === 'calling' ? 'Calling...' : 'Connected'}
          </h1>
          <BracketText className="text-gray-600">
            {callStatus === 'connected' ? formatCallDuration(callDuration) : ''}
          </BracketText>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <span className="text-3xl font-semibold text-blue-600">
              {selectedContact.name.charAt(0)}
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-1">{selectedContact.name}</h2>
          <p className="text-gray-600 mb-4">{selectedContact.role}</p>
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500">
              {callStatus === 'calling' ? 'Calling...' : 'Connected'}
            </p>
            {callStatus === 'connected' && <p className="text-sm font-medium mt-1">
                {formatCallDuration(callDuration)}
              </p>}
          </div>
          <div className="flex space-x-6">
            <button className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
              <MicOffIcon className="w-6 h-6 text-gray-600" />
            </button>
            <button className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center" onClick={handleEndCall}>
              <PhoneOffIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>;
  }
  // Show call ended screen
  if (callStatus === 'ended') {
    return <div className="h-full flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <PhoneIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Call Ended</h2>
        <p className="text-gray-600">
          Call duration: {formatCallDuration(callDuration)}
        </p>
      </div>;
  }
  // Show contact selection screen
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Make Call</h1>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <p className="text-gray-600 mb-6">Select a care team member to call</p>
        <div className="space-y-3">
          {contacts.map(contact => <button key={contact.id} className={`w-full p-4 rounded-xl border ${selectedContact?.id === contact.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleSelectContact(contact)} disabled={contact.availability === 'offline'}>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4 relative">
                {contact.avatar ? <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" /> : <UserIcon className="w-6 h-6 text-gray-600" />}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getAvailabilityColor(contact.availability)}`} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">{contact.name}</h3>
                <p className="text-sm text-gray-600">{contact.role}</p>
                <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
              </div>
              <div className="ml-4">
                <PhoneIcon className={`w-5 h-5 ${contact.availability === 'offline' ? 'text-gray-300' : 'text-green-500'}`} />
              </div>
            </button>)}
        </div>
      </div>
      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <Button onClick={handleStartCall} disabled={!selectedContact} className="w-full">
          <PhoneIcon className="w-5 h-5 mr-2" />
          <BracketText active={true} className="text-white">
            Call {selectedContact ? selectedContact.name : 'Selected Contact'}
          </BracketText>
        </Button>
      </div>
    </div>;
};