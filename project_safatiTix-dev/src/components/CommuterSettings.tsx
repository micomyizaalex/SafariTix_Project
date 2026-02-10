const SAFARITIX = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  primarySoft: '#E6F4FB',
};

import { useState, CSSProperties } from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, Mail, Phone, Lock, Save, Camera, Award, Bell, Globe, Trash2, LogOut, Shield, Check } from 'lucide-react';

export function CommuterSettings() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implement actual save functionality
    setTimeout(() => {
      setSaving(false);
      alert('✓ Settings saved successfully!');
    }, 1000);
  };

  const handleSignOut = () => {
    signOut();
  };

  const styles: Record<string, CSSProperties> = {
    container: {
      padding: '0',
      minHeight: '100vh',
    },
    // Header
    header: {
      marginBottom: '32px',
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: '700',
      fontFamily: 'Montserrat, sans-serif',
      color: '#1a1a1a',
      marginBottom: '8px',
    },
    headerSubtitle: {
      fontSize: '14px',
      color: '#6b7280',
    },
    // Profile Card
    profileCard: {
      background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
      borderRadius: '24px',
      padding: '32px',
      marginBottom: '24px',
      color: 'white',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      boxShadow: '0 20px 60px rgba(102,126,234,0.3)',
    },
    profilePattern: {
      position: 'absolute' as const,
      top: '-50px',
      right: '-50px',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
      borderRadius: '50%',
      filter: 'blur(40px)',
    },
    profileContent: {
      position: 'relative' as const,
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    avatarWrapper: {
      position: 'relative' as const,
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      fontWeight: '700',
      color: `${SAFARITIX.primary}`,
      border: '4px solid rgba(255,255,255,0.3)',
      fontFamily: 'Montserrat, sans-serif',
    },
    cameraButton: {
      position: 'absolute' as const,
      bottom: '0',
      right: '0',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'white',
      color: `${SAFARITIX.primary}`,
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '4px',
      fontFamily: 'Montserrat, sans-serif',
    },
    profileEmail: {
      fontSize: '14px',
      opacity: 0.9,
    },
    profileBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      marginTop: '8px',
    },
    // Tabs
    tabsContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      overflowX: 'auto' as const,
      padding: '4px',
    },
    tab: {
      padding: '12px 20px',
      borderRadius: '16px',
      border: 'none',
      background: '#f3f4f6',
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      whiteSpace: 'nowrap' as const,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    tabActive: {
      background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
      color: 'white',
      boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
    },
    // Content Cards
    contentCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '16px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '16px',
      fontFamily: 'Montserrat, sans-serif',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#1a1a1a',
    },
    // Form
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    inputWrapper: {
      position: 'relative' as const,
    },
    inputIcon: {
      position: 'absolute' as const,
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: `${SAFARITIX.primary}`,
    },
    input: {
      width: '100%',
      padding: '14px 14px 14px 44px',
      borderRadius: '14px',
      border: '2px solid #e5e7eb',
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.2s',
      background: '#f9fafb',
    },
    // Toggle
    toggleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      background: '#f9fafb',
      borderRadius: '14px',
      marginBottom: '12px',
    },
    toggleInfo: {
      flex: 1,
    },
    toggleTitle: {
      fontSize: '15px',
      fontWeight: '500',
      marginBottom: '2px',
      color: '#1a1a1a',
    },
    toggleDesc: {
      fontSize: '13px',
      color: '#6b7280',
    },
    toggle: {
      width: '48px',
      height: '28px',
      borderRadius: '14px',
      background: '#d1d5db',
      position: 'relative' as const,
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    toggleActive: {
      background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
    },
    toggleKnob: {
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      background: 'white',
      position: 'absolute' as const,
      top: '3px',
      left: '3px',
      transition: 'all 0.3s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    },
    toggleKnobActive: {
      left: '23px',
    },
    // Buttons
    primaryButton: {
      width: '100%',
      padding: '14px',
      background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    secondaryButton: {
      width: '100%',
      padding: '14px',
      background: 'white',
      color: `${SAFARITIX.primary}`,
      border: `2px solid ${SAFARITIX.primary}`,
      borderRadius: '14px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '12px',
    },
    dangerButton: {
      width: '100%',
      padding: '14px',
      background: '#fee2e2',
      color: '#dc2626',
      border: '2px solid #dc2626',
      borderRadius: '14px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    // Stats
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginTop: '24px',
    },
    statBox: {
      padding: '20px',
      background: 'rgba(255,255,255,0.15)',
      borderRadius: '16px',
      textAlign: 'center' as const,
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '4px',
      fontFamily: 'Montserrat, sans-serif',
    },
    statLabel: {
      fontSize: '13px',
      opacity: 0.9,
    },
    // Success Badge
    successBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      background: '#d1fae5',
      color: '#065f46',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '16px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Profile Header Card */}
      <div style={styles.profileCard}>
        <div style={styles.profilePattern} />
        <div style={styles.profileContent}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              {(name || 'U').charAt(0).toUpperCase()}
            </div>
            <button style={styles.cameraButton}>
              <Camera style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>{name || 'User'}</div>
            <div style={styles.profileEmail}>{email || 'user@example.com'}</div>
            <div style={styles.profileBadge}>
              <Award style={{ width: '14px', height: '14px' }} />
              Premium Member
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <div style={styles.statValue}>12</div>
            <div style={styles.statLabel}>Total Trips</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statValue}>3</div>
            <div style={styles.statLabel}>Active Tickets</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveSection('profile')}
          style={{
            ...styles.tab,
            ...(activeSection === 'profile' ? styles.tabActive : {}),
          }}
        >
          <User style={{ width: '16px', height: '16px' }} />
          Profile
        </button>
        <button
          onClick={() => setActiveSection('preferences')}
          style={{
            ...styles.tab,
            ...(activeSection === 'preferences' ? styles.tabActive : {}),
          }}
        >
          <Bell style={{ width: '16px', height: '16px' }} />
          Preferences
        </button>
        <button
          onClick={() => setActiveSection('security')}
          style={{
            ...styles.tab,
            ...(activeSection === 'security' ? styles.tabActive : {}),
          }}
        >
          <Shield style={{ width: '16px', height: '16px' }} />
          Security
        </button>
      </div>

      {/* Profile Section */}
      {activeSection === 'profile' && (
        <div style={styles.contentCard}>
          <div style={styles.cardTitle}>
            <User style={{ width: '20px', height: '20px', color: SAFARITIX.primary }} />
            Personal Information
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <div style={styles.inputIcon}>
                <User style={{ width: '18px', height: '18px' }} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                style={styles.input}
                onFocus={(e) => e.currentTarget.style.borderColor = SAFARITIX.primary}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <div style={styles.inputIcon}>
                <Mail style={{ width: '18px', height: '18px' }} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={styles.input}
                onFocus={(e) => e.currentTarget.style.borderColor = SAFARITIX.primary}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <div style={styles.inputWrapper}>
              <div style={styles.inputIcon}>
                <Phone style={{ width: '18px', height: '18px' }} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250 XXX XXX XXX"
                style={styles.input}
                onFocus={(e) => e.currentTarget.style.borderColor = SAFARITIX.primary}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={styles.primaryButton}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(102,126,234,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(102,126,234,0.3)';
            }}
          >
            <Save style={{ width: '18px', height: '18px' }} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Preferences Section */}
      {activeSection === 'preferences' && (
        <>
          <div style={styles.contentCard}>
            <div style={styles.cardTitle}>
              <Bell style={{ width: '20px', height: '20px', color: SAFARITIX.primary }} />
              Notifications
            </div>

            <div style={styles.toggleRow}>
              <div style={styles.toggleInfo}>
                <div style={styles.toggleTitle}>Push Notifications</div>
                <div style={styles.toggleDesc}>Get notified about your trips</div>
              </div>
              <div
                onClick={() => setNotifications(!notifications)}
                style={{
                  ...styles.toggle,
                  ...(notifications ? styles.toggleActive : {}),
                }}
              >
                <div
                  style={{
                    ...styles.toggleKnob,
                    ...(notifications ? styles.toggleKnobActive : {}),
                  }}
                />
              </div>
            </div>

            <div style={styles.toggleRow}>
              <div style={styles.toggleInfo}>
                <div style={styles.toggleTitle}>Email Updates</div>
                <div style={styles.toggleDesc}>Receive booking confirmations</div>
              </div>
              <div style={styles.toggle}>
                <div style={styles.toggleKnob} />
              </div>
            </div>

            <div style={styles.toggleRow}>
              <div style={styles.toggleInfo}>
                <div style={styles.toggleTitle}>SMS Alerts</div>
                <div style={styles.toggleDesc}>Get text message reminders</div>
              </div>
              <div style={styles.toggle}>
                <div style={styles.toggleKnob} />
              </div>
            </div>
          </div>

          <div style={styles.contentCard}>
            <div style={styles.cardTitle}>
              <Globe style={{ width: '20px', height: '20px', color: SAFARITIX.primary }} />
              Language & Region
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  ...styles.input,
                  paddingLeft: '16px',
                }}
              >
                <option value="English">English</option>
                <option value="Kinyarwanda">Kinyarwanda</option>
                <option value="French">Français</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <>
          <div style={styles.contentCard}>
            <div style={styles.cardTitle}>
              <Lock style={{ width: '20px', height: '20px', color: SAFARITIX.primary }} />
              Password & Security
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Current Password</label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIcon}>
                  <Lock style={{ width: '18px', height: '18px' }} />
                </div>
                <input
                  type="password"
                  placeholder="Enter current password"
                  style={styles.input}
                  onFocus={(e) => e.currentTarget.style.borderColor = SAFARITIX.primary}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIcon}>
                  <Lock style={{ width: '18px', height: '18px' }} />
                </div>
                <input
                  type="password"
                  placeholder="Enter new password"
                  style={styles.input}
                  onFocus={(e) => e.currentTarget.style.borderColor = SAFARITIX.primary}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <button
              style={styles.secondaryButton}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <Shield style={{ width: '18px', height: '18px' }} />
              Update Password
            </button>
          </div>

          <div style={styles.contentCard}>
            <div style={styles.cardTitle}>
              <LogOut style={{ width: '20px', height: '20px', color: SAFARITIX.primary }} />
              Account Actions
            </div>

            <button
              onClick={handleSignOut}
              style={styles.secondaryButton}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <LogOut style={{ width: '18px', height: '18px' }} />
              Sign Out
            </button>

            <button
              style={styles.dangerButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.color = '#dc2626';
              }}
            >
              <Trash2 style={{ width: '18px', height: '18px' }} />
              Delete Account
            </button>
          </div>
        </>
      )}
    </div>
  );
}