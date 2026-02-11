import React, { CSSProperties } from 'react';
import { Bus } from 'lucide-react';

const Footer = () => {
  const styles: Record<string, CSSProperties> = {
    footer: {
      padding: '48px 16px',
      background: '#2B2D42',
      color: 'white',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '32px',
      marginBottom: '32px',
    },
    footerTitle: {
      fontWeight: 'bold',
      fontFamily: 'Montserrat, sans-serif',
      marginBottom: '16px',
    },
    footerLinks: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    footerLink: {
      color: 'rgba(255, 255, 255, 0.7)',
      textDecoration: 'none',
      display: 'block',
      padding: '8px 0',
      fontSize: '0.875rem',
      transition: 'color 0.2s',
      cursor: 'pointer',
    },
    footerBottom: {
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      paddingTop: '32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
      gap: '16px',
    },
    copyright: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.875rem',
    },
    footerBottomLinks: {
      display: 'flex',
      gap: '16px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
    },
    logoText: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.footerGrid}>
          {/* Brand */}
          <div>
            <div style={styles.logo}>
              <Bus style={{ width: '32px', height: '32px', color: '#0077B6' }} />
              <span style={styles.logoText}>SafariTix</span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
              Modern bus ticketing, tracking and subscriptions across Rwanda.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={styles.footerTitle}>Quick Links</h4>
            <ul style={styles.footerLinks}>
              <li><a href="/" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Home</a></li>
              <li><a href="#features" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Features</a></li>
              <li><a href="#pricing" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Pricing</a></li>
              <li><a href="#support" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Support</a></li>
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h4 style={styles.footerTitle}>For Business</h4>
            <ul style={styles.footerLinks}>
              <li><a href="/app/signup" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Company Signup</a></li>
              <li><a href="/dashboard/driver" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Driver Portal</a></li>
              <li><a href="#api" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>API</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={styles.footerTitle}>Contact</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', margin: '8px 0' }}>info@safaritix.rw</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', margin: '8px 0' }}>+250 793 216 602</p>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <p style={styles.copyright}>© 2026 SafariTix. All rights reserved.</p>
          <div style={styles.footerBottomLinks}>
            <a href="#privacy" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Privacy Policy</a>
            <a href="#terms" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
