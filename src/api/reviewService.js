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
  // ✅ Extract student info from reviewData or use defaults
  const studentName = reviewData.studentName || reviewData.name || 'Anonymous Student';
  const studentEmail = reviewData.studentEmail || reviewData.email || 'student@example.com';
  
  // DON'T send status - let the schema default handle it
  const backendData = {
    studentId: reviewData.studentId,
    schoolId: reviewData.schoolId,
    text: reviewData.comment,
    ratings: reviewData.rating,
    student: {
      name: studentName,
      email: studentEmail,
      studentId: reviewData.studentId
    }
    // ❌ REMOVED status field - let backend schema default to 'Pending'
  };

  console.log('📝 Submitting review to /reviews/');
  console.log('📋 Review Data:', JSON.stringify(backendData, null, 2));

  try {
    const response = await apiClient.post('/reviews', backendData);
    console.log('✅ Success response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error submitting review:', error);
    console.error('❌ Full error object:', error.response);
    console.error('❌ Error response data:', error.response?.data);
    
    throw error;
  }
};

export const updateReview = async (schoolId, studentId, reviewData) => {
  const backendData = {
    text: reviewData.comment, // Backend expects 'text'
    ratings: reviewData.rating, // Backend expects 'ratings'
    status: 'Pending' // ✅ Set status back to Pending for re-approval
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
    const response = await apiClient.get('/reviews/pending/all'); // correct

    return response.data;
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    throw error;
  }
};

// Accept a review
export const acceptReview = async (reviewId) => {
  try {
    const response = await apiClient.patch(`/reviews/admin/accept/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error accepting review:', error);
    throw error;
  }
};

// Reject a review
export const rejectReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/reviews/admin/reject/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting review:', error);
    throw error;
  }
};

// Get school name by ID
export const getSchoolName = async (schoolId) => {
  try {
    const response = await apiClient.get(`/schools/${schoolId}`);
    return response.data.name || 'Unknown School';
  } catch (error) {
    console.error('Error fetching school name:', error);
    return 'Unknown School';
  }
};