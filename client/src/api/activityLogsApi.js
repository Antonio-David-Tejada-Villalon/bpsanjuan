import api from './axios';

export const getActivityLogs = (params = {}) =>
  api.get('/activity-logs', { params }).then(res => res.data);

export const deleteLog = (id) =>
  api.delete(`/activity-logs/${id}`).then(res => res.data);

export const deleteAllLogs = () =>
  api.delete('/activity-logs').then(res => res.data);

export const extendRetention = () =>
  api.patch('/activity-logs/extend').then(res => res.data);

export const exportLogs = async (format) => {
  const response = await api.get('/activity-logs/export', {
    params: { format },
    responseType: 'blob'
  });
  const ext = format === 'xlsx' ? 'xlsx' : format === 'docx' ? 'docx' : 'txt';
  const mimeMap = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt:  'text/plain'
  };
  const blob = new Blob([response.data], { type: mimeMap[format] });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `historial_actividad.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
