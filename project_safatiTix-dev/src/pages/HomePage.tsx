import React, { useState, CSSProperties } from 'react';
import { 
  Bus, 
  Search, 
  Ticket, 
  MapPin, 
  Users, 
  TrendingUp, 
  Moon, 
  Sun,
  Menu,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPinned
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { statsDisplay, teamMembers } from '../utils/data';

const HomePage = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [stats, setStats] = useState({
    activeUsers: 0,
    activeBuses: 0,
    totalTicketsBooked: 0,
    growthRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const isDark = theme === 'dark';

  // Styles
  const styles: Record<string, CSSProperties> = {
    heroSection: {
      padding: '80px 0 128px',
      background: isDark 
        ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
        : 'linear-gradient(135deg, #EFF6FF 0%, #E0E7FF 100%)',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 16px',
    },
    gridTwo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '48px',
      alignItems: 'center',
    },
    heroTitle: {
      fontSize: 'clamp(2rem, 5vw, 3.75rem)',
      fontWeight: 'bold',
      marginBottom: '24px',
      fontFamily: 'Montserrat, sans-serif',
      color: isDark ? '#F5F7FA' : '#2B2D42',
      lineHeight: '1.2',
    },
    heroSubtitle: {
      fontSize: 'clamp(1rem, 2vw, 1.25rem)',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: '32px',
      lineHeight: '1.6',
    },
    buttonGroup: {
      display: 'flex',
      flexDirection: 'row' as const,
      gap: '16px',
      flexWrap: 'wrap' as const,
    },
    featureBox: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '32px',
    },
    featureBoxDark: {
      background: '#2B2D42',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      padding: '32px',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '16px',
    },
    section: {
      padding: '80px 0',
      background: isDark ? '#1a1a1a' : '#ffffff',
    },
    sectionAlt: {
      padding: '80px 0',
      background: isDark
        ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)'
        : 'linear-gradient(135deg, rgba(0, 106, 255, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
    },
    sectionTitle: {
      fontSize: 'clamp(1.875rem, 4vw, 3rem)',
      fontWeight: 'bold',
      marginBottom: '16px',
      fontFamily: 'Montserrat, sans-serif',
      color: isDark ? '#F5F7FA' : '#2B2D42',
      textAlign: 'center' as const,
    },
    sectionSubtitle: {
      fontSize: '1.125rem',
      color: isDark ? '#9ca3af' : '#6b7280',
      maxWidth: '672px',
      margin: '0 auto 64px',
      textAlign: 'center' as const,
      lineHeight: '1.6',
    },
    gridThree: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '32px',
    },
    gridFour: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
    },
    card: {
      background: isDark ? '#2B2D42' : '#ffffff',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center' as const,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: isDark ? '1px solid #3a3d52' : '1px solid #e5e7eb',
    },
    iconCircle: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '12px',
      fontFamily: 'Montserrat, sans-serif',
      color: isDark ? '#F5F7FA' : '#2B2D42',
    },
    cardText: {
      color: isDark ? '#9ca3af' : '#6b7280',
      lineHeight: '1.6',
    },
    statValue: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '8px',
      fontFamily: 'Montserrat, sans-serif',
      transition: 'all 0.3s',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    teamCarousel: {
      maxWidth: '1024px',
      margin: '0 auto 48px',
    },
    carouselCard: {
      background: isDark ? '#2B2D42' : '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden' as const,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    carouselGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '0',
    },
    carouselImage: {
      position: 'relative' as const,
      height: '384px',
      overflow: 'hidden' as const,
    },
    carouselContent: {
      padding: '48px',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      background: isDark
        ? 'linear-gradient(135deg, rgba(0, 106, 255, 0.1) 0%, transparent 100%)'
        : 'linear-gradient(135deg, rgba(0, 106, 255, 0.05) 0%, transparent 100%)',
    },
    roleTag: {
      display: 'inline-block',
      padding: '4px 16px',
      background: '#006AFF',
      color: 'white',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      marginBottom: '16px',
    },
    teamName: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      marginBottom: '16px',
      fontFamily: 'Montserrat, sans-serif',
      color: isDark ? '#F5F7FA' : '#2B2D42',
    },
    teamBio: {
      fontSize: '1.125rem',
      color: isDark ? '#9ca3af' : '#6b7280',
      lineHeight: '1.75',
    },
    indicators: {
      display: 'flex',
      gap: '8px',
      marginTop: '24px',
    },
    indicator: {
      height: '8px',
      borderRadius: '9999px',
      transition: 'all 0.3s',
      cursor: 'pointer',
    },
    teamGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
    },
    teamThumb: {
      position: 'relative' as const,
      overflow: 'hidden' as const,
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '48px',
      maxWidth: '1280px',
      margin: '0 auto',
    },
    formGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: isDark ? '#F5F7FA' : '#2B2D42',
    },
    contactCard: {
      background: isDark ? '#2B2D42' : '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      border: isDark ? '1px solid #3a3d52' : '1px solid #e5e7eb',
    },
    contactCardContent: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
    },
    socialButton: {
      padding: '12px',
      background: 'rgba(0, 106, 255, 0.1)',
      borderRadius: '8px',
      transition: 'all 0.3s',
      cursor: 'pointer',
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section */}
      <section id="home" style={styles.heroSection}>
        <div style={styles.container}>
          <div style={styles.gridTwo}>
            <div>
              <h1 style={styles.heroTitle}>
                Welcome to <span style={{ color: '#006AFF' }}>SafariTix</span>
              </h1>
              <p style={styles.heroSubtitle}>
                Your hassle-free bus ticketing system. Book tickets, track buses in real-time, and travel with confidence across Rwanda.
              </p>
              <div style={styles.buttonGroup}>
                <Link to="/">
                  <Button>Get Started</Button>
                </Link>
                <Link to="/">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <div style={isDark ? styles.featureBoxDark : styles.featureBox}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    ...styles.featureItem,
                    background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                  }}>
                    <Search style={{ width: '24px', height: '24px', color: '#006AFF' }} />
                    <div>
                      <p style={{ fontWeight: '600', color: isDark ? '#F5F7FA' : '#2B2D42', margin: '0 0 4px 0' }}>
                        Search Routes
                      </p>
                      <p style={{ fontSize: '0.875rem', color: isDark ? '#9ca3af' : '#6b7280', margin: 0 }}>
                        Find your destination
                      </p>
                    </div>
                  </div>
                  <div style={{
                    ...styles.featureItem,
                    background: isDark ? 'rgba(34, 197, 94, 0.1)' : '#F0FDF4',
                  }}>
                    <Ticket style={{ width: '24px', height: '24px', color: '#16a34a' }} />
                    <div>
                      <p style={{ fontWeight: '600', color: isDark ? '#F5F7FA' : '#2B2D42', margin: '0 0 4px 0' }}>
                        Book Instantly
                      </p>
                      <p style={{ fontSize: '0.875rem', color: isDark ? '#9ca3af' : '#6b7280', margin: 0 }}>
                        Secure your seat
                      </p>
                    </div>
                  </div>
                  <div style={{
                    ...styles.featureItem,
                    background: isDark ? 'rgba(168, 85, 247, 0.1)' : '#FAF5FF',
                    marginBottom: 0,
                  }}>
                    <MapPin style={{ width: '24px', height: '24px', color: '#9333ea' }} />
                    <div>
                      <p style={{ fontWeight: '600', color: isDark ? '#F5F7FA' : '#2B2D42', margin: '0 0 4px 0' }}>
                        Track Live
                      </p>
                      <p style={{ fontSize: '0.875rem', color: isDark ? '#9ca3af' : '#6b7280', margin: 0 }}>
                        Real-time location
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="howto" style={styles.section}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={styles.sectionTitle}>How It Works</h2>
            <p style={styles.sectionSubtitle}>
              Getting started with SafariTix is easy. Just three simple steps to your journey.
            </p>
          </div>

          <div style={styles.gridThree}>
            {[
              { icon: Search, title: '1. Choose Route', desc: 'Search and select your departure and destination cities. View available schedules and prices.', color: '#006AFF' },
              { icon: Ticket, title: '2. Book Ticket', desc: 'Select your preferred seat, make secure payment, and receive your digital ticket with QR code.', color: '#006AFF' },
              { icon: MapPin, title: '3. Track in Real-Time', desc: 'Track your bus location live on the map. Know exactly when your bus will arrive.', color: '#006AFF' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={styles.card}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{ ...styles.iconCircle, background: item.color, color: 'white' }}>
                    <Icon style={{ width: '32px', height: '32px' }} />
                  </div>
                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  <p style={styles.cardText}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" style={styles.sectionAlt}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <h2 style={styles.sectionTitle}>
                Our <span style={{ color: '#006AFF' }}>Achievements</span>
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                background: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
                borderRadius: '9999px',
                fontSize: '0.875rem',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  animation: statsLoading ? 'pulse 2s infinite' : 'ping 1s infinite',
                }} />
                <span style={{ color: '#16a34a' }}>Live Data</span>
              </div>
            </div>
            <p style={styles.sectionSubtitle}>
              Trusted by thousands across Rwanda. Here's what we've accomplished together.
            </p>
          </div>

          <div style={styles.gridFour}>
            {statsDisplay.map((stat: any, index: number) => {
              const Icon = stat.icon;
              const colorMap: Record<string, { bg: string; text: string }> = {
                'text-green-600': { bg: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7', text: '#16a34a' },
                'text-red-600': { bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2', text: '#dc2626' },
              };
              const colors = colorMap[stat.color] || { bg: 'rgba(0, 106, 255, 0.1)', text: '#006AFF' };

              return (
                <div
                  key={index}
                  style={{
                    ...styles.card,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <Icon style={{ width: '24px', height: '24px', color: colors.text }} />
                  </div>
                  <div style={{ ...styles.statValue, color: colors.text, opacity: statsLoading ? 0.5 : 1 }}>
                    {stat.value}
                  </div>
                  <p style={styles.statLabel}>{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" style={styles.section}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={styles.sectionTitle}>
              Meet Our <span style={{ color: '#006AFF' }}>Team</span>
            </h2>
            <p style={styles.sectionSubtitle}>
              The talented individuals behind SafariTix, working together to revolutionize bus travel.
            </p>
          </div>

          {/* Carousel */}
          <div style={styles.teamCarousel}>
            <div style={styles.carouselCard}>
              <div style={styles.carouselGrid}>
                {/* Image */}
                <div style={styles.carouselImage}>
                  <img
                    src={teamMembers[currentTeamIndex].photo}
                    alt={teamMembers[currentTeamIndex].name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      animation: 'fadeIn 0.5s ease-out',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: isDark ? '#2B2D42' : 'white',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}>
                    <span style={{
                      fontWeight: 'bold',
                      color: '#006AFF',
                      fontFamily: 'Montserrat, sans-serif',
                    }}>
                      {currentTeamIndex + 1}/{teamMembers.length}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={styles.carouselContent}>
                  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={styles.roleTag}>
                      {teamMembers[currentTeamIndex].role}
                    </div>
                    <h3 style={styles.teamName}>
                      {teamMembers[currentTeamIndex].name}
                    </h3>
                    <p style={styles.teamBio}>
                      {teamMembers[currentTeamIndex].bio}
                    </p>
                  </div>

                  {/* Indicators */}
                  <div style={styles.indicators}>
                    {teamMembers.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTeamIndex(index)}
                        style={{
                          ...styles.indicator,
                          width: index === currentTeamIndex ? '48px' : '8px',
                          background: index === currentTeamIndex ? '#006AFF' : (isDark ? '#4b5563' : '#d1d5db'),
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        aria-label={`Go to team member ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Grid */}
          <div style={styles.teamGrid}>
            {teamMembers.map((member: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentTeamIndex(index)}
                style={{
                  ...styles.teamThumb,
                  transform: index === currentTeamIndex ? 'scale(1.05)' : 'scale(1)',
                  opacity: index === currentTeamIndex ? 1 : 0.7,
                  border: index === currentTeamIndex ? '4px solid #006AFF' : 'none',
                  background: 'transparent',
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  if (index !== currentTeamIndex) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentTeamIndex) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.opacity = '0.7';
                  }
                }}
              >
                <div style={{ position: 'relative', paddingBottom: '100%' }}>
                  <img
                    src={member.photo}
                    alt={member.name}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%)',
                    borderRadius: '12px',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '12px',
                    color: 'white',
                  }}>
                    <p style={{
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      fontFamily: 'Montserrat, sans-serif',
                      margin: '0 0 4px 0',
                    }}>
                      {member.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.9, margin: 0 }}>
                      {member.role}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={styles.sectionAlt}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={styles.sectionTitle}>
              Get In <span style={{ color: '#006AFF' }}>Touch</span>
            </h2>
            <p style={styles.sectionSubtitle}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div style={styles.contactGrid}>
            <div>
              <div style={{
                background: isDark ? '#2B2D42' : 'white',
                borderRadius: '12px',
                padding: '24px',
                border: isDark ? '1px solid #3a3d52' : '1px solid #e5e7eb',
              }}>
                <form onSubmit={handleContactSubmit}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Name</label>
                    <Input
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Message</label>
                    <Textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Your message..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    style={{
                      width: '100%',
                      background: '#006AFF',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                    }}
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>

            <div>
              {[
                { icon: Mail, title: 'Email', text: 'support@safaritix.rw' },
                { icon: Phone, title: 'Phone', text: '+250 788 123 456' },
                { icon: MapPinned, title: 'Location', text: 'Kigali, Rwanda' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} style={styles.contactCard}>
                    <div style={styles.contactCardContent}>
                      <Icon style={{ width: '24px', height: '24px', color: '#006AFF', marginTop: '4px' }} />
                      <div>
                        <h4 style={{
                          fontWeight: 'bold',
                          marginBottom: '4px',
                          color: isDark ? '#F5F7FA' : '#2B2D42',
                        }}>
                          {item.title}
                        </h4>
                        <p style={{ color: isDark ? '#9ca3af' : '#6b7280', margin: 0 }}>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={styles.contactCard}>
                <h4 style={{
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  color: isDark ? '#F5F7FA' : '#2B2D42',
                }}>
                  Follow Us
                </h4>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {[Facebook, Instagram, Linkedin].map((Icon, idx) => (
                    <a
                      key={idx}
                      href="#"
                      style={styles.socialButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#006AFF';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 106, 255, 0.1)';
                        e.currentTarget.style.color = isDark ? '#F5F7FA' : '#2B2D42';
                      }}
                    >
                      <Icon style={{ width: '20px', height: '20px' }} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;