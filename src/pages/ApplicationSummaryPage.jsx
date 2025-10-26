import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { generateStudentPdf, getApplication } from '../api/userService';
import { FileText, Eye, Download, CheckCircle } from 'lucide-react';

const ApplicationSummaryPage = () => {
  const navigate = useNavigate();
  const { schoolId: paramSchoolId } = useParams();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [application, setApplication] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get schoolId from URL params or query string
  const schoolId = paramSchoolId || new URLSearchParams(location.search).get('schoolId');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadApplication();
  }, [currentUser, navigate]);

  const loadApplication = async () => {
    try {
      setIsLoading(true);
      const appData = await getApplication(currentUser._id);
      setApplication(appData);
    } catch (error) {
      console.error('Error loading application:', error);
      toast.error('Failed to load application data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);
      console.log('Generating PDF for student:', currentUser._id);
      const result = await generateStudentPdf(currentUser._id);
      console.log('PDF generation result:', result);
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewPdf = async () => {
    try {
      console.log('Attempting to view PDF for student:', currentUser._id);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend-tc-sa-v2.onrender.com/api';
      const pdfUrl = import.meta.env.DEV
        ? `/api/users/pdf/view/${currentUser._id}`
        : `${baseUrl}/users/pdf/view/${currentUser._id}`;
      console.log('PDF URL:', pdfUrl);
      
      // First try to generate PDF if it doesn't exist
      try {
        await generateStudentPdf(currentUser._id);
        console.log('PDF generated successfully before viewing');
        toast.success('PDF generated successfully!');
      } catch (genError) {
        console.log('PDF generation failed, trying to view anyway:', genError);
        toast.warning('PDF generation failed, but trying to view existing PDF...');
      }
      
      // Wait a moment for PDF generation to complete
      setTimeout(() => {
        // Open PDF in new tab
        const newWindow = window.open(pdfUrl, '_blank');
        if (!newWindow) {
          toast.error('Please allow popups to view the PDF');
        } else {
          toast.success('PDF opened in new tab');
        }
      }, 2000); // Wait 2 seconds for PDF generation
      
    } catch (error) {
      console.error('Error viewing PDF:', error);
      toast.error(`Failed to view PDF: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      console.log('Attempting to download PDF for student:', currentUser._id);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend-tc-sa-v2.onrender.com/api';
      const pdfUrl = import.meta.env.DEV
        ? `/api/users/pdf/download/${currentUser._id}`
        : `${baseUrl}/users/pdf/download/${currentUser._id}`;
      console.log('Download URL:', pdfUrl);
      
      // First try to generate PDF if it doesn't exist
      try {
        await generateStudentPdf(currentUser._id);
        console.log('PDF generated successfully before download');
        toast.success('PDF generated successfully!');
      } catch (genError) {
        console.log('PDF generation failed, trying to download anyway:', genError);
        toast.warning('PDF generation failed, but trying to download existing PDF...');
      }
      
      // Wait a moment for PDF generation to complete
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `student-application-${currentUser._id}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('PDF download started');
      }, 2000); // Wait 2 seconds for PDF generation
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(`Failed to download PDF: ${error.message || 'Unknown error'}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Application Found</h2>
          <p className="text-gray-600 mb-4">You haven't submitted any applications yet.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header with Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className="flex items-center justify-center bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {/* Note: View/Download actions are available on User Dashboard */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              View and Download actions are available on your Dashboard under "My Applications".
            </p>
          </div>

          {/* Title and Date */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Application Summary</h1>
            <p className="text-gray-600">Generated on: {formatDate(new Date())}</p>
          </div>

          {/* Application Data Table */}
          <div className="overflow-x-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Basic Information</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Field Name</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Name</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.name || 'N/A'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Date of Birth</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{formatDate(application.dob)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Age</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.age || 'N/A'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Gender</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.gender || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Mother Tongue</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.motherTongue || 'N/A'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Place of Birth</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.placeOfBirth || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Specially Abled</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.speciallyAbled ? 'Yes' : 'No'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Specially Abled Type</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.speciallyAbledType || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Nationality</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.nationality || 'N/A'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Religion</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.religion || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Caste</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.caste || 'N/A'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Subcaste</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.subcaste || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Aadhar Number</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.aadharNo || 'N/A'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Blood Group</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.bloodGroup || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Allergic To</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.allergicTo || '-'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Interest</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.interest || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Home Language</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.homeLanguage || 'N/A'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Yearly Budget</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">{application.yearlyBudget || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate(`/apply/${schoolId}`)}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSummaryPage;
