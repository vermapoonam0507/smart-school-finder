import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPendingReviews, acceptReview, rejectReview, getSchoolName } from '../api/reviewService';
import { toast } from 'react-toastify';
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  School, 
  MessageCircle,
  Heart,
  RefreshCw
} from 'lucide-react';

const PendingReviewsSection = () => {
  const { user: currentUser } = useAuth();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingReviews, setProcessingReviews] = useState(new Set());
  const [schoolNames, setSchoolNames] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reviewsPerPage = 5;

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || currentUser.userType !== 'admin') {
      return;
    }
    fetchPendingReviews();
  }, [currentUser, currentPage]);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending reviews...');
      const response = await getPendingReviews();
      console.log('Pending reviews response:', response);
      const allReviews = response.data.data || response.data || [];
      console.log('All reviews array:', allReviews);
      
      // Get locally processed reviews from localStorage
      const acceptedReviews = JSON.parse(localStorage.getItem('acceptedReviews') || '[]');
      const rejectedReviews = JSON.parse(localStorage.getItem('rejectedReviews') || '[]');
      const processedReviews = [...acceptedReviews, ...rejectedReviews];
      
      console.log('Locally processed reviews:', processedReviews);
      
      // Filter out locally processed reviews
      const filteredReviews = allReviews.filter(review => 
        !processedReviews.includes(review._id || review.id)
      );
      
      console.log('Filtered reviews (excluding locally processed):', filteredReviews);
      
      // Set pagination
      const total = filteredReviews.length;
      const pages = Math.ceil(total / reviewsPerPage);
      setTotalPages(pages);
      
      // Get current page reviews
      const startIndex = (currentPage - 1) * reviewsPerPage;
      const endIndex = startIndex + reviewsPerPage;
      const currentReviews = filteredReviews.slice(startIndex, endIndex);
      
      setPendingReviews(currentReviews);
      
      // Fetch school names for all reviews
      await fetchSchoolNames(currentReviews);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      toast.error('Failed to load pending reviews');
      // Set empty array on error to show the component
      setPendingReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolNames = async (reviews) => {
    const schoolIds = [...new Set(reviews.map(review => review.schoolId))];
    const names = {};
    
    // Fetch school names in parallel
    const promises = schoolIds.map(async (schoolId) => {
      try {
        const name = await getSchoolName(schoolId);
        names[schoolId] = name;
      } catch (error) {
        names[schoolId] = 'Unknown School';
      }
    });
    
    await Promise.all(promises);
    setSchoolNames(prev => ({ ...prev, ...names }));
  };

  const handleAcceptReview = async (reviewId) => {
    try {
      setProcessingReviews(prev => new Set([...prev, reviewId]));
      
      await acceptReview(reviewId);
      toast.success('Review accepted successfully!');
      
      // Remove the review from the list
      setPendingReviews(prev => prev.filter(review => review._id !== reviewId));
      
      // Update pagination if needed
      if (pendingReviews.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error accepting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to accept review';
      toast.error(errorMessage);
    } finally {
      setProcessingReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const handleRejectReview = async (reviewId) => {
    try {
      setProcessingReviews(prev => new Set([...prev, reviewId]));
      
      await rejectReview(reviewId);
      toast.success('Review rejected successfully!');
      
      // Remove the review from the list
      setPendingReviews(prev => prev.filter(review => review._id !== reviewId));
      
      // Update pagination if needed
      if (pendingReviews.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject review';
      toast.error(errorMessage);
    } finally {
      setProcessingReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating}/5)</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    fetchPendingReviews();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!currentUser || currentUser.userType !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p>Access denied. Admin privileges required.</p>
          <p className="text-sm mt-2">Current user type: {currentUser?.userType || 'Not logged in'}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Pending Reviews</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">Pending Reviews</h2>
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {pendingReviews.length}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {pendingReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Reviews</h3>
            <p className="text-gray-600">All reviews have been processed. Great job!</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Debug Info:</strong> Component is working! Check browser console for API call details.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Reviews List */}
            <div className="space-y-6">
              {pendingReviews.map((review) => (
                <div 
                  key={review._id} 
                  className="border border-yellow-200 rounded-lg p-6 bg-yellow-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {review.student?.name || review.studentName || 'Anonymous Student'}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <School size={14} />
                          <span>{schoolNames[review.schoolId] || 'Loading school name...'}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.ratings || review.rating)}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {review.text || review.comment}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {review.likes > 0 && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Heart size={14} />
                          <span>{review.likes} like{review.likes !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleRejectReview(review._id)}
                        disabled={processingReviews.has(review._id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingReviews.has(review._id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <XCircle size={16} />
                        )}
                        <span>Reject</span>
                      </button>
                      
                      <button
                        onClick={() => handleAcceptReview(review._id)}
                        disabled={processingReviews.has(review._id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingReviews.has(review._id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm rounded-md ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PendingReviewsSection;