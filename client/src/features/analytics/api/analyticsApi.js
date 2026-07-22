import api from '@/shared/api/axios';

export const getOverview = (period = 'week') =>
  api.get('/analytics/overview', { params: { period } }).then(r => r.data);

export const getGeo = (period = 'week') =>
  api.get('/analytics/geo', { params: { period } }).then(r => r.data);

export const getPopular = (period = 'week') =>
  api.get('/analytics/popular', { params: { period } }).then(r => r.data);

export const getInteractions = (period = 'week') =>
  api.get('/analytics/interactions', { params: { period } }).then(r => r.data);

export const trackShare = (path, resourceId, resourceType, resourceName) =>
  api.post('/analytics/track', { path, type: 'share', resourceId, resourceType, resourceName }).catch(() => {});

export const exportAnalytics = async (format, period) => {
  const mimeTypes = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain'
  };
  const response = await api.get('/analytics/export', {
    params: { format, period },
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeTypes[format] }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `analiticas-${period}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
