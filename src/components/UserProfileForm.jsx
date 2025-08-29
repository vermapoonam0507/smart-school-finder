// src/components/UserProfileForm.jsx

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';

const UserProfileForm = ({ currentUser, onProfileUpdate }) => {
  // ====> IMPORTANT CHANGE: `reset` ko useForm se nikal rahe hain <====
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  // ====> YEH `useEffect` FORM KO API DATA SE BHARNE KE LIYE HAI <====
  // Jab bhi currentUser data change hoga, yeh form ko reset karke nayi values daal dega.
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name || '',
        email: currentUser.email || '', // Email ko context se le rahe hain
        contactNo: currentUser.contactNo || '',
        dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : '',
        gender: currentUser.gender || '',
        state: currentUser.state || '',
        city: currentUser.city || '',
        userType: currentUser.userType || 'parent',
        
        // Preference fields ko safely access karein
        boards: currentUser.preferences?.boards || '',
        preferredStandard: currentUser.preferences?.preferredStandard || '',
        interests: currentUser.preferences?.interests || '',
        schoolType: currentUser.preferences?.schoolType || '',
        shift: currentUser.preferences?.shift || '',
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data) => {
    await onProfileUpdate(data);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className="text-2xl font-semibold mb-6 border-b pb-4">Your Profile Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your form fields... (No changes needed here) */}
          <div>
             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
             <input type="text" id="name" {...register("name", { required: "Name is required" })} className="w-full p-2 border border-gray-300 rounded-md"/>
             {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
           </div>
           <div>
             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
             <input type="email" id="email" {...register("email")} disabled className="w-full p-2 border bg-gray-100 rounded-md"/>
           </div>
           <div>
             <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
             <input type="tel" id="contactNo" {...register("contactNo", { required: "Contact number is required" })} className="w-full p-2 border border-gray-300 rounded-md"/>
             {errors.contactNo && <p className="text-red-500 text-xs mt-1">{errors.contactNo.message}</p>}
           </div>
           <div>
             <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
             <input type="date" id="dateOfBirth" {...register("dateOfBirth", { required: "Date of birth is required" })} className="w-full p-2 border border-gray-300 rounded-md"/>
             {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
           </div>
           <div>
             <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
             <select id="gender" {...register("gender", { required: "Please select a gender" })} className="w-full p-2 border border-gray-300 rounded-md">
               <option value="">Select Gender</option>
               <option value="male">Male</option>
               <option value="female">Female</option>
               <option value="other">Other</option>
             </select>
             {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
           </div>
           <div>
             <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
             <select id="userType" {...register("userType", { required: "Please select a user type" })} className="w-full p-2 border border-gray-300 rounded-md">
               <option value="parent">Parent</option>
               <option value="student">Student</option>
             </select>
             {errors.userType && <p className="text-red-500 text-xs mt-1">{errors.userType.message}</p>}
           </div>
           <div>
             <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
             <input type="text" id="state" {...register("state", { required: "State is required" })} className="w-full p-2 border border-gray-300 rounded-md"/>
             {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
           </div>
           <div>
             <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
             <input type="text" id="city" {...register("city", { required: "City is required" })} className="w-full p-2 border border-gray-300 rounded-md"/>
             {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
           </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6 mt-10 border-b pb-4">Your School Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your preference fields... (No changes needed here) */}
           <div>
              <label htmlFor="boards" className="block text-sm font-medium text-gray-700 mb-1">Preferred Board</label>
              <select id="boards" {...register("boards", { required: "Board is required" })} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Select Board</option>
                  {['CBSE', 'ICSE', 'CISCE', 'NIOS', 'SSC', 'IGCSE', 'IB', 'STATE', 'OTHER'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.boards && <p className="text-red-500 text-xs mt-1">{errors.boards.message}</p>}
            </div>
            <div>
              <label htmlFor="preferredStandard" className="block text-sm font-medium text-gray-700 mb-1">Preferred Standard</label>
              <select id="preferredStandard" {...register("preferredStandard", { required: "Standard is required" })} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Select Standard</option>
                  <option value="playSchool">Play School</option>
                  <option value="pre-primary">Pre-primary</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
              </select>
              {errors.preferredStandard && <p className="text-red-500 text-xs mt-1">{errors.preferredStandard.message}</p>}
            </div>
            <div>
              <label htmlFor="schoolType" className="block text-sm font-medium text-gray-700 mb-1">School Type</label>
              <select id="schoolType" {...register("schoolType", { required: "School type is required" })} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Select School Type</option>
                  <option value="convent">Convent</option>
                  <option value="private">Private</option>
                  <option value="government">Government</option>
              </select>
              {errors.schoolType && <p className="text-red-500 text-xs mt-1">{errors.schoolType.message}</p>}
            </div>
            <div>
              <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">Preferred Shift</label>
              <select id="shift" {...register("shift", { required: "Shift is required" })} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Select Shift</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="night school">Night School</option>
              </select>
              {errors.shift && <p className="text-red-500 text-xs mt-1">{errors.shift.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">Interests & Focus Area</label>
              <select id="interests" {...register("interests")} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Select Primary Interest</option>
                  {['Focusing on Academics', 'Focuses on Practical Learning', 'Empowering in Sports', 'Empowering in Arts', 'STEM Activities', 'Leadership Development'].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
        </div>

        <div className="mt-8 pt-5 border-t text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSubmitting ? 'Saving...' : 'Save All Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;