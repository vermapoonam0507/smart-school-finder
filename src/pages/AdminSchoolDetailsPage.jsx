import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  getSchoolById, 
  getAmenitiesById,
  getActivitiesById,
  getInfrastructureById,
  getFeesAndScholarshipsById,
  getAcademicsById,
  getOtherDetailsById,
  getFacultyById,
  getAdmissionTimelineById,
  getTechnologyAdoptionById,
  getSafetyAndSecurityById,
  getInternationalExposureById,
  updateSchoolStatus
} from "../api/adminService";
import { toast } from "react-toastify";
import {
  MapPin,
  BookOpen,
  Users,
  Heart,
  Building,
  Award,
  Sun,
  CheckCircle,
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Star,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  XCircle,
} from "lucide-react";

const InfoBox = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <div className="flex items-center text-gray-500 mb-1">
      {icon}
      <h3 className="text-sm font-medium ml-2">{label}</h3>
    </div>
    <p className="text-lg font-semibold text-gray-800">
      {Array.isArray(value) ? value.join(", ") : value || "N/A"}
    </p>
  </div>
);

const AdminSchoolDetailsPage = () => {
  const navigate = useNavigate();
  const { id: schoolId } = useParams();
  const { user: currentUser } = useAuth();

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [infrastructure, setInfrastructure] = useState(null);
  const [feesAndScholarships, setFeesAndScholarships] = useState(null);
  const [academics, setAcademics] = useState(null);
  const [otherDetails, setOtherDetails] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [admissionTimeline, setAdmissionTimeline] = useState(null);
  const [technologyAdoption, setTechnologyAdoption] = useState(null);
  const [safetyAndSecurity, setSafetyAndSecurity] = useState(null);
  const [internationalExposure, setInternationalExposure] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (!schoolId) return;

    // Validate schoolId format
    const isValidObjectId = (id) => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    // If schoolId is not a valid ObjectId, show error
    if (!isValidObjectId(schoolId)) {
      console.error(`Invalid school ID format: ${schoolId}. Expected MongoDB ObjectId format.`);
      toast.error("Invalid school ID format. Please check the URL.");
      navigate("/admin/dashboard");
      return;
    }

    const fetchSchoolDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching admin school details for ID:', schoolId);
        
        // Fetch school directly by ID
        const response = await getSchoolById(schoolId);
        const raw = response?.data;
        const schoolData = raw?.data || raw; // support {data: {...}} or direct {...}
        
        console.log('🔍 School data:', schoolData);
        
        if (schoolData) {
          console.log('🔍 School Data Structure:', schoolData);
          console.log('🔍 Available Image Fields:', {
            photos: schoolData.photos,
            profilePhoto: schoolData.profilePhoto,
            image: schoolData.image,
            logo: schoolData.logo,
            profileImage: schoolData.profileImage,
            schoolLogo: schoolData.schoolLogo,
            schoolImage: schoolData.schoolImage,
            schoolPhoto: schoolData.schoolPhoto,
            avatar: schoolData.avatar,
            picture: schoolData.picture,
            thumbnail: schoolData.thumbnail
          });
          console.log('🔍 All school keys containing "image", "photo", "logo", "avatar":', 
            Object.keys(schoolData).filter(key => 
              key.toLowerCase().includes('image') || 
              key.toLowerCase().includes('photo') || 
              key.toLowerCase().includes('logo') || 
              key.toLowerCase().includes('avatar') ||
              key.toLowerCase().includes('picture')
            )
          );
          setSchool(schoolData);
        } else {
          console.warn(`No school data returned for ID: ${schoolId}`);
          toast.error(`School with ID ${schoolId} not found`);
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("🔍 Fetch School Error:", error);
        toast.error("Could not load school details.");
        navigate("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    };

    const fetchAmenitiesAndActivities = async () => {
      try {
        const [amenitiesRes, activitiesRes] = await Promise.all([
          getAmenitiesById(schoolId),
          getActivitiesById(schoolId),
        ]);
        
        console.log("Amenities Response:", amenitiesRes?.data);
        console.log("Activities Response:", activitiesRes?.data);
        
        // Extract amenities from predefinedAmenities and customAmenities
        const amenitiesData = amenitiesRes?.data?.data || amenitiesRes?.data;
        const allAmenities = [
          ...(amenitiesData?.predefinedAmenities || []),
          ...(amenitiesData?.customAmenities || [])
        ];
        
        // Extract activities from activities and customActivities
        const activitiesData = activitiesRes?.data?.data || activitiesRes?.data;
        const allActivities = [
          ...(activitiesData?.activities || []),
          ...(activitiesData?.customActivities || [])
        ];
        
        setAmenities(allAmenities);
        setActivities(allActivities);
      } catch (e) {
        console.error("Error fetching amenities and activities:", e);
        setAmenities([]);
        setActivities([]);
      }
    };

    const fetchAdditionalDetails = async () => {
      try {
        const [
          infrastructureRes,
          feesRes,
          academicsRes,
          otherDetailsRes,
          facultyRes,
          admissionRes,
          technologyRes,
          safetyRes,
          internationalRes
        ] = await Promise.allSettled([
          getInfrastructureById(schoolId).catch(err => {
            if (err.response?.status === 404) {
              console.log('ℹ️ Infrastructure details not added for this school yet');
            } else {
              console.warn('Infrastructure fetch failed:', err.response?.status);
            }
            return { data: null };
          }),
          getFeesAndScholarshipsById(schoolId).catch(err => {
            if (err.response?.status === 404) {
              console.log('ℹ️ Fees details not added for this school yet');
            } else {
              console.warn('Fees fetch failed:', err.response?.status);
            }
            return { data: null };
          }),
          getAcademicsById(schoolId).catch(err => {
            if (err.response?.status === 404) {
              console.log('ℹ️ Academics details not added for this school yet');
            } else {
              console.warn('Academics fetch failed:', err.response?.status);
            }
            return { data: null };
          }),
          getOtherDetailsById(schoolId).catch(err => {
            if (err.response?.status === 404) {
              console.log('ℹ️ Other details not added for this school yet');
            } else {
              console.warn('Other details fetch failed:', err.response?.status);
            }
            return { data: null };
          }),
          getFacultyById(schoolId).catch(err => {
            if (err.response?.status === 404) {
              console.log('ℹ️ Faculty details not added for this school yet');
            } else {
              console.warn('Faculty fetch failed:', err.response?.status);
            }
            return { data: null };
          }),
          getAdmissionTimelineById(schoolId).catch(err => {
            if (err.response?.status === 404) {
              console.log('ℹ️ Admission timeline not added for this school yet');
            } else {
              console.warn('Admission timeline fetch failed:', err.response?.status);
            }
            return { data: null };
          }),
          getTechnologyAdoptionById(schoolId).catch(err => {
            if (err.response?.status === 404) {
              console.log('ℹ️ Technology adoption details not added for this school yet');
            } else {
              console.warn('Technology adoption fetch failed:', err.response?.status);
            }
            return { data: null };
          }),
          getSafetyAndSecurityById(schoolId).catch(err => {
            if (err.response?.status === 404) {
              console.log('ℹ️ Safety & security details not added for this school yet');
            } else {
              console.warn('Safety and security fetch failed:', err.response?.status);
            }
            return { data: null };
          }),
          getInternationalExposureById(schoolId).catch(err => {
            if (err.response?.status === 404) {
              console.log('ℹ️ International exposure details not added for this school yet');
            } else {
              console.warn('International exposure fetch failed:', err.response?.status);
            }
            return { data: null };
          })
        ]);

        // Extract data safely with null fallbacks
        const infrastructureData = infrastructureRes?.value?.data?.data || infrastructureRes?.value?.data || null;
        const feesData = feesRes?.value?.data?.data || feesRes?.value?.data || null;
        const academicsData = academicsRes?.value?.data?.data || academicsRes?.value?.data || null;
        const otherDetailsData = otherDetailsRes?.value?.data?.data || otherDetailsRes?.value?.data || null;
        const facultyData = facultyRes?.value?.data?.data || facultyRes?.value?.data || null;
        const admissionData = admissionRes?.value?.data?.data || admissionRes?.value?.data || null;
        const technologyData = technologyRes?.value?.data?.data || technologyRes?.value?.data || null;
        const safetyData = safetyRes?.value?.data?.data || safetyRes?.value?.data || null;
        const internationalData = internationalRes?.value?.data?.data || internationalRes?.value?.data || null;

        // Debug logging
        console.log('🔍 API Response Debug:');
        console.log('Infrastructure:', infrastructureData);
        console.log('Fees:', feesData);
        console.log('Academics:', academicsData);
        console.log('Admission Timeline:', admissionData);
        console.log('Safety & Security:', safetyData);
        console.log('Technology Adoption:', technologyData);
        console.log('International Exposure:', internationalData);
        
        // Log the structure of successful API calls
        if (technologyData) {
          console.log('🔍 Technology Adoption structure:', Object.keys(technologyData));
        }
        if (internationalData) {
          console.log('🔍 International Exposure structure:', Object.keys(internationalData));
        }

        // Check if we have school data with embedded details
        if (school) {
          console.log('🔍 Checking school object for embedded data...');
          console.log('🔍 School object keys:', Object.keys(school));
          console.log('🔍 Full school object:', school);
          
          // Check for any fields that might contain the data we need
          const allKeys = Object.keys(school);
          const relevantKeys = allKeys.filter(key => 
            key.toLowerCase().includes('infrastructure') ||
            key.toLowerCase().includes('fees') ||
            key.toLowerCase().includes('academic') ||
            key.toLowerCase().includes('admission') ||
            key.toLowerCase().includes('safety') ||
            key.toLowerCase().includes('security') ||
            key.toLowerCase().includes('technology') ||
            key.toLowerCase().includes('international')
          );
          console.log('🔍 Relevant keys in school object:', relevantKeys);
          
          // Try to extract data from school object if API endpoints failed
          // Check multiple possible field names for each data type
          const infrastructureFromSchool = school.infrastructure || school.infrastructureDetails || school.infrastructureData;
          if (!infrastructureData && infrastructureFromSchool) {
            console.log('📦 Found infrastructure in school object:', infrastructureFromSchool);
            setInfrastructure(infrastructureFromSchool);
          } else {
            setInfrastructure(infrastructureData);
          }
          
          const feesFromSchool = school.feesAndScholarships || school.fees || school.feesData || school.scholarships;
          if (!feesData && feesFromSchool) {
            console.log('📦 Found fees in school object:', feesFromSchool);
            setFeesAndScholarships(feesFromSchool);
          } else {
            setFeesAndScholarships(feesData);
          }
          
          const academicsFromSchool = school.academics || school.academicDetails || school.academicData;
          if (!academicsData && academicsFromSchool) {
            console.log('📦 Found academics in school object:', academicsFromSchool);
            setAcademics(academicsFromSchool);
          } else {
            setAcademics(academicsData);
          }
          
          const admissionFromSchool = school.admissionTimeline || school.admissionDetails || school.admissionData || school.admissionProcess;
          if (!admissionData && admissionFromSchool) {
            console.log('📦 Found admission timeline in school object:', admissionFromSchool);
            setAdmissionTimeline(admissionFromSchool);
          } else {
            setAdmissionTimeline(admissionData);
          }
          
          const safetyFromSchool = school.safetyAndSecurity || school.safetyDetails || school.safetyData || school.security;
          if (!safetyData && safetyFromSchool) {
            console.log('📦 Found safety & security in school object:', safetyFromSchool);
            setSafetyAndSecurity(safetyFromSchool);
          } else {
            setSafetyAndSecurity(safetyData);
          }
          
          const technologyFromSchool = school.technologyAdoption || school.technologyDetails || school.technologyData || school.technology;
          if (!technologyData && technologyFromSchool) {
            console.log('📦 Found technology adoption in school object:', technologyFromSchool);
            setTechnologyAdoption(technologyFromSchool);
          } else {
            setTechnologyAdoption(technologyData);
          }
          
          const internationalFromSchool = school.internationalExposure || school.internationalDetails || school.internationalData || school.international;
          if (!internationalData && internationalFromSchool) {
            console.log('📦 Found international exposure in school object:', internationalFromSchool);
            setInternationalExposure(internationalFromSchool);
          } else {
            setInternationalExposure(internationalData);
          }
        } else {
          // Fallback to API data
          setInfrastructure(infrastructureData);
          setFeesAndScholarships(feesData);
          setAcademics(academicsData);
          setOtherDetails(otherDetailsData);
          setFaculty(facultyData);
          setAdmissionTimeline(admissionData);
          setTechnologyAdoption(technologyData);
          setSafetyAndSecurity(safetyData);
          setInternationalExposure(internationalData);
        }
      } catch (e) {
        console.error("Error fetching additional details:", e);
      }
    };

    fetchSchoolDetails();
    fetchAmenitiesAndActivities();
    fetchAdditionalDetails();
  }, [schoolId, navigate]);

  const handleAcceptSchool = async () => {
    if (!schoolId) {
      toast.error('School ID is missing');
      return;
    }
    try {
      setIsAccepting(true);
      await updateSchoolStatus(schoolId, 'accepted');
      toast.success('School accepted successfully!');
      // Update local state to reflect the change
      setSchool(prev => ({ ...prev, status: 'accepted' }));
      // Optionally navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to accept school:', error);
      toast.error('Failed to accept school');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectSchool = async () => {
    if (!schoolId) {
      toast.error('School ID is missing');
      return;
    }
    try {
      setIsRejecting(true);
      await updateSchoolStatus(schoolId, 'rejected');
      toast.success('School rejected successfully!');
      // Update local state to reflect the change
      setSchool(prev => ({ ...prev, status: 'rejected' }));
      // Optionally navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to reject school:', error);
      toast.error('Failed to reject school');
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading school details...</span>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-gray-600 mb-4">Could not load school data.</p>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Back to Admin Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 relative">
          <div className="mb-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center text-sm text-gray-700 hover:text-indigo-600"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          {/* School Header with Profile Photo and Details */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            {/* School Profile Photo */}
            <div className="flex-shrink-0">
            <img
              src={(() => {
                const imageSources = [
                  school.photos && school.photos.length > 0 ? school.photos[0] : null,
                  school.profilePhoto,
                  school.image,
                  school.logo,
                  school.profileImage,
                  school.schoolLogo,
                  school.schoolImage,
                  school.schoolPhoto,
                  school.avatar,
                  school.picture,
                  school.thumbnail
                ].filter(Boolean);
                
                const selectedSource = imageSources[0] || "/api/placeholder/200/200";
                console.log('🖼️ Available image sources:', imageSources);
                console.log('🖼️ Selected image source:', selectedSource);
                return selectedSource;
              })()}
              alt={`${school.name} profile`}
              className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover border-4 border-gray-200 shadow-lg"
              onError={(e) => {
                console.log('🖼️ Image failed to load:', e.target.src);
                // Prevent infinite loop by checking if we're already on a fallback
                if (e.target.src.includes('/api/placeholder/') || e.target.src.includes('data:image/svg+xml')) {
                  console.log('🖼️ Fallback image also failed, using SVG placeholder');
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                } else {
                  console.log('🖼️ Trying fallback to placeholder...');
                  e.target.src = "/api/placeholder/200/200";
                }
              }}
              onLoad={(e) => {
                console.log('🖼️ Image loaded successfully:', e.target.src);
              }}
            />
            </div>
            
            {/* School Details */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                {school.name}
              </h1>
              <p className="text-lg text-gray-600 flex items-center mb-4">
                <MapPin size={18} className="mr-2" />
                {school.address || school.location || "Address not provided"}
              </p>
              <p className="text-md text-gray-700 mb-4">{school.description}</p>
              
              {/* Contact Information */}
              <div className="flex flex-wrap gap-4 mb-4">
                {school.phone && (
                  <div className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                    <Phone size={16} className="mr-2" />
                    <span className="text-sm">{school.phone}</span>
                  </div>
                )}
                {school.email && (
                  <div className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                    <Mail size={16} className="mr-2" />
                    <span className="text-sm">{school.email}</span>
                  </div>
                )}
                {school.website && (
                  <div className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                    <Globe size={16} className="mr-2" />
                    <a 
                      href={school.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      {school.website}
                    </a>
                  </div>
                )}
              </div>
              
              {/* Social Media Links */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Follow us:</span>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Facebook className="h-4 w-4 text-white" />
                  </div>
                  <div className="h-8 w-8 bg-pink-600 rounded-full flex items-center justify-center">
                    <Instagram className="h-4 w-4 text-white" />
                  </div>
                  <div className="h-8 w-8 bg-blue-400 rounded-full flex items-center justify-center">
                    <Twitter className="h-4 w-4 text-white" />
                  </div>
                  <div className="h-8 w-8 bg-blue-700 rounded-full flex items-center justify-center">
                    <Linkedin className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            {/* Status Badge */}
            {school.status && (
              <div className="w-full mb-2">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  school.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  school.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  school.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {school.status === 'pending' && <Clock className="h-4 w-4 mr-2" />}
                  {school.status === 'accepted' && <CheckCircle className="h-4 w-4 mr-2" />}
                  {school.status === 'rejected' && <XCircle className="h-4 w-4 mr-2" />}
                  Status: {school.status ? school.status.charAt(0).toUpperCase() + school.status.slice(1) : 'Unknown'}
                </span>
              </div>
            )}

            {/* Approval Buttons - Only show if status is pending */}
            {school.status === 'pending' && (
              <>
                <button
                  onClick={handleAcceptSchool}
                  disabled={isAccepting || isRejecting}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {isAccepting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Accept School
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleRejectSchool}
                  disabled={isAccepting || isRejecting}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {isRejecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2" />
                      Reject School
                    </>
                  )}
                </button>
              </>
            )}

            {/* Visit Website Button */}
            <a
              href={school.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Globe className="h-5 w-5 mr-2" />
              Visit Website
            </a>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              Basic Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <InfoBox
                icon={<Award size={16} />}
                label="Board"
                value={school.board}
              />
              <InfoBox
                icon={<Users size={16} />}
                label="Gender Type"
                value={school.genderType}
              />
              <InfoBox
                icon={<Building size={16} />}
                label="School Mode"
                value={school.schoolMode}
              />
              <InfoBox
                icon={<BookOpen size={16} />}
                label="Classes Upto"
                value={school.upto}
              />
              <InfoBox
                icon={<Sun size={16} />}
                label="Shifts"
                value={school.shifts}
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              Amenities & Activities
            </h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              
              {/* Amenities Count Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle size={16} className="text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {amenities.length}
                </div>
                <div className="text-sm text-gray-600">Amenities</div>
              </div>

              {/* Activities Count Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award size={16} className="text-teal-600" />
                </div>
                <div className="text-2xl font-bold text-teal-600 mb-1">
                  {activities.length}
                </div>
                <div className="text-sm text-gray-600">Activities</div>
              </div>

              {/* Total Facilities Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Building size={16} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {amenities.length + activities.length}
                </div>
                <div className="text-sm text-gray-600">Total Facilities</div>
              </div>

              {/* Available Services Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sun size={16} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {amenities.length > 0 && activities.length > 0 ? '100%' : amenities.length > 0 || activities.length > 0 ? '50%' : '0%'}
                </div>
                <div className="text-sm text-gray-600">Services Available</div>
              </div>
            </div>

            {/* Detailed Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Amenities Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Amenities</h3>
                {amenities.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle size={14} className="text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{typeof amenity === 'object' ? amenity.name : amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No amenities information available</p>
                )}
              </div>

              {/* Activities Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Activities</h3>
                {activities.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-center">
                        <Award size={14} className="text-blue-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{typeof activity === 'object' ? activity.name : activity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No activities information available</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Infrastructure Section */}
        {infrastructure && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              🏢 Infrastructure
            </h2>
            
            {/* Infrastructure Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              
              {/* Labs Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Building size={16} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {infrastructure.labs ? infrastructure.labs.length : 0}
                </div>
                <div className="text-sm text-gray-600">Laboratories</div>
              </div>

              {/* Sports Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sun size={16} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {infrastructure.sportsGrounds ? infrastructure.sportsGrounds.length : 0}
                </div>
                <div className="text-sm text-gray-600">Sports Facilities</div>
              </div>

              {/* Library Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen size={16} className="text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {infrastructure.libraryBooks ? (infrastructure.libraryBooks / 1000).toFixed(1) + 'K' : '0'}
                </div>
                <div className="text-sm text-gray-600">Books</div>
              </div>

              {/* Smart Classrooms Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award size={16} className="text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {infrastructure.smartClassrooms || 0}
                </div>
                <div className="text-sm text-gray-600">Smart Classrooms</div>
              </div>
            </div>

            {/* Detailed Infrastructure Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {infrastructure.labs && infrastructure.labs.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Laboratories</h3>
                  <div className="flex flex-wrap gap-2">
                    {infrastructure.labs.map((lab, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {lab}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {infrastructure.sportsGrounds && infrastructure.sportsGrounds.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Sports Facilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {infrastructure.sportsGrounds.map((sport, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {infrastructure.libraryBooks && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Library</h3>
                  <p className="text-gray-600">{infrastructure.libraryBooks.toLocaleString()} books available</p>
                </div>
              )}
              {infrastructure.smartClassrooms && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Smart Classrooms</h3>
                  <p className="text-gray-600">{infrastructure.smartClassrooms} smart classrooms</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fees & Affordability Section */}
        {feesAndScholarships && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              💰 Fees & Affordability
            </h2>
            
            {/* Fees Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award size={16} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {feesAndScholarships.scholarships ? feesAndScholarships.scholarships.length : 0}
                </div>
                <div className="text-sm text-gray-600">Scholarships</div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Building size={16} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {feesAndScholarships.classFees ? feesAndScholarships.classFees.length : 0}
                </div>
                <div className="text-sm text-gray-600">Class Levels</div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users size={16} className="text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {feesAndScholarships.scholarships && feesAndScholarships.scholarships.length > 0 ? 'Available' : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Financial Aid</div>
              </div>
            </div>

            {feesAndScholarships.classFees && feesAndScholarships.classFees.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Class-wise Fees</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-50 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Class</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tuition</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Activity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Transport</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feesAndScholarships.classFees.map((fee, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{fee.className}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">₹{fee.tuition?.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">₹{fee.activity?.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">₹{fee.transport?.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                            ₹{((fee.tuition || 0) + (fee.activity || 0) + (fee.transport || 0)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {feesAndScholarships.scholarships && feesAndScholarships.scholarships.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Scholarships Available</h3>
                <div className="space-y-3">
                  {feesAndScholarships.scholarships.map((scholarship, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800">{scholarship.name}</h4>
                      <p className="text-green-700">Amount: ₹{scholarship.amount?.toLocaleString()}</p>
                      <p className="text-green-600 text-sm">Type: {scholarship.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Academics Section */}
        {academics && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              🎓 Academics
            </h2>
            
            {/* Academic Results Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {academics.averageClass10Result && (
                <InfoBox
                  icon={<Award size={16} />}
                  label="Class 10 Average"
                  value={`${academics.averageClass10Result}%`}
                />
              )}
              {academics.averageClass12Result && (
                <InfoBox
                  icon={<Award size={16} />}
                  label="Class 12 Average"
                  value={`${academics.averageClass12Result}%`}
                />
              )}
              {academics.averageSchoolMarks && (
                <InfoBox
                  icon={<Award size={16} />}
                  label="Overall Average"
                  value={`${academics.averageSchoolMarks}%`}
                />
              )}
            </div>

            {/* Special Exam Training */}
            {academics.specialExamsTraining && academics.specialExamsTraining.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">🎯 Special Exam Training</h3>
                <div className="flex flex-wrap gap-2">
                  {academics.specialExamsTraining.map((exam, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                      {exam}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Curricular Activities */}
            {academics.extraCurricularActivities && academics.extraCurricularActivities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">🎨 Extra Curricular Activities</h3>
                <div className="flex flex-wrap gap-2">
                  {academics.extraCurricularActivities.map((activity, index) => (
                    <span key={index} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive Exam Qualifiers */}
            {academics.examQualifiers && academics.examQualifiers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">🏆 Competitive Exam Qualifiers</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-50 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Year</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Exam</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Students Participated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academics.examQualifiers.map((qualifier, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{qualifier.year}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                              {qualifier.exam}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">{qualifier.participation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Yearly Academic Performance */}
            {academics.academicResults && academics.academicResults.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">📊 Yearly Performance Data</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-50 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Year</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Pass Percentage</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Average Marks %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academics.academicResults.map((result, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{result.year}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                              {result.passPercent}%
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {result.averageMarksPercent}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Faculty Quality Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
            👨‍🏫 Faculty Quality
          </h2>
          {faculty ? (
            <div>
              {/* Faculty Statistics */}
              {faculty.facultyMembers && faculty.facultyMembers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <InfoBox
                    icon={<Users size={16} />}
                    label="Total Faculty"
                    value={`${faculty.facultyMembers.length} members`}
                  />
                  <InfoBox
                    icon={<Award size={16} />}
                    label="Avg Experience"
                    value={`${Math.round(faculty.facultyMembers.reduce((sum, member) => sum + (member.experience || 0), 0) / faculty.facultyMembers.length)} years`}
                  />
                  <InfoBox
                    icon={<Award size={16} />}
                    label="Faculty with Awards"
                    value={`${faculty.facultyMembers.filter(member => member.awards && member.awards.length > 0).length} members`}
                  />
                </div>
              )}
              
              {/* Faculty Members */}
              {faculty.facultyMembers && faculty.facultyMembers.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Faculty Members</h3>
                  <div className="space-y-3">
                    {faculty.facultyMembers.slice(0, 5).map((member, index) => (
                      <div key={member._id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{member.name}</h4>
                            <p className="text-gray-600">{member.qualification}</p>
                            <p className="text-gray-500 text-sm">{member.experience} years experience</p>
                          </div>
                          {member.awards && member.awards.length > 0 && (
                            <div className="ml-4">
                              <p className="text-xs text-gray-500 mb-1">Awards:</p>
                              <div className="flex flex-wrap gap-1">
                                {member.awards.slice(0, 2).map((award, awardIndex) => (
                                  <span key={awardIndex} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                    {award}
                                  </span>
                                ))}
                                {member.awards.length > 2 && (
                                  <span className="text-xs text-gray-500">+{member.awards.length - 2} more</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {faculty.facultyMembers.length > 5 && (
                      <div className="text-center text-gray-500 text-sm">
                        And {faculty.facultyMembers.length - 5} more faculty members...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  <p>No faculty members information available.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <p>No faculty information available.</p>
            </div>
          )}
        </div>

        {/* Safety & Security Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
            🛡️ Safety & Security
          </h2>
          {safetyAndSecurity ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CCTV Coverage (render even if 0) */}
              <InfoBox
                icon={<CheckCircle size={16} />}
                label="CCTV Coverage"
                value={
                  typeof safetyAndSecurity.cctvCoveragePercentage === 'number'
                    ? `${safetyAndSecurity.cctvCoveragePercentage}% coverage`
                    : 'N/A'
                }
              />
              
              {/* Medical Facility */}
              <InfoBox
                icon={<CheckCircle size={16} />}
                label="Medical Staff"
                value={safetyAndSecurity.medicalFacility?.doctorAvailability || 'N/A'}
              />
              <InfoBox
                icon={<CheckCircle size={16} />}
                label="Medical Kit"
                value={safetyAndSecurity.medicalFacility?.medkitAvailable ? 'Available' : 'Not available'}
              />
              <InfoBox
                icon={<CheckCircle size={16} />}
                label="Ambulance"
                value={safetyAndSecurity.medicalFacility?.ambulanceAvailable ? 'Available' : 'Not available'}
              />
              
              {/* Transport Safety */}
              <InfoBox
                icon={<CheckCircle size={16} />}
                label="GPS Tracking"
                value={safetyAndSecurity.transportSafety?.gpsTrackerAvailable ? 'Yes' : 'No'}
              />
              <InfoBox
                icon={<CheckCircle size={16} />}
                label="Driver Verification"
                value={safetyAndSecurity.transportSafety?.driversVerified ? 'All drivers verified' : 'Not verified'}
              />
              
              {/* Fire Safety */}
              {Array.isArray(safetyAndSecurity.fireSafetyMeasures) && safetyAndSecurity.fireSafetyMeasures.length > 0 ? (
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Fire Safety Measures</h3>
                  <div className="flex flex-wrap gap-2">
                    {safetyAndSecurity.fireSafetyMeasures.map((measure, index) => (
                      <span key={index} className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                        {measure}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <InfoBox
                  icon={<CheckCircle size={16} />}
                  label="Fire Safety"
                  value="No measures recorded"
                />
              )}
              
              {/* Visitor Management */}
              <InfoBox
                icon={<CheckCircle size={16} />}
                label="Visitor Management"
                value={safetyAndSecurity.visitorManagementSystem ? 'System in place' : 'Not available'}
              />
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-gray-400 mb-2">🛡️</div>
                <p className="text-gray-600 font-medium mb-2">Safety & Security Details</p>
                <p className="text-gray-500 text-sm">This school hasn't added safety & security information yet.</p>
              </div>
            </div>
          )}
        </div>

        {/* Admission Timeline Section */}
        {admissionTimeline ? (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              📅 Admission Timeline
            </h2>
            <div className="space-y-4">
              {Array.isArray(admissionTimeline.timelines) && admissionTimeline.timelines.length > 0 ? (
                admissionTimeline.timelines.map((timeline, index) => (
                  <div key={timeline._id || index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar size={20} className="text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-800">{timeline.eligibility?.admissionLevel || 'Admission Process'}</h3>
                        <p className="text-sm text-gray-600">{timeline.eligibility?.ageCriteria || '—'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-700"><strong>Start:</strong> {timeline.admissionStartDate ? new Date(timeline.admissionStartDate).toLocaleDateString() : 'N/A'}</p>
                      <p className="text-gray-700"><strong>End:</strong> {timeline.admissionEndDate ? new Date(timeline.admissionEndDate).toLocaleDateString() : 'N/A'}</p>
                      <p className="text-gray-700"><strong>Status:</strong> {timeline.status || 'N/A'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 border rounded-lg bg-gray-50 text-gray-600">No admission timeline entries yet.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              📅 Admission Timeline
            </h2>
            <div className="text-gray-500 text-center py-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-gray-400 mb-2">📅</div>
                <p className="text-gray-600 font-medium mb-2">Admission Timeline</p>
                <p className="text-gray-500 text-sm">This school hasn't added admission timeline information yet.</p>
              </div>
            </div>
          </div>
        )}

        {/* Technology Adoption Section */}
        {technologyAdoption && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              💻 Technology Adoption
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technologyAdoption.smartClassroomsPercentage && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Smart Classrooms</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {technologyAdoption.smartClassroomsPercentage}%
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${technologyAdoption.smartClassroomsPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              
              {technologyAdoption.elearningPlatforms && technologyAdoption.elearningPlatforms.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">E-learning Platforms</h3>
                  <div className="space-y-2">
                    {technologyAdoption.elearningPlatforms.map((platform, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{platform.platform}</span>
                        <span className="text-sm font-medium text-green-600">{platform.usagePercentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* International Exposure Section */}
        {internationalExposure && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              🌍 International Exposure
            </h2>
            <div className="space-y-4">
              {internationalExposure.studentsBenefitingPercentage && (
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-gray-800 mb-2">Students Benefiting</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {internationalExposure.studentsBenefitingPercentage}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-purple-500 h-3 rounded-full"
                      style={{ width: `${internationalExposure.studentsBenefitingPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {internationalExposure.exchangePrograms && internationalExposure.exchangePrograms.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Exchange Programs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {internationalExposure.exchangePrograms.map((program, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">{program.partnerSchool}</h4>
                        <p className="text-sm text-gray-600">{program.type}</p>
                        <p className="text-sm text-gray-500">Duration: {program.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminSchoolDetailsPage;

