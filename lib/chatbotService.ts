interface MessageAnalysis {
  intent: 'task_creation' | 'information_request' | 'planning' | 'general_chat' | 'list_request';
  entities: {
    activities?: string[];
    timeframes?: string[];
    categories?: string[];
    priorities?: string[];
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

interface ChatResponse {
  text: string;
  suggestedTask?: {
    title: string;
    description: string;
    time: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  };
  suggestions?: string[];
}

export class ChatbotService {
  private static instance: ChatbotService;

  static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  analyzeMessage(message: string): MessageAnalysis {
    const lowerMessage = message.toLowerCase().trim();
    
    // Intent detection
    let intent: MessageAnalysis['intent'] = 'general_chat';
    let confidence = 0.5;

    // Task creation patterns
    const taskPatterns = [
      /(?:i (?:want to|need to|should|have to|plan to))/,
      /(?:remind me to|help me)/,
      /(?:schedule|plan|organize)/,
      /(?:goal|objective|target)/,
      /(?:task|todo|activity)/
    ];

    // Information/list request patterns
    const listPatterns = [
      /(?:list|show me|what are|give me|suggest|recommend)/,
      /(?:ideas for|examples of|types of)/,
      /(?:hobbies|activities|exercises|books|movies|recipes)/,
      /(?:how to|ways to|methods to)/
    ];

    // Planning patterns
    const planningPatterns = [
      /(?:plan|schedule|organize|structure)/,
      /(?:week|day|month|routine)/,
      /(?:productivity|efficiency|time management)/
    ];

    if (taskPatterns.some(pattern => pattern.test(lowerMessage))) {
      intent = 'task_creation';
      confidence = 0.8;
    } else if (listPatterns.some(pattern => pattern.test(lowerMessage))) {
      intent = 'list_request';
      confidence = 0.9;
    } else if (planningPatterns.some(pattern => pattern.test(lowerMessage))) {
      intent = 'planning';
      confidence = 0.7;
    } else if (lowerMessage.includes('?')) {
      intent = 'information_request';
      confidence = 0.6;
    }

    // Entity extraction
    const entities = this.extractEntities(lowerMessage);

    // Sentiment analysis (basic)
    const sentiment = this.analyzeSentiment(lowerMessage);

    return {
      intent,
      entities,
      sentiment,
      confidence
    };
  }

  generateResponse(message: string, analysis: MessageAnalysis): ChatResponse {
    switch (analysis.intent) {
      case 'list_request':
        return this.handleListRequest(message, analysis);
      case 'task_creation':
        return this.handleTaskCreation(message, analysis);
      case 'planning':
        return this.handlePlanningRequest(message, analysis);
      case 'information_request':
        return this.handleInformationRequest(message, analysis);
      default:
        return this.handleGeneralChat(message, analysis);
    }
  }

  private handleListRequest(message: string, analysis: MessageAnalysis): ChatResponse {
    const lowerMessage = message.toLowerCase();
    
    // Hobby suggestions
    if (lowerMessage.includes('hobbies') || lowerMessage.includes('hobby')) {
      return {
        text: "Here are some great hobbies you might enjoy:",
        suggestions: [
          "🎨 Digital art and illustration",
          "📚 Reading fiction and non-fiction",
          "🎸 Learning a musical instrument",
          "🌱 Indoor gardening and plant care",
          "📷 Photography and photo editing",
          "🍳 Cooking and trying new recipes",
          "✍️ Creative writing and journaling",
          "🧩 Puzzle solving and brain games",
          "🎯 Learning a new language",
          "🏃‍♀️ Fitness and outdoor activities"
        ]
      };
    }

    // Exercise suggestions
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('fitness')) {
      return {
        text: "Here are some effective exercises you can try:",
        suggestions: [
          "🏃‍♀️ 30-minute morning jog",
          "💪 Bodyweight strength training",
          "🧘‍♀️ Yoga and stretching routine",
          "🚴‍♀️ Cycling or stationary bike",
          "🏊‍♀️ Swimming laps",
          "🥊 High-intensity interval training (HIIT)",
          "🚶‍♀️ Brisk walking in nature",
          "⚖️ Weight lifting at the gym",
          "🤸‍♀️ Pilates for core strength",
          "🏸 Sports like tennis or badminton"
        ]
      };
    }

    // Book suggestions
    if (lowerMessage.includes('book') || lowerMessage.includes('read')) {
      return {
        text: "Here are some excellent books across different genres:",
        suggestions: [
          "📖 \"Atomic Habits\" by James Clear (Self-help)",
          "🔬 \"Sapiens\" by Yuval Noah Harari (History)",
          "🌟 \"The Seven Husbands of Evelyn Hugo\" (Fiction)",
          "💼 \"Think and Grow Rich\" by Napoleon Hill (Business)",
          "🧠 \"Thinking, Fast and Slow\" by Daniel Kahneman (Psychology)",
          "🚀 \"The Martian\" by Andy Weir (Sci-Fi)",
          "💡 \"Educated\" by Tara Westover (Memoir)",
          "🎯 \"Deep Work\" by Cal Newport (Productivity)",
          "🌍 \"Becoming\" by Michelle Obama (Biography)",
          "🔮 \"The Midnight Library\" by Matt Haig (Fiction)"
        ]
      };
    }

    // Learning suggestions
    if (lowerMessage.includes('learn') || lowerMessage.includes('skill')) {
      return {
        text: "Here are valuable skills you could learn:",
        suggestions: [
          "💻 Programming (Python, JavaScript, etc.)",
          "🎨 Graphic design and digital art",
          "📊 Data analysis and Excel mastery",
          "🗣️ Public speaking and presentation",
          "📱 Social media marketing",
          "🍳 Advanced cooking techniques",
          "📸 Photography and photo editing",
          "✍️ Creative writing and storytelling",
          "🎵 Playing a musical instrument",
          "🌐 Learning a new language"
        ]
      };
    }

    // Productivity suggestions
    if (lowerMessage.includes('productive') || lowerMessage.includes('productivity')) {
      return {
        text: "Here are proven productivity techniques:",
        suggestions: [
          "⏰ Pomodoro Technique (25-min focused work)",
          "📝 Time blocking your calendar",
          "🎯 Setting SMART goals",
          "📱 Digital detox periods",
          "🌅 Morning routine optimization",
          "📋 Weekly planning sessions",
          "🧘‍♀️ Mindfulness and meditation",
          "📊 Tracking habits and progress",
          "🚫 Learning to say no effectively",
          "⚡ Energy management over time management"
        ]
      };
    }

    // Recipe suggestions
    if (lowerMessage.includes('recipe') || lowerMessage.includes('cook') || lowerMessage.includes('meal')) {
      return {
        text: "Here are some delicious and easy recipes to try:",
        suggestions: [
          "🍝 One-pot pasta with vegetables",
          "🥗 Mediterranean quinoa salad",
          "🍲 Slow cooker chicken curry",
          "🥞 Fluffy weekend pancakes",
          "🍜 Homemade ramen bowl",
          "🥙 Healthy wrap with hummus",
          "🍕 Homemade pizza with fresh toppings",
          "🍛 Fried rice with mixed vegetables",
          "🥘 Hearty lentil soup",
          "🧁 No-bake energy balls"
        ]
      };
    }

    // Default list response
    return {
      text: "I'd be happy to help you with suggestions! Could you be more specific about what kind of list you're looking for? For example:",
      suggestions: [
        "Hobbies to try",
        "Exercise routines",
        "Books to read",
        "Skills to learn",
        "Productivity tips",
        "Healthy recipes"
      ]
    };
  }

  private handleTaskCreation(message: string, analysis: MessageAnalysis): ChatResponse {
    const suggestedTask = this.generateTaskFromMessage(message);
    
    const responses = [
      "Perfect! I've created a task based on what you shared:",
      "Great idea! Here's how I'd structure this as a task:",
      "I love that goal! Let me help you organize it:",
      "Excellent! Here's a task to help you achieve that:"
    ];

    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestedTask
    };
  }

  private handlePlanningRequest(message: string, analysis: MessageAnalysis): ChatResponse {
    const responses = [
      "Planning is key to success! Let me help you organize your thoughts. What specific area would you like to plan?",
      "I love helping with planning! Are you looking to organize your day, week, or a specific project?",
      "Great thinking! Effective planning can transform your productivity. What would you like to focus on?",
      "Planning ahead is such a smart approach! Tell me more about what you'd like to organize."
    ];

    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: [
        "Plan my daily routine",
        "Organize my weekly schedule",
        "Set monthly goals",
        "Create a morning routine",
        "Plan a project timeline"
      ]
    };
  }

  private handleInformationRequest(message: string, analysis: MessageAnalysis): ChatResponse {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('how to')) {
      return {
        text: "I'd be happy to help you learn something new! What specifically would you like to know how to do? I can help you break it down into actionable steps.",
        suggestions: [
          "How to build better habits",
          "How to manage time effectively",
          "How to stay motivated",
          "How to learn new skills",
          "How to be more productive"
        ]
      };
    }

    const responses = [
      "That's a great question! I'm here to help you turn ideas into actionable plans. Could you tell me more about what you're trying to achieve?",
      "Interesting question! While I specialize in helping you organize tasks and plans, I'd love to help you explore this further. What's your goal?",
      "I'd be happy to help! My strength is in helping you create actionable steps. What would you like to accomplish related to this?"
    ];

    return {
      text: responses[Math.floor(Math.random() * responses.length)]
    };
  }

  private handleGeneralChat(message: string, analysis: MessageAnalysis): ChatResponse {
    const lowerMessage = message.toLowerCase();

    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return {
        text: "Hello! I'm excited to help you organize your thoughts and create actionable plans. What's on your mind today?",
        suggestions: [
          "I want to be more productive",
          "Help me plan my week",
          "I need motivation",
          "Show me some hobbies",
          "I want to learn something new"
        ]
      };
    }

    // Motivational responses
    if (analysis.sentiment === 'negative' || lowerMessage.includes('tired') || lowerMessage.includes('stressed')) {
      return {
        text: "I understand that feeling. Sometimes the best way to feel better is to take small, positive actions. What's one small thing you could do today that would make you feel accomplished?",
        suggestions: [
          "Take a 10-minute walk",
          "Organize my workspace",
          "Call a friend or family member",
          "Do some light stretching",
          "Listen to uplifting music"
        ]
      };
    }

    // Default encouraging responses
    const responses = [
      "That's interesting! I'm here to help you turn thoughts into action. What would you like to accomplish?",
      "I love that you're sharing your thoughts with me! How can we turn this into something actionable?",
      "Thanks for sharing! I'm great at helping you organize ideas into concrete steps. What's your goal?",
      "I appreciate you opening up! Let's explore how we can make progress on what matters to you."
    ];

    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: [
        "Help me set a goal",
        "I want to be more organized",
        "Show me productivity tips",
        "Help me plan something",
        "I need motivation"
      ]
    };
  }

  private extractEntities(message: string): MessageAnalysis['entities'] {
    const entities: MessageAnalysis['entities'] = {};

    // Activity extraction
    const activityPatterns = [
      /(?:exercise|workout|gym|run|walk|yoga)/g,
      /(?:read|book|study|learn)/g,
      /(?:cook|recipe|meal|food)/g,
      /(?:work|project|meeting|task)/g,
      /(?:hobby|art|music|paint|draw)/g
    ];

    const activities: string[] = [];
    activityPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) activities.push(...matches);
    });
    if (activities.length > 0) entities.activities = activities;

    // Time extraction
    const timePatterns = [
      /(?:today|tomorrow|tonight)/g,
      /(?:morning|afternoon|evening|night)/g,
      /(?:week|month|year)/g,
      /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/g
    ];

    const timeframes: string[] = [];
    timePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) timeframes.push(...matches);
    });
    if (timeframes.length > 0) entities.timeframes = timeframes;

    return entities;
  }

  private analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'like', 'happy', 'excited', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'tired', 'stressed', 'difficult'];

    const words = message.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private generateTaskFromMessage(message: string) {
    const lowerMessage = message.toLowerCase();
    
    // Extract potential title (first meaningful phrase)
    let title = message.split('.')[0].split(',')[0];
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    // Clean up title
    title = title.replace(/^(i want to|i need to|i should|i have to|i plan to|remind me to|help me)\s*/i, '');
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    // Determine category based on keywords
    let category = 'Personal';
    if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('meeting') || lowerMessage.includes('project') || lowerMessage.includes('office')) {
      category = 'Work';
    } else if (lowerMessage.includes('exercise') || lowerMessage.includes('gym') || lowerMessage.includes('health') || lowerMessage.includes('doctor') || lowerMessage.includes('workout')) {
      category = 'Health';
    } else if (lowerMessage.includes('learn') || lowerMessage.includes('study') || lowerMessage.includes('course') || lowerMessage.includes('read') || lowerMessage.includes('book')) {
      category = 'Learning';
    } else if (lowerMessage.includes('friend') || lowerMessage.includes('family') || lowerMessage.includes('call') || lowerMessage.includes('visit') || lowerMessage.includes('social')) {
      category = 'Social';
    }
    
    // Determine priority based on urgency words
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('deadline') || lowerMessage.includes('important') || lowerMessage.includes('critical')) {
      priority = 'high';
    } else if (lowerMessage.includes('someday') || lowerMessage.includes('eventually') || lowerMessage.includes('when i have time') || lowerMessage.includes('maybe')) {
      priority = 'low';
    }
    
    // Suggest time based on context
    let time = '10:00 AM';
    const now = new Date();
    const currentHour = now.getHours();
    
    if (lowerMessage.includes('morning')) {
      time = '9:00 AM';
    } else if (lowerMessage.includes('afternoon')) {
      time = '2:00 PM';
    } else if (lowerMessage.includes('evening')) {
      time = '7:00 PM';
    } else if (lowerMessage.includes('night')) {
      time = '8:00 PM';
    } else if (currentHour < 12) {
      time = '10:00 AM';
    } else if (currentHour < 17) {
      time = '3:00 PM';
    } else {
      time = '8:00 PM';
    }
    
    return {
      title,
      description: message.length > 100 ? message.substring(0, 97) + '...' : message,
      time,
      category,
      priority,
    };
  }
}

export const chatbotService = ChatbotService.getInstance();