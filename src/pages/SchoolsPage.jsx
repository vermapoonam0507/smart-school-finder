// src/pages/SchoolsPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSchoolsByStatus } from '../api/adminService'; 
import SchoolCard from '../components/SchoolCard';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const SchoolsPage = ({ onCompareToggle, comparisonList, shortlist, onShortlistToggle }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); 

  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoading(true);
        const response = await getSchoolsByStatus('accepted');
        // Make sure to handle the case where response.data.data might not exist
        setSchools(response.data?.data || []); 
      } catch (error) {
        console.error("Error fetching schools:", error);
        const errorMessage = error.response?.data?.message || "Could not load schools. Please try again later.";
        toast.error(errorMessage);
        setSchools([]);
      } finally {
        setLoading(false);
      }
    };
    loadSchools();
  }, []);
  
  
  const handleCardClick = (school) => {
    navigate(`/school/${school.schoolId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading schools...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Schools</h1>
        
        {Array.isArray(schools) && schools.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schools.filter(school => school).map(school => {
              const isCompared = comparisonList.some(item => item._id === school.schoolId);
              const isShortlisted = shortlist.some(item => item._id === school.schoolId);
              return (
                <SchoolCard
                  key={school.schoolId}
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
        ) : (
          <div className="text-center text-gray-500 mt-16">
            <p>No accepted schools found.</p>
            <p>Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolsPage;