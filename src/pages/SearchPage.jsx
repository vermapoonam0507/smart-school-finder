import React, { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
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

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
      default:
        break;
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      // Build search parameters
      const searchParams = {
        search: searchQuery.trim() || '',
        states: selectedStates,
        cities: selectedCities,
        boards: selectedBoards,
        page: 1,
        limit: 20
      };
      
      // Call search API
      const response = await searchSchools(searchParams);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
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
    setSearchResults([]);
    setHasSearched(false);
  };

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
            <h1 className="text-xl font-semibold text-gray-900">Search</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search here..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Search
            </button>
          </div>
          
          {/* Show selected filters */}
          {(searchQuery || selectedStates.length > 0 || selectedCities.length > 0 || selectedBoards.length > 0) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Searching for:</p>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    "{searchQuery}"
                  </span>
                )}
                {selectedStates.map(state => (
                  <span key={state} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {state}
                  </span>
                ))}
                {selectedCities.map(city => (
                  <span key={city} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {city}
                  </span>
                ))}
                {selectedBoards.map(board => (
                  <span key={board} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    {board}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search by States */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search by States</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {states.map((state) => (
              <button
                key={state}
                onClick={() => toggleSelection(state, 'state')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStates.includes(state)
                    ? 'bg-gray-900 text-white border-2 border-gray-900'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* Search by Cities */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search by Cities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => toggleSelection(city, 'city')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCities.includes(city)
                    ? 'bg-gray-900 text-white border-2 border-gray-900'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Search by Education Boards */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search by Education Boards</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {educationBoards.map((board) => (
              <button
                key={board}
                onClick={() => toggleSelection(board, 'board')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedBoards.includes(board)
                    ? 'bg-gray-900 text-white border-2 border-gray-900'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {board}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={clearAll}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Clear All
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Schools'}
          </button>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Search Results ({searchResults.length} schools found)
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Searching for schools...</div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
