import OpenAI from 'openai';
import { AIsuggestion } from '@/types/task';

interface UserContext {
  currentTime: string;
  dayOfWeek: string;
  existingTasks: Array<{
    title: string;
    time: string;
    category: string;
    priority: string;
  }>;
  completedTasksToday: number;
  preferredCategories?: string[];
}

export class AITaskSuggestionService {
  private static instance: AITaskSuggestionService;

  static getInstance(): AITaskSuggestionService {
    if (!AITaskSuggestionService.instance) {
      AITaskSuggestionService.instance = new AITaskSuggestionService();
    }
    return AITaskSuggestionService.instance;
  }

  async generateSuggestions(userContext: UserContext, apiKey?: string): Promise<{ suggestions: AIsuggestion[], usingFallback: boolean, error?: string }> {
    // If no API key is provided, return fallback suggestions
    if (!apiKey) {
      console.log('No OpenAI API key provided, using fallback suggestions');
      return {
        suggestions: this.getFallbackSuggestions(userContext),
        usingFallback: true
      };
    }

    // Validate API key format
    if (!this.isValidApiKeyFormat(apiKey)) {
      console.warn('Invalid OpenAI API key format, using fallback suggestions');
      return {
        suggestions: this.getFallbackSuggestions(userContext),
        usingFallback: true,
        error: 'Invalid API key format'
      };
    }

    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    try {
      const prompt = this.buildPrompt(userContext);

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI productivity assistant. Generate a JSON array of 4-6 personalized task suggestions tailored to the user's current time, day of the week, completed tasks, scheduled tasks, and preferred categories. Each suggestion should have the following properties:

- id: unique string identifier
- title: short title of the task (max 50 characters)
- description: brief explanation (max 100 characters)
- suggestedTime: time in 12-hour format (e.g., "9:30 AM", "2:15 PM")
- category: one from the user's preferred or new categories
- priority: high | medium | low
- reason: why this task is recommended (max 120 characters)

Respond only with a JSON array of suggestions.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      const suggestions = JSON.parse(response);
      return {
        suggestions: this.validateAndFormatSuggestions(suggestions),
        usingFallback: false
      };
    } catch (error: any) {
      console.error('AI Suggestion error:', error);
      
      let errorMessage = 'AI service temporarily unavailable';
      if (error.status === 401) {
        errorMessage = 'Invalid API key - please check your OpenAI API key';
      } else if (error.status === 429) {
        errorMessage = 'API rate limit exceeded - please try again later';
      } else if (error.status === 403) {
        errorMessage = 'API access forbidden - please check your OpenAI account';
      }

      return {
        suggestions: this.getFallbackSuggestions(userContext),
        usingFallback: true,
        error: errorMessage
      };
    }
  }

  private isValidApiKeyFormat(apiKey: string): boolean {
    // OpenAI API keys should start with 'sk-' and be at least 20 characters
    return apiKey.startsWith('sk-') && apiKey.length >= 20;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!this.isValidApiKeyFormat(apiKey)) {
      return false;
    }

    try {
      const openai = new OpenAI({ 
        apiKey,
        dangerouslyAllowBrowser: true 
      });
      await openai.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI API key validation failed:', error);
      return false;
    }
  }

  private buildPrompt(context: UserContext): string {
    const existingTasksText =
      context.existingTasks.length > 0
        ? context.existingTasks
            .map((task) => `${task.time}: ${task.title} (${task.category}, ${task.priority})`)
            .join('\n')
        : 'No scheduled tasks';

    return `
Current Context:
- Time: ${context.currentTime}
- Day: ${context.dayOfWeek}
- Completed tasks today: ${context.completedTasksToday}
- Preferred categories: ${context.preferredCategories?.join(', ') || 'Work, Personal, Health'}

Scheduled Tasks:
${existingTasksText}

Please suggest 4-6 productive tasks that would fit well into this person's day, considering their schedule and productivity patterns.
`;
  }

  private validateAndFormatSuggestions(suggestions: any[]): AIsuggestion[] {
    if (!Array.isArray(suggestions)) throw new Error('AI did not return a valid array');

    return suggestions
      .filter((s) => s.id && s.title && s.suggestedTime && s.category && s.priority && s.reason)
      .map((s, index) => ({
        id: s.id || `ai_${Date.now()}_${index}`,
        title: s.title.substring(0, 50),
        description: s.description?.substring(0, 100) || '',
        suggestedTime: s.suggestedTime,
        category: s.category,
        priority: s.priority,
        reason: s.reason.substring(0, 120),
      }))
      .slice(0, 6);
  }

  private getFallbackSuggestions(context: UserContext): AIsuggestion[] {
    const currentHour = parseInt(context.currentTime.split(':')[0]);
    const isWeekend = context.dayOfWeek === 'Saturday' || context.dayOfWeek === 'Sunday';
    
    const suggestions: AIsuggestion[] = [];

    // Morning suggestions (6 AM - 12 PM)
    if (currentHour >= 6 && currentHour < 12) {
      suggestions.push(
        {
          id: 'morning_hydration',
          title: 'Morning Hydration & Stretch',
          description: 'Start with a glass of water and 5-minute stretch routine',
          suggestedTime: '7:30 AM',
          category: 'Health',
          priority: 'high',
          reason: 'Hydration and movement boost energy and focus for the day ahead'
        },
        {
          id: 'priority_planning',
          title: 'Daily Priority Review',
          description: 'Identify your top 3 most important tasks for today',
          suggestedTime: '8:30 AM',
          category: 'Planning',
          priority: 'high',
          reason: 'Clear priorities help maintain focus and ensure important work gets done'
        }
      );

      if (!isWeekend) {
        suggestions.push({
          id: 'deep_work_block',
          title: 'Deep Work Session',
          description: 'Focus on your most challenging task without distractions',
          suggestedTime: '9:00 AM',
          category: 'Work',
          priority: 'high',
          reason: 'Morning hours are ideal for complex tasks when mental energy is highest'
        });
      } else {
        suggestions.push({
          id: 'weekend_planning',
          title: 'Weekend Planning',
          description: 'Plan relaxing and enjoyable activities for the weekend',
          suggestedTime: '9:00 AM',
          category: 'Personal',
          priority: 'medium',
          reason: 'Planning helps you make the most of your free time'
        });
      }
    }

    // Afternoon suggestions (12 PM - 6 PM)
    if (currentHour >= 12 && currentHour < 18) {
      suggestions.push(
        {
          id: 'energy_walk',
          title: 'Energizing Walk',
          description: 'Take a 15-minute walk outside for fresh air and movement',
          suggestedTime: '1:30 PM',
          category: 'Health',
          priority: 'medium',
          reason: 'Midday movement combats afternoon fatigue and improves creativity'
        },
        {
          id: 'skill_development',
          title: 'Skill Building Time',
          description: 'Spend 20 minutes learning something new in your field',
          suggestedTime: '3:00 PM',
          category: 'Learning',
          priority: 'medium',
          reason: 'Continuous learning keeps you competitive and engaged'
        }
      );

      if (isWeekend) {
        suggestions.push({
          id: 'personal_project',
          title: 'Personal Project Time',
          description: 'Work on a hobby or personal interest project',
          suggestedTime: '2:00 PM',
          category: 'Personal',
          priority: 'medium',
          reason: 'Weekends are perfect for pursuing personal interests and creativity'
        });
      } else {
        suggestions.push({
          id: 'afternoon_review',
          title: 'Progress Check-in',
          description: 'Review morning accomplishments and adjust afternoon plans',
          suggestedTime: '2:30 PM',
          category: 'Planning',
          priority: 'low',
          reason: 'Regular check-ins help you stay on track and adjust as needed'
        });
      }
    }

    // Evening suggestions (6 PM - 10 PM)
    if (currentHour >= 18 && currentHour < 22) {
      suggestions.push(
        {
          id: 'tomorrow_prep',
          title: 'Tomorrow\'s Success Setup',
          description: 'Prepare clothes, meals, or materials for tomorrow',
          suggestedTime: '8:00 PM',
          category: 'Planning',
          priority: 'medium',
          reason: 'Evening preparation reduces morning stress and decision fatigue'
        },
        {
          id: 'gratitude_reflection',
          title: 'Gratitude & Reflection',
          description: 'Write down 3 things you\'re grateful for today',
          suggestedTime: '9:30 PM',
          category: 'Wellness',
          priority: 'low',
          reason: 'Gratitude practice improves mental well-being and sleep quality'
        }
      );

      if (context.completedTasksToday < 3) {
        suggestions.push({
          id: 'quick_win',
          title: 'Quick Win Task',
          description: 'Complete one small task to end the day productively',
          suggestedTime: '7:00 PM',
          category: 'Personal',
          priority: 'medium',
          reason: 'Small accomplishments create momentum and positive feelings'
        });
      }

      if (isWeekend) {
        suggestions.push({
          id: 'social_connection',
          title: 'Connect with Loved Ones',
          description: 'Call or message someone important to you',
          suggestedTime: '7:30 PM',
          category: 'Social',
          priority: 'medium',
          reason: 'Social connections are vital for mental health and happiness'
        });
      }
    }

    // Late evening/night suggestions (10 PM+)
    if (currentHour >= 22 || currentHour < 6) {
      suggestions.push(
        {
          id: 'wind_down',
          title: 'Digital Wind Down',
          description: 'Put devices away and prepare for restful sleep',
          suggestedTime: '10:00 PM',
          category: 'Wellness',
          priority: 'high',
          reason: 'Reducing screen time before bed improves sleep quality'
        },
        {
          id: 'reading_time',
          title: 'Relaxing Reading',
          description: 'Read a book or magazine for 15-20 minutes',
          suggestedTime: '10:30 PM',
          category: 'Personal',
          priority: 'low',
          reason: 'Reading helps relax the mind and transition to sleep'
        }
      );
    }

    // Add context-specific suggestions based on existing tasks
    if (context.existingTasks.length === 0) {
      suggestions.push({
        id: 'first_task',
        title: 'Plan Your Day',
        description: 'Add your first task to get started with planning',
        suggestedTime: this.getNextAvailableTime(currentHour),
        category: 'Planning',
        priority: 'high',
        reason: 'Starting with a plan helps organize your day effectively'
      });
    }

    // Add productivity boost suggestions based on completed tasks
    if (context.completedTasksToday >= 5) {
      suggestions.push({
        id: 'celebration',
        title: 'Celebrate Your Progress',
        description: 'Take a moment to acknowledge your productivity today',
        suggestedTime: this.getNextAvailableTime(currentHour),
        category: 'Wellness',
        priority: 'low',
        reason: 'Celebrating achievements boosts motivation and well-being'
      });
    }

    // Filter suggestions based on current time and return top 4-6
    const relevantSuggestions = suggestions.filter(suggestion => {
      const suggestionHour = this.parseTimeToHour(suggestion.suggestedTime);
      return suggestionHour >= currentHour;
    });

    return relevantSuggestions.slice(0, 6);
  }

  private parseTimeToHour(timeString: string): number {
    const [time, period] = timeString.split(' ');
    let [hours] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours;
  }

  private getNextAvailableTime(currentHour: number): string {
    const nextHour = currentHour + 1;
    const hour12 = nextHour > 12 ? nextHour - 12 : nextHour;
    const period = nextHour >= 12 ? 'PM' : 'AM';
    return `${hour12}:00 ${period}`;
  }
}

export const aiService = AITaskSuggestionService.getInstance();