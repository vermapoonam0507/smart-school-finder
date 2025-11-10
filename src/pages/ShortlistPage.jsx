import React from 'react';
import SchoolCard from '../components/SchoolCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ShortlistPage = ({ shortlist, onShortlistToggle, comparisonList, onCompareToggle }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  console.log("ShortlistPage received shortlist:", shortlist);
  console.log("Shortlist length:", shortlist?.length);
  console.log("Shortlist type:", typeof shortlist, Array.isArray(shortlist));

  const handleCardClick = (school) => {
    // Navigate to school details without removing from shortlist
    // (Remove the automatic removal based on user feedback)
    navigate(`/school/${school._id || school.id || school.schoolId}`);
  };

  const handleApplyClick = (school) => {
    const schoolId = school._id || school.id || school.schoolId;
    if (!schoolId) return;
    try { localStorage.setItem('lastAppliedSchoolId', String(schoolId)); } catch (_) {}
    navigate(`/apply/${schoolId}`);
  };

  // Filter out any null, undefined, or invalid school objects
  const validShortlist = Array.isArray(shortlist) 
    ? shortlist.filter(school => school && (school._id || school.schoolId))
    : [];

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Shortlisted Schools</h1>
      {validShortlist.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {validShortlist.map((school) => (
            <SchoolCard
              key={school.schoolId || school._id}
              school={school}
              onCardClick={() => handleCardClick(school)}
              onShortlistToggle={() => onShortlistToggle(school)}
              isShortlisted={validShortlist.some(item => (item.schoolId || item._id) === (school.schoolId || school._id))}
              onCompareToggle={() => onCompareToggle(school)}
              isCompared={comparisonList?.some(item => (item.schoolId || item._id) === (school.schoolId || school._id))}
              currentUser={currentUser}
              onApply={() => handleApplyClick(school)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">You haven't shortlisted any schools yet.</p>
        </div>
      )}
    </div>
  );
};

export default ShortlistPage;




