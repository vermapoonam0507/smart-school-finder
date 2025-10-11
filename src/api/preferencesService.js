// API service for user preferences
import apiClient from './axios';

export const getUserPreferences = async () => {
  try {
    const { data } = await apiClient.get(`/preferences/${studId}`);
    return data;
  } catch (error) {
    // Silently fall back to defaults in the UI without noisy logs
    return null;
  }
};

export const saveUserPreferences = async (preferences) => {
  try {
    const { data } = await apiClient.get(`/preferences/${studId}`);
    return data;
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
};
