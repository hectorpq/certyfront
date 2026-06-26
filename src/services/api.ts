import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Lee el valor de una cookie por nombre (utilizado para CSRF y sesión).
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Necesario para que el backend (Django) reciba la cookie de sesión
  // cuando el frontend está en otro dominio (cross-site).
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && !config.url?.includes('/login/') && !config.url?.includes('/register/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Adjuntar CSRF token en peticiones no-GET contra el backend Django
    // para que las cookies de sesión sean aceptadas en POST cross-site.
    const method = (config.method || 'get').toLowerCase();
    if (method !== 'get' && method !== 'head' && method !== 'options') {
      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    // Let the browser set Content-Type with the correct boundary for FormData
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    const url = originalRequest.url || '';
    const isRefreshUrl = url.includes('/token/refresh/');

    if (status === 401 && !originalRequest._retry && !isRefreshUrl) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await api.post('/api/token/refresh/', {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.set('Authorization', `Bearer ${access}`);
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;