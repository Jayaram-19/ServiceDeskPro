import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // For refresh tokens in cookies
});

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem('accessToken', data.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
