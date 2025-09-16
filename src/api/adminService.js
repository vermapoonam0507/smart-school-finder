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

/**
 * Deletes a specific photo for a school.
 * @param {string} schoolId - The ID of the school.
 * @param {string} publicId - The public ID of the photo to delete.
 */
export const deleteSchoolPhoto = (schoolId, publicId) => {
  // Note: The exact URL depends on your backend API design.
  // This is a common pattern.
  return apiClient.delete(`/admin/schools/${schoolId}/photos/${publicId}`);
};


/**
 * Deletes the video for a school.
 * @param {string} schoolId - The ID of the school.
 * @param {string} publicId - The public ID of the video to delete.
 */
export const deleteSchoolVideo = (schoolId, publicId) => {
  // Note: The exact URL depends on your backend API design.
  return apiClient.delete(`/admin/schools/${schoolId}/videos/${publicId}`);
};


/**
 * Gets all photos for a specific school.
 * @param {string} schoolId - The ID of the school.
 */
export const getSchoolPhotos = (schoolId) => {
  return apiClient.get(`/admin/schools/${schoolId}/photos`);
};

/**
 * Gets the video for a specific school.
 * @param {string} schoolId - The ID of the school.
 */
export const getSchoolVideos = (schoolId) => {
  return apiClient.get(`/admin/schools/${schoolId}/videos`);
};

/**
 * Uploads one or more photos for a school.
 * @param {string} schoolId - The ID of the school.
 * @param {FileList} files - The file(s) from the input element.
 */
export const uploadSchoolPhotos = (schoolId, files) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("photos", files[i]);
  }
  return apiClient.post(`/admin/schools/${schoolId}/photos`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Uploads a single video for a school.
 * @param {string} schoolId - The ID of the school.
 * @param {File} file - The video file from the input element.
 */
export const uploadSchoolVideo = (schoolId, file) => {
  const formData = new FormData();
  formData.append("video", file);
  return apiClient.post(`/admin/schools/${schoolId}/video`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};