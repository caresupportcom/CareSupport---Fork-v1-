import React, { useEffect, useState, useRef } from 'react';
import { MicIcon, XIcon, CheckIcon, PauseIcon, PlayIcon, TrashIcon, LightbulbIcon, InfoIcon, VolumeIcon, Volume2Icon, ShieldIcon, UserIcon, UsersIcon, GlobeIcon, AlertCircleIcon, HelpCircleIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useConnection } from '../../contexts/ConnectionContext';
export const VoiceInputScreen = ({
  onComplete,
  navigateTo
}) => {
  const {
    isOnline
  } = useConnection();
  const {
    highContrast
  } = useAccessibility();
  const [recordingState, setRecordingState] = useState('ready'); // ready, recording, paused, reviewing
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState('team');
  const [waveform, setWaveform] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(50);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [showHelpTip, setShowHelpTip] = useState(false);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  const [examplePrompts] = useState(["I just finished Eleanor's grocery shopping and she seemed in good spirits today", "I'm available to drive Eleanor to her appointment next Tuesday", "Eleanor's medication was refilled today - we now have a 30-day supply", 'Dad had trouble sleeping last night and seemed confused this morning', "I noticed Mom's appetite has improved since starting the new medication"]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  // Check for offline status when starting recording
  useEffect(() => {
    if (!isOnline && recordingState === 'recording') {
      setShowOfflineWarning(true);
      setTimeout(() => {
        setShowOfflineWarning(false);
      }, 5000);
    }
  }, [isOnline, recordingState]);
  // Initialize audio context for better waveform visualization
  useEffect(() => {
    if (recordingState === 'recording') {
      if (!audioContextRef.current) {
        try {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          // Request microphone access
          navigator.mediaDevices.getUserMedia({
            audio: true
          }).then(stream => {
            microphoneStreamRef.current = stream;
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            // Start visualization
            visualizeMicrophone();
          }).catch(err => {
            console.error('Error accessing microphone:', err);
            // Fallback to simulated waveform
            simulateWaveform();
          });
        } catch (err) {
          console.error('Web Audio API not supported:', err);
          // Fallback to simulated waveform
          simulateWaveform();
        }
      } else {
        // Resume audio context if it was suspended
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        visualizeMicrophone();
      }
    } else {
      // Stop visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Stop microphone stream if we're not recording
      if (microphoneStreamRef.current && recordingState !== 'paused') {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [recordingState]);
  // Timer for recording duration
  useEffect(() => {
    let interval;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          // Auto-stop at 2 minutes (120 seconds)
          if (prev >= 119) {
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);
  // Real microphone visualization
  const visualizeMicrophone = () => {
    if (!analyserRef.current) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const updateWaveform = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setAudioVolume(Math.min(100, average * 2)); // Scale to 0-100
      // Sample data for waveform visualization (take 40 points)
      const samples = [];
      const step = Math.floor(bufferLength / 40);
      for (let i = 0; i < 40; i++) {
        const index = i * step;
        if (index < bufferLength) {
          samples.push(dataArray[index] / 2); // Scale to 0-50
        }
      }
      setWaveform(samples);
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    };
    updateWaveform();
  };
  // Fallback simulated waveform
  const simulateWaveform = () => {
    const interval = setInterval(() => {
      const newPoint = Math.floor(Math.random() * 50) + 10;
      setWaveform(prev => [...prev.slice(-40), newPoint]);
      setAudioVolume(Math.min(100, Math.random() * 80 + 20));
    }, 100);
    return () => clearInterval(interval);
  };
  const startRecording = () => {
    // If there's text in the input field, skip to reviewing
    if (transcription) {
      setRecordingState('reviewing');
      return;
    }
    setRecordingState('recording');
    setRecordingTime(0);
    setWaveform([]);
    // Track recording start in analytics
    analytics.trackEvent(AnalyticsEvents.VOICE_RECORDING_STARTED, {
      input_method: 'microphone',
      from_screen: 'voice_input'
    });
    // Simulate transcription after 3 seconds (in a real app, this would be continuous)
    setTimeout(() => {
      setTranscription("Please give Dad his medication at 2pm with food. It's the small blue pill in the weekly pill organizer. Make sure he drinks a full glass of water with it.");
    }, 3000);
  };
  const pauseRecording = () => {
    setRecordingState('paused');
    analytics.trackFeatureUsage('voice_recording_paused');
    // In a real implementation, we would pause the actual recording here
    if (audioContextRef.current) {
      audioContextRef.current.suspend();
    }
  };
  const resumeRecording = () => {
    setRecordingState('recording');
    analytics.trackFeatureUsage('voice_recording_resumed');
    // In a real implementation, we would resume the actual recording here
    if (audioContextRef.current) {
      audioContextRef.current.resume();
    }
  };
  const stopRecording = () => {
    setRecordingState('reviewing');
    analytics.trackEvent(AnalyticsEvents.VOICE_RECORDING_COMPLETED, {
      duration_seconds: recordingTime,
      transcription_length: transcription.length,
      was_paused: recordingState === 'paused'
    });
    // In a real implementation, we would stop the actual recording here
    if (audioContextRef.current) {
      audioContextRef.current.suspend();
    }
  };
  const playRecording = () => {
    setIsPlaying(true);
    analytics.trackFeatureUsage('voice_recording_playback');
    // In a real app, this would play back the actual recording
    // Simulate playback ending after 3 seconds
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };
  const resetRecording = () => {
    setRecordingState('ready');
    setRecordingTime(0);
    setTranscription('');
    setWaveform([]);
    analytics.trackFeatureUsage('voice_recording_reset');
  };
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const handlePrivacyChange = level => {
    setPrivacyLevel(level);
    analytics.trackFeatureUsage('voice_privacy_changed', {
      privacy_level: level
    });
  };
  const handleProcessRecommend = () => {
    // Validate minimum content length
    if (transcription.length < 10) {
      alert('Please provide more details in your message for better recommendations.');
      return;
    }
    // In a real app, this would send the transcription to an AI service
    analytics.trackEvent(AnalyticsEvents.VOICE_RECOMMENDATION_PROCESSED, {
      privacy_level: privacyLevel,
      transcription_length: transcription.length,
      recording_duration: recordingTime,
      input_method: recordingTime > 0 ? 'voice' : 'text'
    });
    // Navigate to recommendations screen with the transcription
    navigateTo('voice-recommendations', {
      transcription: transcription,
      privacyLevel: privacyLevel
    });
  };
  const handleExampleClick = example => {
    setTranscription(example);
    setRecordingState('reviewing');
    analytics.trackFeatureUsage('voice_example_used', {
      example_text: example
    });
    // Navigate to recommendations screen with the example transcription
    navigateTo('voice-recommendations', {
      transcription: example,
      privacyLevel: privacyLevel
    });
  };
  const handleCancel = () => {
    analytics.trackFeatureUsage('voice_recording_cancelled', {
      state: recordingState,
      duration: recordingTime
    });
    onComplete();
  };
  // Get privacy level icon and explanation
  const getPrivacyInfo = level => {
    switch (level) {
      case 'private':
        return {
          icon: <ShieldIcon className="w-5 h-5" />,
          title: 'Private (Only You)',
          description: 'Only visible to you. No one else on your care team will see this information or receive notifications.'
        };
      case 'team':
        return {
          icon: <UsersIcon className="w-5 h-5" />,
          title: 'Care Team',
          description: 'Shared with your entire care team. All team members will have access to this information and may receive notifications.'
        };
      case 'public':
        return {
          icon: <GlobeIcon className="w-5 h-5" />,
          title: 'Public',
          description: 'Visible to anyone with access to this care recipient, including healthcare providers outside your regular care team.'
        };
      default:
        return {
          icon: <UserIcon className="w-5 h-5" />,
          title: 'Unknown',
          description: ''
        };
    }
  };
  const privacyInfo = getPrivacyInfo(privacyLevel);
  return <div className="h-full flex flex-col bg-gray-50" role="dialog" aria-labelledby="voice-input-title">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center bg-white border-b border-gray-200">
        <button onClick={handleCancel} className="mr-4" aria-label="Close voice input">
          <XIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 id="voice-input-title" className="text-xl font-semibold flex-1 text-center pr-6">
          {recordingState === 'ready' ? 'Voice-to-Recommend™' : recordingState === 'recording' ? 'Recording...' : recordingState === 'paused' ? 'Recording Paused' : 'Review Recording'}
        </h1>
        <button onClick={() => setShowHelpTip(!showHelpTip)} aria-label="Help" className="w-8 h-8 flex items-center justify-center">
          <HelpCircleIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Help Tip Popup */}
      {showHelpTip && <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
          <div className="flex items-start">
            <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-700 mb-1">
                Voice-to-Recommend™ Tips
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Speak naturally about care activities, observations, or needs.
                Our AI will analyze your recording and suggest relevant actions
                to take.
              </p>
              <p className="text-sm text-blue-700">
                For best results, include specific details like names, times,
                and clear descriptions of what happened or what needs to be
                done.
              </p>
            </div>
            <button onClick={() => setShowHelpTip(false)} className="ml-2 text-blue-500" aria-label="Close help tip">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>}

      {/* Offline Warning */}
      {showOfflineWarning && <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
          <div className="flex items-start">
            <AlertCircleIcon className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-700 mb-1">Offline Mode</h3>
              <p className="text-sm text-yellow-700">
                You're currently offline. Your recording will be saved and
                processed when your connection is restored.
              </p>
            </div>
            <button onClick={() => setShowOfflineWarning(false)} className="ml-2 text-yellow-500" aria-label="Close offline warning">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>}

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col">
        {recordingState === 'ready' && <div className="flex-1 flex flex-col">
            <p className="text-center text-gray-600 mb-8">
              <BracketText active={true}>Voice-to-Recommend™</BracketText>
              <span className="block mt-2">
                Speak about your care activities and get intelligent suggestions
              </span>
            </p>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className={`w-full h-56 ${highContrast ? 'bg-white border-2 border-blue-600' : 'bg-white rounded-xl border border-gray-200'} flex items-center justify-center mb-8 relative`} onClick={startRecording} role="button" tabIndex={0} aria-label="Start recording">
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <MicIcon className="w-16 h-16 text-blue-500 mb-4" aria-hidden="true" />
                  <span className="text-gray-500">Tap to start recording</span>
                </div>
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-500">Or type your message</p>
                  <span className="text-xs text-gray-400">
                    For better results, be specific and detailed
                  </span>
                </div>
                <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24" placeholder="e.g., Dad needs to take his heart medication at 9am tomorrow. It's the small white pill in the blue container." value={transcription} onChange={e => setTranscription(e.target.value)} aria-label="Type your care note"></textarea>
              </div>
              <div className="w-full mt-8">
                <p className="text-gray-500 mb-3">Try these examples:</p>
                <div className="space-y-2">
                  {examplePrompts.map((example, index) => <button key={index} className="w-full p-3 bg-white rounded-lg border border-gray-200 text-left flex items-center hover:bg-gray-50" onClick={() => handleExampleClick(example)} aria-label={`Use example: ${example}`}>
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <Volume2Icon className="w-3.5 h-3.5 text-blue-500" />
                      </span>
                      <span className="text-sm text-gray-700">{example}</span>
                    </button>)}
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <Button variant="secondary" onClick={handleCancel} className="flex-1" ariaLabel="Cancel">
                Cancel
              </Button>
              <Button onClick={startRecording} className="flex-1" disabled={!transcription && recordingState === 'ready'} ariaLabel="Start recording">
                {transcription ? 'Process & Recommend' : 'Start Recording'}
              </Button>
            </div>
          </div>}

        {(recordingState === 'recording' || recordingState === 'paused') && <div className="flex-1 flex flex-col items-center">
            <div className={`w-48 h-48 rounded-full ${recordingState === 'recording' ? 'bg-red-100 border-4 border-red-500' : 'bg-gray-100 border-4 border-gray-400'} flex items-center justify-center mb-8 relative`} aria-label={recordingState === 'recording' ? 'Recording in progress' : 'Recording paused'}>
              <div className={`absolute inset-0 rounded-full border-4 ${recordingState === 'recording' ? 'border-red-500 animate-pulse' : 'border-gray-400'}`} aria-hidden="true"></div>
              <div className="flex flex-col items-center">
                <MicIcon className={`w-20 h-20 ${recordingState === 'recording' ? 'text-red-500' : 'text-gray-400'}`} aria-hidden="true" />
                <span className={`text-sm font-medium mt-2 ${recordingState === 'recording' ? 'text-red-500' : 'text-gray-500'}`}>
                  {recordingState === 'recording' ? 'Recording' : 'Paused'}
                </span>
              </div>
            </div>
            {/* Audio level indicator */}
            <div className="w-64 h-3 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div className={`h-full ${recordingState === 'recording' ? 'bg-red-500' : 'bg-gray-400'}`} style={{
            width: `${audioVolume}%`
          }} aria-hidden="true"></div>
            </div>
            {/* Waveform visualization */}
            {waveform.length > 0 && <div className="flex items-end h-16 space-x-1 mb-4 px-6 w-full justify-center" aria-hidden="true">
                {waveform.map((height, index) => <div key={index} className={`w-1.5 rounded-full ${recordingState === 'paused' ? 'bg-gray-400 opacity-50' : 'bg-blue-500'}`} style={{
            height: `${height}%`,
            minHeight: '4px'
          }}></div>)}
              </div>}
            <div className="text-2xl font-mono mb-4" aria-live="polite" aria-label={`Recording time: ${formatTime(recordingTime)}`}>
              {formatTime(recordingTime)}
            </div>
            {/* Recording progress bar */}
            <div className="w-full max-w-md mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>0:00</span>
                <span>2:00</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{
              width: `${recordingTime / 120 * 100}%`
            }} aria-hidden="true"></div>
              </div>
            </div>
            {transcription && <div className="bg-gray-50 rounded-xl p-4 mb-6 w-full" aria-live="polite">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Live Transcription
                  </h3>
                  {recordingState === 'recording' && <span className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                      Listening...
                    </span>}
                </div>
                <p className="text-sm text-gray-700">{transcription}</p>
              </div>}
            <div className="flex space-x-4">
              <Button variant="secondary" onClick={resetRecording} ariaLabel="Reset recording">
                <TrashIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                Reset
              </Button>
              {recordingState === 'recording' ? <Button variant="danger" onClick={pauseRecording} ariaLabel="Pause recording">
                  <PauseIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                  Pause
                </Button> : <Button onClick={resumeRecording} ariaLabel="Resume recording">
                  <MicIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                  Resume
                </Button>}
              <Button onClick={stopRecording} ariaLabel="Finish recording">
                <CheckIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                Done
              </Button>
            </div>
          </div>}

        {recordingState === 'reviewing' && <div className="flex-1 flex flex-col">
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Transcription</h3>
                <button className={`flex items-center justify-center p-2 rounded-full ${isPlaying ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`} onClick={playRecording} disabled={isPlaying} aria-label={isPlaying ? 'Pause playback' : 'Play recording'}>
                  {isPlaying ? <PauseIcon className="w-4 h-4" aria-hidden="true" /> : <PlayIcon className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
              <label className="sr-only" htmlFor="transcription-text">
                Edit transcription
              </label>
              <textarea id="transcription-text" className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500" value={transcription} onChange={e => setTranscription(e.target.value)} aria-label="Edit transcription text" />
              <p className="text-xs text-gray-500 mt-2">
                You can edit the transcription to correct any errors or add
                additional details.
              </p>
            </div>
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <h3 className="font-medium">Privacy Settings</h3>
                <button onClick={() => setShowPrivacyInfo(!showPrivacyInfo)} className="ml-2 text-gray-400 hover:text-gray-500" aria-label="Privacy information">
                  <InfoIcon className="w-4 h-4" />
                </button>
              </div>
              {showPrivacyInfo && <div className="bg-blue-50 rounded-lg p-3 mb-3 text-sm text-blue-700">
                  <p className="mb-2">
                    Choose who can see the recommendations created from this
                    input:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong>Private:</strong> Only visible to you
                    </li>
                    <li>
                      <strong>Care Team:</strong> Shared with your entire care
                      team
                    </li>
                    <li>
                      <strong>Public:</strong> Visible to anyone with access to
                      this care recipient
                    </li>
                  </ul>
                </div>}
              <div className="flex space-x-3" role="radiogroup" aria-label="Privacy level">
                <button className={`px-4 py-2 rounded-full text-sm flex items-center ${privacyLevel === 'private' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handlePrivacyChange('private')} aria-checked={privacyLevel === 'private'} role="radio">
                  <ShieldIcon className="w-4 h-4 mr-1.5" />
                  <BracketText active={privacyLevel === 'private'}>
                    Private
                  </BracketText>
                </button>
                <button className={`px-4 py-2 rounded-full text-sm flex items-center ${privacyLevel === 'team' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handlePrivacyChange('team')} aria-checked={privacyLevel === 'team'} role="radio">
                  <UsersIcon className="w-4 h-4 mr-1.5" />
                  <BracketText active={privacyLevel === 'team'}>
                    Care Team
                  </BracketText>
                </button>
                <button className={`px-4 py-2 rounded-full text-sm flex items-center ${privacyLevel === 'public' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => handlePrivacyChange('public')} aria-checked={privacyLevel === 'public'} role="radio">
                  <GlobeIcon className="w-4 h-4 mr-1.5" />
                  <BracketText active={privacyLevel === 'public'}>
                    Public
                  </BracketText>
                </button>
              </div>
              <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-start">
                {privacyInfo.icon}
                <div className="ml-3">
                  <p className="text-sm font-medium">{privacyInfo.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {privacyInfo.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-auto flex space-x-3">
              <Button variant="secondary" onClick={resetRecording} className="flex-1" ariaLabel="Discard recording">
                <TrashIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                Discard
              </Button>
              <Button onClick={handleProcessRecommend} className="flex-1" ariaLabel="Process and recommend" disabled={transcription.length < 10}>
                <LightbulbIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                Process & Recommend
              </Button>
            </div>
          </div>}
      </div>
    </div>;
};