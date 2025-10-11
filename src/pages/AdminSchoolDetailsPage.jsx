import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSchoolsByStatus, updateSchoolStatus } from "../api/adminService";
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

  useEffect(() => {
    if (!schoolId) return;

    const fetchSchoolDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching admin school details for ID:', schoolId);
        
        // Fetch pending schools and find the specific school
        const response = await getSchoolsByStatus('pending');
        const raw = response?.data;
        const schools = Array.isArray(raw?.data)
          ? raw.data
          : (Array.isArray(raw)
              ? raw
              : (Array.isArray(raw?.schools) ? raw.schools : []));
        
        console.log('🔍 All pending schools:', schools);
        
        // Find the specific school by ID
        const foundSchool = schools.find(school => 
          school._id === schoolId || 
          school.schoolId === schoolId || 
          school.id === schoolId ||
          school.userId === schoolId ||
          school.authId === schoolId
        );
        
        console.log('🔍 Found school:', foundSchool);
        
        if (foundSchool) {
          setSchool(foundSchool);
        } else {
          console.warn(`No school found with ID: ${schoolId}`);
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

    fetchSchoolDetails();
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
