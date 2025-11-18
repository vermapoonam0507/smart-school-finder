import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentForms, trackForm } from '../api/applicationService';
import { getFormsByStudent } from '../api/userService';
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
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'Reviewed': { color: 'bg-blue-100 text-blue-800', icon: Eye },
    'Interview': { color: 'bg-purple-100 text-purple-800', icon: Calendar },
    'WrittenExam': { color: 'bg-indigo-100 text-indigo-800', icon: FileText },
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
  const [showInterviewDetailsModal, setShowInterviewDetailsModal] = useState(false);
  const [selectedInterviewApplication, setSelectedInterviewApplication] = useState(null);

  const statusOptions = ['All', 'Pending', 'Reviewed', 'Interview', 'WrittenExam', 'Accepted', 'Rejected'];

  const fetchApplications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const studentId = currentUser.studentId || currentUser.authId || currentUser._id;
      const status = selectedStatus === 'All' ? null : selectedStatus;
      
      console.log(`🔍 Fetching applications for student: ${studentId}, status: ${status}`);
      const response = await getFormsByStudent(studentId);
      
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
    const statusLower = (application.status || '').toString().toLowerCase();

    // If status is Interview, show interview details instead of PDF
    if (statusLower === 'interview' || statusLower === 'writtenexam' || statusLower.includes('written')) {
      showInterviewDetails(application);
      return;
    }

    // For other statuses, open PDF
    // Extract studId properly - handle both string and object formats
    let studId = null;

    if (typeof application?.studId === 'string') {
      // Case 1: studId is already a string
      studId = application.studId;
    } else if (typeof application?.studId === 'object' && application?.studId?._id) {
      // Case 2: studId is an object with _id property
      studId = application.studId._id;
    } else if (typeof application?.studentId === 'string') {
      // Case 3: studentId is a string
      studId = application.studentId;
    } else if (typeof application?.studentId === 'object' && application?.studentId?._id) {
      // Case 4: studentId is an object with _id property
      studId = application.studentId._id;
    } else if (application?._id) {
      // Case 5: fallback to application _id
      studId = application._id;
    }

    if (studId) {
      console.log('🔗 Opening PDF for student:', studId, 'Type:', typeof studId);
      // Construct URL properly for both dev and production
      const apiBaseURL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL || 'https://backend-tc-sa-v2.onrender.com/api';
      const pdfUrl = import.meta.env.DEV
        ? `/api/users/pdf/view/${studId}`
        : `${apiBaseURL}/users/pdf/view/${studId}`;
      console.log('📄 PDF URL:', pdfUrl);
      window.open(pdfUrl, '_blank');
    } else {
      toast.error('Unable to view details: Student ID not found');
      console.warn('No student ID found for application:', application);
      console.log('Available application properties:', Object.keys(application));
    }
  };

  const showInterviewDetails = (application) => {
    try {
      // Use the existing form data from the application object
      // The interview notes should already be available in the form data
      console.log('📋 Interview details from existing form data:', application);
      console.log('🔍 All available fields in application:', Object.keys(application));
      console.log('🔍 Interview status:', application?.status);
      console.log('🔍 Available note fields:', {
        note: application?.note,
        interviewNote: application?.interviewNote,
        formDetails: application?.formDetails,
        applicationData: application?.applicationData,
        _raw: application?._raw
      });

      // Set the application data for the modal using existing form data
      const interviewNote = application?.note ||
                      application?.formDetails?.note ||
                      application?.applicationData?.note ||
                      application?._raw?.note ||
                      application?.applicationData?.formData?.note ||
                      application?.interviewNote ||  // Direct field from database
                      application?._raw?.interviewNote ||
                      application?.formDetails?.interviewNote ||
                      application?.applicationData?.interviewNote ||
                      application?._raw?.data?.note ||
                      application?.formDetails?.data?.note ||
                      application?.data?.note ||
                      application?.formData?.note ||
                      'No interview details available';

      // Try to find interview notes in any text field that contains interview-related content
      let fallbackNote = 'No interview details available';
      if (interviewNote === 'No interview details available' || !interviewNote) {
        const allKeys = Object.keys(application || {});
        for (const key of allKeys) {
          const value = application[key];
          if (typeof value === 'string' && value.length > 10) {
            // Look for fields that might contain interview details
            if (key.toLowerCase().includes('note') ||
                key.toLowerCase().includes('detail') ||
                key.toLowerCase().includes('interview') ||
                value.toLowerCase().includes('interview') ||
                value.toLowerCase().includes('date') ||
                value.toLowerCase().includes('time') ||
                value.toLowerCase().includes('venue')) {
              fallbackNote = value;
              console.log(`🎯 Found potential interview notes in field '${key}':`, value);
              break;
            }
          }
        }
      }

      setSelectedInterviewApplication({
        ...application,
        interviewNote: interviewNote !== 'No interview details available' ? interviewNote : fallbackNote
      });

      setShowInterviewDetailsModal(true);
    } catch (error) {
      console.error('Error showing interview details:', error);
      toast.error('Failed to load interview details');
    }
  };

  const handleRefresh = () => {
    fetchApplications(true);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  const getStatusCounts = () => {
    const counts = {
      All: applications.length,
      Pending: 0,
      Reviewed: 0,
      Interview: 0,
      WrittenExam: 0,
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

      {/* Interview Details Modal */}
      {showInterviewDetailsModal && selectedInterviewApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Interview Details</h2>
                  <p className="text-sm text-gray-600">
                    {selectedInterviewApplication?.schoolId?.name || selectedInterviewApplication?.schoolName || 'School'} - Interview Scheduled
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInterviewDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-purple-900 mb-2">Interview Information:</h3>
                <div className="text-sm text-purple-800 space-y-1">
                  <p><strong>School:</strong> {selectedInterviewApplication?.schoolId?.name || selectedInterviewApplication?.schoolName || 'N/A'}</p>
                  <p><strong>Application ID:</strong> {selectedInterviewApplication?.formId || selectedInterviewApplication?._id || 'N/A'}</p>
                  <p><strong>Status:</strong> Interview Scheduled</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Interview Notes:</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedInterviewApplication?.interviewNote || 'No interview details available'}
                </div>
                {/* Debug information */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Debug Information:</p>
                  <details className="text-xs text-gray-400">
                    <summary className="cursor-pointer hover:text-gray-600">View Raw Data</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify({
                        note: selectedInterviewApplication?.note,
                        formDetails: selectedInterviewApplication?.formDetails,
                        applicationData: selectedInterviewApplication?.applicationData,
                        _raw: selectedInterviewApplication?._raw,
                        status: selectedInterviewApplication?.status,
                        fullData: selectedInterviewApplication
                      }, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowInterviewDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApplicationTrackingPage;
