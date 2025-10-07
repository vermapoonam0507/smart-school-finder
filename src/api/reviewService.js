// src/api/reviewService.js

import apiClient from './axios';

// Fetch all accepted reviews for a school
export const getSchoolReviews = async (schoolId) => {
  try {
    const response = await apiClient.get(`/reviews/admin/${schoolId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Submit a new review
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

// Like a review
export const likeReview = async (studentId, reviewId) => {
  try {
    const response = await apiClient.patch(`/reviews/like/${studentId}/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get reviews by student (for student dashboard)
export const getStudentReviews = async (studentId) => {
  try {
    const response = await apiClient.get(`/reviews/users/${studentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a review (for student)
export const deleteReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin functions for managing reviews

// Get all pending reviews for admin
export const getPendingReviews = async () => {
  try {
    const response = await apiClient.get('/reviews/admin/pending/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Accept a pending review
export const acceptReview = async (reviewId) => {
  try {
    const response = await apiClient.patch(`/reviews/admin/accept/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reject a pending review
export const rejectReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/reviews/admin/reject/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get school name by ID (for displaying in pending reviews)
export const getSchoolName = async (schoolId) => {
  try {
    const response = await apiClient.get(`/schools/${schoolId}`);
    return response.data.name || 'Unknown School';
  } catch (error) {
    console.error('Error fetching school name:', error);
    return 'Unknown School';
  }
};