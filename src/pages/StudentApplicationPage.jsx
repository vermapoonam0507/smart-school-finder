// src/pages/StudentApplicationPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { submitApplication, generateStudentPdf } from '../api/userService';
import { createApplication, checkApplicationExists, updateExistingApplication, submitFormToSchool } from '../api/applicationService';
import eventEmitter from '../utils/eventEmitter';
import { getSchoolById } from '../api/adminService';
import { FileText, User, Users, Home, BookOpen, PlusCircle, Trash2, Shield } from 'lucide-react';

const FormField = ({ label, name, type = 'text', value, onChange, required = false, options = null, checked }) => {
    if (type === 'select') {
        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                    {label}{required && <span className="text-red-500">*</span>}
                </label>
                <select
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    required={required}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                >
                    <option value="">Select...</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        );
    }
    if (type === 'checkbox') {
        return (
            <div className="flex items-center pt-6">
                <input
                    id={name}
                    name={name}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor={name} className="ml-2 block text-sm font-medium text-gray-900">
                    {label}
                </label>
            </div>
        );
    }
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label}{required && <span className="text-red-500">*</span>}
            </label>
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
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [existingApplication, setExistingApplication] = useState(null);
    const [formData, setFormData] = useState({
        name: '', location: '', dob: '', age: '', gender: '', motherTongue: '',
        placeOfBirth: '', speciallyAbled: false, speciallyAbledType: '',
        nationality: '', religion: '', caste: '', subcaste: '', aadharNo: '',
        bloodGroup: '', allergicTo: '', interest: '',
        lastSchoolName: '', classCompleted: '', lastAcademicYear: '',
        reasonForLeaving: '', board: '',
        fatherName: '', fatherAge: '', fatherQualification: '', fatherProfession: '',
        fatherAnnualIncome: '', fatherPhoneNo: '', fatherAadharNo: '', fatherEmail: '',
        motherName: '', motherAge: '', motherQualification: '', motherProfession: '',
        motherAnnualIncome: '', motherPhoneNo: '', motherAadharNo: '', motherEmail: '',
        relationshipStatus: '',
        guardianName: '', guardianContactNo: '', guardianRelationToStudent: '',
        guardianQualification: '', guardianProfession: '', guardianEmail: '', guardianAadharNo: '',
        presentAddress: '', permanentAddress: '',
        homeLanguage: '', yearlyBudget: '',
    });
    const [siblings, setSiblings] = useState([]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSiblingChange = (index, event) => {
        const { name, value } = event.target;
        const values = [...siblings];
        values[index][name] = value;
        setSiblings(values);
    };

    const addSibling = () => {
        setSiblings([...siblings, { name: '', age: '', sex: '', nameOfInstitute: '', className: '' }]);
    };

    const removeSibling = (index) => {
        const values = [...siblings];
        values.splice(index, 1);
        setSiblings(values);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate only the most essential required fields
        const requiredFields = [
            'name', 'location', 'dob', 'gender', 'motherTongue', 'nationality',
            'religion', 'caste', 'aadharNo', 'bloodGroup', 'interest',
            'fatherName', 'fatherAge', 'fatherQualification', 'fatherProfession',
            'fatherAnnualIncome', 'fatherPhoneNo', 'fatherAadharNo', 'fatherEmail',
            'motherName', 'motherAge', 'motherQualification', 'motherProfession',
            'motherAnnualIncome', 'motherPhoneNo', 'motherAadharNo', 'motherEmail',
            'relationshipStatus', 'presentAddress', 'permanentAddress', 'homeLanguage', 'yearlyBudget'
        ];

        // Check if any essential fields are missing
        const essentialFields = ['name', 'gender', 'dob', 'fatherName', 'motherName'];
        const missingEssential = essentialFields.filter(field =>
            !formData[field] || formData[field].toString().trim() === ''
        );

        if (missingEssential.length > 0) {
            console.log('Missing essential fields:', missingEssential);
            toast.error(`Please fill in essential fields: ${missingEssential.join(', ')}`);
            return;
        }

        // Log all form data for debugging
        console.log('All form data:', formData);
        console.log('Siblings data:', siblings);

        console.log('Starting submission process...');
        setIsSubmitting(true);
        try {
            // Get the correct student ID - use student profile ID if available, otherwise auth ID
            const studentId = currentUser.studentId || currentUser._id;
            console.log('🔍 Using student ID for application:', studentId, 'from user:', currentUser);
            
            const payload = {
                ...formData,
                siblings,
                studId: studentId,
                schoolId: schoolId,
                schoolName: school.name,
                schoolEmail: school.email,  // MAKE SURE THIS IS INCLUDED
            };
            
            console.log('📦 Application payload:', payload);
            console.log('🏫 School info:', {
                id: schoolId,
                name: school.name,
                email: school.email
            });
            
            let result;
            if (isUpdate && existingApplication) {
                // Scenario C: Update existing application
                result = await updateExistingApplication(currentUser._id, payload);
                toast.success("Application updated successfully!");
            } else {
                // Scenario A: Create new application
                result = await createApplication(payload);
                toast.success("Application created successfully!");
            }
            
            // CRITICAL: Submit the application to the school
            console.log('📤 Submitting application to school...');
            const applicationId = result.data?._id || result.data?.id || result._id;
            if (applicationId) {
                try {
                    const formSubmission = await submitFormToSchool(schoolId, studentId, applicationId);
                    console.log('✅ Application submitted to school:', formSubmission);
                    
                    if (formSubmission.alreadySubmitted) {
                        toast.info("Application already submitted to this school!");
                    } else {
                        toast.success("Application submitted to school successfully!");
                    }
                } catch (submitError) {
                    console.error('❌ Failed to submit to school:', submitError);
                    toast.error("Application created but failed to submit to school. Please try again.");
                    return; // Don't proceed if school submission fails
                }
            } else {
                console.error('❌ No application ID found for school submission');
                toast.error("Application created but could not submit to school.");
                return;
            }

            // Generate PDF automatically after successful submission
            console.log('📄 Generating PDF for student:', studentId);
            try {
                await generateStudentPdf(studentId);
                console.log('✅ PDF generated successfully after submission');
                toast.success("PDF generated successfully!");
            } catch (pdfError) {
                console.error('❌ Failed to generate PDF after submission:', pdfError);
                toast.warning("Application submitted but PDF generation failed. You can generate it later from your dashboard.");
                // Don't return here - application was saved successfully, PDF failure shouldn't block the flow
            }
            
            // Emit event to notify school portal of new application
            eventEmitter.emit('applicationAdded', {
              schoolId: schoolId,
              schoolEmail: school.email,
              applicationData: result.data
            });
            
            setSubmitted(true);
            
            // Navigate back to application flow page to show updated status
            setTimeout(() => {
                navigate(`/apply/${schoolId}`);
            }, 2000); // Give user time to see success message
        } catch (error) {
            console.error("Submission Error:", error);
            toast.error(`Submission failed: ${error.message || 'Please ensure all required fields are filled.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const showGuardianFields = ['Divorced', 'Single Mother', 'Single Father', 'Widowed', 'Other'].includes(formData.relationshipStatus);

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    // Allow all authenticated users to access student application forms
    // School users can now submit applications to other schools if needed
    // useEffect(() => {
    //     if (currentUser && currentUser.userType === 'school') {
    //         toast.error('School accounts cannot submit student applications.');
    //         navigate('/school-portal');
    //     }
    // }, [currentUser, navigate]);

    // Fetch school details to get school name
    useEffect(() => {
        const fetchSchool = async () => {
            if (!schoolId) {
                console.error('❌ StudentApplicationPage: No schoolId provided');
                toast.error('No school ID provided');
                navigate('/schools');
                return;
            }
            
            console.log('🏫 StudentApplicationPage: Valid schoolId provided:', schoolId);

            try {
                setLoading(true);
                console.log('🏫 StudentApplicationPage: Starting school fetch for schoolId:', schoolId);
                console.log('🏫 StudentApplicationPage: Current loading state:', loading);
                
                // Add timeout to prevent hanging
                const response = await Promise.race([
                    getSchoolById(schoolId),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('School details request timeout')), 10000)
                    )
                ]);
                console.log('🏫 StudentApplicationPage: Raw API response:', response);
                
                const schoolData = response?.data?.data || response?.data;
                console.log('✅ StudentApplicationPage: School details fetched:', schoolData);
                
                if (!schoolData) {
                    console.error('❌ StudentApplicationPage: No school data in response');
                    throw new Error('No school data received');
                }
                
                setSchool(schoolData);
                console.log('✅ StudentApplicationPage: School state set successfully');
            } catch (error) {
                console.error('❌ StudentApplicationPage: Error fetching school details:', error);
                console.error('❌ StudentApplicationPage: Error details:', error.response?.data || error.message);
                toast.error('Could not load school details');
                navigate('/schools');
            } finally {
                console.log('🏁 StudentApplicationPage: School fetching completed, setting loading to false');
                setLoading(false);
            }
        };

        fetchSchool();
    }, [schoolId, navigate]);

    // Check for update mode and load existing application
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const updateMode = urlParams.get('update') === 'true';
        setIsUpdate(updateMode);

        if (updateMode && currentUser?._id) {
            loadExistingApplication();
        }
    }, [currentUser]);

    const loadExistingApplication = async () => {
        try {
            const response = await checkApplicationExists(currentUser._id);
            if (response && response.data) {
                setExistingApplication(response.data);
                const appData = response.data;
                
                // Pre-populate form with existing data, ensuring all fields are properly mapped
                setFormData(prevData => ({
                    ...prevData,
                    ...appData,
                    // Ensure specific fields are properly set even if they're undefined
                    name: appData.name || prevData.name,
                    location: appData.location || prevData.location,
                    dob: appData.dob || prevData.dob,
                    age: appData.age || prevData.age,
                    gender: appData.gender || prevData.gender,
                    motherTongue: appData.motherTongue || prevData.motherTongue
                }));
                
                // Handle siblings separately as it's an array
                if (appData.siblings && Array.isArray(appData.siblings) && appData.siblings.length > 0) {
                    setSiblings(appData.siblings);
                }
                
                console.log('✅ Existing application loaded successfully:', appData);
                toast.info('Existing application loaded. You can update the information.');
            }
        } catch (error) {
            console.error('❌ Error loading existing application:', error);
            toast.error('Failed to load existing application');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading school details...</p>
                </div>
            </div>
        );
    }

    if (!school) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Could not load school details.</p>
                    <button
                        onClick={() => navigate('/schools')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Back to Schools
                    </button>
                </div>
            </div>
        );
    }

    const handleGenerateAndOpenPdf = async () => {
        try {
            await generateStudentPdf(currentUser._id);
        } catch (_) {}
        // Use relative path so dev proxy/axios base routes to the correct backend
        window.open(`/api/users/pdf/view/${currentUser._id}`, '_blank');
    };

    return (
        <div className="bg-gray-100 min-h-screen py-12">
            <div className="container mx-auto max-w-4xl px-4">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="text-center mb-8">
                        <FileText size={40} className="mx-auto text-indigo-600 mb-4" />
                        <h1 className="text-3xl font-bold text-gray-800">Student Application Form</h1>
                        <p className="text-gray-500 mt-2">Step {step} of 4</p>
                    </div>

                    {submitted && (
                        <div className="mb-8 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
                            <div className="flex items-center justify-between flex-col md:flex-row gap-3">
                                <span>Your application has been submitted and PDF generated successfully!</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => window.open(`/api/users/pdf/view/${currentUser._id}`, '_blank')}
                                        className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
                                    >
                                        View PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/application-status')}
                                        className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Go to Application Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <section className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 flex items-center">
                                <User className="mr-2" />Student's Personal Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required />
                                <FormField label="Location" name="location" value={formData.location} onChange={handleInputChange} required />
                                <FormField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} required />
                                <FormField label="Age" name="age" type="number" value={formData.age} onChange={handleInputChange} required />
                                <FormField label="Gender" name="gender" type="select" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleInputChange} required />
                                <FormField label="Mother Tongue" name="motherTongue" value={formData.motherTongue} onChange={handleInputChange} required />
                                <FormField label="Place of Birth" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} />
                                <FormField label="Nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} required />
                                <FormField label="Religion" name="religion" value={formData.religion} onChange={handleInputChange} required />
                                <FormField label="Caste" name="caste" value={formData.caste} onChange={handleInputChange} required />
                                <FormField label="Subcaste" name="subcaste" value={formData.subcaste} onChange={handleInputChange} />
                                <FormField label="Aadhar No" name="aadharNo" value={formData.aadharNo} onChange={handleInputChange} required />
                                <FormField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} required />
                                <FormField label="Any Allergies" name="allergicTo" value={formData.allergicTo} onChange={handleInputChange} />
                                <FormField label="Interests/Hobbies" name="interest" value={formData.interest} onChange={handleInputChange} required />
                                <div className="md:col-span-2">
                                    <FormField label="Specially Abled" name="speciallyAbled" type="checkbox" checked={formData.speciallyAbled} onChange={handleInputChange} />
                                    {formData.speciallyAbled && (
                                        <FormField label="Type of Disability" name="speciallyAbledType" value={formData.speciallyAbledType} onChange={handleInputChange} />
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 flex items-center">
                                <BookOpen className="mr-2" />Previous School Details (if any)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Last School Name" name="lastSchoolName" value={formData.lastSchoolName} onChange={handleInputChange} />
                                <FormField label="Class Completed" name="classCompleted" value={formData.classCompleted} onChange={handleInputChange} />
                                <FormField label="Last Academic Year" name="lastAcademicYear" value={formData.lastAcademicYear} onChange={handleInputChange} />
                                <FormField label="Reason For Leaving" name="reasonForLeaving" value={formData.reasonForLeaving} onChange={handleInputChange} />
                                <FormField label="Board" name="board" value={formData.board} onChange={handleInputChange} />
                            </div>
                        </section>
                    )}

                    {step === 3 && (
                        <section className="space-y-8">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 flex items-center">
                                <Users className="mr-2" />Parents' & Guardian's Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleInputChange} required />
                                <FormField label="Father's Age" name="fatherAge" type="number" value={formData.fatherAge} onChange={handleInputChange} required />
                                <FormField label="Father's Qualification" name="fatherQualification" value={formData.fatherQualification} onChange={handleInputChange} required />
                                <FormField label="Father's Profession" name="fatherProfession" value={formData.fatherProfession} onChange={handleInputChange} required />
                                <FormField label="Father's Annual Income" name="fatherAnnualIncome" value={formData.fatherAnnualIncome} onChange={handleInputChange} required />
                                <FormField label="Father's Phone No" name="fatherPhoneNo" value={formData.fatherPhoneNo} onChange={handleInputChange} required />
                                <FormField label="Father's Aadhar No" name="fatherAadharNo" value={formData.fatherAadharNo} onChange={handleInputChange} required />
                                <FormField label="Father's Email" name="fatherEmail" type="email" value={formData.fatherEmail} onChange={handleInputChange} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                                <FormField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleInputChange} required />
                                <FormField label="Mother's Age" name="motherAge" type="number" value={formData.motherAge} onChange={handleInputChange} required />
                                <FormField label="Mother's Qualification" name="motherQualification" value={formData.motherQualification} onChange={handleInputChange} required />
                                <FormField label="Mother's Profession" name="motherProfession" value={formData.motherProfession} onChange={handleInputChange} required />
                                <FormField label="Mother's Annual Income" name="motherAnnualIncome" value={formData.motherAnnualIncome} onChange={handleInputChange} required />
                                <FormField label="Mother's Phone No" name="motherPhoneNo" value={formData.motherPhoneNo} onChange={handleInputChange} required />
                                <FormField label="Mother's Aadhar No" name="motherAadharNo" value={formData.motherAadharNo} onChange={handleInputChange} required />
                                <FormField label="Mother's Email" name="motherEmail" type="email" value={formData.motherEmail} onChange={handleInputChange} required />
                            </div>
                            <FormField
                                label="Parents' Relationship Status"
                                name="relationshipStatus"
                                type="select"
                                options={['Married', 'Divorced', 'Single Mother', 'Single Father', 'Widowed', 'Other']}
                                value={formData.relationshipStatus}
                                onChange={handleInputChange}
                                required
                            />

                            {showGuardianFields && (
                                <div className="pt-6 border-t">
                                    <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                                        <Shield className="mr-2" />Guardian's Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField label="Guardian's Name" name="guardianName" value={formData.guardianName} onChange={handleInputChange} />
                                        <FormField label="Guardian's Contact" name="guardianContactNo" value={formData.guardianContactNo} onChange={handleInputChange} />
                                        <FormField label="Relation to Student" name="guardianRelationToStudent" value={formData.guardianRelationToStudent} onChange={handleInputChange} />
                                        <FormField label="Guardian's Qualification" name="guardianQualification" value={formData.guardianQualification} onChange={handleInputChange} />
                                        <FormField label="Guardian's Profession" name="guardianProfession" value={formData.guardianProfession} onChange={handleInputChange} />
                                        <FormField label="Guardian's Email" name="guardianEmail" type="email" value={formData.guardianEmail} onChange={handleInputChange} />
                                        <FormField label="Guardian's Aadhar No" name="guardianAadharNo" value={formData.guardianAadharNo} onChange={handleInputChange} />
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {step === 4 && (
                        <section className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 flex items-center">
                                <Home className="mr-2" />Address & Sibling Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Present Address" name="presentAddress" value={formData.presentAddress} onChange={handleInputChange} required />
                                <FormField label="Permanent Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} required />
                                <FormField label="Language Spoken at Home" name="homeLanguage" value={formData.homeLanguage} onChange={handleInputChange} required />
                                <FormField label="Yearly School Budget (INR)" name="yearlyBudget" value={formData.yearlyBudget} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-700 mb-2">Sibling Information (if any)</h3>
                                {siblings.map((sibling, index) => (
                                    <div key={index} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end bg-gray-50 p-4 rounded-md mb-4 relative">
                                        <div className="col-span-2 md:col-span-1">
                                            <FormField label="Name" name="name" value={sibling.name} onChange={e => handleSiblingChange(index, e)} />
                                        </div>
                                        <div>
                                            <FormField label="Age" name="age" type="number" value={sibling.age} onChange={e => handleSiblingChange(index, e)} />
                                        </div>
                                        <div>
                                            <FormField label="Sex" name="sex" value={sibling.sex} onChange={e => handleSiblingChange(index, e)} />
                                        </div>
                                        <div className="col-span-2">
                                            <FormField label="Institute" name="nameOfInstitute" value={sibling.nameOfInstitute} onChange={e => handleSiblingChange(index, e)} />
                                        </div>
                                        <div className="md:col-span-1">
                                            <FormField label="Class" name="className" value={sibling.className} onChange={e => handleSiblingChange(index, e)} />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSibling(index)}
                                            className="text-red-500 hover:text-red-700 absolute top-1 right-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addSibling}
                                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 mt-2"
                                >
                                    <PlusCircle size={16} className="mr-1" /> Add Sibling
                                </button>
                            </div>
                        </section>
                    )}

                    <div className="flex justify-between mt-10 border-t pt-6">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-6 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md"
                            >
                                Previous
                            </button>
                        )}
                        {step < 4 && (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md ml-auto"
                            >
                                Next
                            </button>
                        )}
                        {step === 4 && (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md ml-auto disabled:bg-gray-400"
                            >
                                {isSubmitting ? 'Submitting...' : (submitted ? 'Submitted' : 'Submit Application')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentApplicationPage;