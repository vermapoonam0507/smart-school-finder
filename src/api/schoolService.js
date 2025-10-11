// src/api/schoolService.js

import apiClient from './axios';

/**
 * Public school APIs (user-facing)
 * All routes are prefixed with /api in app.js
 */

/**
 * Get schools by status (public endpoint)
 * Backend: GET /api/schools/status/:status
 */
export const getPublicSchoolsByStatus = (status) => {
  const safeStatus = encodeURIComponent(status);
  return apiClient.get(`/admin/schools/status/${safeStatus}`);
};

/**
 * Get a single school by ID
 * Backend: GET /api/schools/:id
 */
export const getSchoolById = (schoolId) => {
  return apiClient.get(`/admin/schools/${encodeURIComponent(schoolId)}`);
};

/**
 * Search schools
 * Backend: GET /api/schools/search?q=...&filters... OR /api/search
 */
export const searchSchools = async (searchQuery, filters = {}) => {
  const params = new URLSearchParams();
  if (searchQuery) params.append('q', searchQuery);
  
  // Add any additional filters
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });
  
  try {
    return await apiClient.get(`/admin/search?${params.toString()}`);
  } catch (error) {
    // Handle 404 as "no results found" instead of error
    if (error.response?.status === 404) {
      return {
        data: {
          status: 'success',
          message: 'No schools found for the given search.',
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          }
        }
      };
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Compare schools
 * Backend: POST /api/schools/compare
 */
export const compareSchools = (schoolIds) => {
  return apiClient.post('/admin/compare', { schoolIds });
};

/**
 * Filter schools by fee range
 * Backend: GET /api/schools/filter-feeRange?min=...&max=...
 */
export const getSchoolsByFeeRange = (minFee, maxFee) => {
  const params = new URLSearchParams();
  if (minFee) params.append('min', minFee);
  if (maxFee) params.append('max', maxFee);
  return apiClient.get(`/admin/filter-feeRange?${params.toString()}`);
};

/**
 * Filter schools by shift
 * Backend: GET /api/schools/filter-Shift?shift=...
 */
export const getSchoolsByShift = (shift) => {
  return apiClient.get(`/admin/filter-Shift?shift=${encodeURIComponent(shift)}`);
};

/**
 * Get school card data
 * Backend: GET /api/schools/card/:id
 */
export const getSchoolCardData = (schoolId) => {
  return apiClient.get(`/admin/card/${encodeURIComponent(schoolId)}`);
};

/**
 * Get amenities by school ID
 * Backend: GET /api/schools/amenities/:id
 */
export const getAmenitiesById = (schoolId) => {
  return apiClient.get(`/admin/schools/amenities/${encodeURIComponent(schoolId)}`);
};

/**
 * Get activities by school ID
 * Backend: GET /api/schools/activities/:id
 */
export const getActivitiesById = (schoolId) => {
  return apiClient.get(`/admin/schools/activities/${encodeURIComponent(schoolId)}`);
};

/**
 * Get alumni by school ID
 * Backend: GET /api/schools/alumnus/:id
 */
export const getAlumniBySchool = (schoolId) => {
  return apiClient.get(`/admin/alumnus/${encodeURIComponent(schoolId)}`);
};

/**
 * Get infrastructure by school ID
 * Backend: GET /api/schools/infrastructure/:id
 */
export const getInfrastructureById = (schoolId) => {
  return apiClient.get(`/admin/schools/infrastructure/${encodeURIComponent(schoolId)}`);
};

/**
 * Get other details by school ID
 * Backend: GET /api/schools/other-details/:id
 */
export const getOtherDetailsById = (schoolId) => {
  return apiClient.get(`/admin/schools/other-details/${encodeURIComponent(schoolId)}`);
};

/**
 * Get academics by school ID
 * Backend: GET /api/schools/academics/:id
 */
export const getAcademicsById = (schoolId) => {
  return apiClient.get(`/admin/schools/academics/${encodeURIComponent(schoolId)}`);
};

/**
 * Get fees and scholarships by school ID
 * Backend: GET /api/schools/fees-scholarships/:id
 */
export const getFeesAndScholarshipsById = (schoolId) => {
  return apiClient.get(`/admin/schools/fees-scholarships/${encodeURIComponent(schoolId)}`);
};

/**
 * Get technology adoption by school ID
 * Backend: GET /api/schools/technology-adoption/:id
 */
export const getTechnologyAdoptionById = (schoolId) => {
  return apiClient.get(`/admin/schools/technology-adoption/${encodeURIComponent(schoolId)}`);
};

/**
 * Get admission details by school ID
 * Backend: GET /api/schools/admission/:id
 */
export const getAdmissionDetails = (schoolId) => {
  return apiClient.get(`/admin/schools/admission-timeline/${encodeURIComponent(schoolId)}`);
};

/**
 * Get school photos
 * Backend: GET /api/schools/:id/photos
 */
export const getSchoolPhotos = (schoolId) => {
  return apiClient.get(`/admin/${encodeURIComponent(schoolId)}/photos`);
};

/**
 * Get school videos
 * Backend: GET /api/schools/:id/videos
 */
export const getSchoolVideos = (schoolId) => {
  return apiClient.get(`/admin/${encodeURIComponent(schoolId)}/videos`);
};

/**
 * Get specific school photo
 * Backend: GET /api/schools/:id/photo/:publicId
 */
export const getSchoolPhoto = (schoolId, publicId) => {
  return apiClient.get(`/admin/${encodeURIComponent(schoolId)}/photo/${encodeURIComponent(publicId)}`);
};

/**
 * Get specific school video
 * Backend: GET /api/schools/:id/video/:publicId
 */
export const getSchoolVideo = (schoolId, publicId) => {
  return apiClient.get(`/admin/${encodeURIComponent(schoolId)}/video/${encodeURIComponent(publicId)}`);
};

/**
 * Add support/help request
 * Backend: POST /api/schools/support (requires authentication)
 */
export const addSupport = (supportData) => {
  return apiClient.post('/admin/support', supportData);
};

/**
 * Get support requests by student ID
 * Backend: GET /api/schools/support/:studId
 */
export const getSupportByStudent = (studentId) => {
  return apiClient.get(`/admin/support/${encodeURIComponent(studentId)}`);
};

/**
 * Get specific support request
 * Backend: GET /api/schools/support-id/:supportId
 */
export const getSupportById = (supportId) => {
  return apiClient.get(`/admin/support-id/${encodeURIComponent(supportId)}`);
};

/**
 * Delete support request
 * Backend: DELETE /api/schools/support/:supportId (requires authentication)
 */
export const deleteSupport = (supportId) => {
  return apiClient.delete(`/admin/support/${encodeURIComponent(supportId)}`);
};

/**
 * Predict schools based on criteria
 * Backend: POST /api/schools/predict-schools OR /api/schools/predict
 */
export const predictSchools = (predictorData) => {
  return apiClient.post('/admin/predict-schools', predictorData);
};

/**
 * Get all blogs
 * Backend: GET /api/schools/blogs
 */
export const getAllBlogs = () => {
  return apiClient.get('/admin/blogs');
};

/**
 * Get blog by ID
 * Backend: GET /api/schools/blogs/:id
 */
export const getBlogById = (blogId) => {
  return apiClient.get(`/admin/blogs/${encodeURIComponent(blogId)}`);
};

/**
 * Create a new blog
 * Backend: POST /api/schools/blogs
 */
export const createBlog = (blogData) => {
  return apiClient.post('/admin/blogs', blogData);
};

/**
 * Get admission status by student ID
 * Backend: GET /api/schools/admission-status/:studentId (requires authentication)
 */
export const getAdmissionStatusByStudent = (studentId) => {
  return apiClient.get(`/admin/admission-status/${encodeURIComponent(studentId)}`);
};

/**
 * Add admission status
 * Backend: POST /api/schools/admission-status (requires authentication)
 */
export const addAdmissionStatus = (statusData) => {
  return apiClient.post('/admin/admission-status', statusData);
};

/**
 * Update admission status
 * Backend: PUT /api/schools/admission-status/:studentId/:schoolId (requires authentication)
 */
export const updateAdmissionStatus = (studentId, schoolId, statusData) => {
  return apiClient.put(`/admin/admission-status/${encodeURIComponent(studentId)}/${encodeURIComponent(schoolId)}`, statusData);
};

/**
 * Delete admission status
 * Backend: DELETE /api/schools/admission-status/:studentId/:schoolId (requires authentication)
 */
export const deleteAdmissionStatus = (studentId, schoolId) => {
  return apiClient.delete(`/admin/admission-status/${encodeURIComponent(studentId)}/${encodeURIComponent(schoolId)}`);
};

/**
 * Filter schools by student preferences
 * Backend: GET /api/schools/filter/:studentId (requires authentication)
 */
export const filterSchoolsByPreferences = (studentId) => {
  return apiClient.get(`/admin/filter/${encodeURIComponent(studentId)}`);
};

export default {
  getPublicSchoolsByStatus,
  getSchoolById,
  searchSchools,
  compareSchools,
  getSchoolsByFeeRange,
  getSchoolsByShift,
  getSchoolCardData,
  getAmenitiesById,
  getActivitiesById,
  getAlumniBySchool,
  getInfrastructureById,
  getOtherDetailsById,
  getAcademicsById,
  getFeesAndScholarshipsById,
  getTechnologyAdoptionById,
  getAdmissionDetails,
  getSchoolPhotos,
  getSchoolVideos,
  getSchoolPhoto,
  getSchoolVideo,
  addSupport,
  getSupportByStudent,
  getSupportById,
  deleteSupport,
  predictSchools,
  getAllBlogs,
  getBlogById,
  createBlog,
  getAdmissionStatusByStudent,
  addAdmissionStatus,
  updateAdmissionStatus,
  deleteAdmissionStatus,
  filterSchoolsByPreferences
};