import React, { useState, useEffect } from 'react';
import { getReviewsBySchool, getPendingReviews, acceptReview, rejectReview } from '../api/reviewService';
import { toast } from 'react-toastify';
import { Star, MessageCircle, User } from 'lucide-react';

const AdminReviewSection = ({ schoolId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (schoolId) fetchReviews();
  }, [schoolId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Fetch both accepted and pending reviews
      const acceptedRes = await getReviewsBySchool(schoolId); // /admin/:schoolId
      const pendingRes = await getPendingReviews();           // /admin/pending/all

      // Filter pending reviews for this school only
      const pendingForSchool = pendingRes.data?.data?.filter(r => r.schoolId === schoolId) || [];

      setReviews([...pendingForSchool, ...(acceptedRes.data?.data || [])]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (reviewId) => {
    try {
      await acceptReview(reviewId);
      toast.success('Review accepted successfully!');
      fetchReviews();
    } catch (error) {
      console.error('Error accepting review:', error);
      const message = error.response?.data?.message || 'Failed to accept review';
      toast.error(message);
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await rejectReview(reviewId);
      toast.success('Review rejected successfully!');
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      const message = error.response?.data?.message || 'Failed to reject review';
      toast.error(message);
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading reviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 border-b pb-3">Admin Review Panel</h2>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No reviews available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {review.student?.name || review.studentName || 'Anonymous Student'}
                    </h4>
                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStars(review.ratings || review.rating)}
                  <span className="text-sm text-gray-500 ml-2">{review.ratings || review.rating}/5</span>
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">{review.text || review.comment}</p>

              {/* Admin action buttons for pending reviews */}
              {review.status === 'Pending' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAccept(review._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(review._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
              {review.status === 'Accepted' && (
                <span className="text-green-600 font-semibold">Accepted</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection_fixed;