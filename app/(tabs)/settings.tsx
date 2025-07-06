import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Shield, Palette, Circle as HelpCircle, ChevronRight } from 'lucide-react-native';
import NotificationSettings from '@/components/NotificationSettings';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const settingsItems = [
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Manage task reminders and alerts',
      rightComponent: (
        <TouchableOpacity onPress={() => setShowNotificationSettings(true)}>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
      ),
      onPress: () => setShowNotificationSettings(true),
    },
    {
      icon: Palette,
      title: 'Dark Mode',
      subtitle: 'Toggle dark theme',
      rightComponent: (
        <Switch
          value={darkModeEnabled}
          onValueChange={setDarkModeEnabled}
          trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
          thumbColor={darkModeEnabled ? '#FFFFFF' : '#F3F4F6'}
        />
      ),
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      rightComponent: <ChevronRight size={20} color="#9CA3AF" />,
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help or contact support',
      rightComponent: <ChevronRight size={20} color="#9CA3AF" />,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>
          
          <View style={styles.settingsCard}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.settingItem,
                  index === settingsItems.length - 1 && styles.lastItem,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <item.icon size={20} color="#667eea" />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                {item.rightComponent}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Version 1.0.0</Text>
          </View>
        </View>
      </LinearGradient>

      <NotificationSettings
        visible={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '500',
  },
});