import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSchoolReviews, submitReview, likeReview } from '../api/reviewService';
import { toast } from 'react-toastify';
import { Star, Heart, MessageCircle, User } from 'lucide-react';

const ReviewSection = ({ schoolId }) => {
  const { user: currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [likingReviews, setLikingReviews] = useState(new Set());

  useEffect(() => {
    if (schoolId) fetchReviews();
  }, [schoolId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Make sure this route matches your backend
      const response = await getSchoolReviews(schoolId);
<<<<<<< HEAD
      const data = response.data?.data || response.data || [];
      setReviews(
        data.map((r) => ({
          ...r,
          rating: r.rating || r.ratings,
          comment: r.comment || r.text,
          likes: r.likes || 0,
          likedBy: r.likedBy || [],
        }))
      );
=======
      const data = response.data.data || response.data || [];
      // Normalize fields for consistency
      setReviews(data.map(r => ({
        ...r,
        rating: r.rating || r.ratings,
        comment: r.comment || r.text,
        likes: r.likes || 0,
        likedBy: r.likedBy || []
      })));
>>>>>>> 8bbdfec242ffe8e3cf4c466403a668d9b8a668e2
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleRatingClick = (rating) =>
    setNewReview((prev) => ({ ...prev, rating }));

  const handleCommentChange = (e) =>
    setNewReview((prev) => ({ ...prev, comment: e.target.value }));

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) return toast.info('Please log in to submit a review');
    if (['school', 'admin'].includes(currentUser.userType))
      return toast.error('Only students can submit reviews');
    if (newReview.rating === 0) return toast.error('Please select a rating');
    if (!newReview.comment.trim())
      return toast.error('Please write a comment');

=======
  const handleRatingClick = (rating) => setNewReview(prev => ({ ...prev, rating }));
  const handleCommentChange = (e) => setNewReview(prev => ({ ...prev, comment: e.target.value }));

  const handleSubmitReview = async (e) => {
    e.preventDefault();
  
    if (!currentUser) return toast.info('Please log in to submit a review');
    if (currentUser.userType === 'school' || currentUser.userType === 'admin')
      return toast.error('Only students can submit reviews');
    if (newReview.rating === 0) return toast.error('Please select a rating');
    if (!newReview.comment.trim()) return toast.error('Please write a comment');
  
>>>>>>> 8bbdfec242ffe8e3cf4c466403a668d9b8a668e2
    try {
      setSubmitting(true);
  
      const reviewData = {
        schoolId,
<<<<<<< HEAD
        studentId: currentUser.authId,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
      };
      await submitReview(reviewData);
      toast.success(
        'Review submitted successfully! It will be visible after admin approval.'
      );
      setNewReview({ rating: 0, comment: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
=======
        studentId: currentUser.authId, // ← MUST send authId, not _id
        rating: newReview.rating,
        comment: newReview.comment.trim()
      };
  
      console.log('🔄 Submitting review with studentId:', reviewData.studentId);
  
      await submitReview(reviewData);
      toast.success('Review submitted successfully! It will be visible after admin approval.');
      setNewReview({ rating: 0, comment: '' });
      fetchReviews();
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
>>>>>>> 8bbdfec242ffe8e3cf4c466403a668d9b8a668e2
    } finally {
      setSubmitting(false);
    }
  };
  

  const handleLikeReview = async (reviewId) => {
    if (!currentUser) return toast.info('Please log in to like reviews');
<<<<<<< HEAD
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
=======
    if (currentUser.userType === 'school' || currentUser.userType === 'admin')
      return toast.error('Only students can like reviews');

    const studentId = currentUser.authId || currentUser._id;
    const review = reviews.find(r => r._id === reviewId);
    if (review?.likedBy?.includes(studentId)) return toast.info('You have already liked this review');

    try {
      setLikingReviews(prev => new Set([...prev, reviewId]));
      await likeReview(studentId, reviewId);
      toast.success('Review liked successfully!');
      setReviews(prev =>
        prev.map(r => r._id === reviewId
          ? { ...r, likes: r.likes + 1, likedBy: [...r.likedBy, studentId] }
          : r
>>>>>>> 8bbdfec242ffe8e3cf4c466403a668d9b8a668e2
        )
      );
    } catch (error) {
      console.error('Error liking review:', error);
<<<<<<< HEAD
      toast.error(error.response?.data?.message || 'Failed to like review');
    } finally {
      setLikingReviews((prev) => {
=======
      const message = error.response?.data?.message || 'Failed to like review';
      toast.error(message);
    } finally {
      setLikingReviews(prev => {
>>>>>>> 8bbdfec242ffe8e3cf4c466403a668d9b8a668e2
        const set = new Set(prev);
        set.delete(reviewId);
        return set;
      });
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => (
    <div className="flex items-center space-x-1">
<<<<<<< HEAD
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          className={`${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''}`}
=======
      {[1,2,3,4,5].map(star => (
        <Star
          key={star}
          size={20}
          className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''}`}
>>>>>>> 8bbdfec242ffe8e3cf4c466403a668d9b8a668e2
          onClick={interactive ? () => onStarClick(star) : undefined}
        />
      ))}
    </div>
  );

<<<<<<< HEAD
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
=======
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return (
    <div className="bg-white shadow-lg rounded-lg p-6 text-center">
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading reviews...</span>
      </div>
    </div>
  );
>>>>>>> 8bbdfec242ffe8e3cf4c466403a668d9b8a668e2

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 border-b pb-3">Reviews</h2>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
<<<<<<< HEAD
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
=======
          <p className="text-gray-600 text-lg">No reviews yet. Be the first to review this school!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-indigo-600"/>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{review.student?.name || review.studentName || 'Anonymous Student'}</h4>
                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
>>>>>>> 8bbdfec242ffe8e3cf4c466403a668d9b8a668e2
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStars(review.rating)}
<<<<<<< HEAD
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
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}

=======
                  <span className="text-sm text-gray-500 ml-2">{review.rating}/5</span>
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
              <div className="flex items-center">
                <button
                  onClick={() => handleLikeReview(review._id)}
                  disabled={likingReviews.has(review._id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${review.likedBy.includes(currentUser?.authId || currentUser?._id) ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'} ${likingReviews.has(review._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Heart size={16} className={review.likedBy.includes(currentUser?.authId || currentUser?._id) ? 'fill-current' : ''} />
                  <span>{review.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentUser && (currentUser.userType === 'student' || currentUser.userType === 'parent') && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating *</label>
              {renderStars(newReview.rating, true, handleRatingClick)}
              {newReview.rating > 0 && <p className="text-sm text-gray-500 mt-1">{newReview.rating} star{newReview.rating !== 1 ? 's' : ''} selected</p>}
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium mb-2">Your Review *</label>
              <textarea
                id="comment"
                value={newReview.comment}
                onChange={handleCommentChange}
                placeholder="Share your experience with this school..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">{newReview.comment.length}/500 characters</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Your review will be visible after admin approval.</p>
              <button
                type="submit"
                disabled={submitting || newReview.rating === 0 || !newReview.comment.trim()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

>>>>>>> 8bbdfec242ffe8e3cf4c466403a668d9b8a668e2
      {!currentUser && (
        <div className="border-t pt-6 text-center">
          <p className="text-gray-600 mb-4">Please log in as a student to submit a review.</p>
          <button
<<<<<<< HEAD
            onClick={() => (window.location.href = '/login')}
=======
            onClick={() => window.location.href='/login'}
>>>>>>> 8bbdfec242ffe8e3cf4c466403a668d9b8a668e2
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
