import axios from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthExpiredHandler?: boolean;
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let refreshSessionPromise: Promise<void> | null = null;

if (import.meta.env.DEV) {
  console.info('CodeQuest API baseURL:', api.defaults.baseURL);
}

function clearStoredSession() {
  localStorage.removeItem('codequest.accessToken');
  localStorage.removeItem('codequest.refreshToken');
  localStorage.removeItem('codequest.user');
}

function refreshSession() {
  if (!refreshSessionPromise) {
    refreshSessionPromise = api
      .post(
        '/auth/refresh',
        {},
        {
          skipAuthRefresh: true,
          skipAuthExpiredHandler: true,
        },
      )
      .then(() => undefined)
      .finally(() => {
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const originalRequest = error.config;
      const requestUrl = originalRequest?.url ?? '';
      const canRefresh =
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.skipAuthRefresh &&
        !requestUrl.startsWith('/auth/login') &&
        !requestUrl.startsWith('/auth/register') &&
        !requestUrl.startsWith('/auth/refresh');

      if (canRefresh) {
        originalRequest._retry = true;

        try {
          await refreshSession();
          return api(originalRequest);
        } catch {
          clearStoredSession();

          if (!originalRequest.skipAuthExpiredHandler) {
            window.dispatchEvent(new Event('codequest:session-expired'));
          }
        }
      }
    }

    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.skipAuthExpiredHandler &&
      !error.config?.url?.startsWith('/auth/login') &&
      !error.config?.url?.startsWith('/auth/register')
    ) {
      clearStoredSession();
      window.dispatchEvent(new Event('codequest:session-expired'));
    }

    return Promise.reject(error);
  },
);
