import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addSchool } from "../api/adminService";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "../api/axios";


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
    if (files.length > 4) {
      toast.error("Maximum 4 photos allowed");
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
          return {
            studentsPerTeacher: studNum,
            teacherStudentRatio: studNum ? `1:${studNum}` : undefined,
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
      navigate("/school-portal");
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

        {/* Diversity & Inclusivity Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Diversity & Inclusivity</h2>
          
          {/* Gender Ratio */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Gender Ratio</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Male (%)</label>
                <input
                  type="number"
                  name="genderRatioMale"
                  value={formData.genderRatioMale}
                  onChange={handleInputChange}
                  placeholder="e.g., 45"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Female (%)</label>
                <input
                  type="number"
                  name="genderRatioFemale"
                  value={formData.genderRatioFemale}
                  onChange={handleInputChange}
                  placeholder="e.g., 50"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Others (%)</label>
                <input
                  type="number"
                  name="genderRatioOthers"
                  value={formData.genderRatioOthers}
                  onChange={handleInputChange}
                  placeholder="e.g., 5"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Gender Ratio Pie Chart Visualization */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Gender Distribution</h4>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    {(() => {
                      const male = Number(formData.genderRatioMale || 0);
                      const female = Number(formData.genderRatioFemale || 0);
                      const others = Number(formData.genderRatioOthers || 0);
                      const total = male + female + others;
                      
                      if (total === 0) {
                        return (
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="#e5e7eb"
                            stroke="#d1d5db"
                            strokeWidth="2"
                          />
                        );
                      }
                      
                      let cumulative = 0;
                      const segments = [];
                      
                      if (male > 0) {
                        const angle = (male / total) * 360;
                        segments.push(
                          <path
                            key="male"
                            d={`M 50,50 L 50,10 A 40,40 0 ${angle > 180 ? 1 : 0},1 ${50 + 40 * Math.cos((angle * Math.PI) / 180)},${50 - 40 * Math.sin((angle * Math.PI) / 180)} Z`}
                            fill="#3b82f6"
                          />
                        );
                        cumulative += angle;
                      }
                      
                      if (female > 0) {
                        const angle = (female / total) * 360;
                        const startAngle = cumulative;
                        const endAngle = cumulative + angle;
                        segments.push(
                          <path
                            key="female"
                            d={`M 50,50 L ${50 + 40 * Math.cos((startAngle * Math.PI) / 180)},${50 - 40 * Math.sin((startAngle * Math.PI) / 180)} A 40,40 0 ${angle > 180 ? 1 : 0},1 ${50 + 40 * Math.cos((endAngle * Math.PI) / 180)},${50 - 40 * Math.sin((endAngle * Math.PI) / 180)} Z`}
                            fill="#ec4899"
                          />
                        );
                        cumulative += angle;
                      }
                      
                      if (others > 0) {
                        const angle = (others / total) * 360;
                        const startAngle = cumulative;
                        const endAngle = cumulative + angle;
                        segments.push(
                          <path
                            key="others"
                            d={`M 50,50 L ${50 + 40 * Math.cos((startAngle * Math.PI) / 180)},${50 - 40 * Math.sin((startAngle * Math.PI) / 180)} A 40,40 0 ${angle > 180 ? 1 : 0},1 ${50 + 40 * Math.cos((endAngle * Math.PI) / 180)},${50 - 40 * Math.sin((endAngle * Math.PI) / 180)} Z`}
                            fill="#10b981"
                          />
                        );
                      }
                      
                      return segments;
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {Number(formData.genderRatioMale || 0) + Number(formData.genderRatioFemale || 0) + Number(formData.genderRatioOthers || 0)}%
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Male: {formData.genderRatioMale || 0}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Female: {formData.genderRatioFemale || 0}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Others: {formData.genderRatioOthers || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scholarship Diversity */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Scholarship Diversity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scholarship Types Offered</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Merit', 'Sports', 'Socio-economic', 'Community', 'Cultural', 'Academic Excellence'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        name="scholarshipDiversityTypes"
                        value={type}
                        checked={(formData.scholarshipDiversityTypes || []).includes(type)}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          const current = formData.scholarshipDiversityTypes || [];
                          const next = checked ? [...current, value] : current.filter(v => v !== value);
                          setFormData(prev => ({ ...prev, scholarshipDiversityTypes: next }));
                        }}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">% of Students Covered</label>
                <input
                  type="number"
                  name="scholarshipDiversityCoverage"
                  value={formData.scholarshipDiversityCoverage}
                  onChange={handleInputChange}
                  placeholder="e.g., 25"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Special Needs Support */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Special Needs Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dedicated Staff</label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="specialNeedsStaff"
                    checked={formData.specialNeedsStaff}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialNeedsStaff: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">👩‍🏫 Special Educator available</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">% of Special Needs Students Supported</label>
                <input
                  type="number"
                  name="specialNeedsSupportPercentage"
                  value={formData.specialNeedsSupportPercentage}
                  onChange={handleInputChange}
                  placeholder="e.g., 80"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Facilities Available</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Ramps', 'Special educators', 'Resource room', 'Assistive devices', 'Wheelchair access', 'Learning support'].map(facility => (
                  <label key={facility} className="flex items-center">
                    <input
                      type="checkbox"
                      name="specialNeedsFacilities"
                      value={facility}
                      checked={(formData.specialNeedsFacilities || []).includes(facility)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        const current = formData.specialNeedsFacilities || [];
                        const next = checked ? [...current, value] : current.filter(v => v !== value);
                        setFormData(prev => ({ ...prev, specialNeedsFacilities: next }));
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">
                      {facility === 'Ramps' ? '♿' : 
                       facility === 'Special educators' ? '👩‍🏫' : 
                       facility === 'Learning support' ? '📘' : ''} {facility}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Diversity Visualization */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Visualization: Diversity Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Gender Balance</div>
                <div className="text-lg font-semibold text-gray-900">
                  {(() => {
                    const male = Number(formData.genderRatioMale || 0);
                    const female = Number(formData.genderRatioFemale || 0);
                    const others = Number(formData.genderRatioOthers || 0);
                    const total = male + female + others;
                    if (total === 0) return '—';
                    const balance = Math.abs(male - female);
                    return balance <= 10 ? 'Balanced' : balance <= 20 ? 'Moderate' : 'Imbalanced';
                  })()}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Scholarship Coverage</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formData.scholarshipDiversityCoverage ? `${formData.scholarshipDiversityCoverage}%` : '—'}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Special Needs</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formData.specialNeedsStaff ? 'Supported' : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Reviews Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Parent Reviews</h2>
          
          {/* Review Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Review Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review System</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="reviewsEnabled"
                      checked={formData.reviewsEnabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, reviewsEnabled: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Enable parent reviews</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="reviewVerificationRequired"
                      checked={formData.reviewVerificationRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, reviewVerificationRequired: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Require verified parent accounts</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="reviewAnonymityOption"
                      checked={formData.reviewAnonymityOption}
                      onChange={(e) => setFormData(prev => ({ ...prev, reviewAnonymityOption: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Allow anonymous reviews</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="reviewMediaUpload"
                      checked={formData.reviewMediaUpload}
                      onChange={(e) => setFormData(prev => ({ ...prev, reviewMediaUpload: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Allow media uploads with reviews</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Moderation</label>
                <select
                  name="reviewModeration"
                  value={formData.reviewModeration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ai">AI Moderation</option>
                  <option value="admin">Admin Moderation</option>
                  <option value="none">No Moderation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rating Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Rating Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ⭐ {formData.averageRating.toFixed(1)}/5
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Based on {formData.totalReviews} reviews
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ 
                              width: `${formData.totalReviews > 0 ? (formData.ratingBreakdown[rating] / formData.totalReviews) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {formData.totalReviews > 0 ? Math.round((formData.ratingBreakdown[rating] / formData.totalReviews) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Average Rating</label>
                  <input
                    type="number"
                    name="averageRating"
                    value={formData.averageRating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="e.g., 4.3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Reviews</label>
                  <input
                    type="number"
                    name="totalReviews"
                    value={formData.totalReviews}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="e.g., 127"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Rating Breakdown</h3>
            <div className="grid grid-cols-5 gap-4">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{rating}★</label>
                  <input
                    type="number"
                    name={`ratingBreakdown_${rating}`}
                    value={formData.ratingBreakdown[rating]}
                    onChange={(e) => {
                      const newBreakdown = { ...formData.ratingBreakdown };
                      newBreakdown[rating] = Number(e.target.value);
                      setFormData(prev => ({ ...prev, ratingBreakdown: newBreakdown }));
                    }}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sample Reviews Management */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Sample Reviews</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-600">Highlighted Reviews</h4>
                <button
                  type="button"
                  onClick={() => {
                    const newReview = {
                      id: Date.now(),
                      rating: 5,
                      comment: '',
                      parentName: '',
                      grade: '',
                      verified: true,
                      helpful: 0,
                      date: new Date().toISOString().split('T')[0]
                    };
                    setFormData(prev => ({ 
                      ...prev, 
                      highlightedReviews: [...prev.highlightedReviews, newReview] 
                    }));
                  }}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <PlusCircle size={16} className="mr-1" /> Add Highlighted Review
                </button>
              </div>
              
              <div className="space-y-3">
                {(formData.highlightedReviews || []).map((review, index) => (
                  <div key={review.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <select
                          value={review.rating}
                          onChange={(e) => {
                            const newReviews = [...(formData.highlightedReviews || [])];
                            newReviews[index] = { ...newReviews[index], rating: Number(e.target.value) };
                            setFormData(prev => ({ ...prev, highlightedReviews: newReviews }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value={5}>5★ Excellent</option>
                          <option value={4}>4★ Very Good</option>
                          <option value={3}>3★ Good</option>
                          <option value={2}>2★ Fair</option>
                          <option value={1}>1★ Poor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                        <input
                          type="text"
                          value={review.parentName}
                          onChange={(e) => {
                            const newReviews = [...(formData.highlightedReviews || [])];
                            newReviews[index] = { ...newReviews[index], parentName: e.target.value };
                            setFormData(prev => ({ ...prev, highlightedReviews: newReviews }));
                          }}
                          placeholder="e.g., Parent of Grade 5 Student"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review Comment</label>
                        <textarea
                          value={review.comment}
                          onChange={(e) => {
                            const newReviews = [...(formData.highlightedReviews || [])];
                            newReviews[index] = { ...newReviews[index], comment: e.target.value };
                            setFormData(prev => ({ ...prev, highlightedReviews: newReviews }));
                          }}
                          placeholder="Share your experience with the school..."
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={review.verified}
                            onChange={(e) => {
                              const newReviews = [...(formData.highlightedReviews || [])];
                              newReviews[index] = { ...newReviews[index], verified: e.target.checked };
                              setFormData(prev => ({ ...prev, highlightedReviews: newReviews }));
                            }}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Verified Parent</span>
                        </label>
                        <span className="text-sm text-gray-500">
                          {review.helpful} helpful votes
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newReviews = (formData.highlightedReviews || []).filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, highlightedReviews: newReviews }));
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
          </div>

          {/* Reviews Visualization */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Visualization: Review Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Average Rating</div>
                <div className="text-2xl font-semibold text-gray-900">⭐ {formData.averageRating.toFixed(1)}</div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Total Reviews</div>
                <div className="text-2xl font-semibold text-gray-900">{formData.totalReviews}</div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Verification</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {formData.reviewVerificationRequired ? '✅ Required' : '❌ Optional'}
                </div>
              </div>
            </div>
          </div>
        </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Amenities & Activities
            </h2>
            <div className="space-y-6">
              <FormField
                label="Amenities"
                name="predefinedAmenities"
                type="checkboxGroup"
                options={amenitiesOptions}
                value={formData.predefinedAmenities}
                onChange={handleCheckboxChange}
              />
              <DynamicAmenitiesField
                label="Other Amenities"
                value={customAmenities}
                onChange={setCustomAmenities}
              />
              <FormField
                label="Activities"
                name="activities"
                type="checkboxGroup"
                options={activitiesOptions}
                value={formData.activities}
                onChange={handleCheckboxChange}
              />
              <DynamicActivitiesField
                label="Other Activities"
                value={customActivities}
                onChange={setCustomActivities}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Alumni Information
            </h2>
            <div className="space-y-8">
              <DynamicListField
                label="Famous Alumni (Name & Profession)"
                fields={[
                  { name: "name", label: "Alumni Name" },
                  { name: "profession", label: "Profession" },
                ]}
                value={famousAlumnies}
                onChange={setFamousAlumnies}
                type="famous"
              />
              
              <DynamicListField
                label="Top Alumni (Name & Percentage)"
                fields={[
                  { name: "name", label: "Alumni Name" },
                  { name: "percentage", label: "Percentage" },
                ]}
                value={topAlumnies}
                onChange={setTopAlumnies}
                type="top"
              />
              
              <DynamicListField
                label="Other Alumni (Name & Percentage)"
                fields={[
                  { name: "name", label: "Alumni Name" },
                  { name: "percentage", label: "Percentage" },
                ]}
                value={otherAlumnies}
                onChange={setOtherAlumnies}
                type="other"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              School Media
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Photos (Max 4 photos, 5MB each)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                {selectedPhotos.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedPhotos.length} photo(s) selected
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Video (Max 20MB)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                {selectedVideo && (
                  <p className="text-sm text-gray-600 mt-1">
                    Video selected: {selectedVideo.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Technology Adoption Section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Technology Adoption
            </h2>
            <div className="space-y-6">
              {/* Smart Classrooms Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smart Classrooms Percentage
                </label>
                <input
                  type="number"
                  name="smartClassroomsPercentage"
                  value={formData.smartClassroomsPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="e.g., 75"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Percentage of classrooms equipped with smart boards/projectors/interactive tech
                </p>
              </div>

              {/* E-learning Platforms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  E-learning Platforms
                </label>
                <div className="space-y-4">
                  {formData.elearningPlatforms.map((platform, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Platform Name
                          </label>
                          <input
                            type="text"
                            value={platform.platform}
                            onChange={(e) => {
                              const newPlatforms = [...formData.elearningPlatforms];
                              newPlatforms[index].platform = e.target.value;
                              setFormData(prev => ({ ...prev, elearningPlatforms: newPlatforms }));
                            }}
                            placeholder="e.g., Google Classroom, MS Teams"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Usage Percentage
                          </label>
                          <input
                            type="number"
                            value={platform.usagePercentage}
                            onChange={(e) => {
                              const newPlatforms = [...formData.elearningPlatforms];
                              newPlatforms[index].usagePercentage = e.target.value;
                              setFormData(prev => ({ ...prev, elearningPlatforms: newPlatforms }));
                            }}
                            min="0"
                            max="100"
                            placeholder="e.g., 85"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frequency
                          </label>
                          <select
                            value={platform.frequency}
                            onChange={(e) => {
                              const newPlatforms = [...formData.elearningPlatforms];
                              newPlatforms[index].frequency = e.target.value;
                              setFormData(prev => ({ ...prev, elearningPlatforms: newPlatforms }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Frequency</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Occasionally">Occasionally</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newPlatforms = formData.elearningPlatforms.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, elearningPlatforms: newPlatforms }));
                        }}
                        className="mt-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        <Trash2 size={16} className="inline mr-1" /> Remove Platform
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        elearningPlatforms: [...prev.elearningPlatforms, { platform: '', usagePercentage: '', frequency: '' }]
                      }));
                    }}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <PlusCircle size={16} className="mr-1" /> Add E-learning Platform
                  </button>
                </div>
              </div>

              {/* Technology Timeline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Technology Timeline
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technology Adoption Year
                    </label>
                    <input
                      type="number"
                      name="techAdoptionYear"
                      value={formData.techAdoptionYear}
                      onChange={handleInputChange}
                      min="1990"
                      max="2024"
                      placeholder="e.g., 2020"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Year when technology adoption started
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Major Upgrade
                    </label>
                    <input
                      type="number"
                      name="lastTechUpgrade"
                      value={formData.lastTechUpgrade}
                      onChange={handleInputChange}
                      min="1990"
                      max="2024"
                      placeholder="e.g., 2023"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Year of last major technology upgrade
                    </p>
                  </div>
                </div>
              </div>

              {/* Digital Adoption Index Visualization */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Digital Adoption Index</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">📽️ Smart Classrooms</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formData.smartClassroomsPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${formData.smartClassroomsPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">💻 E-learning Usage</span>
                      <span className="text-lg font-bold text-green-600">
                        {formData.elearningPlatforms.length > 0 
                          ? Math.round(formData.elearningPlatforms.reduce((sum, p) => sum + (parseInt(p.usagePercentage) || 0), 0) / formData.elearningPlatforms.length)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${formData.elearningPlatforms.length > 0 
                            ? Math.round(formData.elearningPlatforms.reduce((sum, p) => sum + (parseInt(p.usagePercentage) || 0), 0) / formData.elearningPlatforms.length)
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Combined Digital Adoption Score</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {Math.round(((parseInt(formData.smartClassroomsPercentage) || 0) + 
                      (formData.elearningPlatforms.length > 0 
                        ? Math.round(formData.elearningPlatforms.reduce((sum, p) => sum + (parseInt(p.usagePercentage) || 0), 0) / formData.elearningPlatforms.length)
                        : 0)) / 2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* International Exposure Section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              International Exposure
            </h2>
            <div className="space-y-6">
              {/* Exchange Programs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Exchange Programs
                </label>
                <div className="space-y-4">
                  {formData.exchangePrograms.map((program, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Partner School/Country
                          </label>
                          <input
                            type="text"
                            value={program.partnerSchool}
                            onChange={(e) => {
                              const newPrograms = [...formData.exchangePrograms];
                              newPrograms[index].partnerSchool = e.target.value;
                              setFormData(prev => ({ ...prev, exchangePrograms: newPrograms }));
                            }}
                            placeholder="e.g., Harvard University, USA"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Program Type
                          </label>
                          <select
                            value={program.type}
                            onChange={(e) => {
                              const newPrograms = [...formData.exchangePrograms];
                              newPrograms[index].type = e.target.value;
                              setFormData(prev => ({ ...prev, exchangePrograms: newPrograms }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Type</option>
                            <option value="Student Exchange">Student Exchange</option>
                            <option value="Teacher Exchange">Teacher Exchange</option>
                            <option value="Cultural Program">Cultural Program</option>
                            <option value="Virtual Exchange">Virtual Exchange</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                          </label>
                          <select
                            value={program.duration}
                            onChange={(e) => {
                              const newPrograms = [...formData.exchangePrograms];
                              newPrograms[index].duration = e.target.value;
                              setFormData(prev => ({ ...prev, exchangePrograms: newPrograms }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Duration</option>
                            <option value="Short-term">Short-term</option>
                            <option value="Semester">Semester</option>
                            <option value="Year-long">Year-long</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Students Participated
                          </label>
                          <input
                            type="number"
                            value={program.studentsParticipated}
                            onChange={(e) => {
                              const newPrograms = [...formData.exchangePrograms];
                              newPrograms[index].studentsParticipated = e.target.value;
                              setFormData(prev => ({ ...prev, exchangePrograms: newPrograms }));
                            }}
                            placeholder="e.g., 25"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Active Since
                          </label>
                          <input
                            type="number"
                            value={program.activeSince}
                            onChange={(e) => {
                              const newPrograms = [...formData.exchangePrograms];
                              newPrograms[index].activeSince = e.target.value;
                              setFormData(prev => ({ ...prev, exchangePrograms: newPrograms }));
                            }}
                            placeholder="e.g., 2020"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newPrograms = formData.exchangePrograms.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, exchangePrograms: newPrograms }));
                        }}
                        className="mt-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        <Trash2 size={16} className="inline mr-1" /> Remove Program
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        exchangePrograms: [...prev.exchangePrograms, { 
                          partnerSchool: '', 
                          country: '', 
                          type: '', 
                          duration: '', 
                          studentsParticipated: '', 
                          activeSince: '' 
                        }]
                      }));
                    }}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <PlusCircle size={16} className="mr-1" /> Add Exchange Program
                  </button>
                </div>
              </div>

              {/* Global Tie-ups */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Global Tie-ups
                </label>
                <div className="space-y-4">
                  {formData.globalTieups.map((tieup, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Partner Name
                          </label>
                          <input
                            type="text"
                            value={tieup.partnerName}
                            onChange={(e) => {
                              const newTieups = [...formData.globalTieups];
                              newTieups[index].partnerName = e.target.value;
                              setFormData(prev => ({ ...prev, globalTieups: newTieups }));
                            }}
                            placeholder="e.g., MIT, Cambridge University"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nature of Tie-up
                          </label>
                          <select
                            value={tieup.nature}
                            onChange={(e) => {
                              const newTieups = [...formData.globalTieups];
                              newTieups[index].nature = e.target.value;
                              setFormData(prev => ({ ...prev, globalTieups: newTieups }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Nature</option>
                            <option value="Curriculum Collaboration">Curriculum Collaboration</option>
                            <option value="Joint Research">Joint Research</option>
                            <option value="Competitions">Competitions</option>
                            <option value="Internships">Internships</option>
                            <option value="Cultural Exposure">Cultural Exposure</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Active Since
                          </label>
                          <input
                            type="number"
                            value={tieup.activeSince}
                            onChange={(e) => {
                              const newTieups = [...formData.globalTieups];
                              newTieups[index].activeSince = e.target.value;
                              setFormData(prev => ({ ...prev, globalTieups: newTieups }));
                            }}
                            placeholder="e.g., 2018"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={tieup.description}
                            onChange={(e) => {
                              const newTieups = [...formData.globalTieups];
                              newTieups[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, globalTieups: newTieups }));
                            }}
                            placeholder="Brief description of the partnership"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newTieups = formData.globalTieups.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, globalTieups: newTieups }));
                        }}
                        className="mt-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        <Trash2 size={16} className="inline mr-1" /> Remove Tie-up
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        globalTieups: [...prev.globalTieups, { 
                          partnerName: '', 
                          nature: '', 
                          activeSince: '', 
                          description: '' 
                        }]
                      }));
                    }}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <PlusCircle size={16} className="mr-1" /> Add Global Tie-up
                  </button>
                </div>
              </div>

              {/* Success Stories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Success Stories
                </label>
                <div className="space-y-4">
                  {formData.successStories.map((story, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Story Title
                          </label>
                          <input
                            type="text"
                            value={story.title}
                            onChange={(e) => {
                              const newStories = [...formData.successStories];
                              newStories[index].title = e.target.value;
                              setFormData(prev => ({ ...prev, successStories: newStories }));
                            }}
                            placeholder="e.g., 10 students selected for Germany cultural exchange"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year
                          </label>
                          <input
                            type="number"
                            value={story.year}
                            onChange={(e) => {
                              const newStories = [...formData.successStories];
                              newStories[index].year = e.target.value;
                              setFormData(prev => ({ ...prev, successStories: newStories }));
                            }}
                            placeholder="e.g., 2024"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Students Benefited
                          </label>
                          <input
                            type="number"
                            value={story.studentsBenefited}
                            onChange={(e) => {
                              const newStories = [...formData.successStories];
                              newStories[index].studentsBenefited = e.target.value;
                              setFormData(prev => ({ ...prev, successStories: newStories }));
                            }}
                            placeholder="e.g., 10"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={story.description}
                            onChange={(e) => {
                              const newStories = [...formData.successStories];
                              newStories[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, successStories: newStories }));
                            }}
                            placeholder="Brief description of the success story"
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newStories = formData.successStories.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, successStories: newStories }));
                        }}
                        className="mt-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        <Trash2 size={16} className="inline mr-1" /> Remove Story
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        successStories: [...prev.successStories, { 
                          title: '', 
                          description: '', 
                          year: '', 
                          studentsBenefited: '' 
                        }]
                      }));
                    }}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <PlusCircle size={16} className="mr-1" /> Add Success Story
                  </button>
                </div>
              </div>

              {/* Impact Indicator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Students Benefiting from International Exposure
                </label>
                <input
                  type="number"
                  name="studentsBenefitingPercentage"
                  value={formData.studentsBenefitingPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="e.g., 25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Percentage of students benefiting from international exposure programs
                </p>
              </div>

              {/* International Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  International Exchange Photos
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const newPhotos = [...formData.internationalPhotos, ...files.map(file => URL.createObjectURL(file))];
                    setFormData(prev => ({ ...prev, internationalPhotos: newPhotos }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Photos from exchange visits (with moderation)
                </p>
                {formData.internationalPhotos.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {formData.internationalPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img src={photo} alt={`Exchange photo ${index + 1}`} className="w-full h-20 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            const newPhotos = formData.internationalPhotos.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, internationalPhotos: newPhotos }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
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
