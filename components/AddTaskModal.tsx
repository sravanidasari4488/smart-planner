import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task } from '@/types/task';
import { X, Clock, Tag, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
}

const categories = ['Work', 'Personal', 'Health', 'Learning', 'Social', 'Other'];
const priorities = [
  { value: 'low', label: 'Low', color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
] as const;

export default function AddTaskModal({ visible, onClose, onAddTask }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTime(null);
    setCategory('Personal');
    setPriority('medium');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatTime12Hour = (date: Date): string => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!time) {
      Alert.alert('Error', 'Please select a time');
      return;
    }

    const formattedTime = formatTime12Hour(time);

    const newTask: Omit<Task, 'id' | 'completed' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      time: formattedTime,
      priority,
      category,
    };

    onAddTask(newTask);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Task</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What do you need to do?"
              placeholderTextColor="#9CA3AF"
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add more details (optional)"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Time *</Text>
            <TouchableOpacity
              style={styles.timeInputContainer}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={20} color="#6B7280" />
              <Text style={styles.timeInput}>
                {time ? formatTime12Hour(time) : 'Select Time'}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                mode="time"
                value={time || new Date()}
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    setTime(selectedDate);
                  }
                }}
              />
            )}

            <Text style={styles.hint}>Use 12-hour format (e.g., 9:30 AM, 2:15 PM)</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Tag size={16} color={category === cat ? '#FFFFFF' : '#6B7280'} />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityButton,
                    priority === p.value && { backgroundColor: p.color + '20', borderColor: p.color },
                  ]}
                  onPress={() => setPriority(p.value)}
                >
                  <AlertTriangle size={16} color={p.color} />
                  <Text
                    style={[
                      styles.priorityButtonText,
                      priority === p.value && { color: p.color },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  timeInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginLeft: 12,
  },
  hint: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#6366F1',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 6,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priorityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  addButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
