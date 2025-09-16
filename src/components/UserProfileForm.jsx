import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { getUserProfile } from "../api/userService";

const UserProfileForm = ({ currentUser, onProfileUpdate }) => {


  // --- ADD THIS LINE ---
  console.log("UserProfileForm received this currentUser prop:", currentUser);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  // UserProfileForm.jsx mein isse update karein

useEffect(() => {
    const fetchCurrent = async () => {
        // Agar user login nahi hai, to aage mat badho
        if (!currentUser) {
            return;
        }

        // No student profile for school users
        if (currentUser.userType === 'school') {
            return;
        }

        try {
            const res = await getUserProfile(currentUser.authId || currentUser._id);
            const data = res.data;
            console.log("Fetched profile data:", data);
            
            // Form ko fetched data se bhar do
            reset({
                name: data.name || "",
                email: data.email || "",
                contactNo: data.contactNo || "",
                dateOfBirth: data.dateOfBirth
                    ? new Date(data.dateOfBirth).toISOString().split("T")[0]
                    : "",
                gender: data.gender || "",
                state: data.state || "",
                city: data.city || "",
                userType: data.userType || "parent",
                boards: data.preferences?.boards || "",
                preferredStandard: data.preferences?.preferredStandard || "",
                interests: data.preferences?.interests || "",
                schoolType: data.preferences?.schoolType || "",
                shift: data.preferences?.shift || "",
            });

        } catch (error) {
            // Agar profile nahi milta (naya user), to form ko khaali rakho, sirf email bhar do
            if (error.response?.data?.message === 'Student Not Found') {
                console.log("New user, no profile to fetch yet.");
                reset({ email: currentUser.email }); 
            } else {
                console.error("Failed to fetch profile:", error);
            }
        }
    };

    fetchCurrent(); // Ab yeh useEffect ke andar hai

}, [currentUser, reset]);

  const onSubmit = async (data) => {
    await onProfileUpdate(data);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className="text-2xl font-semibold mb-6 border-b pb-4">
          Your Profile Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name", { required: "Name is required" })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              disabled
              className="w-full p-2 border bg-gray-100 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="contactNo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contact Number
            </label>
            <input
              type="tel"
              id="contactNo"
              {...register("contactNo", {
                required: "Contact number is required",
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.contactNo && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contactNo.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              {...register("dateOfBirth", {
                required: "Date of birth is required",
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender
            </label>
            <select
              id="gender"
              {...register("gender", { required: "Please select a gender" })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="userType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              I am a
            </label>
            <select
              id="userType"
              {...register("userType", {
                required: "Please select a user type",
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="parent">Parent</option>
              <option value="student">Student</option>
            </select>
            {errors.userType && (
              <p className="text-red-500 text-xs mt-1">
                {errors.userType.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              {...register("state", { required: "State is required" })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.state && (
              <p className="text-red-500 text-xs mt-1">
                {errors.state.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              {...register("city", { required: "City is required" })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
            )}
          </div>
        </div>

        {/*--- Preferences Section (Corrected to match Backend Schema) ---*/}
        <div className="md:col-span-2 pt-6 border-t mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Your Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="boards"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preferred Board <span className="text-red-500">*</span>
              </label>
              <select
                id="boards"
                {...register("boards", { required: "Board is required" })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="STATE">STATE</option>
                <option value="OTHER">OTHER</option>
              </select>
              {errors.boards && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.boards.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="shift"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preferred Shift <span className="text-red-500">*</span>
              </label>
              <select
                id="shift"
                {...register("shift", { required: "Shift is required" })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Shift</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="night school">Night School</option>
              </select>
              {errors.shift && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.shift.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="schoolType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                School Type <span className="text-red-500">*</span>
              </label>
              <select
                id="schoolType"
                {...register("schoolType", {
                  required: "School Type is required",
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select School Type</option>
                <option value="convent">Convent</option>
                <option value="private">Private</option>
                <option value="government">Government</option>
              </select>
              {errors.schoolType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.schoolType.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="preferredStandard"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preferred Standard <span className="text-red-500">*</span>
              </label>
              <select
                id="preferredStandard"
                {...register("preferredStandard", {
                  required: "Standard is required",
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Standard</option>
                <option value="playSchool">Play School</option>
                <option value="pre-primary">Pre-Primary</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
              {errors.preferredStandard && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.preferredStandard.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="interests"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Interests
              </label>
              <select
                id="interests"
                {...register("interests")}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Interests</option>
                <option value="Focusing on Academics">
                  Focusing on Academics
                </option>
                <option value="Focuses on Practical Learning">
                  Focuses on Practical Learning
                </option>
                <option value="Empowering in Sports">
                  Empowering in Sports
                </option>
                <option value="Leadership Development">
                  Leadership Development
                </option>
                <option value="STEM Activities">STEM Activities</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSubmitting ? "Saving..." : "Save All Details"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
