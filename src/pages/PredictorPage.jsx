import React, { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { predictSchools } from '../api/predictorService';
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

const activitiesOptions = [
  'Focusing on Academics',
  'Focuses on Practical Learning',
  'Focuses on Theoretical Learning',
  'Empowering in Sports',
  'Empowering in Arts',
  'Special Focus on Mathematics',
  'Special Focus on Science',
  'Special Focus on Physical Education',
  'Leadership Development',
  'STEM Activities',
  'Cultural Education',
  'Technology Integration',
  'Environmental Awareness'
];

const shiftOptions = ['morning', 'afternoon', 'night school'];

const PredictorPage = () => {
  const navigate = useNavigate();
  const [selectedFeeRange, setSelectedFeeRange] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedSchoolMode, setSelectedSchoolMode] = useState('');
  const [selectedGenderType, setSelectedGenderType] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedShifts, setSelectedShifts] = useState([]); // array
  const [selectedUpto, setSelectedUpto] = useState('');
  const [specialistText, setSpecialistText] = useState(''); // comma-separated -> array
  const [languageMediumText, setLanguageMediumText] = useState(''); // comma-separated -> array
  const [transportAvailable, setTransportAvailable] = useState(''); // 'yes' | 'no'
  const [selectedActivities, setSelectedActivities] = useState([]); // array
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleGetSchools = async () => {
    // Check if at least one field is selected
    if (
      !selectedFeeRange && !selectedBoard && !selectedSchoolMode && !selectedGenderType &&
      !selectedState && !selectedCity && selectedShifts.length === 0 && !selectedUpto &&
      !specialistText && !languageMediumText && !transportAvailable && selectedActivities.length === 0
    ) {
      alert('Please select at least one preference to get school predictions.');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // Build backend filters per service contract
      const payload = {};
      if (selectedFeeRange) payload.feeRange = selectedFeeRange;
      if (selectedBoard) payload.board = selectedBoard;
      if (selectedSchoolMode) payload.schoolMode = selectedSchoolMode;
      if (selectedGenderType) payload.genderType = selectedGenderType;
      if (selectedState) payload.state = selectedState;
      if (selectedCity) payload.city = selectedCity;
      if (selectedShifts.length > 0) payload.shifts = selectedShifts;
      if (selectedUpto) payload.upto = selectedUpto;
      if (specialistText.trim()) payload.specialist = specialistText.split(',').map(s => s.trim()).filter(Boolean);
      if (languageMediumText.trim()) payload.languageMedium = languageMediumText.split(',').map(s => s.trim()).filter(Boolean);
      if (transportAvailable) payload.transportAvailable = transportAvailable;
      if (selectedActivities.length > 0) payload.activities = selectedActivities;

      const resp = await predictSchools(payload);
      const list = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
      setSearchResults(list);
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
    setSelectedState('');
    setSelectedCity('');
    setSelectedShifts([]);
    setSelectedUpto('');
    setSpecialistText('');
    setLanguageMediumText('');
    setTransportAvailable('');
    setSelectedActivities([]);
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

            {/* Location filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  placeholder="Enter state"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

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

            {/* Shifts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shifts</label>
              <div className="grid grid-cols-2 gap-3">
                {shiftOptions.map((opt) => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={selectedShifts.includes(opt)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selectedShifts, opt]
                          : selectedShifts.filter((s) => s !== opt);
                        setSelectedShifts(next);
                      }}
                    />
                    <span className="ml-2 text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Upto class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class Upto</label>
              <input
                type="text"
                value={selectedUpto}
                onChange={(e) => setSelectedUpto(e.target.value)}
                placeholder="e.g., 10th, 12th"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Specialist and Language Medium (comma separated) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialist Tags</label>
                <input
                  type="text"
                  value={specialistText}
                  onChange={(e) => setSpecialistText(e.target.value)}
                  placeholder="Comma separated (e.g., Sports, Music)"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language Medium</label>
                <input
                  type="text"
                  value={languageMediumText}
                  onChange={(e) => setLanguageMediumText(e.target.value)}
                  placeholder="Comma separated (e.g., English, Hindi)"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Transport */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transport Available</label>
                <select
                  value={transportAvailable}
                  onChange={(e) => setTransportAvailable(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* Activities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activities</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activitiesOptions.map((opt) => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={selectedActivities.includes(opt)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selectedActivities, opt]
                          : selectedActivities.filter((a) => a !== opt);
                        setSelectedActivities(next);
                      }}
                    />
                    <span className="ml-2 text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
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