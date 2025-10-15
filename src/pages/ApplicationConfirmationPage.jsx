import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft, FileText } from 'lucide-react';

const ApplicationConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get schoolId from location state or URL params
  const schoolId = location.state?.schoolId || new URLSearchParams(location.search).get('schoolId');

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleViewPdf = () => {
    // Navigate to application summary with schoolId
    if (schoolId) {
      navigate(`/application-summary?schoolId=${schoolId}`);
    } else {
      navigate('/application-summary');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            You've already submitted this application.
          </h1>
          
          <p className="text-gray-600 mb-8">
            If you need changes, contact support or open the edit flow.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
            {/* View PDF moved to Dashboard */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationConfirmationPage;
