import api from './axios';

export const getUsers = () =>
  api.get('/users').then(res => res.data);

export const getUser = (id) =>
  api.get(`/users/${id}`).then(res => res.data);

export const createUser = (data) =>
  api.post('/users', data).then(res => res.data);

export const updateUser = (id, data) =>
  api.patch(`/users/${id}`, data).then(res => res.data);

export const resetUserPassword = (id, newPassword) =>
  api.patch(`/users/${id}/reset-password`, { newPassword }).then(res => res.data);

export const deleteUser = (id) =>
  api.delete(`/users/${id}`).then(res => res.data);
