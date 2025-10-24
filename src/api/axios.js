import axios from 'axios';

// Use dev proxy (Vite) in development; direct base URL in production builds
const apiBaseURL = import.meta.env.DEV ? '' : 'https://backend-tc-sa-v2.onrender.com';

console.log('🔧 Axios Base URL:', apiBaseURL);

const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    
    // CORS is handled by the proxy
    
    // Optional silent flag to reduce console noise for internal retries
    const isSilent = config.headers && (config.headers['X-Silent-Request'] === '1');
    if (!isSilent) {
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    const isSilent = response.config?.headers && (response.config.headers['X-Silent-Request'] === '1');
    if (!isSilent) {
      console.log('✅ API Response:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    // Don't log 404 errors for search endpoints and application checks as they're expected when no results found
    const isSearch404 = error.config?.url?.includes('/search') && error.response?.status === 404;
    const isApplicationCheck404 = error.config?.url?.includes('/applications/') && error.response?.status === 404;
    const isSilent = error.config?.headers && (error.config.headers['X-Silent-Request'] === '1');
    
    if (!isSearch404 && !isApplicationCheck404 && !isSilent) {
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
