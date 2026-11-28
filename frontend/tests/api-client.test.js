import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiClient } from '../src/api/api-client.js';
import { getSession, setSession } from '../src/features/auth/auth-store.js';
test('Bearer injection, public auth requests and 401/403 behavior with Axios adapter', async () => {
  setSession({ token: 'test-token' });
  const success = async (config) => ({
    data: { ok: true },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });
  const response = await apiClient.get('/members/me', { adapter: success });
  assert.equal(response.config.headers.Authorization, 'Bearer test-token');
  const publicResponse = await apiClient.post(
    '/auth/login',
    {},
    { skipAuth: true, adapter: success },
  );
  assert.equal(publicResponse.config.headers.Authorization, undefined);
  const failure = (status) => async (config) => {
    throw { config, response: { status, data: { detail: 'Test failure' } } };
  };
  await assert.rejects(
    apiClient.get('/admin/test', { adapter: failure(403) }),
    { status: 403 },
  );
  assert.equal(getSession().token, 'test-token');
  await assert.rejects(
    apiClient.get('/members/me', { adapter: failure(401) }),
    { status: 401 },
  );
  assert.equal(getSession(), null);
  await assert.rejects(
    apiClient.get('/members/me', {
      adapter: async (config) => {
        setSession({ token: 'new-token' });
        throw { config, response: { status: 401 } };
      },
    }),
    { status: 401 },
  );
  assert.equal(getSession().token, 'new-token');
  setSession(null);
});
