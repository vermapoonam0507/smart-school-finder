import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSchools } from '../api/apiService';
import SchoolCard from '../components/SchoolCard';

const SchoolsPage = ({ onSelectSchool, onCompareToggle, comparisonList, currentUser, shortlist, onShortlistToggle }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoading(true);
        const response = await fetchSchools();
        setSchools(response.data); // YAHI FIX HAI
      } catch (error) {
        console.error("Error fetching schools:", error);
        setSchools([]); // Error aane par crash hone se bachayein
      } finally {
        setLoading(false);
      }
    };
    loadSchools();
  }, []);
  
  const handleCardClick = (school) => {
    onSelectSchool(school);
    navigate(`/school/${school.id}`);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading schools...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Schools</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {schools.map(school => {
            const isCompared = comparisonList.some(item => item.id === school.id);
            const isShortlisted = shortlist.some(item => item.id === school.id);
            return (
              <SchoolCard
                key={school.id}
                school={school}
                onCardClick={() => handleCardClick(school)}
                onCompareToggle={() => onCompareToggle(school)}
                isCompared={isCompared}
                currentUser={currentUser}
                onShortlistToggle={() => onShortlistToggle(school)}
                isShortlisted={isShortlisted}
              />
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default SchoolsPage;
