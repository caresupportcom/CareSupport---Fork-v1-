import React, { useState } from 'react';
import { HeartIcon, ClockIcon, AlertTriangleIcon, CheckIcon, PillIcon, UtensilsIcon, BedIcon, HeadphonesIcon, SunIcon, MoonIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
interface PreferencesScreenProps {
  onNext: () => void;
  onBack: () => void;
  animateOut: boolean;
  medicalInfo: string;
  setMedicalInfo: (info: string) => void;
  routinePreferences: string;
  setRoutinePreferences: (prefs: string) => void;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  setEmergencyContact: (contact: {
    name: string;
    phone: string;
    relationship: string;
  }) => void;
}
export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({
  onNext,
  onBack,
  animateOut,
  medicalInfo,
  setMedicalInfo,
  routinePreferences,
  setRoutinePreferences,
  emergencyContact,
  setEmergencyContact
}) => {
  // Medical conditions state
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState('');
  // Routine preferences state
  const [selectedMealTimes, setSelectedMealTimes] = useState<string[]>([]);
  const [selectedSleepTimes, setSelectedSleepTimes] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [otherPreference, setOtherPreference] = useState('');
  // Medical condition options
  const conditionOptions = [{
    id: 'diabetes',
    label: 'Diabetes'
  }, {
    id: 'hypertension',
    label: 'Hypertension'
  }, {
    id: 'heart_disease',
    label: 'Heart Disease'
  }, {
    id: 'arthritis',
    label: 'Arthritis'
  }, {
    id: 'respiratory',
    label: 'Respiratory Issues'
  }, {
    id: 'mobility',
    label: 'Mobility Limitations'
  }, {
    id: 'cognitive',
    label: 'Cognitive Impairment'
  }, {
    id: 'vision',
    label: 'Vision Impairment'
  }, {
    id: 'hearing',
    label: 'Hearing Impairment'
  }, {
    id: 'other',
    label: 'Other'
  }];
  // Allergy options
  const allergyOptions = [{
    id: 'medication',
    label: 'Medication Allergies'
  }, {
    id: 'food',
    label: 'Food Allergies'
  }, {
    id: 'environmental',
    label: 'Environmental Allergies'
  }, {
    id: 'latex',
    label: 'Latex'
  }, {
    id: 'insect',
    label: 'Insect Stings'
  }, {
    id: 'other',
    label: 'Other'
  }];
  // Meal time preferences
  const mealTimeOptions = [{
    id: 'early_breakfast',
    label: 'Early Breakfast (6-8am)'
  }, {
    id: 'late_breakfast',
    label: 'Late Breakfast (8-10am)'
  }, {
    id: 'early_lunch',
    label: 'Early Lunch (11am-12pm)'
  }, {
    id: 'late_lunch',
    label: 'Late Lunch (1-2pm)'
  }, {
    id: 'early_dinner',
    label: 'Early Dinner (4-6pm)'
  }, {
    id: 'late_dinner',
    label: 'Late Dinner (7-9pm)'
  }, {
    id: 'snacks',
    label: 'Regular Snacks'
  }];
  // Sleep time preferences
  const sleepTimeOptions = [{
    id: 'early_riser',
    label: 'Early Riser (5-7am)'
  }, {
    id: 'late_riser',
    label: 'Late Riser (8-10am)'
  }, {
    id: 'early_bed',
    label: 'Early to Bed (8-10pm)'
  }, {
    id: 'late_bed',
    label: 'Late to Bed (11pm-1am)'
  }, {
    id: 'nap',
    label: 'Daily Nap'
  }];
  // Activity preferences
  const activityOptions = [{
    id: 'walking',
    label: 'Walking'
  }, {
    id: 'reading',
    label: 'Reading'
  }, {
    id: 'tv',
    label: 'Television'
  }, {
    id: 'music',
    label: 'Music'
  }, {
    id: 'crafts',
    label: 'Arts & Crafts'
  }, {
    id: 'games',
    label: 'Games & Puzzles'
  }, {
    id: 'outdoor',
    label: 'Outdoor Activities'
  }, {
    id: 'social',
    label: 'Social Gatherings'
  }, {
    id: 'other',
    label: 'Other'
  }];
  const handleEmergencyContactChange = (field: string, value: string) => {
    setEmergencyContact({
      ...emergencyContact,
      [field]: value
    });
  };
  const toggleCondition = (conditionId: string) => {
    if (conditionId === 'other') {
      if (selectedConditions.includes('other')) {
        setSelectedConditions(selectedConditions.filter(id => id !== 'other'));
        setOtherCondition('');
      } else {
        setSelectedConditions([...selectedConditions, 'other']);
      }
    } else {
      if (selectedConditions.includes(conditionId)) {
        setSelectedConditions(selectedConditions.filter(id => id !== conditionId));
      } else {
        setSelectedConditions([...selectedConditions, conditionId]);
      }
    }
  };
  const toggleAllergy = (allergyId: string) => {
    if (allergyId === 'other') {
      if (selectedAllergies.includes('other')) {
        setSelectedAllergies(selectedAllergies.filter(id => id !== 'other'));
        setOtherAllergy('');
      } else {
        setSelectedAllergies([...selectedAllergies, 'other']);
      }
    } else {
      if (selectedAllergies.includes(allergyId)) {
        setSelectedAllergies(selectedAllergies.filter(id => id !== allergyId));
      } else {
        setSelectedAllergies([...selectedAllergies, allergyId]);
      }
    }
  };
  const toggleMealTime = (timeId: string) => {
    if (selectedMealTimes.includes(timeId)) {
      setSelectedMealTimes(selectedMealTimes.filter(id => id !== timeId));
    } else {
      setSelectedMealTimes([...selectedMealTimes, timeId]);
    }
  };
  const toggleSleepTime = (timeId: string) => {
    if (selectedSleepTimes.includes(timeId)) {
      setSelectedSleepTimes(selectedSleepTimes.filter(id => id !== timeId));
    } else {
      setSelectedSleepTimes([...selectedSleepTimes, timeId]);
    }
  };
  const toggleActivity = (activityId: string) => {
    if (activityId === 'other') {
      if (selectedActivities.includes('other')) {
        setSelectedActivities(selectedActivities.filter(id => id !== 'other'));
        setOtherPreference('');
      } else {
        setSelectedActivities([...selectedActivities, 'other']);
      }
    } else {
      if (selectedActivities.includes(activityId)) {
        setSelectedActivities(selectedActivities.filter(id => id !== activityId));
      } else {
        setSelectedActivities([...selectedActivities, activityId]);
      }
    }
  };
  // Prepare medical info and routine preferences for submission
  const handleContinue = () => {
    // Format medical information
    let formattedMedicalInfo = '';
    if (selectedConditions.length > 0) {
      formattedMedicalInfo += 'Medical Conditions: ' + conditionOptions.filter(option => selectedConditions.includes(option.id)).map(option => option.label).join(', ');
      if (selectedConditions.includes('other') && otherCondition) {
        formattedMedicalInfo += `, ${otherCondition}`;
      }
      formattedMedicalInfo += '\n\n';
    }
    if (selectedAllergies.length > 0) {
      formattedMedicalInfo += 'Allergies: ' + allergyOptions.filter(option => selectedAllergies.includes(option.id)).map(option => option.label).join(', ');
      if (selectedAllergies.includes('other') && otherAllergy) {
        formattedMedicalInfo += `, ${otherAllergy}`;
      }
    }
    // Format routine preferences
    let formattedRoutinePreferences = '';
    if (selectedMealTimes.length > 0) {
      formattedRoutinePreferences += 'Meal Preferences: ' + mealTimeOptions.filter(option => selectedMealTimes.includes(option.id)).map(option => option.label).join(', ') + '\n\n';
    }
    if (selectedSleepTimes.length > 0) {
      formattedRoutinePreferences += 'Sleep Schedule: ' + sleepTimeOptions.filter(option => selectedSleepTimes.includes(option.id)).map(option => option.label).join(', ') + '\n\n';
    }
    if (selectedActivities.length > 0) {
      formattedRoutinePreferences += 'Preferred Activities: ' + activityOptions.filter(option => selectedActivities.includes(option.id)).map(option => option.label).join(', ');
      if (selectedActivities.includes('other') && otherPreference) {
        formattedRoutinePreferences += `, ${otherPreference}`;
      }
    }
    // Update the parent state
    setMedicalInfo(formattedMedicalInfo);
    setRoutinePreferences(formattedRoutinePreferences);
    // Continue to next step
    onNext();
  };
  return <div className={`space-y-6 transition-opacity duration-300 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
      <h1 className="text-2xl font-bold text-center mb-2">Your Preferences</h1>
      <p className="text-center text-gray-600 mb-6">
        Let's note a few key things so your team can provide the best care.
      </p>
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <BracketText active={true} className="mb-1 text-blue-800 font-medium">
          All fields are optional
        </BracketText>
        <p className="text-sm text-blue-700">
          You can share as much or as little as you're comfortable with. You can
          always update this information later.
        </p>
      </div>
      <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-1">
        {/* Medical Conditions Section */}
        <div>
          <div className="flex items-center mb-2">
            <HeartIcon className="w-5 h-5 text-red-500 mr-2" />
            <h2 className="text-lg font-medium">Medical Conditions</h2>
          </div>
          <div className="space-y-2 ml-2">
            {conditionOptions.map(option => <div key={option.id} className="flex items-center">
                <input type="checkbox" id={`condition-${option.id}`} checked={selectedConditions.includes(option.id)} onChange={() => toggleCondition(option.id)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor={`condition-${option.id}`} className="ml-2 block text-sm text-gray-700">
                  {option.label}
                </label>
              </div>)}
            {selectedConditions.includes('other') && <div className="ml-6 mt-2">
                <input type="text" value={otherCondition} onChange={e => setOtherCondition(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Please specify other condition" />
              </div>}
          </div>
        </div>
        {/* Allergies Section */}
        <div>
          <div className="flex items-center mb-2">
            <PillIcon className="w-5 h-5 text-orange-500 mr-2" />
            <h2 className="text-lg font-medium">Allergies</h2>
          </div>
          <div className="space-y-2 ml-2">
            {allergyOptions.map(option => <div key={option.id} className="flex items-center">
                <input type="checkbox" id={`allergy-${option.id}`} checked={selectedAllergies.includes(option.id)} onChange={() => toggleAllergy(option.id)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor={`allergy-${option.id}`} className="ml-2 block text-sm text-gray-700">
                  {option.label}
                </label>
              </div>)}
            {selectedAllergies.includes('other') && <div className="ml-6 mt-2">
                <input type="text" value={otherAllergy} onChange={e => setOtherAllergy(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Please specify other allergies" />
              </div>}
          </div>
        </div>
        {/* Daily Routine - Meal Preferences */}
        <div>
          <div className="flex items-center mb-2">
            <UtensilsIcon className="w-5 h-5 text-green-500 mr-2" />
            <h2 className="text-lg font-medium">Meal Preferences</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mealTimeOptions.map(option => <button key={option.id} type="button" onClick={() => toggleMealTime(option.id)} className={`py-2 px-3 rounded-lg text-sm text-left ${selectedMealTimes.includes(option.id) ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                {option.label}
              </button>)}
          </div>
        </div>
        {/* Daily Routine - Sleep Schedule */}
        <div>
          <div className="flex items-center mb-2">
            <BedIcon className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-medium">Sleep Schedule</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sleepTimeOptions.map(option => <button key={option.id} type="button" onClick={() => toggleSleepTime(option.id)} className={`py-2 px-3 rounded-lg text-sm text-left ${selectedSleepTimes.includes(option.id) ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                {option.label}
              </button>)}
          </div>
        </div>
        {/* Daily Routine - Activity Preferences */}
        <div>
          <div className="flex items-center mb-2">
            <HeadphonesIcon className="w-5 h-5 text-purple-500 mr-2" />
            <h2 className="text-lg font-medium">Preferred Activities</h2>
          </div>
          <div className="space-y-2 ml-2">
            {activityOptions.map(option => <div key={option.id} className="flex items-center">
                <input type="checkbox" id={`activity-${option.id}`} checked={selectedActivities.includes(option.id)} onChange={() => toggleActivity(option.id)} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
                <label htmlFor={`activity-${option.id}`} className="ml-2 block text-sm text-gray-700">
                  {option.label}
                </label>
              </div>)}
            {selectedActivities.includes('other') && <div className="ml-6 mt-2">
                <input type="text" value={otherPreference} onChange={e => setOtherPreference(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Please specify other activities" />
              </div>}
          </div>
        </div>
        {/* Emergency Contact */}
        <div>
          <div className="flex items-center mb-2">
            <AlertTriangleIcon className="w-5 h-5 text-orange-500 mr-2" />
            <h2 className="text-lg font-medium">Emergency Contact</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input type="text" value={emergencyContact.name} onChange={e => handleEmergencyContactChange('name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Emergency contact name (optional)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input type="tel" value={emergencyContact.phone} onChange={e => handleEmergencyContactChange('phone', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Emergency contact phone (optional)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship to You
              </label>
              <input type="text" value={emergencyContact.relationship} onChange={e => handleEmergencyContactChange('relationship', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g., Spouse, Sibling, Friend (optional)" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex space-x-3 mt-4">
        <Button onClick={onBack} variant="secondary" className="w-1/3">
          Back
        </Button>
        <Button onClick={handleContinue} className="w-2/3">
          Continue
        </Button>
      </div>
    </div>;
};