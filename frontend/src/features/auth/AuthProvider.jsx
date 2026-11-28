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
  async function login(credentials) {
    const attempt = ++generation.current;
    const data = await requestLogin(credentials);
    const member = await getMember(data.accessToken);
    if (generation.current !== attempt) return;
    setSession({
      token: data.accessToken,
      member,
      expiresAt: Date.now() + data.expiresIn * 1000,
    });
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
