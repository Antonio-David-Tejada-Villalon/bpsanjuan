import api from '@/shared/api/axios';

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(res => res.data);

export const logout = () => api.post('/auth/logout').then(res => res.data);

export const getMe = () => api.get('/auth/me').then(res => res.data);

export const getMePublic = () => api.get('/auth/me-public').then(res => res.data);

export const changePassword = (currentPassword, newPassword) =>
  api.patch('/auth/change-password', { currentPassword, newPassword }).then(res => res.data);

export const updateProfile = (data) =>
  api.patch('/auth/update-profile', data).then(res => res.data);

export const googleLoginUrl = () =>
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/auth/google`
    : '/api/auth/google';
