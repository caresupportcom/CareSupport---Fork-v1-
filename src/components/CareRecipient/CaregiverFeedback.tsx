import React, { useEffect, useState } from 'react';
import { StarIcon, ChevronLeftIcon, UserIcon, CalendarIcon, ClockIcon, ThumbsUpIcon, ThumbsDownIcon, CheckIcon, SendIcon, XIcon, SmileIcon, HeartIcon, CheckCircleIcon } from 'lucide-react';
import { shiftService } from '../../services/ShiftService';
import { dataService } from '../../services/DataService';
import { storage } from '../../services/StorageService';
interface CaregiverFeedbackProps {
  onBack: () => void;
  caregiverId?: string;
  shiftId?: string;
}
export const CaregiverFeedback: React.FC<CaregiverFeedbackProps> = ({
  onBack,
  caregiverId,
  shiftId
}) => {
  const [caregiver, setCaregiver] = useState<any | null>(null);
  const [shift, setShift] = useState<any | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  // Qualities that can be selected
  const caregiverQualities = [{
    id: 'punctual',
    label: 'Punctual',
    icon: <ClockIcon className="w-4 h-4" />
  }, {
    id: 'caring',
    label: 'Caring',
    icon: <HeartIcon className="w-4 h-4" />
  }, {
    id: 'professional',
    label: 'Professional',
    icon: <UserIcon className="w-4 h-4" />
  }, {
    id: 'attentive',
    label: 'Attentive',
    icon: <CheckCircleIcon className="w-4 h-4" />
  }, {
    id: 'friendly',
    label: 'Friendly',
    icon: <SmileIcon className="w-4 h-4" />
  }, {
    id: 'skilled',
    label: 'Skilled',
    icon: <StarIcon className="w-4 h-4" />
  }];
  // Care preferences
  const carePreferences = [{
    id: 'morning_routine',
    label: 'Morning routine assistance'
  }, {
    id: 'medication_reminders',
    label: 'Medication reminders'
  }, {
    id: 'meal_preparation',
    label: 'Meal preparation'
  }, {
    id: 'personal_hygiene',
    label: 'Personal hygiene assistance'
  }, {
    id: 'mobility_assistance',
    label: 'Mobility assistance'
  }, {
    id: 'companionship',
    label: 'Companionship'
  }, {
    id: 'transportation',
    label: 'Transportation'
  }, {
    id: 'housekeeping',
    label: 'Light housekeeping'
  }, {
    id: 'evening_routine',
    label: 'Evening routine assistance'
  }];
  useEffect(() => {
    // Load caregiver and shift data
    if (caregiverId) {
      const caregiverData = dataService.getTeamMemberById(caregiverId);
      if (caregiverData) {
        setCaregiver(caregiverData);
      }
      // If no specific shift provided, get the most recent shift for this caregiver
      if (!shiftId) {
        const caregiverShifts = shiftService.getShifts().filter(s => s.assignedTo === caregiverId && s.status === 'completed');
        if (caregiverShifts.length > 0) {
          // Sort by date, most recent first
          caregiverShifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setShift(caregiverShifts[0]);
        }
      }
    }
    // If shift ID is provided, load that specific shift
    if (shiftId) {
      const shiftData = shiftService.getShiftById(shiftId);
      if (shiftData) {
        setShift(shiftData);
        // If caregiver wasn't set from caregiverId, set it from the shift
        if (!caregiver && shiftData.assignedTo) {
          const caregiverFromShift = dataService.getTeamMemberById(shiftData.assignedTo);
          if (caregiverFromShift) {
            setCaregiver(caregiverFromShift);
          }
        }
      }
    }
  }, [caregiverId, shiftId]);
  // Format date for display
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };
  // Format time for display
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  // Toggle a quality selection
  const toggleQuality = (qualityId: string) => {
    if (selectedQualities.includes(qualityId)) {
      setSelectedQualities(selectedQualities.filter(id => id !== qualityId));
    } else {
      setSelectedQualities([...selectedQualities, qualityId]);
    }
  };
  // Toggle a preference selection
  const togglePreference = (preferenceId: string) => {
    if (selectedPreferences.includes(preferenceId)) {
      setSelectedPreferences(selectedPreferences.filter(id => id !== preferenceId));
    } else {
      setSelectedPreferences([...selectedPreferences, preferenceId]);
    }
  };
  // Move to next step
  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };
  // Move to previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };
  // Handle form submission
  const handleSubmit = () => {
    setIsSubmitting(true);
    // Create feedback object
    const feedbackData = {
      id: `feedback_${Date.now()}`,
      caregiverId: caregiver?.id,
      caregiverName: caregiver?.name,
      shiftId: shift?.id,
      date: new Date().toISOString(),
      rating,
      comment: feedback,
      qualities: selectedQualities,
      preferences: selectedPreferences
    };
    // In a real app, this would be sent to a server
    console.log('Feedback submitted:', feedbackData);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Store feedback in local storage for demo purposes
      const existingFeedback = storage.get('caregiver_feedback', []);
      storage.save('caregiver_feedback', [...existingFeedback, feedbackData]);
      // Update caregiver preferences in local storage
      if (selectedPreferences.length > 0) {
        const existingPreferences = storage.get('care_preferences', {});
        storage.save('care_preferences', {
          ...existingPreferences,
          [caregiver?.id]: selectedPreferences
        });
      }
    }, 1000);
  };
  // Render star rating input
  const renderStarRating = () => {
    return <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
            <StarIcon className={`w-10 h-10 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          </button>)}
      </div>;
  };
  // If no caregiver is found, show an error
  if (!caregiver) {
    return <div className="h-full flex flex-col">
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-2 p-1 rounded-full hover:bg-gray-100" aria-label="Go back">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Caregiver Feedback</h1>
          </div>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <XIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-medium text-gray-800 mb-1">
              Caregiver Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              We couldn't find the caregiver you're looking for.
            </p>
            <button onClick={onBack} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Go Back
            </button>
          </div>
        </div>
      </div>;
  }
  // If feedback has been submitted, show a success message
  if (isSubmitted) {
    return <div className="h-full flex flex-col">
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-2 p-1 rounded-full hover:bg-gray-100" aria-label="Go back">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Feedback Submitted</h1>
          </div>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your feedback for {caregiver.name} has been submitted
              successfully. This helps us improve your care experience.
            </p>
            <button onClick={onBack} className="px-6 py-2 bg-blue-500 text-white rounded-lg">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>;
  }
  return <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={prevStep} className="mr-2 p-1 rounded-full hover:bg-gray-100" aria-label="Go back">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Caregiver Feedback</h1>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-500">Step {step} of 3</div>
          <div className="flex space-x-1">
            {[1, 2, 3].map(i => <div key={i} className={`w-2.5 h-2.5 rounded-full ${i === step ? 'bg-blue-500' : 'bg-gray-300'}`}></div>)}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Caregiver Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <div className={`w-12 h-12 rounded-full bg-${caregiver.color || 'blue'}-100 flex items-center justify-center mr-3`}>
              <span className={`text-lg text-${caregiver.color || 'blue'}-600 font-medium`}>
                {caregiver.initial}
              </span>
            </div>
            <div>
              <div className="font-medium">{caregiver.name}</div>
              <div className="text-sm text-gray-600">{caregiver.role}</div>
            </div>
          </div>
          {shift && <div className="text-sm text-gray-700">
              <div className="flex items-center mb-1">
                <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
                <span>{formatDate(shift.date)}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1 text-gray-500" />
                <span>
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </span>
              </div>
            </div>}
        </div>
        {/* Step 1: Rating */}
        {step === 1 && <div className="mb-6">
            <h2 className="text-lg font-medium text-center mb-6">
              How would you rate your experience with {caregiver.name}?
            </h2>
            {renderStarRating()}
            <div className="text-center mt-2 text-sm text-gray-500">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg h-32" placeholder={`What did you like or dislike about ${caregiver.name}'s care?`} />
            </div>
          </div>}
        {/* Step 2: Caregiver Qualities */}
        {step === 2 && <div className="mb-6">
            <h2 className="text-lg font-medium text-center mb-2">
              What qualities did {caregiver.name} demonstrate?
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Select all that apply
            </p>
            <div className="grid grid-cols-2 gap-3">
              {caregiverQualities.map(quality => <button key={quality.id} type="button" onClick={() => toggleQuality(quality.id)} className={`p-3 rounded-lg border ${selectedQualities.includes(quality.id) ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300'} flex items-center`}>
                  <div className={`w-8 h-8 rounded-full ${selectedQualities.includes(quality.id) ? 'bg-blue-100' : 'bg-gray-100'} flex items-center justify-center mr-3`}>
                    {quality.icon}
                  </div>
                  <span>{quality.label}</span>
                </button>)}
            </div>
            <div className="mt-6">
              <h3 className="text-base font-medium mb-3">Overall Experience</h3>
              <div className="flex space-x-3">
                <button type="button" className={`flex-1 py-3 rounded-lg border ${selectedQualities.includes('positive') ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300'} flex items-center justify-center`} onClick={() => {
              setSelectedQualities(selectedQualities.filter(q => q !== 'negative'));
              toggleQuality('positive');
            }}>
                  <ThumbsUpIcon className={`w-5 h-5 mr-2 ${selectedQualities.includes('positive') ? 'text-green-500' : 'text-gray-500'}`} />
                  Positive
                </button>
                <button type="button" className={`flex-1 py-3 rounded-lg border ${selectedQualities.includes('negative') ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-300'} flex items-center justify-center`} onClick={() => {
              setSelectedQualities(selectedQualities.filter(q => q !== 'positive'));
              toggleQuality('negative');
            }}>
                  <ThumbsDownIcon className={`w-5 h-5 mr-2 ${selectedQualities.includes('negative') ? 'text-red-500' : 'text-gray-500'}`} />
                  Negative
                </button>
              </div>
            </div>
          </div>}
        {/* Step 3: Care Preferences */}
        {step === 3 && <div className="mb-6">
            <h2 className="text-lg font-medium text-center mb-2">
              What care would you like {caregiver.name} to provide in the
              future?
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Select your preferences
            </p>
            <div className="space-y-2">
              {carePreferences.map(preference => <button key={preference.id} type="button" onClick={() => togglePreference(preference.id)} className={`w-full p-3 rounded-lg border ${selectedPreferences.includes(preference.id) ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300'} text-left flex items-center`}>
                  <div className={`w-6 h-6 rounded-full ${selectedPreferences.includes(preference.id) ? 'bg-blue-500 text-white' : 'bg-gray-100'} flex items-center justify-center mr-3`}>
                    {selectedPreferences.includes(preference.id) && <CheckIcon className="w-4 h-4" />}
                  </div>
                  <span>{preference.label}</span>
                </button>)}
            </div>
          </div>}
      </div>
      <div className="bg-white p-4 border-t border-gray-200">
        <button onClick={nextStep} disabled={step === 1 && rating === 0} className={`w-full py-3 rounded-lg flex items-center justify-center ${step === 3 ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'} ${step === 1 && rating === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isSubmitting ? <span>Submitting...</span> : <>
              {step === 3 ? <>
                  <SendIcon className="w-5 h-5 mr-2" />
                  Submit Feedback
                </> : 'Continue'}
            </>}
        </button>
      </div>
    </div>;
};