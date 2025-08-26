// src/api/axios.js

import axios from 'axios';

// // Yahan hum server ka main URL daal rahe hain
// const apiClient = axios.create({
//   baseURL: 'http://localhost:8080/api', 
// });

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
});


// === Request Interceptor ===
// Yeh function har request bhejne se pehle chalega
apiClient.interceptors.request.use(
  (config) => {
    // Hum local storage se token nikalenge
    const token = localStorage.getItem('authToken');

    // Agar token hai, to usko request ke header me daal denge
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config; // Request ko aage bhej denge
  },
  (error) => {
    // Agar request me koi error hai to usko yahan handle karenge
    return Promise.reject(error);
  }
);

export default apiClient;
