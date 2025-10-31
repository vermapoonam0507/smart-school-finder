/**
 * Service to handle interview notifications for students
 */

import { getStudentForms } from '../api/applicationService';

/**
 * Check if student has any new interview notifications
 * @param {string} studentId - Student ID
 * @returns {Promise<Object|null>} Interview notification data or null
 */
export const checkForInterviewNotifications = async (studentId) => {
  try {
    // Validate studentId
    if (!studentId || typeof studentId !== 'string' || studentId === 'undefined' || studentId === 'null') {
      console.warn('Invalid studentId for interview notifications:', studentId);
      return null;
    }

    // Get all applications for the student
    const response = await getStudentForms(studentId);
    const applications = response.data || [];

    // Find applications with "Interview" or "WrittenExam" status (case-insensitive)
    const interviewApplications = applications.filter(app => {
      const st = (app.status || '').toString().toLowerCase();
      return st === 'interview' || st === 'writtenexam' || st === 'written exam' || st === 'exam';
    });

    if (interviewApplications.length === 0) {
      return null;
    }

    // Check if there are any new interview notifications
    // (This could be enhanced to check against a "last checked" timestamp)
    const hasNewInterviews = interviewApplications.some(app => {
      // Check if this interview was scheduled recently (within last 24 hours)
      const interviewDate = new Date(app.updatedAt || app.createdAt);
      const now = new Date();
      const hoursDiff = (now - interviewDate) / (1000 * 60 * 60);
      
      return hoursDiff <= 24; // Consider interviews scheduled in last 24 hours as "new"
    });

    if (!hasNewInterviews) {
      return null;
    }

    // Return the most recent interview/written-exam application
    const latestInterview = interviewApplications.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    })[0];

    // Determine notification type based on status
    const statusKey = (latestInterview.status || '').toString().toLowerCase();
    const notificationType = statusKey === 'writtenexam' || statusKey === 'written exam' || statusKey === 'exam' ? 'WrittenExam' : 'Interview';

    return {
      application: latestInterview,
      schoolName: latestInterview.schoolId?.name || latestInterview.schoolName || 'Unknown School',
      interviewData: latestInterview,
      notificationType
    };

  } catch (error) {
    console.error('Error checking for interview notifications:', error);
    return null;
  }
};

/**
 * Parse interview details from note field
 * @param {string} note - Note field containing interview details
 * @returns {Object} Parsed interview details
 */
export const parseInterviewDetails = (note) => {
  if (!note) return null;

  const details = {
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
    const lines = note.split('\n');
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

/**
 * Check if interview details are complete
 * @param {Object} interviewDetails - Parsed interview details
 * @returns {boolean} True if details are complete
 */
export const isInterviewDetailsComplete = (interviewDetails) => {
  if (!interviewDetails) return false;
  
  return !!(interviewDetails.date && interviewDetails.time && interviewDetails.venue);
};

/**
 * Format interview date for display
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export const formatInterviewDate = (dateString) => {
  if (!dateString) return 'Not specified';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
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

/**
 * Format interview time for display
 * @param {string} timeString - Time string
 * @returns {string} Formatted time
 */
export const formatInterviewTime = (timeString) => {
  if (!timeString) return 'Not specified';
  
  try {
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