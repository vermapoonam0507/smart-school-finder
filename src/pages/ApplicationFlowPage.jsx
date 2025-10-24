import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  handleApplicationFlow,
  checkApplicationExists,
  updateExistingApplication
} from '../api/applicationService';
import { getSchoolById } from '../api/adminService';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Send, 
  Edit3,
  User,
  School,
  ArrowRight,
  ArrowLeft,
  Clock,
  Info,
  BookOpen
} from 'lucide-react';

const ApplicationFlowPage = () => {
  const navigate = useNavigate();
  const { schoolId } = useParams();
  const { user: currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [scenario, setScenario] = useState(null); // 'first-time', 'returning', 'update'
  const [application, setApplication] = useState(null);
  const [school, setSchool] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Fetch school details
  useEffect(() => {
    if (schoolId) {
      fetchSchoolDetails();
    }
  }, [schoolId]);

  // Check application status on mount (only after school is loaded)
  useEffect(() => {
    if (currentUser?._id && schoolId && school && !schoolLoading) {
      checkApplicationStatus();
    }
  }, [currentUser, schoolId, school, schoolLoading]);

  const fetchSchoolDetails = async () => {
    try {
      setSchoolLoading(true);
      console.log('🏫 Fetching school details for:', schoolId);
      const response = await getSchoolById(schoolId);
      console.log('✅ School details fetched:', response.data.data);
      setSchool(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching school details:', error);
      toast.error('Failed to fetch school details');
      setError('Failed to load school details. Please try again.');
    } finally {
      setSchoolLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use student profile ID if available, otherwise auth ID
      const studentId = currentUser.studentId || currentUser._id;
      console.log('Checking application for user:', currentUser);
      console.log('Using student ID:', studentId);
      const existingApplication = await checkApplicationExists(studentId);
      
      if (existingApplication) {
        // Application exists - Scenario B: Returning applicant
        setScenario('returning');
        setApplication(existingApplication.data);
        toast.info('Application found. You can submit directly to the school or update your information.');
      } else {
        // No application - Scenario A: First-time applicant
        setScenario('first-time');
        setApplication(null);
        toast.info('No application found. Please fill out the application form first.');
      }
    } catch (error) {
      console.error('Error checking application:', error);
      setError('Failed to check application status. Please try again.');
      toast.error('Failed to check application status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSubmit = async () => {
    if (!application || !schoolId) {
      toast.error('Missing application data or school ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const studentId = currentUser.studentId || currentUser._id;
      const result = await handleApplicationFlow(studentId, schoolId);
      
      if (result.success) {
        setFormSubmitted(true);
        if (result.formSubmission?.alreadySubmitted) {
          toast.info('Application already submitted to this school!');
        } else {
          toast.success('Application submitted to school successfully!');
        }
        
        setTimeout(() => {
          navigate('/application-status');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
      toast.error('Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplication = async (updatedData) => {
    setLoading(true);
    setError('');
    
    try {
      const studentId = currentUser.studentId || currentUser._id;
      const result = await updateExistingApplication(studentId, updatedData);
      setApplication(result.data);
      setShowUpdateForm(false);
      toast.success('Application updated successfully!');
    } catch (error) {
      console.error('Error updating application:', error);
      setError('Failed to update application. Please try again.');
      toast.error('Failed to update application.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToForm = () => {
    // Navigate to application form with school context
    navigate(`/student-application/${schoolId}`);
  };

  const handleGoToUpdateForm = (section = null) => {
    // Navigate to application form in update mode
    const params = new URLSearchParams({
      update: 'true'
    });
    if (section) {
      params.append('section', section);
    }
    navigate(`/student-application/${schoolId}?${params.toString()}`);
  };

  if (schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading school details...</p>
        </div>
      </div>
    );
  }

  if (loading && !scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Checking application status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (formSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600 mb-4">
            Your application has been submitted to {school?.name || 'the school'} successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to application status page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apply to {school?.name || 'School'}
          </h1>
          <p className="text-gray-600">
            {scenario === 'first-time' 
              ? 'Fill out your application form to get started'
              : 'Your application is ready to submit or update'
            }
          </p>
        </div>

        {/* Flow Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Application Flow</h3>
              <p className="text-sm text-blue-800">
                {scenario === 'first-time' 
                  ? 'First-time applicants need to fill out the complete application form once. This data will be saved and can be reused for future applications.'
                  : 'You already have an application on file. You can submit directly to schools or update your information if needed.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Scenario A: First-time applicant */}
        {scenario === 'first-time' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">First Time Applicant</h2>
              <p className="text-gray-600">
                You need to create your application first. This is a one-time process.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What you'll need to provide:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Personal details (name, DOB, gender, etc.)</li>
                <li>• Parent/Guardian information</li>
                <li>• Address and contact details</li>
                <li>• Academic background</li>
                <li>• Emergency contacts</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={handleGoToForm}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto"
              >
                <FileText className="h-5 w-5 mr-2" />
                Fill Application Form
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Scenario B: Returning applicant */}
        {scenario === 'returning' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Returning Applicant</h2>
              <p className="text-gray-600">
                Your application already exists. You can submit directly or update your information.
              </p>
            </div>

            {application && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Your Application Details:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 text-gray-900">{application.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(application.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Application ID:</span>
                    <span className="ml-2 font-mono text-gray-900">
                      {application._id || application.id}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowUpdateForm(true)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Update Information
              </button>
              <button
                onClick={handleDirectSubmit}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit to School
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Update Form Modal */}
        {showUpdateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Application</h3>
              <p className="text-gray-600 mb-4">
                What information would you like to update?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowUpdateForm(false);
                    handleGoToUpdateForm('personal');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Update Personal Information
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowUpdateForm(false);
                    handleGoToUpdateForm('parents');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Update Parent/Guardian Information
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowUpdateForm(false);
                    handleGoToUpdateForm('academic');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Update Academic Information
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowUpdateForm(false);
                    handleGoToUpdateForm();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Update All Information
                  </div>
                </button>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUpdateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationFlowPage;
