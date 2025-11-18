// src/api/adminService.js
import apiClient from './axios';

/**
 * ============================
 * Admin Authentication
 * ============================
 */

// Register admin
export const registerAdmin = async (adminData) => {
  // Use regular auth register with school userType (since admin is registered as school)
  return await apiClient.post('/auth/register', { ...adminData, userType: 'school' });
};

// Login admin
export const loginAdmin = async (credentials) => {
  // Use the special admin login endpoint that checks against .env variables
  return await apiClient.post('/admin/admin-login', credentials);
};

/**
 * ============================l-f
 * Dashboard & User Management
 * ============================
 */

export const getAdminStats = () => apiClient.get('/admin/stats');
export const getAllUsers = () => apiClient.get('/admin/users');

/**
 * ============================
 * APPLICATION FLOW FUNCTIONS
 * ============================
 */

// Check if application exists for student
export const checkApplicationExists = (studId) => apiClient.get(`/applications/${studId}`);

// Create new application
export const createApplication = (data) => apiClient.post('/applications/', data);

// Get application by student ID
export const getApplicationByStudentId = (studId) => apiClient.get(`/applications/${studId}`);

// Update application
export const updateApplication = (studId, data) => apiClient.put(`/applications/${studId}`, data);

// Delete application
export const deleteApplication = (studId) => apiClient.delete(`/applications/${studId}`);

// Submit form to school
export const submitFormToSchool = (schoolId, studId, formId) => 
  apiClient.post(`/form/${schoolId}/${studId}/${formId}`);

// Get forms by student
export const getFormsByStudent = (studId) => apiClient.get(`/form/student/${studId}`);

// Get forms by school
export const getFormsBySchool = (schoolId) => apiClient.get(`/form/school/${schoolId}`);

// Track form
export const trackForm = (formId) => apiClient.get(`/form/track/${formId}`);

// Update form status
export const updateFormStatus = (formId, status) => 
  apiClient.put(`/form/${formId}?status=${status}`);

/**
 * ============================
 * ENHANCED APPLICATION FLOW
 * ============================
 */

// Handle complete application flow with scenarios
export const handleApplicationFlow = (studId, schoolId, applicationData = null) => {
  return apiClient.post('/api/application-flow', {
    studId,
    schoolId,
    applicationData
  });
};

// Update existing application (Scenario C)
export const updateExistingApplication = (studId, updateData) => {
  return apiClient.put(`/applications/${studId}`, updateData);
};

/**
 * ============================
 * School CRUD Operations
 * ============================
 */

export const addSchool = (data) => apiClient.post('/admin/schools/', data);
export const addAmenities = (data) => apiClient.post('/admin/schools/amenities/', data);
export const addActivities = (data) => apiClient.post('/admin/schools/activities/', data);
export const addAlumni = (data) => apiClient.post('/admin/alumnus', data);
export const addInfrastructure = (data) => apiClient.post('/admin/schools/infrastructure/', data);
export const addOtherDetails = (data) => apiClient.post('/admin/schools/other-details/', data);
export const addFeesAndScholarships = (data) =>
  apiClient.post('/admin/schools/fees-scholarships/', data);
export const addAcademics = (data) => apiClient.post('/admin/schools/academics/', data);
export const addFaculty = (data) => apiClient.post('/admin/schools/faculty/', data);

export const addAdmissionTimeline = (data) =>
  apiClient.post('/admin/schools/admission-timeline/', data);
export const addTechnologyAdoption = (data) =>
  apiClient.post('/admin/schools/technology-adoption/', data);
export const addSafetyAndSecurity = (data) =>
  apiClient.post('/admin/schools/safety-security/', data);
export const addInternationalExposure = (data) =>
  apiClient.post('/admin/schools/international-exposure/', data);

/**
 * ============================
 * Get / Update School Info
 * ============================
 */

export const getSchoolById = (schoolId, config) =>
  apiClient.get(`/admin/schools/${encodeURIComponent(schoolId)}`, config);

export const updateSchoolInfo = (schoolId, data) =>
  apiClient.put(`/admin/schools/${encodeURIComponent(schoolId)}`, data);

export const updateSchoolStatus = (schoolId, newStatus) =>
  apiClient.put(`/admin/schools/${encodeURIComponent(schoolId)}`, { status: newStatus });

export const getSchoolsByStatus = async (status) => {
  try {
    return await apiClient.get(`/admin/schools/status/${encodeURIComponent(status)}`);
  } catch (error) {
    const message = error?.response?.data?.message || '';
    if (error?.response?.status === 500 && message.includes('No schools found with status')) {
      return {
        data: {
          data: [],
          message,
          status: 'success'
        }
      };
    }
    throw error;
  }
};

export const getAllSchools = () => apiClient.get('/admin/schools/status/all');
export const getPendingSchools = async () => {
  const candidates = [
    '/admin/schools/admin/pending',
    '/admin/schools/pending',
    '/admin/schools/status/pending',
  ];
  let lastErr;
  for (const path of candidates) {
    try {
      const res = await apiClient.get(path, { headers: { 'X-Silent-Request': '1' } });
      return res;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Failed to fetch pending schools');
};

/**
 * ============================
 * Faculty, Admission, and Tech
 * ============================
 */

export const getFacultyById = (schoolId) =>
  apiClient.get(`/admin/schools/faculty/${encodeURIComponent(schoolId)}`);
export const updateFaculty = (schoolId, data) =>
  apiClient.put(`/admin/schools/faculty/${encodeURIComponent(schoolId)}`, data);

export const getAdmissionTimelineById = async (schoolId) => {
  try {
    return await apiClient.get(`/admin/schools/admission-timeline/${encodeURIComponent(schoolId)}`, {
      headers: { 'X-Silent-Request': '1' }
    });
  } catch (e) {
    if (e?.response?.status === 404) return { data: null };
    throw e;
  }
};
export const updateAdmissionTimeline = (schoolId, data) =>
  apiClient.put(`/admin/schools/admission-timeline/${encodeURIComponent(schoolId)}`, data);

export const getTechnologyAdoptionById = (schoolId) =>
  apiClient.get(`/admin/schools/technology-adoption/${encodeURIComponent(schoolId)}`);
export const updateTechnologyAdoption = (schoolId, data) =>
  apiClient.put(`/admin/schools/technology-adoption/${encodeURIComponent(schoolId)}`, data);

export const getSafetyAndSecurityById = (schoolId) =>
  apiClient.get(`/admin/schools/safety-security/${encodeURIComponent(schoolId)}`);
export const updateSafetyAndSecurity = (schoolId, data) =>
  apiClient.put(`/admin/schools/safety-security/${encodeURIComponent(schoolId)}`, data);

export const getInternationalExposureById = async (schoolId) => {
  try {
    return await apiClient.get(`/admin/schools/international-exposure/${encodeURIComponent(schoolId)}`, {
      headers: { 'X-Silent-Request': '1' }
    });
  } catch (e) {
    if (e?.response?.status === 404) return { data: null };
    throw e;
  }
};
export const updateInternationalExposure = (schoolId, data) =>
  apiClient.put(`/admin/schools/international-exposure/${encodeURIComponent(schoolId)}`, data);

/**
 * ============================
 * Media (Photos & Videos)
 * ============================
 */

export const getSchoolPhotos = (schoolId) =>
  apiClient.get(`/admin/${encodeURIComponent(schoolId)}/photos`);
export const getSchoolVideos = (schoolId) =>
  apiClient.get(`/admin/${encodeURIComponent(schoolId)}/videos`);

export const uploadSchoolPhotos = (schoolId, files) => {
  const formData = new FormData();
  Array.from(files).forEach((f) => formData.append('files', f));
  return apiClient.post(`/admin/${encodeURIComponent(schoolId)}/upload/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadSchoolVideo = (schoolId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/admin/${encodeURIComponent(schoolId)}/upload/video`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteSchoolPhoto = (schoolId, publicId) =>
  apiClient.delete(`/admin/${encodeURIComponent(schoolId)}/photo/${encodeURIComponent(publicId)}`);
export const deleteSchoolVideo = (schoolId, publicId) =>
  apiClient.delete(`/admin/${encodeURIComponent(schoolId)}/video/${encodeURIComponent(publicId)}`);

/**
 * ============================
 * Admin Profile & Password
 * ============================
 */

export const getAdminProfile = () => apiClient.get('/admin/profile');
export const updateAdminProfile = (profileData) =>
  apiClient.patch('/admin/profile', profileData);
export const changeAdminPassword = (passwordData) =>
  apiClient.patch('/admin/change-password', passwordData);

/**
 * ============================
 * Delete & Validation
 * ============================
 */

export const deleteUser = (userId) => apiClient.delete(`/admin/users/${userId}`);
export const deleteSchool = (schoolId) => apiClient.delete(`/admin/schools/${schoolId}`);

// More resilient existence check that won't crash the UI if the id isn't a school id
export const getSchoolByAuthId = async (authId) => {
  if (!authId) return { data: null };
  try {
    console.log(`🔍 Finding school by authId: ${authId}`);
    const res = await apiClient.get(`/admin/schools/by-auth/${encodeURIComponent(authId)}`, {
      headers: { 'X-Silent-Request': '1' }
    });
    console.log(`✅ Found school by authId:`, res?.data);
    return res;
  } catch (error) {
    const status = error?.response?.status;
    console.warn(`⚠️ School not found for authId ${authId}, status: ${status}`);
    if (status === 404 || status === 400 || status === 500) {
      return { data: null };
    }
    throw error;
  }
};

export const checkSchoolProfileExists = async (authId) => {
  if (!authId) return { data: null };
  try {
    const res = await getSchoolById(authId, { headers: { 'X-Silent-Request': '1' } });
    return res;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404 || status === 400 || status === 500) {
      // Treat as non-existent rather than throwing to callers
      return { data: null };
    }
    throw error;
  }
};

/**
 * ============================
 * School Sub-Data Retrieval
 * ============================
 */

export const getAmenitiesById = (schoolId) =>
  apiClient.get(`/admin/schools/amenities/${encodeURIComponent(schoolId)}`);
export const getActivitiesById = (schoolId) =>
  apiClient.get(`/admin/schools/activities/${encodeURIComponent(schoolId)}`);
export const getInfrastructureById = (schoolId) =>
  apiClient.get(`/admin/schools/infrastructure/${encodeURIComponent(schoolId)}`);
export const getFeesAndScholarshipsById = (schoolId) =>
  apiClient.get(`/admin/schools/fees-scholarships/${encodeURIComponent(schoolId)}`);
export const getAcademicsById = (schoolId) =>
  apiClient.get(`/admin/schools/academics/${encodeURIComponent(schoolId)}`);
export const updateAcademics = (schoolId, data) =>
  apiClient.put(`/admin/schools/academics/${encodeURIComponent(schoolId)}`, data);
export const getOtherDetailsById = (schoolId) =>
  apiClient.get(`/admin/schools/other-details/${encodeURIComponent(schoolId)}`);

// Update endpoints for sub-resources (used during edit mode to avoid duplicate key errors)
export const updateAmenities = (schoolId, data) =>
  apiClient.put(`/admin/schools/amenities/${encodeURIComponent(schoolId)}`, data);
export const updateActivities = (schoolId, data) =>
  apiClient.put(`/admin/schools/activities/${encodeURIComponent(schoolId)}`, data);
export const updateInfrastructure = (schoolId, data) =>
  apiClient.put(`/admin/schools/infrastructure/${encodeURIComponent(schoolId)}`, data);
export const updateFeesAndScholarshipsById = (schoolId, data) =>
  apiClient.put(`/admin/schools/fees-scholarships/${encodeURIComponent(schoolId)}`, data);
export const updateOtherDetailsById = (schoolId, data) =>
  apiClient.put(`/admin/schools/other-details/${encodeURIComponent(schoolId)}`, data);

/**
 * ============================
 * Student Applications
 * ============================
 */

export const getStudentApplicationsBySchool = (schoolId) =>
  apiClient.get(`/applications?schoolId=${encodeURIComponent(schoolId)}`);

export const getStudentApplicationsBySchoolEmail = (schoolEmail) =>
  apiClient.get(`/applications?schoolEmail=${encodeURIComponent(schoolEmail)}`);

export const getAllStudentApplications = () =>
  apiClient.get('/applications');