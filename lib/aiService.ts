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

  async generateSuggestions(userContext: UserContext, apiKey: string): Promise<AIsuggestion[]> {
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
- title: short title of the task
- description: brief explanation (1-2 lines)
- suggestedTime: time in HH:MM (24hr format) that fits well with the user's day
- category: one from the user's preferred or new categories
- priority: high | medium | low
- reason: why this task is recommended

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
      return this.validateAndFormatSuggestions(suggestions);
    } catch (error) {
      console.error('AI Suggestion error:', error);
      return this.getFallbackSuggestions(userContext);
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const openai = new OpenAI({ apiKey });
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
Time: ${context.currentTime}
Day: ${context.dayOfWeek}
Completed tasks today: ${context.completedTasksToday}
Preferred categories: ${context.preferredCategories?.join(', ') || 'None'}

Scheduled Tasks:
${existingTasksText}
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
    const fallback: AIsuggestion[] = [];

    if (currentHour < 12) {
      fallback.push({
        id: 'fallback_morning',
        title: 'Hydrate and Stretch',
        description: 'Start the day by drinking water and stretching',
        suggestedTime: '08:00',
        category: 'Wellness',
        priority: 'medium',
        reason: 'Good habits energize your morning',
      });
    } else if (currentHour < 17) {
      fallback.push({
        id: 'fallback_midday',
        title: 'Midday Review',
        description: 'Take 10 minutes to review progress and adjust plan',
        suggestedTime: '13:00',
        category: 'Planning',
        priority: 'medium',
        reason: 'Helps stay on track and reduce stress',
      });
    } else {
      fallback.push({
        id: 'fallback_evening',
        title: 'Plan Tomorrow',
        description: 'Write down 3 things to do tomorrow',
        suggestedTime: '20:00',
        category: 'Planning',
        priority: 'high',
        reason: 'Prepping the night before eases morning anxiety',
      });
    }

    return fallback;
  }
}

export const aiService = AITaskSuggestionService.getInstance();
