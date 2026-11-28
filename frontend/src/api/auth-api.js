import { apiClient } from './api-client.js';
export async function login(credentials, { signal } = {}) {
  return (
    await apiClient.post('/auth/login', credentials, { skipAuth: true, signal })
  ).data;
}
export async function signup(details, { signal } = {}) {
  return (
    await apiClient.post('/auth/signup', details, { skipAuth: true, signal })
  ).data;
}
export async function getMember(token, { signal } = {}) {
  return (
    await apiClient.get('/members/me', {
      skipAuth: true,
      signal,
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
}
