import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Task } from '@/types/task';
import { Clock, CircleCheck as CheckCircle, Circle, CircleAlert as AlertCircle, Star } from 'lucide-react-native';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onPress?: () => void;
}

export default function TaskCard({ task, onComplete, onPress }: TaskCardProps) {
  const scaleAnim = new Animated.Value(1);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress();
    }
  };

  const handleComplete = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete(task.id);
    });
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high': return <AlertCircle size={16} color="#EF4444" />;
      case 'medium': return <Star size={16} color="#F59E0B" />;
      case 'low': return <Circle size={16} color="#10B981" />;
      default: return null;
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
            <TouchableOpacity 
              style={styles.checkButton} 
              onPress={handleComplete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {task.completed ? (
                <CheckCircle size={24} color="#10B981" />
              ) : (
                <Circle size={24} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
          
          {task.description && (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.time}>{task.time}</Text>
          </View>
          
          <View style={styles.metaContainer}>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{task.category}</Text>
            </View>
            
            <View style={styles.priorityContainer}>
              {getPriorityIcon()}
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  checkButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  category: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  priorityContainer: {
    padding: 2,
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
});