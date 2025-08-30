import axiosInstance from './axios';

// --- Shortlist Functions ---
export const getShortlist = async (authId) => {
  try {
    const response = await axiosInstance.get(`/users/shortlist/${authId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching shortlist:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const addToShortlist = async (authId, schoolId) => {
  try {
    const response = await axiosInstance.post('/users/shortlist', { authId, schoolId });
    return response.data;
  } catch (error) {
    console.error("Error adding to shortlist:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const removeFromShortlist = async (authId, schoolId) => {
  try {
    const response = await axiosInstance.post('/users/shortlist/remove', { authId, schoolId });
    return response.data;
  } catch (error) {
    console.error("Error removing from shortlist:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// --- User Profile & Preferences Functions ---
export const getUserProfile = async (authId) => {
  try {
    const response = await axiosInstance.get(`/users/${authId}`);
    return response; 
  } catch (error) {
    console.error("Error fetching user profile:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.post('/users/', profileData);
    return response;
  } catch (error) {
    console.error("Error updating user profile:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateUserPreferences = async (preferenceData) => {
    try {
        const response = await axiosInstance.post('/users/preferences/', preferenceData);
        return response;
    } catch (error) {
        console.error("Error updating user preferences:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// --- Student Application Functions ---
export const submitApplication = async (applicationData) => {
  try {
    const response = await axiosInstance.post('/applications/', applicationData);
    return response;
  } catch (error) {
    console.error("Error submitting application:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getApplication = async (studId) => {
  try {
    const response = await axiosInstance.get(`/applications/${studId}`);
    return response;
  } catch (error) { 
    console.error("Error fetching application:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};