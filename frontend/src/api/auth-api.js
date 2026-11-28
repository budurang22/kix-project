import { apiClient } from './api-client.js';
export async function login(credentials) {
  return (await apiClient.post('/auth/login', credentials, { skipAuth: true }))
    .data;
}
export async function signup(details) {
  return (await apiClient.post('/auth/signup', details, { skipAuth: true }))
    .data;
}
export async function getMember(token) {
  return (
    await apiClient.get('/members/me', {
      skipAuth: true,
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
}
