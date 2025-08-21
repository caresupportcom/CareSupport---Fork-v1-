import React, { useState, useRef, useEffect } from 'react';
import { 
  MicIcon, 
  XIcon, 
  CheckIcon, 
  PauseIcon, 
  PlayIcon, 
  TrashIcon, 
  KeyboardIcon,
  VolumeXIcon,
  Volume2Icon,
  AlertCircleIcon,
  InfoIcon
} from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';

interface AccessibleVoiceInputProps {
  onComplete: () => void;
  navigateTo: (screen: string, data?: any) => void;
}

export const AccessibleVoiceInput: React.FC<AccessibleVoiceInputProps> = ({
  onComplete,
  navigateTo
}) => {
  // State management
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('text');
  const [recordingState, setRecordingState] = useState<'ready' | 'recording' | 'paused' | 'reviewing'>('ready');
  const [transcription, setTranscription] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs for focus management
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recordButtonRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Check audio permissions on mount
  useEffect(() => {
    checkAudioPermissions();
  }, []);

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 119) { // Auto-stop at 2 minutes
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  const checkAudioPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasAudioPermission(true);
      stream.getTracks().forEach(track => track.stop()); // Clean up
    } catch (error) {
      setHasAudioPermission(false);
      setAudioError('Microphone access denied or unavailable');
    }
  };

  const startRecording = async () => {
    if (!hasAudioPermission) {
      await checkAudioPermissions();
      if (!hasAudioPermission) return;
    }

    setRecordingState('recording');
    setRecordingTime(0);
    setAudioError(null);
    
    // Announce to screen readers
    announceToScreenReader('Recording started');
    
    // Focus management
    if (recordButtonRef.current) {
      recordButtonRef.current.focus();
    }
  };

  const stopRecording = () => {
    setRecordingState('reviewing');
    announceToScreenReader('Recording stopped. Review your input or continue.');
    
    // Simulate transcription (in real app, this would be actual speech-to-text)
    if (!transcription) {
      setTranscription("Please give Dad his medication at 2pm with food. It's the small blue pill in the weekly pill organizer.");
    }
  };

  const pauseRecording = () => {
    setRecordingState('paused');
    announceToScreenReader('Recording paused');
  };

  const resumeRecording = () => {
    setRecordingState('recording');
    announceToScreenReader('Recording resumed');
  };

  const resetRecording = () => {
    setRecordingState('ready');
    setRecordingTime(0);
    setTranscription('');
    announceToScreenReader('Recording reset');
  };

  const handleModeSwitch = (mode: 'voice' | 'text') => {
    setInputMode(mode);
    announceToScreenReader(`Switched to ${mode} input mode`);
    
    // Focus appropriate input
    if (mode === 'text' && textAreaRef.current) {
      textAreaRef.current.focus();
    } else if (mode === 'voice' && recordButtonRef.current) {
      recordButtonRef.current.focus();
    }
  };

  const handleTextChange = (value: string) => {
    setTranscription(value);
    // Auto-switch to reviewing state when text is entered
    if (value.length > 0 && recordingState === 'ready') {
      setRecordingState('reviewing');
    }
  };

  const handleSubmit = () => {
    if (transcription.length < 10) {
      announceToScreenReader('Please provide more details in your message for better recommendations.');
      return;
    }

    navigateTo('voice-recommendations', {
      transcription,
      privacyLevel: 'team'
    });
  };

  const announceToScreenReader = (message: string) => {
    if (statusRef.current) {
      statusRef.current.textContent = message;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50" role="main" aria-labelledby="voice-input-title">
      {/* Screen reader status announcements */}
      <div 
        ref={statusRef}
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      />

      {/* Header with clear hierarchy */}
      <header className="px-6 pt-6 pb-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onComplete}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close voice input and return to previous screen"
          >
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
          
          <h1 id="voice-input-title" className="text-xl font-semibold">
            Voice-to-Recommend™
          </h1>
          
          <button
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Help and instructions"
          >
            <InfoIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Input mode selector with clear labels */}
        <div className="mt-4" role="tablist" aria-label="Input method selection">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              role="tab"
              aria-selected={inputMode === 'text'}
              aria-controls="text-input-panel"
              className={`
                flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium
                transition-all duration-200 min-h-[44px]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                ${inputMode === 'text' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
              onClick={() => handleModeSwitch('text')}
            >
              <KeyboardIcon className="w-4 h-4 mr-2" />
              Text Input
            </button>
            
            <button
              role="tab"
              aria-selected={inputMode === 'voice'}
              aria-controls="voice-input-panel"
              aria-disabled={!hasAudioPermission}
              className={`
                flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium
                transition-all duration-200 min-h-[44px]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                ${inputMode === 'voice' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
                }
                ${!hasAudioPermission ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => hasAudioPermission && handleModeSwitch('voice')}
            >
              <MicIcon className="w-4 h-4 mr-2" />
              Voice Input
              {!hasAudioPermission && <VolumeXIcon className="w-3 h-3 ml-1" />}
            </button>
          </div>
        </div>

        {/* Audio permission error */}
        {audioError && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg" role="alert">
            <div className="flex items-start">
              <AlertCircleIcon className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Microphone Access Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {audioError}. You can still use text input to provide your care notes.
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content area */}
      <main className="flex-1 p-6">
        {/* Text Input Panel */}
        {inputMode === 'text' && (
          <div id="text-input-panel" role="tabpanel" aria-labelledby="text-input-tab">
            <div className="mb-4">
              <label htmlFor="care-notes-input" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your care activities or needs
              </label>
              <textarea
                id="care-notes-input"
                ref={textAreaRef}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={6}
                placeholder="Example: Dad needs to take his heart medication at 9am tomorrow. It's the small white pill in the blue container."
                value={transcription}
                onChange={(e) => handleTextChange(e.target.value)}
                aria-describedby="text-input-help"
              />
              <div id="text-input-help" className="mt-2 text-sm text-gray-500">
                Be specific about names, times, and details for better recommendations.
                Character count: {transcription.length}
              </div>
            </div>
          </div>
        )}

        {/* Voice Input Panel */}
        {inputMode === 'voice' && hasAudioPermission && (
          <div id="voice-input-panel" role="tabpanel" aria-labelledby="voice-input-tab">
            {recordingState === 'ready' && (
              <div className="text-center">
                <div className="mb-6">
                  <button
                    ref={recordButtonRef}
                    onClick={startRecording}
                    className="w-32 h-32 rounded-full bg-blue-100 hover:bg-blue-200 
                             flex items-center justify-center transition-colors
                             focus:outline-none focus:ring-4 focus:ring-blue-300"
                    aria-label="Start voice recording"
                    aria-describedby="recording-instructions"
                  >
                    <MicIcon className="w-16 h-16 text-blue-600" />
                  </button>
                </div>
                <div id="recording-instructions" className="text-gray-600">
                  <p className="mb-2">Tap the microphone to start recording</p>
                  <p className="text-sm">Speak clearly about care activities, observations, or needs</p>
                </div>
              </div>
            )}

            {(recordingState === 'recording' || recordingState === 'paused') && (
              <div className="text-center">
                {/* Recording indicator with clear visual and audio cues */}
                <div className={`
                  w-32 h-32 rounded-full mb-6 flex items-center justify-center
                  ${recordingState === 'recording' 
                    ? 'bg-red-100 border-4 border-red-500 animate-pulse' 
                    : 'bg-gray-100 border-4 border-gray-400'
                  }
                `}>
                  <MicIcon className={`w-16 h-16 ${
                    recordingState === 'recording' ? 'text-red-500' : 'text-gray-400'
                  }`} />
                </div>

                {/* Recording time with proper formatting */}
                <div className="mb-4">
                  <div 
                    className="text-3xl font-mono font-bold"
                    aria-live="polite"
                    aria-label={`Recording time: ${formatTime(recordingTime)}`}
                  >
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {recordingState === 'recording' ? 'Recording in progress' : 'Recording paused'}
                  </div>
                </div>

                {/* Recording controls with clear labels */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={resetRecording}
                    className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 
                             focus:outline-none focus:ring-2 focus:ring-gray-500 min-w-[44px] min-h-[44px]"
                    aria-label="Delete recording and start over"
                  >
                    <TrashIcon className="w-5 h-5 text-gray-600" />
                  </button>

                  {recordingState === 'recording' ? (
                    <button
                      onClick={pauseRecording}
                      className="p-3 bg-yellow-100 rounded-full hover:bg-yellow-200 
                               focus:outline-none focus:ring-2 focus:ring-yellow-500 min-w-[44px] min-h-[44px]"
                      aria-label="Pause recording"
                    >
                      <PauseIcon className="w-5 h-5 text-yellow-600" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="p-3 bg-blue-100 rounded-full hover:bg-blue-200 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[44px] min-h-[44px]"
                      aria-label="Resume recording"
                    >
                      <MicIcon className="w-5 h-5 text-blue-600" />
                    </button>
                  )}

                  <button
                    onClick={stopRecording}
                    className="p-3 bg-green-100 rounded-full hover:bg-green-200 
                             focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[44px] min-h-[44px]"
                    aria-label="Stop recording and review"
                  >
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              </div>
            )}

            {recordingState === 'reviewing' && (
              <div>
                <div className="mb-4">
                  <label htmlFor="transcription-review" className="block text-sm font-medium text-gray-700 mb-2">
                    Review and edit your transcription
                  </label>
                  <textarea
                    id="transcription-review"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={6}
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    aria-describedby="transcription-help"
                  />
                  <div id="transcription-help" className="mt-2 text-sm text-gray-500">
                    You can edit the transcription to correct any errors or add additional details.
                  </div>
                </div>

                {/* Playback controls */}
                <div className="flex justify-center mb-6">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center px-4 py-2 bg-blue-100 rounded-lg hover:bg-blue-200 
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={isPlaying ? 'Stop playback' : 'Play recording'}
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-4 h-4 mr-2 text-blue-600" />
                    ) : (
                      <PlayIcon className="w-4 h-4 mr-2 text-blue-600" />
                    )}
                    {isPlaying ? 'Stop Playback' : 'Play Recording'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alternative input methods notice */}
        {inputMode === 'voice' && !hasAudioPermission && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" role="region" aria-labelledby="alternative-methods">
            <h3 id="alternative-methods" className="font-medium text-blue-800 mb-2">
              Alternative Input Methods Available
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Voice input is not available, but you can still use text input to provide your care notes and receive recommendations.
            </p>
            <button
              onClick={() => handleModeSwitch('text')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Switch to Text Input
            </button>
          </div>
        )}
      </main>

      {/* Footer with action buttons */}
      <footer className="p-6 bg-white border-t border-gray-200">
        <div className="flex space-x-4">
          <Button
            variant="secondary"
            onClick={onComplete}
            className="flex-1 min-h-[44px]"
            ariaLabel="Cancel and return to previous screen"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            className="flex-1 min-h-[44px]"
            disabled={transcription.length < 10}
            ariaLabel={`Process your input and get recommendations. ${transcription.length < 10 ? 'Please provide more details first.' : ''}`}
          >
            Get Recommendations
          </Button>
        </div>
        
        {transcription.length < 10 && transcription.length > 0 && (
          <p className="mt-2 text-sm text-gray-500 text-center">
            Please provide more details for better recommendations (minimum 10 characters)
          </p>
        )}
      </footer>
    </div>
  );
};