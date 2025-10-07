// src/api/adminService.js

import apiClient from './axios';

/**
 * Admin authentication service
 * Handles admin-specific API calls
 */

/**
 * Register a new admin user
 * @param {object} adminData - Admin registration data
 */
export const registerAdmin = (adminData) => {
  return apiClient.post('/auth/register', {
    ...adminData,
    userType: 'admin'
  });
};

/**
 * Login admin user
 * @param {object} credentials - Admin login credentials
 */
export const loginAdmin = (credentials) => {
  return apiClient.post('/auth/login', {
    ...credentials,
    userType: 'admin'
  });
};

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = () => {
  return apiClient.get('/admin/stats');
};

/**
 * Create a new school profile (registration)
 * @param {object} data - School registration data
 */
export const addSchool = (data) => {
  return apiClient.post('/admin/schools/', data);
};

/**
 * Add amenities for a school
 * @param {object} data - Amenities data
 */
export const addAmenities = (data) => {
  return apiClient.post('/admin/schools/amenities/', data);
};

/**
 * Add activities for a school
 * @param {object} data - Activities data
 */
export const addActivities = (data) => {
  return apiClient.post('/admin/schools/activities/', data);
};

/**
 * Add alumni for a school
 * @param {object} data - Alumni data
 */
export const addAlumni = (data) => {
  return apiClient.post('/admin/alumnus', data);
};

/**
 * Add infrastructure for a school
 * @param {object} data - Infrastructure data
 */
export const addInfrastructure = (data) => {
  return apiClient.post('/admin/schools/infrastructure/', data);
};

/**
 * Add other details for a school
 * @param {object} data - Other details data
 */
export const addOtherDetails = (data) => {
  return apiClient.post('/admin/schools/other-details/', data);
};

/**
 * Add fees and scholarships for a school
 * @param {object} data - Fees and scholarships data
 */
export const addFeesAndScholarships = (data) => {
  return apiClient.post('/admin/schools/fees-scholarships/', data);
};

/**
 * Get all users (for admin management)
 */
export const getAllUsers = () => {
  return apiClient.get('/admin/users');
};

/**
 * Get all schools (for admin management)
 */
export const getAllSchools = () => {
  return apiClient.get('/admin/schools/status/all');
};

/**
 * Get schools by status (for admin management)
 * @param {string} status - School status (pending, accepted, rejected)
 */
export const getSchoolsByStatus = (status) => {
  return apiClient.get(`/admin/schools/status/${status}`);
};

/**
 * Get a single school by id
 * @param {string} schoolId
 */
export const getSchoolById = (schoolId) => {
  return apiClient.get(`/admin/schools/${encodeURIComponent(schoolId)}`);
};

/**
 * Update user status (activate/deactivate)
 * @param {string} userId - User ID
 * @param {object} statusData - Status update data
 */
export const updateUserStatus = (userId, statusData) => {
  return apiClient.patch(`/admin/users/${userId}/status`, statusData);
};

/**
 * Update school status (approve/reject)
 * @param {string} schoolId - School ID
 * @param {object} statusData - Status update data
 */
export const updateSchoolStatus = (schoolId, statusData) => {
  return apiClient.put(`/admin/schools/${schoolId}`, statusData);
};

/**
 * Update school info (profile edit)
 * @param {string} schoolId - School ID
 * @param {object} data - School data to update
 */
export const updateSchoolInfo = (schoolId, data) => {
  return apiClient.put(`/admin/schools/${encodeURIComponent(schoolId)}`, data);
};

/** Media APIs for School (photos/videos) */
export const getSchoolPhotos = (schoolId) => {
  return apiClient.get(`/admin/${encodeURIComponent(schoolId)}/photos`);
};

export const getSchoolVideos = (schoolId) => {
  return apiClient.get(`/admin/${encodeURIComponent(schoolId)}/videos`);
};

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

export const deleteSchoolPhoto = (schoolId, publicId) => {
  return apiClient.delete(`/admin/${encodeURIComponent(schoolId)}/photo/${encodeURIComponent(publicId)}`);
};

export const deleteSchoolVideo = (schoolId, publicId) => {
  return apiClient.delete(`/admin/${encodeURIComponent(schoolId)}/video/${encodeURIComponent(publicId)}`);
};

/**
 * Check if a school profile exists for an authId (fallback to by-id)
 * Backend does not have a dedicated endpoint, so reuse get by id
 */
export const checkSchoolProfileExists = (authId) => {
  return getSchoolById(authId);
};

/**
 * Delete a user
 * @param {string} userId - User ID
 */
export const deleteUser = (userId) => {
  return apiClient.delete(`/admin/users/${userId}`);
};

/**
 * Delete a school
 * @param {string} schoolId - School ID
 */
export const deleteSchool = (schoolId) => {
  return apiClient.delete(`/admin/schools/${schoolId}`);
};

/**
 * Get admin profile
 */
export const getAdminProfile = () => {
  return apiClient.get('/admin/profile');
};

/**
 * Update admin profile
 * @param {object} profileData - Profile update data
 */
export const updateAdminProfile = (profileData) => {
  return apiClient.patch('/admin/profile', profileData);
};

/**
 * Change admin password
 * @param {object} passwordData - Password change data
 */
export const changeAdminPassword = (passwordData) => {
  return apiClient.patch('/admin/change-password', passwordData);
};