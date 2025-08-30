import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import SchoolCard from '../components/SchoolCard';
import UserProfileForm from '../components/UserProfileForm';
import { getSchoolsByStatus, updateSchoolStatus, checkSchoolProfileExists } from '../api/adminService'; 
import { getUserProfile, updateUserProfile, updateUserPreferences, getApplication } from '../api/userService';
import { Check, X, Clock, Download } from 'lucide-react';

// --- Admin View Component ---
// This is for the superadmin to approve/reject schools.
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                setLoading(true);
                const response = await getSchoolsByStatus(activeTab);
                setSchools(response.data.data || []); 
            } catch (error) {
                toast.error(`Could not load ${activeTab} schools.`);
                setSchools([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSchools();
    }, [activeTab]);

    const handleStatusUpdate = async (schoolId, newStatus) => {
        try {
            await updateSchoolStatus(schoolId, { status: newStatus });
            toast.success(`School has been ${newStatus}.`);
            setSchools(prevSchools => prevSchools.filter(school => school._id !== schoolId));
        } catch (error) {
            toast.error("Failed to update school status.");
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Manage School Registrations</h2>
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('pending')} className={`${activeTab === 'pending' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}><Clock size={16} className="mr-2" /> Pending</button>
                    <button onClick={() => setActiveTab('accepted')} className={`${activeTab === 'accepted' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}><Check size={16} className="mr-2" /> Accepted</button>
                    <button onClick={() => setActiveTab('rejected')} className={`${activeTab === 'rejected' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}><X size={16} className="mr-2" /> Rejected</button>
                </nav>
            </div>
            {loading ? <p>Loading schools...</p> : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {schools.length > 0 ? schools.map(school => (
                        <div key={school._id} className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-bold">{school.name}</h3>
                            <p className="text-sm text-gray-600">{school.city}, {school.state}</p>
                            {activeTab === 'pending' && (
                                <div className="mt-4 flex space-x-2">
                                    <button onClick={() => handleStatusUpdate(school._id, 'accepted')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Approve</button>
                                    <button onClick={() => handleStatusUpdate(school._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Reject</button>
                                </div>
                            )}
                        </div>
                    )) : <p>No schools found in this category.</p>}
                </div>
            )}
        </div>
    );
};

// --- Parent/Student View ---
const ParentDashboard = ({ shortlist, comparisonList, onCompareToggle, onShortlistToggle }) => {
    const navigate = useNavigate();
    const { user: currentUser, updateUserContext } = useAuth();
    
    const [profileData, setProfileData] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [applicationExists, setApplicationExists] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (currentUser?._id && !currentUser.name) { 
                setIsLoadingProfile(true);
                try {
                    const response = await getUserProfile(currentUser._id);
                    const fullProfile = { ...response.data, email: currentUser.email };
                    setProfileData(fullProfile);
                    updateUserContext(response.data);
                } catch (error) {
                    setProfileData({ email: currentUser.email });
                } finally {
                    setIsLoadingProfile(false);
                }
            } else if (currentUser?.name) {
                setProfileData(currentUser);
                setIsLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [currentUser, updateUserContext]);

    useEffect(() => {
        const checkApplication = async () => {
            if (currentUser?._id) {
                try {
                    await getApplication(currentUser._id);
                    setApplicationExists(true);
                } catch (error) {
                    setApplicationExists(false);
                }
            }
        };
        checkApplication();
    }, [currentUser]);

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
                boards: formData.boards, preferredStandard: formData.preferredStandard, interests: formData.interests,
                schoolType: formData.schoolType, shift: formData.shift,
                state: formData.state, city: formData.city,
                studentId: currentUser._id,
            };
            
            await Promise.all([
                updateUserProfile(profilePayload),
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

// --- School User Redirect Component ---
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
    }, [currentUser, navigate]);

    return <div className="flex justify-center items-center h-screen"><p>Loading your school dashboard...</p></div>;
};

// --- Main Dashboard Page Component ---
const DashboardPage = ({ shortlist, onShortlistToggle, comparisonList, onCompareToggle }) => {
    const { user: currentUser } = useAuth();
    
    if (!currentUser) {
        return <div className="flex justify-center items-center h-screen"><p>Loading your dashboard...</p></div>;
    }
    
    const isSchoolUser = currentUser.userType === 'school';
    
    // Note: You can define a superadmin by a specific email or another property.
    // For now, we assume only one type of admin dashboard exists.
    // const isSuperAdmin = currentUser.email === 'your-super-admin-email@example.com';
    // if (isSuperAdmin) {
    //     return <AdminDashboard />;
    // }

    if (isSchoolUser) {
        return <SchoolRedirect />;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {currentUser.name || currentUser.email}!</h1>
                <p className="text-gray-600 mb-8">This is your personal dashboard.</p>
                
                <ParentDashboard 
                    shortlist={shortlist}
                    comparisonList={comparisonList}
                    onCompareToggle={onCompareToggle}
                    onShortlistToggle={onShortlistToggle}
                />
            </div>
        </div>
    );
};

export default DashboardPage;