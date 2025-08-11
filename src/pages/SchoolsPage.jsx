import React, { useState, useEffect } from 'react';
import { mockApi } from '../api/mockApi';
import SchoolCard from '../components/SchoolCard';

const SchoolsPage = ({ onNavigate, onSelectSchool, onCompareToggle, comparisonList }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
      board: 'All',
      feeRange: 'All'
  });

  useEffect(() => {
    const loadSchools = async () => {
      setLoading(true);
      const schoolData = await mockApi.fetchSchools();
      setSchools(schoolData);
      setLoading(false);
    };
    loadSchools();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const filteredSchools = schools.filter(school => {
      const matchesSearch = school.basicInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) || school.basicInfo.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBoard = filters.board === 'All' || school.basicInfo.board === filters.board;
      const matchesFee = filters.feeRange === 'All' || school.basicInfo.feeRange === filters.feeRange;
      return matchesSearch && matchesBoard && matchesFee;
  });

  const feeRanges = ["All", "1000 - 10000", "10000 - 25000", "25000 - 50000", "50000 - 75000", "75000 - 100000", "1 Lakh - 2 Lakh"];
  const boards = ["All", "CBSE", "ICSE", "KVS", "STATE", "OTHER"];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading schools...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Schools</h1>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input 
                    type="text"
                    placeholder="Search by name or city..."
                    className="p-2 border rounded-md w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select name="board" value={filters.board} onChange={handleFilterChange} className="p-2 border rounded-md w-full">
                    {boards.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select name="feeRange" value={filters.feeRange} onChange={handleFilterChange} className="p-2 border rounded-md w-full">
                    {feeRanges.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <button className="bg-blue-600 text-white rounded-md hover:bg-blue-700">Search</button>
            </div>
        </div>

        {/* School List */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSchools.length > 0 ? (
            filteredSchools.map(school => {

              // Check karein ki school compare list mein hai ya nahi

              const isCompared = comparisonList.some(item => item.id === school.id);
              return (
                <SchoolCard
                  key={school.id}
                  school={school}
                  onCardClick={() => { 
                    onSelectSchool(school);
                    onNavigate('school-details');
                  }}
                  onCompareToggle={() => onCompareToggle(school)} 
                  isCompared={isCompared} 
                />
              )
            })
          ) : (
            <p className="col-span-full text-center text-gray-500">No schools found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolsPage;