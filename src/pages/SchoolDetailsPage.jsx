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
     
      navigate(`/apply/${school._id}`);
    } else if (
      currentUser.userType !== "parent" &&
      currentUser.userType !== "student"
    ) {
      toast.error("Only Parents or Students are allowed to apply.");
    } else {
      
      navigate(`/apply/${school._id}`);
    }
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
