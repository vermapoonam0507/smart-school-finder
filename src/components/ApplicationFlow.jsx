import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  checkApplicationExists, 
  createApplication, 
  completeApplicationFlow,
  submitFormToSchool 
} from '../api/applicationService';
import { Loader2, CheckCircle, AlertCircle, FileText, Send } from 'lucide-react';

const ApplicationFlow = () => {
  const navigate = useNavigate();
  const { schoolId } = useParams();
  const { user: currentUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [applicationExists, setApplicationExists] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Check if application exists
  useEffect(() => {
    if (currentUser?._id && schoolId) {
      checkExistingApplication();
    }
  }, [currentUser, schoolId]);

  const checkExistingApplication = async () => {
    setLoading(true);
    setError('');
    
    try {
      const application = await checkApplicationExists(currentUser._id);
      
      if (application) {
        setApplicationExists(true);
        setApplicationData(application.data);
        setStep(2); // Skip to Step 2 if application exists
        toast.info('Application already exists. Proceeding to submit to school.');
      } else {
        setApplicationExists(false);
        setStep(1); // Show application form
        toast.info('No existing application found. Please fill out the application form.');
      }
    } catch (error) {
      console.error('Error checking application:', error);
      setError('Failed to check existing application. Please try again.');
      toast.error('Failed to check existing application.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        studId: currentUser._id
      };
      
      const result = await createApplication(payload);
      setApplicationData(result.data);
      setApplicationExists(true);
      setStep(2);
      
      toast.success('Application created successfully!');
    } catch (error) {
      console.error('Error creating application:', error);
      setError('Failed to create application. Please try again.');
      toast.error('Failed to create application.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToSchool = async () => {
    if (!applicationData || !schoolId) {
      toast.error('Missing application data or school ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const formId = applicationData._id || applicationData.id;
      const result = await submitFormToSchool(schoolId, currentUser._id, formId);
      
      setFormSubmitted(true);
      toast.success('Form submitted to school successfully!');
      
      // Navigate to application status page after successful submission
      setTimeout(() => {
        navigate('/application-status');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting form to school:', error);
      setError('Failed to submit form to school. Please try again.');
      toast.error('Failed to submit form to school.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteFlow = async (formData = null) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await completeApplicationFlow(
        currentUser._id, 
        schoolId, 
        formData
      );
      
      setFormSubmitted(true);
      toast.success('Application flow completed successfully!');
      
      // Navigate to application status page
      setTimeout(() => {
        navigate('/application-status');
      }, 2000);
      
    } catch (error) {
      console.error('Error in complete application flow:', error);
      setError('Failed to complete application flow. Please try again.');
      toast.error('Failed to complete application flow.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Checking existing application...</p>
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
            Your application has been submitted to the school successfully.
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
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {applicationExists ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <span className="ml-2 font-medium">Application</span>
            </div>
            
            <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Submit to School</span>
            </div>
          </div>
        </div>

        {/* Step 1: Application Form or Existing Application */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {applicationExists === false ? 'Create Application' : 'Application Status'}
              </h2>
              <p className="text-gray-600">
                {applicationExists === false 
                  ? 'Please fill out the application form to proceed.'
                  : 'Your application is ready to submit to the school.'
                }
              </p>
            </div>

            {applicationExists === false ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  You need to create an application first. Please navigate to the application form.
                </p>
                <button
                  onClick={() => navigate('/student-application')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to Application Form
                </button>
              </div>
            ) : (
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Application exists and is ready to submit.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Proceed to Submit
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Submit to School */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <Send className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit to School</h2>
              <p className="text-gray-600">
                Submit your application to the selected school.
              </p>
            </div>

            {applicationData && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Application Details:</h3>
                <p className="text-sm text-gray-600">
                  Application ID: {applicationData._id || applicationData.id}
                </p>
                <p className="text-sm text-gray-600">
                  Created: {new Date(applicationData.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmitToSchool}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit to School'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationFlow;
