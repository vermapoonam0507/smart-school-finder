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
    { id: 1, studentName: 'Rohan Sharma', class: '5', date: '2025-08-15', status: 'Pending', schoolEmail: 'contact@dpsrkp.net' },
    { id: 2, studentName: 'Priya Singh', class: '6', date: '2025-08-14', status: 'Accepted', schoolEmail: 'contact@dpsrkp.net' },
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
    
    console.log(`[API] Fetching applications for: ${schoolIdOrEmail} (encoded: ${identity})`);
    
    // Try the correct backend endpoint first
    try {
        let list = [];
        
        // First try with schoolId
        try {
            console.log(`[API] Trying /api/applications?schoolId=${identity}`);
            const res = await apiClient.get(`/api/applications?schoolId=${identity}`, { 
                headers: { 'X-Silent-Request': '1' } 
            });
            
            const raw = res?.data;
            list = Array.isArray(raw)
                ? raw
                : (Array.isArray(raw?.data) ? raw.data
                  : Array.isArray(raw?.applications) ? raw.applications
                  : (raw && typeof raw === 'object') ? [raw?.data || raw] : []);
            
            console.log(`[API] Found ${list.length} applications by schoolId`);
        } catch (schoolIdErr) {
            console.warn('[API] Failed to fetch by schoolId:', schoolIdErr?.message);
        }
        
        // If no results with schoolId, try with schoolEmail
        if (list.length === 0 && identityRaw) {
            try {
                console.log(`[API] Trying /api/applications?schoolEmail=${identity}`);
                const emailRes = await apiClient.get(`/api/applications?schoolEmail=${identity}`, { 
                    headers: { 'X-Silent-Request': '1' } 
                });
                const emailRaw = emailRes?.data;
                list = Array.isArray(emailRaw)
                    ? emailRaw
                    : (Array.isArray(emailRaw?.data) ? emailRaw.data
                      : Array.isArray(emailRaw?.applications) ? emailRaw.applications
                      : (emailRaw && typeof emailRaw === 'object') ? [emailRaw?.data || emailRaw] : []);
                
                console.log(`[API] Found ${list.length} applications by schoolEmail`);
            } catch (emailErr) {
                console.warn('[API] Failed to fetch by schoolEmail:', emailErr?.message);
            }
        }
        
        // If still no results, try fetching all and filtering client-side
        if (list.length === 0 && identityRaw) {
            try {
                console.log('[API] Trying /api/applications (all) and filtering client-side');
                const allRes = await apiClient.get('/api/applications', { 
                    headers: { 'X-Silent-Request': '1' } 
                });
                const allRaw = allRes?.data;
                let allList = Array.isArray(allRaw)
                    ? allRaw
                    : (Array.isArray(allRaw?.data) ? allRaw.data
                      : Array.isArray(allRaw?.applications) ? allRaw.applications
                      : (allRaw && typeof allRaw === 'object') ? [allRaw?.data || allRaw] : []);
                
                console.log(`[API] Total applications in database: ${allList.length}`);
                
                // Filter by school id/email
                list = allList.filter((it) => {
                    const sId = typeof it?.schoolId === 'object' ? (it?.schoolId?._id || it?.schoolId?.id) : it?.schoolId;
                    const sEmail = it?.schoolEmail || it?.school?.email;
                    const matches = String(sId) === identityRaw || String(sEmail) === identityRaw;
                    if (matches) {
                        console.log(`[API] Found matching application:`, { sId, sEmail, identityRaw, application: it });
                    }
                    return matches;
                });
                
                console.log(`[API] Found ${list.length} applications after client-side filtering`);
            } catch (allErr) {
                console.warn('[API] Failed to fetch all applications:', allErr?.message);
            }
        }
        
        // Normalize the data for the frontend
        const normalized = list.map((it, idx) => ({
            id: it?._id || it?.id || `${it?.studId || ''}-${it?.schoolId || ''}-${idx}`,
            studentName: it?.name || it?.studentName || it?.student?.name || '—',
            class: it?.class || it?.className || it?.appliedClass || '—',
            date: it?.createdAt ? new Date(it.createdAt).toISOString().slice(0,10) : (it?.date || '—'),
            status: it?.status || it?.applicationStatus || 'Pending',
            schoolId: (typeof it?.schoolId === 'object' ? (it?.schoolId?._id || it?.schoolId?.id) : it?.schoolId) || null,
            studId: it?.studId || it?.studentId || it?.student?._id || null,
            _raw: it,
        }));
        
        console.log(`[API] Returning ${normalized.length} normalized applications for school: ${schoolIdOrEmail}`);
        return { data: normalized };
        
    } catch (error) {
        console.warn('[API] Backend API failed, falling back to mock applications for school:', schoolIdOrEmail, error?.message);
        
        // Fallback to mock if backend endpoints unavailable
        await new Promise(resolve => setTimeout(resolve, 200));
        const applications = studentApplicationsData.filter(app => app.schoolEmail === schoolIdOrEmail);
        console.log(`[API] Mock fallback: ${applications.length} applications`);
        return { data: applications };
    }
};

// Update an application's status (accept/reject/shortlist)
export const updateApplicationStatus = async (applicationId, newStatus) => {
    const body = { status: newStatus };
    const id = encodeURIComponent(applicationId);
    
    console.log(`[API] Updating application status for ID: ${applicationId} to: ${newStatus}`);
    
    // The backend expects PUT /api/applications/:studId where studId is the student ID
    // But we might be getting the application ID, so we need to handle both cases
    const attempts = [
        // Prefer the endpoint that is confirmed 200 in your logs
        { url: `/api/applications/${id}`, method: 'put' },
        { url: `/api/applications/${id}`, method: 'patch' },
        // Try the status endpoint last; some environments may not mount it
        { url: `/api/applications/${id}/status`, method: 'put' },
    ];
    
    let lastErr;
    for (const attempt of attempts) {
        try {
            console.log(`[API] Trying ${attempt.method.toUpperCase()} ${attempt.url}`);
            const res = await apiClient.request({ method: attempt.method, url: attempt.url, data: body });
            console.log(`[API] Status update successful:`, res?.data);
            return res?.data || { ok: true };
        } catch (e) {
            console.warn(`[API] Failed ${attempt.method.toUpperCase()} ${attempt.url}:`, e?.response?.status, e?.response?.data);
            lastErr = e;
        }
    }
    
    console.error(`[API] All status update attempts failed for application: ${applicationId}`);
    throw lastErr || new Error('Failed to update application status');
};

// Fetch full application by id for details view
export const fetchApplicationById = async (applicationId) => {
    const id = encodeURIComponent(String(applicationId || ''));
    const candidates = [
        `/api/applications/item/${id}`,
        `/api/applications/${id}`,
    ];
    let lastErr;
    for (const path of candidates) {
        try {
            const res = await apiClient.get(path, { headers: { 'X-Silent-Request': '1' } });
            const raw = res?.data;
            const obj = (raw && typeof raw === 'object') ? (raw?.data || raw) : null;
            return { data: obj };
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error('Application not found');
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
