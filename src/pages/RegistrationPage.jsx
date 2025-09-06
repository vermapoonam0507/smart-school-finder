import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addSchool } from "../api/adminService";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "react-toastify";


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


const DynamicListField = ({ label, fields, value, onChange }) => {
  const list = value || [];
  const handleAddItem = () => onChange([...list, { name: "", profession: "" }]);
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
              label="Profession"
              name={`alumni-profession-${index}`}
              value={item.profession}
              onChange={(e) =>
                handleItemChange(index, "profession", e.target.value)
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
    transportAvailable: "no",
  });

  const [famousAlumnies, setFamousAlumnies] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) return toast.error("You must be logged in.");
    setIsSubmitting(true);

    try {
      const payload = { ...formData, famousAlumnies, authId: currentUser._id };
      await addSchool(payload);
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
    "Sports",
    "Music",
    "Dance",
    "Art & Craft",
    "Debate",
    "Drama",
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
                label="Fee Range (e.g., 50000-100000)"
                name="feeRange"
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
            </div>
          </div>

          <div className="border-t pt-6">
            <DynamicListField
              label="Notable Alumni"
              fields={[
                { name: "name", label: "Alumni Name" },
                { name: "profession", label: "Profession" },
              ]}
              value={famousAlumnies}
              onChange={setFamousAlumnies}
            />
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
