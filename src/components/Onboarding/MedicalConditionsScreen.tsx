import React from 'react';
import { HeartIcon, PillIcon, XIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
interface MedicalConditionsScreenProps {
  onNext: () => void;
  onBack: () => void;
  animateOut: boolean;
  selectedConditions: string[];
  setSelectedConditions: (conditions: string[]) => void;
  otherCondition: string;
  setOtherCondition: (condition: string) => void;
  selectedAllergies: string[];
  setSelectedAllergies: (allergies: string[]) => void;
  otherAllergy: string;
  setOtherAllergy: (allergy: string) => void;
}
export const MedicalConditionsScreen: React.FC<MedicalConditionsScreenProps> = ({
  onNext,
  onBack,
  animateOut,
  selectedConditions,
  setSelectedConditions,
  otherCondition,
  setOtherCondition,
  selectedAllergies,
  setSelectedAllergies,
  otherAllergy,
  setOtherAllergy
}) => {
  // Medical condition options
  const conditionOptions = ['Diabetes', 'Hypertension', 'Heart Disease', 'Arthritis', 'Respiratory Issues', 'Mobility Limitations', 'Cognitive Impairment', 'Vision Impairment', 'Hearing Impairment', 'Other'];
  // Allergy options
  const allergyOptions = ['Medication Allergies', 'Food Allergies', 'Environmental Allergies', 'Latex', 'Insect Stings', 'Other'];
  const toggleCondition = (condition: string) => {
    if (condition === 'Other') {
      if (selectedConditions.includes('Other')) {
        setSelectedConditions(selectedConditions.filter(c => c !== 'Other'));
        setOtherCondition('');
      } else {
        setSelectedConditions([...selectedConditions, 'Other']);
      }
    } else {
      if (selectedConditions.includes(condition)) {
        setSelectedConditions(selectedConditions.filter(c => c !== condition));
      } else {
        setSelectedConditions([...selectedConditions, condition]);
      }
    }
  };
  const toggleAllergy = (allergy: string) => {
    if (allergy === 'Other') {
      if (selectedAllergies.includes('Other')) {
        setSelectedAllergies(selectedAllergies.filter(a => a !== 'Other'));
        setOtherAllergy('');
      } else {
        setSelectedAllergies([...selectedAllergies, 'Other']);
      }
    } else {
      if (selectedAllergies.includes(allergy)) {
        setSelectedAllergies(selectedAllergies.filter(a => a !== allergy));
      } else {
        setSelectedAllergies([...selectedAllergies, allergy]);
      }
    }
  };
  return <div className={`space-y-6 transition-opacity duration-300 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
      <h1 className="text-2xl font-bold text-center mb-2">
        Medical Information
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Let your care team know about any medical conditions or allergies.
      </p>
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <BracketText active={true} className="mb-1 text-blue-800 font-medium">
          All fields are optional
        </BracketText>
        <p className="text-sm text-blue-700">
          You can share as much or as little as you're comfortable with.
        </p>
      </div>
      <div className="space-y-6">
        {/* Medical Conditions Section */}
        <div>
          <div className="flex items-center mb-3">
            <HeartIcon className="w-5 h-5 text-red-500 mr-2" />
            <h2 className="text-lg font-medium">Medical Conditions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {conditionOptions.map(condition => <button key={condition} onClick={() => toggleCondition(condition)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${selectedConditions.includes(condition) ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                {selectedConditions.includes(condition) && <XIcon className="w-3 h-3 mr-1" />}
                {condition}
              </button>)}
          </div>
          {selectedConditions.includes('Other') && <div className="mt-3">
              <input type="text" value={otherCondition} onChange={e => setOtherCondition(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Please specify other condition" />
            </div>}
        </div>
        {/* Allergies Section */}
        <div>
          <div className="flex items-center mb-3">
            <PillIcon className="w-5 h-5 text-orange-500 mr-2" />
            <h2 className="text-lg font-medium">Allergies</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergyOptions.map(allergy => <button key={allergy} onClick={() => toggleAllergy(allergy)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${selectedAllergies.includes(allergy) ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                {selectedAllergies.includes(allergy) && <XIcon className="w-3 h-3 mr-1" />}
                {allergy}
              </button>)}
          </div>
          {selectedAllergies.includes('Other') && <div className="mt-3">
              <input type="text" value={otherAllergy} onChange={e => setOtherAllergy(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Please specify other allergies" />
            </div>}
        </div>
      </div>
      <div className="flex space-x-3 mt-8">
        <Button onClick={onBack} variant="secondary" className="w-1/3">
          Back
        </Button>
        <Button onClick={onNext} className="w-2/3">
          Continue
        </Button>
      </div>
    </div>;
};