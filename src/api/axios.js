// src/api/axios.js

import axios from 'axios';

// // Yahan hum server ka main URL daal rahe hain
// const apiClient = axios.create({
//   baseURL: 'http://localhost:8080/api', 
// });

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  // baseURL: 'https://backend-tc-sa-v2.onrender.com/api', 
   
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

export default apiClient;
