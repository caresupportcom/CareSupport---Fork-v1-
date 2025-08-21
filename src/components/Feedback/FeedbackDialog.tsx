import React, { useState } from 'react';
import { XIcon, ThumbsUpIcon, ThumbsDownIcon, MessageSquareIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [feedbackType, setFeedbackType] = useState<'issue' | 'suggestion' | 'praise' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  if (!isOpen) return null;
  const handleSubmit = () => {
    // In a real app, this would send the feedback to a server
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'feedback_submitted',
      feedback_type: feedbackType,
      feedback_length: feedbackText.length
    });
    setSubmitted(true);
    // Reset after a few seconds
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackType(null);
      setFeedbackText('');
      onClose();
    }, 2000);
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 id="feedback-title" className="text-xl font-semibold">
              Send Feedback
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" aria-label="Close feedback dialog">
              <XIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          {submitted ? <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <ThumbsUpIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Thank You!</h3>
              <p className="text-gray-600">Your feedback has been submitted.</p>
            </div> : <>
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Help us improve your care coordination experience. What would
                  you like to share?
                </p>
                <div className="space-y-3">
                  <button className={`w-full p-3 rounded-lg border ${feedbackType === 'issue' ? 'border-red-500 bg-red-50' : 'border-gray-200'} flex items-center`} onClick={() => setFeedbackType('issue')}>
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <ThumbsDownIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="font-medium">Report an Issue</span>
                  </button>
                  <button className={`w-full p-3 rounded-lg border ${feedbackType === 'suggestion' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} flex items-center`} onClick={() => setFeedbackType('suggestion')}>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <MessageSquareIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium">Suggest an Improvement</span>
                  </button>
                  <button className={`w-full p-3 rounded-lg border ${feedbackType === 'praise' ? 'border-green-500 bg-green-50' : 'border-gray-200'} flex items-center`} onClick={() => setFeedbackType('praise')}>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <ThumbsUpIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium">Share What You Like</span>
                  </button>
                </div>
              </div>
              {feedbackType && <div className="mb-6">
                  <label htmlFor="feedback-text" className="block font-medium mb-2">
                    Your Feedback
                  </label>
                  <textarea id="feedback-text" className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please describe your feedback in detail..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
                </div>}
              <div className="flex justify-end">
                <Button variant="secondary" onClick={onClose} className="mr-3">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!feedbackType || !feedbackText.trim()}>
                  Submit Feedback
                </Button>
              </div>
            </>}
        </div>
      </div>
    </div>;
};