import api from './axios';

export const getPublicUsers = (params = {}) =>
  api.get('/public-users', { params }).then(res => res.data);

export const getPublicUser = (id) =>
  api.get(`/public-users/${id}`).then(res => res.data);

export const togglePublicUserActive = (id, isActive) =>
  api.patch(`/public-users/${id}`, { isActive }).then(res => res.data);

export const deletePublicUser = (id) =>
  api.delete(`/public-users/${id}`).then(res => res.data);

export const getMyPublicProfile = () =>
  api.get('/auth/me-public').then(res => res.data);

export const updatePublicProfile = (data) =>
  api.patch('/auth/update-profile-public', data).then(res => res.data);
