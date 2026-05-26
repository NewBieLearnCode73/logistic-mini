import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface RoleGuardProps {
  allowed: string[];
}

export default function RoleGuard({ allowed }: RoleGuardProps) {
  const { getRole } = useAuthStore();
  const role = getRole();

  if (!role || !allowed.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
