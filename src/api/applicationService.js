// src/api/applicationService.js
import apiClient from './axios';

/**
 * ============================
 * APPLICATION FLOW SERVICE
 * ============================
 * 
 * Step 1: Check if Application Exists
 * ├─> GET /api/applications/:studId
 * │
 * ├─> If ERROR (404 - No application found):
 * │   └─> Show Application Form to fill
 * │       └─> User fills the form with all details
 * │       └─> POST /api/applications/ (create new application)
 * │       └─> Then proceed to Step 2
 * │
 * └─> If SUCCESS (200 - Application found):
 *     └─> Application already exists
 *     └─> Proceed directly to Step 2
 * 
 * Step 2: Submit Form to School
 * └─> POST /api/form/:schoolId/:studId/:formId
 *     └─> Creates Form submission record
 *     └─> Links: Student + School + Application PDF
 *     └─> Status: "Pending"
 */

/**
 * Step 1: Check if application exists for a student
 * @param {string} studId - Student ID
 * @returns {Promise<Object>} Application data if exists, null if not found
 */
export const checkApplicationExists = async (studId) => {
  try {
    const response = await apiClient.get(`/api/applications/${studId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Application not found - this is expected for new students
      console.log('No application found for studentId:', studId);
      return null;
    }
    console.error('Error checking application:', error);
    throw error;
  }
};

/**
 * Create a new student application
 * @param {Object} applicationData - Application form data
 * @returns {Promise<Object>} Created application data
 */
export const createApplication = async (applicationData) => {
  try {
    const response = await apiClient.post('/api/applications/', applicationData);
    return response.data;
  } catch (error) {
    console.error('Error creating application:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get application by student ID
 * @param {string} studId - Student ID
 * @returns {Promise<Object>} Application data
 */
export const getApplicationByStudentId = async (studId) => {
  try {
    const response = await apiClient.get(`/api/applications/${studId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update existing application
 * @param {string} studId - Student ID
 * @param {Object} updateData - Updated application data
 * @returns {Promise<Object>} Updated application data
 */
export const updateApplication = async (studId, updateData) => {
  try {
    const response = await apiClient.put(`/api/applications/${studId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating application:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Delete application
 * @param {string} studId - Student ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteApplication = async (studId) => {
  try {
    const response = await apiClient.delete(`/api/applications/${studId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting application:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Check if form has already been submitted to a school
 * @param {string} schoolId - School ID
 * @param {string} studId - Student ID  
 * @param {string} formId - Form/Application ID
 * @returns {Promise<Object>} Form submission status
 */
export const checkFormSubmission = async (schoolId, studId, formId) => {
  try {
    // Get all forms for this student
    const forms = await getFormsByStudent(studId);
    const existingForm = forms.data?.find(form => 
      form.schoolId === schoolId || form.schoolId._id === schoolId
    );
    
    return {
      exists: !!existingForm,
      form: existingForm
    };
  } catch (error) {
    console.error('Error checking form submission:', error.response?.data || error.message);
    return { exists: false, form: null };
  }
};

/**
 * Step 2: Submit form to school
 * @param {string} schoolId - School ID
 * @param {string} studId - Student ID  
 * @param {string} formId - Form/Application ID
 * @returns {Promise<Object>} Form submission result
 */
export const submitFormToSchool = async (schoolId, studId, formId) => {
  try {
    // First check if already submitted
    const submissionCheck = await checkFormSubmission(schoolId, studId, formId);
    if (submissionCheck.exists) {
      console.log('Form already submitted to this school:', submissionCheck.form);
      return {
        success: true,
        message: 'Form already submitted to this school',
        data: submissionCheck.form,
        alreadySubmitted: true
      };
    }

    const response = await apiClient.post(`/api/form/${schoolId}/${studId}/${formId}`);
    return response.data;
  } catch (error) {
    // Handle 409 Conflict (duplicate submission)
    if (error.response?.status === 409) {
      console.log('Form already submitted to this school (409 Conflict)');
      return {
        success: true,
        message: 'Form already submitted to this school',
        alreadySubmitted: true
      };
    }
    console.error('Error submitting form to school:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get forms by student
 * @param {string} studId - Student ID
 * @returns {Promise<Object>} Student forms data
 */
export const getFormsByStudent = async (studId) => {
  try {
    const response = await apiClient.get(`/api/form/student/${studId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by student:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get forms by school
 * @param {string} schoolId - School ID
 * @returns {Promise<Object>} School forms data
 */
export const getFormsBySchool = async (schoolId) => {
  try {
    const response = await apiClient.get(`/api/form/school/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by school:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Track form status
 * @param {string} formId - Form ID
 * @returns {Promise<Object>} Form tracking data
 */
export const trackForm = async (formId) => {
  try {
    const response = await apiClient.get(`/api/form/track/${formId}`);
    return response.data;
  } catch (error) {
    console.error('Error tracking form:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update form status
 * @param {string} formId - Form ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated form data
 */
export const updateFormStatus = async (formId, status) => {
  try {
    const response = await apiClient.put(`/api/form/${formId}?status=${status}`);
    return response.data;
  } catch (error) {
    console.error('Error updating form status:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Complete application flow: Check if exists, create if needed, then submit to school
 * @param {string} studId - Student ID
 * @param {string} schoolId - School ID
 * @param {Object} applicationData - Application form data (if creating new)
 * @returns {Promise<Object>} Complete flow result
 */
export const completeApplicationFlow = async (studId, schoolId, applicationData = null) => {
  try {
    // Step 1: Check if application exists
    let application = await checkApplicationExists(studId);
    
    if (!application) {
      // Scenario A: First-time applicant
      if (!applicationData) {
        throw new Error('Application data is required to create new application');
      }
      
      console.log('Creating new application (First-time applicant)...');
      const createResult = await createApplication(applicationData);
      application = createResult.data;
      console.log('Application created:', application);
    } else {
      // Scenario B: Returning applicant
      console.log('Application already exists (Returning applicant):', application);
    }
    
    // Step 2: Submit form to school using application ID as formId
    console.log('Submitting form to school...');
    const formId = application._id || application.id; // formId = application ID
    const submitResult = await submitFormToSchool(schoolId, studId, formId);
    
    return {
      success: true,
      application,
      formSubmission: submitResult,
      message: 'Application flow completed successfully',
      scenario: application ? 'returning' : 'first-time'
    };
    
  } catch (error) {
    console.error('Error in complete application flow:', error);
    throw error;
  }
};

/**
 * Handle application flow based on scenarios
 * @param {string} studId - Student ID
 * @param {string} schoolId - School ID
 * @param {Object} applicationData - Application form data (optional)
 * @returns {Promise<Object>} Flow result with scenario info
 */
export const handleApplicationFlow = async (studId, schoolId, applicationData = null) => {
  try {
    // Check if application exists
    const existingApplication = await checkApplicationExists(studId);
    
    if (!existingApplication) {
      // Scenario A: First-time applicant
      if (!applicationData) {
        return {
          scenario: 'first-time',
          needsForm: true,
          message: 'No application found. Please fill out the application form.',
          application: null
        };
      }
      
      // Create new application
      const createResult = await createApplication(applicationData);
      const application = createResult.data;
      
      // Submit to school
      const formId = application._id || application.id;
      const submitResult = await submitFormToSchool(schoolId, studId, formId);
      
      return {
        scenario: 'first-time',
        needsForm: false,
        application,
        formSubmission: submitResult,
        message: 'Application created and submitted successfully'
      };
      
    } else {
      // Scenario B: Returning applicant
      const application = existingApplication.data;
      const formId = application._id || application.id;
      
      // Submit to school using existing application
      const submitResult = await submitFormToSchool(schoolId, studId, formId);
      
      return {
        scenario: 'returning',
        needsForm: false,
        application,
        formSubmission: submitResult,
        message: submitResult.alreadySubmitted 
          ? 'Application already submitted to this school'
          : 'Application submitted successfully using existing data'
      };
    }
    
  } catch (error) {
    console.error('Error in application flow:', error);
    throw error;
  }
};

/**
 * Update existing application (Scenario C)
 * @param {string} studId - Student ID
 * @param {Object} updateData - Updated application data
 * @returns {Promise<Object>} Updated application
 */
export const updateExistingApplication = async (studId, updateData) => {
  try {
    const response = await apiClient.put(`/api/applications/${studId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating application:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
