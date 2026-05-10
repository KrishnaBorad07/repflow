import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000,
});

// Attach the JWT (if any) on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('repflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 from a protected route, drop the token and bounce to /login.
// We skip /auth/* endpoints because their 401s are user-facing (e.g. wrong
// password) and the page itself shows the error inline.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const reqUrl = error.config?.url || '';
      const isAuthEndpoint = reqUrl.includes('/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem('repflow_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
