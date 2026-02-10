import { useState, useEffect, CSSProperties } from 'react';
import { useAuth } from '../components/AuthContext';
import { Settings as SettingsIcon, Building2, Mail, Phone, MapPin, Save } from 'lucide-react';

const SAFARITIX = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  primarySoft: '#E6F4FB',
};

interface CompanyData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  subscriptionStatus: string;
}

export default function CompanySettings() {
  const { accessToken } = useAuth();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/company`, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company information');
      }
      
      const data = await response.json();
      const companyData = data.company;
      
      setCompany(companyData);
      setFormData({
        name: companyData.name || '',
        email: companyData.email || '',
        phone: companyData.phone || '',
        address: companyData.address || '',
      });
    } catch (error) {
      console.error('Error fetching company info:', error);
      alert('Failed to load company information');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/company`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company information');
      }

      await fetchCompanyInfo();
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update settings';
      alert(`Error: ${errorMsg}`);
    }
  };

  const styles: Record<string, CSSProperties> = {
    container: {
      padding: '32px',
      maxWidth: '900px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      padding: '32px',
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box' as const,
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box' as const,
      minHeight: '100px',
      resize: 'vertical' as const,
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 12px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
    },
    saveButton: {
      padding: '12px 32px',
      background: SAFARITIX.primary,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    loading: {
      textAlign: 'center' as const,
      padding: '60px 20px',
      fontSize: '16px',
      color: '#6B7280',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #F3F4F6',
    },
    infoLabel: {
      fontSize: '14px',
      color: '#6B7280',
      fontWeight: '500',
    },
    infoValue: {
      fontSize: '14px',
      color: '#111827',
      fontWeight: '600',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <SettingsIcon size={32} color={SAFARITIX.primary} />
          Company Settings
        </h1>
        <p style={styles.subtitle}>
          Manage your company profile and preferences
        </p>
      </div>

      {/* Company Status Card */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          <Building2 size={20} color={SAFARITIX.primary} />
          Account Status
        </h2>
        
        <div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Company Status</span>
            <span
              style={{
                ...styles.statusBadge,
                background: company?.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                color: company?.status === 'active' ? '#15803D' : '#DC2626',
              }}
            >
              {company?.status?.toUpperCase() || 'PENDING'}
            </span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Subscription</span>
            <span
              style={{
                ...styles.statusBadge,
                background: company?.subscriptionStatus === 'active' ? '#DBEAFE' : '#F3F4F6',
                color: company?.subscriptionStatus === 'active' ? '#1D4ED8' : '#6B7280',
              }}
            >
              {company?.subscriptionStatus?.toUpperCase() || 'INACTIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Company Information Card */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          <Building2 size={20} color={SAFARITIX.primary} />
          Company Information
        </h2>
        
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Building2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Company Name
            </label>
            <input
              type="text"
              style={styles.input}
              placeholder="Enter company name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Email Address
            </label>
            <input
              type="email"
              style={styles.input}
              placeholder="contact@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Phone Number
            </label>
            <input
              type="text"
              style={styles.input}
              placeholder="+254 700 000 000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Company Address
          </label>
          <textarea
            style={styles.textarea}
            placeholder="Enter company address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <button style={styles.saveButton} onClick={handleSaveSettings}>
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
