import api from '@/shared/api/axios';

export const subscribeNewsletter = (email) =>
  api.post('/newsletter/subscribe', { email }).then(r => r.data);

export const getNewsletterSubscribers = () =>
  api.get('/newsletter/subscribers').then(r => r.data);
