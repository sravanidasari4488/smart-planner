import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Plus, Clock, Lightbulb, TrendingUp, Zap, Info } from 'lucide-react-native';
import { AIsuggestion, Task } from '@/types/task';
import { generateAISuggestions } from '@/lib/aiSuggestions';
import { TaskStorage } from '@/lib/storage';

export default function AISuggestionsScreen() {
  const [suggestions, setSuggestions] = useState<AIsuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const newSuggestions = await generateAISuggestions();
      setSuggestions(newSuggestions);
      
      // Check if we're using fallback suggestions (no OpenAI API key)
      const hasApiKey = !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      setIsUsingFallback(!hasApiKey);
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      Alert.alert('Error', 'Failed to load AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSuggestions();
    setRefreshing(false);
  };

  const handleAddSuggestion = async (suggestion: AIsuggestion) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: suggestion.title,
      description: suggestion.description,
      time: suggestion.suggestedTime,
      completed: false,
      priority: suggestion.priority,
      category: suggestion.category,
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Sparkles size={48} color="#FFFFFF" />
          <ActivityIndicator size="large" color="#FFFFFF" style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Generating smart suggestions...</Text>
          <Text style={styles.loadingSubtext}>Analyzing your schedule and productivity patterns</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Sparkles size={28} color="#FFFFFF" />
            <Text style={styles.title}>Smart Suggestions</Text>
            <View style={styles.aiIndicator}>
              <Zap size={16} color="#FFFFFF" />
              <Text style={styles.aiIndicatorText}>
                {isUsingFallback ? 'Smart' : 'AI Powered'}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {isUsingFallback 
              ? 'Intelligent recommendations based on productivity best practices'
              : 'Personalized recommendations powered by artificial intelligence'
            }
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isUsingFallback && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Info size={20} color="#3B82F6" />
              <Text style={styles.infoTitle}>Smart Suggestions Mode</Text>
            </View>
            <Text style={styles.infoText}>
              You're seeing curated suggestions based on productivity research and best practices. 
              For AI-powered personalized suggestions, configure your OpenAI API key in the app settings.
            </Text>
          </View>
        )}

        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <TrendingUp size={20} color="#6366F1" />
            <Text style={styles.insightsTitle}>Productivity Insights</Text>
          </View>
          <Text style={styles.insightsText}>
            {isUsingFallback 
              ? 'These suggestions are based on proven productivity principles and time management research.'
              : 'AI-powered suggestions based on your productivity patterns, current schedule, and proven time management principles.'
            }
          </Text>
        </View>

        {suggestions.map((suggestion) => (
          <View key={suggestion.id} style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <View style={styles.suggestionTitleRow}>
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(suggestion.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(suggestion.priority) }]}>
                    {suggestion.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
            </View>

            <View style={styles.suggestionMeta}>
              <View style={styles.timeContainer}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.timeText}>{suggestion.suggestedTime}</Text>
              </View>
              
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryText}>{suggestion.category}</Text>
              </View>
            </View>

            <View style={styles.reasonContainer}>
              <Lightbulb size={16} color="#F59E0B" />
              <Text style={styles.reasonText}>{suggestion.reason}</Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddSuggestion(suggestion)}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add to Planner</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.refreshHint}>
          <Text style={styles.refreshHintText}>
            Pull down to refresh for new suggestions
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    marginVertical: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#E0E7FF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
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
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aiIndicatorText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E0E7FF',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  infoCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    lineHeight: 20,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  insightsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  suggestionHeader: {
    marginBottom: 16,
  },
  suggestionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  suggestionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  suggestionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 6,
  },
  categoryContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  reasonText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  refreshHint: {
    alignItems: 'center',
    marginTop: 20,
  },
  refreshHintText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  bottomSpacing: {
    height: 100,
  },
});