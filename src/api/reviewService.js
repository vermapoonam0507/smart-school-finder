// src/api/reviewService.js
import apiClient from './axios';

/* ----------------- Student Reviews ----------------- */

// Get all accepted reviews for a school
export const getSchoolReviews = async (schoolId) =>
  apiClient.get(`/reviews/admin/${schoolId}`);

// Get reviews by school (matches backend route)
export const getReviewsBySchool = async (schoolId) =>
  apiClient.get(`/reviews/admin/${schoolId}`);

export const submitReview = async (reviewData) => {
  const backendData = {
    schoolId: reviewData.schoolId,
    studentId: reviewData.studentId, // <- must send authId here
    ratings: reviewData.rating,
    text: reviewData.comment
  };

  console.log('Submitting review to /reviews/', backendData);

  try {
    const res = await apiClient.post('/reviews', backendData);
    return res.data;
  } catch (err) {
    console.error('Error submitting review:', err);
    throw err;
  }
};



// Like a review
export const likeReview = (studentId, reviewId) =>
  apiClient.patch(`/reviews/like/${studentId}/${reviewId}`);

// Get reviews by student
export const getStudentReviews = (studentId) =>
  apiClient.get(`/reviews/users/${studentId}`);

// Delete a review
export const deleteReview = (reviewId) => apiClient.delete(`/reviews/${reviewId}`);

/* ----------------- Admin Pending Reviews ----------------- */

// Get all pending reviews
export const getPendingReviews = () =>
  apiClient.get('/reviews/admin/pending/all');

// Accept a review
export const acceptReview = (reviewId) =>
  apiClient.patch(`/reviews/admin/accept/${reviewId}`);

// Reject a review
export const rejectReview = (reviewId) =>
  apiClient.delete(`/reviews/admin/reject/${reviewId}`);

// Get school name by ID
export const getSchoolName = async (schoolId) => {
  try {
    const res = await apiClient.get(`/admin/schools/${schoolId}`);
    return res.data.name || 'Unknown School';
  } catch (err) {
    console.error('Error fetching school name:', err);
    return 'Unknown School';
  }
};