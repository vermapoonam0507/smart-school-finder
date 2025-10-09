import axios from 'axios';

// Remove /api from base URL, backend already has proper route prefixes
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://backend-tc-sa-v2.onrender.com';

console.log('🔧 Axios Base URL:', apiBaseURL);

const apiClient = axios.create({
  baseURL: apiBaseURL,
});

// Add auth token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status);
    const message = error?.response?.data?.message || error.message || 'Request failed';
    error.normalizedMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;
