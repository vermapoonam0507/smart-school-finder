import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, User, MapPin, Building, Navigation, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { predictSchools } from '../api/predictorService';
import SchoolCard from '../components/SchoolCard';
import { toast } from 'react-toastify';

const schoolTypes = [
  'Day School', 'Boarding School', 'Day-cum-Boarding', 'International School',
  'Convent School', 'Private School', 'Government School'
];

const shiftOptions = [
  'Morning Shift', 'Afternoon Shift', 'Evening Shift', 'Full Day'
];

const genderOptions = [
  'Male', 'Female', 'Co-educational'
];

const stateOptions = [
  // States (28)
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal',
  // Union Territories (8)
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const cityOptions = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
  'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
  'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
];

const areaOptions = [
  'Central', 'North', 'South', 'East', 'West', 'Downtown', 'Suburbs',
  'Industrial Area', 'Residential Area', 'Commercial Area'
];

const interestsOptions = [
  'Sports', 'Music', 'Dance', 'Art & Craft', 'Science', 'Mathematics', 
  'Literature', 'Technology', 'Debate', 'Theater', 'Photography', 'Chess',
  'Focusing on Academics', 'Focuses on Practical Learning', 'Focuses on Theoretical Learning',
  'Empowering in Sports', 'Empowering in Arts', 'Special Focus on Mathematics',
  'Special Focus on Science', 'Special Focus on Physical Education',
  'Leadership Development', 'STEM Activities', 'Cultural Education',
  'Technology Integration', 'Environmental Awareness'
];

const PredictorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolType: '',
    preferredShifts: '',
    gender: '',
    state: '',
    city: '',
    area: '',
    interests: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on scrollbar or inside dropdown
      if (openDropdown && 
          !event.target.closest('.dropdown-container') &&
          !event.target.closest('.dropdown-scroll')) {
        setOpenDropdown(null);
      }
    };

    // Use mousedown instead of click to prevent interference with scrolling
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.area) {
      newErrors.area = 'Area is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          const data = await response.json();
          
          if (data.countryName === 'India') {
            setFormData(prev => ({
              ...prev,
              state: data.principalSubdivision || '',
              city: data.city || data.locality || '',
              area: data.localityInfo?.administrative?.[2]?.name || ''
            }));
            
            toast.success('Location fetched successfully!');
          } else {
            toast.error('Location service is only available in India.');
          }
        } catch (error) {
          console.error('Error fetching location:', error);
          toast.error('Failed to fetch location. Please try again.');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to access your location. Please enable location services.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleGetSchools = async (e) => {
    // Prevent any default form behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Map frontend field names to backend field names
      const payload = {
        schoolMode: formData.schoolType === 'Convent School' ? 'convent' :
                   formData.schoolType === 'Private School' ? 'private' :
                   formData.schoolType === 'Government School' ? 'government' : formData.schoolType,
        genderType: formData.gender === 'Male' ? 'boy' :
                   formData.gender === 'Female' ? 'girl' :
                   formData.gender === 'Co-educational' ? 'co-ed' : formData.gender,
        shifts: formData.preferredShifts === 'Morning Shift' ? 'morning' :
                formData.preferredShifts === 'Afternoon Shift' ? 'afternoon' :
                formData.preferredShifts === 'Evening Shift' ? 'night school' : formData.preferredShifts,
        state: formData.state,
        city: formData.city,
        area: formData.area,
        activities: formData.interests ? [formData.interests] : []
      };

      console.log('🔍 School Predictor - Searching with payload:', payload);
      const resp = await predictSchools(payload);
      const list = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
      console.log('✅ School Predictor - Found', list.length, 'schools');
      setSearchResults(list);
      
      if (list.length === 0) {
        toast.info('No schools found matching your criteria. Try adjusting your preferences.');
      }
    } catch (error) {
      console.error('❌ Prediction error:', error);
      toast.error('Failed to fetch school predictions. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setFormData({
      schoolType: '',
      preferredShifts: '',
      gender: '',
      state: '',
      city: '',
      area: '',
      interests: ''
    });
    setErrors({});
    setSearchResults([]);
    setHasSearched(false);
  };

  const DropdownField = ({ label, field, icon, required = false }) => {
    const isOpen = openDropdown === field;
    const dropdownRef = useRef(null);
    const options = 
      field === 'schoolType' ? schoolTypes :
      field === 'preferredShifts' ? shiftOptions :
      field === 'gender' ? genderOptions :
      field === 'state' ? stateOptions :
      field === 'city' ? cityOptions :
      field === 'area' ? areaOptions :
      field === 'interests' ? interestsOptions : [];
    
    const placeholder = 
      field === 'schoolType' ? 'Select School Type' :
      field === 'preferredShifts' ? 'Select Shift' :
      field === 'gender' ? 'Select' :
      field === 'state' ? 'Select' :
      field === 'city' ? 'Select' :
      field === 'area' ? 'Select' :
      field === 'interests' ? 'Select Interest' : 'Select';

    const handleSelect = (value) => {
      handleInputChange(field, value);
      setOpenDropdown(null);
    };

    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {required && <span className="text-red-500">*</span>}
          {label}
        </label>
        <div className="relative dropdown-container">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              {icon}
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpenDropdown(isOpen ? null : field)}
            className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-left ${
              icon ? 'pl-10' : ''
            } ${errors[field] ? 'border-red-500' : ''} ${!formData[field] ? 'text-gray-400' : 'text-gray-900'}`}
          >
            {formData[field] || placeholder}
          </button>
          <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} />
          
          {isOpen && (
            <div 
              ref={dropdownRef}
              className={`dropdown-scroll absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg ${
                field === 'state' || field === 'city' || field === 'interests' ? 'max-h-80' : 'max-h-60'
              }`}
              style={{ 
                overflow: 'auto'
              }}
            >
              {!required && (
                <div
                  onClick={() => handleSelect('')}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-400 border-b border-gray-200"
                >
                  {placeholder}
                </div>
              )}
              {options.length > 0 ? (
                options.map((option) => (
                  <div
                    key={`${field}-${option}`}
                    onClick={() => handleSelect(option)}
                    className={`px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors ${
                      formData[field] === option ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-900'
                    }`}
                  >
                    {option}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-400 text-center">
                  No options available
                </div>
              )}
            </div>
          )}
          
          {errors[field] && (
            <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Find Your Perfect School
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Fill in your preferences to discover schools that match your needs.
            </p>
          </div>

          <form onSubmit={handleGetSchools} className="space-y-6">
            <DropdownField
              label="Select School Type"
              field="schoolType"
            />
            
            <DropdownField
              label="Preferred Shifts"
              field="preferredShifts"
            />
            
            <DropdownField
              label="Gender"
              field="gender"
              icon={<User className="w-5 h-5" />}
              required={true}
            />
            
            <DropdownField
              label="State"
              field="state"
              icon={<MapPin className="w-5 h-5" />}
              required={true}
            />
            
            <DropdownField
              label="City"
              field="city"
              icon={<Building className="w-5 h-5" />}
              required={true}
            />
            
            <DropdownField
              label="Area"
              field="area"
              icon={<Navigation className="w-5 h-5" />}
              required={true}
            />
            
            <DropdownField
              label="Interests"
              field="interests"
              icon={<Heart className="w-5 h-5" />}
            />

            <div className="pt-4">
              <button
                type="button"
                onClick={handleGoogleLocation}
                disabled={isLoading}
                className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Fetching Location...
                  </div>
                ) : (
                  <>
                    <Navigation className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="block sm:inline">Fetch from Google Location</span>
                    <br className="hidden sm:block" />
                    <span className="text-xs sm:text-sm opacity-90 block sm:inline">(to see schools near you)</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base disabled:opacity-50"
              >
                {isLoading ? 'Finding Schools...' : 'Submit'}
              </button>
            </div>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Want to save your preferences?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Predicted Schools ({searchResults.length} schools found)
            </h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-gray-500">Analyzing your preferences...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((school, index) => (
                  <SchoolCard
                    key={school._id || school.id || `school-${index}`}
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
      </div>
    </div>
  );
};

export default PredictorPage;