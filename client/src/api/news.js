import api from './axios';

export const getNews = (params = {}) =>
  api.get('/news', { params }).then(res => res.data);

export const getNewsItem = (id) =>
  api.get(`/news/${id}`).then(res => res.data);

export const getAllNewsAdmin = () =>
  api.get('/news/admin/all').then(res => res.data);

export const createNews = (data) =>
  api.post('/news', data).then(res => res.data);

export const updateNews = (id, data) =>
  api.patch(`/news/${id}`, data).then(res => res.data);

export const deleteNews = (id) =>
  api.delete(`/news/${id}`).then(res => res.data);

export const toggleNewsLike = (id) =>
  api.post(`/news/${id}/like`).then(res => res.data);

export const addNewsComment = (id, text) =>
  api.post(`/news/${id}/comments`, { text }).then(res => res.data);
