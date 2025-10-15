// src/components/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import SchoolCard from './SchoolCard';
import UserProfileForm from './UserProfileForm';
import {
  updateUserProfile,
  createStudentProfile,
  getUserProfile,
  updateUserPreferences,
  createUserPreferences,
  saveUserPreferences,
  getUserPreferences
} from '../api/userService';
import { getSchoolById } from '../api/adminService';
import { Download } from 'lucide-react';

const UserDashboard = ({ shortlist, comparisonList, onCompareToggle, onShortlistToggle }) => {
  const navigate = useNavigate();
  const { user: currentUser, updateUserContext } = useAuth();

  const [applicationExists, setApplicationExists] = useState(false);
  const [applications, setApplications] = useState([]);
  const [schoolNameById, setSchoolNameById] = useState({});
  const [forms, setForms] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(() => !currentUser?.contactNo);

  // Ensure student profile exists and load preferences
  useEffect(() => {
    const ensureStudentProfile = async () => {
      if (!currentUser?._id) return;

      try {
        const profileRes = await getUserProfile(currentUser._id);
        const profileData = profileRes?.data?.data || profileRes?.data;

        if (!profileData) {
          console.log('🔄 User profile not found, creating new profile...');
          const createRes = await createStudentProfile({
            name: currentUser.name || '',
            email: currentUser.email,
            authId: currentUser._id
          });
          const createdProfileData = createRes?.data?.data || createRes?.data;
          if (createdProfileData) {
            console.log('✅ User profile created successfully');
            updateUserContext({ ...currentUser, ...createdProfileData });
          }
        } else if (!currentUser.contactNo) {
          console.log('✅ User profile found, updating context');
          updateUserContext({ ...currentUser, ...profileData });
        }

        // Load user preferences
        try {
          const preferencesRes = await getUserPreferences(currentUser._id);
          console.log("Preferences response:", preferencesRes);
          const preferencesData = preferencesRes?.data?.data || preferencesRes?.data;
          console.log("Preferences data:", preferencesData);
          if (preferencesData) {
            updateUserContext({ 
              ...currentUser, 
              ...profileData,
              preferences: preferencesData 
            });
          }
        } catch (prefErr) {
          console.log('No preferences found for user:', prefErr.message);
        }
      } catch (err) {
        console.error('Error ensuring student profile:', err);
        
        // If it's a "Student Not Found" error, try to create the profile
        if (err?.message?.includes('Student Not Found') || err?.status === 'failed') {
          console.log('🔄 Student not found, attempting to create profile...');
          try {
            const createRes = await createStudentProfile({
              name: currentUser.name || '',
              email: currentUser.email,
              authId: currentUser._id
            });
            const createdProfileData = createRes?.data?.data || createRes?.data;
            if (createdProfileData) {
              console.log('✅ User profile created after "Student Not Found" error');
              updateUserContext({ ...currentUser, ...createdProfileData });
            }
          } catch (createErr) {
            console.error('Failed to create user profile after "Student Not Found":', createErr);
          }
        }
      }
    };

    ensureStudentProfile();
  }, [currentUser, updateUserContext]);

  // Load school names for applications
  useEffect(() => {
    const loadSchoolNames = async () => {
      const ids = applications
        .map(app =>
          typeof (app.schoolId || app.school) === 'object'
            ? (app.schoolId || app.school)?._id
            : (app.schoolId || app.school)
        )
        .filter(Boolean);

      const uniqueIds = Array.from(new Set(ids));
      const idsToFetch = uniqueIds.filter(id => !schoolNameById[id]);
      if (!idsToFetch.length) return;

      try {
        const results = await Promise.allSettled(idsToFetch.map(id => getSchoolById(id)));
        const newMap = {};
        results.forEach((res, idx) => {
          const id = idsToFetch[idx];
          newMap[id] =
            res.status === 'fulfilled'
              ? res.value?.data?.data?.name || res.value?.data?.name || 'School'
              : 'School';
        });
        setSchoolNameById(prev => ({ ...prev, ...newMap }));
      } catch (err) {
        console.error('Error loading school names:', err);
      }
    };

    loadSchoolNames();
  }, [applications, schoolNameById]);

  // Handle profile update
  const handleProfileUpdate = async (profileData) => {
    try {
      const authId = currentUser.authId || currentUser._id;
      if (!authId) throw new Error('User ID not found. Cannot update profile.');

      // Update main profile fields
      const updatedProfile = await updateUserProfile(authId, profileData);

      // Update preferences separately if present
      if (profileData.preferences) {
        await saveUserPreferences(authId, {
          studentId: authId,
          ...profileData.preferences
        });
      }

      // Fetch the updated profile from the server to ensure we have the latest data
      const freshProfile = await getUserProfile(authId);
      const freshData = freshProfile?.data?.data || freshProfile?.data;

      // Also fetch updated preferences
      let freshPreferences = null;
      try {
        const preferencesRes = await getUserPreferences(authId);
        console.log("Updated preferences response:", preferencesRes);
        freshPreferences = preferencesRes?.data?.data || preferencesRes?.data;
        console.log("Updated preferences data:", freshPreferences);
      } catch (prefErr) {
        console.log('No preferences found after update:', prefErr.message);
      }

      // Update the context with the fresh data from the server
      updateUserContext({
        ...currentUser,
        ...freshData,
        preferences: freshPreferences
      });

      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
      return updatedProfile;
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile.');
      throw err;
    }
  };

  // Card and Apply actions
  const handleCardClick = school => navigate(`/school/${school._id || school.schoolId}`);
  const handleApplyClick = school => {
    const schoolId = school._id || school.schoolId;
    if (!schoolId) return;
    localStorage.setItem('lastAppliedSchoolId', String(schoolId));
    const displayName = school.name || school.schoolName || school.title || school.instituteName;
    if (displayName) {
      try { localStorage.setItem(`schoolName:${schoolId}`, displayName); } catch (_) {}
    }
    navigate(`/apply/${schoolId}`);
  };

  if (!currentUser) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p>Loading your profile...</p>
      </div>
    );
  }

  // Profile Summary component
  const ProfileSummary = () => {
    const profile = currentUser || {};
    console.log("ProfileSummary - currentUser:", currentUser);
    console.log("ProfileSummary - preferences:", profile.preferences);
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
          <div>
            <span className="text-gray-500">Name:</span>{' '}
            <span className="text-gray-900">{profile.name || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Email:</span>{' '}
            <span className="text-gray-900">{profile.email || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Contact:</span>{' '}
            <span className="text-gray-900">{profile.contactNo || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">DOB:</span>{' '}
            <span className="text-gray-900">
              {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Gender:</span>{' '}
            <span className="text-gray-900">{profile.gender || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Location:</span>{' '}
            <span className="text-gray-900">
              {[profile.city, profile.state].filter(Boolean).join(', ') || '—'}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-gray-500">Preferences:</span>{' '}
            <span className="text-gray-900">
              {profile.preferences
                ? [
                    profile.preferences.boards,
                    profile.preferences.preferredStandard,
                    profile.preferences.schoolType,
                    profile.preferences.shift
                  ]
                    .filter(Boolean)
                    .join(' • ')
                : '—'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="space-y-12">
      {/* Shortlist */}
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
                isShortlisted={shortlist.some(
                  item =>
                    (item.schoolId || item._id) === (school.schoolId || school._id)
                )}
                onCompareToggle={() => onCompareToggle(school)}
                isCompared={comparisonList?.some(
                  item =>
                    (item.schoolId || item._id) === (school.schoolId || school._id)
                )}
                currentUser={currentUser}
                onApply={() => handleApplyClick(school)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p>
              {!shortlist?.length
                ? 'Loading...'
                : "You haven't shortlisted any schools yet."}
            </p>
          </div>
        )}
      </div>

      {/* Applications */}
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
                  {(forms.length ? forms : applications).map(row => {
                    const schoolRef = row.schoolId || row.school;
                    let schoolIdStr =
                      typeof schoolRef === 'object' ? schoolRef?._id : schoolRef;
                    if (!schoolIdStr)
                      schoolIdStr = localStorage.getItem('lastAppliedSchoolId') || null;
                    const displayName =
                      typeof schoolRef === 'object'
                        ? schoolRef?.name
                        : schoolNameById[schoolIdStr] || schoolIdStr || '—';
                    const idToShow = row._id || row.applicationId || '—';

                    return (
                      <tr key={row._id || row.applicationId} className="border-b last:border-0">
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
                          {/* View PDF */}
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL || 'https://backend-tc-sa-v2.onrender.com'}/api/users/pdf/view/${currentUser._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-white text-gray-700 font-semibold px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 mr-2"
                          >
                            {/* Eye icon replacement with simple text to avoid extra imports */}
                            View PDF
                          </a>

                          {/* Download PDF */}
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL || 'https://backend-tc-sa-v2.onrender.com'}/api/users/pdf/download/${currentUser._id}`}
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

      {/* Profile Section */}
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
