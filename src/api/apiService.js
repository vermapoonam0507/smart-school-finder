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
                const studId = form?.studId || form?.student?._id;
                const pdfData = studId ? await fetchStudentPDF(studId) : null;

                return {
                    id: form?._id || form?.id || `form-${idx}`,
                    formId: form?._id,
                    studentName: form?.student?.name || form?.name || form?.studentName || '—',
                    class: form?.student?.class || form?.class || form?.classCompleted || '—',
                    date: form?.createdAt
                        ? new Date(form?.createdAt).toISOString().slice(0, 10)
                        : (form?.date || '—'),
                    status: form?.status || 'Pending',
                    schoolId: form?.schoolId,
                    studId: studId,
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
export const updateApplicationStatus = async (formId, newStatus, schoolId) => {
    const id = encodeURIComponent(formId);
    
    try {
        console.log(`🔄 Updating form ${id} to status: ${newStatus}`);
        
        const res = await apiClient.put(
            `/form/${id}`,
            { status: newStatus }
        );
        
        console.log(`✅ Form updated:`, res?.data);
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