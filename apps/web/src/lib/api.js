import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('codequest.accessToken');

  console.log('API REQUEST:', config.url);
  console.log('TOKEN FOUND:', Boolean(token));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});