// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
// import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Components and Services
import SchoolCard from '../components/SchoolCard';
import UserProfileForm from '../components/UserProfileForm';
import { getSchoolsByStatus, updateSchoolStatus } from '../api/adminService';
import { getUserProfile, updateUserProfile, updateUserPreferences } from '../api/userService';
import { Check, X, Clock } from 'lucide-react';

// --- Admin View Component ---
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                setLoading(true);
                const response = await getSchoolsByStatus(activeTab);
                // API response has data inside a 'data' property
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
            // Remove the school from the current list after updating its status
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser?.authId) {
        setIsLoadingProfile(true);
        try {
          const response = await getUserProfile(currentUser.authId);
          setProfileData({ ...response.data, email: currentUser.email });
        } catch (error) {
          setProfileData({ email: currentUser.email }); // Create a blank profile if none exists
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleProfileUpdate = async (formData) => {
    try {
      const profilePayload = { name: formData.name, contactNo: formData.contactNo, dateOfBirth: formData.dateOfBirth, gender: formData.gender, state: formData.state, city: formData.city, userType: formData.userType };
      const preferencePayload = { boards: formData.boards, preferredStandard: formData.preferredStandard, interests: formData.interests, schoolType: formData.schoolType, shift: formData.shift };
      
      await Promise.all([
          updateUserProfile(profilePayload),
          updateUserPreferences(preferencePayload)
      ]);
      
      const updatedFullProfile = { ...profileData, ...profilePayload, preferences: preferencePayload };
      setProfileData(updatedFullProfile);
      updateUserContext(updatedFullProfile);

      toast.success("Your details have been saved successfully!");
    } catch (error) {
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
            {shortlist.map(school => {
              const isCompared = comparisonList.some(item => item._id === school._id);
              return (
                <SchoolCard 
                  key={school._id} 
                  school={school} 
                  onCardClick={() => handleCardClick(school)}
                  onShortlistToggle={() => onShortlistToggle(school)}
                  isShortlisted={true}
                  onCompareToggle={() => onCompareToggle(school)}
                  isCompared={isCompared}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow"><p>You haven't shortlisted any schools yet.</p></div>
        )}
      </div>
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

// --- Main Dashboard Page Component ---
const DashboardPage = ({ shortlist, onShortlistToggle, comparisonList, onCompareToggle }) => {
  const { user: currentUser } = useAuth();
  
  if (!currentUser) {
    return <div className="flex justify-center items-center h-screen"><p>Loading your dashboard...</p></div>;
  }
  
  // ===> FIX: Check for 'userType' from the backend, instead of 'role' <===
  const isAdmin = currentUser.userType === 'school';

  return (
    <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {currentUser.name || currentUser.email}!</h1>
            <p className="text-gray-600 mb-8">{isAdmin ? "This is the School Administration Dashboard." : "This is your personal dashboard."}</p>
            
            {isAdmin ? ( <AdminDashboard /> ) : (
                <ParentDashboard 
                    shortlist={shortlist}
                    comparisonList={comparisonList}
                    onCompareToggle={onCompareToggle}
                    onShortlistToggle={onShortlistToggle}
                />
            )}
        </div>
    </div>
  );
};

export default DashboardPage;