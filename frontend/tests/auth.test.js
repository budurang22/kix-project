import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSession,
  setSession,
  clearSessionIfToken,
  subscribe,
} from '../src/features/auth/auth-store.js';
import { toApiError } from '../src/api/api-error.js';
test('stale 401 cannot clear a newer login; logout removes token', () => {
  let changes = 0;
  const unsubscribe = subscribe(() => changes++);
  setSession({ token: 'first' });
  setSession({ token: 'second' });
  clearSessionIfToken('first');
  assert.equal(getSession().token, 'second');
  clearSessionIfToken('second');
  assert.equal(getSession(), null);
  assert.equal(changes, 3);
  unsubscribe();
});
test('ProblemDetail and network errors retain useful user-facing information', () => {
  const error = toApiError({
    response: { status: 409, data: { detail: '이미 등록된 이메일입니다.' } },
  });
  assert.equal(error.status, 409);
  assert.equal(error.message, '이미 등록된 이메일입니다.');
  assert.equal(toApiError({}).status, 0);
  assert.match(toApiError({ response: { status: 403 } }).message, /권한/);
});
