import api from '@/shared/api/axios';

export const getMessages = (libraryId) =>
  api.get(`/messages/${libraryId}`).then(res => res.data);

export const sendMessage = (libraryId, text) =>
  api.post(`/messages/${libraryId}`, { text }).then(res => res.data);
