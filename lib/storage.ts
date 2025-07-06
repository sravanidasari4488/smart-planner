import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, AIsuggestion } from '@/types/task';
import { notificationService } from './notificationService';

const TASKS_KEY = '@daily_planner_tasks';
const COMPLETED_TASKS_KEY = '@daily_planner_completed_tasks';

export const TaskStorage = {
  async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
      if (tasksJson) {
        const tasks = JSON.parse(tasksJson);
        return tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  async getCompletedTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(COMPLETED_TASKS_KEY);
      if (tasksJson) {
        const tasks = JSON.parse(tasksJson);
        return tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading completed tasks:', error);
      return [];
    }
  },

  async saveCompletedTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving completed tasks:', error);
    }
  },

  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    
    // Schedule notification for the new task
    const notificationId = await notificationService.scheduleTaskNotification(task);
    if (notificationId) {
      task.notificationId = notificationId;
    }
    
    tasks.push(task);
    await this.saveTasks(tasks);
  },

  async completeTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const completedTasks = await this.getCompletedTasks();
    
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      const task = tasks[taskIndex];
      task.completed = true;
      task.completedAt = new Date();
      
      // Cancel the notification for this task
      if (task.notificationId) {
        await notificationService.cancelNotification(task.notificationId);
      }
      
      // Move to completed tasks
      completedTasks.push(task);
      tasks.splice(taskIndex, 1);
      
      await this.saveTasks(tasks);
      await this.saveCompletedTasks(completedTasks);
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const taskToDelete = tasks.find(task => task.id === taskId);
    
    // Cancel notification if it exists
    if (taskToDelete?.notificationId) {
      await notificationService.cancelNotification(taskToDelete.notificationId);
    }
    
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    await this.saveTasks(filteredTasks);
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      const currentTask = tasks[taskIndex];
      
      // If time is being updated, reschedule notification
      if (updates.time && updates.time !== currentTask.time) {
        // Cancel old notification
        if (currentTask.notificationId) {
          await notificationService.cancelNotification(currentTask.notificationId);
        }
        
        // Schedule new notification
        const updatedTask = { ...currentTask, ...updates };
        const notificationId = await notificationService.scheduleTaskNotification(updatedTask);
        if (notificationId) {
          updates.notificationId = notificationId;
        }
      }
      
      tasks[taskIndex] = { ...currentTask, ...updates };
      await this.saveTasks(tasks);
    }
  },
};