import React, { useState } from 'react';
import { MessageSquareIcon } from 'lucide-react';
import { FeedbackModal } from '../Feedback/FeedbackModal';
import { feedbackService } from '../../services/FeedbackService';
interface FeedbackButtonProps {
  context?: string;
}
export const FeedbackButton = ({
  context
}: FeedbackButtonProps) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const handleSubmitFeedback = feedbackData => {
    feedbackService.submitFeedback(feedbackData);
  };
  return <>
      <button className="fixed bottom-24 right-4 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg" onClick={() => setShowFeedback(true)} aria-label="Give feedback">
        <MessageSquareIcon className="w-6 h-6 text-white" />
      </button>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} onSubmit={handleSubmitFeedback} context={context} />}
    </>;
};