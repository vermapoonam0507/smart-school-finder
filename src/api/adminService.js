// src/api/adminService.js
import apiClient from './axios';

/**
 * Admin authentication service
 * Handles admin-specific API calls
 */

/**
 * Register a new admin user
 */
export const registerAdmin = async (adminData) => {
  try {
    return await apiClient.post('/admin/auth/register', {
      ...adminData,
      userType: 'admin'
    });
  } catch (error) {
    // Fallback if endpoint does not exist
    if (error?.response?.status === 404) {
      return apiClient.post('/auth/register', { ...adminData, userType: 'admin' });
    }
    throw error;
  }
};

/**
 * Login admin user
 */
export const loginAdmin = async (credentials) => {
  try {
    return await apiClient.post('/admin/auth/login', { ...credentials, userType: 'admin' });
  } catch (error) {
    if (error?.response?.status === 404) {
      return apiClient.post('/auth/login', { ...credentials, userType: 'admin' });
    }
    throw error;
  }
};

/**
 * Get admin dashboard stats
 */
export const getAdminStats = () => apiClient.get('/admin/stats');

/**
 * School CRUD and admin operations
 */
export const addSchool = (data) => apiClient.post('/admin/schools/', data);
export const addAmenities = (data) => apiClient.post('/admin/schools/amenities/', data);
export const addActivities = (data) => apiClient.post('/admin/schools/activities/', data);
export const addAlumni = (data) => apiClient.post('/admin/alumnus', data);
export const addInfrastructure = (data) => apiClient.post('/admin/schools/infrastructure/', data);
export const addOtherDetails = (data) => apiClient.post('/admin/schools/other-details/', data);
export const addFeesAndScholarships = (data) => apiClient.post('/admin/schools/fees-scholarships/', data);
export const addAcademics = (data) => apiClient.post('/admin/schools/academics/', data);
export const addFaculty = (data) => apiClient.post('/admin/schools/faculty/', data);
export const getFacultyById = (schoolId) => apiClient.get(`/admin/schools/faculty/${encodeURIComponent(schoolId)}`);
export const updateFaculty = (schoolId, data) => apiClient.put(`/admin/schools/faculty/${encodeURIComponent(schoolId)}`, data);

export const addAdmissionTimeline = (data) => apiClient.post('/admin/schools/admission-timeline/', data);
export const getAdmissionTimelineById = (schoolId) => apiClient.get(`/admin/schools/admission-timeline/${encodeURIComponent(schoolId)}`);
export const updateAdmissionTimeline = (schoolId, data) => apiClient.put(`/admin/schools/admission-timeline/${encodeURIComponent(schoolId)}`, data);

export const addTechnologyAdoption = (data) => apiClient.post('/admin/schools/technology-adoption/', data);
export const getTechnologyAdoptionById = (schoolId) => apiClient.get(`/admin/schools/technology-adoption/${encodeURIComponent(schoolId)}`);
export const updateTechnologyAdoption = (schoolId, data) => apiClient.put(`/admin/schools/technology-adoption/${encodeURIComponent(schoolId)}`, data);

export const addSafetyAndSecurity = (data) => apiClient.post('/admin/schools/safety-security/', data);
export const getSafetyAndSecurityById = (schoolId) => apiClient.get(`/admin/schools/safety-security/${encodeURIComponent(schoolId)}`);
export const updateSafetyAndSecurity = (schoolId, data) => apiClient.put(`/admin/schools/safety-security/${encodeURIComponent(schoolId)}`, data);

export const addInternationalExposure = (data) => apiClient.post('/admin/schools/international-exposure/', data);
export const getInternationalExposureById = (schoolId) => apiClient.get(`/admin/schools/international-exposure/${encodeURIComponent(schoolId)}`);
export const updateInternationalExposure = (schoolId, data) => apiClient.put(`/admin/schools/international-exposure/${encodeURIComponent(schoolId)}`, data);

/**
 * Get users and schools
 */
export const getAllUsers = () => {
  return apiClient.get('/admin/users');
};
export const getAllSchools = () => {
  return apiClient.get('/admin/schools/status/all');
};
export const getPendingSchools = () => {
  return apiClient.get('/schools/admin/pending');
};
export const getSchoolsByStatus = async (status) => {
  return apiClient.get(`/admin/schools/status/${encodeURIComponent(status)}`);
};
//export const getAllUsers = () => apiClient.get('/admin/users');
//export const getAllSchools = () => apiClient.get('/admin/schools/status/all');
//export const getPendingSchools = () => apiClient.get('/schools/admin/pending');
//export const getSchoolsByStatus = async (status) => {
  // fallback paths to support multiple backend endpoints
  // const candidates = [
  //   `/admin/schools/status/${status}`,
  //   `/admin/schools/${status}`,
  //   `/schools/status/${status}`,
  //   `/schools/${status}`,
  // ];
  // let lastError;
  // for (const path of candidates) {
  //   try {
  //     return await apiClient.get(path);
  //   } catch (error) {
  //     if (error?.response?.status !== 404) throw error;
  //     lastError = error;
  //   }
  // }
  // throw lastError;
//};
export const getSchoolById = (schoolId) =>
  apiClient.get(`/admin/schools/${encodeURIComponent(schoolId)}`);

/**
 * Update status and info
 */
export const updateUserStatus = (userId, statusData) =>
  apiClient.patch(`/admin/users/${userId}/status`, statusData);

export const updateSchoolStatus = async (schoolId, newStatus) =>
  apiClient.patch(`/schools/admin/${encodeURIComponent(schoolId)}/status`, { status: newStatus });

export const updateSchoolInfo = (schoolId, data) =>
  apiClient.put(`/admin/schools/${encodeURIComponent(schoolId)}`, data);

/**
 * Media APIs
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
 * Check if a school profile exists
 */
export const checkSchoolProfileExists = (authId) => getSchoolById(authId);

/**
 * Delete user or school
 */
export const deleteUser = (userId) => apiClient.delete(`/admin/users/${userId}`);
export const deleteSchool = (schoolId) => apiClient.delete(`/admin/schools/${schoolId}`);

/**
 * Admin profile
 */
export const getAdminProfile = () => apiClient.get('/admin/profile');
export const updateAdminProfile = (profileData) => apiClient.patch('/admin/profile', profileData);
export const changeAdminPassword = (passwordData) =>
  apiClient.patch('/admin/change-password', passwordData);

/**
 * Get amenities & activities by school
 */
export const getAmenitiesById = (schoolId) => apiClient.get(`/admin/schools/amenities/${encodeURIComponent(schoolId)}`);
export const getActivitiesById = (schoolId) => apiClient.get(`/admin/schools/activities/${encodeURIComponent(schoolId)}`);
export const getInfrastructureById = (schoolId) => apiClient.get(`/admin/schools/infrastructure/${encodeURIComponent(schoolId)}`);
export const getFeesAndScholarshipsById = (schoolId) => apiClient.get(`/admin/schools/fees-scholarships/${encodeURIComponent(schoolId)}`);
export const getAcademicsById = (schoolId) => apiClient.get(`/admin/schools/academics/${encodeURIComponent(schoolId)}`);
export const getOtherDetailsById = (schoolId) => apiClient.get(`/admin/schools/other-details/${encodeURIComponent(schoolId)}`);
