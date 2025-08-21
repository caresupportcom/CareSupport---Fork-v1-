import React, { useState } from 'react';
import { ArrowLeftIcon, PillIcon, ClockIcon, BellIcon, RepeatIcon, CalendarIcon, CheckIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const MedicationReminderScreen = ({
  onBack
}) => {
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    startDate: '',
    endDate: '',
    instructions: '',
    reminder: '15'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const frequencyOptions = [{
    value: 'daily',
    label: 'Daily'
  }, {
    value: 'twice-daily',
    label: 'Twice Daily'
  }, {
    value: 'three-times-daily',
    label: 'Three Times Daily'
  }, {
    value: 'weekly',
    label: 'Weekly'
  }, {
    value: 'as-needed',
    label: 'As Needed'
  }];
  const reminderOptions = [{
    value: '0',
    label: 'No reminder'
  }, {
    value: '5',
    label: '5 minutes before'
  }, {
    value: '15',
    label: '15 minutes before'
  }, {
    value: '30',
    label: '30 minutes before'
  }, {
    value: '60',
    label: '1 hour before'
  }];
  const recentMedications = [{
    id: 'med1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'daily'
  }, {
    id: 'med2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'twice-daily'
  }, {
    id: 'med3',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'daily'
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
    // Set default times based on frequency
    if (field === 'frequency') {
      let defaultTimes = [];
      switch (value) {
        case 'daily':
          defaultTimes = ['08:00'];
          break;
        case 'twice-daily':
          defaultTimes = ['08:00', '20:00'];
          break;
        case 'three-times-daily':
          defaultTimes = ['08:00', '14:00', '20:00'];
          break;
        case 'weekly':
          defaultTimes = ['08:00'];
          break;
        case 'as-needed':
          defaultTimes = [];
          break;
        default:
          defaultTimes = ['08:00'];
      }
      setFormData({
        ...formData,
        frequency: value,
        times: defaultTimes
      });
    }
  };
  const handleSelectMedication = medication => {
    setSelectedMedication(medication);
    setFormData({
      ...formData,
      medicationName: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency
    });
    // Set default times based on frequency
    let defaultTimes = [];
    switch (medication.frequency) {
      case 'daily':
        defaultTimes = ['08:00'];
        break;
      case 'twice-daily':
        defaultTimes = ['08:00', '20:00'];
        break;
      case 'three-times-daily':
        defaultTimes = ['08:00', '14:00', '20:00'];
        break;
      default:
        defaultTimes = ['08:00'];
    }
    setFormData({
      ...formData,
      medicationName: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      times: defaultTimes
    });
  };
  const handleAddTime = () => {
    setFormData({
      ...formData,
      times: [...formData.times, '']
    });
  };
  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({
      ...formData,
      times: newTimes
    });
  };
  const handleRemoveTime = index => {
    const newTimes = [...formData.times];
    newTimes.splice(index, 1);
    setFormData({
      ...formData,
      times: newTimes
    });
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.medicationName.trim()) {
      newErrors.medicationName = 'Medication name is required';
    }
    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }
    if (formData.frequency !== 'as-needed' && formData.times.length === 0) {
      newErrors.times = 'At least one time is required';
    }
    if (formData.times.some(time => !time)) {
      newErrors.times = 'All time fields must be filled';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    // Track in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'medication_reminder_set',
      medication_name: formData.medicationName,
      frequency: formData.frequency,
      times_count: formData.times.length
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
        <h2 className="text-xl font-semibold mb-2">Reminder Set!</h2>
        <p className="text-gray-600 mb-1">
          Medication reminder has been scheduled
        </p>
        <p className="text-sm text-gray-500">
          {formData.medicationName} {formData.dosage}
        </p>
      </div>;
  }
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Medication Reminder</h1>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {recentMedications.length > 0 && <div className="mb-6">
            <h2 className="text-base font-medium mb-3">Recent Medications</h2>
            <div className="space-y-2">
              {recentMedications.map(medication => <button key={medication.id} className={`w-full p-3 rounded-lg border ${selectedMedication?.id === medication.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => handleSelectMedication(medication)}>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <PillIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium">{medication.name}</h3>
                    <p className="text-sm text-gray-600">
                      {medication.dosage} -{' '}
                      {medication.frequency === 'daily' ? 'Once daily' : medication.frequency === 'twice-daily' ? 'Twice daily' : medication.frequency === 'three-times-daily' ? 'Three times daily' : medication.frequency}
                    </p>
                  </div>
                  {selectedMedication?.id === medication.id && <div className="ml-auto bg-blue-500 text-white p-1 rounded-full">
                      <CheckIcon className="w-4 h-4" />
                    </div>}
                </button>)}
            </div>
          </div>}
        <div className="space-y-6">
          <div>
            <label className="block font-medium mb-2">Medication Name</label>
            <input type="text" className={`w-full border ${errors.medicationName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter medication name" value={formData.medicationName} onChange={e => handleInputChange('medicationName', e.target.value)} />
            {errors.medicationName && <p className="text-red-500 text-sm mt-1">
                {errors.medicationName}
              </p>}
          </div>
          <div>
            <label className="block font-medium mb-2">Dosage</label>
            <input type="text" className={`w-full border ${errors.dosage ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter dosage (e.g., 10mg)" value={formData.dosage} onChange={e => handleInputChange('dosage', e.target.value)} />
            {errors.dosage && <p className="text-red-500 text-sm mt-1">{errors.dosage}</p>}
          </div>
          <div>
            <label className="block font-medium mb-2">Frequency</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.frequency} onChange={e => handleInputChange('frequency', e.target.value)}>
              {frequencyOptions.map(option => <option key={option.value} value={option.value}>
                  {option.label}
                </option>)}
            </select>
          </div>
          {formData.frequency !== 'as-needed' && <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Time(s)</label>
                <button className="text-blue-600 text-sm flex items-center" onClick={handleAddTime}>
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Time
                </button>
              </div>
              <div className="space-y-2">
                {formData.times.map((time, index) => <div key={index} className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <input type="time" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={time} onChange={e => handleTimeChange(index, e.target.value)} />
                      <div className="absolute right-3 top-3 pointer-events-none">
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    {formData.times.length > 1 && <button className="p-2 text-red-500" onClick={() => handleRemoveTime(index)}>
                        <TrashIcon className="w-5 h-5" />
                      </button>}
                  </div>)}
              </div>
              {errors.times && <p className="text-red-500 text-sm mt-1">{errors.times}</p>}
            </div>}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block font-medium mb-2">Start Date</label>
              <div className="relative">
                <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.startDate} onChange={e => handleInputChange('startDate', e.target.value)} />
                <div className="absolute right-3 top-3 pointer-events-none">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-2">
                End Date (Optional)
              </label>
              <div className="relative">
                <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.endDate} onChange={e => handleInputChange('endDate', e.target.value)} />
                <div className="absolute right-3 top-3 pointer-events-none">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                </div>
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
            <label className="block font-medium mb-2">
              Special Instructions
            </label>
            <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add any special instructions (e.g., take with food)" value={formData.instructions} onChange={e => handleInputChange('instructions', e.target.value)} />
          </div>
        </div>
        <div className="mt-8">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            <BellIcon className="w-5 h-5 mr-2" />
            <BracketText active={true} className="text-white">
              {isSubmitting ? 'Setting Reminder...' : 'Set Reminder'}
            </BracketText>
          </Button>
        </div>
      </div>
    </div>;
};