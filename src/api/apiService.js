///hardcoded data when I used at that time i wasn't api end point///

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

export const fetchSchools = async () => {
    console.log("API: Fetching schools...");
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("API: Schools fetched!");
    return { data: schoolsData };
};

// Try real backend for school applications; fallback to mock if all fail
export const fetchStudentApplications = async (schoolIdOrEmail) => {
    const identityRaw = String(schoolIdOrEmail || '');
    const identity = encodeURIComponent(identityRaw);
    const candidates = [
        `/api/applications/school/${identity}`,
        `/api/applications?schoolId=${identity}`,
        `/api/applications/by-school/${identity}`,
        `/api/applications`, // fetch all, filter client-side
    ];

    console.log('🔍 Fetching student applications for:', identityRaw);

    let lastErr = null;
    for (const path of candidates) {
        try {
            console.log('🔗 Trying:', path);
            const res = await apiClient.get(path, { headers: { 'X-Silent-Request': '1' } });
            console.log('📦 Raw response from', path, ':', res);
            
            const raw = res?.data;
            console.log('📊 Raw data structure:', raw);
            
            // Handle various response structures
            let list = [];
            
            if (Array.isArray(raw)) {
                list = raw;
            } else if (raw && typeof raw === 'object') {
                // Check for data property
                if (Array.isArray(raw.data)) {
                    list = raw.data;
                } else if (Array.isArray(raw.applications)) {
                    list = raw.applications;
                } else if (raw.success && Array.isArray(raw.data?.applications)) {
                    list = raw.data.applications;
                } else if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
                    // Single object wrapped in data
                    list = [raw.data];
                }
            }
            
            console.log('📋 Extracted list before filtering:', list.length, 'items');
            
            // If we hit the generic list endpoint, filter by school id/email
            if (path.includes('/api/applications') && !path.includes('school') && !path.includes('by-school') && identityRaw && list.length > 0) {
                console.log('🔍 Filtering applications for schoolId:', identityRaw);
                list = list.filter((it) => {
                    const sId = typeof it?.schoolId === 'object' 
                        ? (it?.schoolId?._id || it?.schoolId?.id) 
                        : it?.schoolId;
                    const sEmail = it?.schoolEmail || it?.school?.email;
                    const match = String(sId) === identityRaw || String(sEmail) === identityRaw;
                    
                    if (!match) {
                        console.log('❌ No match:', { 
                            itemSchoolId: sId, 
                            itemSchoolEmail: sEmail, 
                            searchFor: identityRaw 
                        });
                    }
                    
                    return match;
                });
                console.log('✅ After filtering:', list.length, 'applications');
            }
            
            // Normalize the applications
            const normalized = list.map((it, idx) => {
                const app = {
                    _id: it?._id || it?.id || `${it?.studId || ''}-${it?.schoolId || ''}-${idx}`,
                    id: it?._id || it?.id || `${it?.studId || ''}-${it?.schoolId || ''}-${idx}`,
                    studentName: it?.name || it?.studentName || it?.student?.name || it?.studentDetails?.name || '—',
                    class: it?.class || it?.className || it?.appliedClass || it?.classAppliedFor || '—',
                    date: it?.createdAt 
                        ? new Date(it.createdAt).toISOString().slice(0, 10) 
                        : (it?.date || it?.appliedOn || '—'),
                    status: it?.status || it?.applicationStatus || 'Pending',
                    schoolId: (typeof it?.schoolId === 'object' 
                        ? (it?.schoolId?._id || it?.schoolId?.id) 
                        : it?.schoolId) || null,
                    studId: it?.studId || it?.studentId || it?.student?._id || it?.student?.id || null,
                    _raw: it,
                };
                return app;
            });
            
            console.log('✅ Successfully processed', normalized.length, 'applications');
            console.log('📄 Sample application:', normalized[0]);
            
            // Return the normalized data
            return { data: normalized };
            
        } catch (e) {
            console.warn('❌ Failed:', path, e.message);
            lastErr = e;
        }
    }

    // If we get here, all endpoints failed
    console.error('❌ All API endpoints failed. Last error:', lastErr?.message);
    
    // Return empty array instead of throwing to prevent UI crash
    console.warn('⚠️ Returning empty applications array');
    return { data: [] };
};

// Update an application's status (accept/reject/shortlist)
export const updateApplicationStatus = async (applicationId, newStatus, fallbackStudId) => {
    const payload = { status: newStatus };

    const idRaw = applicationId != null ? String(applicationId) : '';
    const studRaw = fallbackStudId != null ? String(fallbackStudId) : '';
    const looksLikeObjectId = /^[a-f\d]{24}$/i.test(idRaw);

    const id = idRaw ? encodeURIComponent(idRaw) : null;
    const stud = studRaw ? encodeURIComponent(studRaw) : null;

    // Prefer updating by student id if available; then fall back to application id
    const attempts = [];
    if (stud) {
      attempts.push({ method: 'put', url: `/applications/${stud}` });
    }
    if (id && looksLikeObjectId) {
      attempts.push({ method: 'put', url: `/applications/${id}/status` });
      attempts.push({ method: 'put', url: `/applications/${id}` });
    }

    let lastErr;
    for (const attempt of attempts) {
      try {
        console.log('🔗 Updating via', attempt.method.toUpperCase(), attempt.url);
        const res = await apiClient.request({ method: attempt.method, url: attempt.url, data: payload });
        console.log('✅ Status updated:', res.data);
        return res.data;
      } catch (err) {
        lastErr = err;
        console.warn('❌ Update attempt failed:', attempt.method.toUpperCase(), attempt.url, err?.message);
      }
    }
    console.error('❌ All status update attempts failed:', lastErr?.message);
    throw lastErr || new Error('Failed to update application status');
};
  


// Fetch full application by id for details view
export const fetchApplicationById = async (applicationId) => {
    try {
        const res = await apiClient.get(`/api/applications/${applicationId}`);
        return { data: res.data };
    } catch (err) {
        console.warn('⚠️ Backend fetch failed, using mock data');
    }

    const app = studentApplicationsData.find(a => String(a.id) === String(applicationId) || String(a._id) === String(applicationId));
    if (!app) throw new Error('Application not found in mock data');
    return { data: app };
};

export const addSchool = async (schoolData) => {
    console.log("API: Adding new school...");
    await new Promise(resolve => setTimeout(resolve, 500));
    const newSchool = {
        id: schoolsData.length + 1,
        ...schoolData
    };
    schoolsData.push(newSchool);
    console.log("API: New school added!", newSchool);
    return { data: newSchool };
};

export const addStudentApplication = async (applicationData) => {
    console.log("API: Adding new student application...");
    await new Promise(resolve => setTimeout(resolve, 500));
    const newApplication = {
        id: studentApplicationsData.length + 1,
        ...applicationData,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
    };
    studentApplicationsData.push(newApplication);
    console.log("API: New student application added!", newApplication);
    return { data: newApplication };
};
