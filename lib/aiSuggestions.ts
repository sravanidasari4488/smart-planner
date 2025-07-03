import { AIsuggestion, Task } from '@/types/task';
import { aiService } from './aiService';
import { TaskStorage } from './storage';

export const generateAISuggestions = async (): Promise<AIsuggestion[]> => {
  try {
    // Get user context
    const userContext = await buildUserContext();
    
    // Try to get API key from environment (optional)
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    // Generate AI suggestions (will use fallback if no API key)
    const suggestions = await aiService.generateSuggestions(userContext, apiKey);
    
    return suggestions;
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    // Return basic fallback suggestions if everything fails
    return getBasicFallbackSuggestions();
  }
};

async function buildUserContext() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Get existing tasks
  const existingTasks = await TaskStorage.getTasks();
  const completedTasks = await TaskStorage.getCompletedTasks();
  
  // Count completed tasks today
  const today = new Date().toDateString();
  const completedTasksToday = completedTasks.filter(task => 
    task.completedAt && task.completedAt.toDateString() === today
  ).length;

  return {
    currentTime,
    dayOfWeek,
    existingTasks: existingTasks.map(task => ({
      title: task.title,
      time: task.time,
      category: task.category,
      priority: task.priority
    })),
    completedTasksToday,
    preferredCategories: getPreferredCategories(existingTasks, completedTasks)
  };
}

function getPreferredCategories(existingTasks: Task[], completedTasks: Task[]): string[] {
  const allTasks = [...existingTasks, ...completedTasks];
  const categoryCount: { [key: string]: number } = {};
  
  allTasks.forEach(task => {
    categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
  });
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);
}

function getBasicFallbackSuggestions(): AIsuggestion[] {
  const now = new Date();
  const currentHour = now.getHours();
  
  return [
    {
      id: 'basic_planning',
      title: 'Plan Your Day',
      description: 'Take 10 minutes to organize your priorities',
      suggestedTime: '9:00 AM',
      category: 'Planning',
      priority: 'high',
      reason: 'Planning helps you stay focused and productive'
    },
    {
      id: 'basic_health',
      title: 'Take a Break',
      description: 'Step away from work for 15 minutes',
      suggestedTime: '2:00 PM',
      category: 'Health',
      priority: 'medium',
      reason: 'Regular breaks improve focus and prevent burnout'
    },
    {
      id: 'basic_learning',
      title: 'Learn Something New',
      description: 'Spend 20 minutes on skill development',
      suggestedTime: '4:00 PM',
      category: 'Learning',
      priority: 'medium',
      reason: 'Continuous learning keeps you growing and engaged'
    },
    {
      id: 'basic_reflection',
      title: 'Daily Reflection',
      description: 'Review your accomplishments and plan tomorrow',
      suggestedTime: '8:00 PM',
      category: 'Planning',
      priority: 'low',
      reason: 'Reflection helps you learn and improve over time'
    }
  ];
}