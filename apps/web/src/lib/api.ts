import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
});

function clearStoredSession() {
  localStorage.removeItem('codequest.accessToken');
  localStorage.removeItem('codequest.refreshToken');
  localStorage.removeItem('codequest.user');
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('codequest.accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.startsWith('/auth/login') &&
      !error.config?.url?.startsWith('/auth/register')
    ) {
      clearStoredSession();
      window.dispatchEvent(new Event('codequest:session-expired'));
    }

    return Promise.reject(error);
  },
);
