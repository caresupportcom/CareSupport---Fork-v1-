import React from 'react';
import { FeedbackData } from '../components/Feedback/FeedbackModal';
class FeedbackService {
  private feedbackItems: FeedbackData[] = [];
  // Submit feedback
  submitFeedback(feedback: FeedbackData): Promise<void> {
    // In a real app, this would send the feedback to a backend service
    this.feedbackItems.push({
      ...feedback,
      timestamp: new Date().toISOString()
    } as any);
    console.log('Feedback submitted:', feedback);
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(resolve, 500);
    });
  }
  // Get all feedback (for admin purposes)
  getAllFeedback(): FeedbackData[] {
    return this.feedbackItems;
  }
  // Get average rating
  getAverageRating(): number {
    if (this.feedbackItems.length === 0) return 0;
    const sum = this.feedbackItems.filter(item => item.rating > 0).reduce((acc, item) => acc + item.rating, 0);
    const count = this.feedbackItems.filter(item => item.rating > 0).length;
    return count > 0 ? sum / count : 0;
  }
}
// Export a singleton instance
export const feedbackService = new FeedbackService();