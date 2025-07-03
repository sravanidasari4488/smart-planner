import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Send, Bot, User, Plus, Clock, Lightbulb, Sparkles, CircleCheck as CheckCircle, Calendar } from 'lucide-react-native';
import { Task } from '@/types/task';
import { TaskStorage } from '@/lib/storage';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestedTask?: {
    title: string;
    description: string;
    time: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  };
}

const CHAT_PROMPTS = [
  "What's on your mind today?",
  "Tell me about your goals for this week",
  "What would you like to accomplish?",
  "Any ideas you'd like to explore?",
  "What's been challenging you lately?",
];

const BOT_RESPONSES = {
  greeting: [
    "Hi there! I'm here to help you organize your thoughts and turn them into actionable tasks. What's on your mind?",
    "Hello! Ready to plan something amazing? Tell me what you're thinking about.",
    "Hey! I'm your planning assistant. Share what's in your head and let's make it happen!",
  ],
  encouragement: [
    "That sounds like a great idea! Let me help you break it down into actionable steps.",
    "I love that thinking! How can we turn this into something concrete?",
    "Interesting! Let's explore this further and create a plan.",
    "That's a wonderful goal! What would be the first step?",
  ],
  clarification: [
    "Tell me more about that. What specific outcome are you hoping for?",
    "That's intriguing! Can you give me more details about what you have in mind?",
    "I'd love to help you with that. What does success look like to you?",
    "Great start! What would be the ideal timeline for this?",
  ],
  taskSuggestion: [
    "Based on what you've shared, I think this could be a perfect task for your planner:",
    "Here's how I'd structure this as an actionable task:",
    "Let me suggest a way to organize this:",
    "I've crafted this task based on your thoughts:",
  ]
};

export default function PlanningChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize with greeting
    const greeting: ChatMessage = {
      id: 'greeting',
      text: getRandomResponse(BOT_RESPONSES.greeting),
      isBot: true,
      timestamp: new Date(),
    };
    setMessages([greeting]);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const getRandomResponse = (responses: string[]) => {
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateBotResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Keywords that suggest task creation
    const taskKeywords = ['want to', 'need to', 'should', 'plan to', 'goal', 'accomplish', 'finish', 'complete', 'work on', 'learn', 'practice', 'exercise', 'call', 'meeting', 'deadline'];
    const timeKeywords = ['today', 'tomorrow', 'this week', 'next week', 'morning', 'afternoon', 'evening', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const hasTaskKeywords = taskKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasTimeKeywords = timeKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (hasTaskKeywords || hasTimeKeywords) {
      // Generate a task suggestion
      const suggestedTask = generateTaskFromMessage(userMessage);
      
      return {
        id: Date.now().toString(),
        text: getRandomResponse(BOT_RESPONSES.taskSuggestion),
        isBot: true,
        timestamp: new Date(),
        suggestedTask,
      };
    } else if (lowerMessage.length < 10) {
      // Short message, ask for clarification
      return {
        id: Date.now().toString(),
        text: getRandomResponse(BOT_RESPONSES.clarification),
        isBot: true,
        timestamp: new Date(),
      };
    } else {
      // Encouraging response
      return {
        id: Date.now().toString(),
        text: getRandomResponse(BOT_RESPONSES.encouragement),
        isBot: true,
        timestamp: new Date(),
      };
    }
  };

  const generateTaskFromMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Extract potential title (first meaningful phrase)
    let title = message.split('.')[0].split(',')[0];
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    // Determine category based on keywords
    let category = 'Personal';
    if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('meeting') || lowerMessage.includes('project')) {
      category = 'Work';
    } else if (lowerMessage.includes('exercise') || lowerMessage.includes('gym') || lowerMessage.includes('health') || lowerMessage.includes('doctor')) {
      category = 'Health';
    } else if (lowerMessage.includes('learn') || lowerMessage.includes('study') || lowerMessage.includes('course') || lowerMessage.includes('read')) {
      category = 'Learning';
    } else if (lowerMessage.includes('friend') || lowerMessage.includes('family') || lowerMessage.includes('call') || lowerMessage.includes('visit')) {
      category = 'Social';
    }
    
    // Determine priority based on urgency words
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('deadline') || lowerMessage.includes('important')) {
      priority = 'high';
    } else if (lowerMessage.includes('someday') || lowerMessage.includes('eventually') || lowerMessage.includes('when i have time')) {
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
    } else if (currentHour < 12) {
      time = '10:00 AM';
    } else if (currentHour < 17) {
      time = '3:00 PM';
    } else {
      time = '8:00 PM';
    }
    
    return {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      description: message.length > 100 ? message.substring(0, 97) + '...' : message,
      time,
      category,
      priority,
    };
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(userMessage.text);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const addTaskToPlanner = async (suggestedTask: any) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: suggestedTask.title,
      description: suggestedTask.description,
      time: suggestedTask.time,
      completed: false,
      priority: suggestedTask.priority,
      category: suggestedTask.category,
      createdAt: new Date(),
    };

    try {
      await TaskStorage.addTask(newTask);
      Alert.alert('Success', 'Task added to your planner!');
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <MessageCircle size={28} color="#FFFFFF" />
            <Text style={styles.title}>Planning Assistant</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.onlineIndicator} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Share your thoughts and I'll help you turn them into actionable tasks
          </Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Animated.View style={[styles.messagesContainer, { opacity: fadeAnim }]}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => (
              <View key={message.id} style={[
                styles.messageContainer,
                message.isBot ? styles.botMessageContainer : styles.userMessageContainer
              ]}>
                <View style={styles.messageHeader}>
                  <View style={styles.avatarContainer}>
                    {message.isBot ? (
                      <Bot size={20} color="#6366F1" />
                    ) : (
                      <User size={20} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.messageTime}>
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
                
                <View style={[
                  styles.messageBubble,
                  message.isBot ? styles.botBubble : styles.userBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.isBot ? styles.botText : styles.userText
                  ]}>
                    {message.text}
                  </Text>
                </View>

                {message.suggestedTask && (
                  <View style={styles.taskSuggestion}>
                    <View style={styles.taskHeader}>
                      <Lightbulb size={16} color="#F59E0B" />
                      <Text style={styles.taskSuggestionTitle}>Suggested Task</Text>
                    </View>
                    
                    <View style={styles.taskContent}>
                      <Text style={styles.taskTitle}>{message.suggestedTask.title}</Text>
                      <Text style={styles.taskDescription}>{message.suggestedTask.description}</Text>
                      
                      <View style={styles.taskMeta}>
                        <View style={styles.taskMetaItem}>
                          <Clock size={14} color="#6B7280" />
                          <Text style={styles.taskMetaText}>{message.suggestedTask.time}</Text>
                        </View>
                        
                        <View style={styles.taskMetaItem}>
                          <Calendar size={14} color="#6B7280" />
                          <Text style={styles.taskMetaText}>{message.suggestedTask.category}</Text>
                        </View>
                        
                        <View style={[
                          styles.priorityBadge,
                          { backgroundColor: getPriorityColor(message.suggestedTask.priority) + '20' }
                        ]}>
                          <Text style={[
                            styles.priorityText,
                            { color: getPriorityColor(message.suggestedTask.priority) }
                          ]}>
                            {message.suggestedTask.priority.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity
                        style={styles.addTaskButton}
                        onPress={() => addTaskToPlanner(message.suggestedTask)}
                      >
                        <Plus size={16} color="#FFFFFF" />
                        <Text style={styles.addTaskButtonText}>Add to Planner</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}

            {isTyping && (
              <View style={[styles.messageContainer, styles.botMessageContainer]}>
                <View style={styles.messageHeader}>
                  <View style={styles.avatarContainer}>
                    <Bot size={20} color="#6366F1" />
                  </View>
                </View>
                <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                  <View style={styles.typingIndicator}>
                    <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                    <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
                    <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </Animated.View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Share what's on your mind..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Send size={20} color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.promptsContainer}
            contentContainerStyle={styles.promptsContent}
          >
            {CHAT_PROMPTS.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.promptChip}
                onPress={() => setInputText(prompt)}
              >
                <Sparkles size={14} color="#6366F1" />
                <Text style={styles.promptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E0E7FF',
    lineHeight: 22,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageContainer: {
    marginBottom: 20,
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  botText: {
    color: '#1F2937',
  },
  userText: {
    color: '#FFFFFF',
  },
  typingBubble: {
    paddingVertical: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 2,
  },
  taskSuggestion: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '90%',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskSuggestionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 6,
  },
  taskContent: {
    gap: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    lineHeight: 22,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskMetaText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  addTaskButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  promptsContainer: {
    maxHeight: 40,
  },
  promptsContent: {
    paddingRight: 20,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  promptText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
    marginLeft: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});