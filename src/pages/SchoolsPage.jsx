import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSchoolsByStatus } from '../api/adminService'; 
import SchoolCard from '../components/SchoolCard';
import { toast } from 'react-toastify';

const SchoolsPage = ({ onSelectSchool, onCompareToggle, comparisonList, currentUser, shortlist, onShortlistToggle }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoading(true);
        
        const response = await getSchoolsByStatus('accepted');
        
        // =================================================================
        // ===> DEBUGGING: Console log to see the actual API data <===
        console.log("API Response Data:", response.data.data);
        // =================================================================

        // Set the data from the API response
        setSchools(response.data.data); 

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
    onSelectSchool(school);
    navigate(`/school/${school._id}`); // Use _id as it's common in MongoDB
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading schools...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Schools</h1>
        
        {/* Check if schools is an array before mapping */}
        {Array.isArray(schools) && schools.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* SAFETY FILTER: Filter out any null or undefined school objects to prevent crashes */}
            {schools.filter(school => school).map(school => {
              const isCompared = comparisonList.some(item => item._id === school._id);
              const isShortlisted = shortlist.some(item => item._id === school._id);
              return (
                <SchoolCard
                  key={school._id}
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
