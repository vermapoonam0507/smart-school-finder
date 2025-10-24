// src/pages/CreateProfilePage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import UserProfileForm from '../components/UserProfileForm';
import { useAuth } from '../context/AuthContext';
import { createStudentProfile, saveUserPreferences, updateUserProfile } from '../api/userService';

const CreateProfilePage = () => {
    const { user, updateUserContext } = useAuth();
    const navigate = useNavigate();

    // Block school users from accessing student profile creation
    useEffect(() => {
        if (user?.userType === 'school') {
            toast.info('School accounts do not need a student profile.');
            navigate('/school-portal');
        }
    }, [user?.userType, navigate]);

    const handleProfileCreation = async (formData) => {
        try {
            // Check if user is authenticated
            if (!user || !user._id) {
                toast.error("User not authenticated. Please log in first.");
                return;
            }

            // Check if auth token exists
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast.error("Authentication token not found. Please log in again.");
                return;
            }

            // Backend ko bhejne ke liye aakhri data object (payload) taiyaar karein
            const payload = {
                name: formData.name,
                contactNo: formData.contactNo,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                state: formData.state,
                city: formData.city,
                userType: formData.userType,
                email: user.email,          // User ka email context se jod diya
                authId: user._id,           // User ki ID context se jod di
                preferences: {              // Preferences ko ek alag object mein daal diya
                    boards: formData.boards,
                    preferredStandard: formData.preferredStandard,
                    interests: formData.interests,
                    schoolType: formData.schoolType,
                    shift: formData.shift
                }
            };

            console.log("Creating/Updating profile with payload:", payload);
            
            let response;
            try {
                // Try to create new profile first
                response = await createStudentProfile(payload);
                console.log("✅ New profile created successfully");
            } catch (createError) {
                // If student already exists, update the existing profile
                if (createError.message === 'Student Already Exists' || 
                    createError.response?.data?.message === 'Student Already Exists') {
                    console.log("🔄 Student already exists, updating existing profile...");
                    response = await updateUserProfile(user._id, payload);
                    console.log("✅ Profile updated successfully");
                } else {
                    throw createError; // Re-throw if it's a different error
                }
            }

            // Save preferences against created student id
            const studentId = response.data?._id || response.data?.data?._id;
            if (studentId) {
                // Ensure all required fields are provided with valid values
                const preferencesData = {
                    studentId,
                    state: formData.state || 'Unknown',
                    city: formData.city || 'Unknown',
                    boards: formData.boards || 'CBSE', // Default to CBSE if not provided
                    preferredStandard: formData.preferredStandard || 'primary', // Default to primary
                    interests: formData.interests || 'Focusing on Academics', // Default interest
                    schoolType: formData.schoolType || 'private', // Default to private
                    shift: formData.shift || 'morning' // Default to morning
                };
                
                console.log('Saving preferences with data:', preferencesData);
                await saveUserPreferences(studentId, preferencesData);
            }

            // Enrich context with preferences so Dashboard pre-fills immediately
            const fullProfile = { ...(response.data?.data || response.data), preferences: {
                state: formData.state,
                city: formData.city,
                boards: formData.boards,
                preferredStandard: formData.preferredStandard,
                interests: formData.interests,
                schoolType: formData.schoolType,
                shift: formData.shift,
            }};
            updateUserContext(fullProfile);
            toast.success("Profile updated successfully! Welcome.");
            navigate('/dashboard');
        } catch (error) {
            console.error("Profile creation/update failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Could not create/update your profile.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
            <p className="text-gray-600 mb-8">Please complete your profile to continue.</p>
            <UserProfileForm 
                currentUser={user} 
                onProfileUpdate={handleProfileCreation} 
            />
        </div>
    );
};

export default CreateProfilePage;