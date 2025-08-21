import React, { useState } from 'react';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserIcon, CheckIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const ScheduleAppointmentScreen = ({
  onBack
}) => {
  const [formData, setFormData] = useState({
    provider: '',
    appointmentType: '',
    date: '',
    time: '',
    location: '',
    notes: '',
    reminder: '60',
    transportation: 'none'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAvailableTimes, setShowAvailableTimes] = useState(false);
  const providers = [{
    id: 'dr-smith',
    name: 'Dr. Smith',
    specialty: 'Primary Care',
    availability: ['Monday', 'Wednesday', 'Friday']
  }, {
    id: 'dr-johnson',
    name: 'Dr. Johnson',
    specialty: 'Cardiology',
    availability: ['Tuesday', 'Thursday']
  }, {
    id: 'dr-patel',
    name: 'Dr. Patel',
    specialty: 'Neurology',
    availability: ['Monday', 'Tuesday', 'Friday']
  }];
  const appointmentTypes = [{
    id: 'checkup',
    name: 'Regular Check-up',
    duration: '30 min'
  }, {
    id: 'followup',
    name: 'Follow-up Visit',
    duration: '20 min'
  }, {
    id: 'specialist',
    name: 'Specialist Consultation',
    duration: '45 min'
  }, {
    id: 'test',
    name: 'Medical Test',
    duration: '60 min'
  }];
  const availableTimes = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'];
  const reminderOptions = [{
    value: '0',
    label: 'No reminder'
  }, {
    value: '30',
    label: '30 minutes before'
  }, {
    value: '60',
    label: '1 hour before'
  }, {
    value: '120',
    label: '2 hours before'
  }, {
    value: '1440',
    label: '1 day before'
  }, {
    value: '2880',
    label: '2 days before'
  }];
  const transportationOptions = [{
    value: 'none',
    label: 'None needed'
  }, {
    value: 'self',
    label: 'Self-transport'
  }, {
    value: 'family',
    label: 'Family member'
  }, {
    value: 'service',
    label: 'Transportation service'
  }];
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
    // Show available times when date is selected
    if (field === 'date' && value) {
      setShowAvailableTimes(true);
    }
  };
  const handleSelectTime = time => {
    handleInputChange('time', time);
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.provider) {
      newErrors.provider = 'Provider is required';
    }
    if (!formData.appointmentType) {
      newErrors.appointmentType = 'Appointment type is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    // Track in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'appointment_scheduled',
      provider: formData.provider,
      appointment_type: formData.appointmentType
    });
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Return to previous screen after showing success
      setTimeout(() => {
        onBack();
      }, 1500);
    }, 1000);
  };
  if (isSuccess) {
    return <div className="h-full flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Appointment Scheduled!</h2>
        <p className="text-gray-600 mb-2">
          {providers.find(p => p.id === formData.provider)?.name || 'Provider'}{' '}
          on {formData.date} at {formData.time}
        </p>
        <p className="text-gray-500 text-sm">
          A reminder has been set for this appointment
        </p>
      </div>;
  }
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Schedule Appointment</h1>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <label className="block font-medium mb-2">
              Healthcare Provider
            </label>
            <div className="space-y-2">
              {providers.map(provider => <button key={provider.id} className={`w-full p-3 rounded-lg border ${formData.provider === provider.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleInputChange('provider', provider.id)}>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium">{provider.name}</h3>
                    <p className="text-sm text-gray-600">
                      {provider.specialty}
                    </p>
                    <p className="text-xs text-gray-500">
                      Available: {provider.availability.join(', ')}
                    </p>
                  </div>
                  {formData.provider === provider.id && <div className="ml-auto bg-blue-500 text-white p-1 rounded-full">
                      <CheckIcon className="w-4 h-4" />
                    </div>}
                </button>)}
            </div>
            {errors.provider && <p className="text-red-500 text-sm mt-1">{errors.provider}</p>}
          </div>
          <div>
            <label className="block font-medium mb-2">Appointment Type</label>
            <div className="space-y-2">
              {appointmentTypes.map(type => <button key={type.id} className={`w-full p-3 rounded-lg border ${formData.appointmentType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleInputChange('appointmentType', type.id)}>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium">{type.name}</h3>
                    <p className="text-sm text-gray-600">
                      Duration: {type.duration}
                    </p>
                  </div>
                  {formData.appointmentType === type.id && <div className="ml-auto bg-blue-500 text-white p-1 rounded-full">
                      <CheckIcon className="w-4 h-4" />
                    </div>}
                </button>)}
            </div>
            {errors.appointmentType && <p className="text-red-500 text-sm mt-1">
                {errors.appointmentType}
              </p>}
          </div>
          <div>
            <label className="block font-medium mb-2">Appointment Date</label>
            <div className="relative">
              <input type="date" className={`w-full border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} value={formData.date} onChange={e => handleInputChange('date', e.target.value)} />
              <div className="absolute right-3 top-3 pointer-events-none">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
          {showAvailableTimes && <div>
              <label className="block font-medium mb-2">Available Times</label>
              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map(time => <button key={time} className={`py-2 px-3 rounded-lg border text-sm ${formData.time === time ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700'}`} onClick={() => handleSelectTime(time)}>
                    {time}
                  </button>)}
              </div>
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>}
          <div>
            <label className="block font-medium mb-2">Location</label>
            <div className="relative">
              <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter appointment location" value={formData.location} onChange={e => handleInputChange('location', e.target.value)} />
              <div className="absolute left-3 top-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-2">Reminder</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.reminder} onChange={e => handleInputChange('reminder', e.target.value)}>
              {reminderOptions.map(option => <option key={option.value} value={option.value}>
                  {option.label}
                </option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-2">Transportation</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.transportation} onChange={e => handleInputChange('transportation', e.target.value)}>
              {transportationOptions.map(option => <option key={option.value} value={option.value}>
                  {option.label}
                </option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-2">Notes</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add any notes or special instructions" value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} />
          </div>
        </div>
        <div className="mt-8">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            <BracketText active={true} className="text-white">
              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
            </BracketText>
          </Button>
        </div>
      </div>
    </div>;
};