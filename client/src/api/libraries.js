import api from './axios';

export const getLibraries = (params = {}) =>
  api.get('/libraries', { params }).then(res => res.data);

export const getLibrary = (id) =>
  api.get(`/libraries/${id}`).then(res => res.data);

export const createLibrary = (data) =>
  api.post('/libraries', data).then(res => res.data);

export const updateLibrary = (id, data) =>
  api.patch(`/libraries/${id}`, data).then(res => res.data);

export const deleteLibrary = (id) =>
  api.delete(`/libraries/${id}`).then(res => res.data);

export const toggleLibraryLike = (id) =>
  api.post(`/libraries/${id}/like`).then(res => res.data);

export const addLibraryComment = (id, text) =>
  api.post(`/libraries/${id}/comments`, { text }).then(res => res.data);

export const getLibraryComments = (id) =>
  api.get(`/libraries/${id}/comments`).then(res => res.data);

export const hideComment = (libraryId, commentId, reason) =>
  api.patch(`/libraries/${libraryId}/comments/${commentId}/hide`, { reason }).then(res => res.data);

export const restoreComment = (libraryId, commentId) =>
  api.patch(`/libraries/${libraryId}/comments/${commentId}/restore`).then(res => res.data);

export const deleteComment = (libraryId, commentId) =>
  api.delete(`/libraries/${libraryId}/comments/${commentId}`).then(res => res.data);
