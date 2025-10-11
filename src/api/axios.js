import axios from 'axios';

// Remove /api from base URL to avoid double prefix
const apiBaseURL = (import.meta.env.VITE_API_BASE_URL || 'https://backend-tc-sa-v2.onrender.com').replace(/\/api\/?$/, '');

console.log('🔧 Axios Base URL:', apiBaseURL);

const apiClient = axios.create({
  baseURL: apiBaseURL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Clean up URL - ensure single /api prefix
    if (!config.url.startsWith('/api/')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
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
    // Don't log 404 errors for search endpoints as they're expected when no results found
    const isSearch404 = error.config?.url?.includes('/search') && error.response?.status === 404;
    
    if (!isSearch404) {
      console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data);
    }
    
    let message;
    if (error.response?.status === 401) {
      message = 'Invalid credentials or session expired. Please try logging in again.';
    } else if (error.response?.status === 404) {
      message = 'API endpoint not found. Please contact support.';
    } else {
      message = error.response?.data?.message || error.message || 'Request failed';
    }
    
    error.normalizedMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;
