/**
 * Utility functions for MongoDB ObjectId validation and handling
 */

/**
 * Validates if a string is a valid MongoDB ObjectId format
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validates school ID and throws error if invalid
 * @param {string} schoolId - The school ID to validate
 * @throws {Error} - If ID is invalid
 */
export const validateSchoolId = (schoolId) => {
  if (!schoolId) {
    throw new Error('School ID is required');
  }
  
  if (!isValidObjectId(schoolId)) {
    throw new Error(`Invalid school ID format: ${schoolId}. Expected MongoDB ObjectId format (24-character hexadecimal string).`);
  }
  
  return true;
};

/**
 * Safely extracts and validates school ID from URL parameters
 * @param {string} schoolId - The school ID from URL params
 * @returns {string|null} - Valid school ID or null if invalid
 */
export const getValidSchoolId = (schoolId) => {
  try {
    validateSchoolId(schoolId);
    return schoolId;
  } catch (error) {
    console.error('School ID validation failed:', error.message);
    return null;
  }
};

/**
 * Common error handler for invalid school IDs
 * @param {string} schoolId - The invalid school ID
 * @param {Function} navigate - Navigation function
 * @param {string} fallbackRoute - Route to navigate to on error
 */
export const handleInvalidSchoolId = (schoolId, navigate, fallbackRoute = '/schools') => {
  console.error(`Invalid school ID format: ${schoolId}. Expected MongoDB ObjectId format.`);
  navigate(fallbackRoute);
};


