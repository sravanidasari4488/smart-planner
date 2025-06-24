import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Create the token cache for Clerk
const createTokenCache = () => {
  return {
    async getToken(key: string) {
      try {
        if (Platform.OS === 'web') {
          return localStorage.getItem(key);
        }
        return SecureStore.getItemAsync(key);
      } catch (err) {
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        if (Platform.OS === 'web') {
          return localStorage.setItem(key, value);
        }
        return SecureStore.setItemAsync(key, value);
      } catch (err) {
        return;
      }
    },
  };
};

export const tokenCache = createTokenCache();