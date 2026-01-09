import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxy in vite.config.ts will handle this
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.debug(`[API] Adding token to request for ${config.url}: ${token.substring(0, 20)}...`);
      } else {
        console.warn(`[API] No auth token found in localStorage for request to ${config.url}`);
      }
    } catch (error) {
      console.error('Error accessing localStorage in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(`[API] 401 Unauthorized on ${error.config?.url}`, error.response?.data);
      // Token might be invalid, clear it and redirect to login
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
      // Window will reload and ProtectedRoute will redirect to login
      window.location.href = '/';
    } else if (error.response?.status) {
      console.error(`[API] Error ${error.response.status} on ${error.config?.url}`, error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default api;
