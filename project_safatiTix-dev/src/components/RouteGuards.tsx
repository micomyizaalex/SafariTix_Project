import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function getHomePath(user: { role?: string; homePath?: string } | null): string {
  if (!user) return '/login';
  if (user.homePath) return user.homePath;
  switch (user.role) {
    case 'driver':
      return '/driver/dashboard';
    case 'company_admin':
    case 'company': // some users/older accounts may use 'company' as role
      return '/company/dashboard';
    case 'admin':
      return '/dashboard/admin';
    case 'commuter':
      return '/commuter/dashboard';
    default:
      return '/';
  }
}

export function RequireRole({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Checking permissions…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowed.includes(user.role)) {
    // Unauthorized: redirect to user's home
    return <Navigate to={getHomePath(user)} replace />;
  }

  return <>{children}</>;
}

export function RedirectByRole({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) return <>{children}</>;

  // If user is logged in and not commuter, send to their dashboard
  const home = getHomePath(user);
  if (home !== '/') {
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
