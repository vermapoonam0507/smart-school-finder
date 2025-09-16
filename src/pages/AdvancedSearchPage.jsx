import React, { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin, DollarSign, Award, Users, Building, BookOpen, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import SchoolCard from '../components/SchoolCard';

const AdvancedSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    feeRange: [],
    board: [],
    facilities: [],
    schoolType: [],
    ownership: [],
    coEdStatus: [],
    language: [],
    classOffered: [],
    academicSession: [],
    admissionProcess: [],
    location: []
  });
  const [filterOptions, setFilterOptions] = useState({});
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch filter options on component mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Search schools when filters change
  useEffect(() => {
    searchSchools();
  }, [filters, currentPage]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/search/filters');
      const data = await response.json();
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const searchSchools = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (searchQuery) queryParams.append('query', searchQuery);
      if (filters.feeRange.length > 0) queryParams.append('feeRange', filters.feeRange.join(','));
      if (filters.board.length > 0) queryParams.append('board', filters.board.join(','));
      if (filters.facilities.length > 0) queryParams.append('facilities', filters.facilities.join(','));
      if (filters.schoolType.length > 0) queryParams.append('schoolType', filters.schoolType.join(','));
      if (filters.ownership.length > 0) queryParams.append('ownership', filters.ownership.join(','));
      if (filters.coEdStatus.length > 0) queryParams.append('coEdStatus', filters.coEdStatus.join(','));
      if (filters.language.length > 0) queryParams.append('language', filters.language.join(','));
      if (filters.classOffered.length > 0) queryParams.append('classOffered', filters.classOffered.join(','));
      if (filters.academicSession.length > 0) queryParams.append('academicSession', filters.academicSession.join(','));
      if (filters.admissionProcess.length > 0) queryParams.append('admissionProcess', filters.admissionProcess.join(','));
      if (filters.location.length > 0) queryParams.append('location', filters.location.join(','));
      
      queryParams.append('page', currentPage);
      queryParams.append('limit', '12');

      const response = await fetch(`http://localhost:8080/api/search/search?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setSchools(data.data.schools);
        setPagination(data.data.pagination);
      } else {
        toast.error('Error searching schools');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching schools');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      feeRange: [],
      board: [],
      facilities: [],
      schoolType: [],
      ownership: [],
      coEdStatus: [],
      language: [],
      classOffered: [],
      academicSession: [],
      admissionProcess: [],
      location: []
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const FilterSection = ({ title, icon, options, filterType, multiple = true }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {options?.map((option, index) => (
          <label key={index} className="flex items-center space-x-2 cursor-pointer">
            <input
              type={multiple ? "checkbox" : "radio"}
              checked={filters[filterType].includes(option)}
              onChange={() => handleFilterChange(filterType, option)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect School</h1>
          <p className="text-gray-600">Search and filter schools based on your preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Search and Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search schools, cities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchSchools()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={searchSchools}
                  className="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Filter size={20} className="mr-2" />
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              {/* Filter Sections */}
              <div className="space-y-4">
                <FilterSection
                  title="Fee Range"
                  icon={<DollarSign size={16} className="text-green-600" />}
                  options={filterOptions.feeRanges}
                  filterType="feeRange"
                />

                <FilterSection
                  title="Board"
                  icon={<Award size={16} className="text-purple-600" />}
                  options={filterOptions.boards}
                  filterType="board"
                />

                <FilterSection
                  title="School Type"
                  icon={<Building size={16} className="text-blue-600" />}
                  options={filterOptions.schoolTypes}
                  filterType="schoolType"
                />

                <FilterSection
                  title="Ownership"
                  icon={<Building size={16} className="text-orange-600" />}
                  options={filterOptions.ownerships}
                  filterType="ownership"
                />

                <FilterSection
                  title="Co-ed Status"
                  icon={<Users size={16} className="text-pink-600" />}
                  options={filterOptions.coEdStatuses}
                  filterType="coEdStatus"
                />

                <FilterSection
                  title="Language"
                  icon={<BookOpen size={16} className="text-indigo-600" />}
                  options={filterOptions.languages}
                  filterType="language"
                />

                <FilterSection
                  title="Class Offered"
                  icon={<BookOpen size={16} className="text-teal-600" />}
                  options={filterOptions.classes}
                  filterType="classOffered"
                />

                <FilterSection
                  title="Academic Session"
                  icon={<Calendar size={16} className="text-red-600" />}
                  options={filterOptions.academicSessions}
                  filterType="academicSession"
                />

                <FilterSection
                  title="Admission Process"
                  icon={<CheckCircle size={16} className="text-green-600" />}
                  options={filterOptions.admissionProcesses}
                  filterType="admissionProcess"
                />

                <FilterSection
                  title="Location"
                  icon={<MapPin size={16} className="text-gray-600" />}
                  options={filterOptions.cities}
                  filterType="location"
                />

                <FilterSection
                  title="Facilities"
                  icon={<CheckCircle size={16} className="text-yellow-600" />}
                  options={filterOptions.facilities}
                  filterType="facilities"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {pagination.totalSchools || 0} Schools Found
                  </h2>
                  <p className="text-gray-600">
                    {filters.feeRange.length > 0 && `Fee Range: ${filters.feeRange.join(', ')}`}
                    {filters.board.length > 0 && ` | Board: ${filters.board.join(', ')}`}
                    {filters.location.length > 0 && ` | Location: ${filters.location.join(', ')}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                    <option value="name">Name</option>
                    <option value="feeRange">Fee Range</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Schools Grid */}
            {!loading && schools.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {schools.map((school) => (
                  <SchoolCard key={school._id} school={school} />
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && schools.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search size={64} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No schools found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPage;



