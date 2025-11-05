
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, School, MapPin, Users, Clock, DollarSign, Star, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import { searchSchools } from '../api/searchService';

const GuestResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [preferences, setPreferences] = useState(null);
  const [matchingSchools, setMatchingSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPredictor, setShowPredictor] = useState(false);

  useEffect(() => {
    // Get preferences from previous page or localStorage
    const savedPreferences = localStorage.getItem('guestPreferences');
    const savedSearchCriteria = localStorage.getItem('guestSearchCriteria');
    
    if (location.state?.preferences) {
      setPreferences(location.state.preferences);
    } else if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }

    // Simulate API call to get matching schools
    fetchMatchingSchools();
  }, [location.state]);

  const fetchMatchingSchools = async () => {
    setIsLoading(true);
    try {
      // Build params based on stored guest preferences/search
      const savedPreferences = localStorage.getItem('guestPreferences');
      const savedSearchCriteria = localStorage.getItem('guestSearchCriteria');

      const prefs = savedPreferences ? JSON.parse(savedPreferences) : {};
      const criteria = savedSearchCriteria ? JSON.parse(savedSearchCriteria) : {};

      const params = {
        // API expects arrays; normalize values if present
        boards: prefs.boards ? [prefs.boards] : [],
        states: criteria.state ? [criteria.state] : (prefs.state ? [prefs.state] : []),
        cities: criteria.city ? [criteria.city] : [],
        schoolMode: criteria.schoolMode ? [criteria.schoolMode] : (prefs.schoolType ? [prefs.schoolType] : []),
        genderType: criteria.genderType ? [criteria.genderType] : [],
        feeRange: criteria.feeRange ? [criteria.feeRange] : [],
        page: 1,
        limit: 10,
      };

      const result = await searchSchools(params);
      const schools = Array.isArray(result?.data) ? result.data : [];
      setMatchingSchools(schools);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('Failed to fetch matching schools');
      setMatchingSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredictNow = () => {
    setShowPredictor(true);
    toast.success('AI Prediction started! Analyzing your preferences...');
    // In a real implementation, this would call the AI prediction API
  };

  const handleEditPreferences = () => {
    navigate('/guest-search');
  };

  const handleReadInsights = () => {
    navigate('/blog');
  };

  const handleViewSchool = (schoolId) => {
    navigate(`/school/${schoolId}`);
  };

  const SchoolCard = ({ school }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <img 
            src={
              (school.photos && school.photos[0]?.url) ||
              school.image ||
              'https://picsum.photos/seed/fallback/600/400'
            }
            alt={school.name}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://picsum.photos/seed/fallback/600/400'; }}
          />
        </div>
        <div className="md:w-2/3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-800">{school.name}</h3>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{school.rating}</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-3">{school.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">{school.board}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">{school.area || school.city || school.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600 capitalize">{school.genderType}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">{school.feeRange}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{school.distance || ''}</span>
            <button
              onClick={() => handleViewSchool(school._id || school.schoolId)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              View Details
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Finding schools that match your preferences...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/guest-search')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Schools Matching Your Preferences
          </h1>
          <p className="text-gray-600">
            We found {matchingSchools.length} schools that match your criteria
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Predict Now Card */}
          <div className="bg-yellow-50 border border-orange-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Which schools match your preferences?
            </h3>
            <button
              onClick={handlePredictNow}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Predict Now
            </button>
          </div>

          {/* Read Insights Card */}
          <div className="bg-yellow-50 border border-orange-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Want the latest insights on schools?
            </h3>
            <button
              onClick={handleReadInsights}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Read Now
            </button>
          </div>

          {/* Edit Preferences Card */}
          <div className="bg-yellow-50 border border-orange-200 rounded-xl p-6 relative">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Want schools based on your references?
            </h3>
            <button
              onClick={handleEditPreferences}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Edit Now
            </button>
            {/* Chat Icon */}
            <div className="absolute bottom-4 right-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💬</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Prediction Results */}
        {showPredictor && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              🤖 AI Prediction Results
            </h3>
            <p className="text-blue-700 mb-4">
              Based on your preferences, our AI has analyzed {matchingSchools.length} schools and recommends the top matches below.
            </p>
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Analysis:</strong> Your preferences show a strong inclination towards {preferences?.schoolType || 'private'} schools with {preferences?.boards || 'CBSE'} board. 
                The AI has prioritized schools that offer {preferences?.interests || 'academic excellence'} and are located in {preferences?.state || 'your preferred state'}.
              </p>
            </div>
          </div>
        )}

        {/* Matching Schools */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Recommended Schools ({matchingSchools.length})
          </h2>
          
          {matchingSchools.length > 0 ? (
            matchingSchools.map((school) => (
              <SchoolCard key={school._id} school={school} />
            ))
          ) : (
            <div className="text-center py-12">
              <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No schools found</h3>
              <p className="text-gray-500 mb-4">
                We couldn't find any schools matching your current preferences.
              </p>
              <button
                onClick={handleEditPreferences}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Modify Search Criteria
              </button>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Ready to Apply?
          </h3>
          <p className="text-gray-600 mb-6">
            Create an account to save your preferences and apply to schools directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestResultsPage;
