// src/utils/distanceUtils.js

/**
 * Calculate the distance between two points using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)} Km`;
  } else {
    return `${Math.round(distance)} Km`;
  }
};

/**
 * Get user's current location
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Extract coordinates from school data
 * @param {Object} school - School object
 * @returns {Object|null} Coordinates object or null if not found
 */
export const extractSchoolCoordinates = (school) => {
  // Try different possible coordinate field names
  if (school.coordinates) {
    return {
      latitude: school.coordinates.latitude || school.coordinates.lat,
      longitude: school.coordinates.longitude || school.coordinates.lng || school.coordinates.lon
    };
  }
  
  if (school.location && typeof school.location === 'object') {
    return {
      latitude: school.location.latitude || school.location.lat,
      longitude: school.location.longitude || school.location.lng || school.location.lon
    };
  }
  
  if (school.lat && school.lng) {
    return {
      latitude: school.lat,
      longitude: school.lng
    };
  }
  
  if (school.latitude && school.longitude) {
    return {
      latitude: school.latitude,
      longitude: school.longitude
    };
  }
  
  return null;
};

/**
 * Calculate and add distance to schools array
 * @param {Array} schools - Array of school objects
 * @param {Object} userLocation - User's location {latitude, longitude}
 * @returns {Array} Schools array with distance added
 */
export const addDistanceToSchools = (schools, userLocation) => {
  if (!userLocation || !Array.isArray(schools)) {
    return schools;
  }

  return schools.map(school => {
    const schoolCoords = extractSchoolCoordinates(school);
    
    if (schoolCoords && schoolCoords.latitude && schoolCoords.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        schoolCoords.latitude,
        schoolCoords.longitude
      );
      
      return {
        ...school,
        distance: formatDistance(distance),
        distanceValue: distance // Keep numeric value for sorting
      };
    }
    
    return school;
  });
};

export default {
  calculateDistance,
  formatDistance,
  getCurrentLocation,
  extractSchoolCoordinates,
  addDistanceToSchools
};
