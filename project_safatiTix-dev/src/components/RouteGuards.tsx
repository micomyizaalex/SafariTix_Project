// components/RouteGuards.tsx
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function getHomePath(user: { role?: string; homePath?: string } | null): string {
  if (!user) return '/login';
  if (user.homePath) return user.homePath;
  
  switch (user.role) {
    case 'driver':
      return '/dashboard/driver';
    case 'company_admin':
    case 'company': 
      return '/dashboard/company';
    case 'admin':
      return '/dashboard/admin';
    case 'commuter':
      return '/dashboard/commuter';
    default:
      return '/';
  }
}

interface RequireRoleProps {
  allowed: string[];
  children: React.ReactNode;
  fallbackPath?: string;
}

export function RequireRole({ allowed, children, fallbackPath }: RequireRoleProps) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm text-gray-500">Checking permissions…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowed.includes(user.role || '')) {
    // Unauthorized: redirect to user's home or custom fallback
    const redirectPath = fallbackPath || getHomePath(user);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

interface RedirectByRoleProps {
  children: React.ReactNode;
  publicOnly?: boolean;
}

export function RedirectByRole({ children, publicOnly = false }: RedirectByRoleProps) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  // If this is a public-only route (like login/signup) and user is logged in, redirect to dashboard
  if (publicOnly && user) {
    return <Navigate to={getHomePath(user)} state={{ from: location }} replace />;
  }

  // If user is logged in and trying to access a non-public route, redirect to their dashboard
  if (!publicOnly && user) {
    const home = getHomePath(user);
    if (home !== '/') {
      return <Navigate to={home} replace />;
    }
  }

  return <>{children}</>;
}

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={getHomePath(user)} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: string;
}

export function RoleBasedRoute({ children, allowedRoles, fallback = '/' }: RoleBasedRouteProps) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role || '')) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}