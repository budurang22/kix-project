import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/use-auth.js';
import { ErrorState } from '../components/Feedback.jsx';
export default function RequireAuth({ role }) {
  const { session } = useAuth();
  const location = useLocation();
  if (!session)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  if (role && session.member.role !== role)
    return <ErrorState message="접근 권한이 없습니다." />;
  return <Outlet />;
}
