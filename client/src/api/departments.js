import api from './axios';

export const getDepartments = (signal) =>
  api.get('/departments', { signal }).then(res => res.data);

export const getDepartment = (slug, signal) =>
  api.get(`/departments/${slug}`, { signal }).then(res => res.data);

export const updateDepartment = (id, data) =>
  api.patch(`/departments/${id}`, data).then(res => res.data);
