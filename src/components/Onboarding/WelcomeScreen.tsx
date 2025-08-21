import React, { useState } from 'react';
import { ArrowRightIcon, MoonIcon, SunIcon, ChevronLeftIcon, ChevronRightIcon, MicIcon, CheckIcon, ClipboardListIcon, BellIcon, HeartIcon, UsersIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
export const WelcomeScreen = ({
  onComplete
}) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [theme, setTheme] = useState('light');
  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
      analytics.trackEvent(AnalyticsEvents.ONBOARDING_SCREEN_VIEW, {
        screen_index: currentScreen + 1
      });
    } else {
      onComplete();
      analytics.trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
        screens_viewed: currentScreen + 1
      });
    }
  };
  const handlePrevious = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
      analytics.trackEvent(AnalyticsEvents.ONBOARDING_SCREEN_VIEW, {
        screen_index: currentScreen - 1
      });
    }
  };
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    analytics.trackFeatureUsage('theme_toggle_during_onboarding');
  };
  const screens = [{
    title: 'AI-powered Care Coordination built to simplify caregiving',
    subtitle: 'CareSupport is an AI-native platform that manages care tasks, so you can focus on what matters most.',
    demo: <VoiceToTaskDemo theme={theme} />
  }, {
    title: 'Voice-to-Recommend™ Technology',
    subtitle: 'Simply speak about care activities and our AI will convert your voice into structured tasks and recommendations.',
    demo: <RecommendationsDemo theme={theme} />
  }, {
    title: 'Team Collaboration Made Simple',
    subtitle: 'Keep everyone on the same page with real-time updates, task assignments, and care coordination.',
    demo: <TeamCollaborationDemo theme={theme} />
  }];
  return <div className={`min-h-screen w-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button onClick={toggleTheme} className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-yellow-300' : 'bg-gray-100 text-gray-600'}`} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 pt-16 pb-8">
        {/* Logo and branding */}
        <div className="w-full flex items-center justify-center mb-6">
          <HeartIcon className="w-8 h-8 text-red-500 mr-2" />
          <h1 className="text-2xl font-bold">CareSupport</h1>
        </div>
        {/* Main content */}
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              {screens[currentScreen].title}
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {screens[currentScreen].subtitle}
            </p>
          </div>
          {/* Demo/Preview section */}
          <div className={`flex-1 w-full mb-8 rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {screens[currentScreen].demo}
          </div>
          {/* Navigation dots */}
          <div className="flex justify-center space-x-2 mb-6">
            {screens.map((_, index) => <button key={index} onClick={() => setCurrentScreen(index)} className={`w-2.5 h-2.5 rounded-full transition-colors ${currentScreen === index ? theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} aria-label={`Go to slide ${index + 1}`} />)}
          </div>
          {/* Action buttons */}
          <div className="flex justify-center items-center space-x-4">
            {currentScreen > 0 && <button onClick={handlePrevious} className={`px-4 py-2 flex items-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Back
              </button>}
            <button onClick={handleNext} className={`px-4 py-2 flex items-center justify-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <BracketText active={true}>
                {currentScreen < screens.length - 1 ? 'Next' : 'Get Started'}
              </BracketText>
              {currentScreen < screens.length - 1 && <ChevronRightIcon className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>;
};
// Demo components for each onboarding screen
const VoiceToTaskDemo = ({
  theme
}) => {
  return <div className={`h-full w-full flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
      <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 mb-4 shadow-sm`}>
        <div className="flex items-center mb-3">
          <div className={`w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-100'} flex items-center justify-center mr-3`}>
            <MicIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Voice-to-Recommend™
            </h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
              Tap to record your care notes
            </p>
          </div>
        </div>
        <div className={`w-full h-16 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'} flex items-center justify-center mb-3`}>
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
            "Please give Dad his medication at 2pm with food..."
          </span>
        </div>
        <div className="flex items-center">
          <div className={`w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-100'} flex items-center justify-center mr-2`}>
            <span className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-blue-600'} font-medium`}>
              AI
            </span>
          </div>
          <BracketText active={true} className="text-xs">
            Processing voice input...
          </BracketText>
        </div>
      </div>
      <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 shadow-sm`}>
        <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          AI converts to structured tasks:
        </h3>
        <div className={`p-3 rounded-lg border-l-4 border-blue-500 ${theme === 'dark' ? 'bg-gray-600 border border-gray-500' : 'bg-blue-50 border border-blue-100'} mb-3`}>
          <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Medication Reminder
          </h4>
          <div className="flex items-center mt-1">
            <ClipboardListIcon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mr-1`} />
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Give medication at 2:00 PM with food
            </span>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="flex items-center text-sm">
            <BracketText active={true} className="text-sm">
              Add to Schedule
            </BracketText>
            <CheckIcon className="w-4 h-4 ml-1 text-blue-500" />
          </button>
        </div>
      </div>
    </div>;
};
const RecommendationsDemo = ({
  theme
}) => {
  return <div className={`h-full w-full flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
      <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 mb-4 shadow-sm`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            AI Recommendations
          </h3>
          <div className={`px-2 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
            Based on your input
          </div>
        </div>
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600 border border-gray-500' : 'bg-gray-50 border border-gray-200'} mb-3`}>
          <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            "Dad had trouble sleeping last night and seemed confused this
            morning"
          </p>
        </div>
        <div className={`p-3 rounded-lg border-l-4 border-purple-500 ${theme === 'dark' ? 'bg-gray-600 border border-gray-500' : 'bg-purple-50 border border-purple-100'} mb-3`}>
          <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Schedule Doctor Check-up
          </h4>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
            Confusion and sleep changes may indicate medication side effects or
            health changes
          </p>
        </div>
        <div className={`p-3 rounded-lg border-l-4 border-yellow-500 ${theme === 'dark' ? 'bg-gray-600 border border-gray-500' : 'bg-yellow-50 border border-yellow-100'} mb-3`}>
          <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Monitor Sleep Pattern
          </h4>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
            Track sleep duration and quality for the next 3 days
          </p>
        </div>
      </div>
    </div>;
};
const TeamCollaborationDemo = ({
  theme
}) => {
  return <div className={`h-full w-full flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
      <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 mb-4 shadow-sm`}>
        <div className="flex items-center mb-4">
          <UsersIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Eleanor's Care Team
          </h3>
        </div>
        <div className="space-y-3">
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} flex items-center`}>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <span className="text-xs text-green-600 font-medium">M</span>
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Maria Rodriguez
              </h4>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                On duty today
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
              Active
            </div>
          </div>
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} flex items-center`}>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-xs text-blue-600 font-medium">J</span>
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                James Wilson
              </h4>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                Last active 2h ago
              </p>
            </div>
            <BellIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'} flex items-center`}>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <span className="text-xs text-purple-600 font-medium">L</span>
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Linda Chen
              </h4>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                Next on duty: Tomorrow
              </p>
            </div>
            <BellIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </div>
      </div>
      <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 shadow-sm`}>
        <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Shared Task Updates
        </h3>
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600 border border-gray-500' : 'bg-blue-50 border border-blue-100'} mb-2`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Morning Medication
            </h4>
            <div className={`px-2 py-0.5 rounded-full text-xs ${theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
              Completed
            </div>
          </div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
            Completed by Maria at 9:05 AM
          </p>
        </div>
      </div>
    </div>;
};