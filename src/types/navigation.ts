export type AppSection = 'generator' | 'usage' | 'license' | 'about' | 'feedback' | 'admin';

export type FeedbackCategory = 'bug' | 'feature' | 'general';
export type FeedbackStatus = 'new' | 'in_progress' | 'resolved';

export interface FeedbackEntry {
  id: string;
  category: FeedbackCategory;
  title: string;
  description: string;
  contactEmail?: string;
  rating?: number;
  createdAt: string;
  status: FeedbackStatus;
  userAgent?: string;
}
