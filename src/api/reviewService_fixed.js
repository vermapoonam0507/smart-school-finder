// src/api/reviewService.js
import apiClient from './axios';

/* ----------------- Student Reviews ----------------- */

/**
 * Fetch all accepted reviews for a school
 * @param {string} schoolId
 */
export const getSchoolReviews = async (schoolId) => {
  try {
    const response = await apiClient.get(`/reviews/${schoolId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Submit a new review
 * @param {object} reviewData
 */
export const submitReview = async (reviewData) => {
  try {
    // Transform frontend data to match backend schema
    const backendData = {
      schoolId: reviewData.schoolId,
      text: reviewData.comment, // frontend uses 'comment', backend uses 'text'
      ratings: reviewData.rating, // frontend uses 'rating', backend uses 'ratings'
      student: {
        name: reviewData.studentName || 'Anonymous Student',
        email: reviewData.studentEmail || '',
        studentId: reviewData.studentId
      }
    };
    const response = await apiClient.post('/reviews', backendData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Like a review
 * @param {string} studentId
 * @param {string} reviewId
 */
export const likeReview = async (studentId, reviewId) => {
  try {
    const response = await apiClient.patch(`/reviews/like/${studentId}/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get reviews by student (for student dashboard)
 * @param {string} studentId
 */
export const getStudentReviews = async (studentId) => {
  try {
    const response = await apiClient.get(`/reviews/users/${studentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing review
 * @param {string} schoolId
 * @param {string} studentId
 * @param {object} reviewData
 */
export const updateReview = async (schoolId, studentId, reviewData) => {
  try {
    // Transform frontend data to match backend schema
    const backendData = {
      text: reviewData.comment, // frontend uses 'comment', backend uses 'text'
      ratings: reviewData.rating, // frontend uses 'rating', backend uses 'ratings'
      status: 'Pending' // Set status back to Pending for re-approval
    };
    const response = await apiClient.put(`/reviews/${schoolId}/${studentId}`, backendData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a review
 * @param {string} reviewId
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ----------------- Admin Pending Reviews ----------------- */

/**
 * Get all pending reviews for admin
 */
export const getPendingReviews = async () => {
  try {
    const response = await apiClient.get('/reviews/pending/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Accept a pending review
 * @param {string} reviewId
 */
export const acceptReview = async (reviewId) => {
  try {
    const response = await apiClient.patch(`/reviews/accept/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reject a pending review
 * @param {string} reviewId
 */
export const rejectReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/reviews/reject/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get school name by ID (for displaying in pending reviews)
 * @param {string} schoolId
 */
export const getSchoolName = async (schoolId) => {
  try {
    const response = await apiClient.get(`/schools/${schoolId}`);
    return response.data.name || 'Unknown School';
  } catch (error) {
    console.error('Error fetching school name:', error);
    return 'Unknown School';
  }
};
