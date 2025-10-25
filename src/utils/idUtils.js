/**
 * Utility functions for robust ID extraction and validation
 */

/**
 * Extract ID from various data structures
 * @param {any} idSource - Source to extract ID from
 * @param {any} fallback - Fallback value if no ID found
 * @returns {string|null} Extracted ID or fallback
 */
export const extractId = (idSource, fallback = null) => {
  if (!idSource) return fallback;
  if (typeof idSource === 'string') return idSource;
  if (typeof idSource === 'object') {
    return idSource._id || idSource.id || idSource.studentId || fallback;
  }
  return String(idSource);
};

/**
 * Extract student ID from user or application object
 * @param {Object} userOrApplication - User or application object
 * @returns {string|null} Student ID
 */
export const extractStudentId = (userOrApplication) => {
  if (!userOrApplication) return null;
  return extractId(userOrApplication.studentId || userOrApplication._id || userOrApplication.studId);
};

/**
 * Extract form ID from application object
 * @param {Object} application - Application object
 * @returns {string|null} Form ID
 */
export const extractFormId = (application) => {
  if (!application) return null;
  return extractId(application.formId || application._id || application.id);
};

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};
