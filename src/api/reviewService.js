// src/api/reviewService.js
import apiClient from './axios';

/* ----------------- Student Reviews ----------------- */

// Get all accepted reviews for a school
export const getSchoolReviews = async (schoolId) => {
  try {
    const response = await apiClient.get(`/reviews/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching school reviews:', error);
    throw error;
  }
};

// Get reviews by student (all statuses)
export const getStudentReviews = async (studentId) => {
  try {
    const response = await apiClient.get(`/reviews/users/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student reviews:', error);
    throw error;
  }
};

export const submitReview = async (reviewData) => {
  const backendData = {
    schoolId: reviewData.schoolId,
    studentId: reviewData.studentId,
    text: reviewData.comment, // Backend expects 'text'
    ratings: reviewData.rating // Backend expects 'ratings'
  };

  console.log('Submitting review to /reviews/', backendData);

  try {
    const response = await apiClient.post('/reviews', backendData);
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

export const updateReview = async (schoolId, studentId, reviewData) => {
  const backendData = {
    text: reviewData.comment, // Backend expects 'text'
    ratings: reviewData.rating // Backend expects 'ratings'
  };

  console.log('Updating review to /reviews/', schoolId, studentId, backendData);

  try {
    const response = await apiClient.put(`/reviews/${schoolId}/${studentId}`, backendData);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Like a review
export const likeReview = async (studentId, reviewId) => {
  try {
    const response = await apiClient.patch(`/reviews/like/${studentId}/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error liking review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

/* ----------------- Admin Pending Reviews ----------------- */

// Get all pending reviews
export const getPendingReviews = async () => {
  try {
    const response = await apiClient.get('/reviews/pending/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    throw error;
  }
};

// Accept a review
export const acceptReview = async (reviewId) => {
  try {
    const response = await apiClient.patch(`/reviews/accept/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error accepting review:', error);
    throw error;
  }
};

// Reject a review
export const rejectReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/reviews/reject/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting review:', error);
    throw error;
  }
};

// Get school name by ID
export const getSchoolName = async (schoolId) => {
  try {
    const response = await apiClient.get(`/admin/schools/${schoolId}`);
    return response.data.name || 'Unknown School';
  } catch (error) {
    console.error('Error fetching school name:', error);
    return 'Unknown School';
  }
};