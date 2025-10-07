// API service for user preferences
import apiClient from './axios';

export const getUserPreferences = async () => {
  try {
    const { data } = await apiClient.get('/users/preferences');
    return data;
  } catch (error) {
    console.log('No user preferences found, using defaults');
    return null;
  }
};

export const saveUserPreferences = async (preferences) => {
  try {
    const { data } = await apiClient.post('/users/preferences', preferences);
    return data;
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
};



