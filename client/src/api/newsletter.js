import api from './axios';

export const subscribeNewsletter = (email) =>
  api.post('/newsletter/subscribe', { email }).then(r => r.data);
