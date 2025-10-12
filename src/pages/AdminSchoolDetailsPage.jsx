import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  getSchoolById, 
  updateSchoolStatus,
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
  getInternationalExposureById
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
  const [processing, setProcessing] = useState(false);
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
        console.log('🔍 Fetching admin school details for ID:', schoolId);
        
        // Fetch school directly by ID
        const response = await getSchoolById(schoolId);
        const raw = response?.data;
        const schoolData = raw?.data || raw; // support {data: {...}} or direct {...}
        
        console.log('🔍 School data:', schoolData);
        
        if (schoolData) {
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

  const handleAcceptSchool = async () => {
    if (!schoolId) {
      toast.error('School ID is missing');
      return;
    }
    
    try {
      setProcessing(true);
      await updateSchoolStatus(schoolId, 'accepted');
      toast.success('School accepted successfully!');
      navigate("/admin/dashboard");
    } catch (error) {
      console.error('Failed to accept school:', error);
      toast.error('Failed to accept school');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSchool = async () => {
    if (!schoolId) {
      toast.error('School ID is missing');
      return;
    }
    
    try {
      setProcessing(true);
      await updateSchoolStatus(schoolId, 'rejected');
      toast.success('School rejected successfully!');
      navigate("/admin/dashboard");
    } catch (error) {
      console.error('Failed to reject school:', error);
      toast.error('Failed to reject school');
    } finally {
      setProcessing(false);
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
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 relative">
          <div className="mb-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center text-sm text-gray-700 hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </button>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            {school.name}
          </h1>
          <p className="text-lg text-gray-600 flex items-center mb-4">
            <MapPin size={18} className="mr-2" />
            {school.address || school.location || "Address not provided"}
          </p>
          <p className="text-md text-gray-700">{school.description}</p>
          
          {/* Status Badge */}
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <Clock size={16} className="mr-1" />
              Pending Approval
            </span>
          </div>
        </div>

        {/* Basic Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <InfoBox
            icon={<Building size={20} />}
            label="School Type"
            value={school.schoolType}
          />
          <InfoBox
            icon={<BookOpen size={20} />}
            label="Board"
            value={school.board}
          />
          <InfoBox
            icon={<Users size={20} />}
            label="Curriculum"
            value={school.curriculum}
          />
          <InfoBox
            icon={<Calendar size={20} />}
            label="Established Year"
            value={school.establishedYear}
          />
          <InfoBox
            icon={<User size={20} />}
            label="Principal"
            value={school.principalName}
          />
          <InfoBox
            icon={<Sun size={20} />}
            label="Gender Type"
            value={school.genderType}
          />
        </div>

        {/* Contact Information */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MapPin size={24} className="mr-2" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{school.email || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900">{school.phone || "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-gray-900">{school.address || "N/A"}</p>
            </div>
            {school.website && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Website</label>
                <p className="text-gray-900">
                  <a 
                    href={school.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {school.website}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        {(school.board || school.schoolType || school.curriculum) && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Award size={24} className="mr-2" />
              School Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {school.board && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Board</label>
                  <p className="text-gray-900">{school.board}</p>
                </div>
              )}
              {school.schoolType && (
                <div>
                  <label className="text-sm font-medium text-gray-500">School Type</label>
                  <p className="text-gray-900">{school.schoolType}</p>
                </div>
              )}
              {school.curriculum && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Curriculum</label>
                  <p className="text-gray-900">{school.curriculum}</p>
                </div>
              )}
              {school.genderType && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender Type</label>
                  <p className="text-gray-900">{school.genderType}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {school.description && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
            <p className="text-gray-700 leading-relaxed">{school.description}</p>
          </div>
        )}

        {/* Amenities & Activities Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
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
            </div>
          )}
        </div>

        {/* Infrastructure Section */}
        {infrastructure && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
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

        {/* Fees & Affordability Section */}
        {feesAndScholarships && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
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

        {/* Academics Section */}
        {academics && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
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
          </div>
        )}

        {/* Faculty Quality Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
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
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
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
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <p>No safety & security information available.</p>
            </div>
          )}
        </div>

        {/* Admin Actions */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAcceptSchool}
              disabled={processing}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
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
              disabled={processing}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  Reject School
                </>
              )}
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchoolDetailsPage;

