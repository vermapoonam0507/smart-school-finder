import React, { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchSchools, getSchoolById } from '../api/searchService';
import { chatbotFilter } from '../api/chatbotService';
import SchoolCard from '../components/SchoolCard';

const feeRanges = [
  '1000 - 10000',
  '10000 - 25000', 
  '25000 - 50000',
  '50000 - 75000',
  '75000 - 100000',
  '1 Lakh - 2 Lakh',
  '2 Lakh - 3 Lakh',
  '3 Lakh - 4 Lakh',
  '4 Lakh - 5 Lakh',
  'More than 5 Lakh'
];

const educationBoards = [
  'CBSE', 'ICSE', 'CISCE', 'NIOS', 'SSC', 'IGCSE',
  'IB', 'KVS', 'JNV', 'DBSE', 'MSBSHSE', 'UPMSP',
  'KSEEB', 'WBBSE', 'GSEB', 'RBSE', 'BSEB', 'PSEB',
  'BSE', 'SEBA', 'MPBSE', 'STATE', 'OTHER'
];

const schoolModes = ['convent', 'private', 'government'];

const genderTypes = ['boy', 'girl', 'co-ed'];

const PredictorPage = () => {
  const navigate = useNavigate();
  const [selectedFeeRange, setSelectedFeeRange] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedSchoolMode, setSelectedSchoolMode] = useState('');
  const [selectedGenderType, setSelectedGenderType] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleGetSchools = async () => {
    // Check if at least one field is selected
    if (!selectedFeeRange && !selectedBoard && !selectedSchoolMode && !selectedGenderType) {
      alert('Please select at least one preference to get school predictions.');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // Build chatbot filter payload (strings, not arrays)
      const payload = {};
      if (selectedFeeRange) payload.feeRange = selectedFeeRange;
      if (selectedBoard) payload.board = selectedBoard;
      if (selectedSchoolMode) payload.schoolMode = selectedSchoolMode;
      if (selectedGenderType) payload.genderType = selectedGenderType;

      // Prefer DB filter to get schoolIds for exact matches
      let fetched = [];
      try {
        const dbResp = await chatbotFilter(payload, { useAI: false });
        const ids = Array.isArray(dbResp?.schoolIds) ? dbResp.schoolIds : [];
        for (const id of ids) {
          try {
            const s = await getSchoolById(id);
            if (s?.data) fetched.push(s.data);
          } catch (_) {}
        }
      } catch (_) {}

      // Fallback to AI names if DB returns nothing
      if (fetched.length === 0) {
        const aiResp = await chatbotFilter(payload, { useAI: true });
        const names = Array.isArray(aiResp?.recommendedSchools) ? aiResp.recommendedSchools : [];
        for (const name of names) {
          try {
            const res = await searchSchools({ search: name, boards: selectedBoard ? [selectedBoard] : [], page: 1, limit: 5 });
            if (Array.isArray(res?.data)) fetched.push(...res.data);
          } catch (_) {}
        }
      }

      // Deduplicate by id
      const uniqueById = [];
      const seen = new Set();
      for (const s of fetched) {
        const id = s._id || s.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          uniqueById.push(s);
        }
      }

      setSearchResults(uniqueById);
    } catch (error) {
      console.error('Prediction error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSelectedFeeRange('');
    setSelectedBoard('');
    setSelectedSchoolMode('');
    setSelectedGenderType('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const Dropdown = ({ label, value, onChange, options, placeholder }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Predict Schools</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Options. Your School.</h2>
          <h3 className="text-4xl font-bold text-gray-900 mb-4">School Predictor</h3>
          <p className="text-lg text-gray-600">
            Discover the schools that match the exact requirements for your kid.
          </p>
        </div>

        {/* Prediction Form */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="space-y-6">
            <Dropdown
              label="Select your preferred fee-range"
              value={selectedFeeRange}
              onChange={setSelectedFeeRange}
              options={feeRanges}
              placeholder="Select fee range"
            />

            <Dropdown
              label="Select your preferred board"
              value={selectedBoard}
              onChange={setSelectedBoard}
              options={educationBoards}
              placeholder="Select board"
            />

            <Dropdown
              label="Select your Preferred SchoolMode"
              value={selectedSchoolMode}
              onChange={setSelectedSchoolMode}
              options={schoolModes}
              placeholder="Select Modes"
            />

            <Dropdown
              label="Select your Preferred Gender Type for School"
              value={selectedGenderType}
              onChange={setSelectedGenderType}
              options={genderTypes}
              placeholder="Select Gender"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={clearAll}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Clear All
            </button>
            <button
              onClick={handleGetSchools}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
            >
              {loading ? 'Getting Schools...' : 'Get Schools'}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Predicted Schools ({searchResults.length} schools found)
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Analyzing your preferences...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((school) => (
                  <SchoolCard
                    key={school._id || school.id}
                    school={school}
                    onCardClick={() => navigate(`/school/${school._id || school.id}`)}
                    onCompareToggle={() => {}}
                    isCompared={false}
                    currentUser={null}
                    onShortlistToggle={() => {}}
                    isShortlisted={false}
                    onApply={() => navigate(`/apply/${school._id || school.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No schools found matching your preferences.</div>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Try different preferences
                </button>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Predictions are based on available data and may not reflect actual outcomes
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictorPage;