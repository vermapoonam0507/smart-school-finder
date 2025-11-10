import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSchoolReviews, getStudentReviews, submitReview, updateReview, likeReview } from '../api/reviewService_fixed';
import { getUserProfile, createStudentProfile } from '../api/userService';
import { toast } from 'react-toastify';
import { Star, Heart, MessageCircle, User } from 'lucide-react';

const ReviewSection = ({ schoolId }) => {
  const { user: currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [likingReviews, setLikingReviews] = useState(new Set());
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    if (schoolId) fetchReviews();
  }, [schoolId]);

  useEffect(() => {
    if (schoolId && currentUser) fetchReviews();
  }, [currentUser]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch accepted reviews for the school (public display)
      const response = await getSchoolReviews(schoolId);
      const data = response.data || [];
      
      // Format reviews for display (backend uses 'text' and 'ratings')
      const formattedReviews = data.map((r) => ({
        ...r,
        rating: r.ratings, // Backend uses 'ratings'
        comment: r.text,   // Backend uses 'text'
        likes: r.likes || 0,
        likedBy: r.likedBy || [],
        studentName: r.student?.name || 'Anonymous User'
      }));
      
      setReviews(formattedReviews);
      
      // Check if current user has an existing review (including pending ones)
      if (currentUser && currentUser.authId) {
        try {
          const studentReviewsResponse = await getStudentReviews(currentUser.authId);
          const studentReviews = studentReviewsResponse.data || [];
          
          // Find if user has a review for this specific school
          const userReview = studentReviews.find(
            (r) => r.schoolId === schoolId || r.schoolId?._id === schoolId
          );
          
          if (userReview) {
            setExistingReview(userReview);
            setNewReview({ 
              rating: userReview.ratings, // Backend uses 'ratings'
              comment: userReview.text     // Backend uses 'text'
            });
          } else {
            setExistingReview(null);
            setNewReview({ rating: 0, comment: '' });
          }
        } catch (studentReviewError) {
          // Handle both 404 (no reviews) and student not found cases gracefully
          console.log('No student reviews found or student profile not created:', studentReviewError.message);
          setExistingReview(null);
          setNewReview({ rating: 0, comment: '' });
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) =>
    setNewReview((prev) => ({ ...prev, rating }));

  const handleCommentChange = (e) =>
    setNewReview((prev) => ({ ...prev, comment: e.target.value }));

  const ensureStudentProfileExists = async () => {
    try {
      console.log('🔍 Checking if student profile exists for:', currentUser.authId);

      // Check if student profile exists
      const profileResponse = await getUserProfile(currentUser.authId);
      console.log('📋 Profile response:', profileResponse);

      if (profileResponse.data) {
        console.log('✅ Student profile exists:', profileResponse.data);
        return true;
      }

      if (profileResponse.status === 'Not Found') {
        console.log('❌ Student profile not found, creating one...');

        // Create a basic student profile with required fields
        const profileData = {
          authId: currentUser.authId,
          email: currentUser.email,
          name: currentUser.name || 'Student User',
          contactNo: currentUser.contactNo || currentUser.phone || '0000000000',
          dateOfBirth: currentUser.dateOfBirth || new Date('2000-01-01').toISOString(),
          gender: currentUser.gender || 'other',
          state: currentUser.state || 'Unknown',
          city: currentUser.city || 'Unknown',
          userType: 'student'
        };

        console.log('📝 Creating profile with data:', profileData);
        const createResponse = await createStudentProfile(profileData);
        console.log('✅ Student profile created successfully:', createResponse);
        return true;
      }

      console.log('❓ Unexpected profile response structure');
      return false;
    } catch (error) {
      console.error('❌ Error ensuring student profile exists:', error);
      // If profile creation fails, we'll let the review submission handle the error
      return false;
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) return toast.info('Please log in to submit a review');
    if (['school', 'admin'].includes(currentUser.userType))
      return toast.error('Only students can submit reviews');
    if (newReview.rating === 0) return toast.error('Please select a rating');
    if (!newReview.comment.trim())
      return toast.error('Please write a comment');

    try {
      setSubmitting(true);
      
      // Ensure student profile exists before submitting review
      const profileExists = await ensureStudentProfileExists();
      if (!profileExists) {
        toast.info('Please complete your profile before submitting a review');
        // Optionally redirect to profile creation page
        window.location.href = '/create-profile';
        return;
      }

      const reviewData = {
        schoolId,
        studentId: currentUser.authId,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        studentName: currentUser.name || 'Student User',
        studentEmail: currentUser.email
      };

      if (existingReview) {
        // Update existing review
        await updateReview(schoolId, currentUser.authId, reviewData);
        toast.success('Review updated successfully!');
      } else {
        // Submit new review
        await submitReview(reviewData);
        toast.success('Review submitted successfully! It will be visible after admin approval.');
      }
      
      setNewReview({ rating: 0, comment: '' });
      setExistingReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Handle specific error cases
      if (error.response?.data?.message === 'Student not found') {
        toast.error('Please complete your profile before submitting a review');
        // Optionally redirect to profile creation page
        setTimeout(() => {
          window.location.href = '/create-profile';
        }, 2000);
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!currentUser) return toast.info('Please log in to like reviews');
    if (['school', 'admin'].includes(currentUser.userType))
      return toast.error('Only students can like reviews');

    const studentId = currentUser.authId || currentUser._id;
    const review = reviews.find((r) => r._id === reviewId);
    if (review?.likedBy?.includes(studentId))
      return toast.info('You have already liked this review');

    try {
      setLikingReviews((prev) => new Set([...prev, reviewId]));
      await likeReview(studentId, reviewId);
      toast.success('Review liked successfully!');
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? { ...r, likes: r.likes + 1, likedBy: [...r.likedBy, studentId] }
            : r
        )
      );
    } catch (error) {
      console.error('Error liking review:', error);
      toast.error(error.response?.data?.message || 'Failed to like review');
    } finally {
      setLikingReviews((prev) => {
        const set = new Set(prev);
        set.delete(reviewId);
        return set;
      });
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          className={`${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''}`}
          onClick={interactive ? () => onStarClick(star) : undefined}
        />
      ))}
    </div>
  );

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  if (loading)
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading reviews...</span>
        </div>
      </div>
    );

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 border-b pb-3">Reviews</h2>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">
            No reviews yet. Be the first to review this school!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {review.student?.name ||
                        review.studentName ||
                        'Anonymous Student'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500 ml-2">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

              <div className="flex items-center">
                <button
                  onClick={() => handleLikeReview(review._id)}
                  disabled={likingReviews.has(review._id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    review.likedBy.includes(
                      currentUser?.authId || currentUser?._id
                    )
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                  } ${likingReviews.has(review._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Heart
                    size={16}
                    className={
                      review.likedBy.includes(
                        currentUser?.authId || currentUser?._id
                      )
                        ? 'fill-current'
                        : ''
                    }
                  />
                  <span>{review.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentUser &&
        ['student', 'parent'].includes(currentUser.userType) && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating *</label>
                {renderStars(newReview.rating, true, handleRatingClick)}
                {newReview.rating > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {newReview.rating} star{newReview.rating !== 1 ? 's' : ''}{' '}
                    selected
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium mb-2"
                >
                  Your Review *
                </label>
                <textarea
                  id="comment"
                  value={newReview.comment}
                  onChange={handleCommentChange}
                  placeholder="Share your experience with this school..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {newReview.comment.length}/500 characters
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Your review will be visible after admin approval.
                </p>
                <button
                  type="submit"
                  disabled={
                    submitting || newReview.rating === 0 || !newReview.comment.trim()
                  }
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting 
                    ? 'Submitting...' 
                    : existingReview 
                      ? 'Update Review' 
                      : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}

      {!currentUser && (
        <div className="border-t pt-6 text-center">
          <p className="text-gray-600 mb-4">Please log in as a student to submit a review.</p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Log In
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
