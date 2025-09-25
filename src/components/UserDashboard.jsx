// src/components/UserDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import SchoolCard from './SchoolCard';
import UserProfileForm from './UserProfileForm';
import { updateUserProfile, updateUserPreferences, getApplication, createStudentProfile, getUserProfile, saveUserPreferences } from '../api/userService';
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
    const [isEditingProfile, setIsEditingProfile] = useState(() => !currentUser?.contactNo);

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

    // const handleProfileUpdate = async (formData) => {
    //     const profilePayload = {
    //         name: formData.name,
    //         contactNo: formData.contactNo,
    //         dateOfBirth: formData.dateOfBirth,
    //         gender: formData.gender,
    //         state: formData.state,
    //         city: formData.city,
    //         userType: formData.userType,
    //         authId: currentUser._id,
    //         email: currentUser.email,
    //     };
    //     const preferencePayloadBase = {
    //         state: formData.state,
    //         city: formData.city,
    //         boards: formData.boards,
    //         preferredStandard: formData.preferredStandard,
    //         interests: formData.interests,
    //         schoolType: formData.schoolType,
    //         shift: formData.shift,
    //     };
    //     try {
    //         // First try to update existing profile by authId
    //         await updateUserProfile(currentUser._id, profilePayload);

    //         // Obtain studentId to save preferences properly
    //         let studentId = currentUser.studentId;
    //         if (!studentId) {
    //             try {
    //                 const prof = await getUserProfile(currentUser._id);
    //                 studentId = prof?.data?.data?._id || prof?.data?._id;
    //             } catch (_) {}
    //         }
    //         if (studentId) {
    //             await saveUserPreferences(studentId, { studentId, ...preferencePayloadBase });
    //         } else {
    //             await updateUserPreferences({ ...preferencePayloadBase, studentId: currentUser._id });
    //         }

    //         const updatedFullProfile = { ...currentUser, ...profilePayload, preferences: preferencePayloadBase };
    //         updateUserContext(updatedFullProfile);
    //         toast.success("Your details have been saved successfully!");
    //         setIsEditingProfile(false);
    //     } catch (error) {
    //         const msg = error?.response?.data?.message || error?.message || '';
    //         const isStudentMissing = msg.toLowerCase().includes('student not found') || (error?.response?.status === 400);
    //         try {
    //             if (isStudentMissing) {
    //                 // Create profile then save preferences
    //                 const created = await createStudentProfile({ ...profilePayload, preferences: preferencePayloadBase });
    //                 const createdStudent = created?.data?.data || created?.data || created;
    //                 const studentId = createdStudent?._id;
    //                 if (studentId) {
    //                     await saveUserPreferences(studentId, { studentId, ...preferencePayloadBase });
    //                 }
    //                 const updatedFullProfile = { ...currentUser, ...createdStudent, preferences: preferencePayloadBase };
    //                 updateUserContext(updatedFullProfile);
    //                 toast.success("Your profile has been created successfully!");
    //                 setIsEditingProfile(false);
    //                 return;
    //             }
    //         } catch (innerErr) {
    //             console.error("Profile creation error:", innerErr?.response?.data || innerErr?.message);
    //         }
    //         console.error("Profile update error:", error?.response?.data || error?.message);
    //         toast.error("Could not save details. Please try again.");
    //     }
    // };

    const handleProfileUpdate = async (profileData, preferenceData) => {
        try {
          // 1. First create/update the profile
          let updatedProfile;
          if (isStudentMissing) {
            // Create new profile
            const response = await createStudentProfile(profileData);
            updatedProfile = response?.data?.data || response?.data;
            if (!updatedProfile?._id) {
              throw new Error("Failed to create student profile");
            }
          } else {
            // Update existing profile
            const response = await updateUserProfile(currentUser._id, profileData);
            updatedProfile = response?.data?.data || response?.data;
          }
      
          // 2. Then save preferences
          if (preferenceData) {
            try {
              await saveUserPreferences(updatedProfile._id, {
                ...preferenceData,
                studentId: updatedProfile._id
              });
            } catch (prefError) {
              console.error("Error saving preferences:", prefError);
              // Continue even if preferences fail to save
            }
          }
      
          // 3. Update context and UI
          updateUserContext({
            ...currentUser,
            ...updatedProfile,
            preferences: preferenceData || currentUser.preferences
          });
          
          toast.success("Profile updated successfully!");
          setIsEditingProfile(false);
          
        } catch (error) {
          console.error("Profile update error:", {
            error: error?.response?.data || error?.message,
            profileData,
            preferenceData
          });
          toast.error(error?.response?.data?.message || "Failed to update profile. Please try again.");
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

    const ProfileSummary = () => {
        const profile = currentUser || {};
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">My Profile</h2>
                    <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="inline-flex items-center bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-700"
                    >
                        Edit
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Name:</span> <span className="text-gray-900">{profile.name || '—'}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="text-gray-900">{profile.email || '—'}</span></div>
                    <div><span className="text-gray-500">Contact:</span> <span className="text-gray-900">{profile.contactNo || '—'}</span></div>
                    <div><span className="text-gray-500">DOB:</span> <span className="text-gray-900">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'}</span></div>
                    <div><span className="text-gray-500">Gender:</span> <span className="text-gray-900">{profile.gender || '—'}</span></div>
                    <div><span className="text-gray-500">Location:</span> <span className="text-gray-900">{[profile.city, profile.state].filter(Boolean).join(', ') || '—'}</span></div>
                    <div className="md:col-span-2"><span className="text-gray-500">Preferences:</span> <span className="text-gray-900">{profile.preferences ? [profile.preferences.boards, profile.preferences.preferredStandard, profile.preferences.schoolType, profile.preferences.shift].filter(Boolean).join(' • ') : '—'}</span></div>
                </div>
            </div>
        );
    };

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
                {isEditingProfile ? (
                    <UserProfileForm currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />
                ) : (
                    <ProfileSummary />
                )}
            </div>
        </div>
    );
};

export default UserDashboard;