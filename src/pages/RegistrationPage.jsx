import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "../api/axios";
import { 
  addSchool, 
  addAmenities, 
  addActivities, 
  addAlumni, 
  addInfrastructure, 
  addOtherDetails, 
  addFeesAndScholarships 
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
      "w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500",
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
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {renderInput()}
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
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddItem}
        className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
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
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddActivity}
        className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
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
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddAmenity}
        className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
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
            className="text-red-500 hover:text-red-700 mb-2"
            aria-label={`Remove e-learning row ${index + 1}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
      >
        <PlusCircle size={16} className="mr-1" /> Add Platform
      </button>
    </div>
  );
};

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State with all the fields required by the backend schema
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    board: "",
    feeRange: "",
    upto: "",
    email: "",
    website: "",
    phoneNo: "",
    genderType: "co-ed",
    schoolMode: "day",
    shifts: "morning",
    languageMedium: "english",
    predefinedAmenities: [],
    activities: [],
    transportAvailable: "no",
    latitude: "",
    longitude: "",
    studentsPerTeacher: "", // numeric derived from ratio
    teacherStudentRatio: "", // string input e.g., 1:20
    // Infrastructure fields
    infraLabTypes: [],
    infraLibraryBooks: "",
    infraSportsTypes: [],
    infraSmartClassrooms: "",
    // Safety & Security fields
    safetyCCTV: "",
    safetyDoctorAvailability: "",
    safetyNurseAvailable: false,
    safetyNurseTimings: "",
    safetyTransportRoutes: [], // [{ route: string, attendant: boolean }]
    safetyGPSTracking: false,
    safetyDriverVerification: false,
    // Fees & Affordability fields
    feesTransparency: "partial", // "full", "partial", "low"
    classWiseFees: [], // [{ class: string, tuition: number, activity: number, transport: number, hostel: number, misc: number }]
    scholarships: [], // [{ type: string, eligibility: string, reduction: string, description: string }]
    // Diversity & Inclusivity fields
    genderRatioMale: "",
    genderRatioFemale: "",
    genderRatioOthers: "",
    scholarshipDiversityTypes: [], // ["Merit", "Sports", "Socio-economic", "Community", etc.]
    scholarshipDiversityCoverage: "", // percentage
    specialNeedsStaff: false,
    specialNeedsFacilities: [], // ["Ramps", "Special educators", "Resource room", "Assistive devices"]
    specialNeedsSupportPercentage: "",
    // Parent Reviews fields
    reviewsEnabled: true,
    reviewModeration: "ai", // "ai", "admin", "none"
    reviewVerificationRequired: true,
    reviewAnonymityOption: true,
    reviewMediaUpload: false,
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    highlightedReviews: [], // [{ id, rating, comment, parentName, grade, verified, helpful, date }]
    recentReviews: [], // [{ id, rating, comment, parentName, grade, verified, helpful, date }]
    // Technology Adoption fields
    smartClassroomsPercentage: "", // Percentage of classrooms equipped with smart tech
    elearningPlatforms: [], // [{ platform: string, usagePercentage: string, frequency: string }]
    digitalAdoptionIndex: 0, // Calculated score
    techAdoptionYear: "", // Year when technology adoption started
    lastTechUpgrade: "", // Year of last major technology upgrade
    // International Exposure fields
    exchangePrograms: [], // [{ partnerSchool: string, country: string, type: string, duration: string, studentsParticipated: string, activeSince: string }]
    globalTieups: [], // [{ partnerName: string, nature: string, activeSince: string, description: string }]
    successStories: [], // [{ title: string, description: string, year: string, studentsBenefited: string }]
    internationalPhotos: [], // Array of photo URLs from exchange visits
    studentsBenefitingPercentage: "", // Percentage of students benefiting from international exposure
  });

  const [famousAlumnies, setFamousAlumnies] = useState([]);
  const [topAlumnies, setTopAlumnies] = useState([]);
  const [otherAlumnies, setOtherAlumnies] = useState([]);
  const [customActivities, setCustomActivities] = useState([]);
  const [customAmenities, setCustomAmenities] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [facultyQuality, setFacultyQuality] = useState([
    { name: '', qualification: '', awards: '', experience: '' }
  ]);
  // Academics (frontend-only; backend fields not present yet)
  const [academicResults, setAcademicResults] = useState([
    { year: new Date().getFullYear() - 2, passPercent: '', averageMarksPercent: '' },
    { year: new Date().getFullYear() - 1, passPercent: '', averageMarksPercent: '' },
    { year: new Date().getFullYear(), passPercent: '', averageMarksPercent: '' },
  ]);
  const [examQualifiers, setExamQualifiers] = useState([]); // { year, exam, participation }

  // Faculty Quality array: each entry will contain { name, qualification, awards, experience }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling: keep ratio and numeric in sync
    if (name === 'teacherStudentRatio') {
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
      setFormData((prev) => ({ ...prev, teacherStudentRatio: value, studentsPerTeacher: students }));
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

      const payload = {
        ...formData,
        schoolMode: normalizedSchoolMode,
        genderType: normalizedGender,
        feeRange: normalizedFeeRange,
        shifts: Array.isArray(formData.shifts) ? formData.shifts : [formData.shifts].filter(Boolean),
        languageMedium: Array.isArray(formData.languageMedium) ? formData.languageMedium : [formData.languageMedium].filter(Boolean),
        mobileNo: formData.phoneNo,
        pinCode: formData.pincode ? Number(formData.pincode) : undefined,
        famousAlumnies,
        topAlumnies,
        otherAlumnies,
        authId: currentUser._id,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        // normalize ratio -> always store as 1:NN and numeric
        ...(function() {
          const raw = (formData.teacherStudentRatio || '').trim();
          let stud = formData.studentsPerTeacher;
          if (raw) {
            const parts = raw.split(':').map(p => p.trim());
            if (parts.length === 2) {
              const t = Number(parts[0]);
              const s = Number(parts[1]);
              if (!Number.isNaN(t) && t > 0 && !Number.isNaN(s) && s > 0) {
                stud = String(s);
              }
            } else if (/^\d+$/.test(raw)) {
              stud = raw;
            }
          }
          const studNum = stud ? Number(stud) : undefined;
          const ratioStr = studNum ? `1:${studNum}` : undefined;
          return {
            studentsPerTeacher: studNum,
            teacherStudentRatio: ratioStr,
            // Backend expects capitalized field name
            TeacherToStudentRatio: ratioStr,
          };
        })(),
        // merge customAmenities into predefinedAmenities array
        ...(function() {
          const customAmens = customAmenities.filter(Boolean);
          const baseAmens = Array.isArray(formData.predefinedAmenities) ? formData.predefinedAmenities : [];
          const merged = [...baseAmens, ...customAmens];
          return { predefinedAmenities: merged };
        })(),
        // merge customActivities into activities array
        ...(function() {
          const customActs = customActivities.filter(Boolean);
          const baseActs = Array.isArray(formData.activities) ? formData.activities : [];
          const merged = [...baseActs, ...customActs];
          return { activities: merged };
        })(),
        // ensure numeric faculty fields
        ...(function() {
          const avgTeachingExperience = formData.avgTeachingExperience !== "" ? Number(formData.avgTeachingExperience) : undefined;
          const mastersPercent = formData.mastersPercent !== "" ? Number(formData.mastersPercent) : undefined;
          const phdPercent = formData.phdPercent !== "" ? Number(formData.phdPercent) : undefined;
          const primaryFacultyName = (formData.primaryFacultyName || '').trim() || undefined;
          const facultyQualityClean = (facultyQuality || []).map(item => ({
            name: (item?.name || '').trim(),
            qualification: (item?.qualification || '').trim(),
            awards: (item?.awards || '').trim(),
            experience: item?.experience !== '' ? Number(item?.experience) : undefined,
          })).filter(i => i.name || i.qualification || i.awards || i.experience !== undefined);
          const infraLibraryBooks = formData.infraLibraryBooks !== '' ? Number(formData.infraLibraryBooks) : undefined;
          const infraSmartClassrooms = formData.infraSmartClassrooms !== '' ? Number(formData.infraSmartClassrooms) : undefined;
          const infraLabTypes = Array.isArray(formData.infraLabTypes) ? formData.infraLabTypes : [];
          const infraSportsTypes = Array.isArray(formData.infraSportsTypes) ? formData.infraSportsTypes : [];
          const safetyCCTV = formData.safetyCCTV !== '' ? Number(formData.safetyCCTV) : undefined;
          const safetyDoctorAvailability = (formData.safetyDoctorAvailability || '').trim() || undefined;
          const safetyNurseAvailable = !!formData.safetyNurseAvailable;
          const safetyNurseTimings = (formData.safetyNurseTimings || '').trim() || undefined;
          const safetyTransportRoutes = (Array.isArray(formData.safetyTransportRoutes) ? formData.safetyTransportRoutes : []).map(r => ({
            route: (r?.route || '').trim(),
            attendant: !!r?.attendant,
          })).filter(r => r.route);
          const safetyGPSTracking = !!formData.safetyGPSTracking;
          const safetyDriverVerification = !!formData.safetyDriverVerification;
          const feesTransparency = (formData.feesTransparency || '').trim() || undefined;
          const classWiseFees = (Array.isArray(formData.classWiseFees) ? formData.classWiseFees : []).map(fee => ({
            class: (fee?.class || '').trim(),
            tuition: fee?.tuition ? Number(fee.tuition) : 0,
            activity: fee?.activity ? Number(fee.activity) : 0,
            transport: fee?.transport ? Number(fee.transport) : 0,
            hostel: fee?.hostel ? Number(fee.hostel) : 0,
            misc: fee?.misc ? Number(fee.misc) : 0,
          })).filter(fee => fee.class);
          const scholarships = (Array.isArray(formData.scholarships) ? formData.scholarships : []).map(sch => ({
            type: (sch?.type || '').trim(),
            eligibility: (sch?.eligibility || '').trim(),
            reduction: (sch?.reduction || '').trim(),
            description: (sch?.description || '').trim(),
          })).filter(sch => sch.type || sch.eligibility || sch.reduction);
          const genderRatioMale = formData.genderRatioMale !== '' ? Number(formData.genderRatioMale) : undefined;
          const genderRatioFemale = formData.genderRatioFemale !== '' ? Number(formData.genderRatioFemale) : undefined;
          const genderRatioOthers = formData.genderRatioOthers !== '' ? Number(formData.genderRatioOthers) : undefined;
          const scholarshipDiversityTypes = Array.isArray(formData.scholarshipDiversityTypes) ? formData.scholarshipDiversityTypes : [];
          const scholarshipDiversityCoverage = formData.scholarshipDiversityCoverage !== '' ? Number(formData.scholarshipDiversityCoverage) : undefined;
          const specialNeedsStaff = !!formData.specialNeedsStaff;
          const specialNeedsFacilities = Array.isArray(formData.specialNeedsFacilities) ? formData.specialNeedsFacilities : [];
          const specialNeedsSupportPercentage = formData.specialNeedsSupportPercentage !== '' ? Number(formData.specialNeedsSupportPercentage) : undefined;
          const reviewsEnabled = !!formData.reviewsEnabled;
          const reviewModeration = (formData.reviewModeration || '').trim() || undefined;
          const reviewVerificationRequired = !!formData.reviewVerificationRequired;
          const reviewAnonymityOption = !!formData.reviewAnonymityOption;
          const reviewMediaUpload = !!formData.reviewMediaUpload;
          const averageRating = formData.averageRating !== '' ? Number(formData.averageRating) : undefined;
          const totalReviews = formData.totalReviews !== '' ? Number(formData.totalReviews) : undefined;
          const ratingBreakdown = formData.ratingBreakdown || {};
          const highlightedReviews = (Array.isArray(formData.highlightedReviews) ? formData.highlightedReviews : []).map(review => ({
            id: review.id,
            rating: Number(review.rating || 0),
            comment: (review.comment || '').trim(),
            parentName: (review.parentName || '').trim(),
            grade: (review.grade || '').trim(),
            verified: !!review.verified,
            helpful: Number(review.helpful || 0),
            date: (review.date || '').trim(),
          })).filter(review => review.comment || review.parentName);
          const recentReviews = (Array.isArray(formData.recentReviews) ? formData.recentReviews : []).map(review => ({
            id: review.id,
            rating: Number(review.rating || 0),
            comment: (review.comment || '').trim(),
            parentName: (review.parentName || '').trim(),
            grade: (review.grade || '').trim(),
            verified: !!review.verified,
            helpful: Number(review.helpful || 0),
            date: (review.date || '').trim(),
          })).filter(review => review.comment || review.parentName);
          return {
            avgTeachingExperience,
            mastersPercent,
            phdPercent,
            primaryFacultyName,
            facultyQuality: facultyQualityClean,
            infraLabTypes,
            infraSportsTypes,
            infraLibraryBooks,
            infraSmartClassrooms,
            safetyCCTV,
            safetyDoctorAvailability,
            safetyNurseAvailable,
            safetyNurseTimings,
            safetyTransportRoutes,
            safetyGPSTracking,
            safetyDriverVerification,
            feesTransparency,
            classWiseFees,
            scholarships,
            genderRatioMale,
            genderRatioFemale,
            genderRatioOthers,
            scholarshipDiversityTypes,
            scholarshipDiversityCoverage,
            specialNeedsStaff,
            specialNeedsFacilities,
            specialNeedsSupportPercentage,
            reviewsEnabled,
            reviewModeration,
            reviewVerificationRequired,
            reviewAnonymityOption,
            reviewMediaUpload,
            averageRating,
            totalReviews,
            ratingBreakdown,
            highlightedReviews,
            recentReviews,
          };
        })(),
      };
      delete payload.phoneNo;
      delete payload.pincode;

      // Create school first
      const schoolResponse = await addSchool(payload);
      const schoolId = schoolResponse.data.data._id;
      try { localStorage.setItem('lastCreatedSchoolId', String(schoolId)); } catch (_) {}

      // Create related data in parallel
      const promises = [];

      // Add amenities if any
      if (payload.predefinedAmenities && payload.predefinedAmenities.length > 0) {
        promises.push(addAmenities({
          schoolId,
          amenities: payload.predefinedAmenities
        }));
      }

      // Add activities if any
      if (payload.activities && payload.activities.length > 0) {
        promises.push(addActivities({
          schoolId,
          activities: payload.activities
        }));
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

      // Add infrastructure if any
      if (payload.infraLabTypes?.length > 0 || payload.infraLibraryBooks || payload.infraSportsTypes?.length > 0 || payload.infraSmartClassrooms) {
        promises.push(addInfrastructure({
          schoolId,
          labTypes: payload.infraLabTypes,
          libraryBooks: payload.infraLibraryBooks,
          sportsTypes: payload.infraSportsTypes,
          smartClassrooms: payload.infraSmartClassrooms
        }));
      }

      // Add fees and scholarships if any (normalize to backend schema)
      if (payload.classWiseFees?.length > 0 || payload.scholarships?.length > 0) {
        // Map classWiseFees -> classFees expected by backend
        const classFees = (payload.classWiseFees || [])
          .map((f) => ({
            className: String(f.class || f.className || '').trim(),
            tuition: Number(f.tuition || 0),
            activity: Number(f.activity || 0),
            transport: Number(f.transport || 0),
            hostel: Number(f.hostel || 0),
            misc: Number(f.misc || 0)
          }))
          .filter((f) => f.className && !Number.isNaN(f.tuition));

        // Allowed scholarship types per backend enum
        const allowedScholarshipTypes = new Map([
          ['merit','Merit'],
          ['merit based','Merit'],
          ['merit-based','Merit'],
          ['merit based scholarship','Merit'],
          ['socio-economic','Socio-economic'],
          ['socio economic','Socio-economic'],
          ['cultural','Cultural'],
          ['sports','Sports'],
          ['community','Community'],
          ['academic excellence','Academic Excellence'],
          ['academic','Academic Excellence']
        ]);

        const normalizeType = (val) => {
          const key = String(val || '').trim().toLowerCase();
          return allowedScholarshipTypes.get(key) || null;
        };

        const scholarships = (payload.scholarships || [])
          .map((s) => ({
            name: String(s.name || '').trim(),
            amount: Number(s.amount || s.value || 0),
            type: normalizeType(s.type),
            documentsRequired: Array.isArray(s.documentsRequired) ? s.documentsRequired : []
          }))
          .filter((s) => s.name && !Number.isNaN(s.amount) && s.type);

        if (classFees.length > 0 || scholarships.length > 0) {
          promises.push(addFeesAndScholarships({
            schoolId,
            classFees,
            scholarships
          }));
        }
      }

      // Add other details (safety, faculty, etc.)
      if (payload.safetyCCTV || payload.safetyDoctorAvailability || payload.facultyQuality?.length > 0 || 
          payload.genderRatioMale || payload.genderRatioFemale || payload.genderRatioOthers ||
          payload.scholarshipDiversityTypes?.length > 0 || payload.specialNeedsStaff) {
        promises.push(addOtherDetails({
          schoolId,
          // Required gender ratio fields
          genderRatio: {
            male: payload.genderRatioMale || 0,
            female: payload.genderRatioFemale || 0,
            others: payload.genderRatioOthers || 0
          },
          // Scholarship diversity
          scholarshipDiversity: {
            types: payload.scholarshipDiversityTypes || [],
            studentsCoveredPercentage: payload.scholarshipDiversityCoverage || 0
          },
          // Special needs support
          specialNeedsSupport: {
            dedicatedStaff: payload.specialNeedsStaff || false,
            studentsSupportedPercentage: payload.specialNeedsSupportPercentage || 0,
            facilitiesAvailable: payload.specialNeedsFacilities || []
          }
        }));
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
        "School Registration Successful! Your profile is pending approval."
      );
      navigate("/school-portal/profile-view");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
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

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg space-y-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            School Registration
          </h1>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Basic Information
            </h2>
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
                name="teacherStudentRatio"
                type="text"
                value={formData.teacherStudentRatio}
                onChange={handleInputChange}
              />
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  label="Latitude (GPS)"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Longitude (GPS)"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="h-10 mt-7 bg-indigo-600 text-white rounded-md px-4 hover:bg-indigo-700"
                >
                  Use Current Location
                </button>
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
          </div>

          {/* Amenities & Activities */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Amenities & Activities</h2>
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
          </div>

          {/* Alumni Information */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Alumni Information</h2>
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
          </div>

          

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Faculty Quality
          </h2>
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
                  className="text-red-500 hover:text-red-700 mb-2"
                  aria-label={`Remove faculty row ${index + 1}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFacultyQuality([...facultyQuality, { name: '', qualification: '', awards: '', experience: '' }])}
              className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <PlusCircle size={16} className="mr-1" /> Add Faculty
            </button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Infrastructure</h2>
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

        {/* Safety & Security Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Safety & Security</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CCTV Coverage - %</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                name="safetyCCTV"
                value={formData.safetyCCTV || 0}
                onChange={handleInputChange}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{formData.safetyCCTV || 0}% coverage</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Availability</label>
              <select
                name="safetyDoctorAvailability"
                value={formData.safetyDoctorAvailability}
                onChange={handleInputChange}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select availability</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="On-call">On-call</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nurse Availability</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="safetyNurseAvailable"
                    checked={formData.safetyNurseAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, safetyNurseAvailable: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Yes</span>
                </label>
                <input
                  type="text"
                  name="safetyNurseTimings"
                  value={formData.safetyNurseTimings}
                  onChange={handleInputChange}
                  placeholder="Timings (e.g., 9am - 5pm)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transport Safety</label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="safetyGPSTracking"
                      checked={formData.safetyGPSTracking}
                      onChange={(e) => setFormData(prev => ({ ...prev, safetyGPSTracking: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">GPS Tracking</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="safetyDriverVerification"
                      checked={formData.safetyDriverVerification}
                      onChange={(e) => setFormData(prev => ({ ...prev, safetyDriverVerification: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Driver Verification</span>
                  </label>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Bus with Attendant (per route)</span>
                    <button type="button" onClick={addTransportRoute} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                      <PlusCircle size={16} className="mr-1" /> Add Route
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.safetyTransportRoutes || []).map((r, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-gray-50 p-3 rounded-md">
                        <input
                          type="text"
                          value={r.route || ''}
                          onChange={(e) => updateTransportRoute(idx, 'route', e.target.value)}
                          placeholder={`Route name/number`}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={!!r.attendant}
                            onChange={(e) => updateTransportRoute(idx, 'attendant', e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-gray-700">Attendant present</span>
                        </label>
                        <button type="button" onClick={() => removeTransportRoute(idx)} className="text-red-500 hover:text-red-700 justify-self-start md:justify-self-end">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Safety & Security Visualization */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Visualization: Icon Cards</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">CCTV</div>
                <div className="text-lg font-semibold text-gray-900">{formData.safetyCCTV ? `${formData.safetyCCTV}%` : '—'}</div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Medical</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formData.safetyDoctorAvailability || (formData.safetyNurseAvailable ? 'Nurse' : '—')}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Transport</div>
                <div className="text-lg font-semibold text-gray-900">
                  {Array.isArray(formData.safetyTransportRoutes) && formData.safetyTransportRoutes.length > 0
                    ? `${formData.safetyTransportRoutes.filter(r => r && r.attendant).length}/${formData.safetyTransportRoutes.length} routes`
                    : (formData.safetyGPSTracking || formData.safetyDriverVerification ? 'Enabled' : '—')}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Security</div>
                <div className="text-lg font-semibold text-gray-900">{computeSafetyRating()}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fees & Affordability Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Fees / Affordability</h2>
          
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
                  const newFees = [...(formData.classWiseFees || []), { class: '', tuition: '', activity: '', transport: '', hostel: '', misc: '' }];
                  setFormData(prev => ({ ...prev, classWiseFees: newFees }));
                }}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
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
                  {(formData.classWiseFees || []).map((fee, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={fee.class || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classWiseFees || [])];
                            newFees[index] = { ...newFees[index], class: e.target.value };
                            setFormData(prev => ({ ...prev, classWiseFees: newFees }));
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
                            const newFees = [...(formData.classWiseFees || [])];
                            newFees[index] = { ...newFees[index], tuition: e.target.value };
                            setFormData(prev => ({ ...prev, classWiseFees: newFees }));
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
                            const newFees = [...(formData.classWiseFees || [])];
                            newFees[index] = { ...newFees[index], activity: e.target.value };
                            setFormData(prev => ({ ...prev, classWiseFees: newFees }));
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
                            const newFees = [...(formData.classWiseFees || [])];
                            newFees[index] = { ...newFees[index], transport: e.target.value };
                            setFormData(prev => ({ ...prev, classWiseFees: newFees }));
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
                            const newFees = [...(formData.classWiseFees || [])];
                            newFees[index] = { ...newFees[index], hostel: e.target.value };
                            setFormData(prev => ({ ...prev, classWiseFees: newFees }));
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
                            const newFees = [...(formData.classWiseFees || [])];
                            newFees[index] = { ...newFees[index], misc: e.target.value };
                            setFormData(prev => ({ ...prev, classWiseFees: newFees }));
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
                            const newFees = (formData.classWiseFees || []).filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, classWiseFees: newFees }));
                          }}
                          className="text-red-500 hover:text-red-700"
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
                  const newScholarships = [...(formData.scholarships || []), { type: '', eligibility: '', reduction: '', description: '' }];
                  setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                }}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                <PlusCircle size={16} className="mr-1" /> Add Scholarship
              </button>
            </div>
            
            <div className="space-y-4">
              {(formData.scholarships || []).map((scholarship, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
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
                        <option value="Merit-based">Merit-based</option>
                        <option value="Need-based">Need-based</option>
                        <option value="Sports">Sports</option>
                        <option value="Sibling concession">Sibling concession</option>
                        <option value="Staff concession">Staff concession</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reduction</label>
                      <input
                        type="text"
                        value={scholarship.reduction || ''}
                        onChange={(e) => {
                          const newScholarships = [...(formData.scholarships || [])];
                          newScholarships[index] = { ...newScholarships[index], reduction: e.target.value };
                          setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                        }}
                        placeholder="e.g., 25%, ₹5000, 50% off"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
                      <input
                        type="text"
                        value={scholarship.eligibility || ''}
                        onChange={(e) => {
                          const newScholarships = [...(formData.scholarships || [])];
                          newScholarships[index] = { ...newScholarships[index], eligibility: e.target.value };
                          setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                        }}
                        placeholder="e.g., 90%+ marks, family income < ₹5L, sports achievements"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={scholarship.description || ''}
                        onChange={(e) => {
                          const newScholarships = [...(formData.scholarships || [])];
                          newScholarships[index] = { ...newScholarships[index], description: e.target.value };
                          setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                        }}
                        placeholder="Additional details about the scholarship"
                        rows="2"
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
                      className="text-red-500 hover:text-red-700 text-sm"
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
                <div className="text-lg font-semibold text-gray-900">{(formData.classWiseFees || []).length}</div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Scholarships</div>
                <div className="text-lg font-semibold text-gray-900">{(formData.scholarships || []).length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Adoption */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Technology Adoption</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Smart Classrooms (%)"
              name="smartClassroomsPercentage"
              type="number"
              value={formData.smartClassroomsPercentage}
              onChange={handleInputChange}
            />
          </div>
          <div className="mt-6">
            <DynamicElearningField
              label="E-learning Platform Usage"
              value={formData.elearningPlatforms}
              onChange={(list) => setFormData(prev => ({ ...prev, elearningPlatforms: list }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">Smart Classrooms</div>
              <div className="text-lg font-semibold text-gray-900">{formData.smartClassroomsPercentage || '—'}%</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">E-learning Platforms</div>
              <div className="text-lg font-semibold text-gray-900">{Array.isArray(formData.elearningPlatforms) ? formData.elearningPlatforms.length : 0}</div>
            </div>
          </div>
        </div>

        {/* Academics (Frontend-only) */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Academics</h2>

          {/* Board Results */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Board Results (Pass % and Average %)</h3>
              <button
                type="button"
                onClick={() => setAcademicResults([...academicResults, { year: '', passPercent: '', averageMarksPercent: '' }])}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                <PlusCircle size={16} className="mr-1" /> Add Year
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Marks %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {academicResults.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={row.year}
                          onChange={(e) => {
                            const next = academicResults.slice();
                            next[index] = { ...next[index], year: e.target.value };
                            setAcademicResults(next);
                          }}
                          placeholder="YYYY"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={row.passPercent}
                          onChange={(e) => {
                            const next = academicResults.slice();
                            next[index] = { ...next[index], passPercent: e.target.value };
                            setAcademicResults(next);
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={row.averageMarksPercent}
                          onChange={(e) => {
                            const next = academicResults.slice();
                            next[index] = { ...next[index], averageMarksPercent: e.target.value };
                            setAcademicResults(next);
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setAcademicResults(academicResults.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
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

          {/* Exam & Qualifier Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Exam & Qualifier / Participation</h3>
              <button
                type="button"
                onClick={() => setExamQualifiers([...examQualifiers, { year: '', exam: '', participation: '' }])}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                <PlusCircle size={16} className="mr-1" /> Add Entry
              </button>
            </div>
            <div className="space-y-3">
              {examQualifiers.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-md">
                  <FormField
                    label="Year"
                    name={`exam-year-${index}`}
                    type="number"
                    value={item.year}
                    onChange={(e) => {
                      const next = examQualifiers.slice();
                      next[index] = { ...next[index], year: e.target.value };
                      setExamQualifiers(next);
                    }}
                  />
                  <FormField
                    label="Exam"
                    name={`exam-name-${index}`}
                    type="select"
                    options={[
                      'NEET','IIT-JEE','Olympiads','School-level competitions','International education prep','English proficiency exams','Global entrance guidance','Other'
                    ]}
                    value={item.exam}
                    onChange={(e) => {
                      const next = examQualifiers.slice();
                      next[index] = { ...next[index], exam: e.target.value };
                      setExamQualifiers(next);
                    }}
                  />
                  <FormField
                    label="Qualifier/Participation"
                    name={`exam-part-${index}`}
                    value={item.participation}
                    onChange={(e) => {
                      const next = examQualifiers.slice();
                      next[index] = { ...next[index], participation: e.target.value };
                      setExamQualifiers(next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setExamQualifiers(examQualifiers.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700 mb-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Visualization: Line Chart (inline SVG) */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Visualization: Trends (Pass % vs Average %)</h4>
            <div className="bg-white border rounded-lg p-4 overflow-x-auto">
              {(() => {
                const rows = academicResults
                  .filter(r => r.year && (r.passPercent !== '' || r.averageMarksPercent !== ''))
                  .sort((a,b) => Number(a.year) - Number(b.year));
                if (rows.length === 0) {
                  return <div className="text-sm text-gray-500">Add data to see the chart.</div>;
                }
                const width = 520; const height = 220; const padding = 32;
                const years = rows.map(r => Number(r.year));
                const minYear = Math.min(...years); const maxYear = Math.max(...years);
                const xScale = (y) => padding + ((Number(y) - minYear) / Math.max(1, maxYear - minYear)) * (width - padding * 2);
                const yScale = (v) => height - padding - (Number(v) / 100) * (height - padding * 2);
                const toPath = (arr, key) => arr.map((r, i) => `${i === 0 ? 'M' : 'L'} ${xScale(r.year)} ${yScale(r[key] || 0)}`).join(' ');
                const passPath = toPath(rows, 'passPercent');
                const avgPath = toPath(rows, 'averageMarksPercent');
                return (
                  <svg width={width} height={height} className="min-w-[520px]">
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" />
                    <path d={passPath} fill="none" stroke="#4f46e5" strokeWidth="2" />
                    <path d={avgPath} fill="none" stroke="#16a34a" strokeWidth="2" />
                    {rows.map((r, i) => (
                      <g key={i}>
                        <circle cx={xScale(r.year)} cy={yScale(r.passPercent || 0)} r="3" fill="#4f46e5" />
                        <circle cx={xScale(r.year)} cy={yScale(r.averageMarksPercent || 0)} r="3" fill="#16a34a" />
                        <text x={xScale(r.year)} y={height - padding + 14} textAnchor="middle" fontSize="10" fill="#6b7280">{r.year}</text>
                      </g>
                    ))}
                    <text x={width - padding} y={padding - 8} textAnchor="end" fontSize="10" fill="#6b7280">%</text>
                    <g>
                      <rect x={width - padding - 150} y={padding - 20} width="150" height="16" fill="white" />
                      <circle cx={width - padding - 140} cy={padding - 12} r="3" fill="#4f46e5" />
                      <text x={width - padding - 132} y={padding - 8} fontSize="10" fill="#374151">Pass %</text>
                      <circle cx={width - padding - 80} cy={padding - 12} r="3" fill="#16a34a" />
                      <text x={width - padding - 72} y={padding - 8} fontSize="10" fill="#374151">Average %</text>
                    </g>
                  </svg>
                );
              })()}
            </div>
          </div>
        </div>

        {/* International Exposure */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">International Exposure</h2>

          {/* Exchange Programs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Exchange Programs</h3>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  exchangePrograms: [...(prev.exchangePrograms || []), { partnerSchool: '', country: '', type: '', duration: '', studentsParticipated: '', activeSince: '' }]
                }))}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
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
                    label="Country"
                    name={`ex-country-${index}`}
                    value={prog.country}
                    onChange={(e) => {
                      const list = [...(formData.exchangePrograms || [])];
                      list[index] = { ...list[index], country: e.target.value };
                      setFormData(prev => ({ ...prev, exchangePrograms: list }));
                    }}
                  />
                  <FormField
                    label="Type"
                    name={`ex-type-${index}`}
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
                      className="text-red-500 hover:text-red-700 mb-2"
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
                  globalTieups: [...(prev.globalTieups || []), { partnerName: '', nature: '', activeSince: '', description: '' }]
                }))}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                <PlusCircle size={16} className="mr-1" /> Add Tie-up
              </button>
            </div>
            <div className="space-y-3">
              {(formData.globalTieups || []).map((tie, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-md">
                  <FormField
                    label="Partner Name"
                    name={`gt-name-${index}`}
                    value={tie.partnerName}
                    onChange={(e) => {
                      const list = [...(formData.globalTieups || [])];
                      list[index] = { ...list[index], partnerName: e.target.value };
                      setFormData(prev => ({ ...prev, globalTieups: list }));
                    }}
                  />
                  <FormField
                    label="Nature"
                    name={`gt-nature-${index}`}
                    value={tie.nature}
                    onChange={(e) => {
                      const list = [...(formData.globalTieups || [])];
                      list[index] = { ...list[index], nature: e.target.value };
                      setFormData(prev => ({ ...prev, globalTieups: list }));
                    }}
                  />
                  <FormField
                    label="Active Since"
                    name={`gt-active-${index}`}
                    value={tie.activeSince}
                    onChange={(e) => {
                      const list = [...(formData.globalTieups || [])];
                      list[index] = { ...list[index], activeSince: e.target.value };
                      setFormData(prev => ({ ...prev, globalTieups: list }));
                    }}
                  />
                  <div className="md:col-span-2 grid grid-cols-1 items-end gap-2">
                    <FormField
                      label="Description"
                      name={`gt-desc-${index}`}
                      value={tie.description}
                      onChange={(e) => {
                        const list = [...(formData.globalTieups || [])];
                        list[index] = { ...list[index], description: e.target.value };
                        setFormData(prev => ({ ...prev, globalTieups: list }));
                      }}
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, globalTieups: (prev.globalTieups || []).filter((_, i) => i !== index) }))}
                        className="text-red-500 hover:text-red-700"
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

        {/* Diversity & Inclusivity Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Diversity & Inclusivity</h2>
          
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

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Scholarship Diversity Types</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Merit', 'Socio-economic', 'Cultural', 'Sports', 'Community', 'Academic Excellence'].map(opt => (
                <label key={opt} className="flex items-center">
                  <input
                    type="checkbox"
                    name="scholarshipDiversityTypes"
                    value={opt}
                    checked={(formData.scholarshipDiversityTypes || []).includes(opt)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormField
              label="Scholarship Coverage (%)"
              name="scholarshipDiversityCoverage"
              type="number"
              value={formData.scholarshipDiversityCoverage}
              onChange={handleInputChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Needs Support</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="specialNeedsStaff"
                    checked={formData.specialNeedsStaff}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialNeedsStaff: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Dedicated Staff Available</span>
                </label>
                <FormField
                  label="Students Supported (%)"
                  name="specialNeedsSupportPercentage"
                  type="number"
                  value={formData.specialNeedsSupportPercentage}
                  onChange={handleInputChange}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facilities Available</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Ramps', 'Wheelchair access', 'Special educators', 'Learning support', 'Resource room', 'Assistive devices'].map(opt => (
                      <label key={opt} className="flex items-center">
                        <input
                          type="checkbox"
                          name="specialNeedsFacilities"
                          value={opt}
                          checked={(formData.specialNeedsFacilities || []).includes(opt)}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media (Photos & Video) */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Media</h2>
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

        
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
