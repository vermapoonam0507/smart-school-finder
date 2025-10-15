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
    const candidates = [
        `/api/applications/school/${identity}`,
        `/api/applications/by-school/${identity}`,
        `/api/applications?schoolId=${identity}`,
        `/api/applications`, // fetch all, filter on client as last resort
    ];

    let lastErr = null;
    for (const path of candidates) {
        try {
            const res = await apiClient.get(path, { headers: { 'X-Silent-Request': '1' } });
            const raw = res?.data;
            let list = Array.isArray(raw)
                ? raw
                : (Array.isArray(raw?.data) ? raw.data
                  : Array.isArray(raw?.applications) ? raw.applications
                  : (raw && typeof raw === 'object') ? [raw?.data || raw] : []);
            // If we hit the generic list endpoint, filter by school id/email if present in items
            if (res?.config?.url?.endsWith('/api/applications') && identityRaw) {
                list = list.filter((it) => {
                    const sId = typeof it?.schoolId === 'object' ? (it?.schoolId?._id || it?.schoolId?.id) : it?.schoolId;
                    const sEmail = it?.schoolEmail || it?.school?.email;
                    return String(sId) === identityRaw || String(sEmail) === identityRaw;
                });
            }
            // normalize a subset of fields used by SchoolPortalPage
            const normalized = list.map((it, idx) => ({
                id: it?._id || it?.id || `${it?.studId || ''}-${it?.schoolId || ''}-${idx}`,
                studentName: it?.name || it?.studentName || it?.student?.name || '—',
                class: it?.class || it?.className || it?.appliedClass || '—',
                date: it?.createdAt ? new Date(it.createdAt).toISOString().slice(0,10) : (it?.date || '—'),
                status: it?.status || it?.applicationStatus || 'Pending',
            }));
            return { data: normalized };
        } catch (e) {
            lastErr = e;
        }
    }

    // Fallback to mock if backend endpoints unavailable
    console.warn('Falling back to mock applications for school:', schoolIdOrEmail, lastErr?.message);
    await new Promise(resolve => setTimeout(resolve, 200));
    const applications = studentApplicationsData.filter(app => app.schoolEmail === schoolIdOrEmail);
    return { data: applications };
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
