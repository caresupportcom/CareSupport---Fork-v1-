import React, { useState } from 'react';
import { ArrowLeftIcon, Activity, Heart, Thermometer, Droplet, Zap, Scale, CheckIcon, XIcon, AlertCircleIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const RecordVitalsScreen = ({
  onBack
}) => {
  const [formData, setFormData] = useState({
    bloodPressure: {
      systolic: '',
      diastolic: ''
    },
    heartRate: '',
    temperature: '',
    bloodSugar: '',
    oxygenLevel: '',
    weight: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [warnings, setWarnings] = useState({});
  const handleInputChange = (field, value, subfield = null) => {
    if (subfield) {
      setFormData({
        ...formData,
        [field]: {
          ...formData[field],
          [subfield]: value
        }
      });
      // Clear error for this field if it exists
      if (errors[`${field}.${subfield}`]) {
        const newErrors = {
          ...errors
        };
        delete newErrors[`${field}.${subfield}`];
        setErrors(newErrors);
      }
      // Check for warnings
      checkForWarnings(field, subfield, value);
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
      // Clear error for this field if it exists
      if (errors[field]) {
        const newErrors = {
          ...errors
        };
        delete newErrors[field];
        setErrors(newErrors);
      }
      // Check for warnings
      checkForWarnings(field, null, value);
    }
  };
  const checkForWarnings = (field, subfield, value) => {
    const newWarnings = {
      ...warnings
    };
    // Example warning checks (simplified for demo)
    if (field === 'bloodPressure' && subfield === 'systolic' && value) {
      const systolic = parseInt(value, 10);
      if (systolic > 140) {
        newWarnings['bloodPressure.systolic'] = 'High systolic blood pressure';
      } else if (systolic < 90) {
        newWarnings['bloodPressure.systolic'] = 'Low systolic blood pressure';
      } else {
        delete newWarnings['bloodPressure.systolic'];
      }
    }
    if (field === 'bloodPressure' && subfield === 'diastolic' && value) {
      const diastolic = parseInt(value, 10);
      if (diastolic > 90) {
        newWarnings['bloodPressure.diastolic'] = 'High diastolic blood pressure';
      } else if (diastolic < 60) {
        newWarnings['bloodPressure.diastolic'] = 'Low diastolic blood pressure';
      } else {
        delete newWarnings['bloodPressure.diastolic'];
      }
    }
    if (field === 'heartRate' && value) {
      const rate = parseInt(value, 10);
      if (rate > 100) {
        newWarnings.heartRate = 'Elevated heart rate';
      } else if (rate < 60) {
        newWarnings.heartRate = 'Low heart rate';
      } else {
        delete newWarnings.heartRate;
      }
    }
    if (field === 'temperature' && value) {
      const temp = parseFloat(value);
      if (temp > 99.5) {
        newWarnings.temperature = 'Elevated temperature';
      } else if (temp < 97) {
        newWarnings.temperature = 'Low temperature';
      } else {
        delete newWarnings.temperature;
      }
    }
    if (field === 'oxygenLevel' && value) {
      const oxygen = parseInt(value, 10);
      if (oxygen < 95) {
        newWarnings.oxygenLevel = 'Low oxygen level';
      } else {
        delete newWarnings.oxygenLevel;
      }
    }
    setWarnings(newWarnings);
  };
  const validateForm = () => {
    const newErrors = {};
    // Require at least one vital sign
    if (!formData.bloodPressure.systolic && !formData.bloodPressure.diastolic && !formData.heartRate && !formData.temperature && !formData.bloodSugar && !formData.oxygenLevel && !formData.weight) {
      newErrors.general = 'Please record at least one vital sign';
    }
    // Validate blood pressure (if one is provided, both are required)
    if (formData.bloodPressure.systolic && !formData.bloodPressure.diastolic || !formData.bloodPressure.systolic && formData.bloodPressure.diastolic) {
      if (!formData.bloodPressure.systolic) {
        newErrors['bloodPressure.systolic'] = 'Both values required';
      }
      if (!formData.bloodPressure.diastolic) {
        newErrors['bloodPressure.diastolic'] = 'Both values required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    // Track in analytics
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'vitals_recorded',
      has_warnings: Object.keys(warnings).length > 0,
      vitals_recorded: Object.keys(formData).filter(key => key !== 'notes' && (typeof formData[key] === 'string' ? !!formData[key] : Object.values(formData[key]).some(v => !!v))).length
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
        <h2 className="text-xl font-semibold mb-2">Vitals Recorded!</h2>
        <p className="text-gray-600">
          The vital signs have been saved to the health record
        </p>
      </div>;
  }
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Record Vitals</h1>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {errors.general && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>}
        <div className="space-y-6">
          <div>
            <div className="flex items-center mb-2">
              <Activity className="w-5 h-5 text-red-500 mr-2" />
              <label className="font-medium">Blood Pressure (mmHg)</label>
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input type="number" className={`w-full border ${errors['bloodPressure.systolic'] ? 'border-red-500' : warnings['bloodPressure.systolic'] ? 'border-orange-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Systolic" value={formData.bloodPressure.systolic} onChange={e => handleInputChange('bloodPressure', e.target.value, 'systolic')} />
                {errors['bloodPressure.systolic'] && <p className="text-red-500 text-xs mt-1">
                    {errors['bloodPressure.systolic']}
                  </p>}
                {warnings['bloodPressure.systolic'] && <p className="text-orange-500 text-xs mt-1 flex items-center">
                    <AlertCircleIcon className="w-3 h-3 mr-1" />
                    {warnings['bloodPressure.systolic']}
                  </p>}
              </div>
              <div className="flex-1">
                <input type="number" className={`w-full border ${errors['bloodPressure.diastolic'] ? 'border-red-500' : warnings['bloodPressure.diastolic'] ? 'border-orange-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Diastolic" value={formData.bloodPressure.diastolic} onChange={e => handleInputChange('bloodPressure', e.target.value, 'diastolic')} />
                {errors['bloodPressure.diastolic'] && <p className="text-red-500 text-xs mt-1">
                    {errors['bloodPressure.diastolic']}
                  </p>}
                {warnings['bloodPressure.diastolic'] && <p className="text-orange-500 text-xs mt-1 flex items-center">
                    <AlertCircleIcon className="w-3 h-3 mr-1" />
                    {warnings['bloodPressure.diastolic']}
                  </p>}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <Heart className="w-5 h-5 text-red-500 mr-2" />
              <label className="font-medium">Heart Rate (bpm)</label>
            </div>
            <input type="number" className={`w-full border ${errors.heartRate ? 'border-red-500' : warnings.heartRate ? 'border-orange-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter heart rate" value={formData.heartRate} onChange={e => handleInputChange('heartRate', e.target.value)} />
            {warnings.heartRate && <p className="text-orange-500 text-xs mt-1 flex items-center">
                <AlertCircleIcon className="w-3 h-3 mr-1" />
                {warnings.heartRate}
              </p>}
          </div>
          <div>
            <div className="flex items-center mb-2">
              <Thermometer className="w-5 h-5 text-red-500 mr-2" />
              <label className="font-medium">Temperature (°F)</label>
            </div>
            <input type="number" step="0.1" className={`w-full border ${errors.temperature ? 'border-red-500' : warnings.temperature ? 'border-orange-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter temperature" value={formData.temperature} onChange={e => handleInputChange('temperature', e.target.value)} />
            {warnings.temperature && <p className="text-orange-500 text-xs mt-1 flex items-center">
                <AlertCircleIcon className="w-3 h-3 mr-1" />
                {warnings.temperature}
              </p>}
          </div>
          <div>
            <div className="flex items-center mb-2">
              <Droplet className="w-5 h-5 text-blue-500 mr-2" />
              <label className="font-medium">Blood Sugar (mg/dL)</label>
            </div>
            <input type="number" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter blood sugar level" value={formData.bloodSugar} onChange={e => handleInputChange('bloodSugar', e.target.value)} />
          </div>
          <div>
            <div className="flex items-center mb-2">
              <Zap className="w-5 h-5 text-blue-500 mr-2" />
              <label className="font-medium">Oxygen Level (%)</label>
            </div>
            <input type="number" className={`w-full border ${errors.oxygenLevel ? 'border-red-500' : warnings.oxygenLevel ? 'border-orange-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter oxygen level" value={formData.oxygenLevel} onChange={e => handleInputChange('oxygenLevel', e.target.value)} />
            {warnings.oxygenLevel && <p className="text-orange-500 text-xs mt-1 flex items-center">
                <AlertCircleIcon className="w-3 h-3 mr-1" />
                {warnings.oxygenLevel}
              </p>}
          </div>
          <div>
            <div className="flex items-center mb-2">
              <Scale className="w-5 h-5 text-blue-500 mr-2" />
              <label className="font-medium">Weight (lbs)</label>
            </div>
            <input type="number" step="0.1" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter weight" value={formData.weight} onChange={e => handleInputChange('weight', e.target.value)} />
          </div>
          <div>
            <label className="block font-medium mb-2">Notes</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add any notes or observations" value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} />
          </div>
        </div>
        {Object.keys(warnings).length > 0 && <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircleIcon className="w-5 h-5 text-orange-500 mr-2" />
              <h3 className="font-medium text-orange-700">
                Potential Concerns
              </h3>
            </div>
            <p className="text-sm text-orange-700">
              Some values are outside the normal range. Consider consulting a
              healthcare provider.
            </p>
          </div>}
        <div className="mt-8">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            <BracketText active={true} className="text-white">
              {isSubmitting ? 'Saving...' : 'Save Vitals'}
            </BracketText>
          </Button>
        </div>
      </div>
    </div>;
};