import React from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const InterviewNotificationModal = ({ isOpen, onClose, interviewData, schoolName, notificationType }) => {
  const navigate = useNavigate();
  if (!isOpen || !interviewData) return null;

  // Check if this is a written exam notification
  const eventStatus = (interviewData?.status || notificationType || '').toLowerCase();
  const isWrittenExam = eventStatus === 'writtenexam' || eventStatus === 'written exam' || eventStatus === 'exam';

  const parseInterviewDetails = (note) => {
    if (!note) return null;

    const details = {
      type: isWrittenExam ? 'WrittenExam' : 'Interview',
      date: '',
      time: '',
      venue: '',
      contactPerson: '',
      contactPhone: '',
      instructions: '',
      documentsToBring: '',
      additionalNotes: ''
    };

    try {
      // Replace "Interview Scheduled:" with empty string to handle both interview and written exam notes
      const cleanedNote = note.replace(/^(Interview|Written Exam) Scheduled:/, '').trim();
      const lines = cleanedNote.split('\n');
      let currentSection = '';

      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('Date:')) {
          details.date = trimmedLine.replace('- Date:', '').trim();
        } else if (trimmedLine.includes('Time:')) {
          details.time = trimmedLine.replace('- Time:', '').trim();
        } else if (trimmedLine.includes('Venue:')) {
          details.venue = trimmedLine.replace('- Venue:', '').trim();
        } else if (trimmedLine.includes('Contact Person:')) {
          details.contactPerson = trimmedLine.replace('- Contact Person:', '').trim();
        } else if (trimmedLine.includes('Contact Phone:')) {
          details.contactPhone = trimmedLine.replace('- Contact Phone:', '').trim();
        } else if (trimmedLine === 'Instructions:') {
          currentSection = 'instructions';
        } else if (trimmedLine === 'Documents to Bring:') {
          currentSection = 'documents';
        } else if (trimmedLine.includes('Additional Notes:')) {
          currentSection = 'additional';
          details.additionalNotes = trimmedLine.replace('Additional Notes:', '').trim();
        } else if (currentSection === 'instructions' && trimmedLine) {
          details.instructions += (details.instructions ? '\n' : '') + trimmedLine;
        } else if (currentSection === 'documents' && trimmedLine) {
          details.documentsToBring += (details.documentsToBring ? '\n' : '') + trimmedLine;
        } else if (currentSection === 'additional' && trimmedLine) {
          details.additionalNotes += (details.additionalNotes ? '\n' : '') + trimmedLine;
        }
      });
    } catch (error) {
      console.error('Error parsing interview details:', error);
    }

    return details;
  };

  const interviewDetails = parseInterviewDetails(interviewData.note);
  const hasInterviewDetails = interviewDetails && (interviewDetails.date || interviewDetails.time || interviewDetails.venue);

  // Format date and time

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return as-is if not a valid date
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    
    try {
      // Try to parse as time and format it
      const time = new Date(`2000-01-01T${timeString}`);
      if (!isNaN(time.getTime())) {
        return time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{isWrittenExam ? 'Written Exam Scheduled! 🎯' : 'Interview Scheduled! 🎉'}</h2>
              <p className="text-purple-100">{schoolName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Congratulations Message */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">
                {isWrittenExam ? `You have been scheduled for a written exam at ${schoolName}.` : `Congratulations! You have been selected for an interview at ${schoolName}.`}
              </p>
            </div>
          </div>

          {/* Interview Details */}
          {hasInterviewDetails && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                {isWrittenExam ? 'Written Exam Details' : 'Interview Details'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date and Time */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{isWrittenExam ? 'Exam Date' : 'Interview Date'}</p>
                      <p className="text-gray-900 font-semibold">{formatDate(interviewDetails.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{isWrittenExam ? 'Exam Time' : 'Interview Time'}</p>
                      <p className="text-gray-900 font-semibold">{formatTime(interviewDetails.time)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Venue</p>
                      <p className="text-gray-900 font-semibold">{interviewDetails.venue || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  {interviewDetails.contactPerson && (
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Contact Person</p>
                        <p className="text-gray-900 font-semibold">{interviewDetails.contactPerson}</p>
                      </div>
                    </div>
                  )}
                  
                  {interviewDetails.contactPhone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Contact Phone</p>
                        <p className="text-gray-900 font-semibold">{interviewDetails.contactPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              {interviewDetails.instructions && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-green-600" />
                    Important Instructions
                  </h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line">{interviewDetails.instructions}</p>
                  </div>
                </div>
              )}

              {/* Documents to Bring */}
              {interviewDetails.documentsToBring && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-orange-600" />
                    Required Documents
                  </h4>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line">{interviewDetails.documentsToBring}</p>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {interviewDetails.additionalNotes && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-purple-600" />
                    Additional Information
                  </h4>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line">{interviewDetails.additionalNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Interview Details Message */}
          {!hasInterviewDetails && (
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800">
                    {isWrittenExam ? 'Written exam has been scheduled, but detailed information is not available yet. Please contact the school for more details.' : 'Interview has been scheduled, but detailed information is not available yet. Please contact the school for more details.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => {
                onClose();
                navigate('/my-applications');
              }}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
            >
              <FileText className="w-5 h-5 mr-2" />
              View All Applications
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewNotificationModal;
