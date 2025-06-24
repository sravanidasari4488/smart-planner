import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Calendar, Sun, Moon, Coffee } from 'lucide-react-native';
import { Task } from '@/types/task';
import { TaskStorage } from '@/lib/storage';
import TaskCard from '@/components/taskCard';
import AddTaskModal from '@/components/AddTaskModal';

export default function HomeScreen() {
  const { isSignedIn, isLoaded, user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  const loadTasks = useCallback(async () => {
    try {
      const loadedTasks = await TaskStorage.getTasks();
      // Sort tasks by time
      const sortedTasks = loadedTasks.sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      loadTasks();
    }
  }, [isSignedIn, loadTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date(),
    };

    try {
      await TaskStorage.addTask(newTask);
      await loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await TaskStorage.completeTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 17) return { text: 'Good Afternoon', icon: Coffee };
    return { text: 'Good Evening', icon: Moon };
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isLoaded || loading) {
    return (
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your planner...</Text>
      </LinearGradient>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <GreetingIcon size={24} color="#FFFFFF" />
            <Text style={styles.greeting}>{greeting.text}</Text>
          </View>
          <Text style={styles.userName}>
            {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0]}
          </Text>
          <View style={styles.dateContainer}>
            <Calendar size={16} color="#E0E7FF" />
            <Text style={styles.date}>{getCurrentDate()}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {tasks.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* <Image
              source={{ uri: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.emptyImage}
            /> */}
            <Text style={styles.emptyTitle}>Ready to plan your day?</Text>
            <Text style={styles.emptyDescription}>
              Start by adding your first task. Organize your time, set priorities, and make every moment count.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Add Your First Task</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.tasksList}
            contentContainerStyle={styles.tasksContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.tasksHeader}>
              <Text style={styles.tasksTitle}>Today's Tasks</Text>
              <Text style={styles.tasksCount}>{tasks.length} tasks</Text>
            </View>

            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
              />
            ))}

            <View style={styles.bottomSpacing} />
          </ScrollView>
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.fabGradient}>
          <Plus size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTask={handleAddTask}
      />
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
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E0E7FF',
    marginLeft: 6,
  },
  content: {
    flex: 1,
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
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tasksList: {
    flex: 1,
  },
  tasksContent: {
    padding: 24,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tasksTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  tasksCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});