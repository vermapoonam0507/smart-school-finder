// src/pages/SchoolDetailsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSchoolById, getAmenitiesById, getActivitiesById, getInfrastructureById, getFeesAndScholarshipsById, getAcademicsById, getOtherDetailsById, getFacultyById, getAdmissionTimelineById, getTechnologyAdoptionById, getSafetyAndSecurityById, getInternationalExposureById } from "../api/adminService";
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

  useEffect(() => {
    if (!schoolId) return;

    const fetchSchoolDetails = async () => {
      try {
        setLoading(true);
        const response = await getSchoolById(schoolId);
        const raw = response?.data;
        const schoolData = raw?.data || raw; // support {data: {...}} or direct {...}
        if (schoolData) {
          setSchool(schoolData);
        } else {
          console.warn(`No school data returned for ID: ${schoolId}`);
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
            console.warn('Infrastructure fetch failed:', err);
            return null;
          }),
          getFeesAndScholarshipsById(schoolId).catch(err => {
            console.warn('Fees fetch failed:', err);
            return null;
          }),
          getAcademicsById(schoolId).catch(err => {
            console.warn('Academics fetch failed:', err);
            return null;
          }),
          getOtherDetailsById(schoolId).catch(err => {
            console.warn('Other details fetch failed:', err);
            return null;
          }),
          getFacultyById(schoolId).catch(err => {
            console.warn('Faculty fetch failed:', err);
            return null;
          }),
          getAdmissionTimelineById(schoolId).catch(err => {
            console.warn('Admission timeline fetch failed:', err);
            return null;
          }),
          getTechnologyAdoptionById(schoolId).catch(err => {
            console.warn('Technology adoption fetch failed:', err);
            return null;
          }),
          getSafetyAndSecurityById(schoolId).catch(err => {
            console.warn('Safety and security fetch failed:', err);
            return null;
          }),
          getInternationalExposureById(schoolId).catch(err => {
            console.warn('International exposure fetch failed:', err);
            return null;
          })
        ]);

        // Extract data safely with null fallbacks
        setInfrastructure(infrastructureRes?.value?.data?.data || infrastructureRes?.value?.data || null);
        setFeesAndScholarships(feesRes?.value?.data?.data || feesRes?.value?.data || null);
        setAcademics(academicsRes?.value?.data?.data || academicsRes?.value?.data || null);
        setOtherDetails(otherDetailsRes?.value?.data?.data || otherDetailsRes?.value?.data || null);
        setFaculty(facultyRes?.value?.data?.data || facultyRes?.value?.data || null);
        setAdmissionTimeline(admissionRes?.value?.data?.data || admissionRes?.value?.data || null);
        setTechnologyAdoption(technologyRes?.value?.data?.data || technologyRes?.value?.data || null);
        setSafetyAndSecurity(safetyRes?.value?.data?.data || safetyRes?.value?.data || null);
        setInternationalExposure(internationalRes?.value?.data?.data || internationalRes?.value?.data || null);
      } catch (e) {
        console.error("Error fetching additional details:", e);
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
      <div className="flex justify-center items-center h-screen">
        Loading school details...
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            {school.name}
          </h1>
          <p className="text-lg text-gray-600 flex items-center mb-4">
            <MapPin size={18} className="mr-2" />
            {school.location}
          </p>
          <p className="text-md text-gray-700">{school.description}</p>
          

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

                {school.elearningPlatforms && school.elearningPlatforms.length > 0 && (
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">💻</span>
                        <div>
                          <span className="font-medium text-gray-800 block">E-learning Usage</span>
                          <span className="text-xs text-gray-600 cursor-help" title="Digital learning platforms enhance student engagement and accessibility">
                            Digital learning platforms
                          </span>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-green-600">
                        {Math.round(school.elearningPlatforms.reduce((sum, p) => sum + (parseInt(p.usagePercentage) || 0), 0) / school.elearningPlatforms.length)}%
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
                          className="text-green-500"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${Math.round(school.elearningPlatforms.reduce((sum, p) => sum + (parseInt(p.usagePercentage) || 0), 0) / school.elearningPlatforms.length)}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">
                          {Math.round(school.elearningPlatforms.reduce((sum, p) => sum + (parseInt(p.usagePercentage) || 0), 0) / school.elearningPlatforms.length)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.round(school.elearningPlatforms.reduce((sum, p) => sum + (parseInt(p.usagePercentage) || 0), 0) / school.elearningPlatforms.length)}%` 
                        }}
                      ></div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Platforms in use:</p>
                      <div className="flex flex-wrap gap-1">
                        {school.elearningPlatforms.map((platform, index) => (
                          <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {platform.platform} ({platform.usagePercentage}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Digital Adoption Index with Enhanced Visualization */}
              {(school.smartClassroomsPercentage || (school.elearningPlatforms && school.elearningPlatforms.length > 0)) && (
                <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Digital Adoption Index</div>
                    <div className="text-4xl font-bold text-indigo-600 mb-2">
                      {Math.round(((parseInt(school.smartClassroomsPercentage) || 0) + 
                        (school.elearningPlatforms && school.elearningPlatforms.length > 0 
                          ? Math.round(school.elearningPlatforms.reduce((sum, p) => sum + (parseInt(p.usagePercentage) || 0), 0) / school.elearningPlatforms.length)
                          : 0)) / 2)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700"
                        style={{ 
                          width: `${Math.round(((parseInt(school.smartClassroomsPercentage) || 0) + 
                            (school.elearningPlatforms && school.elearningPlatforms.length > 0 
                              ? Math.round(school.elearningPlatforms.reduce((sum, p) => sum + (parseInt(p.usagePercentage) || 0), 0) / school.elearningPlatforms.length)
                              : 0)) / 2)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Combined technology adoption score
                    </p>
                  </div>
                </div>
              )}

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
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              Basic Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            {amenities.length > 0 || activities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full flex items-center"
                  >
                    <CheckCircle size={14} className="mr-1.5" />
                    {amenity}
                  </span>
                ))}
                {activities.map((activity) => (
                  <span
                    key={activity}
                    className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full flex items-center"
                  >
                    <CheckCircle size={14} className="mr-1.5" />
                    {activity}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <p>No amenities or activities information available.</p>
                <p className="text-sm mt-2">Debug: amenities={amenities.length}, activities={activities.length}</p>
              </div>
            )}
          </div>
        </div>

        {/* Infrastructure Section */}
        {infrastructure && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              🏢 Infrastructure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {infrastructure.labs && infrastructure.labs.length > 0 && (
                <div>
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
                <div>
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Library</h3>
                  <p className="text-gray-600">{infrastructure.libraryBooks.toLocaleString()} books available</p>
                </div>
              )}
              {infrastructure.smartClassrooms && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Smart Classrooms</h3>
                  <p className="text-gray-600">{infrastructure.smartClassrooms} smart classrooms</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Safety & Security Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
            🛡️ Safety & Security
          </h2>
          {safetyAndSecurity ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CCTV Coverage */}
              {safetyAndSecurity.cctvCoveragePercentage && (
                <InfoBox
                  icon={<CheckCircle size={16} />}
                  label="CCTV Coverage"
                  value={`${safetyAndSecurity.cctvCoveragePercentage}% coverage`}
                />
              )}
              
              {/* Medical Facility */}
              {safetyAndSecurity.medicalFacility?.doctorAvailability && (
                <InfoBox
                  icon={<CheckCircle size={16} />}
                  label="Medical Staff"
                  value={safetyAndSecurity.medicalFacility.doctorAvailability}
                />
              )}
              
              {safetyAndSecurity.medicalFacility?.medkitAvailable && (
                <InfoBox
                  icon={<CheckCircle size={16} />}
                  label="Medical Kit"
                  value="Available"
                />
              )}
              
              {safetyAndSecurity.medicalFacility?.ambulanceAvailable && (
                <InfoBox
                  icon={<CheckCircle size={16} />}
                  label="Ambulance"
                  value="Available"
                />
              )}
              
              {/* Transport Safety */}
              {safetyAndSecurity.transportSafety?.gpsTrackerAvailable && (
                <InfoBox
                  icon={<CheckCircle size={16} />}
                  label="GPS Tracking"
                  value="Transport vehicles tracked"
                />
              )}
              
              {safetyAndSecurity.transportSafety?.driversVerified && (
                <InfoBox
                  icon={<CheckCircle size={16} />}
                  label="Driver Verification"
                  value="All drivers verified"
                />
              )}
              
              {/* Fire Safety */}
              {safetyAndSecurity.fireSafetyMeasures && safetyAndSecurity.fireSafetyMeasures.length > 0 && (
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
              )}
              
              {/* Visitor Management */}
              {safetyAndSecurity.visitorManagementSystem && (
                <InfoBox
                  icon={<CheckCircle size={16} />}
                  label="Visitor Management"
                  value="System in place"
                />
              )}
              
              {/* Show message if no specific details */}
              {!safetyAndSecurity.cctvCoveragePercentage && 
               !safetyAndSecurity.medicalFacility?.doctorAvailability && 
               !safetyAndSecurity.medicalFacility?.medkitAvailable && 
               !safetyAndSecurity.medicalFacility?.ambulanceAvailable &&
               !safetyAndSecurity.transportSafety?.gpsTrackerAvailable && 
               !safetyAndSecurity.transportSafety?.driversVerified && 
               (!safetyAndSecurity.fireSafetyMeasures || safetyAndSecurity.fireSafetyMeasures.length === 0) && 
               !safetyAndSecurity.visitorManagementSystem && (
                <div className="col-span-2 text-gray-500 text-center py-4">
                  <p>No specific safety & security details available.</p>
                  <p className="text-sm mt-2">Debug: safetyAndSecurity = {JSON.stringify(safetyAndSecurity)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <p>No safety & security information available.</p>
              <p className="text-sm mt-2">Debug: safetyAndSecurity = {JSON.stringify(safetyAndSecurity)}</p>
            </div>
          )}
        </div>

        {/* Fees & Affordability Section */}
        {feesAndScholarships && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              💰 Fees & Affordability
            </h2>
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

        {/* Technology Adoption Section */}
        {technologyAdoption && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              💻 Technology Adoption
            </h2>
            {technologyAdoption.elearningPlatforms && technologyAdoption.elearningPlatforms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">E-learning Platforms</h3>
                <div className="space-y-2">
                  {technologyAdoption.elearningPlatforms.map((platform, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                      <span className="font-medium text-blue-800">{platform.platform}</span>
                      {platform.usagePercentage && (
                        <span className="ml-2 text-blue-600">({platform.usagePercentage}% usage)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {technologyAdoption.technologyIntegration && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Technology Integration</h3>
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
                  <p className="text-sm mt-2">Debug: faculty = {JSON.stringify(faculty)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <p>No faculty information available.</p>
              <p className="text-sm mt-2">Debug: faculty = {JSON.stringify(faculty)}</p>
            </div>
          )}
        </div>

        {/* Admission Process Timeline Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
            📅 Admission Process Timeline
          </h2>
          {admissionTimeline && admissionTimeline.timelines && admissionTimeline.timelines.length > 0 ? (
            <div className="space-y-4">
              {admissionTimeline.timelines.map((timeline, index) => (
                <div key={timeline._id || index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {timeline.eligibility?.admissionLevel || 'Admission Process'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      timeline.status === 'Ongoing' 
                        ? 'bg-green-100 text-green-800' 
                        : timeline.status === 'Ended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {timeline.status}
                    </span>
                  </div>
                  
                  {timeline.eligibility?.ageCriteria && (
                    <p className="text-gray-600 mb-2">
                      <strong>Age Criteria:</strong> {timeline.eligibility.ageCriteria}
                    </p>
                  )}
                  
                  {timeline.eligibility?.otherInfo && (
                    <p className="text-gray-600 mb-2">
                      <strong>Additional Info:</strong> {timeline.eligibility.otherInfo}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-gray-500">Application Period</p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(timeline.admissionStartDate).toLocaleDateString()} - {new Date(timeline.admissionEndDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {timeline.documentsRequired && timeline.documentsRequired.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Required Documents</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {timeline.documentsRequired.map((doc, docIndex) => (
                            <span key={docIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <p>No admission timeline information available.</p>
              <p className="text-sm mt-2">Debug: admissionTimeline = {JSON.stringify(admissionTimeline)}</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <ReviewSection schoolId={school._id} />
      </div>
    </div>
  );
};

export default SchoolDetailsPage;
