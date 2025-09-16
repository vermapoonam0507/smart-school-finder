// src/components/UserDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import SchoolCard from './SchoolCard';
import UserProfileForm from './UserProfileForm';
import { updateUserProfile, updateUserPreferences, getApplication } from '../api/userService';
import { getSchoolById } from '../api/adminService';
import { Download } from 'lucide-react';

const UserDashboard = ({ shortlist, comparisonList, onCompareToggle, onShortlistToggle }) => {
    const navigate = useNavigate();
    console.log("Dashboard")
    const { user: currentUser, updateUserContext } = useAuth();
    console.log("UserDashboard is using this currentUser from context:", currentUser);

    const [applicationExists, setApplicationExists] = useState(false);
    const [applications, setApplications] = useState([]);
    const [schoolNameById, setSchoolNameById] = useState({});
    const [forms, setForms] = useState([]);

    useEffect(() => {
        const checkApplication = async () => {
            if (currentUser && currentUser._id) {
                try {
                    const studentId = currentUser.studentId || currentUser._id;
                    const res = await getApplication(studentId);
                    console.log('applications api data:', res?.data);
                    const list = res?.data?.data || [];
                    setApplications(Array.isArray(list) ? list : (list ? [list] : []));
                    setApplicationExists((Array.isArray(list) ? list.length : list ? 1 : 0) > 0);
                    try {
                        const { getFormsByStudent } = await import('../api/userService');
                        const formsRes = await getFormsByStudent(studentId);
                        const formsList = formsRes?.data || [];
                        setForms(Array.isArray(formsList) ? formsList : (formsList ? [formsList] : []));
                    } catch (_) {}
                } catch (error) {

                    console.log("No application found for this user, which is normal.");
                    setApplicationExists(false);
                }
            }
        };
        checkApplication();
    }, [currentUser]);

    useEffect(() => {
        const loadSchoolNames = async () => {
            const idStrings = (applications || [])
                .map(app => {
                    const ref = app.schoolId || app.school;
                    if (!ref) return null;
                    return typeof ref === 'object' ? ref._id : ref;
                })
                .filter(Boolean);
            const uniqueIds = Array.from(new Set(idStrings));
            const idsToFetch = uniqueIds.filter(id => !schoolNameById[id]);
            if (idsToFetch.length === 0) return;
            try {
                const results = await Promise.allSettled(idsToFetch.map(id => getSchoolById(id)));
                const mapUpdate = {};
                results.forEach((res, idx) => {
                    const id = idsToFetch[idx];
                    if (res.status === 'fulfilled') {
                        const data = res.value?.data?.data || res.value?.data;
                        const name = data?.name || data?.school?.name || 'School';
                        mapUpdate[id] = name;
                    } else {
                        mapUpdate[id] = 'School';
                    }
                });
                if (Object.keys(mapUpdate).length) {
                    setSchoolNameById(prev => ({ ...prev, ...mapUpdate }));
                }
            } catch (_) {}
        };
        loadSchoolNames();
    }, [applications, schoolNameById]);

    const handleProfileUpdate = async (formData) => {
        try {
            const profilePayload = {
                name: formData.name, contactNo: formData.contactNo, dateOfBirth: formData.dateOfBirth,
                gender: formData.gender, state: formData.state, city: formData.city,
                userType: formData.userType, authId: currentUser._id, email: currentUser.email,
            };
            const preferencePayload = {
                boards: formData.boards, shift: formData.shift,
                preferredStandard: formData.preferredStandard, interests: formData.interests,
                schoolType: formData.schoolType, state: formData.state, city: formData.city,
                studentId: currentUser._id,
            };
            await Promise.all([
                updateUserProfile(currentUser._id, profilePayload),
                updateUserPreferences(preferencePayload)
            ]);
            const updatedFullProfile = { ...currentUser, ...profilePayload, preferences: preferencePayload };
            updateUserContext(updatedFullProfile);
            toast.success("Your details have been saved successfully!");
        } catch (error) {
            console.error("Profile update error:", error.response?.data || error.message);
            toast.error("Could not save details. Please try again.");
        }
    };
    
    const handleCardClick = (school) => {
        navigate(`/school/${school._id || school.schoolId}`);
    };

    const handleApplyClick = (school) => {
        const schoolId = school._id || school.schoolId;
        if (!schoolId) return;
        try { localStorage.setItem('lastAppliedSchoolId', String(schoolId)); } catch (_) {}
        navigate(`/apply/${schoolId}`);
    };

    if (!currentUser) {
        return <div className="text-center p-8 bg-white rounded-lg shadow"><p>Loading your profile...</p></div>;
    }

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Your Shortlisted Schools</h2>
                {shortlist && shortlist.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {shortlist.map(school => (
                            <SchoolCard 
                                key={school.schoolId || school._id} 
                                school={school} 
                                onCardClick={() => handleCardClick(school)}
                                onShortlistToggle={() => onShortlistToggle(school)}
                                isShortlisted={shortlist?.some(item => (item.schoolId || item._id) === (school.schoolId || school._id))}
                                onCompareToggle={() => onCompareToggle(school)}
                                isCompared={comparisonList?.some(item => (item.schoolId || item._id) === (school.schoolId || school._id))}
                                currentUser={currentUser}
                                onApply={() => handleApplyClick(school)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow"><p>{`${!shortlist.length ? 'Loading...' : "You haven't shortlisted any schools yet."}`}</p></div>
                )}
            </div>
            
            {applicationExists && (
                <div>
                     <h2 className="text-2xl font-semibold text-gray-700 mb-6">My Applications</h2>
                     <div className="bg-white p-6 rounded-xl shadow-lg">
                       <div className="overflow-x-auto">
                         <table className="min-w-full text-sm">
                           <thead>
                             <tr className="text-left text-gray-600 border-b">
                               <th className="py-2 pr-4">School</th>
                               <th className="py-2 pr-4">Application ID</th>
                               <th className="py-2 pr-4">Actions</th>
                             </tr>
                           </thead>
                           <tbody>
                             {(forms.length ? forms : applications).map((row) => {
                               const schoolRef = row.schoolId || row.school;
                               let schoolIdStr = typeof schoolRef === 'object' ? schoolRef?._id : schoolRef;
                               if (!schoolIdStr) {
                                 try { schoolIdStr = localStorage.getItem('lastAppliedSchoolId') || null; } catch (_) {}
                               }
                               const displayName = (typeof schoolRef === 'object' ? schoolRef?.name : (schoolNameById[schoolIdStr])) || schoolIdStr || '—';
                               const idToShow = row._id || row.applicationId || '—';
                               return (
                                 <tr key={`${row._id || row.applicationId}`} className="border-b last:border-0">
                                   <td className="py-2 pr-4">{displayName}</td>
                                   <td className="py-2 pr-4">{idToShow}</td>
                                   <td className="py-2 pr-4">
                                     {schoolIdStr && (
                                       <button
                                         type="button"
                                         onClick={() => navigate(`/school/${schoolIdStr}`)}
                                         className="inline-flex items-center bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-blue-700 mr-2"
                                       >
                                         View School
                                       </button>
                                     )}
                                     <a
                                       href={`${import.meta.env.VITE_API_BASE_URL}/users/pdf/download/${currentUser._id}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="inline-flex items-center bg-green-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-green-700"
                                     >
                                       <Download size={16} className="mr-1.5" /> Download PDF
                                     </a>
                                   </td>
                                 </tr>
                               );
                             })}
                           </tbody>
                         </table>
                       </div>
                     </div>
                </div>
            )}

            <div>
                <UserProfileForm currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />
            </div>
        </div>
    );
};

export default UserDashboard;