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

// Get count of shortlisted schools for a user
export const getShortlistCount = async (authId) => {
  try {
    const response = await axiosInstance.get(`/users/shortlist/count/${authId}`);
    return response.data; // expect a number or { count }
  } catch (error) {
    console.error("Error fetching shortlist count:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

//<==================================================================================>
// import axiosInstance from './axios';

// 1. GET User Profile (Used in AuthContext to check if profile exists)
// This function calls the "getStudent" controller on your backend.
export const getUserProfile = async (authId) => {
  try {
    const response = await axiosInstance.get(`/users/${authId}`);
    return response.data; // The backend wraps data in a "data" property
  } catch (error) {
    console.error("Error fetching user profile:", error.response?.data || error.message);
    throw error; // Throw error so AuthContext can catch it
  }
};


// 2. CREATE Student Profile (Used by CreateProfilePage.jsx)
// This function calls the "addStudent" controller on your backend.
export const createStudentProfile = async (profileData) => {
  try {
    // THIS IS THE CORRECTED LINE:
    const response = await axiosInstance.post('/users/', profileData); 
    return response.data;
  } catch (error) {
    console.error("Error creating user profile:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};


// 3. UPDATE User Profile (Used by UserDashboard.jsx)
// This function calls the "updateStudent" controller on your backend.
export const updateUserProfile = async (authId, profileData) => {
  try {
    // align with backend route: PUT /users/:authId
    const response = await axiosInstance.put(`/users/${authId}`, profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// --- You can keep your other service functions below ---
//<==================================================================================>


// --- User Profile & Preferences Functions ---
// export const getUserProfile = async (authId) => {
//   try {
//     const response = await axiosInstance.get(`/users/${authId}`);
//     return response; 
//   } catch (error) {
//     console.error("Error fetching user profile:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// export const updateUserProfile = async (userId, profileData) => { // Add userId here
// try {
//     // Change .post to .put and add userId to the URL
//  const response = await axiosInstance.put(`/users/${userId}`, profileData);
//  return response;
// } catch (error) {
//  console.error("Error updating user profile:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };


// Preferences API aligned to backend routes
export const getUserPreferences = async (studentId) => {
  try {
    const response = await axiosInstance.get(`/users/preferences/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user preferences:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// / Create preference (first time)
export const createUserPreferences = async (preferenceData) => {
  try {
    const response = await axiosInstance.post('/users/preferences/', preferenceData);
    return response.data;
  } catch (error) {
    console.error("Error creating user preferences:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
// Update preference (if exists)
export const updateUserPreferences = async (studentId, preferenceData) => {
  try {
    const response = await axiosInstance.put(`/users/preferences/${studentId}`, preferenceData);
    return response.data;
  } catch (error) {
    console.error("Error updating user preferences:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Save preference (new or existing)
// export const saveUserPreferences = async (studentId, preferenceData) => {
//   try {
//     // For new user, create first using POST; backend has POST /users/preferences/
//     const response = await axiosInstance.post(`/users/preferences/`, preferenceData);
//     return response.data;
//   } catch (error) {
//     console.error("Error saving user preferences:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// export const saveUserPreferences = async (studentId, preferenceData) => {
//   try {
//     if (!studentId) {
//       // No ID yet → create new
//       const response = await axiosInstance.post('/users/preferences/', preferenceData);
//       return response.data;
//     } else {
//       // Existing student → update instead
//       const response = await axiosInstance.put(`/users/preferences/${studentId}`, preferenceData);
//       return response.data;
//     }
//   } catch (error) {
//     console.error("Error saving user preferences:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };
export const saveUserPreferences = async (studentId, preferenceData) => {
  try {
    if (!studentId) {
      throw new Error("Student ID is required to save preferences");
    }
    
    // First try to update existing preferences
    try {
      const response = await axiosInstance.put(
        `/users/preferences/${studentId}`, 
        preferenceData
      );
      return response.data;
    } catch (updateError) {
      // If update fails with 404 or 400, try creating new preferences
      if (updateError.response?.status === 404 || updateError.response?.status === 400) {
        const response = await axiosInstance.post(
          '/users/preferences/', 
          { ...preferenceData, studentId }
        );
        return response.data;
      }
      // Re-throw if it's not a 404 or 400 error
      throw updateError;
    }
  } catch (error) {
    console.error("Error saving preferences:", {
      error: error.response?.data || error.message,
      studentId,
      preferenceData
    });
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

// export const getApplication = async (studId) => {
//   try {
//     const response = await axiosInstance.get(`/applications/${studId}`);
//     return response;
//   } catch (error) { 
//     console.error("Error fetching application:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };
export const getApplication = async (studId) => {
  try {
    const response = await axiosInstance.get(`/applications/${studId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Return null or empty data structure instead of throwing
      return { data: null, status: 'Not Found' };
    }
    console.error("Error fetching application:", {
      error: error.response?.data || error.message,
      studId
    });
    throw error;
  }
};


// --- Student PDF ---
export const generateStudentPdf = async (studId) => {
  try {
    const response = await axiosInstance.post(`/users/pdf/generate/${studId}`);
    return response.data;
  } catch (error) {
    console.error("Error generating PDF:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// --- Forms (Applications) by Student ---
export const getFormsByStudent = async (studId) => {
  try {
    const response = await axiosInstance.get(`/form/student/${studId}`);
    return response.data; // expects { data: [...] } with schoolId populated (name)
  } catch (error) {
    console.error("Error fetching forms by student:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};



