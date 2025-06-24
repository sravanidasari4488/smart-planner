import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, Calendar, Trophy, Star, Clock } from 'lucide-react-native';
import { Task } from '@/types/task';
import { TaskStorage } from '@/lib/storage';

export default function CompletedScreen() {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCompletedTasks = useCallback(async () => {
    try {
      const tasks = await TaskStorage.getCompletedTasks();
      // Sort by completion date (most recent first)
      const sortedTasks = tasks.sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return b.completedAt.getTime() - a.completedAt.getTime();
      });
      setCompletedTasks(sortedTasks);
    } catch (error) {
      console.error('Error loading completed tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompletedTasks();
  }, [loadCompletedTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCompletedTasks();
    setRefreshing(false);
  }, [loadCompletedTasks]);

  const getCompletionStats = () => {
    const today = new Date();
    const todayTasks = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate.toDateString() === today.toDateString();
    });

    const thisWeek = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return completedDate >= weekAgo;
    });

    return {
      today: todayTasks.length,
      week: thisWeek.length,
      total: completedTasks.length,
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatCompletionTime = (completedAt?: Date) => {
    if (!completedAt) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - completedAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return completedAt.toLocaleDateString();
    }
  };

  const stats = getCompletionStats();

  if (loading) {
    return (
      <LinearGradient colors={['#10B981', '#059669']} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading completed tasks...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Trophy size={28} color="#FFFFFF" />
            <Text style={styles.title}>Completed Tasks</Text>
          </View>
          <Text style={styles.subtitle}>
            Celebrate your achievements and track your progress
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.today}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.week}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {completedTasks.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Image
            source={{ uri: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400' }}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>No completed tasks yet</Text>
          <Text style={styles.emptyDescription}>
            Complete tasks from your planner to see them here. Every completed task is a step towards your goals!
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.tasksList}
          contentContainerStyle={styles.tasksContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {completedTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleRow}>
                  <CheckCircle size={20} color="#10B981" />
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
                </View>
                
                {task.description && (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                )}
              </View>

              <View style={styles.taskFooter}>
                <View style={styles.taskMeta}>
                  <View style={styles.timeContainer}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.timeText}>{task.time}</Text>
                  </View>
                  
                  <View style={styles.categoryContainer}>
                    <Text style={styles.categoryText}>{task.category}</Text>
                  </View>
                </View>
                
                <Text style={styles.completionTime}>
                  {formatCompletionTime(task.completedAt)}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
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
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
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
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1FAE5',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyImage: {
    width: 200,
    height: 150,
    borderRadius: 16,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  tasksList: {
    flex: 1,
  },
  tasksContent: {
    paddingHorizontal: 24,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
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
  taskHeader: {
    marginBottom: 16,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
    textDecorationLine: 'line-through',
    textDecorationColor: '#9CA3AF',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginLeft: 32,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  categoryContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  completionTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#10B981',
  },
  bottomSpacing: {
    height: 100,
  },
});