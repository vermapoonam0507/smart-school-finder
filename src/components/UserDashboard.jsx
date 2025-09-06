// src/components/UserDashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import SchoolCard from './SchoolCard';
import UserProfileForm from './UserProfileForm';
import { getUserProfile, updateUserProfile, updateUserPreferences, getApplication } from '../api/userService';
import { Download } from 'lucide-react';

// This component now works for BOTH students and parents
const UserDashboard = ({ shortlist, comparisonList, onCompareToggle, onShortlistToggle }) => {
    const navigate = useNavigate();
    const { user: currentUser, updateUserContext } = useAuth();
    
    const [profileData, setProfileData] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [applicationExists, setApplicationExists] = useState(false);

     const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!currentUser?._id) {
                setIsLoadingProfile(false);
                return;
            }

            // setIsLoadingProfile(true);
            try {
                // --- START OF MODIFIED LOGIC ---

                // First, always fetch the user's profile (works for both student and parent)
                const profileResponse = await getUserProfile(currentUser._id);
                
                // Set profile data immediately
                if (profileResponse && profileResponse.data) {
                    const fullProfile = { ...profileResponse.data, email: currentUser.email };
                    setProfileData(fullProfile);
                   updateUserContext(fullProfile);
                } else {
                    setProfileData({ email: currentUser.email });
                }

                let studentIdForApplication = null;

                // Check the user type to decide how to get the student ID
                if (currentUser.userType === 'parent') {
                    // For a parent, the student ID is INSIDE their profile data
                    // IMPORTANT: Ask your backend developer for the correct field name. I am using 'studentId'.
                    studentIdForApplication = profileResponse.data?.studentId;
                    if (!studentIdForApplication) {
                        console.warn("Parent profile does not contain a linked studentId.");
                    }
                } else {
                    // For a student, their own ID is the student ID
                    studentIdForApplication = currentUser._id;
                }

                // Now, fetch the application ONLY if we have a valid student ID
                if (studentIdForApplication) {
                    try {
                        await getApplication(studentIdForApplication);
                        setApplicationExists(true);
                    } catch (appError) {
                        setApplicationExists(false); // Application not found for this student
                    }
                } else {
                    setApplicationExists(false);
                }
                
                // --- END OF MODIFIED LOGIC ---

            } catch (error) {
                console.error("Dashboard data could not be loaded", error);
                setProfileData({ email: currentUser.email }); // Set default profile data on error
            } finally {
                setIsLoadingProfile(false);
            }
        };

        loadDashboardData();
    }, [currentUser?._id, updateUserContext]);

    // No changes were made to the functions below this line or to the JSX
    const handleProfileUpdate = async (formData) => {
        try {
            const profilePayload = {
                name: formData.name, contactNo: formData.contactNo, dateOfBirth: formData.dateOfBirth,
                gender: formData.gender, state: formData.state, city: formData.city,
                userType: formData.userType,
                authId: currentUser._id,
                email: currentUser.email,
            };

            const preferencePayload = {
                boards: formData.boards,
                shift: formData.shift,
                preferredStandard: formData.preferredStandard, interests: formData.interests,
                schoolType: formData.schoolType, 
                state: formData.state, city: formData.city,
                studentId: currentUser._id,
            };
            
            await Promise.all([
                updateUserProfile(currentUser._id, profilePayload),
                updateUserPreferences(preferencePayload)
            ]);
            
            const updatedFullProfile = { ...profileData, ...profilePayload, preferences: preferencePayload };
            setProfileData(updatedFullProfile);
            updateUserContext(updatedFullProfile);
            toast.success("Your details have been saved successfully!");
        } catch (error) {
            console.error("Profile update error:", error.response?.data || error.message);
            toast.error("Could not save details. Please try again.");
        }
    };
    
    const handleCardClick = (school) => {
        navigate(`/school/${school._id}`);
    };

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Your Shortlisted Schools</h2>
                {shortlist && shortlist.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {shortlist.map(school => (
                            <SchoolCard 
                                key={school._id} 
                                school={school} 
                                onCardClick={() => handleCardClick(school)}
                                onShortlistToggle={() => onShortlistToggle(school)}
                                isShortlisted={true}
                                onCompareToggle={() => onCompareToggle(school)}
                                isCompared={comparisonList.some(item => item._id === school._id)}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow"><p>You haven't shortlisted any schools yet.</p></div>
                )}
            </div>
            
            {applicationExists && (
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">My Application</h2>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <p className="text-gray-600 mb-4">Your application has been submitted. You can download a copy for your records.</p>
                        <a 
                            href={`${import.meta.env.VITE_API_BASE_URL}/users/pdf/download/${currentUser._id}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700"
                        >
                            <Download size={18} className="mr-2" />
                            Download Application PDF
                        </a>
                    </div>
                </div>
            )}

            <div>
                {isLoadingProfile ? (
                    <div className="text-center p-8 bg-white rounded-lg shadow"><p>Loading your profile...</p></div>
                ) : (
                    <UserProfileForm currentUser={profileData} onProfileUpdate={handleProfileUpdate} />
                )}
            </div>
        </div>
    );
};

export default UserDashboard;