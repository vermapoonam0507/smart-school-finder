// src/pages/SchoolDetailsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSchoolById, getAmenitiesById, getActivitiesById, getInfrastructureById, getFeesAndScholarshipsById, getAcademicsById, getOtherDetailsById, getFacultyById, getAdmissionTimelineById, getTechnologyAdoptionById, getSafetyAndSecurityById, getInternationalExposureById } from "../api/adminService";
import { toast } from "react-toastify";
import { validateSchoolId, handleInvalidSchoolId } from "../utils/objectIdUtils";
import {
  MapPin,
  BookOpen,
  Users,
  Heart,
  Building,
  Award,
  Sun,
  CheckCircle,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  X,
  Check
} from "lucide-react";
import ReviewSection from "../components/ReviewSection";

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

const SchoolDetailsPage = ({ shortlist, onShortlistToggle }) => {
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

  const handleCompare = () => {
    if (!school?._id) return;
    // seed comparison list with current school for convenience
    try {
      const saved = JSON.parse(localStorage.getItem('comparisonList') || '[]');
      const exists = saved.some((s) => (s.schoolId || s._id) === (school._id));
      const toSave = exists ? saved : [...saved, { ...school, schoolId: school._id }];
      localStorage.setItem('comparisonList', JSON.stringify(toSave));
      window.dispatchEvent(new CustomEvent('comparisonListUpdated', { detail: toSave }));
    } catch (_) {}
    navigate('/compare/select');
  };

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
      navigate("/schools");
      return;
    }

    const fetchSchoolDetails = async () => {
      try {
        setLoading(true);
        const response = await getSchoolById(schoolId);
        const schoolData = response?.data?.data || response?.data;

        if (schoolData) {
          setSchool(schoolData);
        } else {
          console.warn(`No school data returned for ID: ${schoolId}`);
          toast.error("School not found.");
          navigate("/schools");
        }
      } catch (error) {
        toast.error("Could not load school details.");
        console.error("Fetch School Error:", error);
        navigate("/schools");
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
        // Group related API calls to reduce network overhead
        const [amenitiesAndActivities, infrastructureAndAcademics, feesAndFaculty] = await Promise.all([
          // Group 1: Amenities & Activities (2 calls)
          Promise.allSettled([
            getAmenitiesById(schoolId).catch(() => ({ data: null })),
            getActivitiesById(schoolId).catch(() => ({ data: null }))
          ]),
          // Group 2: Infrastructure & Academics (2 calls)
          Promise.allSettled([
            getInfrastructureById(schoolId).catch(() => ({ data: null })),
            getAcademicsById(schoolId).catch(() => ({ data: null }))
          ]),
          // Group 3: Fees & Faculty (2 calls)
          Promise.allSettled([
            getFeesAndScholarshipsById(schoolId).catch(() => ({ data: null })),
            getFacultyById(schoolId).catch(() => ({ data: null }))
          ])
        ]);

        // Process amenities and activities
        const amenitiesRes = amenitiesAndActivities[0];
        const activitiesRes = amenitiesAndActivities[1];

        const amenitiesData = amenitiesRes?.value?.data?.data || amenitiesRes?.value?.data;
        const allAmenities = [
          ...(amenitiesData?.predefinedAmenities || []),
          ...(amenitiesData?.customAmenities || [])
        ];

        const activitiesData = activitiesRes?.value?.data?.data || activitiesRes?.value?.data;
        const allActivities = [
          ...(activitiesData?.activities || []),
          ...(activitiesData?.customActivities || [])
        ];

        setAmenities(allAmenities);
        setActivities(allActivities);

        // Process infrastructure and academics
        const infrastructureRes = infrastructureAndAcademics[0];
        const academicsRes = infrastructureAndAcademics[1];

        const infrastructureData = infrastructureRes?.value?.data?.data || infrastructureRes?.value?.data;
        const academicsData = academicsRes?.value?.data?.data || academicsRes?.value?.data;

        setInfrastructure(infrastructureData);
        setAcademics(academicsData);

        // Process fees and faculty
        const feesRes = feesAndFaculty[0];
        const facultyRes = feesAndFaculty[1];

        const feesData = feesRes?.value?.data?.data || feesRes?.value?.data;
        const facultyData = facultyRes?.value?.data?.data || facultyRes?.value?.data;

        setFeesAndScholarships(feesData);
        setFaculty(facultyData);

        // Load remaining details after initial render (lazy loading)
        setTimeout(async () => {
          try {
            const remainingDetails = await Promise.allSettled([
              getOtherDetailsById(schoolId).catch(() => ({ data: null })),
              getAdmissionTimelineById(schoolId).catch(() => ({ data: null })),
              getTechnologyAdoptionById(schoolId).catch(() => ({ data: null })),
              getSafetyAndSecurityById(schoolId).catch(() => ({ data: null })),
              getInternationalExposureById(schoolId).catch(() => ({ data: null }))
            ]);

            const otherDetailsRes = remainingDetails[0];
            const admissionRes = remainingDetails[1];
            const technologyRes = remainingDetails[2];
            const safetyRes = remainingDetails[3];
            const internationalRes = remainingDetails[4];

            setOtherDetails(otherDetailsRes?.value?.data?.data || otherDetailsRes?.value?.data);
            setAdmissionTimeline(admissionRes?.value?.data?.data || admissionRes?.value?.data);
            setTechnologyAdoption(technologyRes?.value?.data?.data || technologyRes?.value?.data);
            setSafetyAndSecurity(safetyRes?.value?.data?.data || safetyRes?.value?.data);
            setInternationalExposure(internationalRes?.value?.data?.data || internationalRes?.value?.data);
          } catch (e) {
            console.error("Error loading additional details:", e);
          }
        }, 100);

      } catch (e) {
        console.error("Error fetching grouped details:", e);
      }
    };

    fetchSchoolDetails();
    fetchAmenitiesAndActivities();
    fetchAdditionalDetails();
  }, [schoolId, navigate]);

  const handleApplyNow = () => {
    if (!currentUser) {
      toast.info("Please log in to apply.");
      navigate(`/login`);
      return;
    }
    if (currentUser.userType === "school") {
      toast.error("School accounts cannot submit student applications.");
      navigate('/school-portal');
      return;
    }
    navigate(`/apply/${school._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow-lg rounded-lg p-6">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-16 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          </div>

          {/* Content Sections Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p>Could not load school data.</p>
        <button
          onClick={() => navigate("/schools")}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Back to Schools
        </button>
      </div>
    );
  }

  const isShortlisted = shortlist.some((item) => item._id === school._id);

  return (
    <div className="bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 relative">
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm text-gray-700 hover:text-indigo-600"
            >
              ← Back
            </button>
          </div>
          {currentUser &&
            (currentUser.userType === "parent" ||
              currentUser.userType === "student") && (
              <button
                onClick={() => onShortlistToggle(school)}
                className="absolute top-6 right-6 text-gray-400 hover:text-red-500 z-10"
              >
                <Heart
                  size={28}
                  className={isShortlisted ? "fill-current text-red-500" : ""}
                />
              </button>
            )}
          
          {/* School Header with Profile Photo and Details */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            {/* School Profile Photo - Optimized */}
            <div className="flex-shrink-0">
              <img
                src={(() => {
                  // Simplified image source selection - check only essential fields
                  const imageSources = [
                    school.photos?.[0],
                    school.profilePhoto,
                    school.image,
                    school.logo,
                    school.profileImage,
                    school.schoolLogo
                  ].filter(Boolean);

                  return imageSources[0] || "/api/placeholder/200/200";
                })()}
                alt={`${school.name} profile`}
                className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover border-4 border-gray-200 shadow-lg"
                loading="lazy"
                onError={(e) => {
                  // Simplified error handling
                  if (!e.target.src.includes('placeholder')) {
                    e.target.src = "/api/placeholder/200/200";
                  }
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
                {(() => {
                  // Try different location field combinations
                  if (school.location) return school.location;
                  if (school.city && school.state) {
                    return `${school.area ? school.area + ', ' : ''}${school.city}, ${school.state}`;
                  }
                  if (school.city) return school.city;
                  if (school.state) return school.state;
                  if (school.area) return school.area;
                  return 'Location not specified';
                })()}
              </p>
              <p className="text-md text-gray-700 mb-4">{school.description}</p>
              
              {/* Contact Information */}
              <div className="flex flex-wrap gap-4 mb-4">
                {school.mobileNo && (
                  <div className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                    <Phone size={16} className="mr-2" />
                    <span className="text-sm">{school.mobileNo}</span>
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
              {(school.socialLinks || (school.facebook || school.twitter || school.instagram || school.linkedin)) && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Follow us:</span>
                  <div className="flex gap-2">
                    {school.socialLinks?.facebook && (
                      <a 
                        href={school.socialLinks.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                    {school.socialLinks?.instagram && (
                      <a 
                        href={school.socialLinks.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-600 transition-colors"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {school.socialLinks?.twitter && (
                      <a 
                        href={school.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Twitter size={20} />
                      </a>
                    )}
                    {school.socialLinks?.linkedin && (
                      <a 
                        href={school.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-700 transition-colors"
                      >
                        <Linkedin size={20} />
                      </a>
                    )}
                    {/* Fallback for direct social media fields */}
                    {school.facebook && (
                      <a 
                        href={school.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                    {school.instagram && (
                      <a 
                        href={school.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-600 transition-colors"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {school.twitter && (
                      <a 
                        href={school.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Twitter size={20} />
                      </a>
                    )}
                    {school.linkedin && (
                      <a 
                        href={school.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-700 transition-colors"
                      >
                        <Linkedin size={20} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          

          {/* Technology Adoption Display */}
          {(school.smartClassroomsPercentage || (school.elearningPlatforms && school.elearningPlatforms.length > 0)) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Technology Adoption</h3>
              
              {/* Donut Charts and Progress Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {school.smartClassroomsPercentage && (
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">📽️</span>
                        <div>
                          <span className="font-medium text-gray-800 block">Smart Classrooms</span>
                          <span className="text-xs text-gray-600 cursor-help" title="Smart classrooms improve engagement through interactive learning">
                            Interactive learning spaces
                          </span>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-blue-600">
                        {school.smartClassroomsPercentage}%
                      </span>
                    </div>
                    
                    {/* Donut Chart */}
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-300"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-blue-500"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${school.smartClassroomsPercentage}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">{school.smartClassroomsPercentage}%</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${school.smartClassroomsPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3 text-center">
                      {school.smartClassroomsPercentage}% of classrooms are smart-enabled
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline Section */}
              {(school.techAdoptionYear || school.lastTechUpgrade) && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Technology Timeline</h4>
                  <div className="space-y-2">
                    {school.techAdoptionYear && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        <span>Technology adoption started in {school.techAdoptionYear}</span>
                      </div>
                    )}
                    {school.lastTechUpgrade && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        <span>Last major upgrade in {school.lastTechUpgrade}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* International Exposure Display */}
          {(school.exchangePrograms && school.exchangePrograms.length > 0) || (school.globalTieups && school.globalTieups.length > 0) || school.studentsBenefitingPercentage ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">International Exposure</h3>
              
              {/* Impact Indicator */}
              {school.studentsBenefitingPercentage && (
                <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Students Benefiting from International Exposure</div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {school.studentsBenefitingPercentage}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${school.studentsBenefitingPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Percentage of students benefiting from international exposure programs
                    </p>
                  </div>
                </div>
              )}

              {/* Exchange Programs Cards */}
              {school.exchangePrograms && school.exchangePrograms.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Exchange Programs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {school.exchangePrograms.map((program, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center mb-3">
                          <span className="text-2xl mr-2">🌍</span>
                          <div>
                            <h5 className="font-medium text-gray-800">{program.partnerSchool}</h5>
                            <p className="text-sm text-gray-600">{program.type}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{program.duration}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Students:</span>
                            <span className="font-medium">{program.studentsParticipated}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Since:</span>
                            <span className="font-medium">{program.activeSince}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Global Tie-ups Cards */}
              {school.globalTieups && school.globalTieups.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Global Tie-ups</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {school.globalTieups.map((tieup, index) => (
                      <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center mb-3">
                          <span className="text-2xl mr-2">🤝</span>
                          <div>
                            <h5 className="font-medium text-gray-800">{tieup.partnerName}</h5>
                            <p className="text-sm text-gray-600">{tieup.nature}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Active Since:</span>
                            <span className="font-medium">{tieup.activeSince}</span>
                          </div>
                          {tieup.description && (
                            <p className="text-sm text-gray-600 mt-2">{tieup.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Stories */}
              {school.successStories && school.successStories.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Success Stories</h4>
                  <div className="space-y-4">
                    {school.successStories.map((story, index) => (
                      <div key={index} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800 mb-1">{story.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{story.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Year: {story.year}</span>
                              <span>Students: {story.studentsBenefited}</span>
                            </div>
                          </div>
                          <span className="text-2xl">🏆</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* International Photos */}
              {school.internationalPhotos && school.internationalPhotos.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Exchange Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {school.internationalPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={photo} 
                          alt={`Exchange photo ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                          <span className="text-white opacity-0 hover:opacity-100 transition-opacity duration-300 text-sm">
                            Exchange Visit
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Brochure Button */}
              <div className="text-center">
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  📄 Download International Programs Brochure
                </button>
              </div>
            </div>
          ) : null}
          
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={school.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Visit Website
            </a>
            <button
              onClick={handleApplyNow}
              className="border border-indigo-600 text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Apply Now
            </button>
            <button
              onClick={handleCompare}
              className="border border-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Compare
            </button>
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
                        <span className="text-sm text-gray-700">{amenity}</span>
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
                        <span className="text-sm text-gray-700">{activity}</span>
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
                <div className="text-sm text-gray-600">Labs</div>
              </div>

              {/* Books Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen size={16} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {infrastructure.libraryBooks ? (infrastructure.libraryBooks >= 1000 ? `${Math.round(infrastructure.libraryBooks / 1000)}K` : infrastructure.libraryBooks) : '0'}
                </div>
                <div className="text-sm text-gray-600">Books</div>
              </div>

              {/* Sports Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award size={16} className="text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {infrastructure.sportsGrounds ? infrastructure.sportsGrounds.length : 0}
                </div>
                <div className="text-sm text-gray-600">Sports</div>
              </div>

              {/* Smart Rooms Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle size={16} className="text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {infrastructure.smartClassrooms || 0}
                </div>
                <div className="text-sm text-gray-600">Smart Rooms</div>
              </div>
            </div>

            {/* Detailed Infrastructure Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Laboratory Facilities */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Laboratory Facilities</h3>
                {infrastructure.labs && infrastructure.labs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {infrastructure.labs.map((lab, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                        {lab}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No laboratory information available</p>
                )}
              </div>

              {/* Sports Grounds */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sports Grounds</h3>
                {infrastructure.sportsGrounds && infrastructure.sportsGrounds.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {infrastructure.sportsGrounds.map((sport, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full text-center">
                        {sport}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No sports facilities information available</p>
              )}
                </div>

              {/* Additional Facilities */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Facilities</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">
                      Auditorium {infrastructure.auditoriumSeats ? `(${infrastructure.auditoriumSeats} seats)` : ''}
                    </span>
                </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Medical Room</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Cafeteria</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Transport Service</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Safety & Security Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
            🛡️ Safety & Security
          </h2>
          
          {safetyAndSecurity ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CCTV Coverage Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle size={16} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">CCTV Coverage</h3>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {safetyAndSecurity.cctvCoveragePercentage || 'N/A'}%
                  </div>
                  <div className="text-sm text-gray-600 mb-4">Campus Monitored</div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-800 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, safetyAndSecurity.cctvCoveragePercentage || 0))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Medical Facilities Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <Heart size={16} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Medical Facilities</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Doctor Available</span>
                    <span className="text-sm font-medium text-gray-800">
                      {safetyAndSecurity.medicalFacility?.doctorAvailability || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Nurse Available</span>
                    <span className="text-sm font-medium text-gray-800">
                      {safetyAndSecurity.medicalFacility?.nurseAvailability || '24/7'}
                      </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ambulance</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      safetyAndSecurity.medicalFacility?.ambulanceAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {safetyAndSecurity.medicalFacility?.ambulanceAvailable ? 'Available' : 'N/A'}
                    </span>
                </div>
                </div>
              </div>

              {/* Transport Safety Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Building size={16} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Transport Safety</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">GPS Tracking</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      safetyAndSecurity.transportSafety?.gpsTrackerAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {safetyAndSecurity.transportSafety?.gpsTrackerAvailable ? 'Yes' : 'No'}
                    </span>
                </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Attendant Present</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      safetyAndSecurity.transportSafety?.attendantPresent 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {safetyAndSecurity.transportSafety?.attendantPresent ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Routes Available</span>
                    <span className="text-sm font-medium text-gray-800">
                      {safetyAndSecurity.transportRoutes && Array.isArray(safetyAndSecurity.transportRoutes) && safetyAndSecurity.transportRoutes.length > 0
                        ? `${safetyAndSecurity.transportRoutes.length} routes`
                        : safetyAndSecurity.transportSafety?.routesAvailable || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <p>No safety & security information available.</p>
            </div>
          )}
        </div>

        {/* Fees & Affordability Section */}
        {feesAndScholarships && (
          <div id="fees-section" className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              💰 Fees & Affordability
            </h2>
            
            {/* Fee Transparency Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Fee Transparency</h3>
                  <p className="text-sm text-gray-600 mb-2">Full fee structure published annually</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Transparent Fee Structure</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (feesAndScholarships && feesAndScholarships.classFees && feesAndScholarships.classFees.length > 0) {
                      // Scroll to fees section or show fees modal
                      const feesSection = document.getElementById('fees-section');
                      if (feesSection) {
                        feesSection.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        toast.info("Fee structure is available in the Fees & Affordability section below.");
                      }
                    } else {
                      toast.info("Fee structure not available for this school.");
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Globe size={16} className="mr-2" />
                  View Fees
                </button>
              </div>
            </div>

            {/* Scholarships & Concessions */}
              <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <Award size={16} className="text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Scholarships & Concessions</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Academic Excellence Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">50%</div>
                    <div className="text-sm text-gray-600 mb-1">Fee Reduction</div>
                    <div className="text-sm font-medium text-gray-800 mb-1">Academic Excellence</div>
                    <div className="text-xs text-gray-500">Top 5% students</div>
                  </div>
                </div>

                {/* Sports Achievement Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">30%</div>
                    <div className="text-sm text-gray-600 mb-1">Fee Reduction</div>
                    <div className="text-sm font-medium text-gray-800 mb-1">Sports Achievement</div>
                    <div className="text-xs text-gray-500">State/National level players</div>
                  </div>
                </div>

                {/* Need-based Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">25%</div>
                    <div className="text-sm text-gray-600 mb-1">Fee Reduction</div>
                    <div className="text-sm font-medium text-gray-800 mb-1">Need-based</div>
                    <div className="text-xs text-gray-500">Family income &lt; 2 LPA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Class-wise Fees Table (if available) */}
            {feesAndScholarships.classFees && feesAndScholarships.classFees.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Class-wise Fee Structure</h3>
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
          </div>
        )}

        {/* Technology Adoption Section */}
        {(technologyAdoption || school.smartClassroomsPercentage || school.elearningPlatforms) && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              💻 Technology Adoption
            </h2>
            
            {/* Main Technology Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Smart Classrooms Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle size={16} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Smart Classrooms</h3>
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {school.smartClassroomsPercentage || technologyAdoption?.smartClassroomsPercentage || 'N/A'}%
                  </div>
                  <div className="text-sm text-gray-600 mb-4">Classrooms Digitized</div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gray-800 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, school.smartClassroomsPercentage || technologyAdoption?.smartClassroomsPercentage || 0))}%` 
                      }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-3">
                    Interactive learning environment with modern technology
                  </p>
                </div>
              </div>

              {/* E-Learning Platform Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Globe size={16} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">E-Learning Platform</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle size={12} className="text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">School Management System & Learning Portal</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Active & Accessible 24/7</span>
                  </div>
                  
                  {(school.elearningPlatforms && school.elearningPlatforms.length > 0) && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Available Platforms:</p>
                      <div className="flex flex-wrap gap-1">
                        {school.elearningPlatforms.slice(0, 3).map((platform, index) => (
                          <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {platform.platform}
                          </span>
                        ))}
                        {school.elearningPlatforms.length > 3 && (
                          <span className="text-xs text-gray-500">+{school.elearningPlatforms.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Technology Integration Details */}
            {technologyAdoption?.technologyIntegration && (
              <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Technology Integration</h3>
                <p className="text-gray-600">{technologyAdoption.technologyIntegration}</p>
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
            
            {/* Visual Academic Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Board Results Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Award size={16} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Board Results</h3>
                </div>
                
                {/* Pass Percentage */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Pass Percentage</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {academics.averageClass12Result || academics.averageClass10Result || academics.averageSchoolMarks || 'N/A'}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-800 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, academics.averageClass12Result || academics.averageClass10Result || academics.averageSchoolMarks || 0))}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Average Marks */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Average Marks</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {academics.averageClass10Result || academics.averageSchoolMarks || 'N/A'}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-800 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, academics.averageClass10Result || academics.averageSchoolMarks || 0))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Board Results by Year */}
            {school.academicResults && school.academicResults.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Board Results by Year</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Percentage</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Marks %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {school.academicResults
                        .filter(result => result.year && (result.passPercent || result.averageMarksPercent))
                        .sort((a, b) => Number(b.year) - Number(a.year))
                        .map((result, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{result.year}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {result.passPercent ? `${result.passPercent}%` : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {result.averageMarksPercent ? `${result.averageMarksPercent}%` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Exam Qualifiers & Participation */}
            {school.examQualifiers && school.examQualifiers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">🏆 Exam Qualifiers & Participation</h3>
                <div className="space-y-4">
                  {school.examQualifiers
                    .filter(qualifier => qualifier.year && qualifier.exam)
                    .sort((a, b) => Number(b.year) - Number(a.year))
                    .map((qualifier, index) => (
                      <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                {qualifier.year}
                              </span>
                              <h4 className="text-lg font-semibold text-gray-800">{qualifier.exam}</h4>
                            </div>
                            {qualifier.participation && (
                              <p className="text-gray-600">
                                <span className="font-medium">Qualifier/Participation:</span> {qualifier.participation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* International Exposure Section */}
        {internationalExposure && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              🌍 International Exposure
            </h2>
            {internationalExposure.exchangePrograms && internationalExposure.exchangePrograms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Exchange Programs</h3>
                <div className="space-y-3">
                  {internationalExposure.exchangePrograms.map((program, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800">{program.partnerSchool}</h4>
                      <p className="text-blue-700">Type: {program.programType}</p>
                      <p className="text-blue-600 text-sm">Duration: {program.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {internationalExposure.globalTieUps && internationalExposure.globalTieUps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Global Partnerships</h3>
                <div className="space-y-3">
                  {internationalExposure.globalTieUps.map((tieup, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800">{tieup.partnerName}</h4>
                      <p className="text-green-700">Type: {tieup.natureOfTieUp}</p>
                      {tieup.description && <p className="text-green-600 text-sm">{tieup.description}</p>}
                    </div>
                  ))}
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
              {/* Faculty Summary Cards */}
              {faculty.facultyMembers && faculty.facultyMembers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  
                  {/* Total Faculty Card */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {faculty.facultyMembers.length}
                </div>
                      <div className="text-sm text-gray-600 mb-1">Total Faculty</div>
                      <div className="text-xs text-gray-500">Qualified Teachers</div>
                    </div>
                  </div>

                  {/* Average Experience Card */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {Math.round(faculty.facultyMembers.reduce((sum, member) => sum + (member.experience || 0), 0) / faculty.facultyMembers.length)}
                          </div>
                      <div className="text-sm text-gray-600 mb-1">Average Experience</div>
                      <div className="text-xs text-gray-500">Years</div>
                    </div>
                  </div>

                  {/* Qualification Levels Card */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="text-center mb-4">
                      <div className="text-sm text-gray-600 mb-1">Qualification Levels</div>
                    </div>
                    
                    {/* Masters Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Masters</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {Math.round((faculty.facultyMembers.filter(member => 
                            member.qualification && member.qualification.toLowerCase().includes('master')
                          ).length / faculty.facultyMembers.length) * 100)}%
                                  </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gray-800 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.round((faculty.facultyMembers.filter(member => 
                              member.qualification && member.qualification.toLowerCase().includes('master')
                            ).length / faculty.facultyMembers.length) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* PhD Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">PhD</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {Math.round((faculty.facultyMembers.filter(member => 
                            member.qualification && member.qualification.toLowerCase().includes('phd')
                          ).length / faculty.facultyMembers.length) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gray-800 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.round((faculty.facultyMembers.filter(member => 
                              member.qualification && member.qualification.toLowerCase().includes('phd')
                            ).length / faculty.facultyMembers.length) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                              </div>
                            </div>
                          )}
              
              {/* Notable Faculty Members */}
              {faculty.facultyMembers && faculty.facultyMembers.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Award size={16} className="text-green-600" />
                        </div>
                    <h3 className="text-lg font-semibold text-gray-800">Notable Faculty Members</h3>
                      </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {faculty.facultyMembers.slice(0, 4).map((member, index) => (
                      <div key={member._id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-sm">{member.name}</h4>
                            <p className="text-gray-600 text-xs">{member.qualification}</p>
                          </div>
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {member.experience || 0} yrs
                          </span>
                        </div>
                        
                        {member.awards && member.awards.length > 0 && (
                          <div className="flex items-center">
                            <Award size={12} className="text-yellow-500 mr-1" />
                            <span className="text-gray-500 text-xs">{member.awards[0]}</span>
                      </div>
                    )}
                  </div>
                    ))}
                </div>
                  
                  {faculty.facultyMembers.length > 4 && (
                    <div className="text-center text-gray-500 text-sm mt-4">
                      And {faculty.facultyMembers.length - 4} more faculty members...
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <p>No faculty information available.</p>
            </div>
          )}
        </div>

        {/* Admission Process Timeline Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <Award size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Admission Process</h2>
              <p className="text-sm text-gray-600">Admission Timeline 2024-25</p>
            </div>
          </div>
          
          {admissionTimeline && admissionTimeline.timelines && admissionTimeline.timelines.length > 0 ? (
            <div className="space-y-4">
              {admissionTimeline.timelines.map((timeline, index) => {
                const getStatusInfo = (status) => {
                  switch (status) {
                    case 'Ongoing':
                      return { color: 'bg-green-100 text-green-800', text: 'Open', icon: '✓' };
                    case 'Ended':
                      return { color: 'bg-red-100 text-red-800', text: 'Closed', icon: '✗' };
                    default:
                      return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: '⏰' };
                  }
                };
                
                const statusInfo = getStatusInfo(timeline.status);
                
                return (
                  <div key={timeline._id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                          timeline.status === 'Ongoing' ? 'bg-green-100' : 
                          timeline.status === 'Ended' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          <span className="text-sm font-bold">
                            {timeline.status === 'Ongoing' ? '✓' : 
                             timeline.status === 'Ended' ? '✗' : '⏰'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {timeline.eligibility?.admissionLevel || 'Admission Process'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {timeline.eligibility?.ageCriteria || 'Application Period: ' + 
                             new Date(timeline.admissionStartDate).toLocaleDateString() + ' - ' + 
                             new Date(timeline.admissionEndDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                        {timeline.status === 'Ongoing' && (
                          <button 
                            onClick={() => handleApplyNow()}
                            className="bg-black text-white px-4 py-1 rounded text-xs font-medium hover:bg-gray-800 transition-colors"
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <p>No admission timeline information available.</p>
            </div>
          )}
        </div>

        {/* Special Exam Training Section */}
        {academics && academics.specialExamsTraining && academics.specialExamsTraining.length > 0 && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Award size={16} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Special Exam Training</h2>
                <p className="text-sm text-gray-600">Competitive Exam Preparation</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {academics.specialExamsTraining.map((exam, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Award size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{exam}</h3>
                      <p className="text-sm text-gray-600">Specialized Training</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extra Curricular Activities Section */}
        {academics && academics.extraCurricularActivities && academics.extraCurricularActivities.length > 0 && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Sun size={16} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Extra Curricular Activities</h2>
                <p className="text-sm text-gray-600">Student Development Programs</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {academics.extraCurricularActivities.map((activity, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Award size={16} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{activity}</h3>
                      <p className="text-sm text-gray-600">Student Activity</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <ReviewSection schoolId={school._id} />

        {/* Required Documents Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
              <Award size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Required Documents</h2>
              <p className="text-sm text-gray-600">Documents needed for admission process</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* General Documents */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle size={12} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">General Documents</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Birth Certificate</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Previous School Marksheet</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Aadhar Card</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Passport Size Photos</span>
                </div>
              </div>
            </div>

            {/* Academic Documents */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle size={12} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Academic Documents</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Transfer Certificate</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Character Certificate</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Medical Certificate</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Bonafide Certificate</span>
                </div>
              </div>
            </div>

            {/* Additional Documents */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle size={12} className="text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Additional Documents</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Income Certificate (if applicable)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Caste Certificate (if applicable)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Sports Achievement Certificate</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Guardian ID Proof</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailsPage;
