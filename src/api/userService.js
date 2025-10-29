import apiClient from './axios';

/**
 * User Services - Frontend API calls for user-related operations
 * This file contains all functions needed to interact with user-related backend endpoints.
 */

// =============================================================================
// SHORTLIST FUNCTIONS
// =============================================================================

export const getShortlist = async (authId) => {
  try {
    const response = await apiClient.get(`users/shortlist/${authId}`);
    return response.data;
  } catch (error) {
    // Handle "Student not found" error gracefully
    if (error.response?.status === 400 && 
        (error.response?.data?.message === "Student not found" || 
         error.response?.data?.message === "Student Not Found")) {
      console.log("Student profile not found, returning empty shortlist");
      return { data: [] };
    }
    console.error("Error fetching shortlist:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const addToShortlist = async (authId, schoolId) => {
  try {
    const response = await apiClient.post('/api/users/shortlist', { authId, schoolId });
    return response.data;
  } catch (error) {
    console.error("Error adding to shortlist:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const removeFromShortlist = async (authId, schoolId) => {
  try {
    const response = await apiClient.post('/api/users/shortlist/remove', { authId, schoolId });
    return response.data;
  } catch (error) {
    console.error("Error removing from shortlist:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getShortlistCount = async (authId) => {
  try {
    const response = await apiClient.get(`/api/users/shortlist/count/${authId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching shortlist count:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// =============================================================================
// USER PROFILE FUNCTIONS
// =============================================================================

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const response = await apiClient.get('/auth/health');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Fetch user profile by authId
export const getUserProfile = async (authId) => {
  // Only valid backend paths: /api/users/:authId mounted via axios base /api prefix
  try {
    const response = await apiClient.get(`/users/${authId}`);
    const userData = response.data?.data || response.data;
    if (userData && (userData._id || userData.id)) return { data: userData };
    return { data: null };
  } catch (error) {
    // 400 -> Student Not Found (not an error for UI; means no profile yet)
    if (error.response?.status === 400) {
      console.log('Student profile not found for authId:', authId);
      return { data: null, status: 'Not Found' };
    }
    // 404 -> endpoint not found should be rare; surface friendly message
    if (error.response?.status === 404) {
      console.log('User endpoint not found for authId:', authId);
      return { data: null, status: 'Not Found' };
    }
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error;
  }
};

// Create student profile
export const createStudentProfile = async (profileData) => {
  try {
    console.log(`🔄 Creating student profile with data:`, profileData);
    
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('User not authenticated. Please log in first.');
    }
    
    const response = await apiClient.post('/users/', profileData);
    console.log(`✅ User profile created successfully`);
    return response.data;
  } catch (error) {
    console.error("Error creating student profile:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    // Provide more specific error messages
    if (error.response?.status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('API endpoint not found. Please check if the backend server is running.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid data provided.');
    } else {
      throw error.response?.data || error;
    }
  }
};

// Update student profile by authId
export const updateUserProfile = async (authId, profileData) => {
  try {
    // Try with the standard endpoint first
    const response = await apiClient.put(`/users/${authId}`, profileData);
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
      const response = await apiClient.put(`/api/users/update/${authId}`, profileData);
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
        const response = await apiClient.put(`/api/users/${authId}`, profileData);
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

// USER PREFERENCES FUNCTIONS
export const getUserPreferences = async (studentId) => {
  try {
    const response = await apiClient.get(`/users/preferences/${studentId}`);
    return response.data;
  } catch (error) {
    // Handle "Preference not found" error gracefully
    if (error.response?.status === 400 && 
        (error.response?.data?.message === "Preference not found" || 
         error.response?.data?.message === "Preference Not Found")) {
      console.log("No preferences found for studentId:", studentId);
      return { data: null, status: 'Not Found' };
    }
    console.error("Error fetching user preferences:", error);
    throw error;
  }
};

export const createUserPreferences = async (preferenceData) => {
  try {
    const response = await apiClient.post(`/users/preferences/`, preferenceData);
    return response.data;
  } catch (error) {
    console.error("Error creating user preferences:", error);
    throw error;
  }
};

export const updateUserPreferences = async (studentId, preferenceData) => {
  try {
    const response = await apiClient.put(`/users/preferences/${studentId}`, preferenceData);
    return response.data;
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};

export const saveUserPreferences = async (studentId, preferenceData) => {
  if (!studentId) throw new Error("Student ID is required to save preferences");

  try {
    // Try updating first
    const response = await apiClient.put(`/users/preferences/${studentId}`, preferenceData);
    return response.data;
  } catch (updateError) {
    // If update fails with 404 or 400, create new preferences
    if (updateError.response?.status === 404 || updateError.response?.status === 400) {
      const response = await apiClient.post('/users/preferences/', { ...preferenceData, studentId });
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
    const response = await apiClient.post('/api/applications/', applicationData);
    return response.data;
  } catch (error) {
    console.error("Error submitting application:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getApplication = async (studId) => {
  try {
    const response = await apiClient.get(`/api/applications/${studId}`);
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
    const response = await apiClient.post(`/api/users/pdf/generate/${studId}`);
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
  console.log(`🔍 Fetching forms for student: ${studId}`);
  
  // Try multiple known endpoints and normalize into an array of applications
  const candidates = [
    `/form/student/${studId}`,        // some deployments
    `/applications/${studId}`,        // application-routes get by student
    `/forms/student/${studId}`,       // alternate plural path
    `/users/forms/${studId}`,         // users namespaced
    `/form/${studId}`                 // fallback legacy
  ];

  let all = [];
  let lastErr = null;
  for (const path of candidates) {
    try {
      console.log(`🔍 Trying endpoint: ${path}`);
      const res = await apiClient.get(path, { headers: { 'X-Silent-Request': '1' } });
      const raw = res?.data;
      console.log(`✅ Response from ${path}:`, raw);

      // If the endpoint returns a single object, wrap it
      const normalizedArray = Array.isArray(raw)
        ? raw
        : (Array.isArray(raw?.data) ? raw.data
          : Array.isArray(raw?.data?.forms) ? raw.data.forms
          : Array.isArray(raw?.forms) ? raw.forms
          : (raw && typeof raw === 'object') ? [raw?.data || raw] : []);

      // Merge and dedupe; be careful not to collapse distinct items lacking strong ids
      const map = new Map();
      [...all, ...normalizedArray].forEach((item, idx) => {
        const schoolKey = (typeof item?.schoolId === 'object' ? (item?.schoolId?._id || item?.schoolId?.id) : item?.schoolId) || item?.school || 'unknown';
        const timeKey = item?.createdAt || item?.updatedAt || '';
        const fallbackKey = `${schoolKey}-${timeKey}-${idx}`;
        const key = item?._id || item?.id || fallbackKey;
        map.set(String(key), item);
      });
      all = Array.from(map.values());
    } catch (e) {
      lastErr = e;
    }
  }

  if (!all.length && lastErr) {
    // Surface last error only if no data from any endpoint
    console.error('Error fetching forms by student:', lastErr.response?.data || lastErr.message);
  }
  
  console.log(`📊 Final result: Found ${all.length} forms for student ${studId}:`, all);
  return { data: all };
};
