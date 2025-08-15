import React from 'react';
import SchoolCard from '../components/SchoolCard';

const DashboardPage = ({ currentUser, shortlist, onShortlistToggle, onNavigate, onSelectSchool, comparisonList, onCompareToggle }) => {
  if (!currentUser) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p>Please log in to view your dashboard.</p>
        <button onClick={() => onNavigate('login')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">Login</button>
      </div>
    );
  }

  const handleCardClick = (school) => {
    onSelectSchool(school);
    onNavigate('school-details');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {currentUser.name}!</h1>
        <p className="text-gray-600 mb-8">This is your personal dashboard.</p>

        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Your Shortlisted Schools</h2>
          {shortlist.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {shortlist.map(school => {
                const isCompared = comparisonList.some(item => item.id === school.id);
                return (
                  <SchoolCard
                    key={school.id}
                    school={school}
                    onCardClick={() => handleCardClick(school)}
                    onShortlistToggle={() => onShortlistToggle(school)}
                    isShortlisted={true}
                    currentUser={currentUser}
                    onCompareToggle={() => onCompareToggle(school)} 
                    isCompared={isCompared}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">You haven't shortlisted any schools yet.</p>
              <button onClick={() => onNavigate('schools')} className="mt-4 bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg">
                Browse Schools
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
