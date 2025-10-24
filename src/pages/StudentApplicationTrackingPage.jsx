import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentForms, trackForm } from '../api/applicationService';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Eye,
  Filter,
  RefreshCw,
  AlertCircle,
  User,
  School,
  Calendar as CalendarIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'Reviewed': { color: 'bg-blue-100 text-blue-800', icon: Eye },
    'Interview': { color: 'bg-purple-100 text-purple-800', icon: Calendar },
    'Accepted': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-1" />
      {status}
    </span>
  );
};

const ApplicationCard = ({ application, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <School className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {application.schoolId?.name || application.schoolName || 'Unknown School'}
            </h3>
            <p className="text-sm text-gray-600">
              School Application
            </p>
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>Submitted: {formatDate(application.submittedDate)}</span>
        </div>
        {application.lastUpdated && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>Updated: {formatDate(application.lastUpdated)}</span>
          </div>
        )}
      </div>

      {application.note && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> {application.note}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => onViewDetails(application)}
          className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </button>
        
        <button
          onClick={async () => {
            const formId = application.formId || application._id || application.id;
            if (formId) {
              try {
                toast.info('Tracking application status...');
                const result = await trackForm(formId);
                console.log('📊 Track form result:', result);
                
                // Display tracking information
                const trackingData = result.data || result;
                const schoolName = trackingData.schoolId?.name || 'Unknown School';
                const currentStatus = trackingData.status || 'Unknown';
                const lastUpdated = trackingData.updatedAt || trackingData.createdAt;
                
                toast.success(`Status: ${currentStatus} at ${schoolName}`, {
                  autoClose: 5000,
                  hideProgressBar: false,
                });
                
                // Log detailed tracking info for debugging
                console.log('📋 Detailed tracking info:', {
                  formId: trackingData._id,
                  school: schoolName,
                  status: currentStatus,
                  lastUpdated: lastUpdated,
                  studentPdf: trackingData.studId?.pdfFile ? 'Available' : 'Not available'
                });
                
              } catch (error) {
                console.error('Error tracking form:', error);
                toast.error('Failed to track status. Please try again.');
              }
            } else {
              toast.error('Unable to track form: Invalid form ID');
              console.warn('No valid form ID found for application:', application);
            }
          }}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4 mr-2" />
          Track Status
        </button>
      </div>
    </div>
  );
};

const StudentApplicationTrackingPage = () => {
  const { user: currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const statusOptions = ['All', 'Pending', 'Reviewed', 'Interview', 'Accepted', 'Rejected'];

  const fetchApplications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const studentId = currentUser.studentId || currentUser._id;
      const status = selectedStatus === 'All' ? null : selectedStatus;
      
      console.log(`🔍 Fetching applications for student: ${studentId}, status: ${status}`);
      const response = await getStudentForms(studentId, status);
      
      console.log('✅ Applications fetched:', response.data?.length || 0, 'applications');
      setApplications(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      setError(error.message || 'Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      fetchApplications();
    }
  }, [currentUser, selectedStatus]);

  const handleViewDetails = (application) => {
    // Try multiple possible student ID locations
    const studId = application.studId || application.studentId || application._id || application.id;
    if (studId) {
      console.log('🔗 Opening details for student:', studId);
      window.open(`/api/users/pdf/view/${studId}`, '_blank');
    } else {
      toast.error('Unable to view details: Student ID not found');
      console.warn('No student ID found for application:', application);
    }
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  const handleRefresh = () => {
    fetchApplications(true);
  };

  const getStatusCounts = () => {
    const counts = {
      All: applications.length,
      Pending: 0,
      Reviewed: 0,
      Interview: 0,
      Accepted: 0,
      Rejected: 0
    };

    applications.forEach(app => {
      if (counts.hasOwnProperty(app.status)) {
        counts[app.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
              <p className="text-gray-600">Track the status of your school applications</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {status} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        {/* Applications Grid */}
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'All' 
                ? "You haven't submitted any applications yet."
                : `No applications with status "${selectedStatus}" found.`
              }
            </p>
            <a
              href="/schools"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <School className="w-4 h-4 mr-2" />
              Browse Schools
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications.map((application, index) => (
              <ApplicationCard
                key={application.formId || application._id || application.id || `app-${index}`}
                application={application}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {applications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {statusOptions.slice(1).map((status) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{statusCounts[status]}</div>
                  <div className="text-sm text-gray-600">{status}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentApplicationTrackingPage;
