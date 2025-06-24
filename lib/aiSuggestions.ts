import { AIsuggestion } from '@/types/task';

// Mock AI suggestions - in a real app, this would connect to an AI service
export const generateAISuggestions = async (): Promise<AIsuggestion[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const suggestions: AIsuggestion[] = [
    {
      id: '1',
      title: 'Morning Meditation',
      description: 'Start your day with 10 minutes of mindfulness meditation',
      suggestedTime: '07:00',
      category: 'Wellness',
      priority: 'high',
      reason: 'Studies show morning meditation improves focus and reduces stress throughout the day'
    },
    {
      id: '2',
      title: 'Review Yesterday\'s Goals',
      description: 'Spend 15 minutes reviewing what you accomplished yesterday',
      suggestedTime: '08:30',
      category: 'Planning',
      priority: 'medium',
      reason: 'Reflecting on progress helps maintain momentum and identify areas for improvement'
    },
    {
      id: '3',
      title: 'Deep Work Block',
      description: 'Focus on your most important task without distractions',
      suggestedTime: '09:00',
      category: 'Work',
      priority: 'high',
      reason: 'Your cognitive abilities are typically highest in the morning, making it ideal for complex tasks'
    },
    {
      id: '4',
      title: 'Hydration Break',
      description: 'Drink a glass of water and do light stretching',
      suggestedTime: '11:00',
      category: 'Health',
      priority: 'medium',
      reason: 'Regular hydration and movement breaks improve concentration and prevent fatigue'
    },
    {
      id: '5',
      title: 'Lunch & Walk',
      description: 'Take a proper lunch break with a 15-minute walk',
      suggestedTime: '12:30',
      category: 'Health',
      priority: 'high',
      reason: 'A midday walk boosts afternoon energy levels and improves digestion'
    },
    {
      id: '6',
      title: 'Email Processing',
      description: 'Batch process emails and respond to important messages',
      suggestedTime: '14:00',
      category: 'Communication',
      priority: 'medium',
      reason: 'Batching emails is more efficient than checking throughout the day'
    },
    {
      id: '7',
      title: 'Plan Tomorrow',
      description: 'Spend 10 minutes planning tomorrow\'s priorities',
      suggestedTime: '17:00',
      category: 'Planning',
      priority: 'high',
      reason: 'Planning the night before reduces decision fatigue and improves morning productivity'
    },
    {
      id: '8',
      title: 'Evening Wind Down',
      description: 'Read or practice gratitude journaling',
      suggestedTime: '21:00',
      category: 'Wellness',
      priority: 'medium',
      reason: 'A consistent evening routine improves sleep quality and mental well-being'
    }
  ];

  // Return a random subset of suggestions
  const shuffled = suggestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};