import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor: adjunta el token JWT si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token') || localStorage.getItem('publicToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: manejo global de errores 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Si el token expiró, limpiar storage
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin') || currentPath.startsWith('/panel')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
