import { useContext } from 'react';
import { AuthContext } from '../features/auth/auth-context.js';
export const useAuth = () => useContext(AuthContext);
