import apiClient from './axios';

// --- School Functions ---

/**

 * @param {string} status - School status (pending, accepted, rejected)
 */
export const getSchoolsByStatus = (status) => {
  return apiClient.get(`/admin/schools/status/${status}`);
};

/**
 * Add new school function.
 * @param {object} schoolData - School's data.
 */
export const addSchool = (schoolData) => {
  return apiClient.post('/admin/schools', schoolData);
};

/**
 * Get school by ID function.
 * @param {string} id - School's ID.
 */
export const getSchoolById = (id) => {
  return apiClient.get(`/admin/schools/${id}`);
};

/**
 * Update school status function.
 * @param {string} id - School's ID.
 * @param {object} data - Data to update (e.g., { status: 'accepted' }).
 */
export const updateSchoolStatus = (id, data) => {
  return apiClient.put(`/admin/schools/${id}`, data);
};


// --- Amenity, Activity, and Alumnus Functions ---

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


 
export const checkSchoolProfileExists = (authId) => {
  return apiClient.get(`/admin/schools/${authId}`);
};