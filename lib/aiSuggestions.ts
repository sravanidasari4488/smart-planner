import { AIsuggestion, Task } from '@/types/task';
import { aiService } from './aiService';
import { TaskStorage } from './storage';

export const generateAISuggestions = async (): Promise<AIsuggestion[]> => {
  try {
    // Check if API key is configured
    if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using fallback suggestions');
      return getFallbackSuggestions();
    }

    // Get user context
    const userContext = await buildUserContext();
    
    // Generate AI suggestions
    const suggestions = await aiService.generateSuggestions(userContext);
    
    return suggestions;
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return getFallbackSuggestions();
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

function getFallbackSuggestions(): AIsuggestion[] {
  const now = new Date();
  const currentHour = now.getHours();
  
  const suggestions: AIsuggestion[] = [
    {
      id: 'fallback_morning_1',
      title: 'Morning Mindfulness',
      description: 'Start with 5 minutes of deep breathing or meditation',
      suggestedTime: '07:30',
      category: 'Wellness',
      priority: 'high',
      reason: 'Morning mindfulness reduces stress and improves focus throughout the day'
    },
    {
      id: 'fallback_morning_2',
      title: 'Priority Planning',
      description: 'Identify your top 3 most important tasks for today',
      suggestedTime: '08:30',
      category: 'Planning',
      priority: 'high',
      reason: 'Clear priorities help maintain focus and ensure important work gets done'
    },
    {
      id: 'fallback_midday_1',
      title: 'Energy Boost Walk',
      description: 'Take a 15-minute walk outside for fresh air',
      suggestedTime: '13:30',
      category: 'Health',
      priority: 'medium',
      reason: 'Midday movement combats afternoon fatigue and improves creativity'
    },
    {
      id: 'fallback_afternoon_1',
      title: 'Skill Development',
      description: 'Spend 20 minutes learning something new in your field',
      suggestedTime: '15:00',
      category: 'Learning',
      priority: 'medium',
      reason: 'Continuous learning keeps you competitive and engaged in your career'
    },
    {
      id: 'fallback_evening_1',
      title: 'Tomorrow\'s Success Setup',
      description: 'Prepare clothes, meals, or materials for tomorrow',
      suggestedTime: '20:00',
      category: 'Planning',
      priority: 'medium',
      reason: 'Evening preparation reduces morning stress and decision fatigue'
    },
    {
      id: 'fallback_evening_2',
      title: 'Gratitude Reflection',
      description: 'Write down 3 things you\'re grateful for today',
      suggestedTime: '21:30',
      category: 'Wellness',
      priority: 'low',
      reason: 'Gratitude practice improves mental well-being and sleep quality'
    }
  ];

  // Filter suggestions based on current time
  const relevantSuggestions = suggestions.filter(suggestion => {
    const suggestionHour = parseInt(suggestion.suggestedTime.split(':')[0]);
    return suggestionHour >= currentHour;
  });

  return relevantSuggestions.slice(0, 4);
}