import { Platform } from 'react-native';
import { Task } from '@/types/task';

// For web-only notifications since expo-notifications doesn't work in Expo Go
export class NotificationService {
  private static instance: NotificationService;
  private scheduledTimeouts: Map<string, NodeJS.Timeout> = new Map();

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
          if (Notification.permission === 'granted') {
            return true;
          } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
          }
        }
        return false;
      }

      // For mobile, we'll return true but notifications won't work in Expo Go
      // This will work when you create a development build
      console.log('📱 Mobile notifications require a development build (not available in Expo Go)');
      return true;
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
        // For mobile, we'll simulate scheduling but it won't actually work in Expo Go
        console.log(`📱 Notification scheduled for ${task.title} at ${notificationTime.toLocaleString()} (requires development build)`);
        return `mobile_${task.id}_${Date.now()}`;
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  private scheduleWebNotification(task: Task, notificationTime: Date): string | null {
    try {
      const timeUntilNotification = notificationTime.getTime() - Date.now();
      
      if (timeUntilNotification <= 0) {
        return null;
      }

      const notificationId = `web_${task.id}_${Date.now()}`;
      
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
        } else {
          // Fallback: show an alert if notifications aren't available
          alert(`⏰ Task Reminder: Time for ${task.title}!`);
        }
        
        // Clean up the timeout reference
        this.scheduledTimeouts.delete(notificationId);
      }, timeUntilNotification);

      // Store the timeout so we can cancel it later
      this.scheduledTimeouts.set(notificationId, timeoutId);

      console.log(`🌐 Web notification scheduled for ${task.title} at ${notificationTime.toLocaleString()}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling web notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (notificationId.startsWith('web_')) {
        // Cancel web timeout
        const timeoutId = this.scheduledTimeouts.get(notificationId);
        if (timeoutId) {
          clearTimeout(timeoutId);
          this.scheduledTimeouts.delete(notificationId);
        }
      } else if (notificationId.startsWith('mobile_')) {
        // For mobile, we'll just log (actual cancellation would work in development build)
        console.log(`📱 Mobile notification ${notificationId} cancelled (requires development build)`);
      }
      console.log(`Notification ${notificationId} cancelled`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async cancelAllTaskNotifications(): Promise<void> {
    try {
      // Cancel all web timeouts
      for (const [notificationId, timeoutId] of this.scheduledTimeouts.entries()) {
        clearTimeout(timeoutId);
      }
      this.scheduledTimeouts.clear();
      
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
      // Return information about scheduled web notifications
      const notifications = [];
      for (const [notificationId] of this.scheduledTimeouts.entries()) {
        notifications.push({
          identifier: notificationId,
          content: {
            title: 'Task Reminder',
            body: 'Scheduled task notification',
          },
          trigger: {
            type: 'timeInterval',
          },
        });
      }
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Placeholder methods for compatibility
  addNotificationResponseListener(callback: (response: any) => void) {
    if (Platform.OS === 'web') {
      // For web, we can listen to notification clicks via the onclick handler
      console.log('Notification response listener added (web)');
    } else {
      console.log('📱 Notification response listener requires development build');
    }
    return { remove: () => {} };
  }

  addNotificationReceivedListener(callback: (notification: any) => void) {
    if (Platform.OS === 'web') {
      console.log('Notification received listener added (web)');
    } else {
      console.log('📱 Notification received listener requires development build');
    }
    return { remove: () => {} };
  }

  // Send immediate notification (for testing)
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
        } else {
          // Fallback for browsers without notification support
          alert(`${title}\n${body}`);
        }
      } else {
        console.log(`📱 Test notification: ${title} - ${body} (requires development build)`);
        // For mobile in Expo Go, we'll show an alert as a fallback
        alert(`📱 Test Notification\n${title}\n${body}\n\nNote: Real notifications require a development build`);
      }
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  // Get platform-specific notification info
  getNotificationInfo(): { platform: string; available: boolean; message: string } {
    if (Platform.OS === 'web') {
      const available = 'Notification' in window;
      return {
        platform: 'Web',
        available,
        message: available 
          ? 'Web notifications are supported in this browser'
          : 'Web notifications are not supported in this browser'
      };
    } else {
      return {
        platform: 'Mobile',
        available: false,
        message: 'Mobile notifications require a development build (not available in Expo Go)'
      };
    }
  }
}

export const notificationService = NotificationService.getInstance();