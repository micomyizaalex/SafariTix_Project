import { CSSProperties } from 'react';

const SAFARITIX = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  primarySoft: '#E6F4FB',
};

export function CompanyTickets() {
  const styles: Record<string, CSSProperties> = {
    container: {
      background: 'white',
      borderRadius: '16px',
      padding: '32px',
      minHeight: '400px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '24px',
    },
    comingSoon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    icon: {
      fontSize: '64px',
    },
    message: {
      fontSize: '18px',
      color: '#6B7280',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tickets Management</h1>
      <p style={styles.subtitle}>View and manage all bus tickets</p>
      
      <div style={styles.comingSoon}>
        <div style={styles.icon}>🎫</div>
        <p style={styles.message}>Tickets module coming soon...</p>
      </div>
    </div>
  );
}

export function CompanyBuses() {
  const styles: Record<string, CSSProperties> = {
    container: {
      background: 'white',
      borderRadius: '16px',
      padding: '32px',
      minHeight: '400px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '24px',
    },
    comingSoon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    icon: {
      fontSize: '64px',
    },
    message: {
      fontSize: '18px',
      color: '#6B7280',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Buses Management</h1>
      <p style={styles.subtitle}>Manage your fleet of buses</p>
      
      <div style={styles.comingSoon}>
        <div style={styles.icon}>🚌</div>
        <p style={styles.message}>Buses module coming soon...</p>
      </div>
    </div>
  );
}

export function CompanyDrivers() {
  const styles: Record<string, CSSProperties> = {
    container: {
      background: 'white',
      borderRadius: '16px',
      padding: '32px',
      minHeight: '400px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '24px',
    },
    comingSoon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    icon: {
      fontSize: '64px',
    },
    message: {
      fontSize: '18px',
      color: '#6B7280',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Drivers Management</h1>
      <p style={styles.subtitle}>Manage your drivers and assignments</p>
      
      <div style={styles.comingSoon}>
        <div style={styles.icon}>👤</div>
        <p style={styles.message}>Drivers module coming soon...</p>
      </div>
    </div>
  );
}

export function CompanyTracking() {
  const styles: Record<string, CSSProperties> = {
    container: {
      background: 'white',
      borderRadius: '16px',
      padding: '32px',
      minHeight: '400px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '24px',
    },
    comingSoon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    icon: {
      fontSize: '64px',
    },
    message: {
      fontSize: '18px',
      color: '#6B7280',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Live Tracking</h1>
      <p style={styles.subtitle}>Track your buses in real-time</p>
      
      <div style={styles.comingSoon}>
        <div style={styles.icon}>📍</div>
        <p style={styles.message}>Live tracking module coming soon...</p>
      </div>
    </div>
  );
}

export function CompanyRevenue() {
  const styles: Record<string, CSSProperties> = {
    container: {
      background: 'white',
      borderRadius: '16px',
      padding: '32px',
      minHeight: '400px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '24px',
    },
    comingSoon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    icon: {
      fontSize: '64px',
    },
    message: {
      fontSize: '18px',
      color: '#6B7280',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Revenue Analytics</h1>
      <p style={styles.subtitle}>View revenue reports and analytics</p>
      
      <div style={styles.comingSoon}>
        <div style={styles.icon}>💰</div>
        <p style={styles.message}>Revenue module coming soon...</p>
      </div>
    </div>
  );
}

export function CompanySubscription() {
  const styles: Record<string, CSSProperties> = {
    container: {
      background: 'white',
      borderRadius: '16px',
      padding: '32px',
      minHeight: '400px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '24px',
    },
    comingSoon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    icon: {
      fontSize: '64px',
    },
    message: {
      fontSize: '18px',
      color: '#6B7280',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Subscription Plans</h1>
      <p style={styles.subtitle}>Manage your subscription and billing</p>
      
      <div style={styles.comingSoon}>
        <div style={styles.icon}>⭐</div>
        <p style={styles.message}>Subscription module coming soon...</p>
      </div>
    </div>
  );
}

export function CompanyReports() {
  const styles: Record<string, CSSProperties> = {
    container: {
      background: 'white',
      borderRadius: '16px',
      padding: '32px',
      minHeight: '400px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '24px',
    },
    comingSoon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    icon: {
      fontSize: '64px',
    },
    message: {
      fontSize: '18px',
      color: '#6B7280',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Reports & Analytics</h1>
      <p style={styles.subtitle}>Generate and view detailed reports</p>
      
      <div style={styles.comingSoon}>
        <div style={styles.icon}>📊</div>
        <p style={styles.message}>Reports module coming soon...</p>
      </div>
    </div>
  );
}
