let session = null;
const listeners = new Set();
export const getSession = () => session;
export function setSession(value) {
  session = value;
  listeners.forEach((listener) => listener());
}
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function clearSessionIfToken(token) {
  if (token && session?.token === token) setSession(null);
}
