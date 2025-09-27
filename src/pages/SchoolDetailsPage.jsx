// src/pages/SchoolDetailsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSchoolById } from "../api/adminService";
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

  useEffect(() => {
    if (!schoolId) return;

    const fetchSchoolDetails = async () => {
      try {
        setLoading(true);
        const response = await getSchoolById(schoolId);

        
        if (response.data.data) {
          setSchool(response.data.data);
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

    fetchSchoolDetails();
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
            <div className="flex flex-wrap gap-2">
              {school.predefinedAmenities?.map((amenity) => (
                <span
                  key={amenity}
                  className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full flex items-center"
                >
                  <CheckCircle size={14} className="mr-1.5" />
                  {amenity}
                </span>
              ))}
              {school.activities?.map((activity) => (
                <span
                  key={activity}
                  className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full flex items-center"
                >
                  <CheckCircle size={14} className="mr-1.5" />
                  {activity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailsPage;
