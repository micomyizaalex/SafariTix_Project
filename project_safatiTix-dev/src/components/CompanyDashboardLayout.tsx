const SAFARITIX = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  primarySoft: '#E6F4FB',
};

import { CSSProperties } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface CompanyDashboardLayoutProps {
  onSettings?: () => void;
}

export function CompanyDashboardLayout({ onSettings }: CompanyDashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const styles: Record<string, CSSProperties> = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      background: '#F5F5F5',
    },
    sidebar: {
      width: '180px',
      background: '#2B2D3A',
      color: 'white',
      display: 'flex',
      flexDirection: 'column' as const,
      position: 'fixed' as const,
      height: '100vh',
    },
    logo: {
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    logoIcon: {
      width: '32px',
      height: '32px',
      background: 'white',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
    },
    logoText: {
      fontWeight: '700',
      fontSize: '18px',
    },
    profile: {
      padding: '0 24px',
      marginBottom: '32px',
    },
    profileAvatar: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      background: '#4B5563',
      marginBottom: '12px',
    },
    profileLabel: {
      fontSize: '12px',
      color: '#9CA3AF',
      marginBottom: '4px',
    },
    profileName: {
      fontWeight: '600',
      fontSize: '14px',
    },
    nav: {
      flex: 1,
      padding: '0 16px',
    },
    navItem: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 12px',
      borderRadius: '8px',
      marginBottom: '4px',
      cursor: 'pointer',
      border: 'none',
      background: 'transparent',
      color: '#9CA3AF',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      textAlign: 'left' as const,
      textDecoration: 'none',
    },
    navIcon: {
      fontSize: '20px',
    },
    mainContent: {
      flex: 1,
      marginLeft: '180px',
      padding: '32px',
    },
    header: {
      marginBottom: '32px',
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '4px',
    },
    headerSubtitle: {
      fontSize: '14px',
      color: '#6B7280',
    },
    searchWrapper: {
      position: 'relative' as const,
    },
    searchInput: {
      width: '256px',
      padding: '8px 16px 8px 40px',
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
      fontSize: '14px',
      outline: 'none',
    },
    searchIcon: {
      position: 'absolute' as const,
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9CA3AF',
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: '#DC2626',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⚡</div>
          <span style={styles.logoText}>SafariTix</span>
        </div>

        <div style={styles.profile}>
          <div style={styles.profileAvatar} />
          <p style={styles.profileLabel}>Welcome Back,</p>
          <p style={styles.profileName}>{user?.name || 'Company Admin'}</p>
        </div>

        <nav style={styles.nav}>
          <NavLink
            to="/dashboard/company"
            end
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? { background: SAFARITIX.primary, color: 'white' } : {}),
            })}
          >
            <span style={styles.navIcon}>🏠</span>
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/company/schedules"
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? { background: SAFARITIX.primary, color: 'white' } : {}),
            })}
          >
            <span style={styles.navIcon}>📅</span>
            <span>Schedules</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/company/tickets"
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? { background: SAFARITIX.primary, color: 'white' } : {}),
            })}
          >
            <span style={styles.navIcon}>🎫</span>
            <span>Tickets</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/company/buses"
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? { background: SAFARITIX.primary, color: 'white' } : {}),
            })}
          >
            <span style={styles.navIcon}>🚌</span>
            <span>Buses</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/company/drivers"
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? { background: SAFARITIX.primary, color: 'white' } : {}),
            })}
          >
            <span style={styles.navIcon}>👤</span>
            <span>Drivers</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/company/tracking"
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? { background: SAFARITIX.primary, color: 'white' } : {}),
            })}
          >
            <span style={styles.navIcon}>📍</span>
            <span>Live Tracking</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/company/revenue"
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? { background: SAFARITIX.primary, color: 'white' } : {}),
            })}
          >
            <span style={styles.navIcon}>💰</span>
            <span>Revenue</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/company/subscription"
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? { background: SAFARITIX.primary, color: 'white' } : {}),
            })}
          >
            <span style={styles.navIcon}>⭐</span>
            <span>Subscription</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/company/reports"
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? { background: SAFARITIX.primary, color: 'white' } : {}),
            })}
          >
            <span style={styles.navIcon}>📊</span>
            <span>Reports</span>
          </NavLink>
          
          <button
            style={styles.navItem}
            onClick={onSettings}
          >
            <span style={styles.navIcon}>⚙️</span>
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.headerTitle}>Company Dashboard</h1>
              <p style={styles.headerSubtitle}>Manage your bus operations</p>
            </div>
            <div style={styles.headerActions}>
              <div style={styles.searchWrapper}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search"
                  style={styles.searchInput}
                />
              </div>
              <button
                style={styles.logoutButton}
                onClick={signOut}
                onMouseEnter={(e) => e.currentTarget.style.background = '#B91C1C'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#DC2626'}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <Outlet />
      </main>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
