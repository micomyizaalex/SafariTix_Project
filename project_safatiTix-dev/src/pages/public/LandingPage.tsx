import React, { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './header';
import { PhoneMockups } from '../../components/PhoneMockups';
import {
  Ticket,
  MapPin,
  Users,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronRight,
  Star,
  Clock,
  Shield,
  Smartphone,
  Bus
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

export function LandingPage({ onLoginClick, onSignupClick }: LandingPageProps) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/app/login');
    }
  };

  const handleSignupClick = () => {
    if (onSignupClick) {
      onSignupClick();
    } else {
      navigate('/app/signup');
    }
  };

  const features = [
    {
      icon: Ticket,
      title: 'Instant Ticket Booking',
      description: 'Book seats quickly with secure checkout and mobile ticketing.'
    },
    {
      icon: MapPin,
      title: 'Real-Time Bus Tracking',
      description: 'See live bus locations and accurate arrival times on the map.'
    },
    {
      icon: Users,
      title: 'Subscription & Passes',
      description: 'Buy monthly passes and manage subscriptions for frequent travel.'
    },
    {
      icon: Clock,
      title: 'Smart Scheduling',
      description: 'View all routes and schedules in real-time with instant updates.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and encrypted payment processing for all transactions.'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Optimized for mobile with native apps for iOS and Android.'
    }
  ];

  const testimonials = [
    {
      name: 'Jean Uwimana',
      role: 'Daily Commuter',
      comment: 'Booking is instant and tracking is spot on — I never miss my bus now.',
      rating: 5
    },
    {
      name: 'Marie Mugabo',
      role: 'Transport Operator',
      comment: 'Our company streamlined operations after adopting SafariTix.',
      rating: 5
    },
    {
      name: 'Patrick Nkusi',
      role: 'Bus Driver',
      comment: 'Driver app is intuitive and easy to use on the road.',
      rating: 5
    }
  ];

  const styles: Record<string, CSSProperties> = {
    header: {
      position: 'relative',
      background: '#0077B6',
      color: 'white',
      overflow: 'hidden',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 16px',
    },
    heroContent: {
      paddingTop: '80px',
      paddingBottom: '80px',
    },
    heroTextCenter: {
      textAlign: 'center' as const,
      maxWidth: '768px',
      margin: '0 auto',
    },
    heroTitle: {
      fontSize: 'clamp(2rem, 6vw, 3.75rem)',
      fontWeight: '800',
      lineHeight: '1.2',
      fontFamily: 'Montserrat, sans-serif',
    },
    heroSubtitle: {
      marginTop: '16px',
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 'clamp(1rem, 2vw, 1.125rem)',
      lineHeight: '1.6',
    },
    heroCTA: {
      marginTop: '32px',
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      flexWrap: 'wrap' as const,
    },
    getStartedBtn: {
      background: '#F4A261',
      color: '#2B2D42',
      border: 'none',
      borderRadius: '9999px',
      padding: '12px 24px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s',
    },
    secondaryBtn: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      color: 'white',
      borderRadius: '9999px',
      padding: '12px 24px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    appBadges: {
      marginTop: '40px',
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      flexWrap: 'wrap' as const,
    },
    appBadge: {
      background: 'black',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      cursor: 'pointer',
    },
    socialIcons: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      position: 'absolute' as const,
      left: '24px',
      top: '33%',
      color: 'white',
    },
    socialIcon: {
      opacity: 0.9,
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    },
    featuresSection: {
      background: 'white',
      padding: '64px 16px',
    },
    sectionTitle: {
      fontSize: 'clamp(1.875rem, 4vw, 3rem)',
      fontWeight: '600',
      fontFamily: 'Montserrat, sans-serif',
      textAlign: 'center' as const,
      marginBottom: '8px',
    },
    sectionSubtitle: {
      textAlign: 'center' as const,
      color: '#6b7280',
      fontSize: '1.125rem',
      marginBottom: '48px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '32px',
    },
    featureCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
    },
    featureCardContent: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
    },
    featureIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0077B6',
      color: 'white',
      flexShrink: 0,
    },
    featureTitle: {
      fontWeight: '600',
      fontFamily: 'Montserrat, sans-serif',
      marginBottom: '8px',
      fontSize: '1.125rem',
    },
    featureDesc: {
      fontSize: '0.875rem',
      color: '#6b7280',
      lineHeight: '1.5',
    },
    testimonialsSection: {
      padding: '64px 16px',
      background: 'linear-gradient(135deg, #0077B6 0%, #005a8c 100%)',
    },
    testimonialCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      padding: '24px',
      transition: 'all 0.3s',
    },
    stars: {
      display: 'flex',
      gap: '4px',
      marginBottom: '16px',
    },
    testimonialText: {
      color: 'white',
      fontStyle: 'italic',
      marginBottom: '24px',
      lineHeight: '1.6',
    },
    testimonialName: {
      fontWeight: 'bold',
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      marginBottom: '4px',
    },
    testimonialRole: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.875rem',
    },
    ctaSection: {
      padding: '80px 16px',
      background: 'white',
      textAlign: 'center' as const,
    },
    ctaTitle: {
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      fontWeight: 'bold',
      color: '#0077B6',
      fontFamily: 'Montserrat, sans-serif',
      marginBottom: '24px',
    },
    ctaText: {
      fontSize: '1.25rem',
      color: '#6b7280',
      marginBottom: '32px',
      maxWidth: '768px',
      margin: '0 auto 32px',
    },
    ctaButton: {
      background: '#0077B6',
      color: 'white',
      border: 'none',
      borderRadius: '9999px',
      padding: '16px 48px',
      fontSize: '1.125rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    },
    footer: {
      padding: '48px 16px',
      background: '#2B2D42',
      color: 'white',
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
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: '600',
      fontFamily: 'Montserrat, sans-serif',
    },
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <Header onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />

      {/* Hero Section */}
      <section style={styles.header}>
        <div style={styles.container}>
          <div style={styles.heroContent}>
            <div style={styles.heroTextCenter}>
              <h1 style={styles.heroTitle}>
                Smart Bus Ticketing
                <br />
                <span style={{ color: '#F4A261' }}>Reliable. Fast. Local.</span>
              </h1>
              <p style={styles.heroSubtitle}>
                Book tickets, track buses in real-time, and manage subscriptions with SafariTix — Rwanda's modern bus travel platform.
              </p>

              <div style={styles.heroCTA}>
                <button
                  onClick={handleSignupClick}
                  style={styles.getStartedBtn}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Get Started
                </button>
                <button
                  onClick={handleLoginClick}
                  style={styles.secondaryBtn}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Phone Mockups Component */}
            <PhoneMockups />

            {/* App Store Badges */}
            <div style={styles.appBadges}>
              <div style={styles.appBadge}>
                <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <div style={{ fontSize: '0.75rem' }}>Download on the</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>App Store</div>
                </div>
              </div>
              <div style={styles.appBadge}>
                <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div>
                  <div style={{ fontSize: '0.75rem' }}>GET IT ON</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Google Play</div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Icons */}
          <div style={{ ...styles.socialIcons, display: window.innerWidth >= 768 ? 'flex' : 'none' }}>
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                style={styles.socialIcon}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
              >
                <Icon style={{ width: '20px', height: '20px' }} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Core Features</h2>
          <p style={styles.sectionSubtitle}>Everything commuters and operators need in one platform</p>

          <div style={styles.grid}>
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} style={styles.featureCard}>
                  <div style={styles.featureCardContent}>
                    <div style={styles.featureIcon}>
                      <Icon style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div>
                      <h3 style={styles.featureTitle}>{feature.title}</h3>
                      <p style={styles.featureDesc}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={styles.testimonialsSection}>
        <div style={styles.container}>
          <h3 style={{ ...styles.sectionTitle, color: 'white', marginBottom: '8px' }}>What Commuters Say</h3>
          <p style={{ ...styles.sectionSubtitle, color: 'rgba(255, 255, 255, 0.8)' }}>Trusted by thousands across Rwanda</p>

          <div style={styles.grid}>
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                style={styles.testimonialCard}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                <div style={styles.stars}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} style={{ width: '20px', height: '20px', fill: '#F4A261', color: '#F4A261' }} />
                  ))}
                </div>
                <p style={styles.testimonialText}>"{testimonial.comment}"</p>
                <div>
                  <p style={styles.testimonialName}>{testimonial.name}</p>
                  <p style={styles.testimonialRole}>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={{ ...styles.container, maxWidth: '1024px' }}>
          <h2 style={styles.ctaTitle}>Ready to Start Your Journey?</h2>
          <p style={styles.ctaText}>
            Join thousands of satisfied users. Sign up now and experience the future of bus travel.
          </p>
          <button
            onClick={handleSignupClick}
            style={styles.ctaButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = '#005a8c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = '#0077B6';
            }}
          >
            Create Free Account
            <ChevronRight style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerGrid}>
            {/* Brand */}
            <div>
              <div style={{ ...styles.logo, marginBottom: '16px' }}>
                <Bus style={{ width: '32px', height: '32px' }} />
                <span style={{ ...styles.logoText, fontSize: '1.25rem' }}>SafariTix</span>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                Modern bus ticketing, tracking and subscriptions across Rwanda.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={styles.footerTitle}>Quick Links</h4>
              <ul style={styles.footerLinks}>
                <li><a href="#" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Home</a></li>
                <li><a href="#" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Features</a></li>
                <li><a href="#" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Pricing</a></li>
                <li><a href="#" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Support</a></li>
              </ul>
            </div>

            {/* For Business */}
            <div>
              <h4 style={styles.footerTitle}>For Business</h4>
              <ul style={styles.footerLinks}>
                <li><a href="#" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Company Signup</a></li>
                <li><a href="#" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Driver Portal</a></li>
                <li><a href="#" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>API</a></li>
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
              <a href="#" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Privacy Policy</a>
              <a href="#" style={styles.footerLink} onMouseEnter={(e) => e.currentTarget.style.color = '#F4A261'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}