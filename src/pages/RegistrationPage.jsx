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
    customAmenities: "",
    activities: [],
    customActivities: "",
    transportAvailable: "no",
    latitude: "",
    longitude: "",
    studentsPerTeacher: "", // numeric derived from ratio
    teacherStudentRatio: "", // string input e.g., 1:20
  });

  const [famousAlumnies, setFamousAlumnies] = useState([]);
  const [topAlumnies, setTopAlumnies] = useState([]);
  const [otherAlumnies, setOtherAlumnies] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

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
        // merge customActivities into activities array
        ...(function() {
          const customActs = (formData.customActivities || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
          const baseActs = Array.isArray(formData.activities) ? formData.activities : [];
          const merged = [...baseActs, ...customActs];
          return { activities: merged };
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
              <FormField
                label="Other Amenities (comma separated)"
                name="customAmenities"
                value={formData.customAmenities}
                onChange={handleInputChange}
              />
              <FormField
                label="Activities"
                name="activities"
                type="checkboxGroup"
                options={activitiesOptions}
                value={formData.activities}
                onChange={handleCheckboxChange}
              />
              <FormField
                label="Other Activities (comma separated)"
                name="customActivities"
                value={formData.customActivities}
                onChange={handleInputChange}
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
