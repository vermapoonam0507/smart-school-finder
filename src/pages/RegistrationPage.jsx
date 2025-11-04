import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { PlusCircle, Trash2, Info, Building2, Users2, ShieldCheck, HeartHandshake, Heart, Globe2, Sparkles, Image, Award, DollarSign, Cpu, GraduationCap, CalendarDays, Upload, ToggleRight } from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "../api/axios";
import { 
  addSchool, 
  addAmenities, 
  addActivities, 
  addAlumni, 
  addInfrastructure, 
  addOtherDetails, 
  addFeesAndScholarships,
  addFaculty,
  addAdmissionTimeline,
  addTechnologyAdoption,
  addSafetyAndSecurity,
  addInternationalExposure,
  addAcademics,
  getSchoolById,
  getSchoolsByStatus,
  updateSchoolInfo,
  getAmenitiesById,
  getActivitiesById,
  getInfrastructureById,
  getFeesAndScholarshipsById,
  getAcademicsById,
  getOtherDetailsById,
  getSafetyAndSecurityById,
  getTechnologyAdoptionById,
  getInternationalExposureById,
  getFacultyById,
  getAdmissionTimelineById,
  updateAmenities,
  updateActivities,
  updateInfrastructure,
  updateFeesAndScholarshipsById,
  updateOtherDetailsById,
  updateTechnologyAdoption,
  updateSafetyAndSecurity,
  updateInternationalExposure,
  updateFaculty,
  updateAdmissionTimeline,
  updateAcademics
} from "../api/adminService";


const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  options = null,
  checked,
}) => {
  const commonProps = {
    id: name,
    name,
    required,
    onChange,
    className:
      "w-full px-4 py-3 mt-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white",
  };

  const renderInput = () => {
    if (type === "select") {
      return (
        <select {...commonProps} value={value || ""}>
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (type === "textarea") {
      return <textarea {...commonProps} value={value || ""} rows="4" />;
    }
    if (type === "checkboxGroup") {
      return (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {options.map((opt) => (
            <label key={opt} className="flex items-center">
              <input
                type="checkbox"
                name={name}
                value={opt}
                checked={(value || []).includes(opt)}
                onChange={onChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      );
    }
    return <input type={type} {...commonProps} value={value || ""} />;
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div>
        {renderInput()}
      </div>
    </div>
  );
};


const DynamicListField = ({ label, fields, value, onChange, type = "famous" }) => {
  const list = value || [];
  const getDefaultItem = () => {
    if (type === "famous") return { name: "", profession: "" };
    if (type === "top" || type === "other") return { name: "", percentage: "" };
    return { name: "", profession: "" };
  };
  
  const handleAddItem = () => onChange([...list, getDefaultItem()]);
  const handleRemoveItem = (index) =>
    onChange(list.filter((_, i) => i !== index));
  const handleItemChange = (index, fieldName, fieldValue) => {
    const updatedList = list.map((item, i) =>
      i === index ? { ...item, [fieldName]: fieldValue } : item
    );
    onChange(updatedList);
  };

  return (
    <div>
      <label className="text-lg font-semibold text-gray-700">{label}</label>
      {list.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-md my-2 relative"
        >
          <div className="md:col-span-2">
            <FormField
              label="Alumni Name"
              name={`alumni-name-${index}`}
              value={item.name}
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
            />
          </div>
          <div>
            <FormField
              label={type === "famous" ? "Profession" : "Percentage"}
              name={`alumni-${type === "famous" ? "profession" : "percentage"}-${index}`}
              value={type === "famous" ? item.profession : item.percentage}
              onChange={(e) =>
                handleItemChange(index, type === "famous" ? "profession" : "percentage", e.target.value)
              }
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveItem(index)}
            className="absolute top-2 right-2 text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddItem}
        className="mt-2 flex items-center text-sm text-indigo-600"
      >
        <PlusCircle size={16} className="mr-1" /> Add Alumni
      </button>
    </div>
  );
};

const DynamicActivitiesField = ({ label, value, onChange }) => {
  const activities = value || [];
  
  const handleAddActivity = () => onChange([...activities, ""]);
  const handleRemoveActivity = (index) =>
    onChange(activities.filter((_, i) => i !== index));
  const handleActivityChange = (index, activityValue) => {
    const updatedActivities = activities.map((activity, i) =>
      i === index ? activityValue : activity
    );
    onChange(updatedActivities);
  };

  return (
    <div>
      <label className="text-lg font-semibold text-gray-700">{label}</label>
      {activities.map((activity, index) => (
        <div
          key={index}
          className="flex items-center gap-4 bg-gray-50 p-4 rounded-md my-2 relative"
        >
          <div className="flex-1">
            <FormField
              label="Activity Name"
              name={`activity-${index}`}
              value={activity}
              onChange={(e) => handleActivityChange(index, e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveActivity(index)}
            className="text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddActivity}
        className="mt-2 flex items-center text-sm text-indigo-600"
      >
        <PlusCircle size={16} className="mr-1" /> Add Activity
      </button>
    </div>
  );
};

const DynamicAmenitiesField = ({ label, value, onChange }) => {
  const amenities = value || [];
  
  const handleAddAmenity = () => onChange([...amenities, ""]);
  const handleRemoveAmenity = (index) =>
    onChange(amenities.filter((_, i) => i !== index));
  const handleAmenityChange = (index, amenityValue) => {
    const updatedAmenities = amenities.map((amenity, i) =>
      i === index ? amenityValue : amenity
    );
    onChange(updatedAmenities);
  };

  return (
    <div>
      <label className="text-lg font-semibold text-gray-700">{label}</label>
      {amenities.map((amenity, index) => (
        <div
          key={index}
          className="flex items-center gap-4 bg-gray-50 p-4 rounded-md my-2 relative"
        >
          <div className="flex-1">
            <FormField
              label="Amenity Name"
              name={`amenity-${index}`}
              value={amenity}
              onChange={(e) => handleAmenityChange(index, e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveAmenity(index)}
            className="text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddAmenity}
        className="mt-2 flex items-center text-sm text-indigo-600"
      >
        <PlusCircle size={16} className="mr-1" /> Add Amenity
      </button>
    </div>
  );
};

const DynamicElearningField = ({ label, value, onChange }) => {
  const platforms = Array.isArray(value) ? value : [];

  const handleAdd = () => onChange([...
    platforms,
    { platform: '', usagePercentage: '', frequency: '' }
  ]);

  const handleRemove = (index) => onChange(platforms.filter((_, i) => i !== index));

  const handleChange = (index, field, fieldValue) => {
    const next = platforms.map((item, i) => i === index ? { ...item, [field]: fieldValue } : item);
    onChange(next);
  };

  return (
    <div>
      <label className="text-lg font-semibold text-gray-700">{label}</label>
      {platforms.map((item, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-md my-2">
          <FormField
            label="Platform"
            name={`elearn-platform-${index}`}
            value={item.platform}
            onChange={(e) => handleChange(index, 'platform', e.target.value)}
          />
          <FormField
            label="Usage %"
            name={`elearn-usage-${index}`}
            type="number"
            value={item.usagePercentage}
            onChange={(e) => handleChange(index, 'usagePercentage', e.target.value)}
          />
          <FormField
            label="Frequency"
            name={`elearn-frequency-${index}`}
            value={item.frequency}
            onChange={(e) => handleChange(index, 'frequency', e.target.value)}
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="text-red-500 mb-2"
            aria-label={`Remove e-learning row ${index + 1}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 flex items-center text-sm text-indigo-600"
      >
        <PlusCircle size={16} className="mr-1" /> Add Platform
      </button>
    </div>
  );
};

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { user: currentUser, updateUserContext } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState("");
  const [hasExistingSchool, setHasExistingSchool] = useState(false);
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(true);

  // State with all the fields required by the backend schema
  const [formData, setFormData] = useState({
    // Core School Fields (matching backend School model)
    name: "",
    description: "",
    address: "",
    area: "", // Added: matches backend field
    city: "",
    state: "",
    pincode: "",
    board: "",
    feeRange: "",
    upto: "",
    email: currentUser?.email || "",
    website: "",
    phoneNo: "",
    genderType: "co-ed",
    schoolMode: "convent", // Updated: matches backend enum ['convent', 'private', 'government']
    shifts: ["morning"], // Updated: array to match backend
    languageMedium: ["English"], // Updated: array to match backend
    transportAvailable: "no",
    latitude: "",
    longitude: "",
    TeacherToStudentRatio: "", // Updated: matches backend field name
    rank: "", // Added: matches backend field
    specialist: [], // Added: matches backend field
    tags: [], // Added: matches backend field
    
    // Amenities Fields (matching backend Amenities model)
    predefinedAmenities: [], // Matches backend enum
    customAmenities: [], // Added: matches backend field
    
    // Activities Fields (matching backend Activities model)
    activities: [], // Matches backend enum
    customActivities: [], // Added: matches backend field
    
    // Infrastructure Fields (matching backend Infrastructure model)
    labs: [], // Updated: matches backend enum ['Physics', 'Chemistry', 'Biology', 'Computer', 'Robotics', 'Language']
    sportsGrounds: [], // Updated: matches backend enum ['Football', 'Cricket', 'Basketball', 'Tennis', 'Athletics', 'Badminton']
    libraryBooks: "", // Updated: matches backend field
    smartClassrooms: "", // Updated: matches backend field
    // Infrastructure form field names (used in the UI)
    infraLabTypes: [], // Form field for labs
    infraSportsTypes: [], // Form field for sports grounds
    infraLibraryBooks: "", // Form field for library books
    infraSmartClassrooms: "", // Form field for smart classrooms
    
    // Safety & Security Fields (matching backend SafetyAndSecurity model)
    cctvCoveragePercentage: 0, // default numeric to avoid uncontrolled->controlled warnings
    medicalFacility: {
      doctorAvailability: "", // Matches backend enum ['Full-time', 'Part-time', 'On-call', 'Not Available']
      medkitAvailable: false, // Matches backend field
      ambulanceAvailable: false // Matches backend field
    },
    transportSafety: {
      gpsTrackerAvailable: false, // Matches backend field
      driversVerified: false // Matches backend field
    },
    fireSafetyMeasures: [], // Updated: matches backend enum ['Extinguishers', 'Alarms', 'Sprinklers', 'Evacuation Drills']
    visitorManagementSystem: false, // Added: matches backend field
    
    // Fees & Scholarships Fields (matching backend FeesAndScholarships model)
    feesTransparency: "", // Updated: matches backend field
    classFees: [], // Updated: matches backend ClassFeeSchema structure
    scholarships: [], // Updated: matches backend ScholarshipSchema structure
    
    // Technology Adoption Fields (matching backend TechnologyAdoption model)
    smartClassroomsPercentage: "", // Matches backend field
    eLearningPlatforms: [], // Updated: matches backend field
    
    // International Exposure Fields (matching backend InternationalExposure model)
    exchangePrograms: [], // Updated: matches backend ExchangeProgramSchema structure
    globalTieUps: [], // Updated: matches backend GlobalTieUpSchema structure
    
    // Other Details Fields (matching backend OtherDetails model)
    genderRatio: {
      male: "", // Matches backend field
      female: "", // Matches backend field
      others: "" // Matches backend field
    },
    scholarshipDiversity: {
      types: [], // Matches backend enum ['Merit', 'Socio-economic', 'Cultural', 'Sports', 'Community', 'Academic Excellence']
      studentsCoveredPercentage: "" // Matches backend field
    },
    specialNeedsSupport: {
      dedicatedStaff: false, // Matches backend field
      studentsSupportedPercentage: "", // Matches backend field
      facilitiesAvailable: [] // Matches backend enum ['Ramps', 'Wheelchair access', 'Special educators', 'Learning support', 'Resource room', 'Assistive devices']
    },
    
    // Academics Fields (matching backend Academics model)
    averageClass10Result: "",
    averageClass12Result: "",
    averageSchoolMarks: "",
    specialExamsTraining: [], // Matches backend enum ['NEET', 'IIT-JEE', 'Olympiads', 'UPSC', 'CLAT', 'SAT/ACT', 'NTSE', 'KVPY']
    extraCurricularActivities: [] // Matches backend field
  });

  const [famousAlumnies, setFamousAlumnies] = useState([]);
  const [topAlumnies, setTopAlumnies] = useState([]);
  const [otherAlumnies, setOtherAlumnies] = useState([]);
  const [customActivities, setCustomActivities] = useState([]);
  const [customAmenities, setCustomAmenities] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  // UI-only additions: logo + social links (not sent to backend)
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });
  const [facultyQuality, setFacultyQuality] = useState([
    { name: '', qualification: '', awards: '', experience: '' }
  ]);
  // Removed academicResults and examQualifiers as they're not in backend schema
  const [admissionSteps, setAdmissionSteps] = useState([]); // { title, type, deadline, amount, file, toggle }

  // Faculty Quality array: each entry will contain { name, qualification, awards, experience }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling: keep ratio and numeric in sync
    if (name === 'TeacherToStudentRatio') {
      const raw = value.trim();
      let students = '';
      const parts = raw.split(':').map(p => p.trim());
      if (parts.length === 2) {
        const teacher = Number(parts[0]);
        const stud = Number(parts[1]);
        if (!Number.isNaN(teacher) && teacher > 0 && !Number.isNaN(stud) && stud > 0) {
          students = String(stud);
        }
      } else if (/^\d+$/.test(raw)) {
        // allow entering just the student count
        students = raw;
      }
      setFormData((prev) => ({ ...prev, TeacherToStudentRatio: value, studentsPerTeacher: students }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: String(latitude.toFixed(6)),
          longitude: String(longitude.toFixed(6)),
        }));
        toast.success("Location captured from GPS.");
      },
      (err) => {
        const code = err?.code;
        if (code === 1) {
          toast.error("Permission denied for location. Please allow access.");
        } else if (code === 2) {
          toast.error("Position unavailable. Try again.");
        } else if (code === 3) {
          toast.error("Location request timed out. Try again.");
        } else {
          toast.error("Could not get current location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    const currentValues = formData[name] || [];
    if (checked) {
      setFormData((prev) => ({ ...prev, [name]: [...currentValues, value] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: currentValues.filter((val) => val !== value),
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    setSelectedPhotos(files);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 20 * 1024 * 1024) {
      toast.error("Video must be less than 20MB");
      return;
    }
    setSelectedVideo(file);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/\.(png|jpg|jpeg)$/i.test(file.name)) {
      toast.error("Upload PNG, JPG or JPEG only");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max size 5MB");
      return;
    }
    setLogoFile(file);
    try {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    } catch {}
  };

  // Safety transport routes helpers
  const addTransportRoute = () => {
    const routes = Array.isArray(formData.safetyTransportRoutes) ? formData.safetyTransportRoutes.slice() : [];
    routes.push({ route: "", attendant: false });
    setFormData(prev => ({ ...prev, safetyTransportRoutes: routes }));
  };
  const removeTransportRoute = (index) => {
    const routes = Array.isArray(formData.safetyTransportRoutes) ? formData.safetyTransportRoutes.slice() : [];
    const next = routes.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, safetyTransportRoutes: next }));
  };
  const updateTransportRoute = (index, field, value) => {
    const routes = Array.isArray(formData.safetyTransportRoutes) ? formData.safetyTransportRoutes.slice() : [];
    routes[index] = { ...routes[index], [field]: value };
    setFormData(prev => ({ ...prev, safetyTransportRoutes: routes }));
  };

  const computeSafetyRating = () => {
    const cctv = Number(formData.safetyCCTV || 0); // 0-100
    const doctor = (formData.safetyDoctorAvailability || "").trim();
    const nurse = !!formData.safetyNurseAvailable;
    const gps = !!formData.safetyGPSTracking;
    const driver = !!formData.safetyDriverVerification;
    const routes = Array.isArray(formData.safetyTransportRoutes) ? formData.safetyTransportRoutes : [];
    const routeCount = routes.length;
    const attendantCount = routes.filter(r => r && r.attendant).length;
    const attendantPct = routeCount > 0 ? (attendantCount / routeCount) * 100 : (formData.safetyTransportAttendant ? 100 : 0);

    let score = 0;
    score += (cctv / 100) * 40; // CCTV up to 40
    score += doctor === 'Full-time' ? 15 : doctor === 'Part-time' ? 10 : doctor === 'On-call' ? 5 : 0; // up to 15
    score += nurse ? 10 : 0; // nurse adds 10
    score += gps ? 15 : 0; // GPS adds 15
    score += driver ? 10 : 0; // driver verification adds 10
    score += (attendantPct / 100) * 10; // attendants up to 10
    return Math.round(Math.min(100, score));
  };

  // Helper function to handle update/add with fallback
  const updateOrAdd = async (updateFn, addFn, schoolId, payload) => {
    try {
      if (isEditMode) {
        // Remove schoolId from payload for update (it's only needed in URL)
        const { schoolId: _, ...updatePayload } = payload;
        await updateFn(schoolId, updatePayload);
      } else {
        await addFn(payload);
      }
    } catch (error) {
      // If update fails with 404, the resource doesn't exist yet, so add it instead
      if (error.response?.status === 404 && isEditMode) {
        console.log('⚠️ Resource not found, creating new one instead of updating');
        await addFn(payload);
      } else {
        throw error; // Re-throw other errors
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) return toast.error("You must be logged in.");
    setIsSubmitting(true);

    try {
      // Normalize to backend schema
      const allowedSchoolModes = ['convent', 'private', 'government'];
      const normalizedSchoolMode = allowedSchoolModes.includes((formData.schoolMode || '').toLowerCase())
        ? (formData.schoolMode || '').toLowerCase()
        : 'private';

      const rawGender = (formData.genderType || '').toLowerCase();
      const normalizedGender = rawGender === 'boys' ? 'boy' : rawGender === 'girls' ? 'girl' : rawGender || 'co-ed';

      let normalizedFeeRange = formData.feeRange || '';
      if (/^\d+\s?-\s?\d+$/.test(normalizedFeeRange)) {
        const [a, b] = normalizedFeeRange.split('-').map(s => s.trim());
        normalizedFeeRange = `${a} - ${b}`;
      }

      // Client-side validation to prevent backend 500s
      const requiredErrors = [];
      const allowedShifts = ['morning','afternoon','night school'];
      const allowedBoards = [
        'CBSE','ICSE','CISCE','NIOS','SSC','IGCSE','IB','KVS','JNV','DBSE','MSBSHSE','UPMSP','KSEEB','WBBSE','GSEB','RBSE','BSEB','PSEB','BSE','SEBA','MPBSE','STATE','OTHER'
      ];
      const allowedFeeRanges = [
        "1000 - 10000","10000 - 25000","25000 - 50000","50000 - 75000","75000 - 100000","1 Lakh - 2 Lakh","2 Lakh - 3 Lakh","3 Lakh - 4 Lakh","4 Lakh - 5 Lakh","More than 5 Lakh"
      ];

      if (!formData.name?.trim()) requiredErrors.push('School Name');
      if (!formData.description?.trim()) requiredErrors.push('Description');
      if (!formData.state?.trim()) requiredErrors.push('State');
      if (!formData.city?.trim()) requiredErrors.push('City');
      if (!allowedBoards.includes(formData.board)) requiredErrors.push('Board');
      if (!allowedSchoolModes.includes(normalizedSchoolMode)) requiredErrors.push('School Mode');
      if (!['boy','girl','co-ed'].includes(normalizedGender)) requiredErrors.push('Gender Type');
      if (!Array.isArray(formData.shifts) || formData.shifts.length === 0 || formData.shifts.some(s => !allowedShifts.includes(String(s).toLowerCase()))) {
        requiredErrors.push('Shifts');
      }
      if (!allowedFeeRanges.includes(normalizedFeeRange)) requiredErrors.push('Fee Range');
      if (!formData.upto?.trim()) requiredErrors.push('Classes Upto');
      if (!formData.email?.trim()) requiredErrors.push('Email');
      if (!formData.phoneNo?.trim()) requiredErrors.push('Phone Number');
      if (!Array.isArray(formData.languageMedium) || formData.languageMedium.length === 0) requiredErrors.push('Language Medium');
      
      // GPS Location validation (mandatory for distance calculation)
      if (!formData.latitude || isNaN(Number(formData.latitude))) requiredErrors.push('Latitude (GPS)');
      if (!formData.longitude || isNaN(Number(formData.longitude))) requiredErrors.push('Longitude (GPS)');
      
      // Validate latitude and longitude ranges
      if (formData.latitude && (Number(formData.latitude) < -90 || Number(formData.latitude) > 90)) {
        toast.error('Latitude must be between -90 and 90 degrees');
        setIsSubmitting(false);
        return;
      }
      if (formData.longitude && (Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
        toast.error('Longitude must be between -180 and 180 degrees');
        setIsSubmitting(false);
        return;
      }

      if (requiredErrors.length > 0) {
        toast.error(`Please fill valid values for: ${requiredErrors.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      const payload = {
        // Core School Fields (matching backend School model)
        name: formData.name,
        description: formData.description,
        address: formData.address,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pincode ? Number(formData.pincode) : undefined,
        board: formData.board,
        feeRange: normalizedFeeRange,
        upto: formData.upto,
        email: formData.email,
        website: formData.website,
        mobileNo: formData.phoneNo,
        schoolMode: normalizedSchoolMode,
        genderType: normalizedGender,
        shifts: (Array.isArray(formData.shifts) ? formData.shifts : [formData.shifts].filter(Boolean)).map(s => String(s).toLowerCase()),
        languageMedium: Array.isArray(formData.languageMedium) ? formData.languageMedium : [formData.languageMedium].filter(Boolean),
        // Backend expects enum string for transportAvailable ('yes' | 'no')
        transportAvailable: (String(formData.transportAvailable).toLowerCase() === 'yes' || formData.transportAvailable === true) ? 'yes' : 'no',
        latitude: Number(formData.latitude), // Mandatory for distance calculation
        longitude: Number(formData.longitude), // Mandatory for distance calculation
        // Match backend field casing
        teacherToStudentRatio: formData.TeacherToStudentRatio,
        rank: formData.rank,
        specialist: Array.isArray(formData.specialist) ? formData.specialist : [],
        tags: Array.isArray(formData.tags) ? formData.tags : []
      };

      // Only include authId for new registrations, not for updates
      if (!isEditMode) {
        payload.authId = currentUser._id;
      }

      // Create or update school and resolve schoolId
      let schoolId = editingSchoolId;
      if (isEditMode && editingSchoolId) {
        try {
          await updateSchoolInfo(editingSchoolId, payload);
        } catch (err) {
          console.warn('⚠️ Core school update failed, proceeding with subresource saves:', err?.response?.data || err?.message || err);
        }
      } else {
        const schoolResponse = await addSchool(payload);
        schoolId = schoolResponse.data.data._id;
        try { localStorage.setItem('lastCreatedSchoolId', String(schoolId)); } catch (_) {}
      }

      // Create related data in parallel
      const promises = [];

      // Add/Update amenities
      if (formData.predefinedAmenities?.length > 0 || customAmenities?.length > 0) {
        const payloadAmenities = {
          schoolId,
          predefinedAmenities: formData.predefinedAmenities || [],
          customAmenities: customAmenities || []
        };
        promises.push(updateOrAdd(updateAmenities, addAmenities, schoolId, payloadAmenities));
      }

      // Add/Update activities
      if (formData.activities?.length > 0 || customActivities?.length > 0) {
        const payloadActivities = {
          schoolId,
          activities: formData.activities || [],
          customActivities: customActivities || []
        };
        promises.push(updateOrAdd(updateActivities, addActivities, schoolId, payloadActivities));
      }

      // Add alumni if any
      if (famousAlumnies.length > 0 || topAlumnies.length > 0 || otherAlumnies.length > 0) {
        promises.push(addAlumni({
          schoolId,
          famousAlumnies,
          topAlumnies,
          otherAlumnies
        }));
      }

      // Add/Update infrastructure
      if (formData.infraLabTypes?.length > 0 || formData.infraSportsTypes?.length > 0 || formData.infraLibraryBooks || formData.infraSmartClassrooms) {
        const payloadInfra = {
          schoolId,
          labs: formData.infraLabTypes || [],
          sportsGrounds: formData.infraSportsTypes || [],
          libraryBooks: formData.infraLibraryBooks ? Number(formData.infraLibraryBooks) : undefined,
          smartClassrooms: formData.infraSmartClassrooms ? Number(formData.infraSmartClassrooms) : undefined
        };
        if (isEditMode) {
          // Try update; if not found or not created yet, fall back to create
          promises.push(
            updateInfrastructure(schoolId, payloadInfra).catch(() => addInfrastructure(payloadInfra))
          );
        } else {
          promises.push(addInfrastructure(payloadInfra));
        }
      }

      // Add fees and scholarships if any (matching backend FeesAndScholarships model)
      if (formData.classFees?.length > 0 || formData.scholarships?.length > 0 || (formData.feesTransparency !== '' && formData.feesTransparency != null)) {
        // Validate and clean classFees
        const validClassFees = (formData.classFees || []).filter(fee => 
          fee.className && fee.tuition !== undefined && fee.tuition >= 0
        ).map(fee => ({
          className: fee.className,
          tuition: Number(fee.tuition) || 0,
          activity: Number(fee.activity) || 0,
          transport: Number(fee.transport) || 0,
          hostel: Number(fee.hostel) || 0,
          misc: Number(fee.misc) || 0
        }));

        // Validate and clean scholarships
        const validScholarships = (formData.scholarships || []).filter(sch => 
          sch.name && sch.amount !== undefined && sch.amount >= 0 && sch.type
        ).map(sch => {
          const scholarship = {
            name: sch.name,
            amount: Number(sch.amount) || 0,
            type: sch.type
          };
          // Only include documentsRequired if it has valid values (non-empty strings)
          const docs = Array.isArray(sch.documentsRequired) 
            ? sch.documentsRequired.filter(d => d && d.trim()) 
            : [];
          if (docs.length > 0) {
            scholarship.documentsRequired = docs;
          }
          return scholarship;
        });

        if (validClassFees.length > 0 || validScholarships.length > 0 || (formData.feesTransparency !== '' && formData.feesTransparency != null)) {
          // Map transparency string values to numbers (if backend expects numbers)
          let transparencyValue;
          if (formData.feesTransparency === 'full') transparencyValue = 100;
          else if (formData.feesTransparency === 'partial') transparencyValue = 50;
          else if (formData.feesTransparency === 'low') transparencyValue = 0;
          else if (formData.feesTransparency !== '' && formData.feesTransparency != null) {
            // If it's already a number, use it
            transparencyValue = Number(formData.feesTransparency);
          }
          
          const payloadFees = {
            schoolId,
            feesTransparency: transparencyValue,
            classFees: validClassFees,
            scholarships: validScholarships
          };
          console.log('💰 Sending Fees & Scholarships:', payloadFees);
          promises.push(updateOrAdd(updateFeesAndScholarshipsById, addFeesAndScholarships, schoolId, payloadFees));
        }
      }

      // Add/Update Faculty Quality
      if (facultyQuality && facultyQuality.length > 0) {
        const cleanFaculty = facultyQuality
          .filter(f => f.name || f.qualification || f.awards || f.experience !== undefined)
          .map(f => ({
            name: f.name,
            qualification: f.qualification,
            awards: f.awards ? f.awards.split(',').map(a => a.trim()).filter(Boolean) : [],
            experience: f.experience ? Number(f.experience) : undefined
          }))
          .filter(f => f.name && f.qualification && f.experience !== undefined);
        
        if (cleanFaculty.length > 0) {
          const payloadFaculty = { schoolId, facultyMembers: cleanFaculty };
          promises.push(updateOrAdd(updateFaculty, addFaculty, schoolId, payloadFaculty));
        }
      }

      // Add Admission Timeline if any (matching backend AdmissionTimeline model)
      if (admissionSteps && admissionSteps.length > 0) {
        const cleanTimelines = admissionSteps
          .filter(timeline => timeline.admissionStartDate && timeline.admissionEndDate && timeline.status && timeline.admissionLevel)
          .map(timeline => ({
            admissionStartDate: new Date(timeline.admissionStartDate),
            admissionEndDate: new Date(timeline.admissionEndDate),
            status: timeline.status,
            documentsRequired: (timeline.documentsRequired || []).filter(doc => doc.trim()),
              eligibility: {
              admissionLevel: timeline.admissionLevel,
              ageCriteria: timeline.ageCriteria || '',
              otherInfo: timeline.otherInfo || ''
            }
          }));
        
        if (cleanTimelines.length > 0) {
          const payloadTimeline = { schoolId, timelines: cleanTimelines };
          promises.push(updateOrAdd(updateAdmissionTimeline, addAdmissionTimeline, schoolId, payloadTimeline));
        }
      }

      // Add/Update Technology Adoption
      if ((formData.smartClassroomsPercentage !== '' && formData.smartClassroomsPercentage != null) || (formData.eLearningPlatforms?.length > 0)) {
        const payloadTech = {
          schoolId,
          smartClassroomsPercentage: (formData.smartClassroomsPercentage === '' || formData.smartClassroomsPercentage == null) ? undefined : Number(formData.smartClassroomsPercentage),
          eLearningPlatforms: formData.eLearningPlatforms || []
        };
        promises.push(updateOrAdd(updateTechnologyAdoption, addTechnologyAdoption, schoolId, payloadTech));
      }

      // Add/Update Safety & Security
      if ((formData.cctvCoveragePercentage !== '' && formData.cctvCoveragePercentage != null) || formData.medicalFacility?.doctorAvailability || 
          formData.medicalFacility?.medkitAvailable || formData.medicalFacility?.ambulanceAvailable ||
          formData.transportSafety?.gpsTrackerAvailable || formData.transportSafety?.driversVerified ||
          formData.fireSafetyMeasures?.length > 0 || formData.visitorManagementSystem) {
        const payloadSafety = {
          schoolId,
          cctvCoveragePercentage: (formData.cctvCoveragePercentage === '' || formData.cctvCoveragePercentage == null) ? undefined : Number(formData.cctvCoveragePercentage),
          medicalFacility: {
            doctorAvailability: formData.medicalFacility?.doctorAvailability || undefined,
            medkitAvailable: formData.medicalFacility?.medkitAvailable || false,
            ambulanceAvailable: formData.medicalFacility?.ambulanceAvailable || false
          },
          transportSafety: {
            gpsTrackerAvailable: formData.transportSafety?.gpsTrackerAvailable || false,
            driversVerified: formData.transportSafety?.driversVerified || false
          },
          fireSafetyMeasures: formData.fireSafetyMeasures || [],
          visitorManagementSystem: formData.visitorManagementSystem || false
        };
        promises.push(updateOrAdd(updateSafetyAndSecurity, addSafetyAndSecurity, schoolId, payloadSafety));
      }

      // Add International Exposure if any (matching backend InternationalExposure model)
      console.log('Checking international exposure data:', {
        exchangePrograms: formData.exchangePrograms,
        globalTieUps: formData.globalTieUps
      });
      
      // Validate and clean exchange programs
      const validProgramTypes = ['Student Exchange', 'Faculty Exchange', 'Summer Program', 'Joint Research', 'Cultural Exchange'];
      const validDurations = ['2 Weeks', '1 Month', '3 Months', '6 Months', '1 Year'];
      
      const validExchangePrograms = (formData.exchangePrograms || []).filter(program => 
        program.partnerSchool && program.partnerSchool.trim()
      ).map(program => {
        // Validate and set programType
        let programType = 'Student Exchange'; // Default
        if (program.type && validProgramTypes.includes(program.type)) {
          programType = program.type;
        } else if (program.programType && validProgramTypes.includes(program.programType)) {
          programType = program.programType;
        }
        
        // Validate and set duration
        let duration = '1 Month'; // Default
        if (program.duration && validDurations.includes(program.duration)) {
          duration = program.duration;
        }
        
        return {
          partnerSchool: program.partnerSchool.trim(),
          programType: programType,
          duration: duration,
          studentsParticipated: program.studentsParticipated ? Number(program.studentsParticipated) : 0,
          activeSince: program.activeSince ? Number(program.activeSince) : new Date().getFullYear()
        };
      });

      // Validate and clean global tie-ups
      const validTieUpTypes = ['Memorandum of Understanding (MoU)', 'Research Collaboration', 'Curriculum Development', 'Faculty Training'];
      
      const validGlobalTieUps = (formData.globalTieUps || []).filter(tieup => 
        tieup.partnerName && tieup.partnerName.trim()
      ).map(tieup => {
        // Validate and set natureOfTieUp
        let natureOfTieUp = 'Memorandum of Understanding (MoU)'; // Default
        if (tieup.nature && validTieUpTypes.includes(tieup.nature)) {
          natureOfTieUp = tieup.nature;
        } else if (tieup.natureOfTieUp && validTieUpTypes.includes(tieup.natureOfTieUp)) {
          natureOfTieUp = tieup.natureOfTieUp;
        }
        
        return {
          partnerName: tieup.partnerName.trim(),
          natureOfTieUp: natureOfTieUp,
          activeSince: tieup.activeSince ? Number(tieup.activeSince) : new Date().getFullYear(),
          description: tieup.description || ''
        };
      });

      // Only proceed if we have valid data
      if (validExchangePrograms.length > 0 || validGlobalTieUps.length > 0) {
        console.log('Sending international exposure data:', {
          schoolId,
          exchangePrograms: validExchangePrograms,
          globalTieUps: validGlobalTieUps
        });
        
        const payloadIntl = { schoolId, exchangePrograms: validExchangePrograms, globalTieUps: validGlobalTieUps };
        promises.push(updateOrAdd(updateInternationalExposure, addInternationalExposure, schoolId, payloadIntl));
      } else {
        console.log('No valid international exposure data to send');
      }

      // Add/Update Academics (simplified - only summary fields)
      if ((formData.averageClass10Result !== '' && formData.averageClass10Result != null) || (formData.averageClass12Result !== '' && formData.averageClass12Result != null) || (formData.averageSchoolMarks !== '' && formData.averageSchoolMarks != null) || 
          formData.specialExamsTraining?.length > 0 || formData.extraCurricularActivities?.length > 0) {
        const payloadAcademics = {
          schoolId,
          averageClass10Result: (formData.averageClass10Result === '' || formData.averageClass10Result == null) ? undefined : Number(formData.averageClass10Result),
          averageClass12Result: (formData.averageClass12Result === '' || formData.averageClass12Result == null) ? undefined : Number(formData.averageClass12Result),
          averageSchoolMarks: (formData.averageSchoolMarks === '' || formData.averageSchoolMarks == null) ? 75 : Number(formData.averageSchoolMarks), // Required field, default to 75
          specialExamsTraining: formData.specialExamsTraining || [],
          extraCurricularActivities: formData.extraCurricularActivities || []
        };
        console.log('📚 Sending Academics payload:', payloadAcademics);
        promises.push(updateOrAdd(updateAcademics, addAcademics, schoolId, payloadAcademics));
      }

      // Add/Update other details (matching backend OtherDetails model)
      if ((formData.genderRatioMale !== '' && formData.genderRatioMale != null) || (formData.genderRatioFemale !== '' && formData.genderRatioFemale != null) || (formData.genderRatioOthers !== '' && formData.genderRatioOthers != null) ||
          formData.scholarshipDiversityTypes?.length > 0 || (formData.scholarshipDiversityCoverage !== '' && formData.scholarshipDiversityCoverage != null) ||
          formData.specialNeedsStaff || (formData.specialNeedsSupportPercentage !== '' && formData.specialNeedsSupportPercentage != null) ||
          formData.specialNeedsFacilities?.length > 0) {
        
        // Ensure non-negative values for gender ratios
        const maleRatio = formData.genderRatioMale ? Math.max(0, Number(formData.genderRatioMale)) : 0;
        const femaleRatio = formData.genderRatioFemale ? Math.max(0, Number(formData.genderRatioFemale)) : 0;
        const othersRatio = formData.genderRatioOthers ? Math.max(0, Number(formData.genderRatioOthers)) : 0;
        
        const payloadOther = {
          schoolId,
          genderRatio: {
            male: maleRatio,
            female: femaleRatio,
            others: othersRatio
          },
          scholarshipDiversity: {
            types: formData.scholarshipDiversityTypes || [],
            studentsCoveredPercentage: (formData.scholarshipDiversityCoverage === '' || formData.scholarshipDiversityCoverage == null) ? undefined : Number(formData.scholarshipDiversityCoverage)
          },
          specialNeedsSupport: {
            dedicatedStaff: formData.specialNeedsStaff || false,
            studentsSupportedPercentage: (formData.specialNeedsSupportPercentage === '' || formData.specialNeedsSupportPercentage == null) ? undefined : Number(formData.specialNeedsSupportPercentage),
            facilitiesAvailable: formData.specialNeedsFacilities || []
          }
        };
        promises.push(updateOrAdd(updateOtherDetailsById, addOtherDetails, schoolId, payloadOther));
      }

      // Wait for all related data to be created
      await Promise.all(promises);

      // Upload photos if selected
      if (selectedPhotos.length > 0) {
        const photoFormData = new FormData();
        selectedPhotos.forEach(photo => photoFormData.append('files', photo));
        await apiClient.post(`/admin/${schoolId}/upload/photos`, photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Upload video if selected
      if (selectedVideo) {
        const videoFormData = new FormData();
        videoFormData.append('file', selectedVideo);
        await apiClient.post(`/admin/${schoolId}/upload/video`, videoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success(
        isEditMode 
          ? "School profile updated successfully!"
          : "School Registration Successful! Your profile is pending approval."
      );

      // Update user context to reflect school user type
      if (currentUser && currentUser._id) {
        updateUserContext({ userType: 'school', schoolId: schoolId });
      }

      // Update state to reflect that school now exists
      if (!isEditMode) {
        console.log('🎉 School registration successful! Switching to edit mode:', {
          schoolId,
          previousState: { hasExistingSchool, isEditMode },
          newState: { hasExistingSchool: true, isEditMode: true }
        });
        setHasExistingSchool(true);
        setIsEditMode(true);
        setEditingSchoolId(schoolId);
        // Clear any draft data since we now have a real school profile
        try {
          localStorage.removeItem("schoolRegDraft");
        } catch (error) {
          console.error("Could not clear draft:", error);
        }
      }

      // Stay on the same page instead of navigating away
      // This allows the user to continue editing their profile
      // navigate("/school-portal/profile-view");
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || (isEditMode ? "Update failed." : "Registration failed.");
      toast.error(errorMessage);
      
      // Show detailed error in console for debugging
      if (error.response?.data) {
        console.error('Backend validation errors:', error.response.data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const amenitiesOptions = [
    "Library",
    "Playground",
    "Science Lab",
    "Computer Lab",
    "Cafeteria",
    "Auditorium",
  ];
  const activitiesOptions = [
    "Focusing on Academics",
    "Focuses on Practical Learning",
    "Focuses on Theoretical Learning",
    "Empowering in Sports",
    "Empowering in Arts",
    "Special Focus on Mathematics",
    "Special Focus on Science",
    "Special Focus on Physical Education",
    "Leadership Development",
    "STEM Activities",
    "Cultural Education",
    "Technology Integration",
    "Environmental Awareness"
  ];
  const feeRangeOptions = [
    "1000 - 10000",
    "10000 - 25000",
    "25000 - 50000",
    "50000 - 75000",
    "75000 - 100000",
    "1 Lakh - 2 Lakh",
    "2 Lakh - 3 Lakh",
    "3 Lakh - 4 Lakh",
    "4 Lakh - 5 Lakh",
    "More than 5 Lakh",
  ];

  // UI-only: section navigation (does not change fields or backend)
  const sections = [
    { id: "basic", label: "Basic", Icon: Info },
    { id: "amenities", label: "Amenities", Icon: Sparkles },
    { id: "alumni", label: "Alumni", Icon: Award },
    { id: "faculty", label: "Faculty", Icon: Users2 },
    { id: "infrastructure", label: "Infrastructure", Icon: Building2 },
    { id: "safety", label: "Safety", Icon: ShieldCheck },
    { id: "fees", label: "Fees", Icon: DollarSign },
    { id: "technology", label: "Technology", Icon: Cpu },
    { id: "academics", label: "Academics", Icon: GraduationCap },
    { id: "international", label: "International", Icon: Globe2 },
    { id: "diversity", label: "Diversity", Icon: HeartHandshake },
    { id: "admission", label: "Admission", Icon: CalendarDays },
    { id: "media", label: "Media", Icon: Image },
  ];

  const [activeSection, setActiveSection] = useState("basic");
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const sectionIndex = (id) => sections.findIndex((s) => s.id === id);
  const progressPercent = Math.round(((sectionIndex(activeSection) + 1) / sections.length) * 100);
  const isFirst = sectionIndex(activeSection) === 0;
  const isLast = sectionIndex(activeSection) === sections.length - 1;

  const saveDraft = () => {
    const draft = {
      formData,
      famousAlumnies,
      topAlumnies,
      otherAlumnies,
      customActivities,
      customAmenities,
      facultyQuality,
      academicResults,
      examQualifiers,
      activeSection,
    };
    try {
      localStorage.setItem("schoolRegDraft", JSON.stringify(draft));
      toast.success("Draft saved");
    } catch {
      toast.error("Could not save draft");
    }
  };

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem("schoolRegDraft");
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        
        // Restore form data
        if (draft.formData) {
          setFormData(draft.formData);
        }
        
        // Restore alumni data
        if (draft.famousAlumnies) {
          setFamousAlumnies(draft.famousAlumnies);
        }
        if (draft.topAlumnies) {
          setTopAlumnies(draft.topAlumnies);
        }
        if (draft.otherAlumnies) {
          setOtherAlumnies(draft.otherAlumnies);
        }
        
        // Restore activities and amenities
        if (draft.customActivities) {
          setCustomActivities(draft.customActivities);
        }
        if (draft.customAmenities) {
          setCustomAmenities(draft.customAmenities);
        }
        
        // Restore faculty and academic data
        if (draft.facultyQuality) {
          setFacultyQuality(draft.facultyQuality);
        }
        // academicResults and examQualifiers removed - not in backend schema
        
        // Restore active section
        if (draft.activeSection) {
          setActiveSection(draft.activeSection);
        }
        
        // Only show toast if we actually have meaningful draft data
        if (draft.formData?.name || draft.formData?.email || draft.formData?.description) {
          toast.success("Draft loaded successfully!");
        }
        return true;
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      toast.error("Could not load draft");
    }
    return false;
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem("schoolRegDraft");
      toast.success("Draft cleared");
    } catch (error) {
      toast.error("Could not clear draft");
    }
  };

  // Check for existing school data on mount
  useEffect(() => {
    checkForExistingSchool();
  }, []);

  // Debug: Log state changes (remove this in production)
  useEffect(() => {
    console.log('🔍 State update:', {
      hasExistingSchool,
      isLoadingExistingData,
      isEditMode,
      hasCurrentUser: !!currentUser?._id
    });
  }, [hasExistingSchool, isLoadingExistingData, isEditMode, currentUser?._id]);

  // Auto-fill user details when currentUser becomes available
  useEffect(() => {
    if (currentUser && !hasExistingSchool && !isLoadingExistingData) {
      console.log('🔍 Auto-filling user details:', {
        email: currentUser.email,
        availableFields: Object.keys(currentUser)
      });
      
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || prev.email
      }));
    }
  }, [currentUser, hasExistingSchool, isLoadingExistingData]);

  // Check for existing school data automatically
  const checkForExistingSchool = async () => {
    if (!currentUser?._id) {
      console.log('❌ No current user, treating as new school');
      setHasExistingSchool(false);
      setIsEditMode(false);
      setIsLoadingExistingData(false);
      // Load draft for new users
      loadDraft();
      return;
    }
    
    try {
      setIsLoadingExistingData(true);
      let school;
      
      // Method 1: Try localStorage (works if same session)
      const cachedSchoolId = typeof localStorage !== 'undefined' && localStorage.getItem('lastCreatedSchoolId');
      if (cachedSchoolId) {
        try {
          const res = await getSchoolById(cachedSchoolId, { headers: { 'X-Silent-Request': '1' } });
          school = res?.data?.data;
          console.log('✅ Found existing school from localStorage');
        } catch (e) {
          console.log('❌ localStorage schoolId not valid, trying other methods...');
        }
      }
      
      // Method 2: Try currentUser.schoolId (works if backend returns it)
      if (!school && currentUser?.schoolId) {
        try {
          const res = await getSchoolById(currentUser.schoolId, { headers: { 'X-Silent-Request': '1' } });
          school = res?.data?.data;
          console.log('✅ Found existing school from currentUser.schoolId');
        } catch (e) {
          console.log('❌ currentUser.schoolId not valid, trying other methods...');
        }
      }
      
      // Method 3: Fetch schools and filter by authId (frontend-only solution)
      if (!school) {
        try {
          console.log('🔍 Fetching schools to find match by authId...');
          
          // Try multiple status endpoints since 'all' doesn't work
          let schools = [];
          const statuses = ['accepted', 'pending', 'rejected'];
          
          for (const status of statuses) {
            try {
              const res = await getSchoolsByStatus(status);
              const statusSchools = res?.data?.data || res?.data || [];
              schools = schools.concat(statusSchools);
            } catch (statusErr) {
              console.log(`Could not fetch ${status} schools:`, statusErr.message);
            }
          }
          
          console.log(`Found ${schools.length} total schools across all statuses`);
          
          // Find school where authId matches current user's _id
          school = schools.find(s => s.authId === currentUser._id);
          
          if (school) {
            console.log('✅ Found existing school by authId match');
            localStorage.setItem('lastCreatedSchoolId', school._id);
          } else {
            console.log('⚠️ No school found with authId, trying email match...');
            
            // Fallback: Try to match by email (for schools created before authId was added)
            if (currentUser.email) {
              console.log('🔍 Searching for email match:', {
                userEmail: currentUser.email,
                totalSchools: schools.length,
                sampleSchoolEmails: schools.slice(0, 3).map(s => ({ name: s.name, email: s.email, authId: s.authId }))
              });
              
              school = schools.find(s => s.email && s.email.toLowerCase() === currentUser.email.toLowerCase());
              
              if (school) {
                console.log('✅ Found existing school by email match:', {
                  schoolName: school.name,
                  schoolEmail: school.email,
                  schoolId: school._id
                });
                localStorage.setItem('lastCreatedSchoolId', school._id);
              } else {
                console.log('❌ No school found with matching email');
                console.log('🔍 All school emails in database:', schools.map(s => s.email).filter(Boolean));
              }
            }
          }
        } catch (e) {
          console.log('❌ Could not fetch schools:', e.message);
        }
      }
      
      if (school) {
        console.log('✅ Found existing school, entering edit mode');
        setHasExistingSchool(true);
        setEditingSchoolId(school._id);
        setIsEditMode(true);
        await loadExistingSchoolData(school);
      } else {
        console.log('❌ No existing school found, treating as new registration');
        setHasExistingSchool(false);
        setIsEditMode(false);
        // Auto-fill user details for new schools
        if (currentUser) {
          setFormData(prev => ({
            ...prev,
            email: currentUser.email || prev.email
          }));
        }
        // Only load draft if no existing school found
        loadDraft();
      }
    } catch (error) {
      console.error('Error checking for existing school:', error);
      setHasExistingSchool(false);
      setIsEditMode(false);
      // Load draft on error as well (assuming new school)
      loadDraft();
    } finally {
      setIsLoadingExistingData(false);
    }
  };

  // Load existing school data into form
  const loadExistingSchoolData = async (school) => {
    // Clear any existing draft since we're loading real school data
    try {
      localStorage.removeItem("schoolRegDraft");
    } catch (error) {
      console.error("Could not clear draft:", error);
    }
    setFormData(prev => ({
      ...prev,
      name: school.name || "",
      description: school.description || "",
      address: school.address || "",
      area: school.area || "",
      city: school.city || "",
      state: school.state || "",
      pincode: school.pinCode ? String(school.pinCode) : "",
      board: school.board || "",
      feeRange: school.feeRange || "",
      upto: school.upto || "",
      email: school.email || "",
      website: school.website || "",
      phoneNo: school.mobileNo || "",
      schoolMode: school.schoolMode || "convent",
      genderType: school.genderType === 'boy' ? 'boys' : school.genderType === 'girl' ? 'girls' : (school.genderType || 'co-ed'),
      shifts: Array.isArray(school.shifts) ? school.shifts : [],
      languageMedium: Array.isArray(school.languageMedium) ? school.languageMedium : [],
      transportAvailable: school.transportAvailable || "no",
      latitude: school.latitude != null ? String(school.latitude) : "",
      longitude: school.longitude != null ? String(school.longitude) : "",
      TeacherToStudentRatio: school.TeacherToStudentRatio || "",
      rank: school.rank || "",
      specialist: Array.isArray(school.specialist) ? school.specialist : [],
      tags: Array.isArray(school.tags) ? school.tags : []
    }));
    
    // Load sub-resources in parallel and prefill form controls
    try {
      const [
        amenitiesRes,
        activitiesRes,
        infraRes,
        feesRes,
        academicsRes,
        otherRes,
        safetyRes,
        techRes,
        intlRes,
        facultyRes,
        timelineRes
      ] = await Promise.allSettled([
        getAmenitiesById(school._id),
        getActivitiesById(school._id),
        getInfrastructureById(school._id),
        getFeesAndScholarshipsById(school._id),
        getAcademicsById(school._id),
        getOtherDetailsById(school._id),
        getSafetyAndSecurityById(school._id),
        getTechnologyAdoptionById(school._id),
        getInternationalExposureById(school._id),
        getFacultyById(school._id),
        getAdmissionTimelineById(school._id)
      ]);

      const val = (s) => (s && s.status === 'fulfilled') ? (s.value?.data?.data ?? s.value?.data) : null;
      const amenities = val(amenitiesRes) || {};
      const activities = val(activitiesRes) || {};
      const infra = val(infraRes) || {};
      const fees = val(feesRes) || {};
      const academics = val(academicsRes) || {};
      const other = val(otherRes) || {};
      const safety = val(safetyRes) || {};
      const tech = val(techRes) || {};
      const intl = val(intlRes) || {};
      const faculty = val(facultyRes) || {};
      const timeline = val(timelineRes) || {};

      // Prefill arrays/booleans safely (preserve 0/false values)
      setFormData(prev => ({
        ...prev,
        predefinedAmenities: Array.isArray(amenities.predefinedAmenities) ? amenities.predefinedAmenities : (Array.isArray(amenities.amenities) ? amenities.amenities : prev.predefinedAmenities),
        activities: Array.isArray(activities.activities) ? activities.activities : prev.activities,
        infraLabTypes: Array.isArray(infra.labs) ? infra.labs : prev.infraLabTypes,
        infraSportsTypes: Array.isArray(infra.sportsGrounds) ? infra.sportsGrounds : prev.infraSportsTypes,
        infraLibraryBooks: infra.libraryBooks != null ? String(infra.libraryBooks) : prev.infraLibraryBooks,
        infraSmartClassrooms: infra.smartClassrooms != null ? String(infra.smartClassrooms) : prev.infraSmartClassrooms,
        // Safety & Security
        cctvCoveragePercentage: safety.cctvCoveragePercentage != null ? String(safety.cctvCoveragePercentage) : prev.cctvCoveragePercentage,
        medicalFacility: safety.medicalFacility ? {
          doctorAvailability: safety.medicalFacility.doctorAvailability ?? prev.medicalFacility.doctorAvailability,
          medkitAvailable: !!safety.medicalFacility.medkitAvailable,
          ambulanceAvailable: !!safety.medicalFacility.ambulanceAvailable
        } : prev.medicalFacility,
        transportSafety: safety.transportSafety ? {
          gpsTrackerAvailable: !!safety.transportSafety.gpsTrackerAvailable,
          driversVerified: !!safety.transportSafety.driversVerified
        } : prev.transportSafety,
        fireSafetyMeasures: Array.isArray(safety.fireSafetyMeasures) ? safety.fireSafetyMeasures : prev.fireSafetyMeasures,
        visitorManagementSystem: safety.visitorManagementSystem != null ? !!safety.visitorManagementSystem : prev.visitorManagementSystem,
        // Technology Adoption
        smartClassroomsPercentage: tech.smartClassroomsPercentage != null ? String(tech.smartClassroomsPercentage) : prev.smartClassroomsPercentage,
        eLearningPlatforms: Array.isArray(tech.eLearningPlatforms) ? tech.eLearningPlatforms : prev.eLearningPlatforms,
        // International Exposure
        exchangePrograms: Array.isArray(intl.exchangePrograms) ? intl.exchangePrograms.map(prog => ({
          partnerSchool: prog.partnerSchool ?? '',
          type: prog.type ?? prog.programType ?? '',
          duration: prog.duration ?? '',
          studentsParticipated: prog.studentsParticipated ?? '',
          activeSince: prog.activeSince ?? ''
        })) : prev.exchangePrograms,
        globalTieUps: Array.isArray(intl.globalTieUps) ? intl.globalTieUps.map(tie => ({
          partnerName: tie.partnerName ?? '',
          nature: tie.nature ?? tie.natureOfTieUp ?? '',
          activeSince: tie.activeSince ?? '',
          description: tie.description ?? ''
        })) : prev.globalTieUps,
        // Other Details
        genderRatio: other.genderRatio ? {
          male: other.genderRatio.male ?? prev.genderRatio.male,
          female: other.genderRatio.female ?? prev.genderRatio.female,
          others: other.genderRatio.others ?? prev.genderRatio.others
        } : prev.genderRatio,
        scholarshipDiversity: other.scholarshipDiversity ? {
          types: Array.isArray(other.scholarshipDiversity.types) ? other.scholarshipDiversity.types : prev.scholarshipDiversity.types,
          studentsCoveredPercentage: other.scholarshipDiversity.studentsCoveredPercentage ?? prev.scholarshipDiversity.studentsCoveredPercentage
        } : prev.scholarshipDiversity,
        specialNeedsSupport: other.specialNeedsSupport ? {
          dedicatedStaff: !!other.specialNeedsSupport.dedicatedStaff,
          studentsSupportedPercentage: other.specialNeedsSupport.studentsSupportedPercentage ?? prev.specialNeedsSupport.studentsSupportedPercentage,
          facilitiesAvailable: Array.isArray(other.specialNeedsSupport.facilitiesAvailable) ? other.specialNeedsSupport.facilitiesAvailable : prev.specialNeedsSupport.facilitiesAvailable
        } : prev.specialNeedsSupport,
        // Academics summary fields
        averageClass10Result: academics.averageClass10Result ?? prev.averageClass10Result,
        averageClass12Result: academics.averageClass12Result ?? prev.averageClass12Result,
        averageSchoolMarks: academics.averageSchoolMarks ?? prev.averageSchoolMarks,
        specialExamsTraining: Array.isArray(academics.specialExamsTraining) ? academics.specialExamsTraining : prev.specialExamsTraining,
        extraCurricularActivities: Array.isArray(academics.extraCurricularActivities) ? academics.extraCurricularActivities : prev.extraCurricularActivities,
        // Fees & Scholarships
        feesTransparency: fees.feesTransparency != null ? (
          fees.feesTransparency === 100 || fees.feesTransparency === 'full' ? 'full' :
          fees.feesTransparency === 50 || fees.feesTransparency === 'partial' ? 'partial' :
          fees.feesTransparency === 0 || fees.feesTransparency === 'low' ? 'low' :
          String(fees.feesTransparency)
        ) : prev.feesTransparency,
        classFees: Array.isArray(fees.classFees) ? fees.classFees : prev.classFees,
        scholarships: Array.isArray(fees.scholarships) ? fees.scholarships : prev.scholarships,
        // UI mirrors for Other Details
        genderRatioMale: other.genderRatio && other.genderRatio.male != null ? String(other.genderRatio.male) : prev.genderRatioMale,
        genderRatioFemale: other.genderRatio && other.genderRatio.female != null ? String(other.genderRatio.female) : prev.genderRatioFemale,
        genderRatioOthers: other.genderRatio && other.genderRatio.others != null ? String(other.genderRatio.others) : prev.genderRatioOthers,
        scholarshipDiversityTypes: Array.isArray(other.scholarshipDiversity?.types) ? other.scholarshipDiversity.types : prev.scholarshipDiversityTypes,
        scholarshipDiversityCoverage: other.scholarshipDiversity && other.scholarshipDiversity.studentsCoveredPercentage != null ? String(other.scholarshipDiversity.studentsCoveredPercentage) : prev.scholarshipDiversityCoverage,
        specialNeedsStaff: other.specialNeedsSupport ? !!other.specialNeedsSupport.dedicatedStaff : prev.specialNeedsStaff,
        specialNeedsSupportPercentage: other.specialNeedsSupport && other.specialNeedsSupport.studentsSupportedPercentage != null ? String(other.specialNeedsSupport.studentsSupportedPercentage) : prev.specialNeedsSupportPercentage,
        specialNeedsFacilities: Array.isArray(other.specialNeedsSupport?.facilitiesAvailable) ? other.specialNeedsSupport.facilitiesAvailable : prev.specialNeedsFacilities
      }));

      // academicResults and examQualifiers removed - not in backend schema

      // Load additional data arrays
      if (Array.isArray(amenities.customAmenities)) {
        setCustomAmenities(amenities.customAmenities);
      }
      if (Array.isArray(activities.customActivities)) {
        setCustomActivities(activities.customActivities);
      }
      if (Array.isArray(faculty.facultyMembers)) {
        setFacultyQuality(faculty.facultyMembers.map(f => ({
          name: f.name || '',
          qualification: f.qualification || '',
          awards: Array.isArray(f.awards) ? f.awards.join(', ') : (f.awards || ''),
          experience: f.experience || ''
        })));
      }
      if (Array.isArray(timeline.timelines)) {
        setAdmissionSteps(timeline.timelines.map(t => ({
          admissionStartDate: t.admissionStartDate ? new Date(t.admissionStartDate).toISOString().split('T')[0] : '',
          admissionEndDate: t.admissionEndDate ? new Date(t.admissionEndDate).toISOString().split('T')[0] : '',
          status: t.status || '',
          documentsRequired: Array.isArray(t.documentsRequired) ? t.documentsRequired : [],
          admissionLevel: t.eligibility?.admissionLevel || '',
          ageCriteria: t.eligibility?.ageCriteria || '',
          otherInfo: t.eligibility?.otherInfo || ''
        })));
      }

      console.log('✅ Successfully loaded existing school data');
    } catch (error) {
      console.error('Error loading sub-resources:', error);
    }
  };

  // Auto-save draft when form data changes (debounced) - only for new schools
  useEffect(() => {
    // Don't auto-save for existing schools to avoid overwriting their data
    if (hasExistingSchool) return;
    
    const autoSaveTimer = setTimeout(() => {
      if (formData.name || formData.description || formData.email) {
        // Only auto-save if user has started filling the form
        const draft = {
          formData,
          famousAlumnies,
          topAlumnies,
          otherAlumnies,
          customActivities,
          customAmenities,
          facultyQuality,
          activeSection,
        };
        try {
          localStorage.setItem("schoolRegDraft", JSON.stringify(draft));
          // Don't show toast for auto-save to avoid spam
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formData, famousAlumnies, topAlumnies, otherAlumnies, customActivities, customAmenities, facultyQuality, activeSection, hasExistingSchool]);

  const goPrev = () => {
    if (isFirst) return;
    const idx = sectionIndex(activeSection);
    setActiveSection(sections[idx - 1].id);
  };
  const goNext = () => {
    const idx = sectionIndex(activeSection);
    if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
  };

  useEffect(() => {
    console.log('Active section changed to:', activeSection); // Debug log
  }, [activeSection]);

  useEffect(() => {
    const observers = sections.map((s) => {
      const el = document.getElementById(s.id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isManualNavigation) {
            console.log('Intersection observer triggered for:', s.id);
            setActiveSection(s.id);
          }
        },
        { root: null, rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((o) => o && o.disconnect());
  }, [isManualNavigation]);

  const scrollToSection = (id) => {
    console.log('Scrolling to section:', id); // Debug log
    setActiveSection(id);
    // Smooth scroll to the section
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ 
        behavior: "smooth", 
        block: "start",
        inline: "nearest"
      });
      // Add a subtle highlight effect to the section
      setTimeout(() => {
        el.classList.add('animate-pulse');
        setTimeout(() => el.classList.remove('animate-pulse'), 1000);
      }, 500);
    }
  };

  const handleEnterEditMode = async () => {
    if (!currentUser?._id) {
      return toast.error("You must be logged in.");
    }
    try {
      setIsSubmitting(true);
      
      let school;
      
      // Method 1: Try localStorage (works if same session)
      const cachedSchoolId = typeof localStorage !== 'undefined' && localStorage.getItem('lastCreatedSchoolId');
      if (cachedSchoolId) {
        try {
          const res = await getSchoolById(cachedSchoolId, { headers: { 'X-Silent-Request': '1' } });
          school = res?.data?.data;
          console.log('✅ Found school from localStorage');
        } catch (e) {
          console.log('❌ localStorage schoolId not valid, trying other methods...');
        }
      }
      
      // Method 2: Try currentUser.schoolId (works if backend returns it)
      if (!school && currentUser?.schoolId) {
        try {
          const res = await getSchoolById(currentUser.schoolId, { headers: { 'X-Silent-Request': '1' } });
          school = res?.data?.data;
          console.log('✅ Found school from currentUser.schoolId');
        } catch (e) {
          console.log('❌ currentUser.schoolId not valid, trying other methods...');
        }
      }
      
      // Method 3: Fetch schools and filter by authId (frontend-only solution)
      if (!school) {
        try {
          console.log('🔍 Fetching schools to find match by authId...');
          
          // Try multiple status endpoints since 'all' doesn't work
          let schools = [];
          const statuses = ['accepted', 'pending', 'rejected'];
          
          for (const status of statuses) {
            try {
              const res = await getSchoolsByStatus(status);
              const statusSchools = res?.data?.data || res?.data || [];
              schools = schools.concat(statusSchools);
            } catch (statusErr) {
              console.log(`Could not fetch ${status} schools:`, statusErr.message);
            }
          }
          
          console.log(`Found ${schools.length} total schools across all statuses`);
          
          // Find school where authId matches current user's _id
          school = schools.find(s => s.authId === currentUser._id);
          
          if (school) {
            console.log('✅ Found school by authId match');
            localStorage.setItem('lastCreatedSchoolId', school._id);
          } else {
            console.log('⚠️ No school found with authId, trying email match...');
            
            // Fallback: Try to match by email (for schools created before authId was added)
            if (currentUser.email) {
              school = schools.find(s => s.email && s.email.toLowerCase() === currentUser.email.toLowerCase());
              
              if (school) {
                console.log('✅ Found school by email match');
                localStorage.setItem('lastCreatedSchoolId', school._id);
              } else {
                console.log('❌ No school found with authId or email');
                console.log('Your authId:', currentUser._id);
                console.log('Your email:', currentUser.email);
                console.log('Sample school data:', schools[0]);
              }
            }
          }
        } catch (e) {
          console.log('❌ Could not fetch schools:', e.message);
        }
      }
      
      if (!school) {
        toast.error("No linked school profile found for this account. Please create a school profile first.");
        return;
      }
      
      // Clear any existing draft since we're loading real school data
      try {
        localStorage.removeItem("schoolRegDraft");
      } catch (error) {
        console.error("Could not clear draft:", error);
      }
      
      setEditingSchoolId(school._id);
      setIsEditMode(true);
      setHasExistingSchool(true);

      setFormData(prev => ({
        ...prev,
        name: school.name || "",
        description: school.description || "",
        address: school.address || "",
        area: school.area || "",
        city: school.city || "",
        state: school.state || "",
        pincode: school.pinCode ? String(school.pinCode) : "",
        board: school.board || "",
        feeRange: school.feeRange || "",
        upto: school.upto || "",
        email: school.email || "",
        website: school.website || "",
        phoneNo: school.mobileNo || "",
        schoolMode: school.schoolMode || "convent",
        genderType: school.genderType === 'boy' ? 'boys' : school.genderType === 'girl' ? 'girls' : (school.genderType || 'co-ed'),
        shifts: Array.isArray(school.shifts) ? school.shifts : [],
        languageMedium: Array.isArray(school.languageMedium) ? school.languageMedium : [],
        transportAvailable: school.transportAvailable || "no",
        latitude: school.latitude != null ? String(school.latitude) : "",
        longitude: school.longitude != null ? String(school.longitude) : "",
        TeacherToStudentRatio: school.TeacherToStudentRatio || "",
        rank: school.rank || "",
        specialist: Array.isArray(school.specialist) ? school.specialist : [],
        tags: Array.isArray(school.tags) ? school.tags : []
      }));
      
      // Load sub-resources in parallel and prefill form controls
      const [
        amenitiesRes,
        activitiesRes,
        infraRes,
        feesRes,
        academicsRes,
        otherRes,
        safetyRes,
        techRes,
        intlRes,
        facultyRes,
        timelineRes
      ] = await Promise.allSettled([
        getAmenitiesById(school._id),
        getActivitiesById(school._id),
        getInfrastructureById(school._id),
        getFeesAndScholarshipsById(school._id),
        getAcademicsById(school._id),
        getOtherDetailsById(school._id),
        getSafetyAndSecurityById(school._id),
        getTechnologyAdoptionById(school._id),
        getInternationalExposureById(school._id),
        getFacultyById(school._id),
        getAdmissionTimelineById(school._id)
      ]);

      const val = (s) => (s && s.status === 'fulfilled') ? (s.value?.data?.data ?? s.value?.data) : null;
      const amenities = val(amenitiesRes) || {};
      const activities = val(activitiesRes) || {};
      const infra = val(infraRes) || {};
      const fees = val(feesRes) || {};
      const academics = val(academicsRes) || {};
      const other = val(otherRes) || {};
      const safety = val(safetyRes) || {};
      const tech = val(techRes) || {};
      const intl = val(intlRes) || {};
      const faculty = val(facultyRes) || {};
      const timeline = val(timelineRes) || {};

      // Prefill arrays/booleans safely
      setFormData(prev => ({
        ...prev,
        predefinedAmenities: Array.isArray(amenities.predefinedAmenities) ? amenities.predefinedAmenities : (Array.isArray(amenities.amenities) ? amenities.amenities : prev.predefinedAmenities),
        activities: Array.isArray(activities.activities) ? activities.activities : prev.activities,
        infraLabTypes: Array.isArray(infra.labs) ? infra.labs : prev.infraLabTypes,
        infraSportsTypes: Array.isArray(infra.sportsGrounds) ? infra.sportsGrounds : prev.infraSportsTypes,
        infraLibraryBooks: infra.libraryBooks != null ? String(infra.libraryBooks) : prev.infraLibraryBooks,
        infraSmartClassrooms: infra.smartClassrooms != null ? String(infra.smartClassrooms) : prev.infraSmartClassrooms,
        // Technology Adoption
        smartClassroomsPercentage: tech.smartClassroomsPercentage != null ? String(tech.smartClassroomsPercentage) : prev.smartClassroomsPercentage,
        eLearningPlatforms: Array.isArray(tech.eLearningPlatforms) ? tech.eLearningPlatforms : prev.eLearningPlatforms,
        feesTransparency: fees.feesTransparency != null ? (
          fees.feesTransparency === 100 || fees.feesTransparency === 'full' ? 'full' :
          fees.feesTransparency === 50 || fees.feesTransparency === 'partial' ? 'partial' :
          fees.feesTransparency === 0 || fees.feesTransparency === 'low' ? 'low' :
          String(fees.feesTransparency)
        ) : prev.feesTransparency,
        classFees: Array.isArray(fees.classFees) ? fees.classFees : prev.classFees,
        scholarships: Array.isArray(fees.scholarships) ? fees.scholarships : prev.scholarships,
        averageClass10Result: academics.averageClass10Result ?? prev.averageClass10Result,
        averageClass12Result: academics.averageClass12Result ?? prev.averageClass12Result,
        averageSchoolMarks: academics.averageSchoolMarks ?? prev.averageSchoolMarks,
        specialExamsTraining: Array.isArray(academics.specialExamsTraining) ? academics.specialExamsTraining : prev.specialExamsTraining,
        extraCurricularActivities: Array.isArray(academics.extraCurricularActivities) ? academics.extraCurricularActivities : prev.extraCurricularActivities,
        // Safety & Security
        cctvCoveragePercentage: safety.cctvCoveragePercentage != null ? String(safety.cctvCoveragePercentage) : prev.cctvCoveragePercentage,
        medicalFacility: safety.medicalFacility ? {
          doctorAvailability: safety.medicalFacility.doctorAvailability ?? prev.medicalFacility.doctorAvailability,
          medkitAvailable: !!safety.medicalFacility.medkitAvailable,
          ambulanceAvailable: !!safety.medicalFacility.ambulanceAvailable,
        } : prev.medicalFacility,
        transportSafety: safety.transportSafety ? {
          gpsTrackerAvailable: !!safety.transportSafety.gpsTrackerAvailable,
          driversVerified: !!safety.transportSafety.driversVerified,
        } : prev.transportSafety,
        fireSafetyMeasures: Array.isArray(safety.fireSafetyMeasures) ? safety.fireSafetyMeasures : prev.fireSafetyMeasures,
        visitorManagementSystem: safety.visitorManagementSystem != null ? !!safety.visitorManagementSystem : prev.visitorManagementSystem,
        genderRatio: other.genderRatio ? {
          male: other.genderRatio.male ?? prev.genderRatio.male,
          female: other.genderRatio.female ?? prev.genderRatio.female,
          others: other.genderRatio.others ?? prev.genderRatio.others,
        } : prev.genderRatio,
        scholarshipDiversity: other.scholarshipDiversity ? {
          types: Array.isArray(other.scholarshipDiversity.types) ? other.scholarshipDiversity.types : prev.scholarshipDiversity.types,
          studentsCoveredPercentage: other.scholarshipDiversity.studentsCoveredPercentage ?? prev.scholarshipDiversity.studentsCoveredPercentage,
        } : prev.scholarshipDiversity,
        specialNeedsSupport: other.specialNeedsSupport ? {
          dedicatedStaff: !!other.specialNeedsSupport.dedicatedStaff,
          studentsSupportedPercentage: other.specialNeedsSupport.studentsSupportedPercentage ?? prev.specialNeedsSupport.studentsSupportedPercentage,
          facilitiesAvailable: Array.isArray(other.specialNeedsSupport.facilitiesAvailable) ? other.specialNeedsSupport.facilitiesAvailable : prev.specialNeedsSupport.facilitiesAvailable,
        } : prev.specialNeedsSupport,
        // UI-flat mirrors for Other Details (to update existing inputs)
        genderRatioMale: other.genderRatio && other.genderRatio.male != null ? String(other.genderRatio.male) : prev.genderRatioMale,
        genderRatioFemale: other.genderRatio && other.genderRatio.female != null ? String(other.genderRatio.female) : prev.genderRatioFemale,
        genderRatioOthers: other.genderRatio && other.genderRatio.others != null ? String(other.genderRatio.others) : prev.genderRatioOthers,
        scholarshipDiversityTypes: Array.isArray(other.scholarshipDiversity?.types) ? other.scholarshipDiversity.types : prev.scholarshipDiversityTypes,
        scholarshipDiversityCoverage: other.scholarshipDiversity && other.scholarshipDiversity.studentsCoveredPercentage != null ? String(other.scholarshipDiversity.studentsCoveredPercentage) : prev.scholarshipDiversityCoverage,
        specialNeedsFacilities: Array.isArray(other.specialNeedsSupport?.facilitiesAvailable) ? other.specialNeedsSupport.facilitiesAvailable : prev.specialNeedsFacilities,
        specialNeedsSupportPercentage: other.specialNeedsSupport && other.specialNeedsSupport.studentsSupportedPercentage != null ? String(other.specialNeedsSupport.studentsSupportedPercentage) : prev.specialNeedsSupportPercentage,
        specialNeedsStaff: other.specialNeedsSupport ? !!other.specialNeedsSupport.dedicatedStaff : prev.specialNeedsStaff,
        // International Exposure
        exchangePrograms: Array.isArray(intl.exchangePrograms) ? intl.exchangePrograms.map(prog => ({
          partnerSchool: prog.partnerSchool ?? '',
          type: prog.type ?? prog.programType ?? '',
          duration: prog.duration ?? '',
          studentsParticipated: prog.studentsParticipated ?? '',
          activeSince: prog.activeSince ?? ''
        })) : prev.exchangePrograms,
        globalTieUps: Array.isArray(intl.globalTieUps) ? intl.globalTieUps.map(tie => ({
          partnerName: tie.partnerName ?? '',
          nature: tie.nature ?? tie.natureOfTieUp ?? '',
          activeSince: tie.activeSince ?? '',
          description: tie.description ?? ''
        })) : prev.globalTieUps,
      }));

      // Prefill complex UI-specific states
      setCustomAmenities(Array.isArray(amenities.customAmenities) ? amenities.customAmenities : []);
      setCustomActivities(Array.isArray(activities.customActivities) ? activities.customActivities : []);
      setFamousAlumnies(Array.isArray((faculty.famousAlumnies)) ? faculty.famousAlumnies : []);
      setTopAlumnies(Array.isArray((faculty.topAlumnies)) ? faculty.topAlumnies : []);
      setOtherAlumnies(Array.isArray((faculty.otherAlumnies)) ? faculty.otherAlumnies : []);
      setFacultyQuality(Array.isArray(faculty.facultyMembers) ? faculty.facultyMembers.map(m => ({
        name: m.name || '',
        qualification: m.qualification || '',
        awards: Array.isArray(m.awards) ? m.awards.join(', ') : (m.awards || ''),
        experience: m.experience ?? ''
      })) : facultyQuality);
      setAdmissionSteps(Array.isArray(timeline.timelines) ? timeline.timelines : Array.isArray(timeline) ? timeline : []);
      
      // Load academic performance trends and exam qualifiers
      console.log('📚 Loading Academics from Backend:', {
        fullAcademics: academics
      });
      
      // academicResults and examQualifiers removed - not in backend schema

      toast.success("Loaded your existing school details. You can update and save.");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load school details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen py-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      
      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20"
        >
          {isLoadingExistingData ? (
            <div className="text-center mb-6">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Loading your school information...</p>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-center mb-2 animate-fade-in">
                {hasExistingSchool ? '🏫 School Profile' : '🎓 School Registration Portal'}
              </h1>
              <div className="flex items-center justify-center gap-3 mb-6">
                <p className="text-center text-gray-600 animate-fade-in-delay">
                  {hasExistingSchool 
                    ? 'Update your school profile information'
                    : 'Complete your school profile with our interactive presentation'
                  }
                </p>
              </div>
            </>
          )}
          
          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  console.log('Slide indicator clicked:', section.id); // Debug log
                  scrollToSection(section.id);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 scale-125'
                    : 'bg-gray-300'
                }`}
                title={`Go to ${section.label}`}
              />
            ))}
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Step {sectionIndex(activeSection) + 1} of {sections.length}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-1 h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Interactive Stepper navigation */}
          <div className="sticky top-0 z-20 -mx-6 px-6 py-6 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {sections.map(({ id, label, Icon }, index) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    console.log('Navigation clicked:', id); // Debug log
                    scrollToSection(id);
                  }}
                  className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-sm font-medium border-2 ${
                    activeSection === id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/25"
                      : "bg-white/80 text-gray-700 border-gray-200 shadow-md"
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    activeSection === id 
                      ? "bg-white/20" 
                      : "bg-gray-100"
                  }`}>
                    {Icon ? <Icon size={20} className={activeSection === id ? "text-white" : "text-gray-600"} /> : null}
                  </div>
                  <span className="font-semibold">{label}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    activeSection === id 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main content area - All sections visible */}
          <div className="mt-8 space-y-12">
            <div className="block" id="basic">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    📋 Basic Information
                  </h2>
                  <p className="text-gray-600 mt-1">Essential details about your school</p>
                </div>
              </div>

             {/* School Identity */}
             <div className="mb-6 bg-white border rounded-lg p-4">
               <div className="flex items-start gap-4">
                 <div>
                   <div className="text-sm font-medium text-gray-800 mb-1">School Identity</div>
                   <div className="text-xs text-gray-500">Upload your school logo (PNG, JPG, JPEG). Max 5MB.</div>
                 </div>
               </div>
               <div className="mt-4 flex items-center gap-4">
                 <div className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
                   {logoPreview ? (
                     <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                   ) : (
                     <span className="text-xs text-gray-400">Logo</span>
                   )}
                 </div>
                 <div>
                   <input id="logo-input" type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoChange} />
                   <button type="button" onClick={() => document.getElementById("logo-input").click()} className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white">Upload Logo</button>
                   {logoFile && <div className="text-xs text-gray-500 mt-1">{logoFile.name}</div>}
                 </div>
               </div>
             </div>

             {/* Social Media Links */}
             <div className="mb-6 bg-white border rounded-lg p-4">
               <div className="text-sm font-medium text-gray-800 mb-2">Social Media Links</div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input
                   type="url"
                   placeholder="https://facebook.com/yourschool"
                   value={socialLinks.facebook}
                   onChange={(e) => setSocialLinks((p) => ({ ...p, facebook: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                 />
                 <input
                   type="url"
                   placeholder="https://instagram.com/yourschool"
                   value={socialLinks.instagram}
                   onChange={(e) => setSocialLinks((p) => ({ ...p, instagram: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                 />
                 <input
                   type="url"
                   placeholder="https://twitter.com/yourschool"
                   value={socialLinks.twitter}
                   onChange={(e) => setSocialLinks((p) => ({ ...p, twitter: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                 />
                 <input
                   type="url"
                   placeholder="https://linkedin.com/company/yourschool"
                   value={socialLinks.linkedin}
                   onChange={(e) => setSocialLinks((p) => ({ ...p, linkedin: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                 />
               </div>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="School Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Phone Number"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
              />
              <FormField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Teacher:Student Ratio (e.g., 1:20)"
                name="TeacherToStudentRatio"
                type="text"
                value={formData.TeacherToStudentRatio}
                onChange={handleInputChange}
              />
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  label="Latitude (GPS)"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                />
                <FormField
                  label="Longitude (GPS)"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="h-10 mt-7 bg-indigo-600 text-white rounded-md px-4"
                >
                  Use Current Location
                </button>
              </div>
              <div className="md:col-span-2 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    <strong>GPS Location Required:</strong> Latitude and Longitude are mandatory for accurate distance calculation. 
                    This helps parents find schools near their location. Click "Use Current Location" to automatically fill these fields.
                  </p>
                </div>
              </div>
              <FormField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Board"
                name="board"
                type="select"
                options={["CBSE", "ICSE", "STATE", "IB", "IGCSE"]}
                value={formData.board}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Classes Upto"
                name="upto"
                value={formData.upto}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Gender Type"
                name="genderType"
                type="select"
                options={["co-ed", "boys", "girls"]}
                value={formData.genderType}
                onChange={handleInputChange}
                required
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Shifts <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["morning", "afternoon", "night school"].map((shift) => (
                    <label key={shift} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shifts.includes(shift)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              shifts: [...prev.shifts, shift]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              shifts: prev.shifts.filter(s => s !== shift)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {shift === "night school" ? "Night School" : shift}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.shifts.length === 0 && (
                  <p className="text-red-500 text-xs mt-1">Please select at least one shift</p>
                )}
              </div>
              <FormField
                label="School Mode"
                name="schoolMode"
                type="select"
                options={["convent", "private", "government"]}
                value={formData.schoolMode}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Fee Range"
                name="feeRange"
                type="select"
                options={feeRangeOptions}
                value={formData.feeRange}
                onChange={handleInputChange}
                required
              />
              <div className="md:col-span-2">
                <FormField
                  label="Description"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="block" id="amenities">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    ✨ Amenities & Activities
                  </h2>
                  <p className="text-gray-600 mt-1">Facilities and programs offered</p>
                </div>
              </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <FormField
                  label="Amenities"
                  name="predefinedAmenities"
                  type="checkboxGroup"
                  options={amenitiesOptions}
                  value={formData.predefinedAmenities}
                  onChange={handleCheckboxChange}
                />
              </div>
              <div>
                <DynamicAmenitiesField
                  label="Other Amenities"
                  value={customAmenities}
                  onChange={setCustomAmenities}
                />
              </div>
              <div>
                <FormField
                  label="Activities"
                  name="activities"
                  type="checkboxGroup"
                  options={activitiesOptions}
                  value={formData.activities}
                  onChange={handleCheckboxChange}
                />
              </div>
              <div>
                <DynamicActivitiesField
                  label="Other Activities"
                  value={customActivities}
                  onChange={setCustomActivities}
                />
              </div>
            </div>

            <div className="block" id="alumni">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    🏆 Alumni Information
                  </h2>
                  <p className="text-gray-600 mt-1">Notable graduates and achievements</p>
                </div>
              </div>
            <div className="space-y-8">
              <DynamicListField
                label="Famous Alumni (Name & Profession)"
                value={famousAlumnies}
                onChange={setFamousAlumnies}
                type="famous"
              />
              <DynamicListField
                label="Top Alumni (Name & Percentage)"
                value={topAlumnies}
                onChange={setTopAlumnies}
                type="top"
              />
              <DynamicListField
                label="Other Alumni (Name & Percentage)"
                value={otherAlumnies}
                onChange={setOtherAlumnies}
                type="other"
              />
            </div>

            <div className="block" id="faculty">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Users2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    👥 Faculty Quality
                  </h2>
                  <p className="text-gray-600 mt-1">Teaching staff qualifications and experience</p>
                </div>
              </div>
          {/* Simplified Faculty Quality inputs handled per-entry below */}

          <div className="mt-6">
            {facultyQuality.map((fq, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-gray-50 p-4 rounded-md my-2">
                <FormField
                  label="Faculty Name"
                  name={`fq-name-${index}`}
                  value={fq.name || ''}
                  onChange={(e) => {
                    const list = facultyQuality.slice();
                    list[index] = { ...list[index], name: e.target.value };
                    setFacultyQuality(list);
                  }}
                />
                <FormField
                  label="Qualification"
                  name={`fq-qualification-${index}`}
                  value={fq.qualification || ''}
                  onChange={(e) => {
                    const list = facultyQuality.slice();
                    list[index] = { ...list[index], qualification: e.target.value };
                    setFacultyQuality(list);
                  }}
                />
                <FormField
                  label="Awards"
                  name={`fq-awards-${index}`}
                  value={fq.awards || ''}
                  onChange={(e) => {
                    const list = facultyQuality.slice();
                    list[index] = { ...list[index], awards: e.target.value };
                    setFacultyQuality(list);
                  }}
                />
                <FormField
                  label="Teaching experience (yrs)"
                  name={`fq-exp-${index}`}
                  type="number"
                  value={fq.experience || ''}
                  onChange={(e) => {
                    const list = facultyQuality.slice();
                    list[index] = { ...list[index], experience: e.target.value };
                    setFacultyQuality(list);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFacultyQuality(facultyQuality.filter((_, i) => i !== index))}
                  className="text-red-500 mb-2"
                  aria-label={`Remove faculty row ${index + 1}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFacultyQuality([...facultyQuality, { name: '', qualification: '', awards: '', experience: '' }])}
              className="mt-2 flex items-center text-sm text-indigo-600"
            >
              <PlusCircle size={16} className="mr-1" /> Add Faculty
            </button>
          </div>
            </div>

            <div className="block" id="infrastructure">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    🏢 Infrastructure
                  </h2>
                  <p className="text-gray-600 mt-1">Facilities, labs, and physical resources</p>
                </div>
              </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Labs - Type</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {['Physics','Chemistry','Biology','Computer','Robotics','Language'].map(opt => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="checkbox"
                      name="infraLabTypes"
                      value={opt}
                      checked={(formData.infraLabTypes || []).includes(opt)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        const current = formData.infraLabTypes || [];
                        const next = checked ? [...current, value] : current.filter(v => v !== value);
                        setFormData(prev => ({ ...prev, infraLabTypes: next }));
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <FormField
              label="Library - number of books"
              name="infraLibraryBooks"
              type="number"
              value={formData.infraLibraryBooks}
              onChange={handleInputChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">Sports Grounds - Type</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {['Football','Cricket','Basketball','Tennis','Athletics','Badminton'].map(opt => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="checkbox"
                      name="infraSportsTypes"
                      value={opt}
                      checked={(formData.infraSportsTypes || []).includes(opt)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        const current = formData.infraSportsTypes || [];
                        const next = checked ? [...current, value] : current.filter(v => v !== value);
                        setFormData(prev => ({ ...prev, infraSportsTypes: next }));
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <FormField
              label="Smart Classrooms - number"
              name="infraSmartClassrooms"
              type="number"
              value={formData.infraSmartClassrooms}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">Labs</div>
              <div className="text-lg font-semibold text-gray-900">{(formData.infraLabTypes || []).join(', ') || '—'}</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">Books</div>
              <div className="text-lg font-semibold text-gray-900">{formData.infraLibraryBooks || '—'}</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">Sports</div>
              <div className="text-lg font-semibold text-gray-900">{(formData.infraSportsTypes || []).join(', ') || '—'}</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">Smart Rooms</div>
              <div className="text-lg font-semibold text-gray-900">{formData.infraSmartClassrooms || '—'}</div>
            </div>
          </div>
            </div>

            <div className="block" id="safety">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    🛡️ Safety & Security
                  </h2>
                  <p className="text-gray-600 mt-1">Security measures and safety protocols</p>
                </div>
              </div>
          
          <div className="space-y-8">
            {/* CCTV Coverage */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">CCTV Coverage</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CCTV Coverage Percentage
                </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                  value={formData.cctvCoveragePercentage || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, cctvCoveragePercentage: e.target.value }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>0%</span>
                  <span className="font-semibold text-indigo-600">{formData.cctvCoveragePercentage || 0}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Medical Facility */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Facility</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Availability
                  </label>
              <select
                    value={formData.medicalFacility?.doctorAvailability || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      medicalFacility: {
                        ...prev.medicalFacility,
                        doctorAvailability: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Availability</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="On-call">On-call</option>
                    <option value="Not Available">Not Available</option>
              </select>
            </div>

                <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                      checked={formData.medicalFacility?.medkitAvailable || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        medicalFacility: {
                          ...prev.medicalFacility,
                          medkitAvailable: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Medkit Available</span>
                </label>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                <input
                      type="checkbox"
                      checked={formData.medicalFacility?.ambulanceAvailable || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        medicalFacility: {
                          ...prev.medicalFacility,
                          ambulanceAvailable: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Ambulance Available</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Transport Safety */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Transport Safety</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.transportSafety?.gpsTrackerAvailable || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        transportSafety: {
                          ...prev.transportSafety,
                          gpsTrackerAvailable: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">GPS Tracker Available</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.transportSafety?.driversVerified || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        transportSafety: {
                          ...prev.transportSafety,
                          driversVerified: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Drivers Verified</span>
                  </label>
                </div>
                  </div>
            </div>

            {/* Fire Safety Measures */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Fire Safety Measures</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Extinguishers', 'Alarms', 'Sprinklers', 'Evacuation Drills'].map((measure) => (
                  <label key={measure} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                      checked={(formData.fireSafetyMeasures || []).includes(measure)}
                      onChange={(e) => {
                        const current = formData.fireSafetyMeasures || [];
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, fireSafetyMeasures: [...current, measure] }));
                        } else {
                          setFormData(prev => ({ ...prev, fireSafetyMeasures: current.filter(m => m !== measure) }));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{measure}</span>
                        </label>
                    ))}
            </div>
          </div>

            {/* Visitor Management System */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Visitor Management</h3>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.visitorManagementSystem || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, visitorManagementSystem: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Visitor Management System Available</span>
                </label>
              </div>
            </div>
          </div>
            </div>

            <div className="block" id="fees">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                    💰 Fees & Affordability
                  </h2>
                  <p className="text-gray-600 mt-1">Pricing structure and scholarship options</p>
                </div>
              </div>
          
          {/* Fee Transparency Indicator */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Fee Transparency Indicator</label>
            <div className="flex items-center gap-4">
              <select
                name="feesTransparency"
                value={formData.feesTransparency}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="full">🟢 Fully Transparent</option>
                <option value="partial">🟡 Partial Transparency</option>
                <option value="low">🔴 Low Transparency</option>
              </select>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  formData.feesTransparency === 'full' ? 'bg-green-100 text-green-800' :
                  formData.feesTransparency === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {formData.feesTransparency === 'full' ? 'Fully Transparent' :
                   formData.feesTransparency === 'partial' ? 'Partial' : 'Low Transparency'}
                </span>
              </div>
            </div>
          </div>

          {/* Class-wise Fees Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Class-wise Fees Table</h3>
              <button
                type="button"
                onClick={() => {
                  const newFees = [...(formData.classFees || []), { className: '', tuition: '', activity: '', transport: '', hostel: '', misc: '' }];
                  setFormData(prev => ({ ...prev, classFees: newFees }));
                }}
                className="flex items-center text-sm text-indigo-600"
              >
                <PlusCircle size={16} className="mr-1" /> Add Class
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">💰 Tuition</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🎭 Activity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🚌 Transport</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🏫 Hostel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🏷️ Misc</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(formData.classFees || []).map((fee, index) => (
                    <tr key={index} className="">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={fee.className || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classFees || [])];
                            newFees[index] = { ...newFees[index], className: e.target.value };
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          placeholder="e.g., Nursery, LKG, UKG, 1st"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={fee.tuition || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classFees || [])];
                            newFees[index] = { ...newFees[index], tuition: e.target.value };
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={fee.activity || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classFees || [])];
                            newFees[index] = { ...newFees[index], activity: e.target.value };
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={fee.transport || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classFees || [])];
                            newFees[index] = { ...newFees[index], transport: e.target.value };
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={fee.hostel || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classFees || [])];
                            newFees[index] = { ...newFees[index], hostel: e.target.value };
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={fee.misc || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classFees || [])];
                            newFees[index] = { ...newFees[index], misc: e.target.value };
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {(() => {
                          const tuition = Number(fee.tuition || 0);
                          const activity = Number(fee.activity || 0);
                          const transport = Number(fee.transport || 0);
                          const hostel = Number(fee.hostel || 0);
                          const misc = Number(fee.misc || 0);
                          return tuition + activity + transport + hostel + misc;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            const newFees = (formData.classFees || []).filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          className="text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scholarships / Concessions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Scholarships / Concessions</h3>
              <button
                type="button"
                onClick={() => {
                  const newScholarships = [...(formData.scholarships || []), { name: '', type: '', amount: '', documentsRequired: [] }];
                  setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                }}
                className="flex items-center text-sm text-indigo-600"
              >
                <PlusCircle size={16} className="mr-1" /> Add Scholarship
              </button>
            </div>
            
            <div className="space-y-4">
              {(formData.scholarships || []).map((scholarship, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Name *</label>
                      <input
                        type="text"
                        value={scholarship.name || ''}
                        onChange={(e) => {
                          const newScholarships = [...(formData.scholarships || [])];
                          newScholarships[index] = { ...newScholarships[index], name: e.target.value };
                          setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                        }}
                        placeholder="e.g., Merit Scholarship, Sports Excellence Award"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <select
                        value={scholarship.type || ''}
                        onChange={(e) => {
                          const newScholarships = [...(formData.scholarships || [])];
                          newScholarships[index] = { ...newScholarships[index], type: e.target.value };
                          setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select type</option>
                        <option value="Merit">Merit</option>
                        <option value="Need-based">Need-based</option>
                        <option value="Sports">Sports</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Staff">Staff</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                      <input
                        type="number"
                        value={scholarship.amount || ''}
                        onChange={(e) => {
                          const newScholarships = [...(formData.scholarships || [])];
                          newScholarships[index] = { ...newScholarships[index], amount: e.target.value };
                          setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                        }}
                        placeholder="e.g., 5000, 10000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Documents Required (Optional)</label>
                      <input
                        type="text"
                        value={(scholarship.documentsRequired || []).join(', ')}
                        onChange={(e) => {
                          const newScholarships = [...(formData.scholarships || [])];
                          const docs = e.target.value.split(',').map(d => d.trim()).filter(Boolean);
                          newScholarships[index] = { ...newScholarships[index], documentsRequired: docs };
                          setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                        }}
                        placeholder="Leave empty or enter: Income certificate, Mark sheet (comma-separated)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        const newScholarships = (formData.scholarships || []).filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                      }}
                      className="text-red-500 text-sm"
                    >
                      <Trash2 size={16} className="inline mr-1" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fees Visualization */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Visualization: Fee Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Transparency</div>
                <div className={`text-lg font-semibold ${
                  formData.feesTransparency === 'full' ? 'text-green-600' :
                  formData.feesTransparency === 'partial' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {formData.feesTransparency === 'full' ? '🟢 Full' :
                   formData.feesTransparency === 'partial' ? '🟡 Partial' : '🔴 Low'}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Classes</div>
                <div className="text-lg font-semibold text-gray-900">{(formData.classFees || []).length}</div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Scholarships</div>
                <div className="text-lg font-semibold text-gray-900">{(formData.scholarships || []).length}</div>
              </div>
            </div>
          </div>
            </div>

            <div className="block" id="technology">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    💻 Technology Adoption
                  </h2>
                  <p className="text-gray-600 mt-1">Smart classrooms and digital infrastructure</p>
                </div>
              </div>
          <div className="space-y-8">
            {/* Smart Classrooms Percentage */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Smart Classrooms</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smart Classrooms Percentage
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.smartClassroomsPercentage || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, smartClassroomsPercentage: e.target.value }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>0%</span>
                  <span className="font-semibold text-indigo-600">{formData.smartClassroomsPercentage || 0}%</span>
                  <span>100%</span>
          </div>
                <p className="text-xs text-gray-500 mt-2">
                  Percentage of classrooms equipped with smart technology (interactive boards, projectors, etc.)
                </p>
              </div>
            </div>

            {/* E-Learning Platforms */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">E-Learning Platforms</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available E-Learning Platforms
                </label>
                <div className="space-y-3">
                  {(formData.eLearningPlatforms || []).map((platform, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={platform}
                        onChange={(e) => {
                          const next = [...(formData.eLearningPlatforms || [])];
                          next[index] = e.target.value;
                          setFormData(prev => ({ ...prev, eLearningPlatforms: next }));
                        }}
                        placeholder="Platform name (e.g., Google Classroom, Zoom, Microsoft Teams)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...(formData.eLearningPlatforms || [])];
                          next.splice(index, 1);
                          setFormData(prev => ({ ...prev, eLearningPlatforms: next }));
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
          </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...(formData.eLearningPlatforms || []), ''];
                      setFormData(prev => ({ ...prev, eLearningPlatforms: next }));
                    }}
                    className="flex items-center text-sm text-indigo-600"
                  >
                    <PlusCircle size={16} className="mr-1" /> Add Platform
                  </button>
            </div>
                <p className="text-xs text-gray-500 mt-2">
                  List all e-learning platforms used by the school (LMS, video conferencing, etc.)
                </p>
              </div>
            </div>

            {/* Technology Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 text-center">
                <div className="text-indigo-600 text-sm font-medium mb-2">Smart Classrooms</div>
                <div className="text-3xl font-bold text-indigo-700">{formData.smartClassroomsPercentage || 0}%</div>
                <div className="text-xs text-indigo-600 mt-1">of classrooms are smart-enabled</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-600 text-sm font-medium mb-2">E-Learning Platforms</div>
                <div className="text-3xl font-bold text-green-700">{formData.eLearningPlatforms?.length || 0}</div>
                <div className="text-xs text-green-600 mt-1">platforms in use</div>
              </div>
            </div>
          </div>
            </div>

            <div className="block" id="academics">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-slate-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-slate-500 to-gray-500 rounded-xl shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
                    🎓 Academics
                  </h2>
                  <p className="text-gray-600 mt-1">Academic performance and exam results</p>
                </div>
              </div>

          {/* Academics - Backend aligned inputs */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Average Class 10 Result (%)"
                name="averageClass10Result"
                type="number"
                value={formData.averageClass10Result}
                onChange={handleInputChange}
              />
              <FormField
                label="Average Class 12 Result (%)"
                name="averageClass12Result"
                type="number"
                value={formData.averageClass12Result}
                onChange={handleInputChange}
              />
              <FormField
                label="Average School Marks (%)"
                name="averageSchoolMarks"
                type="number"
                value={formData.averageSchoolMarks}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mt-6">
              <FormField
                label="Special Exams Training"
                name="specialExamsTraining"
                type="checkboxGroup"
                options={[
                  'NEET','IIT-JEE','Olympiads','UPSC','CLAT','SAT/ACT','NTSE','KVPY'
                ]}
                value={formData.specialExamsTraining}
                onChange={handleCheckboxChange}
              />
            </div>

            <div className="mt-6">
              <FormField
                label="Extra Curricular Activities"
                name="extraCurricularActivities"
                type="checkboxGroup"
                options={[
                  'Sports','Music','Dance','Drama','Art','Debate','NCC','NSS','Coding','Robotics'
                ]}
                value={formData.extraCurricularActivities}
                onChange={handleCheckboxChange}
              />
            </div>
          </div>

          {/* Board Results and Exam Qualifiers removed - not in backend schema */}
            </div>

            <div className="block" id="international">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg">
                  <Globe2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    🌍 International Exposure
                  </h2>
                  <p className="text-gray-600 mt-1">Global programs and partnerships</p>
                </div>
              </div>

          {/* Exchange Programs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Exchange Programs</h3>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  exchangePrograms: [...(prev.exchangePrograms || []), { partnerSchool: '', type: '', duration: '', studentsParticipated: '', activeSince: '' }]
                }))}
                className="flex items-center text-sm text-indigo-600"
              >
                <PlusCircle size={16} className="mr-1" /> Add Program
              </button>
            </div>
            <div className="space-y-3">
              {(formData.exchangePrograms || []).map((prog, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-gray-50 p-4 rounded-md">
                  <FormField
                    label="Partner School"
                    name={`ex-partner-${index}`}
                    value={prog.partnerSchool}
                    onChange={(e) => {
                      const list = [...(formData.exchangePrograms || [])];
                      list[index] = { ...list[index], partnerSchool: e.target.value };
                      setFormData(prev => ({ ...prev, exchangePrograms: list }));
                    }}
                  />
                  <FormField
                    label="Type"
                    name={`ex-type-${index}`}
                    type="select"
                    options={['Student Exchange', 'Faculty Exchange', 'Summer Program', 'Joint Research', 'Cultural Exchange']}
                    value={prog.type}
                    onChange={(e) => {
                      const list = [...(formData.exchangePrograms || [])];
                      list[index] = { ...list[index], type: e.target.value };
                      setFormData(prev => ({ ...prev, exchangePrograms: list }));
                    }}
                  />
                  <FormField
                    label="Duration"
                    name={`ex-duration-${index}`}
                    type="select"
                    options={['2 Weeks', '1 Month', '3 Months', '6 Months', '1 Year']}
                    value={prog.duration}
                    onChange={(e) => {
                      const list = [...(formData.exchangePrograms || [])];
                      list[index] = { ...list[index], duration: e.target.value };
                      setFormData(prev => ({ ...prev, exchangePrograms: list }));
                    }}
                  />
                  <FormField
                    label="Students"
                    name={`ex-students-${index}`}
                    type="number"
                    value={prog.studentsParticipated}
                    onChange={(e) => {
                      const list = [...(formData.exchangePrograms || [])];
                      list[index] = { ...list[index], studentsParticipated: e.target.value };
                      setFormData(prev => ({ ...prev, exchangePrograms: list }));
                    }}
                  />
                  <div className="flex items-end gap-2">
                    <FormField
                      label="Active Since"
                      name={`ex-active-${index}`}
                      value={prog.activeSince}
                      onChange={(e) => {
                        const list = [...(formData.exchangePrograms || [])];
                        list[index] = { ...list[index], activeSince: e.target.value };
                        setFormData(prev => ({ ...prev, exchangePrograms: list }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, exchangePrograms: (prev.exchangePrograms || []).filter((_, i) => i !== index) }))}
                      className="text-red-500 mb-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Tie-ups */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Global Tie-ups</h3>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  globalTieUps: [...(prev.globalTieUps || []), { partnerName: '', nature: '', activeSince: '', description: '' }]
                }))}
                className="flex items-center text-sm text-indigo-600"
              >
                <PlusCircle size={16} className="mr-1" /> Add Tie-up
              </button>
            </div>
            <div className="space-y-3">
              {(formData.globalTieUps || []).map((tie, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-md">
                  <FormField
                    label="Partner Name"
                    name={`gt-name-${index}`}
                    value={tie.partnerName}
                    onChange={(e) => {
                      const list = [...(formData.globalTieUps || [])];
                      list[index] = { ...list[index], partnerName: e.target.value };
                      setFormData(prev => ({ ...prev, globalTieUps: list }));
                    }}
                  />
                  <FormField
                    label="Nature"
                    name={`gt-nature-${index}`}
                    type="select"
                    options={['Memorandum of Understanding (MoU)', 'Research Collaboration', 'Curriculum Development', 'Faculty Training']}
                    value={tie.nature}
                    onChange={(e) => {
                      const list = [...(formData.globalTieUps || [])];
                      list[index] = { ...list[index], nature: e.target.value };
                      setFormData(prev => ({ ...prev, globalTieUps: list }));
                    }}
                  />
                  <FormField
                    label="Active Since"
                    name={`gt-active-${index}`}
                    value={tie.activeSince}
                    onChange={(e) => {
                      const list = [...(formData.globalTieUps || [])];
                      list[index] = { ...list[index], activeSince: e.target.value };
                      setFormData(prev => ({ ...prev, globalTieUps: list }));
                    }}
                  />
                  <div className="md:col-span-2 grid grid-cols-1 items-end gap-2">
                    <FormField
                      label="Description"
                      name={`gt-desc-${index}`}
                      value={tie.description}
                      onChange={(e) => {
                        const list = [...(formData.globalTieUps || [])];
                        list[index] = { ...list[index], description: e.target.value };
                        setFormData(prev => ({ ...prev, globalTieUps: list }));
                      }}
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, globalTieUps: (prev.globalTieUps || []).filter((_, i) => i !== index) }))}
                        className="text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </div>

            <div className="block" id="diversity">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    ♡ Diversity & Inclusivity
                  </h2>
                  <p className="text-gray-600 mt-1">Inclusive policies and support systems</p>
                </div>
              </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Gender Ratio - Male (%)"
              name="genderRatioMale"
              type="number"
              value={formData.genderRatioMale}
              onChange={handleInputChange}
            />
            <FormField
              label="Gender Ratio - Female (%)"
              name="genderRatioFemale"
              type="number"
              value={formData.genderRatioFemale}
              onChange={handleInputChange}
            />
            <FormField
              label="Gender Ratio - Others (%)"
              name="genderRatioOthers"
              type="number"
              value={formData.genderRatioOthers}
              onChange={handleInputChange}
            />
          </div>

          <div className="mt-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">Scholarship Diversity Types</label>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Merit', 'Socio-economic', 'Cultural', 'Sports', 'Community', 'Academic Excellence'].map(opt => (
                  <label key={opt} className="flex items-center p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="scholarshipDiversityTypes"
                    value={opt}
                    checked={(formData.scholarshipDiversityTypes || []).includes(opt)}
                    onChange={handleCheckboxChange}
                      className="h-5 w-5 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                  />
                    <span className="ml-3 text-gray-700 font-medium">{opt}</span>
                </label>
              ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">Scholarship Coverage (%)</label>
              <input
              type="number"
                name="scholarshipDiversityCoverage"
              value={formData.scholarshipDiversityCoverage}
              onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="Enter coverage percentage"
            />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">Special Needs Support</label>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                <label className="flex items-center p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="specialNeedsStaff"
                    checked={formData.specialNeedsStaff}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialNeedsStaff: e.target.checked }))}
                    className="h-5 w-5 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Dedicated Staff Available</span>
                </label>
                <div className="flex items-center space-x-4">
                  <label className="block text-sm font-medium text-gray-600">
                    Students Supported (%)
                  </label>
                  <input
                  type="number"
                    name="specialNeedsSupportPercentage"
                  value={formData.specialNeedsSupportPercentage}
                  onChange={handleInputChange}
                    className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">Facilities Available</label>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                    {['Ramps', 'Wheelchair access', 'Special educators', 'Learning support', 'Resource room', 'Assistive devices'].map(opt => (
                  <label key={opt} className="flex items-center p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          name="specialNeedsFacilities"
                          value={opt}
                          checked={(formData.specialNeedsFacilities || []).includes(opt)}
                          onChange={handleCheckboxChange}
                      className="h-5 w-5 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                    <span className="ml-3 text-gray-700 font-medium">{opt}</span>
                      </label>
                    ))}
              </div>
            </div>
          </div>
            </div>

            <div className="block" id="admission">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl shadow-lg">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    📅 Admission Process Timeline
                  </h2>
                  <p className="text-gray-600 mt-1">Define admission timelines with dates, eligibility, and required documents</p>
                </div>
              </div>

              <div className="space-y-6">
                {admissionSteps.map((timeline, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Timeline Entry {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const next = admissionSteps.filter((_, i) => i !== index);
                          setAdmissionSteps(next);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label={`Remove timeline ${index + 1}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Admission Start Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admission Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={timeline.admissionStartDate || ''}
                      onChange={(e) => {
                        const next = admissionSteps.slice();
                            next[index] = { ...next[index], admissionStartDate: e.target.value };
                        setAdmissionSteps(next);
                      }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {/* Admission End Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admission End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={timeline.admissionEndDate || ''}
                      onChange={(e) => {
                        const next = admissionSteps.slice();
                            next[index] = { ...next[index], admissionEndDate: e.target.value };
                        setAdmissionSteps(next);
                      }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          min={timeline.admissionStartDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={timeline.status || ''}
                        onChange={(e) => {
                          const next = admissionSteps.slice();
                            next[index] = { ...next[index], status: e.target.value };
                          setAdmissionSteps(next);
                        }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Status</option>
                          <option value="Ongoing">Ongoing</option>
                          <option value="Ended">Ended</option>
                          <option value="Starting Soon">Starting Soon</option>
                        </select>
                      </div>

                      {/* Admission Level */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admission Level <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={timeline.admissionLevel || ''}
                          onChange={(e) => {
                            const next = admissionSteps.slice();
                            next[index] = { ...next[index], admissionLevel: e.target.value };
                            setAdmissionSteps(next);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Level</option>
                          <option value="KGs">KGs</option>
                          <option value="Grade 1 - 5">Grade 1 - 5</option>
                          <option value="Grade 6-10">Grade 6-10</option>
                        </select>
                      </div>

                      {/* Age Criteria */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age Criteria
                        </label>
                        <input
                        type="text"
                          placeholder="e.g., Child must be 3 years old by June 1, 2026"
                          value={timeline.ageCriteria || ''}
                        onChange={(e) => {
                          const next = admissionSteps.slice();
                            next[index] = { ...next[index], ageCriteria: e.target.value };
                          setAdmissionSteps(next);
                        }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      {/* Other Info */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Other Eligibility Information
                        </label>
                        <textarea
                          placeholder="Any other eligibility information..."
                          value={timeline.otherInfo || ''}
                          onChange={(e) => {
                            const next = admissionSteps.slice();
                            next[index] = { ...next[index], otherInfo: e.target.value };
                            setAdmissionSteps(next);
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      {/* Documents Required */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Documents Required
                        </label>
                        <div className="space-y-2">
                          {(timeline.documentsRequired || []).map((doc, docIndex) => (
                            <div key={docIndex} className="flex items-center gap-2">
                        <input
                                type="text"
                                value={doc}
                          onChange={(e) => {
                            const next = admissionSteps.slice();
                                  const nextDocs = [...(next[index].documentsRequired || [])];
                                  nextDocs[docIndex] = e.target.value;
                                  next[index] = { ...next[index], documentsRequired: nextDocs };
                            setAdmissionSteps(next);
                          }}
                                placeholder="Document name"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const next = admissionSteps.slice();
                                  const nextDocs = [...(next[index].documentsRequired || [])];
                                  nextDocs.splice(docIndex, 1);
                                  next[index] = { ...next[index], documentsRequired: nextDocs };
                                  setAdmissionSteps(next);
                                }}
                                className="text-red-500 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                      </div>
                          ))}
                      <button
                        type="button"
                        onClick={() => {
                              const next = admissionSteps.slice();
                              const nextDocs = [...(next[index].documentsRequired || []), ''];
                              next[index] = { ...next[index], documentsRequired: nextDocs };
                          setAdmissionSteps(next);
                        }}
                className="flex items-center text-sm text-indigo-600"
                      >
                            <PlusCircle size={16} className="mr-1" /> Add Document
                      </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setAdmissionSteps([...admissionSteps, {
                    admissionStartDate: '',
                    admissionEndDate: '',
                    status: '',
                    admissionLevel: '',
                    ageCriteria: '',
                    otherInfo: '',
                    documentsRequired: []
                  }])}
                  className="mt-4 flex items-center text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200"
                >
                  <PlusCircle size={16} className="mr-2" /> Add Timeline Entry
                </button>
              </div>
            </div>

            <div className="block" id="media">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl shadow-lg">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    📸 Media
                  </h2>
                  <p className="text-gray-600 mt-1">Photos and videos showcasing your school</p>
                </div>
              </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Photos (4–5 recommended, max 5)</label>
              <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="mt-2" />
              {selectedPhotos?.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">{selectedPhotos.length} selected</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Video (max 20MB)</label>
              <input type="file" accept="video/*" onChange={handleVideoChange} className="mt-2" />
              {selectedVideo && (
                <div className="mt-2 text-sm text-gray-600">{selectedVideo.name}</div>
              )}
            </div>
          </div>
          </div>
          </div>

          <div className="sticky bottom-0 -mx-6 px-6 py-6 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={saveDraft} 
                className="px-6 py-3 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-semibold text-gray-700"
              >
                💾 Save Draft
              </button>
              <button 
                type="button" 
                onClick={clearDraft} 
                className="px-4 py-3 rounded-xl border-2 border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-semibold text-red-700"
              >
                🗑️ Clear Draft
              </button>
              <button 
                type="button" 
                disabled={isFirst} 
                onClick={goPrev} 
                className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isFirst 
                    ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' 
                    : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-400 hover:shadow-lg'
                }`}
              >
                ← Previous Slide
              </button>
              {!isLast ? (
                <button 
                  type="button" 
                  onClick={goNext} 
                  className="flex-1 px-6 py-4 font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
                >
                  Next Slide →
                </button>
              ) : (
                <button
                  type="submit"
                  className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-[1.01]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {hasExistingSchool ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    hasExistingSchool ? 'Update School Profile' : 'Submit Registration'
                  )}
                </button>
              )}
            </div>
          </div>
          </div>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
