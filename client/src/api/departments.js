import api from './axios';

export const getDepartments = () =>
  api.get('/departments').then(res => res.data);

export const getDepartment = (slug) =>
  api.get(`/departments/${slug}`).then(res => res.data);

export const updateDepartment = (id, data) =>
  api.patch(`/departments/${id}`, data).then(res => res.data);
