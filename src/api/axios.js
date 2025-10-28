import axios from 'axios';

// Use dev proxy (Vite) in development; direct base URL in production builds
const apiBaseURL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL || 'https://backend-tc-sa-v2.onrender.com/api';

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
    
    // In development, use proxy (no /api prefix needed)
    // In production, the base URL already includes /api
    if (import.meta.env.DEV && !config.url.startsWith('/api/')) {
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
    const url = error.config?.url || '';
    const status = error.response?.status;
    const isSearch404 = url.includes('/search') && status === 404;
    const isApplicationCheck404 = url.includes('/applications/') && status === 404;

    // Suppress expected 404s for missing school sub-resources on profile view
    const isSchoolSubResource404 = status === 404 && (
      url.includes('/schools/amenities/') ||
      url.includes('/schools/activities/') ||
      url.includes('/schools/infrastructure/') ||
      url.includes('/schools/fees-scholarships/') ||
      url.includes('/schools/technology-adoption/') ||
      url.includes('/schools/safety-security/') ||
      url.includes('/schools/international-exposure/') ||
      url.includes('/schools/other-details/') ||
      url.includes('/schools/admission-timeline/') ||
      url.includes('/schools/academics/') ||
      url.includes('/schools/faculty/')
    );

    const isSilent = error.config?.headers && (error.config.headers['X-Silent-Request'] === '1');
    
    if (!isSearch404 && !isApplicationCheck404 && !isSchoolSubResource404 && !isSilent) {
      console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data);
    }
    
    let message;
    if (status === 401) {
      message = 'Invalid credentials or session expired. Please try logging in again.';
    } else if (status === 404) {
      // Use backend-provided message if available; otherwise a neutral not-found
      message = error.response?.data?.message || 'Resource not found.';
    } else {
      message = error.response?.data?.message || error.message || 'Request failed';
    }
    
    error.normalizedMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;
