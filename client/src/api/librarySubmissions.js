import api from './axios';

export const getMySubmission = () =>
  api.get('/library-submissions/mine').then(res => res.data);

export const getPendingSubmissions = () =>
  api.get('/library-submissions', { params: { status: 'pending' } }).then(res => res.data);

export const getSubmission = (id) =>
  api.get(`/library-submissions/${id}`).then(res => res.data);

export const createSubmission = (data) =>
  api.post('/library-submissions', data).then(res => res.data);

export const approveSubmission = (id) =>
  api.patch(`/library-submissions/${id}/approve`).then(res => res.data);

export const rejectSubmission = (id, reason) =>
  api.patch(`/library-submissions/${id}/reject`, { reason }).then(res => res.data);

export const deleteSubmission = (id) =>
  api.delete(`/library-submissions/${id}`).then(res => res.data);
