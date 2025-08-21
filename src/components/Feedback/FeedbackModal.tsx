import React, { useState } from 'react';
import { XIcon, SmileIcon, FrownIcon, MehIcon, StarIcon, SendIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
interface FeedbackModalProps {
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
  context?: string;
}
export interface FeedbackData {
  rating: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  comment: string;
  context?: string;
}
export const FeedbackModal = ({
  onClose,
  onSubmit,
  context
}: FeedbackModalProps) => {
  const [rating, setRating] = useState<number>(0);
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = () => {
    if (rating === 0 && !sentiment && !comment.trim()) return;
    const feedbackData: FeedbackData = {
      rating,
      sentiment: sentiment || 'neutral',
      comment,
      context
    };
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'submit_feedback',
      rating,
      sentiment: sentiment || 'neutral',
      has_comment: comment.trim().length > 0,
      context
    });
    onSubmit(feedbackData);
    setSubmitted(true);
    // Auto close after showing thank you message
    setTimeout(() => {
      onClose();
    }, 2000);
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 id="feedback-title" className="text-lg font-semibold">
            Help Us Improve
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Close feedback form">
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {!submitted ? <>
              <p className="text-gray-600 mb-6">
                Your feedback helps us make CareSupport better for everyone.
                Please share your thoughts.
              </p>
              <div className="mb-6">
                <h3 className="font-medium mb-3">
                  How would you rate your experience?
                </h3>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map(star => <button key={star} className="p-1 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded" onClick={() => setRating(star)} aria-label={`Rate ${star} stars`} aria-pressed={rating === star}>
                      <StarIcon className={`w-8 h-8 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>)}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-medium mb-3">
                  How do you feel about the app?
                </h3>
                <div className="flex justify-center space-x-4">
                  <button className={`p-3 rounded-full ${sentiment === 'positive' ? 'bg-green-100' : 'bg-gray-100'}`} onClick={() => setSentiment('positive')} aria-label="I feel positive" aria-pressed={sentiment === 'positive'}>
                    <SmileIcon className={`w-8 h-8 ${sentiment === 'positive' ? 'text-green-500' : 'text-gray-400'}`} />
                  </button>
                  <button className={`p-3 rounded-full ${sentiment === 'neutral' ? 'bg-blue-100' : 'bg-gray-100'}`} onClick={() => setSentiment('neutral')} aria-label="I feel neutral" aria-pressed={sentiment === 'neutral'}>
                    <MehIcon className={`w-8 h-8 ${sentiment === 'neutral' ? 'text-blue-500' : 'text-gray-400'}`} />
                  </button>
                  <button className={`p-3 rounded-full ${sentiment === 'negative' ? 'bg-red-100' : 'bg-gray-100'}`} onClick={() => setSentiment('negative')} aria-label="I feel negative" aria-pressed={sentiment === 'negative'}>
                    <FrownIcon className={`w-8 h-8 ${sentiment === 'negative' ? 'text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="feedback-comment" className="block font-medium mb-2">
                  Share your thoughts (optional)
                </label>
                <textarea id="feedback-comment" className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="What do you like or dislike? Any suggestions for improvement?" value={comment} onChange={e => setComment(e.target.value)}></textarea>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={rating === 0 && !sentiment && !comment.trim()}>
                <SendIcon className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </> : <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">Thank You!</h3>
              <p className="text-gray-600">
                Your feedback helps us improve CareSupport for everyone.
              </p>
            </div>}
        </div>
      </div>
    </div>;
};
// CheckIcon component for the success state
const CheckIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>;