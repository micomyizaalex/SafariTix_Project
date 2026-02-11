// ============================================
// BEAUTIFUL COMPANY DASHBOARD LAYOUT
// Copy this ENTIRE file to replace your CompanyDashboardLayout.tsx
// ============================================

const SAFARITIX = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  primarySoft: '#E6F4FB',
  success: '#27AE60',
  warning: '#F4A261',
  danger: '#E63946',
};

import { CSSProperties, useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  BarChart3,
  Calendar,
  Ticket,
  Bus,
  Users,
  MapPin,
  DollarSign,
  Star,
  FileText,
  Settings,
  LogOut,
  Search,
  Menu,
  Bell,
} from 'lucide-react';

interface CompanyDashboardLayoutProps {
  onSettings?: () => void;
}

export function CompanyDashboardLayout({ onSettings }: CompanyDashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const navItems = [
    { to: '/dashboard/company', label: 'Dashboard', icon: BarChart3, end: true },
    { to: '/dashboard/company/schedules', label: 'Schedules', icon: Calendar },
    { to: '/dashboard/company/tickets', label: 'Tickets', icon: Ticket },
    { to: '/dashboard/company/buses', label: 'Buses', icon: Bus },
    { to: '/dashboard/company/drivers', label: 'Drivers', icon: Users },
    { to: '/dashboard/company/tracking', label: 'Live Tracking', icon: MapPin },
    { to: '/dashboard/company/revenue', label: 'Revenue', icon: DollarSign },
    { to: '/dashboard/company/subscription', label: 'Subscription', icon: Star },
    { to: '/dashboard/company/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated Background Blobs */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0,119,182,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 20s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(39,174,96,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 15s ease-in-out infinite reverse',
        }} />

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            onClick={closeSidebar}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease',
            }}
          />
        )}

        {/* Sidebar */}
        <aside style={{
          width: '280px',
          background: 'rgba(43, 45, 66, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          padding: '28px 20px',
          zIndex: 1000,
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
          transform: isMobile && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '8px 12px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(0,119,182,0.2) 0%, rgba(0,119,182,0.05) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(0,119,182,0.3)',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: `0 8px 16px rgba(0,119,182,0.3)`,
            }}>
              🚌
            </div>
            <span style={{
              fontWeight: '700',
              fontSize: '24px',
              fontFamily: 'Montserrat, sans-serif',
              background: 'linear-gradient(135deg, #fff 0%, #e0e7ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              SafariTix
            </span>
          </div>

          {/* Profile */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(0,119,182,0.15) 0%, rgba(39,174,96,0.1) 100%)',
            borderRadius: '16px',
            marginBottom: '28px',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(20px)',
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              position: 'relative',
              zIndex: 1,
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: '700',
                color: 'white',
                border: '3px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 24px rgba(0,119,182,0.4)',
              }}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '11px',
                  color: '#94A3B8',
                  marginBottom: '4px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Welcome back
                </p>
                <p style={{
                  fontWeight: '700',
                  fontSize: '16px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'white',
                }}>
                  {user?.name || 'Company Admin'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeSidebar}
                style={({ isActive }) => ({
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: 'none',
                  background: isActive 
                    ? `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)` 
                    : 'transparent',
                  color: isActive ? 'white' : '#94A3B8',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'left',
                  textDecoration: 'none',
                  position: 'relative',
                  boxShadow: isActive ? `0 8px 24px rgba(0,119,182,0.4)` : 'none',
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                })}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  const isActive = target.getAttribute('aria-current') === 'page';
                  if (!isActive) {
                    target.style.background = 'rgba(255,255,255,0.08)';
                    target.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  const isActive = target.getAttribute('aria-current') === 'page';
                  if (!isActive) {
                    target.style.background = 'transparent';
                    target.style.transform = 'translateX(0)';
                  }
                }}
              >
                <item.icon style={{ width: '22px', height: '22px', flexShrink: 0 }} />
                <span>{item.label}</span>
              </NavLink>
            ))}

            <button
              onClick={() => {
                onSettings?.();
                closeSidebar();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                color: '#94A3B8',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <Settings style={{ width: '22px', height: '22px', flexShrink: 0 }} />
              <span>Settings</span>
            </button>
          </nav>

          {/* Logout */}
          <button
            onClick={signOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              color: '#EF4444',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <LogOut style={{ width: '22px', height: '22px', flexShrink: 0 }} />
            <span>Logout</span>
          </button>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          marginLeft: isMobile ? '0' : '280px',
          padding: '0',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Top Bar */}
          <div style={{
            background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transition: 'all 0.3s ease',
            boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flex: 1,
            }}>
              <button
                onClick={toggleSidebar}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(0,119,182,0.1) 0%, rgba(0,119,182,0.05) 100%)',
                  border: '1px solid rgba(0,119,182,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${SAFARITIX.primary}20 0%, ${SAFARITIX.primary}10 100%)`;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,119,182,0.1) 0%, rgba(0,119,182,0.05) 100%)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Menu size={22} color={SAFARITIX.primary} />
              </button>

              <div style={{
                position: 'relative',
                flex: 1,
                maxWidth: '500px',
                display: window.innerWidth < 768 ? 'none' : 'block',
              }}>
                <Search
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: SAFARITIX.primary,
                  }}
                />
                <input
                  type="text"
                  placeholder="Search buses, routes, tickets..."
                  style={{
                    width: '100%',
                    padding: '14px 20px 14px 48px',
                    borderRadius: '14px',
                    border: '1px solid rgba(0,119,182,0.15)',
                    fontSize: '15px',
                    outline: 'none',
                    background: 'rgba(248,250,252,0.8)',
                    transition: 'all 0.3s ease',
                    fontWeight: '500',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = SAFARITIX.primary;
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${SAFARITIX.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,119,182,0.15)';
                    e.currentTarget.style.background = 'rgba(248,250,252,0.8)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <button
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(248,250,252,0.8)',
                  border: '1px solid rgba(0,119,182,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,119,182,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(248,250,252,0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Bell size={22} color="#64748B" />
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '22px',
                  height: '22px',
                  background: `linear-gradient(135deg, ${SAFARITIX.danger} 0%, #c72e3a 100%)`,
                  borderRadius: '50%',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  boxShadow: '0 4px 12px rgba(230,57,70,0.4)',
                }}>
                  2
                </span>
              </button>

              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  flexShrink: 0,
                  border: '2px solid white',
                  boxShadow: `0 8px 20px rgba(0,119,182,0.3)`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}
              >
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div style={{
            padding: window.innerWidth < 768 ? '20px 16px' : '32px 28px',
            maxWidth: '1600px',
            margin: '0 auto',
          }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          aside::-webkit-scrollbar {
            width: 6px;
          }
          aside::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
          }
          aside::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(0,119,182,0.4) 0%, rgba(0,119,182,0.2) 100%);
            border-radius: 10px;
          }
          aside::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(0,119,182,0.6) 0%, rgba(0,119,182,0.4) 100%);
          }

          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `}
      </style>
    </>
  );
}