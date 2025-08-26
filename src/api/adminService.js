// src/api/adminService.js

import apiClient from './axios';

// --- School Functions ---

/**
 * Status ke hisab se schools ki list get karne ke liye function.
 * @param {string} status - Jaise 'accepted', 'pending', 'rejected'.
 */
export const getSchoolsByStatus = (status) => {
  return apiClient.get(`/admin/schools/status/${status}`);
};

/**
 * Naya school add karne ke liye function.
 * @param {object} schoolData - School ke form ka poora data.
 */
export const addSchool = (schoolData) => {
  return apiClient.post('/admin/schools', schoolData);
};

/**
 * School ki details ID se get karne ke liye function.
 * @param {string} id - School ki ID.
 */
export const getSchoolById = (id) => {
  return apiClient.get(`/admin/schools/${id}`);
};

/**
 * School ka status update karne ke liye function (Approve/Reject).
 * @param {string} id - School ki ID.
 * @param {object} data - Data to update, jaise { status: 'accepted' }.
 */
export const updateSchoolStatus = (id, data) => {
  // This uses the PUT /api/admin/schools/:id endpoint from your backend
  return apiClient.put(`/admin/schools/${id}`, data);
};


// --- Amenity, Activity, and Alumnus Functions ---
// (The rest of the file remains the same)

export const addAmenity = (amenityData) => {
  return apiClient.post('/admin/amenities', amenityData);
};

export const getAmenityById = (id) => {
    return apiClient.get(`/admin/amenities/${id}`);
};

export const addActivity = (activityData) => {
  return apiClient.post('/admin/activities', activityData);
};

export const getActivityById = (id) => {
    return apiClient.get(`/admin/activities/${id}`);
};

export const addAlumnus = (alumnusData) => {
  return apiClient.post('/admin/alumnus', alumnusData);
};

export const getAlumnusById = (id) => {
    return apiClient.get(`/admin/alumnus/${id}`);
};
