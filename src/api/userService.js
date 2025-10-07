import axiosInstance from './axios';

/**
 * User Services - Frontend API calls for user-related operations
 * This file contains all functions needed to interact with user-related backend endpoints.
 */

// =============================================================================
// SHORTLIST FUNCTIONS
// =============================================================================

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

export const getShortlistCount = async (authId) => {
  try {
    const response = await axiosInstance.get(`/users/shortlist/count/${authId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching shortlist count:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// =============================================================================
// USER PROFILE FUNCTIONS
// =============================================================================

// Fetch user profile by authId
export const getUserProfile = async (authId) => {
  try {
    const response = await axiosInstance.get(`/users/${authId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Create student profile
export const createStudentProfile = async (profileData) => {
  try {
    const response = await axiosInstance.post('/users/add', profileData);
    return response.data;
  } catch (error) {
    console.error("Error creating student profile:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Update student profile by authId
export const updateUserProfile = async (authId, profileData) => {
  try {
    // Try with the standard endpoint first
    const response = await axiosInstance.put(`/users/${authId}`, profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile (standard endpoint):", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    
    // Try with the update endpoint
    try {
      const response = await axiosInstance.put(`/users/update/${authId}`, profileData);
      return response.data;
    } catch (updateError) {
      console.error("Error with update endpoint:", {
        status: updateError.response?.status,
        statusText: updateError.response?.statusText,
        data: updateError.response?.data,
        message: updateError.message,
        config: {
          url: updateError.config?.url,
          method: updateError.config?.method,
          data: updateError.config?.data
        }
      });
      
      // As a last resort, try with the full path
      try {
        const response = await axiosInstance.put(`/api/users/${authId}`, profileData);
        return response.data;
      } catch (finalError) {
        console.error("All update attempts failed:", {
          status: finalError.response?.status,
          statusText: finalError.response?.statusText,
          data: finalError.response?.data,
          message: finalError.message,
          config: {
            url: finalError.config?.url,
            method: finalError.config?.method,
            data: finalError.config?.data
          }
        });
        
        throw new Error(finalError.response?.data?.message || 'Failed to update profile. Please try again.');
      }
    }
  }
};

// =============================================================================
// USER PREFERENCES FUNCTIONS
// =============================================================================

export const getUserPreferences = async (studentId) => {
  try {
    const response = await axiosInstance.get(`/users/preferences/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user preferences:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const createUserPreferences = async (preferenceData) => {
  try {
    const response = await axiosInstance.post('/users/preferences/', preferenceData);
    return response.data;
  } catch (error) {
    console.error("Error creating user preferences:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateUserPreferences = async (studentId, preferenceData) => {
  try {
    const response = await axiosInstance.put(`/users/preferences/${studentId}`, preferenceData);
    return response.data;
  } catch (error) {
    console.error("Error updating user preferences:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const saveUserPreferences = async (studentId, preferenceData) => {
  if (!studentId) throw new Error("Student ID is required to save preferences");

  try {
    // Try updating first
    const response = await axiosInstance.put(`/users/preferences/${studentId}`, preferenceData);
    return response.data;
  } catch (updateError) {
    // If update fails with 404 or 400, create new preferences
    if (updateError.response?.status === 404 || updateError.response?.status === 400) {
      const response = await axiosInstance.post('/users/preferences/', { ...preferenceData, studentId });
      return response.data;
    }
    throw updateError;
  }
};

// =============================================================================
// STUDENT APPLICATION FUNCTIONS
// =============================================================================

export const submitApplication = async (applicationData) => {
  try {
    const response = await axiosInstance.post('/applications/', applicationData);
    return response.data;
  } catch (error) {
    console.error("Error submitting application:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getApplication = async (studId) => {
  try {
    const response = await axiosInstance.get(`/applications/${studId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return { data: null, status: 'Not Found' };
    console.error("Error fetching application:", error.response?.data || error.message);
    throw error;
  }
};

// =============================================================================
// PDF AND DOCUMENT FUNCTIONS
// =============================================================================

export const generateStudentPdf = async (studId) => {
  try {
    const response = await axiosInstance.post(`/users/pdf/generate/${studId}`);
    return response.data;
  } catch (error) {
    console.error("Error generating PDF:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// =============================================================================
// FORMS FUNCTIONS
// =============================================================================

export const getFormsByStudent = async (studId) => {
  try {
    const response = await axiosInstance.get(`/form/student/${studId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching forms by student:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
