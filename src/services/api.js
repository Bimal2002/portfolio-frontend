import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestId = error.response?.headers?.['x-request-id'];
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Show toast for other API errors
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Unexpected error, please try again later';
    if (status && status !== 401) {
      toast.error(`${message}${requestId ? ` (ref: ${requestId})` : ''}`);
      // Also helpful during debugging
      // eslint-disable-next-line no-console
      if (requestId) console.warn('Request failed. X-Request-ID:', requestId);
    }
    return Promise.reject(error);
  }
);

export default api;
