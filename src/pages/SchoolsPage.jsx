// src/pages/SchoolsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicSchoolsByStatus } from "../api/schoolService";
import SchoolCard from "../components/SchoolCard";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getCurrentLocation, addDistanceToSchools } from "../utils/distanceUtils";
import { addScoresToSchools } from "../utils/scoreUtils";

const SchoolsPage = ({
  onCompareToggle,
  comparisonList,
  shortlist,
  onShortlistToggle,
}) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'score', 'name'
  
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Function to request user location
  const requestUserLocation = async () => {
    try {
      setLocationError(null);
      const location = await getCurrentLocation();
      setUserLocation(location);
      setShowLocationOptions(false);
      // Show success message only for manual request
      toast.success("Location access granted! Schools are now sorted by distance.");
    } catch (error) {
      console.warn("Could not get user location:", error.message);
      setLocationError(error.message);
      // Don't show warning for manual request failure
      toast.info("Location access was denied. You can select a city manually.");
    }
  };

  // Function to set manual location
  const setManualLocation = (city) => {
    const cityCoordinates = {
      'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
      'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
      'Delhi': { latitude: 28.7041, longitude: 77.1025 },
      'Chennai': { latitude: 13.0827, longitude: 80.2707 },
      'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
      'Pune': { latitude: 18.5204, longitude: 73.8567 }
    };
    
    if (cityCoordinates[city]) {
      setUserLocation(cityCoordinates[city]);
      setLocationError(null);
      setShowLocationOptions(false);
      toast.success(`Location set to ${city}. Schools are now sorted by distance.`);
    }
  };

  // Get user location on component mount - with flag to prevent duplicate toasts
  useEffect(() => {
    const getLocation = async () => {
      try {
        setLocationError(null);
        const location = await getCurrentLocation();
        setUserLocation(location);
        // Don't show toast on initial load, only show when user manually requests
      } catch (error) {
        console.warn("Could not get user location:", error.message);
        setLocationError(error.message);
        // Don't show warning toast on initial load
      }
    };
    getLocation();
  }, []);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoading(true);
        const response = await getPublicSchoolsByStatus("accepted");
        // Normalize possible shapes: array, {data: [...]}, {data: {data: [...]}}
        const raw = response?.data;
        let normalized = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        
        // Add mock coordinates for testing if they don't exist
        normalized = normalized.map((school, index) => {
          if (!school.coordinates && !school.lat && !school.latitude) {
            // Add mock coordinates around Bangalore area for testing
            const baseLat = 12.9716;
            const baseLng = 77.5946;
            const randomLat = baseLat + (Math.random() - 0.5) * 0.2; // ±0.1 degree variation
            const randomLng = baseLng + (Math.random() - 0.5) * 0.2;
            
            return {
              ...school,
              coordinates: {
                latitude: randomLat,
                longitude: randomLng
              }
            };
          }
          return school;
        });

        // Add calculated scores to all schools
        normalized = addScoresToSchools(normalized);

        // Add distance to schools if user location is available
        if (userLocation) {
          normalized = addDistanceToSchools(normalized, userLocation);
        }

        // Sort schools based on selected criteria
        normalized.sort((a, b) => {
          switch (sortBy) {
            case 'distance':
              if (a.distanceValue && b.distanceValue) {
                return a.distanceValue - b.distanceValue;
              }
              if (a.distanceValue) return -1;
              if (b.distanceValue) return 1;
              return 0;
            
            case 'score':
              const scoreA = a.score || 0;
              const scoreB = b.score || 0;
              return scoreB - scoreA; // Higher score first
            
            case 'name':
              const nameA = (a.name || '').toLowerCase();
              const nameB = (b.name || '').toLowerCase();
              return nameA.localeCompare(nameB);
            
            default:
              return 0;
          }
        });
        
        setSchools(normalized);
      } catch (error) {
        console.error("Error fetching schools:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Could not load schools. Please try again later.";
        toast.error(errorMessage);
        setSchools([]);
      } finally {
        setLoading(false);
      }
    };
    loadSchools();
  }, [userLocation, sortBy]); // Re-run when user location or sort criteria changes

  

  const handleCardClick = (school) => {
    navigate(`/school/${school._id || school.id || school.schoolId}`);
  };

  const handleApplyClick = (school) => {
    const schoolId = school._id || school.id || school.schoolId;
    if (schoolId) {
      try { localStorage.setItem('lastAppliedSchoolId', String(schoolId)); } catch (_) {}
    }
    const dest = `/apply/${schoolId}`;
    if (!currentUser) {
      localStorage.setItem('redirectPath', dest);
      navigate('/login');
      return;
    }
    navigate(dest);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading schools...
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Explore Schools</h1>
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="distance">Sort by Distance</option>
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
            <div className="relative">
            {userLocation && (
              <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                📍 Distance calculated from your location
              </div>
            )}
            {locationError && !userLocation && (
              <div className="relative">
                <button
                  onClick={() => setShowLocationOptions(!showLocationOptions)}
                  className="text-sm text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-full transition-colors cursor-pointer border border-orange-200"
                >
                  📍 Enable location for distance info ▼
                </button>
                {showLocationOptions && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-3">
                      <button
                        onClick={requestUserLocation}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded mb-2 text-blue-600"
                      >
                        🎯 Use my current location
                      </button>
                      <div className="text-xs text-gray-500 mb-2">Or choose a city:</div>
                      {['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune'].map(city => (
                        <button
                          key={city}
                          onClick={() => setManualLocation(city)}
                          className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 rounded text-gray-700"
                        >
                          📍 {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>

        {Array.isArray(schools) && schools.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schools
              .filter((school) => school)
              .map((school) => {
                // Get the unique ID from the school object, whether it's schoolId or _id
                const schoolId = school.schoolId || school._id;
                const isCompared = comparisonList.some(item => (item.schoolId || item._id) === schoolId);
                const isShortlisted = shortlist.some(item => (item.schoolId || item._id) === schoolId);
                return (
                  <SchoolCard
                    key={schoolId}
                    school={school}
                    onCardClick={() => handleCardClick(school)}
                    onCompareToggle={() => onCompareToggle(school)}
                    isCompared={isCompared}
                    currentUser={currentUser}
                    onShortlistToggle={() => onShortlistToggle(school)}
                    isShortlisted={isShortlisted}
                    onApply={() => handleApplyClick(school)}
                  />
                );
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
