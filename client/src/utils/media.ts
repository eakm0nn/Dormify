import api from '../services/api';
export const mediaUrl = (source: string) =>
  source.startsWith('/api/')
    ? new URL(source, api.defaults.baseURL || window.location.origin).href
    : source;
