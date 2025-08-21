import React, { useState } from 'react';
import { MicIcon, PlayIcon, CheckIcon, MessageSquareIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
interface VoiceIntroScreenProps {
  onComplete: () => void;
  onBack: () => void;
  animateOut: boolean;
  recipientName: string;
  setVoiceDemoCompleted: (completed: boolean) => void;
  voiceDemoCompleted: boolean;
}
export const VoiceIntroScreen: React.FC<VoiceIntroScreenProps> = ({
  onComplete,
  onBack,
  animateOut,
  recipientName,
  setVoiceDemoCompleted,
  voiceDemoCompleted
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStep, setRecordingStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  // Simulate voice recording
  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording process with a timer
    setTimeout(() => {
      setRecordingStep(1); // Listening...
      setTimeout(() => {
        setRecordingStep(2); // Processing...
        setTimeout(() => {
          setIsRecording(false);
          setShowResults(true);
          setVoiceDemoCompleted(true);
          // Track voice demo in analytics
          analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
            feature_name: 'voice_demo_completed'
          });
        }, 1500);
      }, 2000);
    }, 1000);
  };
  return <div className={`space-y-6 transition-opacity duration-300 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
      <h1 className="text-2xl font-bold text-center mb-2">
        Command with Your Voice
      </h1>
      <p className="text-center text-gray-600 mb-6">
        CareSupport works best with your voice. Try it out now.
      </p>
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <BracketText active={true} className="mb-1 text-blue-800 font-medium">
          Voice-to-Recommend™
        </BracketText>
        <p className="text-sm text-blue-700">
          Simply speak your needs, and we'll translate them into actions for
          your care team.
        </p>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h3 className="font-medium">Try saying:</h3>
          <p className="text-blue-600 mt-1">"I need help with a meal."</p>
        </div>
        <div className="p-6 flex flex-col items-center">
          {!isRecording && !showResults ? <button onClick={handleStartRecording} className="w-20 h-20 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center mb-4 transition-colors">
              <MicIcon className="w-10 h-10 text-blue-600" />
            </button> : isRecording ? <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4 animate-pulse">
              <MicIcon className="w-10 h-10 text-red-600" />
            </div> : null}
          {isRecording && <div className="text-center mb-4">
              {recordingStep === 0 && <p>Tap to speak...</p>}
              {recordingStep === 1 && <p>Listening...</p>}
              {recordingStep === 2 && <p>Processing...</p>}
            </div>}
          {showResults && <div className="w-full space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MicIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg flex-1">
                  <p className="text-blue-800">"I need help with a meal."</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium mb-3">CareSupport understood:</h4>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-3">
                  <div className="flex items-center mb-2">
                    <CheckIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">
                      Task identified: Meal preparation
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    {recipientName || 'You'} need assistance with preparing or
                    serving a meal.
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h5 className="font-medium mb-2">Recommended action:</h5>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquareIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        Notify team members qualified for meal preparation:
                      </p>
                      <ul className="mt-2 space-y-1">
                        <li className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                            <span className="text-xs text-red-600 font-medium">
                              L
                            </span>
                          </div>
                          <span className="text-sm">
                            Linda (Family Caregiver)
                          </span>
                        </li>
                        <li className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                            <span className="text-xs text-blue-600 font-medium">
                              J
                            </span>
                          </div>
                          <span className="text-sm">
                            James (Professional Caregiver)
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
        </div>
      </div>
      <div className="flex space-x-3 mt-4">
        <Button onClick={onBack} variant="secondary" className="w-1/3">
          Back
        </Button>
        <Button onClick={onComplete} className="w-2/3" disabled={!voiceDemoCompleted}>
          {voiceDemoCompleted ? 'Get Started' : 'Try Voice Demo First'}
        </Button>
      </div>
    </div>;
};