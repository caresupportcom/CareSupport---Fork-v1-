import React, { useState } from 'react';
import { ArrowLeftIcon, PhoneIcon, AlertCircleIcon, UserIcon, ClipboardIcon, MapPinIcon, ExternalLinkIcon, MessageSquareIcon, StarIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const EmergencyContactScreen = ({
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmergencyInfo, setShowEmergencyInfo] = useState(false);
  const emergencyContacts = [{
    id: 'contact1',
    name: 'Dr. Maria Rodriguez',
    role: 'Primary Physician',
    phone: '(555) 987-6543',
    email: 'dr.rodriguez@example.com',
    isPrimary: true
  }, {
    id: 'contact2',
    name: 'Robert Johnson',
    role: 'Family Member',
    relationship: 'Son',
    phone: '(555) 234-5678',
    email: 'robert.j@example.com',
    isPrimary: true
  }, {
    id: 'contact3',
    name: 'Memorial Hospital',
    role: 'Emergency Room',
    phone: '(555) 911-0000',
    address: '123 Medical Center Dr, Anytown, USA',
    isPrimary: false
  }, {
    id: 'contact4',
    name: 'Sarah Williams',
    role: 'Caregiver',
    phone: '(555) 345-6789',
    email: 'sarah.w@example.com',
    isPrimary: false
  }];
  const emergencyServices = [{
    id: 'service1',
    name: 'Emergency Services',
    description: 'Police, Fire, Ambulance',
    phone: '911',
    icon: 'alert'
  }, {
    id: 'service2',
    name: 'Poison Control',
    description: 'National Poison Control Center',
    phone: '(800) 222-1222',
    icon: 'alert'
  }, {
    id: 'service3',
    name: 'Crisis Hotline',
    description: '24/7 Mental Health Support',
    phone: '(800) 273-8255',
    icon: 'phone'
  }];
  const medicalInfo = {
    allergies: ['Penicillin', 'Shellfish', 'Peanuts'],
    conditions: ['Hypertension', 'Type 2 Diabetes', 'Asthma'],
    medications: ['Lisinopril 10mg - once daily', 'Metformin 500mg - twice daily', 'Albuterol inhaler - as needed'],
    bloodType: 'O+',
    primaryPhysician: 'Dr. Maria Rodriguez',
    insuranceProvider: 'HealthPlus Insurance',
    policyNumber: 'HP12345678'
  };
  const handleCall = (phone, name) => {
    // In a real app, this would initiate a call
    console.log(`Calling ${name} at ${phone}`);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'emergency_contact_called',
      contact_name: name
    });
  };
  const handleCopyInfo = () => {
    // In a real app, this would copy medical info to clipboard
    console.log('Medical info copied to clipboard');
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'medical_info_copied'
    });
    // Show confirmation
    setShowEmergencyInfo(true);
    setTimeout(() => {
      setShowEmergencyInfo(false);
    }, 2000);
  };
  const filteredContacts = searchQuery ? [...emergencyContacts, ...emergencyServices].filter(contact => contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || contact.role && contact.role.toLowerCase().includes(searchQuery.toLowerCase())) : null;
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Emergency Contacts</h1>
      </div>
      {/* Search */}
      <div className="px-6 pb-4">
        <div className="relative">
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search contacts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <div className="absolute left-3 top-3">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
      {/* Tabs */}
      {!searchQuery && <div className="px-6 pb-4 flex space-x-4 border-b border-gray-200">
          <button className={`pb-2 ${activeTab === 'contacts' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'}`} onClick={() => setActiveTab('contacts')}>
            Contacts
          </button>
          <button className={`pb-2 ${activeTab === 'services' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'}`} onClick={() => setActiveTab('services')}>
            Emergency Services
          </button>
          <button className={`pb-2 ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'}`} onClick={() => setActiveTab('info')}>
            Medical Info
          </button>
        </div>}
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Emergency Banner */}
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircleIcon className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">In case of emergency</h3>
            <p className="text-sm text-red-700">
              Call 911 immediately for life-threatening situations
            </p>
          </div>
        </div>
        {/* Search Results */}
        {searchQuery && <div>
            <h2 className="text-lg font-medium mb-4">Search Results</h2>
            {filteredContacts.length > 0 ? <div className="space-y-3">
                {filteredContacts.map(contact => <ContactCard key={contact.id} contact={contact} onCall={handleCall} />)}
              </div> : <p className="text-gray-500 text-center py-6">
                No contacts found matching "{searchQuery}"
              </p>}
          </div>}
        {/* Contacts Tab */}
        {!searchQuery && activeTab === 'contacts' && <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium mb-3">Primary Contacts</h2>
              <div className="space-y-3">
                {emergencyContacts.filter(contact => contact.isPrimary).map(contact => <ContactCard key={contact.id} contact={contact} onCall={handleCall} />)}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-3">Other Contacts</h2>
              <div className="space-y-3">
                {emergencyContacts.filter(contact => !contact.isPrimary).map(contact => <ContactCard key={contact.id} contact={contact} onCall={handleCall} />)}
              </div>
            </div>
          </div>}
        {/* Services Tab */}
        {!searchQuery && activeTab === 'services' && <div>
            <h2 className="text-lg font-medium mb-4">Emergency Services</h2>
            <div className="space-y-3">
              {emergencyServices.map(service => <ServiceCard key={service.id} service={service} onCall={handleCall} />)}
            </div>
          </div>}
        {/* Medical Info Tab */}
        {!searchQuery && activeTab === 'info' && <div>
            <h2 className="text-lg font-medium mb-4">Medical Information</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium mb-2">Allergies</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {medicalInfo.allergies.map((allergy, index) => <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {allergy}
                    </li>)}
                </ul>
              </div>
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium mb-2">Medical Conditions</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {medicalInfo.conditions.map((condition, index) => <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {condition}
                    </li>)}
                </ul>
              </div>
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium mb-2">Current Medications</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {medicalInfo.medications.map((medication, index) => <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {medication}
                    </li>)}
                </ul>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs text-gray-500 mb-1">Blood Type</h3>
                    <p className="font-medium">{medicalInfo.bloodType}</p>
                  </div>
                  <div>
                    <h3 className="text-xs text-gray-500 mb-1">
                      Primary Physician
                    </h3>
                    <p className="font-medium">
                      {medicalInfo.primaryPhysician}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs text-gray-500 mb-1">Insurance</h3>
                    <p className="font-medium">
                      {medicalInfo.insuranceProvider}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs text-gray-500 mb-1">
                      Policy Number
                    </h3>
                    <p className="font-medium">{medicalInfo.policyNumber}</p>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={handleCopyInfo} className="w-full">
              <ClipboardIcon className="w-5 h-5 mr-2" />
              <BracketText active={true} className="text-white">
                Copy Medical Information
              </BracketText>
            </Button>
            {showEmergencyInfo && <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm text-center">
                Medical information copied to clipboard
              </div>}
          </div>}
      </div>
    </div>;
};
// Contact card component
const ContactCard = ({
  contact,
  onCall
}) => {
  return <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
          <UserIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="font-medium">{contact.name}</h3>
            {contact.isPrimary && <StarIcon className="w-4 h-4 text-yellow-500 ml-2" />}
          </div>
          <p className="text-sm text-gray-600">{contact.role}</p>
          {contact.relationship && <p className="text-xs text-gray-500">
              Relationship: {contact.relationship}
            </p>}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap">
        <button className="flex items-center mr-4 text-blue-600 text-sm" onClick={() => onCall(contact.phone, contact.name)}>
          <PhoneIcon className="w-4 h-4 mr-1" />
          {contact.phone}
        </button>
        {contact.email && <button className="flex items-center mr-4 text-blue-600 text-sm">
            <MessageSquareIcon className="w-4 h-4 mr-1" />
            Email
          </button>}
        {contact.address && <button className="flex items-center text-blue-600 text-sm mt-2">
            <MapPinIcon className="w-4 h-4 mr-1" />
            Directions
          </button>}
      </div>
    </div>;
};
// Service card component
const ServiceCard = ({
  service,
  onCall
}) => {
  return <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
          {service.icon === 'alert' ? <AlertCircleIcon className="w-5 h-5 text-red-600" /> : <PhoneIcon className="w-5 h-5 text-red-600" />}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{service.name}</h3>
          <p className="text-sm text-gray-600">{service.description}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex">
        <button className="flex items-center mr-4 text-red-600 text-sm font-medium" onClick={() => onCall(service.phone, service.name)}>
          <PhoneIcon className="w-4 h-4 mr-1" />
          {service.phone}
        </button>
        <button className="flex items-center text-blue-600 text-sm">
          <ExternalLinkIcon className="w-4 h-4 mr-1" />
          More Info
        </button>
      </div>
    </div>;
};
// Search icon component
const SearchIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>;