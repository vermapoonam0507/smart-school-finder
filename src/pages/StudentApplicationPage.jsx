// src/pages/StudentApplicationPage.jsx (Final and Complete Version)

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { submitApplication } from '../api/userService';
import { FileText, User, Users, Home } from 'lucide-react';

// A simple FormField component to reduce repeated code
const FormField = ({ label, name, type = 'text', value, onChange, required = false, options = null }) => {
    if (type === 'select' && options) {
        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
                <select id={name} name={name} value={value || ''} onChange={onChange} required={required} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md">
                    <option value="">Select...</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        );
    }
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
            <input
                type={type}
                id={name}
                name={name}
                value={value || ''}
                onChange={onChange}
                required={required}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
        </div>
    );
};

const StudentApplicationPage = () => {
    const { schoolId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        // Student Details
        name: '', location: '', dob: '', age: '', gender: '', motherTongue: '',
        placeOfBirth: '', speciallyAbled: false, speciallyAbledType: '',
        nationality: '', religion: '', caste: '', subcaste: '', aadharNo: '',
        bloodGroup: '', allergicTo: '', interest: '',

        // Last School Details
        lastSchoolName: '', classCompleted: '', lastAcademicYear: '',
        reasonForLeaving: '', board: '',

        // Father Details
        fatherName: '', fatherAge: '', fatherQualification: '', fatherProfession: '',
        fatherAnnualIncome: '', fatherPhoneNo: '', fatherAadharNo: '', fatherEmail: '',

        // Mother Details
        motherName: '', motherAge: '', motherQualification: '', motherProfession: '',
        motherAnnualIncome: '', motherPhoneNo: '', motherAadharNo: '', motherEmail: '',
        relationshipStatus: '',

        // Guardian Details (if divorced/other)
        guardianName: '', guardianContactNo: '', guardianRelationToStudent: '',
        guardianQualification: '', guardianProfession: '', guardianEmail: '', guardianAadharNo: '',

        // Address Details
        presentAddress: '', permanentAddress: '',

        // Other Details
        homeLanguage: '', yearlyBudget: '',
        // Note: 'siblings' is handled separately as it's a list
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                studId: currentUser.authId, // Using authId as the student identifier
                schoolId: schoolId,
            };
            await submitApplication(payload);
            toast.success("Application submitted successfully!");
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || "Failed to submit application.");
        }
    };
    
    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="bg-gray-100 min-h-screen py-12">
            <div className="container mx-auto max-w-4xl px-4">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="text-center mb-8">
                        <FileText size={40} className="mx-auto text-indigo-600 mb-4" />
                        <h1 className="text-3xl font-bold text-gray-800">Student Application Form</h1>
                        <p className="text-gray-500 mt-2">Step {step} of 3</p>
                    </div>

                    {step === 1 && (
                        <section>
                            <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3 flex items-center"><User className="mr-2" />Student's Personal Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required />
                                <FormField label="Location" name="location" value={formData.location} onChange={handleInputChange} required />
                                <FormField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} required />
                                <FormField label="Gender" name="gender" type="select" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleInputChange} required />
                                <FormField label="Mother Tongue" name="motherTongue" value={formData.motherTongue} onChange={handleInputChange} required />
                                <FormField label="Aadhar No" name="aadharNo" value={formData.aadharNo} onChange={handleInputChange} required />
                                <FormField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} required />
                                <FormField label="Interests" name="interest" value={formData.interest} onChange={handleInputChange} required />
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section>
                            <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3 flex items-center"><Users className="mr-2" />Parents' Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleInputChange} required />
                                <FormField label="Father's Profession" name="fatherProfession" value={formData.fatherProfession} onChange={handleInputChange} required />
                                <FormField label="Father's Phone No" name="fatherPhoneNo" value={formData.fatherPhoneNo} onChange={handleInputChange} required />
                                <FormField label="Father's Email" name="fatherEmail" type="email" value={formData.fatherEmail} onChange={handleInputChange} required />
                                <FormField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleInputChange} required />
                                <FormField label="Mother's Profession" name="motherProfession" value={formData.motherProfession} onChange={handleInputChange} required />
                                <FormField label="Mother's Phone No" name="motherPhoneNo" value={formData.motherPhoneNo} onChange={handleInputChange} required />
                                <FormField label="Mother's Email" name="motherEmail" type="email" value={formData.motherEmail} onChange={handleInputChange} required />
                                <FormField label="Relationship Status" name="relationshipStatus" type="select" options={['Married', 'Divorced', 'Single Mother', 'Single Father', 'Widowed', 'Other']} value={formData.relationshipStatus} onChange={handleInputChange} required />
                            </div>
                        </section>
                    )}
                    
                    {step === 3 && (
                         <section>
                            <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3 flex items-center"><Home className="mr-2" />Address & Other Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Present Address" name="presentAddress" value={formData.presentAddress} onChange={handleInputChange} required />
                                <FormField label="Permanent Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} required />
                                <FormField label="Language Spoken at Home" name="homeLanguage" value={formData.homeLanguage} onChange={handleInputChange} required />
                                <FormField label="Yearly School Budget" name="yearlyBudget" value={formData.yearlyBudget} onChange={handleInputChange} required />
                            </div>
                        </section>
                    )}

                    <div className="flex justify-between mt-10 border-t pt-6">
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="px-6 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                Previous
                            </button>
                        )}
                        {step < 3 && (
                            <button type="button" onClick={nextStep} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 ml-auto">
                                Next
                            </button>
                        )}
                        {step === 3 && (
                            <button type="submit" className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 ml-auto">
                                Submit Application
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentApplicationPage;