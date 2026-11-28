import { useEffect, useRef, useSyncExternalStore } from 'react';
import { login as requestLogin, getMember } from '../../api/auth-api.js';
import {
  getSession,
  setSession,
  subscribe,
  clearSessionIfToken,
} from './auth-store.js';
import { AuthContext } from './auth-context.js';
export function AuthProvider({ children }) {
  const session = useSyncExternalStore(subscribe, getSession, () => null);
  const generation = useRef(0);
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(
      () => clearSessionIfToken(session.token),
      Math.max(0, session.expiresAt - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [session]);
  async function login(credentials, { signal, onAuthenticated } = {}) {
    const attempt = ++generation.current;
    const data = await requestLogin(credentials, { signal });
    const expiresAt = Date.now() + data.expiresIn * 1000;
    if (signal?.aborted || generation.current !== attempt) return false;
    const member = await getMember(data.accessToken, { signal });
    if (signal?.aborted || generation.current !== attempt) return false;
    if (expiresAt <= Date.now())
      throw new Error('로그인 시간이 만료되었습니다. 다시 시도해 주세요.');
    onAuthenticated?.();
    setSession({
      token: data.accessToken,
      member,
      expiresAt,
    });
    return true;
  }
  function logout() {
    generation.current++;
    setSession(null);
  }
  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
