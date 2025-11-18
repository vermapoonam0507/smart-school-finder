import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { School, LogOut, FileText, Eye, Star, Check, X, Calendar } from "lucide-react";
import {
  getSchoolById,
  getPendingSchools,
  checkSchoolProfileExists,
  getSchoolByAuthId,
} from "../api/adminService";
import RegistrationPage from "./RegistrationPage";
import { fetchStudentApplications, updateApplicationStatus } from "../api/apiService";
import { getSchoolForms, updateFormStatus } from "../api/applicationService";
import InterviewSchedulingModal from "../components/InterviewSchedulingModal";
import WrittenExamSchedulingModal from "../components/WrittenExamSchedulingModal";
import { useAuth } from "../context/AuthContext";
import ErrorBoundary from "../components/ErrorBoundary";
import { toast } from "react-toastify";
import Logo from "../components/Logo";

const SchoolHeader = ({ schoolName, onLogout, applicationsCount, hasProfile, currentUser }) => (
  <header className="bg-white shadow-md">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Logo to="/school-portal" size="default" />
      <div className="flex items-center space-x-6">
        {currentUser?.userType === 'school' && (
          <Link
            to="/school-portal/register"
            className="text-gray-600 hover:text-blue-600 flex items-center"
          >
            <FileText size={18} className="mr-2" /> {hasProfile ? 'School Profile' : 'School Registration'}
          </Link>
        )}
        {/* Approval Status removed per request */}
        <Link
          to="/school-portal/shortlisted"
          className="text-gray-600 hover:text-blue-600 flex items-center"
        >
          <Star size={18} className="mr-2" /> Shortlisted Applications
        </Link>
        <Link
          to="/school-portal/applications"
          className="text-gray-600 hover:text-blue-600 flex items-center relative"
        >
          <Eye size={18} className="mr-2" /> View Student Applications
          {typeof applicationsCount === 'number' && (
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-semibold rounded-full bg-blue-600 text-white">
              {applicationsCount}
            </span>
          )}
        </Link>
        <span className="text-gray-500">|</span>
        <button
          onClick={onLogout}
          className="text-gray-600 hover:text-blue-600 flex items-center"
        >
          <LogOut size={16} className="mr-1" /> Logout
        </button>
      </div>
    </nav>
  </header>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    interview: "bg-purple-100 text-purple-800",
    writtenexam: "bg-indigo-100 text-indigo-800",
  };
  // Friendly label mapping
  const labelMap = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    interview: 'Interview',
    writtenexam: 'Written Exam'
  };
  const key = (status || 'unknown').toString().toLowerCase();
  const cls = map[key] || "bg-gray-100 text-gray-800";
  const label = labelMap[key] || (status || 'Unknown');
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}>{label}</span>;
};

// Approval Status section removed per request


const ViewStudentApplications = ({}) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showInterviewDetailsModal, setShowInterviewDetailsModal] = useState(false);
  const [selectedInterviewApplication, setSelectedInterviewApplication] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showWrittenExamModal, setShowWrittenExamModal] = useState(false);
  const [selectedWrittenExamApplication, setSelectedWrittenExamApplication] = useState(null);
  const [detectedSchoolId, setDetectedSchoolId] = useState(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const fetchApplications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // First, use authId to find the school profile and get the correct schoolId
      console.log(`🔍 [SCHOOL DETECTION] Starting school detection using authId: ${currentUser?._id}`);

      let schoolId = null;
      let schoolIdentifier = null;

      if (currentUser?._id) {
        try {
          console.log(`🔑 [AUTH ID LOOKUP] Finding school profile for authId: ${currentUser._id}`);

          // Use authId to find the school in schools collection where authId matches
          const schoolProfileResponse = await getSchoolByAuthId(currentUser._id);
          const schoolProfileData = schoolProfileResponse?.data;

          console.log(`🏫 [SCHOOL PROFILE] Found school by authId:`, {
            profileData: schoolProfileData,
            hasData: !!schoolProfileData,
            profileKeys: schoolProfileData ? Object.keys(schoolProfileData) : []
          });

          if (schoolProfileData?.data?._id) {
            schoolId = schoolProfileData.data._id;
            schoolIdentifier = schoolId;
            console.log(`✅ [SCHOOL ID FOUND] Extracted schoolId from schools collection: ${schoolId}`);
          } else if (schoolProfileData?._id) {
            schoolId = schoolProfileData._id;
            schoolIdentifier = schoolId;
            console.log(`✅ [SCHOOL ID FOUND] Direct schoolId from schools collection: ${schoolId}`);
          } else {
            console.warn(`⚠️ [NO SCHOOL PROFILE] No school found for authId: ${currentUser._id}`);
            // Fallback to currentUser schoolId
            schoolId = currentUser?.schoolId;
            schoolIdentifier = schoolId || currentUser?._id || currentUser?.email;
            console.log(`🔄 [FALLBACK] Using fallback identifier: ${schoolIdentifier}`);
          }
        } catch (profileError) {
          console.warn(`⚠️ [PROFILE LOOKUP ERROR] Could not find school profile by authId:`, {
            authId: currentUser?._id,
            error: profileError.message,
            status: profileError.response?.status,
            responseData: profileError.response?.data
          });

          // Fallback to currentUser schoolId
          schoolId = currentUser?.schoolId;
          schoolIdentifier = schoolId || currentUser?._id || currentUser?.email;
          console.log(`🔄 [FALLBACK AFTER ERROR] Using fallback identifier: ${schoolIdentifier}`);
        }
      } else {
        console.warn(`⚠️ [NO AUTH ID] No authId found in currentUser, using fallback`);
        schoolId = currentUser?.schoolId;
        schoolIdentifier = schoolId || currentUser?._id || currentUser?.email;
      }

      console.log(`🎯 [FINAL SCHOOL ID] Using schoolId: ${schoolId}, identifier: ${schoolIdentifier}`, {
        authId: currentUser?._id,  // This is the user ID from Auth collection
        userEmail: currentUser?.email,
        userType: currentUser?.userType,
        originalUserSchoolId: currentUser?.schoolId,  // This might be wrong
        detectedSchoolId: schoolId,  // This is the correct school ID from schools collection
        finalIdentifier: schoolIdentifier
      });

      // Fetch applications using the correct school identifier
      console.log(`📡 [API CALL] Fetching forms with school identifier: ${schoolIdentifier}`);
      const response = await fetchStudentApplications(schoolIdentifier);
      console.log(`✅ [API RESPONSE] Forms fetched successfully:`, {
        totalForms: response.data?.length || 0,
        hasData: !!response.data,
        responseKeys: Object.keys(response)
      });

      // Use the schoolId we already detected from the profile
      let detectedSchoolId = schoolId; // Use the schoolId from email lookup

      // If we didn't get schoolId from profile, try to detect it from forms as fallback
      if (!detectedSchoolId && response.data && response.data.length > 0) {
        console.log(`🔍 [FORM FALLBACK] Detecting schoolId from forms since profile lookup failed...`);

        // Extract schoolId from the first form that has it
        for (const [index, app] of response.data.entries()) {
          console.log(`📋 [FORM ${index}] Analyzing form:`, {
            formId: app?._id || app?.id,
            hasSchoolId: !!app?.schoolId,
            schoolId: app?.schoolId,
            hasStudId: !!app?.studId,
            studId: app?.studId,
            status: app?.status,
            studentName: app?.studentName
          });

          if (app?.schoolId && !detectedSchoolId) {
            detectedSchoolId = typeof app.schoolId === 'object' ? app.schoolId._id || app.schoolId : app.schoolId;
            console.log(`🎯 [SCHOOL ID DETECTED FROM FORM] Found schoolId from form ${index}: ${detectedSchoolId}`);
            break;
          }
        }
      }

      // Store the detected schoolId
      setDetectedSchoolId(detectedSchoolId);
      console.log(`🔄 [STATE UPDATE] Set detectedSchoolId to: ${detectedSchoolId}`);

      // Log each application to see the structure after update
      if (response.data && response.data.length > 0) {
        response.data.forEach((app, index) => {
          console.log(`📄 [FORM ${index} DETAILS]`, {
            id: app._id,
            formId: app?._id,
            studentId: app?.studId,
            schoolId: app?.schoolId,
            detectedSchoolId: detectedSchoolId,
            status: app.status,
            studentName: app.studentName,
            class: app.class,
            date: app.date,
            applicationData: app.applicationData ? 'present' : 'missing',
            pdfUrl: app.pdfUrl ? 'present' : 'missing',
            _raw: app._raw ? 'present' : 'missing'
          });
        });
      }

      // Filter to show only PENDING, REJECTED, and REVIEWED applications
      // Accepted, Interview, Written Exam, and Shortlisted go to "Shortlisted Applications"
      const pendingApplications = (response.data || []).filter((a) => {
        const status = (a.status || '').toString().toLowerCase();
        const keepInViewStudent = status === 'pending' ||
                                  status === 'rejected' ||
                                  status === 'reviewed' ||
                                  status === '';

        console.log(`📋 [STATUS FILTER] Application status check:`, {
          applicationId: a._id || a.id,
          studentId: a?.studId,
          schoolId: detectedSchoolId,
          status: a.status,
          normalizedStatus: status,
          showInViewStudentApplications: keepInViewStudent
        });

        return keepInViewStudent;
      });

      console.log(`📊 [FILTER RESULTS] Filtered applications:`, {
        totalForms: response.data?.length || 0,
        pendingApplications: pendingApplications.length,
        schoolId: detectedSchoolId,
        studentIds: pendingApplications.map(a => a?.studId).filter(Boolean),
        applicationIds: pendingApplications.map(a => a?._id || a?.id).filter(Boolean)
      });

      setApplications(pendingApplications);
    } catch (error) {
      console.error('❌ [FETCH APPLICATIONS ERROR] Failed to fetch applications:', {
        errorMessage: error.message,
        errorStack: error.stack,
        httpStatus: error.response?.status,
        httpStatusText: error.response?.statusText,
        responseData: error.response?.data,
        requestUrl: error.config?.url,
        requestMethod: error.config?.method,
        requestData: error.config?.data,
        // ID context
        attemptedSchoolIdentifier: currentUser?.schoolId || currentUser?._id || currentUser?.email,
        detectedSchoolId: detectedSchoolId,
        currentUser: {
          _id: currentUser?._id,
          email: currentUser?.email,
          userType: currentUser?.userType,
          schoolId: currentUser?.schoolId
        },
        // Error classification
        isNetworkError: !error.response,
        is4xxError: error.response?.status >= 400 && error.response?.status < 500,
        is5xxError: error.response?.status >= 500,
        fullError: error
      });
      setError(error.message || "Failed to fetch applications");
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      fetchApplications();
    } else {
      console.warn("⚠️ No current user found for ViewStudentApplications");
      setLoading(false);
    }
  }, [currentUser, selectedStatus]);

  // Listen for new applications
  useEffect(() => {
    const handleNewApplication = (event) => {
      console.log('📨 New application received:', event.detail);
      // Refresh applications when a new one is added
      if (event.detail.schoolId === detectedSchoolId || !detectedSchoolId) {
        console.log('🔄 Refreshing applications due to new application');
        fetchApplications(true);
      }
    };

    // Listen for application events
    window.addEventListener('applicationAdded', handleNewApplication);
    
    return () => {
      window.removeEventListener('applicationAdded', handleNewApplication);
    };
  }, [detectedSchoolId]);

  const handleStatusChange = async (app, newStatus) => {
    // Try multiple possible form ID locations
    const formId = app?._id || app?.formId || app?.id || app?._raw?._id;
    
    if (!formId) {
      console.warn('❌ No valid form id to update:', {
        applicationId: app?._id || app?.id,
        studentId: app?.studId || app?.studentId,
        schoolId: detectedSchoolId,
        status: app?.status,
        newStatus,
        availableKeys: Object.keys(app || {}),
        fullApplicationData: app
      });
      console.log('Available app properties:', Object.keys(app));
      return;
    }

    // Optimistic UI update
    setApplications((prevApps) =>
      prevApps.map((a) =>
        a.id === app.id ? { ...a, status: newStatus } : a
      )
    );

    try {
      console.log(`🔄 Updating form ${formId} to status: ${newStatus}`, {
        formId,
        newStatus,
        schoolId: detectedSchoolId,
        studentId: app?.studId || app?.studentId,
        applicationId: app?._id || app?.id
      });
      await updateFormStatus(formId, newStatus);
      console.log('✅ Status updated successfully:', {
        formId,
        newStatus,
        schoolId: detectedSchoolId,
        studentId: app?.studId || app?.studentId,
        applicationId: app?._id || app?.id
      });
      toast.success(`Application status updated to ${newStatus}`);
    } catch (e) {
      console.error('❌ Failed to update form status:', {
        formId,
        newStatus,
        schoolId: detectedSchoolId,
        studentId: app?.studId || app?.studentId,
        applicationId: app?._id || app?.id,
        error: e.message,
        status: e.response?.status,
        responseData: e.response?.data,
        fullError: e
      });
      // Revert optimistic update by refetching
      try {
        const response = await fetchStudentApplications(currentUser?.schoolId || currentUser?._id || currentUser?.email);
        const pendingApplications = (response.data || []).filter((a) => {
          const status = (a.status || '').toString().toLowerCase();
          return status === 'pending' || status === 'rejected' || status === 'reviewed' || status === '';
        });
        setApplications(pendingApplications);
        toast.error('Failed to update status. Changes reverted.');
      } catch (_) {
        toast.error('Failed to update status and unable to reload.');
      }
    }
  };

  const handleScheduleInterview = (app) => {
    // Extract form ID for the interview modal
    const formId = app?._id || app?.formId || app?.id || app?._raw?._id;
    if (!formId) {
      console.warn('❌ No valid form id for interview scheduling:', {
        applicationId: app?._id || app?.id,
        studentId: app?.studId || app?.studentId,
        schoolId: detectedSchoolId,
        status: app?.status,
        availableKeys: Object.keys(app || {}),
        fullApplicationData: app
      });
      toast.error('Cannot schedule interview: Invalid application data');
      return;
    }
    
    // Add formId to the application object for the modal
    const appWithFormId = { ...app, formId };
    setSelectedApplication(appWithFormId);
    setShowInterviewModal(true);
  };

  const handleScheduleWrittenExam = (app) => {
    const formId = app?._id || app?.formId || app?.id || app?._raw?._id;
    if (!formId) {
      console.warn('❌ No valid form id for written exam scheduling:', {
        applicationId: app?._id || app?.id,
        studentId: app?.studId || app?.studentId,
        schoolId: detectedSchoolId,
        status: app?.status,
        availableKeys: Object.keys(app || {}),
        fullApplicationData: app
      });
      toast.error('Cannot schedule written exam: Invalid application data');
      return;
    }
    const appWithFormId = { ...app, formId };
    setSelectedWrittenExamApplication(appWithFormId);
    setShowWrittenExamModal(true);
  };

  const handleInterviewScheduled = async (formId, status, note) => {
    try {
      console.log('📝 Scheduling interview with note:', note);
      console.log('🔄 Calling updateFormStatus with:', { formId, status, note });

      // Use updateFormStatus which properly handles the note parameter in the request body
      const result = await updateFormStatus(formId, status, note);
      console.log('✅ Interview scheduled successfully:', {
        formId,
        status,
        note,
        schoolId: detectedSchoolId,
        studentId: selectedApplication?.studId || selectedApplication?.studentId,
        applicationId: selectedApplication?._id || selectedApplication?.id,
        apiResponse: result
      });

      toast.success('Interview scheduled successfully!');
      console.log('🔄 Refreshing applications data...');
      await fetchApplications(true);
    } catch (error) {
      console.error('❌ [INTERVIEW SCHEDULING ERROR] Failed to schedule interview:', {
        errorMessage: error.message,
        errorStack: error.stack,
        httpStatus: error.response?.status,
        httpStatusText: error.response?.statusText,
        responseData: error.response?.data,
        requestUrl: error.config?.url,
        requestMethod: error.config?.method,
        requestData: error.config?.data,
        // ID context
        formId: formId,
        status: status,
        note: note,
        schoolId: detectedSchoolId,
        studentId: selectedApplication?.studId || selectedApplication?.studentId,
        applicationId: selectedApplication?._id || selectedApplication?.id,
        // Current user context
        currentUser: {
          _id: currentUser?._id,
          email: currentUser?.email,
          userType: currentUser?.userType,
          schoolId: currentUser?.schoolId
        },
        // Application context
        selectedApplicationKeys: Object.keys(selectedApplication || {}),
        selectedApplicationData: selectedApplication,
        fullError: error
      });
      toast.error('Failed to schedule interview');
    }
  };

  const handleWrittenExamScheduled = async (formId, status, note) => {
    try {
      console.log('📝 Scheduling written exam with note:', note);
      console.log('🔄 Calling updateFormStatus with:', { formId, status, note });
      const result = await updateFormStatus(formId, status, note);
      console.log('✅ Written exam scheduled successfully:', {
        formId,
        status,
        note,
        schoolId: detectedSchoolId,
        studentId: selectedWrittenExamApplication?.studId || selectedWrittenExamApplication?.studentId,
        applicationId: selectedWrittenExamApplication?._id || selectedWrittenExamApplication?.id,
        apiResponse: result
      });
      toast.success('Written exam scheduled successfully!');
      console.log('🔄 Refreshing applications data...');
      await fetchApplications(true);
    } catch (error) {
      console.error('❌ [WRITTEN EXAM SCHEDULING ERROR] Failed to schedule written exam:', {
        errorMessage: error.message,
        errorStack: error.stack,
        httpStatus: error.response?.status,
        httpStatusText: error.response?.statusText,
        responseData: error.response?.data,
        requestUrl: error.config?.url,
        requestMethod: error.config?.method,
        requestData: error.config?.data,
        // ID context
        formId: formId,
        status: status,
        note: note,
        schoolId: detectedSchoolId,
        studentId: selectedWrittenExamApplication?.studId || selectedWrittenExamApplication?.studentId,
        applicationId: selectedWrittenExamApplication?._id || selectedWrittenExamApplication?.id,
        // Current user context
        currentUser: {
          _id: currentUser?._id,
          email: currentUser?.email,
          userType: currentUser?.userType,
          schoolId: currentUser?.schoolId
        },
        // Application context
        selectedWrittenExamApplicationKeys: Object.keys(selectedWrittenExamApplication || {}),
        selectedWrittenExamApplicationData: selectedWrittenExamApplication,
        fullError: error
      });
      toast.error('Failed to schedule written exam');
    }
  };

  const handleShowInterviewDetails = (app) => {
    try {
      // Use the existing form data from the application object
      // The interview notes should already be available in the form data
      console.log('📋 Interview details from existing form data:', app);
      console.log('🔍 All available fields in app:', Object.keys(app));
      console.log('🔍 Interview status:', app?.status);
      console.log('🔍 Available note fields:', {
        note: app?.note,
        interviewNote: app?.interviewNote,
        formDetails: app?.formDetails,
        applicationData: app?.applicationData,
        _raw: app?._raw
      });

      // Set the application data for the modal using existing form data
      const interviewNote = app?.note ||
                      app?.formDetails?.note ||
                      app?.applicationData?.note ||
                      app?._raw?.note ||
                      app?.applicationData?.formData?.note ||
                      app?.interviewNote ||  // Direct field from database
                      app?._raw?.interviewNote ||
                      app?.formDetails?.interviewNote ||
                      app?.applicationData?.interviewNote ||
                      app?._raw?.data?.note ||
                      app?.formDetails?.data?.note ||
                      app?.data?.note ||
                      app?.formData?.note ||
                      'No interview details available';

      // Try to find interview notes in any text field that contains interview-related content
      let fallbackNote = 'No interview details available';
      if (interviewNote === 'No interview details available' || !interviewNote) {
        const allKeys = Object.keys(app || {});
        for (const key of allKeys) {
          const value = app[key];
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
        ...app,
        interviewNote: interviewNote !== 'No interview details available' ? interviewNote : fallbackNote
      });

      setShowInterviewDetailsModal(true);
    } catch (error) {
      console.error('❌ Error showing interview details:', {
        applicationId: app?._id || app?.id,
        studentId: app?.studId || app?.studentId,
        schoolId: detectedSchoolId,
        status: app?.status,
        error: error.message,
        fullError: error
      });
      toast.error('Failed to load interview details');
    }
  };


  const handleOpenDetails = (app) => {
    const statusLower = (app.status || '').toString().toLowerCase();

    // If status is Interview, show interview details instead of PDF
    if (statusLower === 'interview') {
      handleShowInterviewDetails(app);
      return;
    }

    // For other statuses, open PDF
    // Extract studId properly - handle both string and object formats
    let studId = null;

    if (typeof app?.studId === 'string') {
      // Case 1: studId is already a string
      studId = app.studId;
    } else if (typeof app?.studId === 'object' && app?.studId?._id) {
      // Case 2: studId is an object with _id property
      studId = app.studId._id;
    } else if (typeof app?.studentId === 'string') {
      // Case 3: studentId is a string
      studId = app.studentId;
    } else if (typeof app?.studentId === 'object' && app?.studentId?._id) {
      // Case 4: studentId is an object with _id property
      studId = app.studentId._id;
    } else if (app?._id) {
      // Case 5: fallback to application _id
      studId = app._id;
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
      console.warn('❌ No student ID found for application:', {
        applicationId: app?._id || app?.id,
        formId: app?.formId,
        schoolId: detectedSchoolId,
        status: app?.status,
        studId: app?.studId,
        studentId: app?.studentId,
        availableKeys: Object.keys(app || {}),
        fullApplicationData: app
      });
      console.log('Available app properties:', Object.keys(app));
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statusToLower = (s) => (s || '').toString().toLowerCase();

  const rows = applications;

  const statusOptions = ['All', 'Pending', 'Reviewed', 'Interview', 'WrittenExam', 'Accepted', 'Rejected'];

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Student Applications
        </h2>
        <button
          onClick={() => fetchApplications(true)}
          disabled={refreshing || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {refreshing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
            {status}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Student Name</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Class</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Details</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              return applications.map((app, index) => {
                const statusLower = (app.status || '').toString().toLowerCase();
                const isAccepted = statusLower === 'accepted';
                const isRejected = statusLower === 'rejected';
                return (
              <tr key={app._id || app.id || app.formId || `app-${index}`} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-4 align-top">{app.studentName}</td>
                <td className="p-4 align-top">{app.class}</td>
                <td className="p-4 align-top">{app.date}</td>
                <td className="p-4 align-top">
                  <button onClick={() => handleOpenDetails(app)} className="text-sm text-blue-600 hover:underline">
                    View Details
                  </button>
                </td>
                <td className="p-4 align-top">
                  {/* Replaced inline badge with StatusBadge component for consistency */}
                  <StatusBadge status={statusLower} />
                </td>
                <td className="p-4 flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => handleStatusChange(app, "Reviewed")}
                    className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200"
                    title="Mark as Reviewed"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleScheduleInterview(app)}
                    className="p-2 text-purple-600 bg-purple-100 rounded-full hover:bg-purple-200"
                    title="Schedule Interview"
                  >
                    <Calendar size={16} />
                  </button>
                  <button
                    onClick={() => handleScheduleWrittenExam(app)}
                    className="p-2 text-indigo-600 bg-indigo-100 rounded-full hover:bg-indigo-200"
                    title="Schedule Written Exam"
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    onClick={() => handleStatusChange(app, "Accepted")}
                    className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200"
                    title="Accept"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleStatusChange(app, "Rejected")}
                    className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200"
                    title="Reject"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
                );
              });
            })()}
          </tbody>
        </table>
        {applications.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            No student applications received yet.
          </p>
        )}
        {applications.length > 0 && (() => {
          const total = applications.length;
          const pending = applications.filter(a => (a.status || '').toString().toLowerCase() === 'pending').length;
          const interview = applications.filter(a => (a.status || '').toString().toLowerCase() === 'interview').length;
          const writtenExam = applications.filter(a => (a.status || '').toString().toLowerCase() === 'writtenexam').length;
          const accepted = applications.filter(a => (a.status || '').toString().toLowerCase() === 'accepted').length;
          const rejected = applications.filter(a => (a.status || '').toString().toLowerCase() === 'rejected').length;
          return (
            <div className="px-4 py-3 bg-white flex items-center justify-between text-sm text-gray-700">
              <span>Total Applications: <span className="font-semibold">{total}</span></span>
              <div className="flex items-center gap-6">
                <span>Pending: <span className="font-semibold">{pending}</span></span>
                <span>Interview: <span className="font-semibold">{interview}</span></span>
                <span>Written Exam: <span className="font-semibold">{writtenExam}</span></span>
                <span>Accepted: <span className="font-semibold">{accepted}</span></span>
                <span>Rejected: <span className="font-semibold">{rejected}</span></span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Interview Scheduling Modal */}
      {showInterviewModal && selectedApplication && (
        <InterviewSchedulingModal
          isOpen={showInterviewModal}
          onClose={() => setShowInterviewModal(false)}
          application={selectedApplication}
          onSchedule={handleInterviewScheduled}
        />
      )}

      {/* Written Exam Scheduling Modal */}
      {showWrittenExamModal && selectedWrittenExamApplication && (
        <WrittenExamSchedulingModal
          isOpen={showWrittenExamModal}
          onClose={() => setShowWrittenExamModal(false)}
          application={selectedWrittenExamApplication}
          onSchedule={handleWrittenExamScheduled}
        />
      )}

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
                    {selectedInterviewApplication?.studId?.name || selectedInterviewApplication?.studentName} - {selectedInterviewApplication?.schoolId?.name || selectedInterviewApplication?.schoolName || 'School'}
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
                  <p><strong>Student:</strong> {selectedInterviewApplication?.studId?.name || selectedInterviewApplication?.studentName || 'N/A'}</p>
                  <p><strong>School:</strong> {selectedInterviewApplication?.schoolId?.name || selectedInterviewApplication?.schoolName || 'N/A'}</p>
                  <p><strong>Class:</strong> {selectedInterviewApplication?.class || 'N/A'}</p>
                  <p><strong>Application Date:</strong> {selectedInterviewApplication?.date || 'N/A'}</p>
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
                        interviewNote: selectedInterviewApplication?.interviewNote,
                        formDetails: selectedInterviewApplication?.formDetails,
                        applicationData: selectedInterviewApplication?.applicationData,
                        _raw: selectedInterviewApplication?._raw,
                        status: selectedInterviewApplication?.status,
                        fullData: selectedInterviewApplication,
                        allKeys: Object.keys(selectedInterviewApplication || {})
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
const ViewShortlistedApplications = ({}) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectedSchoolId, setDetectedSchoolId] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const getApps = async () => {
      try {
        setLoading(true);

        // First, use authId to find the school profile and get the correct schoolId
        console.log(`🔍 [SHORTLIST SCHOOL DETECTION] Starting school detection using authId: ${currentUser?._id}`);

        let schoolId = null;
        let schoolIdentifier = null;

        if (currentUser?._id) {
          try {
            console.log(`🔑 [SHORTLIST AUTH ID LOOKUP] Finding school profile for authId: ${currentUser._id}`);

            // Use authId to find the school in schools collection where authId matches
            const schoolProfileResponse = await getSchoolByAuthId(currentUser._id);
            const schoolProfileData = schoolProfileResponse?.data;

            console.log(`🏫 [SHORTLIST SCHOOL PROFILE] Found school by authId:`, {
              profileData: schoolProfileData,
              hasData: !!schoolProfileData,
              profileKeys: schoolProfileData ? Object.keys(schoolProfileData) : []
            });

            if (schoolProfileData?.data?._id) {
              schoolId = schoolProfileData.data._id;
              schoolIdentifier = schoolId;
              console.log(`✅ [SHORTLIST SCHOOL ID FOUND] Extracted schoolId from schools collection: ${schoolId}`);
            } else if (schoolProfileData?._id) {
              schoolId = schoolProfileData._id;
              schoolIdentifier = schoolId;
              console.log(`✅ [SHORTLIST SCHOOL ID FOUND] Direct schoolId from schools collection: ${schoolId}`);
            } else {
              console.warn(`⚠️ [SHORTLIST NO SCHOOL PROFILE] No school found for authId: ${currentUser._id}`);
              // Fallback to currentUser schoolId
              schoolId = currentUser?.schoolId;
              schoolIdentifier = schoolId || currentUser?._id || currentUser?.email;
              console.log(`🔄 [SHORTLIST FALLBACK] Using fallback identifier: ${schoolIdentifier}`);
            }
          } catch (profileError) {
            console.warn(`⚠️ [SHORTLIST PROFILE LOOKUP ERROR] Could not find school profile by authId:`, {
              authId: currentUser?._id,
              error: profileError.message,
              status: profileError.response?.status,
              responseData: profileError.response?.data
            });

            // Fallback to currentUser schoolId
            schoolId = currentUser?.schoolId;
            schoolIdentifier = schoolId || currentUser?._id || currentUser?.email;
            console.log(`🔄 [SHORTLIST FALLBACK AFTER ERROR] Using fallback identifier: ${schoolIdentifier}`);
          }
        } else {
          console.warn(`⚠️ [SHORTLIST NO AUTH ID] No authId found in currentUser, using fallback`);
          schoolId = currentUser?.schoolId;
          schoolIdentifier = schoolId || currentUser?._id || currentUser?.email;
        }

        console.log(`🎯 [SHORTLIST FINAL SCHOOL ID] Using schoolId: ${schoolId}, identifier: ${schoolIdentifier}`, {
          authId: currentUser?._id,  // This is the user ID from Auth collection
          userEmail: currentUser?.email,
          userType: currentUser?.userType,
          originalUserSchoolId: currentUser?.schoolId,  // This might be wrong
          detectedSchoolId: schoolId,  // This is the correct school ID from schools collection
          finalIdentifier: schoolIdentifier
        });

        const response = await fetchStudentApplications(schoolIdentifier);
        const all = response.data || [];

        // Use the schoolId we already detected from the profile
        let detectedSchoolId = schoolId; // Use the schoolId from email lookup

        // If we didn't get schoolId from profile, try to detect it from forms as fallback
        if (!detectedSchoolId && all && all.length > 0) {
          for (const app of all) {
            if (app.schoolId) {
              detectedSchoolId = typeof app.schoolId === 'object' ? app.schoolId._id || app.schoolId : app.schoolId;
              console.log(`🎯 [SHORTLIST SCHOOL ID DETECTED FROM FORM] Found schoolId from form: ${detectedSchoolId}`);
              break;
            }
          }
        }

        // Store the detected schoolId
        setDetectedSchoolId(detectedSchoolId);

        // Show applications that have been processed: accepted, interview, written exam, or shortlisted
        const processedApplications = all.filter((a) => {
          const status = (a.status || '').toString().toLowerCase();
          const isProcessed = status === 'accepted' || 
                             status === 'interview' || 
                             status === 'writtenexam' || 
                             status === 'shortlisted';
          
          console.log(`📋 Shortlist check:`, {
            id: a._id || a.id,
            status: a.status,
            normalizedStatus: status,
            isProcessed
          });
          
          return isProcessed;
        });
        
        console.log(`📊 Shortlisted: ${processedApplications.length} out of ${all.length} total`);
        setApplications(processedApplications);
      } catch (error) {
        console.error("❌ [SHORTLISTED APPLICATIONS ERROR] Error fetching shortlisted applications:", {
          errorMessage: error.message,
          errorStack: error.stack,
          httpStatus: error.response?.status,
          httpStatusText: error.response?.statusText,
          responseData: error.response?.data,
          requestUrl: error.config?.url,
          requestMethod: error.config?.method,
          requestData: error.config?.data,
          // ID context
          schoolIdentifier: currentUser?.schoolId || currentUser?._id || currentUser?.email,
          detectedSchoolId: detectedSchoolId,
          currentUser: {
            _id: currentUser?._id,
            email: currentUser?.email,
            userType: currentUser?.userType,
            schoolId: currentUser?.schoolId
          },
          // Application context
          totalApplicationsProcessed: all?.length || 0,
          filteredApplicationsCount: applications?.length || 0,
          fullError: error
        });
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?._id) {
      getApps();
    }
  }, [currentUser]);

  if (loading) return <div className="p-8 text-center">Loading shortlisted applications...</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Shortlisted Applications</h2>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Student Name</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Class</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, index) => (
              <tr key={app._id || app.id || app.formId || `app-${index}`} className="border-b last:border-b-0">
                <td className="p-4 text-gray-800">{app.studentName}</td>
                <td className="p-4 text-gray-700">{app.class}</td>
                <td className="p-4 text-gray-700">{app.date}</td>
                <td className="p-4 text-gray-700">
                  <StatusBadge status={(app.status || '').toString().toLowerCase()} />
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">No shortlisted applications yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SchoolPortalPage = ({ currentUser, onLogout, onRegister }) => {
  const navigate = useNavigate();
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [hasProfile, setHasProfile] = useState(null);

  useEffect(() => {
    const loadCount = async () => {
      const idForQuery = currentUser?.schoolId || currentUser?._id;
      if (!idForQuery) return;
      try {
        const res = await fetchStudentApplications(idForQuery);
        const apps = res?.data || [];
        setApplicationsCount(Array.isArray(apps) ? apps.length : 0);
      } catch (error) {
        console.error("❌ Error loading applications count:", {
          schoolId: idForQuery,
          userId: currentUser?._id,
          error: error.message,
          fullError: error
        });
        setApplicationsCount(0);
      }
    };
    loadCount();
  }, [currentUser?.schoolId, currentUser?._id]);

  useEffect(() => {
    // Assume registered for school users by default (hides link), refine after API check
    if (currentUser?.userType === 'school') {
      setHasProfile(true);
    } else if (currentUser?.schoolId) {
      setHasProfile(true);
    } else {
      setHasProfile(null);
    }
  }, [currentUser?.userType, currentUser?.schoolId]);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        // For school users, always set hasProfile to true - no need for API checks
        if (currentUser?.userType === 'school') {
          setHasProfile(true);
          return;
        }

        // For users with schoolId, also assume they have a profile
        if (currentUser?.schoolId) {
          setHasProfile(true);
          return;
        }

        if (!currentUser?._id) {
          setHasProfile(false);
          return;
        }

        // Only do API checks for non-school users without schoolId
        let found = null;
        try {
          const byAuth = await checkSchoolProfileExists(currentUser._id);
          const payload = byAuth?.data;
          found = payload?.data || payload || null;
          if (!found && byAuth?.status === 200) {
            found = { ok: true };
          }
        } catch (_) {}

        // Only try fetching by schoolId; avoid calling with auth _id (not a school id)
        if (!found && currentUser?.schoolId) {
          try {
            const byId = await getSchoolById(currentUser.schoolId, { headers: { 'X-Silent-Request': '1' } });
            const payload = byId?.data;
            found = payload?.data || payload || null;
            if (!found && byId?.status === 200) {
              found = { ok: true };
            }
          } catch (_) {}
        }
        setHasProfile(!!found);
      } catch (_) {
        setHasProfile(false);
      }
    };
    checkProfile();
  }, [currentUser?._id, currentUser?.schoolId, currentUser?.userType]);

  if (!currentUser || currentUser.userType !== "school") {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p>Access Denied. Please log in as a school.</p>
      </div>
    );
  }

  return (
    <div>
      <SchoolHeader schoolName={currentUser?.name} onLogout={onLogout} applicationsCount={applicationsCount} hasProfile={hasProfile} currentUser={currentUser} />
      <Routes>
        <Route
          path="shortlisted"
          element={<ViewShortlistedApplications />}
        />
        {/* Approval Status route removed */}
         <Route
           path="applications"
           element={
             <ErrorBoundary>
               <ViewStudentApplications />
             </ErrorBoundary>
           }
         />
        {currentUser?.userType === 'school' && (
          <Route
            path="register"
            element={
              <RegistrationPage
                onRegister={onRegister}
                onRegisterSuccess={() => navigate("/school-portal/applications")}
              />
            }
          />
        )}

        
        <Route
          index
          element={
            <ErrorBoundary>
              <ViewStudentApplications />
            </ErrorBoundary>
          }
        />
      </Routes>
    </div>
  );
};

export default SchoolPortalPage;
