import React from 'react';
import { UtensilsIcon, BedIcon, HeadphonesIcon, XIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
interface DailyRoutineScreenProps {
  onNext: () => void;
  onBack: () => void;
  animateOut: boolean;
  selectedMealTimes: string[];
  setSelectedMealTimes: (times: string[]) => void;
  selectedSleepTimes: string[];
  setSelectedSleepTimes: (times: string[]) => void;
  selectedActivities: string[];
  setSelectedActivities: (activities: string[]) => void;
  otherActivity: string;
  setOtherActivity: (activity: string) => void;
}
export const DailyRoutineScreen: React.FC<DailyRoutineScreenProps> = ({
  onNext,
  onBack,
  animateOut,
  selectedMealTimes,
  setSelectedMealTimes,
  selectedSleepTimes,
  setSelectedSleepTimes,
  selectedActivities,
  setSelectedActivities,
  otherActivity,
  setOtherActivity
}) => {
  // Meal time preferences
  const mealTimeOptions = ['Early Breakfast (6-8am)', 'Late Breakfast (8-10am)', 'Early Lunch (11am-12pm)', 'Late Lunch (1-2pm)', 'Early Dinner (4-6pm)', 'Late Dinner (7-9pm)', 'Regular Snacks'];
  // Sleep time preferences
  const sleepTimeOptions = ['Early Riser (5-7am)', 'Late Riser (8-10am)', 'Early to Bed (8-10pm)', 'Late to Bed (11pm-1am)', 'Daily Nap'];
  // Activity preferences
  const activityOptions = ['Walking', 'Reading', 'Television', 'Music', 'Arts & Crafts', 'Games & Puzzles', 'Outdoor Activities', 'Social Gatherings', 'Other'];
  const toggleMealTime = (time: string) => {
    if (selectedMealTimes.includes(time)) {
      setSelectedMealTimes(selectedMealTimes.filter(t => t !== time));
    } else {
      setSelectedMealTimes([...selectedMealTimes, time]);
    }
  };
  const toggleSleepTime = (time: string) => {
    if (selectedSleepTimes.includes(time)) {
      setSelectedSleepTimes(selectedSleepTimes.filter(t => t !== time));
    } else {
      setSelectedSleepTimes([...selectedSleepTimes, time]);
    }
  };
  const toggleActivity = (activity: string) => {
    if (activity === 'Other') {
      if (selectedActivities.includes('Other')) {
        setSelectedActivities(selectedActivities.filter(a => a !== 'Other'));
        setOtherActivity('');
      } else {
        setSelectedActivities([...selectedActivities, 'Other']);
      }
    } else {
      if (selectedActivities.includes(activity)) {
        setSelectedActivities(selectedActivities.filter(a => a !== activity));
      } else {
        setSelectedActivities([...selectedActivities, activity]);
      }
    }
  };
  return <div className={`space-y-6 transition-opacity duration-300 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
      <h1 className="text-2xl font-bold text-center mb-2">Daily Routine</h1>
      <p className="text-center text-gray-600 mb-6">
        Share your preferences for meals, sleep, and activities.
      </p>
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <BracketText active={true} className="mb-1 text-blue-800 font-medium">
          All fields are optional
        </BracketText>
        <p className="text-sm text-blue-700">
          Select any options that apply to your daily routine.
        </p>
      </div>
      <div className="space-y-6">
        {/* Meal Preferences */}
        <div>
          <div className="flex items-center mb-3">
            <UtensilsIcon className="w-5 h-5 text-green-500 mr-2" />
            <h2 className="text-lg font-medium">Meal Preferences</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {mealTimeOptions.map(time => <button key={time} onClick={() => toggleMealTime(time)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${selectedMealTimes.includes(time) ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                {selectedMealTimes.includes(time) && <XIcon className="w-3 h-3 mr-1" />}
                {time}
              </button>)}
          </div>
        </div>
        {/* Sleep Schedule */}
        <div>
          <div className="flex items-center mb-3">
            <BedIcon className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-medium">Sleep Schedule</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {sleepTimeOptions.map(time => <button key={time} onClick={() => toggleSleepTime(time)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${selectedSleepTimes.includes(time) ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                {selectedSleepTimes.includes(time) && <XIcon className="w-3 h-3 mr-1" />}
                {time}
              </button>)}
          </div>
        </div>
        {/* Activity Preferences */}
        <div>
          <div className="flex items-center mb-3">
            <HeadphonesIcon className="w-5 h-5 text-purple-500 mr-2" />
            <h2 className="text-lg font-medium">Preferred Activities</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {activityOptions.map(activity => <button key={activity} onClick={() => toggleActivity(activity)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${selectedActivities.includes(activity) ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                {selectedActivities.includes(activity) && <XIcon className="w-3 h-3 mr-1" />}
                {activity}
              </button>)}
          </div>
          {selectedActivities.includes('Other') && <div className="mt-3">
              <input type="text" value={otherActivity} onChange={e => setOtherActivity(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Please specify other activities" />
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