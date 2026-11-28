import axios from 'axios';
import {
  getSession,
  clearSessionIfToken,
} from '../features/auth/auth-store.js';
import { toApiError } from './api-error.js';
export const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});
apiClient.interceptors.request.use((config) => {
  const token = config.skipAuth ? null : getSession()?.token;
  config.sessionToken = token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401)
      clearSessionIfToken(error.config?.sessionToken);
    return Promise.reject(toApiError(error));
  },
);
