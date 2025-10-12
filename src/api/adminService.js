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
 * ============================
 * Dashboard & User Management
 * ============================
 */

export const getAdminStats = () => apiClient.get('/admin/stats');
export const getAllUsers = () => apiClient.get('/admin/users');

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

export const getSchoolById = (schoolId) =>
  apiClient.get(`/admin/schools/${encodeURIComponent(schoolId)}`);

export const updateSchoolInfo = (schoolId, data) =>
  apiClient.put(`/admin/schools/${encodeURIComponent(schoolId)}`, data);

export const updateSchoolStatus = (schoolId, newStatus) =>
  apiClient.put(`/admin/schools/${encodeURIComponent(schoolId)}`, { status: newStatus });

export const getSchoolsByStatus = (status) =>
  apiClient.get(`/admin/schools/status/${encodeURIComponent(status)}`);

export const getAllSchools = () => apiClient.get('/admin/schools/status/all');
export const getPendingSchools = () => apiClient.get('/admin/schools/admin/pending');

/**
 * ============================
 * Faculty, Admission, and Tech
 * ============================
 */

export const getFacultyById = (schoolId) =>
  apiClient.get(`/admin/schools/faculty/${encodeURIComponent(schoolId)}`);
export const updateFaculty = (schoolId, data) =>
  apiClient.put(`/admin/schools/faculty/${encodeURIComponent(schoolId)}`, data);

export const getAdmissionTimelineById = (schoolId) =>
  apiClient.get(`/schools/admission-timeline/${encodeURIComponent(schoolId)}`);
export const updateAdmissionTimeline = (schoolId, data) =>
  apiClient.put(`/admin/schools/admission-timeline/${encodeURIComponent(schoolId)}`, data);

export const getTechnologyAdoptionById = (schoolId) =>
  apiClient.get(`/admin/schools/technology-adoption/${encodeURIComponent(schoolId)}`);
export const updateTechnologyAdoption = (schoolId, data) =>
  apiClient.put(`/admin/schools/technology-adoption/${encodeURIComponent(schoolId)}`, data);

export const getSafetyAndSecurityById = (schoolId) =>
  apiClient.get(`/schools/safety-security/${encodeURIComponent(schoolId)}`);
export const updateSafetyAndSecurity = (schoolId, data) =>
  apiClient.put(`/admin/schools/safety-security/${encodeURIComponent(schoolId)}`, data);

export const getInternationalExposureById = (schoolId) =>
  apiClient.get(`/admin/schools/international-exposure/${encodeURIComponent(schoolId)}`);
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

export const checkSchoolProfileExists = (authId) => getSchoolById(authId);

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
  apiClient.get(`/schools/infrastructure/${encodeURIComponent(schoolId)}`);
export const getFeesAndScholarshipsById = (schoolId) =>
  apiClient.get(`/schools/fees-scholarships/${encodeURIComponent(schoolId)}`);
export const getAcademicsById = (schoolId) =>
  apiClient.get(`/schools/academics/${encodeURIComponent(schoolId)}`);
export const getOtherDetailsById = (schoolId) =>
  apiClient.get(`/admin/schools/other-details/${encodeURIComponent(schoolId)}`);
