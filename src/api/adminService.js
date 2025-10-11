// src/api/adminService.js
import apiClient from './axios';

export const registerAdmin = async (adminData) => {
  return apiClient.post('/admin/auth/register', adminData);
};

export const loginAdmin = async (credentials) => {
  return apiClient.post('/admin/auth/login', credentials);
};

export const getAdminStats = () => {
  return apiClient.get('/admin/stats');
};

export const addSchool = (data) => {
  return apiClient.post('/schools', data);
};

export const addAmenities = (data) => {
  return apiClient.post('/schools/amenities/', data);
};

export const addActivities = (data) => {
  return apiClient.post('/schools/activities/', data);
};

export const addAlumni = (data) => {
  return apiClient.post('/schools/alumnus', data);
};

export const addInfrastructure = (data) => {
  return apiClient.post('/schools/infrastructure/', data);
};

export const addOtherDetails = (data) => {
  return apiClient.post('/schools/other-details/', data);
};

export const addFeesAndScholarships = (data) => {
  return apiClient.post('/schools/fees-scholarships/', data);
};

export const addAcademics = (data) => {
  return apiClient.post('/schools/academics/', data);
};

export const addTechnologyAdoption = (data) => {
  return apiClient.post('/schools/technology-adoption/', data);
};

export const addAdmissionDetails = (schoolId, data) => {
  return apiClient.post(`/schools/admission/${encodeURIComponent(schoolId)}`, data);
};

export const getAllUsers = () => {
  return apiClient.get('/admin/users');
};

export const getAllSchools = () => {
  return apiClient.get('/schools/status/all');
};

export const getPendingSchools = () => {
  return apiClient.get('/schools/admin/pending');
};

export const getSchoolsByStatus = async (status) => {
  return apiClient.get(`/schools/status/${encodeURIComponent(status)}`);
};

export const getSchoolById = (schoolId) => {
  return apiClient.get(`/schools/${encodeURIComponent(schoolId)}`);
};

export const updateUserStatus = (userId, statusData) => {
  return apiClient.patch(`/admin/users/${userId}/status`, statusData);
  res.status(200).json({ message: 'Route reached successfully' });
};

// export const updateSchoolStatus = async (schoolId, statusData) => {
//   return apiClient.patch(`/schools/${encodeURIComponent(schoolId)}/status`, statusData);
// };
// export const updateSchoolStatus = async (schoolId, status) => {
//   return apiClient.patch(`/schools/${schoolId}/status`, { status });
// };

export const updateSchoolStatus = async (schoolId, newStatus) => {
  return apiClient.patch(`/schools/admin/${encodeURIComponent(schoolId)}/status`, { status: newStatus });
};


export const updateSchoolInfo = (schoolId, data) => {
  return apiClient.put(`/schools/${encodeURIComponent(schoolId)}`, data);
};

export const getSchoolPhotos = (schoolId) => {
  return apiClient.get(`/schools/${encodeURIComponent(schoolId)}/photos`);
};

export const getSchoolVideos = (schoolId) => {
  return apiClient.get(`/schools/${encodeURIComponent(schoolId)}/videos`);
};

export const uploadSchoolPhotos = (schoolId, files) => {
  const formData = new FormData();
  Array.from(files).forEach((f) => formData.append('files', f));
  return apiClient.post(`/schools/${encodeURIComponent(schoolId)}/upload/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadSchoolVideo = (schoolId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/schools/${encodeURIComponent(schoolId)}/upload/video`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteSchoolPhoto = (schoolId, publicId) => {
  return apiClient.delete(`/schools/${encodeURIComponent(schoolId)}/photo/${encodeURIComponent(publicId)}`);
};

export const deleteSchoolVideo = (schoolId, publicId) => {
  return apiClient.delete(`/schools/${encodeURIComponent(schoolId)}/video/${encodeURIComponent(publicId)}`);
};

export const checkSchoolProfileExists = (authId) => {
  return getSchoolById(authId);
};

export const deleteUser = (userId) => {
  return apiClient.delete(`/users/${userId}`);
};

export const deleteSchool = (schoolId) => {
  return apiClient.delete(`/schools/${schoolId}`);
};

export const getAdminProfile = () => {
  return apiClient.get('/admin/profile');
};

export const updateAdminProfile = (profileData) => {
  return apiClient.patch('/admin/profile', profileData);
};

export const changeAdminPassword = (passwordData) => {
  return apiClient.patch('/admin/change-password', passwordData);
};