import { Platform } from 'react-native';

// Wrapper para AsyncStorage que funciona en web y mobile
let AsyncStorage;

if (Platform.OS === 'web') {
  // En web, usar localStorage
  AsyncStorage = {
    getItem: async (key) => {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    setItem: async (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    },
    removeItem: async (key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error removing from localStorage:', e);
      }
    }
  };
} else {
  // En mobile, usar AsyncStorage normal
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

export default AsyncStorage;
