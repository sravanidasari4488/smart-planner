import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Bell, BellOff, Clock, CircleCheck as CheckCircle, Settings, Smartphone, Monitor, AlertCircle } from 'lucide-react-native';
import { notificationService } from '@/lib/notificationService';

interface NotificationSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationSettings({ visible, onClose }: NotificationSettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationInfo, setNotificationInfo] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      checkNotificationStatus();
      loadScheduledNotifications();
      loadNotificationInfo();
    }
  }, [visible]);

  const loadNotificationInfo = () => {
    const info = notificationService.getNotificationInfo();
    setNotificationInfo(info);
  };

  const checkNotificationStatus = async () => {
    try {
      const hasPermission = await notificationService.requestPermissions();
      setNotificationsEnabled(hasPermission);
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const loadScheduledNotifications = async () => {
    try {
      const notifications = await notificationService.getScheduledNotifications();
      setScheduledNotifications(notifications);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    setLoading(true);
    try {
      if (enabled) {
        const hasPermission = await notificationService.requestPermissions();
        if (hasPermission) {
          setNotificationsEnabled(true);
          Alert.alert(
            'Notifications Enabled',
            Platform.OS === 'web' 
              ? 'You will now receive browser notifications for your scheduled tasks!'
              : 'Notifications are enabled! Note: Full functionality requires a development build.'
          );
        } else {
          Alert.alert(
            'Permission Required',
            Platform.OS === 'web'
              ? 'Please allow notifications in your browser to receive task reminders.'
              : 'Please enable notifications in your device settings to receive task reminders.'
          );
        }
      } else {
        setNotificationsEnabled(false);
        await notificationService.cancelAllTaskNotifications();
        Alert.alert(
          'Notifications Disabled',
          'All scheduled task notifications have been cancelled.'
        );
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.sendImmediateNotification(
        '🧪 Test Notification',
        'This is a test notification from Smart Planner!',
        { test: true }
      );
      
      if (Platform.OS === 'web') {
        Alert.alert('Test Sent', 'Check if you received the browser notification!');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bell size={24} color="#6366F1" />
            <Text style={styles.title}>Notification Settings</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Platform Info */}
          {notificationInfo && (
            <View style={styles.section}>
              <View style={[
                styles.platformCard,
                { backgroundColor: notificationInfo.available ? '#F0FDF4' : '#FEF3F2' }
              ]}>
                <View style={styles.platformHeader}>
                  {Platform.OS === 'web' ? (
                    <Monitor size={20} color={notificationInfo.available ? '#059669' : '#DC2626'} />
                  ) : (
                    <Smartphone size={20} color={notificationInfo.available ? '#059669' : '#DC2626'} />
                  )}
                  <Text style={[
                    styles.platformTitle,
                    { color: notificationInfo.available ? '#059669' : '#DC2626' }
                  ]}>
                    {notificationInfo.platform} Platform
                  </Text>
                </View>
                <Text style={[
                  styles.platformMessage,
                  { color: notificationInfo.available ? '#047857' : '#B91C1C' }
                ]}>
                  {notificationInfo.message}
                </Text>
                
                {Platform.OS !== 'web' && (
                  <View style={styles.developmentBuildInfo}>
                    <AlertCircle size={16} color="#F59E0B" />
                    <Text style={styles.developmentBuildText}>
                      For full mobile notification support, create a development build using Expo Dev Client
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Main Toggle */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Task Reminders</Text>
                <Text style={styles.settingDescription}>
                  {Platform.OS === 'web' 
                    ? 'Get browser notifications when it\'s time to complete your scheduled tasks'
                    : 'Get notified when it\'s time to complete your scheduled tasks'
                  }
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                disabled={loading}
                trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          </View>

          {/* Test Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Notifications</Text>
            <TouchableOpacity style={styles.testButton} onPress={testNotification}>
              <Settings size={20} color="#6366F1" />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </TouchableOpacity>
          </View>

          {/* Scheduled Notifications */}
          {notificationsEnabled && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Scheduled Notifications ({scheduledNotifications.length})
              </Text>
              {scheduledNotifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Clock size={32} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No scheduled notifications</Text>
                  <Text style={styles.emptySubtext}>
                    Create tasks with specific times to see them here
                  </Text>
                </View>
              ) : (
                <View style={styles.notificationsList}>
                  {scheduledNotifications.map((notification, index) => (
                    <View key={index} style={styles.notificationItem}>
                      <View style={styles.notificationIcon}>
                        <Bell size={16} color="#6366F1" />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>
                          {notification.content?.title || 'Task Reminder'}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {notification.trigger?.date 
                            ? new Date(notification.trigger.date).toLocaleString()
                            : 'Scheduled'
                          }
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* How it Works */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <CheckCircle size={20} color="#10B981" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>How it works</Text>
                <Text style={styles.infoText}>
                  {Platform.OS === 'web' 
                    ? 'When you create a task with a specific time, we\'ll schedule a browser notification to remind you. Make sure to allow notifications when prompted.'
                    : 'When you create a task with a specific time, we\'ll schedule a notification to remind you. For full functionality, create a development build using Expo Dev Client.'
                  }
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  closeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  platformCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  platformMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  developmentBuildInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  developmentBuildText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  testButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6366F1',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  notificationsList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  infoSection: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#065F46',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#047857',
    lineHeight: 18,
  },
});