import React, { useState } from 'react';
import { Search, ArrowLeft, ChevronRight, ChevronDown, MapPin, GraduationCap, Building, Users, DollarSign, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchSchools } from '../api/searchService';
import SchoolCard from '../components/SchoolCard';

const states = [
  'Maharashtra', 'Karnataka', 'Delhi', 'Kerala', 'Gujarat', 'Tamil Nadu',
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Andhra Pradesh', 'Madhya Pradesh', 'Punjab'
];

const cities = [
  'Mumbai', 'Pune', 'Navi Mumbai', 'Nagpur', 'Bangalore', 'Chennai',
  'Delhi', 'Kolkata', 'Hyderabad', 'Ahmedabad', 'Kochi', 'Jaipur'
];

const educationBoards = [
  'CBSE', 'ICSE', 'CISCE', 'NIOS', 'SSC', 'IGCSE',
  'IB', 'KVS', 'JNV', 'DBSE', 'MSBSHSE', 'UPMSP',
  'KSEEB', 'WBBSE', 'GSEB', 'RBSE', 'BSEB', 'PSEB',
  'BSE', 'SEBA', 'MPBSE', 'STATE', 'OTHER'
];

const schoolModes = ['convent', 'private', 'government'];
const genderTypes = ['boy', 'girl', 'co-ed'];
const feeRanges = [
  "1000 - 10000",
  "10000 - 25000", 
  "25000 - 50000",
  "50000 - 75000",
  "75000 - 100000",
  "1 Lakh - 2 Lakh",
  "2 Lakh - 3 Lakh",     
  "3 Lakh - 4 Lakh",
  "4 Lakh - 5 Lakh",
  "More than 5 Lakh"
];

const SearchPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [selectedSchoolModes, setSelectedSchoolModes] = useState([]);
  const [selectedGenderTypes, setSelectedGenderTypes] = useState([]);
  const [selectedFeeRanges, setSelectedFeeRanges] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [error, setError] = useState('');

  const totalSteps = 6;

  const toggleSelection = (item, type) => {
    switch (type) {
      case 'state':
        setSelectedStates(prev => 
          prev.includes(item) 
            ? prev.filter(s => s !== item)
            : [...prev, item]
        );
        break;
      case 'city':
        setSelectedCities(prev => 
          prev.includes(item) 
            ? prev.filter(c => c !== item)
            : [...prev, item]
        );
        break;
      case 'board':
        setSelectedBoards(prev => 
          prev.includes(item) 
            ? prev.filter(b => b !== item)
            : [...prev, item]
        );
        break;
      case 'schoolMode':
        setSelectedSchoolModes(prev => 
          prev.includes(item) 
            ? prev.filter(s => s !== item)
            : [...prev, item]
        );
        break;
      case 'genderType':
        setSelectedGenderTypes(prev => 
          prev.includes(item) 
            ? prev.filter(g => g !== item)
            : [...prev, item]
        );
        break;
      case 'feeRange':
        setSelectedFeeRanges(prev => 
          prev.includes(item) 
            ? prev.filter(f => f !== item)
            : [...prev, item]
        );
        break;
      default:
        break;
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateStep = (step) => {
    setError('');
    
    switch (step) {
      case 1:
        // Step 1 is optional - user can skip search term
        break;
      case 2:
        if (selectedStates.length === 0 && selectedCities.length === 0) {
          setError('Please select at least one state or city');
          return false;
        }
        break;
      case 3:
        if (selectedBoards.length === 0) {
          setError('Please select at least one education board');
          return false;
        }
        break;
      case 4:
        if (selectedSchoolModes.length === 0) {
          setError('Please select at least one school type');
          return false;
        }
        break;
      case 5:
        if (selectedGenderTypes.length === 0 && selectedFeeRanges.length === 0) {
          setError('Please select at least one gender type or fee range');
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSearch = async () => {
    setError('');
    setLoading(true);
    setHasSearched(true);
    
    try {
      const searchParams = {
        search: searchQuery.trim() || '',
        states: selectedStates,
        cities: selectedCities,
        boards: selectedBoards,
        schoolMode: selectedSchoolModes,
        genderType: selectedGenderTypes,
        feeRange: selectedFeeRanges,
        page: 1,
        limit: 20
      };
      
      const response = await searchSchools({ ...searchParams, progressive: false });
      setSearchResults(response.data || []);
      
      // Show message when no schools are found, but don't treat it as an error
      if (!response.data || response.data.length === 0) {
        setError('No schools found matching your criteria. Try adjusting your filters or expanding your search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      // Only show error for actual failures, not for "no results found"
      if (error.response?.status !== 404) {
        setError('Failed to search schools. Please try again.');
      } else {
        setError('No schools found matching your criteria. Try adjusting your filters or expanding your search.');
      }
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSearchQuery('');
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedBoards([]);
    setSelectedSchoolModes([]);
    setSelectedGenderTypes([]);
    setSelectedFeeRanges([]);
    setSearchResults([]);
    setHasSearched(false);
    setCurrentStep(1);
    setError('');
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Basic Search';
      case 2: return 'Location';
      case 3: return 'Education Board';
      case 4: return 'School Type';
      case 5: return 'Gender & Fees';
      case 6: return 'Review & Search';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect School</h2>
              <p className="text-gray-600">Start by searching for schools by name or keywords</p>
            </div>
            
            <div className="relative max-w-2xl mx-auto">
              <Search size={24} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                placeholder="Search schools by name, keywords..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="text-center space-y-3">
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-lg"
              >
                Continue to Location
                <ChevronRight size={20} className="inline ml-2" />
              </button>
              <div>
                <button
                  onClick={nextStep}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Skip search term and browse by filters
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Location</h2>
              <p className="text-gray-600">Select states and cities where you want to find schools</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin size={20} className="mr-2" />
                  States
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {states.map((state) => (
                    <button
                      key={state}
                      onClick={() => toggleSelection(state, 'state')}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedStates.includes(state)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin size={20} className="mr-2" />
                  Cities
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => toggleSelection(city, 'city')}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedCities.includes(city)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
              >
                Continue to Board
                <ChevronRight size={20} className="inline ml-2" />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Education Board</h2>
              <p className="text-gray-600">Select the education boards you prefer</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {educationBoards.map((board) => (
                <button
                  key={board}
                  onClick={() => toggleSelection(board, 'board')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedBoards.includes(board)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {board}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
              >
                Continue to School Type
                <ChevronRight size={20} className="inline ml-2" />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">School Type</h2>
              <p className="text-gray-600">Choose the type of school you prefer</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {schoolModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => toggleSelection(mode, 'schoolMode')}
                  className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                    selectedSchoolModes.includes(mode)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Building size={24} className="mx-auto mb-2" />
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
              >
                Continue to Gender & Fees
                <ChevronRight size={20} className="inline ml-2" />
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gender & Fee Range</h2>
              <p className="text-gray-600">Select gender preference and budget range</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Users size={20} className="mr-2" />
                  Gender Type
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {genderTypes.map((gender) => (
                    <button
                      key={gender}
                      onClick={() => toggleSelection(gender, 'genderType')}
                      className={`px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                        selectedGenderTypes.includes(gender)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <DollarSign size={20} className="mr-2" />
                  Fee Range (Annual)
                </h3>
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {feeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => toggleSelection(range, 'feeRange')}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedFeeRanges.includes(range)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      ₹{range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
              >
                Review & Search
                <ChevronRight size={20} className="inline ml-2" />
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Search</h2>
              <p className="text-gray-600">Review your selections and start searching</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              {searchQuery && (
                <div className="flex items-center">
                  <Search size={20} className="text-gray-500 mr-3" />
                  <span className="text-gray-700"><strong>Search:</strong> "{searchQuery}"</span>
                </div>
              )}
              
              {selectedStates.length > 0 && (
                <div className="flex items-center">
                  <MapPin size={20} className="text-gray-500 mr-3" />
                  <span className="text-gray-700"><strong>States:</strong> {selectedStates.join(', ')}</span>
                </div>
              )}
              
              {selectedCities.length > 0 && (
                <div className="flex items-center">
                  <MapPin size={20} className="text-gray-500 mr-3" />
                  <span className="text-gray-700"><strong>Cities:</strong> {selectedCities.join(', ')}</span>
                </div>
              )}
              
              {selectedBoards.length > 0 && (
                <div className="flex items-center">
                  <GraduationCap size={20} className="text-gray-500 mr-3" />
                  <span className="text-gray-700"><strong>Boards:</strong> {selectedBoards.join(', ')}</span>
                </div>
              )}
              
              {selectedSchoolModes.length > 0 && (
                <div className="flex items-center">
                  <Building size={20} className="text-gray-500 mr-3" />
                  <span className="text-gray-700"><strong>School Type:</strong> {selectedSchoolModes.join(', ')}</span>
                </div>
              )}
              
              {selectedGenderTypes.length > 0 && (
                <div className="flex items-center">
                  <Users size={20} className="text-gray-500 mr-3" />
                  <span className="text-gray-700"><strong>Gender:</strong> {selectedGenderTypes.join(', ')}</span>
                </div>
              )}
              
              {selectedFeeRanges.length > 0 && (
                <div className="flex items-center">
                  <DollarSign size={20} className="text-gray-500 mr-3" />
                  <span className="text-gray-700"><strong>Fee Range:</strong> {selectedFeeRanges.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Schools'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Search Schools</h1>
            </div>
            <button
              onClick={clearAll}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{getStepTitle(currentStep)}</h2>
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">{error}</div>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Search Results ({searchResults.length} schools found)
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Searching for schools...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((school, idx) => (
                  <SchoolCard
                    key={`${school._id || school.id || school.schoolId || 'school'}-${idx}`}
                    school={school}
                    onCardClick={() => navigate(`/school/${school._id || school.id || school.schoolId}`)}
                    onCompareToggle={() => {}}
                    isCompared={false}
                    currentUser={null}
                    onShortlistToggle={() => {}}
                    isShortlisted={false}
                    onApply={() => navigate(`/apply/${school._id || school.id || school.schoolId}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">No schools found matching your criteria.</div>
                <button
                  onClick={clearAll}
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters and try again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;