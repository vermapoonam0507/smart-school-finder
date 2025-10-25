import axios from 'axios';
import apiClient from './axios';

const API = axios.create();

let schoolsData = [
    {
        id: 1,
        basicInfo: { name: 'Delhi Public School, RK Puram', description: 'A premier institution known for its academic excellence and holistic development.', board: 'CBSE', state: 'Delhi', city: 'New Delhi', schoolMode: 'private', genderType: 'co-ed', shifts: ['morning'], feeRange: '75000 - 100000', upto: 'Class 12', email: 'contact@dpsrkp.net', mobileNo: '9876543210', website: 'https://dpsrkp.net/', languageMedium: ['English'], transportAvailable: 'yes' },
        activityInfo: { activities: ['Focusing on Academics', 'Empowering in Sports', 'STEM Activities', 'Leadership Development'] },
        alumniInfo: { topAlumnis: [{ name: 'Raghuram Rajan', percentage: 98 }], famousAlumnies: [{ name: 'Shah Rukh Khan', profession: 'Actor' }] },
        amenitiesInfo: { predefinedAmenities: ['Library', 'Science Lab', 'Computer Lab', 'Sports Ground'], customAmenities: 'Robotics Lab, Swimming Pool' }
    },
    {
        id: 2,
        basicInfo: { name: 'Modern School, Barakhamba Road', description: 'Fostering creativity and critical thinking since 1920.', board: 'CBSE', state: 'Delhi', city: 'New Delhi', schoolMode: 'private', genderType: 'co-ed', shifts: ['morning'], feeRange: '1 Lakh - 2 Lakh', upto: 'Class 12', email: 'info@modernschool.net', mobileNo: '9123456789', website: 'https://modernschool.net/', languageMedium: ['English'], transportAvailable: 'yes' },
        activityInfo: { activities: ['Empowering in Arts', 'Cultural Education', 'Technology Integration'] },
        alumniInfo: { topAlumnis: [{ name: 'Khushwant Singh', percentage: 95 }], famousAlumnies: [{ name: 'Gurcharan Das', profession: 'Author' }] },
        amenitiesInfo: { predefinedAmenities: ['Auditorium', 'Art Studio', 'Music Room'], customAmenities: 'Horse Riding Club' }
    },
];

let studentApplicationsData = [
    { id: 1, studentName: 'Rohan Sharma', class: '5', date: '2025-08-15', status: 'Pending', schoolId: 'school123', schoolEmail: 'contact@dpsrkp.net' },
    { id: 2, studentName: 'Priya Singh', class: '6', date: '2025-08-14', status: 'Accepted', schoolId: 'school123', schoolEmail: 'contact@dpsrkp.net' },
    { id: 3, studentName: 'Amit Kumar', class: '7', date: '2025-08-16', status: 'Pending', schoolId: 'school456', schoolEmail: 'info@modernschool.net' },
    { id: 4, studentName: 'Sneha Patel', class: '8', date: '2025-08-17', status: 'Accepted', schoolId: 'school456', schoolEmail: 'info@modernschool.net' },
];

// In apiService.js

// Fetch PDF data (the actual student application file)
export const fetchStudentPDF = async (studId) => {
  try {
    const res = await apiClient.get(`/users/pdf/view/${studId}`, {
      responseType: 'arraybuffer', // Get binary PDF data
      headers: { 'X-Silent-Request': '1' }
    });
    
    console.log(`✅ Fetched PDF for student ${studId}`);
    
    // Convert to blob if you need to display/download
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    
    return {
      blob,
      url: pdfUrl,
      buffer: res.data
    };
  } catch (err) {
    console.warn(`❌ Could not fetch PDF for ${studId}:`, err.message);
    return null;
  }
};
// CORRECTED: Properly fetch from Forms API with debugging

export const fetchStudentApplications = async (schoolIdOrEmail) => {
    const identity = encodeURIComponent(schoolIdOrEmail || '');

    // Only try the forms endpoint - no fallback to applications
    try {
        console.log(`🔍 Fetching forms for school: ${identity}`);
        console.log(`📍 Full URL will be: /api/form/school/${identity}`);
        
        const res = await apiClient.get(`/form/school/${identity}`, { 
            headers: { 'X-Silent-Request': '1' } 
        });
        
        const raw = res?.data;
        console.log(`📦 Raw response:`, raw);
        
        // Handle different response structures
        let forms = [];
        if (Array.isArray(raw)) {
            forms = raw;
        } else if (Array.isArray(raw?.data)) {
            forms = raw.data;
        } else if (Array.isArray(raw?.forms)) {
            forms = raw.forms;
        }

        console.log(`✅ Fetched ${forms.length} forms`);

        if (forms.length === 0) {
            console.warn('⚠️ No forms found for this school');
            return { data: [] };
        }

         // Normalize and fetch PDF data for each form
        const normalized = await Promise.all(
    forms.map(async (form, idx) => {
        // Extract studId - handle BOTH string and populated object
        let studId = null;
        
        if (typeof form?.studId === 'string') {
            // Case 1: studId is a plain string
            studId = form.studId;
            console.log(`✅ Form ${idx} - studId is string: ${studId}`);
        } else if (typeof form?.studId === 'object' && form?.studId?._id) {
            // Case 2: studId is populated object (has _id property)
            studId = String(form.studId._id);
            console.log(`✅ Form ${idx} - studId is populated, extracted _id: ${studId}`);
        } else if (typeof form?.student === 'string') {
            // Case 3: student field is a string
            studId = form.student;
        } else if (typeof form?.student === 'object' && form?.student?._id) {
            // Case 4: student field is an object with _id property
            studId = form.student._id;
        }

        console.log(`🔍 Form ${idx} - studId extracted:`, studId, 'from form:', form);

        // Try to fetch PDF data, but don't let it break the entire process
        let pdfData = null;
        if (studId) {
            try {
                pdfData = await fetchStudentPDF(studId);
            } catch (pdfError) {
                console.warn(`⚠️ Could not fetch PDF for student ${studId}:`, pdfError.message);
                pdfData = null;
            }
        }

        // Fetch student application data to get name and class
        let studentName = '—';
        let studentClass = '—';
        if (studId) {
            try {
                console.log(`🔍 Fetching application data for student: ${studId}`);
                const appResponse = await apiClient.get(`/applications/${studId}`);
                if (appResponse?.data?.data) {
                    const appData = appResponse.data.data;
                    studentName = appData.name || '—';
                    studentClass = appData.classCompleted || appData.class || '—';
                    console.log(`✅ Found student data: ${studentName}, Class: ${studentClass}`);
                }
            } catch (appError) {
                console.warn(`⚠️ Could not fetch application data for student ${studId}:`, appError.message);
                // Fallback to populated student data if available
                studentName = form?.studId?.name || form?.student?.name || '—';
                studentClass = form?.studId?.class || form?.student?.class || '—';
            }
        }

        return {
            id: form?._id || form?.id || `form-${idx}`,
            formId: form?._id,
            studentName: studentName,
            class: studentClass,
            date: form?.createdAt
                ? new Date(form?.createdAt).toISOString().slice(0, 10)
                : (form?.date || '—'),
            status: form?.status || 'Pending',
            schoolId: form?.schoolId,
            studId: studId, // Ensure this is always a string
            applicationData: form,
            pdfUrl: pdfData?.url,
            pdfBlob: pdfData?.blob,
            _raw: form,
        };
    })
        );

        console.log(`✅ Normalized ${normalized.length} forms`, normalized);
        return { data: normalized };
        
    } catch (e) {
        console.error(`❌ Error fetching forms:`, e);
        console.error(`📍 Status: ${e?.response?.status}`);
        console.error(`📝 Message: ${e?.response?.data?.message || e.message}`);
        
        // Check if it's a 404 - endpoint doesn't exist
        if (e?.response?.status === 404) {
            console.error('❌ Endpoint /api/form/school/:schoolId not found - check backend routes');
        }
        
        throw e;
    }
};

// Update form status
export const updateApplicationStatus = async (formId, newStatus, schoolId, note = null) => {
    const id = encodeURIComponent(formId);

    try {
        console.log(`🔄 Updating form ${id} to status: ${newStatus}`);
        console.log(`📝 Note being sent:`, note);

        // Include note in the request if provided
        const requestBody = { status: newStatus };
        if (note) {
            requestBody.note = note;
        }

        console.log(`📤 Sending PUT /form/${id} with body:`, requestBody);

        const res = await apiClient.put(
            `/form/${id}`,
            requestBody
        );

        console.log(`✅ Form updated successfully. Response:`, res?.data);
        console.log(`📋 Full response data:`, res);
        return res?.data || { ok: true };

    } catch (e) {
        console.error(`❌ Failed to update form:`, e.message);
        console.error(`📍 Status: ${e?.response?.status}`);
        console.error(`📝 Response:`, e?.response?.data);
        throw e;
    }
};

// View PDF in new tab
export const viewPDFInNewTab = (studId) => {
  if (!studId) {
    console.warn('No student ID provided');
    return;
  }
  window.open(`/api/users/pdf/view/${studId}`, '_blank');
};

// Download PDF
export const downloadPDF = async (studId, studentName) => {
  try {
    const pdfData = await fetchStudentPDF(studId);
    if (!pdfData?.blob) {
      console.error('Failed to download PDF');
      return;
    }
    
    const link = document.createElement('a');
    link.href = pdfData.url;
    link.download = `${studentName || 'student'}_application.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(pdfData.url);
  } catch (err) {
    console.error('Download error:', err);
  }
};