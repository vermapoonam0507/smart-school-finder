// src/pages/DashboardPage.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkSchoolProfileExists } from '../api/adminService';

// Naye component ko import karein
import UserDashboard from '../components/UserDashboard.jsx'; // Import the new combined dashboard

// SchoolRedirect ko yahan le aate hain for simplicity
const SchoolRedirect = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    useEffect(() => {
        const checkProfile = async () => {
            if (!currentUser?._id) return;
            try {
                await checkSchoolProfileExists(currentUser._id);
                navigate('/school-portal');
            } catch (error) {
                navigate('/school-registration'); 
            }
        };
        checkProfile();
    }, [currentUser?._id, navigate]);
    return <div className="flex justify-center items-center h-screen"><p>Loading your school dashboard...</p></div>;
};

// --- Main Dashboard Page Component ---
const DashboardPage = ({ shortlist, onShortlistToggle, comparisonList, onCompareToggle }) => {
    const { user: currentUser } = useAuth();
    
    if (!currentUser) {
        return <div className="flex justify-center items-center h-screen"><p>Loading your dashboard...</p></div>;
    }
    
    const renderDashboard = () => {
        const props = { shortlist, onShortlistToggle, comparisonList, onCompareToggle };
        
        switch (currentUser.userType) {
            case 'student':
            case 'parent': // Student aur Parent dono ke liye ek hi component
                return <UserDashboard {...props} />;
            case 'school':
                return <SchoolRedirect />;
            default:
                // Agar user login hai lekin profile complete nahi hai, to bhi UserDashboard dikhayein
                if (currentUser._id) {
                    return <UserDashboard {...props} />;
                }
                return <p>Loading your dashboard or create a profile to get started.</p>;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {currentUser.name || currentUser.email}!</h1>
                <p className="text-gray-600 mb-8">This is your personal dashboard.</p>
                
                {renderDashboard()}
            </div>
        </div>
    );
};

export default DashboardPage;