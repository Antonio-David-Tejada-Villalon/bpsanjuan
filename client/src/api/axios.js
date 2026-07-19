import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor: adjunta el token de usuario público si existe.
// El token de staff viaja automáticamente vía httpOnly cookie (no se almacena en localStorage).
api.interceptors.request.use(config => {
  const publicToken = localStorage.getItem('publicToken');
  if (publicToken) {
    config.headers.Authorization = `Bearer ${publicToken}`;
  }
  return config;
});

// Interceptor: manejo global de errores 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin') || currentPath.startsWith('/panel')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
