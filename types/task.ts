export interface Task {
  id: string;
  title: string;
  description?: string;
  time: string;
  completed: boolean;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
  notificationId?: string; // Add notification ID to track scheduled notifications
}

export interface AIsuggestion {
  id: string;
  title: string;
  description: string;
  suggestedTime: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  reason: string;
}