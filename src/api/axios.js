// src/api/axios.js

import axios from 'axios';

// Prefer env var, fallback to localhost
const rawBase = import.meta?.env?.VITE_API_URL || 'http://localhost:8080/api';

// Normalize: remove trailing slashes
const apiBaseURL = rawBase.replace(/\/$/, '');

const apiClient = axios.create({
	baseURL: apiBaseURL,
});



apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config; 
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to surface consistent errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Attach a normalized message
    const message = error?.response?.data?.message || error.message || 'Request failed';
    error.normalizedMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;
