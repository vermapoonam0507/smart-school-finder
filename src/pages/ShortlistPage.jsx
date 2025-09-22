import React from 'react';
import SchoolCard from '../components/SchoolCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ShortlistPage = ({ shortlist, onShortlistToggle, comparisonList, onCompareToggle }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const handleCardClick = (school) => {
    navigate(`/school/${school._id || school.schoolId}`);
  };

  const handleApplyClick = (school) => {
    const schoolId = school._id || school.schoolId;
    if (!schoolId) return;
    try { localStorage.setItem('lastAppliedSchoolId', String(schoolId)); } catch (_) {}
    navigate(`/apply/${schoolId}`);
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Shortlisted Schools</h1>
      {shortlist && shortlist.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shortlist.map((school) => (
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
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p>You haven't shortlisted any schools yet.</p>
        </div>
      )}
    </div>
  );
};

export default ShortlistPage;




