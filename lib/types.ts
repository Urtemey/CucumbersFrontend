export type ComplaintStatus = 'new' | 'in_progress' | 'resolved';
export type ComplaintPriority = 'critical' | 'high' | 'medium' | 'low';
export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface ActionHistoryItem {
  timestamp: string;
  action: string;
  actor?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  sentiment: SentimentType;
  sentimentScore: number;
  createdAt: string;
  robotLocation: string;
  assignedTo?: string;
  adminResponse?: string;
  resolvedAt?: string;
  actionHistory: ActionHistoryItem[];
}
