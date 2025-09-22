// src/pages/CreateProfilePage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import UserProfileForm from '../components/UserProfileForm';
import { useAuth } from '../context/AuthContext';
import { createStudentProfile, saveUserPreferences } from '../api/userService';

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

            const response = await createStudentProfile(payload);

            // Save preferences against created student id
            const studentId = response.data?._id || response.data?.data?._id;
            if (studentId) {
                await saveUserPreferences(studentId, {
                    studentId,
                    state: formData.state,
                    city: formData.city,
                    boards: formData.boards,
                    preferredStandard: formData.preferredStandard,
                    interests: formData.interests,
                    schoolType: formData.schoolType,
                    shift: formData.shift,
                });
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
            toast.success("Profile created successfully! Welcome.");
            navigate('/dashboard');
        } catch (error) {
            console.error("Profile creation failed:", error);
            toast.error(error.response?.data?.message || "Could not create your profile.");
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