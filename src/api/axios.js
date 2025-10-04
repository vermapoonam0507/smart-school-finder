// src/api/axios.js

import axios from 'axios';

// Hardcode API base to avoid relative/localhost issues in dev
const apiBaseURL = 'http://localhost:8080/api';

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

// Final safety: ensure absolute base URL
if (!apiClient.defaults.baseURL || apiClient.defaults.baseURL.startsWith('/')) {
  apiClient.defaults.baseURL = apiBaseURL;
}

export default apiClient;
