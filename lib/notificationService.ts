import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Task } from '@/types/task';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web notifications
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        return false;
      }

      // Mobile notifications
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        return finalStatus === 'granted';
      } else {
        console.log('Must use physical device for Push Notifications');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleTaskNotification(task: Task): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return null;
      }

      const notificationTime = this.parseTaskTime(task.time);
      if (!notificationTime || notificationTime <= new Date()) {
        console.log('Task time is in the past or invalid');
        return null;
      }

      if (Platform.OS === 'web') {
        return this.scheduleWebNotification(task, notificationTime);
      } else {
        return this.scheduleMobileNotification(task, notificationTime);
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  private async scheduleMobileNotification(task: Task, notificationTime: Date): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Task Reminder',
          body: `Time for: ${task.title}`,
          data: {
            taskId: task.id,
            taskTitle: task.title,
            taskCategory: task.category,
            taskPriority: task.priority,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'task-reminder',
        },
        trigger: {
          date: notificationTime,
        },
      });

      console.log(`Notification scheduled for ${task.title} at ${notificationTime.toLocaleString()}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling mobile notification:', error);
      return null;
    }
  }

  private scheduleWebNotification(task: Task, notificationTime: Date): string | null {
    try {
      const timeUntilNotification = notificationTime.getTime() - Date.now();
      
      if (timeUntilNotification <= 0) {
        return null;
      }

      const timeoutId = setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('⏰ Task Reminder', {
            body: `Time for: ${task.title}`,
            icon: '/favicon.png',
            badge: '/favicon.png',
            tag: `task-${task.id}`,
            requireInteraction: true,
            data: {
              taskId: task.id,
              taskTitle: task.title,
              taskCategory: task.category,
              taskPriority: task.priority,
            },
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // Auto-close after 10 seconds
          setTimeout(() => {
            notification.close();
          }, 10000);
        }
      }, timeUntilNotification);

      console.log(`Web notification scheduled for ${task.title} at ${notificationTime.toLocaleString()}`);
      return timeoutId.toString();
    } catch (error) {
      console.error('Error scheduling web notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // For web, we stored the timeout ID
        const timeoutId = parseInt(notificationId);
        if (!isNaN(timeoutId)) {
          clearTimeout(timeoutId);
        }
      } else {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
      console.log(`Notification ${notificationId} cancelled`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async cancelAllTaskNotifications(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  private parseTaskTime(timeString: string): Date | null {
    try {
      // Parse time string like "9:30 AM" or "2:15 PM"
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }

      const now = new Date();
      const taskDate = new Date();
      taskDate.setHours(hour24, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (taskDate <= now) {
        taskDate.setDate(taskDate.getDate() + 1);
      }

      return taskDate;
    } catch (error) {
      console.error('Error parsing task time:', error);
      return null;
    }
  }

  async getScheduledNotifications(): Promise<any[]> {
    try {
      if (Platform.OS === 'web') {
        return []; // Web doesn't have a way to list scheduled notifications
      } else {
        return await Notifications.getAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Handle notification responses (when user taps on notification)
  addNotificationResponseListener(callback: (response: any) => void) {
    if (Platform.OS !== 'web') {
      return Notifications.addNotificationResponseReceivedListener(callback);
    }
    return { remove: () => {} };
  }

  // Handle notifications received while app is in foreground
  addNotificationReceivedListener(callback: (notification: any) => void) {
    if (Platform.OS !== 'web') {
      return Notifications.addNotificationReceivedListener(callback);
    }
    return { remove: () => {} };
  }

  // Send immediate notification (for testing or instant reminders)
  async sendImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return;
      }

      if (Platform.OS === 'web') {
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(title, {
            body,
            icon: '/favicon.png',
            badge: '/favicon.png',
            requireInteraction: true,
            data,
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          setTimeout(() => {
            notification.close();
          }, 5000);
        }
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null, // Send immediately
        });
      }
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();