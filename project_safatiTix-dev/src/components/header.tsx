import React, { useState, CSSProperties } from 'react';
import { Bus, ChevronDown, Menu, X, HelpCircle, Headphones, User } from 'lucide-react';

interface HeaderProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

export function Header({ onLoginClick = () => {}, onSignupClick = () => {} }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    { label: 'Home', href: '#' },
    { 
      label: 'Why SafariTix', 
      href: '#why',
      dropdown: [
        { label: 'For Commuters', href: '#commuters' },
        { label: 'For Transport Companies', href: '#companies' },
        { label: 'For Drivers', href: '#drivers' }
      ]
    },
    { 
      label: 'Solutions', 
      href: '#solutions',
      dropdown: [
        { label: 'Bus Tracking', href: '#tracking' },
        { label: 'Ticketing System', href: '#ticketing' },
        { label: 'Subscription Management', href: '#subscriptions' },
        { label: 'Driver App', href: '#driver-app' },
        { label: 'Company Dashboard', href: '#dashboard' }
      ]
    },
    { 
      label: 'Resources', 
      href: '#resources',
      dropdown: [
        { label: 'Documentation', href: '#docs' },
        { label: 'Blog', href: '#blog' },
        { label: 'Help Center', href: '#help' },
        { label: 'API Reference', href: '#api' }
      ]
    },
    { label: 'Pricing', href: '#pricing' },
  ];

  const styles: Record<string, CSSProperties> = {
    header: {
      position: 'sticky' as const,
      top: 0,
      zIndex: 1000,
      width: '100%',
      background: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    topBar: {
      background: '#2B2D42',
      color: 'white',
      padding: '8px 0',
      fontSize: '0.875rem',
    },
    topBarContainer: {
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    topBarItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'rgba(255, 255, 255, 0.9)',
    },
    topBarRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    topBarLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: 'rgba(255, 255, 255, 0.9)',
      textDecoration: 'none',
      fontSize: '0.875rem',
      transition: 'color 0.2s',
      cursor: 'pointer',
    },
    mainNav: {
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
    },
    navContainer: {
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '80px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#2B2D42',
      fontFamily: 'Montserrat, sans-serif',
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      flex: 1,
      justifyContent: 'center',
    },
    navItem: {
      position: 'relative' as const,
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: '#4b5563',
      textDecoration: 'none',
      fontSize: '0.9375rem',
      fontWeight: '500',
      transition: 'color 0.2s',
      cursor: 'pointer',
      padding: '8px 0',
      background: 'transparent',
      border: 'none',
    },
    dropdown: {
      position: 'absolute' as const,
      top: '100%',
      left: '0',
      marginTop: '8px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      minWidth: '220px',
      padding: '8px',
      zIndex: 1000,
    },
    dropdownItem: {
      display: 'block',
      padding: '10px 16px',
      color: '#4b5563',
      textDecoration: 'none',
      fontSize: '0.875rem',
      borderRadius: '6px',
      transition: 'all 0.2s',
      cursor: 'pointer',
    },
    navRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    searchContainer: {
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
    },
    searchInput: {
      padding: '8px 16px 8px 40px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '0.875rem',
      width: '200px',
      outline: 'none',
      transition: 'all 0.2s',
    },
    searchIcon: {
      position: 'absolute' as const,
      left: '12px',
      color: '#9ca3af',
      pointerEvents: 'none' as const,
    },
    loginBtn: {
      background: 'transparent',
      border: 'none',
      color: '#4b5563',
      fontSize: '0.9375rem',
      fontWeight: '500',
      cursor: 'pointer',
      padding: '8px 16px',
      transition: 'color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    getQuoteBtn: {
      background: '#F4A261',
      color: '#2B2D42',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 24px',
      fontSize: '0.9375rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(244, 162, 97, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    mobileMenuBtn: {
      background: 'transparent',
      border: 'none',
      color: '#4b5563',
      cursor: 'pointer',
      padding: '8px',
      display: 'none',
    },
    mobileMenu: {
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 24px',
    },
    mobileMenuItem: {
      padding: '12px 0',
      borderBottom: '1px solid #f3f4f6',
    },
    mobileMenuLink: {
      display: 'block',
      color: '#4b5563',
      textDecoration: 'none',
      fontSize: '0.9375rem',
      fontWeight: '500',
    },
    mobileSubMenu: {
      marginTop: '8px',
      marginLeft: '16px',
    },
    mobileSubMenuItem: {
      padding: '8px 0',
    },
    mobileSubMenuLink: {
      color: '#6b7280',
      fontSize: '0.875rem',
      textDecoration: 'none',
      display: 'block',
    },
    mobileButtons: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
  };

  return (
    <header style={styles.header}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarContainer}>
          <div style={styles.topBarItem}>
            <span>📍</span>
            <span>Kigali, Rwanda</span>
          </div>
          <div style={{ ...styles.topBarRight, display: window.innerWidth >= 768 ? 'flex' : 'none' }}>
            <a
              href="#faq"
              style={styles.topBarLink}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
            >
              <HelpCircle style={{ width: '16px', height: '16px' }} />
              <span>FAQ</span>
            </a>
            <a
              href="#support"
              style={styles.topBarLink}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
            >
              <Headphones style={{ width: '16px', height: '16px' }} />
              <span>Support</span>
            </a>
            <button
              onClick={onLoginClick}
              style={{ ...styles.topBarLink, color: '#0077B6', fontWeight: '600' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#0077B6'}
            >
              <User style={{ width: '16px', height: '16px' }} />
              <span>Sign In / Register</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={styles.mainNav}>
        <div style={styles.navContainer}>
          {/* Logo */}
          <a href="#" style={styles.logo}>
            <Bus style={{ width: '36px', height: '36px', color: '#0077B6' }} />
            <div>
              <div style={styles.logoText}>SAFARITIX</div>
              <div style={{ fontSize: '0.625rem', color: '#6b7280', letterSpacing: '0.05em' }}>
                WE ARE PROFESSIONAL
              </div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div style={{ ...styles.navLinks, display: window.innerWidth >= 1024 ? 'flex' : 'none' }}>
            {navItems.map((item) => (
              <div
                key={item.label}
                style={styles.navItem}
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.dropdown ? (
                  <>
                    <button
                      style={styles.navLink}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#0077B6'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
                    >
                      <span>{item.label}</span>
                      <ChevronDown style={{ width: '16px', height: '16px' }} />
                    </button>
                    {activeDropdown === item.label && (
                      <div style={styles.dropdown}>
                        {item.dropdown.map((subItem) => (
                          <a
                            key={subItem.label}
                            href={subItem.href}
                            style={styles.dropdownItem}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#F5F7FA';
                              e.currentTarget.style.color = '#0077B6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#4b5563';
                            }}
                          >
                            {subItem.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={item.href}
                    style={styles.navLink}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0077B6'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Right Side */}
          <div style={{ ...styles.navRight, display: window.innerWidth >= 1024 ? 'flex' : 'none' }}>
            {/* Search */}
            <div style={styles.searchContainer}>
              <svg
                style={styles.searchIcon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search Services..."
                style={styles.searchInput}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0077B6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 119, 182, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Get A Quote Button */}
            <button
              onClick={onSignupClick}
              style={styles.getQuoteBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E76F51';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(244, 162, 97, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F4A261';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(244, 162, 97, 0.3)';
              }}
            >
              <span>Get A Quote</span>
              <span>→</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            style={{
              ...styles.mobileMenuBtn,
              display: window.innerWidth >= 1024 ? 'none' : 'block',
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X style={{ width: '24px', height: '24px' }} />
            ) : (
              <Menu style={{ width: '24px', height: '24px' }} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          {navItems.map((item) => (
            <div key={item.label} style={styles.mobileMenuItem}>
              {item.dropdown ? (
                <>
                  <div style={styles.mobileMenuLink}>{item.label}</div>
                  <div style={styles.mobileSubMenu}>
                    {item.dropdown.map((subItem) => (
                      <div key={subItem.label} style={styles.mobileSubMenuItem}>
                        <a
                          href={subItem.href}
                          style={styles.mobileSubMenuLink}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.label}
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <a
                  href={item.href}
                  style={styles.mobileMenuLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              )}
            </div>
          ))}

          <div style={styles.mobileButtons}>
            <button
              onClick={() => {
                onLoginClick();
                setMobileMenuOpen(false);
              }}
              style={{
                ...styles.loginBtn,
                justifyContent: 'center',
                width: '100%',
                color: '#0077B6',
                fontWeight: '600',
              }}
            >
              Sign In / Register
            </button>
            <button
              onClick={() => {
                onSignupClick();
                setMobileMenuOpen(false);
              }}
              style={{
                ...styles.getQuoteBtn,
                justifyContent: 'center',
                width: '100%',
              }}
            >
              Get A Quote →
            </button>
          </div>
        </div>
      )}
    </header>
  );
}