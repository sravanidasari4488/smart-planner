import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from '@/lib/tokenCache';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { notificationService } from '@/lib/notificationService';
import { Platform } from 'react-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Request permissions on app start
        await notificationService.requestPermissions();
        
        // Set up notification listeners (these work differently on web vs mobile)
        const responseSubscription = notificationService.addNotificationResponseListener(
          (response) => {
            console.log('Notification tapped:', response);
            // Handle notification tap - could navigate to specific task
            const taskData = response.notification?.request?.content?.data;
            if (taskData?.taskId) {
              console.log('User tapped notification for task:', taskData.taskTitle);
              // You could navigate to the task or show a modal here
            }
          }
        );

        const receivedSubscription = notificationService.addNotificationReceivedListener(
          (notification) => {
            console.log('Notification received while app is open:', notification);
            // Handle notification received while app is in foreground
          }
        );

        return () => {
          responseSubscription.remove();
          receivedSubscription.remove();
        };
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ClerkLoaded>
    </ClerkProvider>
  );
}