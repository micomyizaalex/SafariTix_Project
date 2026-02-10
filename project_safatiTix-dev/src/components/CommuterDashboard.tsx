const SAFARITIX = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  primarySoft: '#E6F4FB',
};
import { useState, useEffect, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/supabase-client';
import { publicAnonKey } from '../utils/supabase/info';
import { ThemeToggle } from './ThemeToggle';
import { PaymentModal } from './PaymentModal';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bus, Ticket, MapPin, LogOut, Calendar, Clock, ArrowRight, Search, TrendingUp, Zap, Star, Award } from 'lucide-react';
import { Input } from './ui/input';
import { CommuterSettings } from './CommuterSettings';
import { TicketDisplay } from './TicketDisplay';

interface CommuterDashboardProps {
  onSettings?: () => void;
}

export function CommuterDashboard({ onSettings }: CommuterDashboardProps) {
  const { user, accessToken, signOut } = useAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [numTickets, setNumTickets] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [recentTicket, setRecentTicket] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchLocations, 5000);
    return () => clearInterval(interval);
  }, [accessToken]);

  useEffect(() => {
    if (!searchFrom || !searchTo) {
      setFilteredSchedules([]);
      return;
    }
    const searchTimer = setTimeout(() => {
      performSearch();
    }, 800);
    return () => clearTimeout(searchTimer);
  }, [searchFrom, searchTo]);

  async function performSearch() {
    if (!searchFrom || !searchTo) {
      setSearchError('Enter both locations');
      setFilteredSchedules([]);
      return;
    }

    setSearchError(null);
    setSearchLoading(true);
    
    try {
      const response = await fetch(
        `${API_URL}/schedules/search-pg?from=${encodeURIComponent(searchFrom.trim())}&to=${encodeURIComponent(searchTo.trim())}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Search failed');
      }

      const data = await response.json();

      if (!data.schedules || data.schedules.length === 0) {
        setFilteredSchedules([]);
        setSearchError('No buses found');
        return;
      }

      const mapped = data.schedules.map((s: any) => ({
        id: s.id,
        routeFrom: s.from_location,
        routeTo: s.to_location,
        departureTime: s.departure_time,
        scheduleDate: s.schedule_date,
        seatsAvailable: s.available_seats,
        bookedSeats: s.booked_seats || 0,
        price: Number(s.price) || 0,
        companyName: s.company_name || 'N/A',
        companyId: s.company_id,
        busPlateNumber: s.bus_plate_number || 'N/A',
        driverName: s.driver_name || 'No driver',
        status: 'scheduled'
      }));

      setFilteredSchedules(mapped);
      setSearchError(null);
    } catch (error: any) {
      setSearchError(error.message || 'Search failed');
      setFilteredSchedules([]);
    } finally {
      setSearchLoading(false);
    }
  }

  async function fetchData() {
    try {
      const [schedulesRes, ticketsRes, locationsRes] = await Promise.all([
        fetch(`${API_URL}/schedules`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }).catch(() => null),
        (accessToken ? fetch(`${API_URL}/tickets`, { headers: { 'Authorization': `Bearer ${accessToken}` } }).catch(() => null) : Promise.resolve(null)),
        fetch(`${API_URL}/tracking`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }).catch(() => null)
      ]);

      if (schedulesRes?.ok) {
        const data = await schedulesRes.json();
        setSchedules(data.schedules);
      }

      if (ticketsRes?.ok) {
        const data = await ticketsRes.json();
        setTickets(data.tickets);
      }

      if (locationsRes?.ok) {
        const data = await locationsRes.json();
        setLocations(data.locations);
      }
    } catch (error) {
      // Silent
    } finally {
      setLoading(false);
    }
  }

  async function fetchLocations() {
    try {
      const res = await fetch(`${API_URL}/tracking`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } });
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations);
      }
    } catch (error) {}
  }

  async function handleCancelTicket(ticketId: string) {
    if (!confirm('Cancel ticket?')) return;
    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) await fetchData();
    } catch (error) {}
  }

  async function handlePaymentSuccess() {
    setShowPaymentModal(false);
    setSelectedSchedule(null);
    setNumTickets(1);
    await fetchData();
    setActiveTab('tickets');
  }

  const sortedTickets = [...tickets].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const activeTickets = sortedTickets.filter(t => t.status !== 'cancelled');
  const upcomingTicket = activeTickets[0];

  const styles: Record<string, CSSProperties> = {
    container: {
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
      position: 'relative' as const,
      paddingBottom: '90px',
    },
    // Animated Background Blobs
    blob1: {
      position: 'absolute' as const,
      top: '-10%',
      right: '-5%',
      width: '500px',
      height: '500px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'float 20s ease-in-out infinite',
      zIndex: 0,
    },
    blob2: {
      position: 'absolute' as const,
      bottom: '-10%',
      left: '-5%',
      width: '400px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(103,126,234,0.2) 0%, rgba(103,126,234,0) 70%)',
      borderRadius: '50%',
      filter: 'blur(50px)',
      animation: 'float 15s ease-in-out infinite reverse',
      zIndex: 0,
    },
    // Header
    header: {
      padding: '20px 16px',
      position: 'relative' as const,
      zIndex: 10,
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: '700',
      color: `${SAFARITIX.primary}`,
      border: '3px solid rgba(255,255,255,0.3)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    },
    greeting: {
      color: 'white',
    },
    greetingText: {
      fontSize: '14px',
      opacity: 0.9,
      marginBottom: '2px',
    },
    userName: {
      fontSize: '20px',
      fontWeight: '700',
      fontFamily: 'Montserrat, sans-serif',
    },
    headerActions: {
      display: 'flex',
      gap: '8px',
    },
    iconButton: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
      color: 'white',
    },
    // Main Content
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 16px',
      position: 'relative' as const,
      zIndex: 10,
    },
    // Stats Cards
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginBottom: '24px',
    },
    statCard: {
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '16px',
      border: '1px solid rgba(255,255,255,0.2)',
      color: 'white',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    },
    statIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      background: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '12px',
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      fontFamily: 'Montserrat, sans-serif',
      marginBottom: '4px',
    },
    statLabel: {
      fontSize: '12px',
      opacity: 0.9,
    },
    // Search Card
    searchCard: {
      background: 'white',
      borderRadius: '24px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    },
    searchHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    searchTitle: {
      fontSize: '20px',
      fontWeight: '700',
      fontFamily: 'Montserrat, sans-serif',
      color: '#1a1a1a',
    },
    quickFilters: {
      display: 'flex',
      gap: '8px',
    },
    filterPill: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none',
    },
    searchInputs: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '12px',
    },
    inputWrapper: {
      position: 'relative' as const,
      width: '100%',
    },
    searchInput: {
      width: '100%',
      padding: '14px 16px 14px 44px',
      borderRadius: '12px',
      border: '2px solid #e5e7eb',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s',
      background: '#f9fafb',
      boxSizing: 'border-box' as const,
    },
    inputIcon: {
      position: 'absolute' as const,
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#667eea',
    },
    // Bus Card (Modern)
    busCard: {
      background: 'white',
      borderRadius: '24px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
      transition: 'all 0.3s',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    },
    busCardAccent: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      background: `linear-gradient(180deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
    },
    busHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
    },
    companyBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 14px',
      background: `linear-gradient(135deg, ${SAFARITIX.primary} 50%, ${SAFARITIX.primaryDark} 100%)`,
      borderRadius: '12px',
      color: 'white',
      fontSize: '13px',
      fontWeight: '600',
    },
    seatsBadge: {
      padding: '8px 16px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
      color: 'white',
    },
    routeDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
    },
    cityName: {
      fontSize: '24px',
      fontWeight: '700',
      fontFamily: 'Montserrat, sans-serif',
      color: '#1a1a1a',
    },
    routeArrow: {
      width: '24px',
      height: '24px',
      color: `${SAFARITIX.primary}`,
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '20px',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    infoIconBox: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: `${SAFARITIX.primary}`,
    },
    infoText: {
      flex: 1,
    },
    infoLabel: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '2px',
    },
    infoValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1a1a1a',
    },
    priceRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
      borderRadius: '16px',
    },
    priceBox: {
      flex: 1,
    },
    priceLabel: {
      fontSize: '12px',
      color: `${SAFARITIX.primary}`,
      marginBottom: '4px',
      fontWeight: '500',
    },
    priceAmount: {
      fontSize: '32px',
      fontWeight: '700',
      fontFamily: 'Montserrat, sans-serif',
      color: `${SAFARITIX.primary}`,
    },
    bookButton: {
      padding: '14px 28px',
      background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
    },
    // Ticket Card
    ticketCard: {
      background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
      borderRadius: '24px',
      padding: '24px',
      color: 'white',
      marginBottom: '20px',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      boxShadow: '0 20px 60px rgba(102,126,234,0.4)',
    },
    ticketPattern: {
      position: 'absolute' as const,
      top: 0,
      right: 0,
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
      borderRadius: '50%',
      filter: 'blur(40px)',
    },
    ticketHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px',
      position: 'relative' as const,
      zIndex: 1,
    },
    nextTripBadge: {
      fontSize: '12px',
      padding: '6px 12px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '20px',
      marginBottom: '8px',
      display: 'inline-block',
    },
    ticketRoute: {
      fontSize: '24px',
      fontWeight: '700',
      fontFamily: 'Montserrat, sans-serif',
      marginBottom: '4px',
    },
    seatBadge: {
      padding: '8px 16px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
    },
    ticketInfo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginBottom: '20px',
      position: 'relative' as const,
      zIndex: 1,
    },
    ticketInfoItem: {
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '12px',
    },
    ticketLabel: {
      fontSize: '11px',
      opacity: 0.8,
      marginBottom: '4px',
    },
    ticketValue: {
      fontSize: '16px',
      fontWeight: '600',
    },
    // Bottom Nav
    bottomNav: {
      position: 'fixed' as const,
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      padding: '12px 0',
      zIndex: 100,
      boxShadow: '0 -10px 40px rgba(0,0,0,0.08)',
    },
    navContent: {
      maxWidth: '600px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      padding: '0 16px',
    },
    navItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '6px',
      padding: '10px',
      borderRadius: '16px',
      cursor: 'pointer',
      border: 'none',
      background: 'transparent',
      transition: 'all 0.3s',
    },
    navItemActive: {
      background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
      color: 'white',
    },
    navItemInactive: {
      color: '#6b7280',
    },
    navLabel: {
      fontSize: '12px',
      fontWeight: '600',
    },
    // Empty State
    emptyState: {
      textAlign: 'center' as const,
      padding: '60px 20px',
    },
    emptyIllustration: {
      width: '120px',
      height: '120px',
      margin: '0 auto 24px',
      background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.15,
    },
    emptyTitle: {
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '8px',
      color: 'white',
    },
    emptyText: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.8)',
    },
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: 'white',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: 'white', fontSize: '16px' }}>Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.userSection}>
            <div style={styles.avatar}>
              {(user?.name || 'G').charAt(0).toUpperCase()}
            </div>
            <div style={styles.greeting}>
              <div style={styles.greetingText}>Welcome back,</div>
              <div style={styles.userName}>{user?.name || 'Guest'}</div>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button
              style={styles.iconButton}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <ThemeToggle />
            </button>
            <button
              onClick={signOut}
              style={styles.iconButton}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <LogOut style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'home' && (
          <>
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>
                  <Ticket style={{ width: '20px', height: '20px' }} />
                </div>
                <div style={styles.statValue}>{activeTickets.length}</div>
                <div style={styles.statLabel}>Active Tickets</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>
                  <TrendingUp style={{ width: '20px', height: '20px' }} />
                </div>
                <div style={styles.statValue}>{schedules.length}</div>
                <div style={styles.statLabel}>Routes</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>
                  <Zap style={{ width: '20px', height: '20px' }} />
                </div>
                <div style={styles.statValue}>{locations.length}</div>
                <div style={styles.statLabel}>Live Buses</div>
              </div>
            </div>

            {/* Upcoming Trip */}
            {upcomingTicket && (
              <div style={styles.ticketCard}>
                <div style={styles.ticketPattern} />
                <div style={styles.ticketHeader}>
                  <div>
                    <div style={styles.nextTripBadge}>🎫 Your Next Trip</div>
                    <div style={styles.ticketRoute}>
                      {upcomingTicket.routeFrom} → {upcomingTicket.routeTo}
                    </div>
                  </div>
                  <div style={styles.seatBadge}>Seat {upcomingTicket.seatNumber}</div>
                </div>
                <div style={styles.ticketInfo}>
                  <div style={styles.ticketInfoItem}>
                    <div style={styles.ticketLabel}>Date</div>
                    <div style={styles.ticketValue}>
                      {upcomingTicket.scheduleDate 
                        ? new Date(upcomingTicket.scheduleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Today'}
                    </div>
                  </div>
                  <div style={styles.ticketInfoItem}>
                    <div style={styles.ticketLabel}>Time</div>
                    <div style={styles.ticketValue}>
                      {upcomingTicket.departureTime 
                        ? new Date(upcomingTicket.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                    </div>
                  </div>
                  <div style={styles.ticketInfoItem}>
                    <div style={styles.ticketLabel}>Price</div>
                    <div style={styles.ticketValue}>
                      RWF {upcomingTicket.price?.toLocaleString()}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setRecentTicket(upcomingTicket)}
                  style={{
                    width: '100%',
                    background: 'white',
                    color: '#667eea',
                    fontWeight: '600',
                    padding: '14px',
                    borderRadius: '16px',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  View QR Code →
                </Button>
              </div>
            )}

            {/* Search Card */}
            <div style={styles.searchCard}>
              <div style={styles.searchHeader}>
                <div style={styles.searchTitle}>Find Your Bus</div>
                <div style={styles.quickFilters}>
                  <button
                    style={{
                      ...styles.filterPill,
                      background: '#e0e7ff',
                      color: '#667eea',
                    }}
                  >
                    Popular
                  </button>
                  <button
                    style={{
                      ...styles.filterPill,
                      background: '#f3f4f6',
                      color: '#6b7280',
                    }}
                  >
                    Today
                  </button>
                </div>
              </div>

              <div style={styles.searchInputs}>
                <div style={styles.inputWrapper}>
                  <div style={styles.inputIcon}>
                    <MapPin style={{ width: '20px', height: '20px' }} />
                  </div>
                  <input
                    placeholder="From city"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    style={styles.searchInput}
                    onFocus={(e) => e.currentTarget.style.borderColor = SAFARITIX.primary}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <div style={styles.inputWrapper}>
                  <div style={styles.inputIcon}>
                    <MapPin style={{ width: '20px', height: '20px' }} />
                  </div>
                  <input
                    placeholder="To city"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    style={styles.searchInput}
                    onFocus={(e) => e.currentTarget.style.borderColor = SAFARITIX.primary}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {searchLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: SAFARITIX.primary, fontSize: '14px' }}>
                  <div style={{ width: '16px', height: '16px', border: `2px solid ${SAFARITIX.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Searching buses...
                </div>
              )}

              {searchError && (
                <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '8px' }}>
                  {searchError}
                </div>
              )}
            </div>

            {/* Bus Results */}
            {!searchFrom && !searchTo ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIllustration}>
                  <Search style={{ width: '60px', height: '60px', color: 'white' }} />
                </div>
                <div style={styles.emptyTitle}>Start Your Journey</div>
                <div style={styles.emptyText}>Enter your route to discover available buses</div>
              </div>
            ) : filteredSchedules.length === 0 && !searchLoading ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIllustration}>
                  <Bus style={{ width: '60px', height: '60px', color: 'white' }} />
                </div>
                <div style={styles.emptyTitle}>No Buses Found</div>
                <div style={styles.emptyText}>Try a different route or date</div>
              </div>
            ) : (
              filteredSchedules.map((schedule) => {
                const isLowSeats = schedule.seatsAvailable <= 5;
                return (
                  <div
                    key={schedule.id}
                    style={styles.busCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                    }}
                  >
                    <div style={styles.busCardAccent} />
                    <div style={styles.busHeader}>
                      <div style={styles.companyBadge}>
                        <Award style={{ width: '16px', height: '16px' }} />
                        {schedule.companyName}
                      </div>
                      <div style={{
                        ...styles.seatsBadge,
                        background: isLowSeats ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      }}>
                        {schedule.seatsAvailable} seats
                      </div>
                    </div>

                    <div style={styles.routeDisplay}>
                      <div style={styles.cityName}>{schedule.routeFrom}</div>
                      <ArrowRight style={styles.routeArrow} />
                      <div style={styles.cityName}>{schedule.routeTo}</div>
                    </div>

                    <div style={styles.infoGrid}>
                      <div style={styles.infoItem}>
                        <div style={styles.infoIconBox}>
                          <Calendar style={{ width: '20px', height: '20px' }} />
                        </div>
                        <div style={styles.infoText}>
                          <div style={styles.infoLabel}>Date</div>
                          <div style={styles.infoValue}>
                            {schedule.scheduleDate 
                              ? new Date(schedule.scheduleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'Today'}
                          </div>
                        </div>
                      </div>
                      <div style={styles.infoItem}>
                        <div style={styles.infoIconBox}>
                          <Clock style={{ width: '20px', height: '20px' }} />
                        </div>
                        <div style={styles.infoText}>
                          <div style={styles.infoLabel}>Departure</div>
                          <div style={styles.infoValue}>
                            {schedule.departureTime 
                              ? new Date(schedule.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={styles.priceRow}>
                      <div style={styles.priceBox}>
                        <div style={styles.priceLabel}>Price per seat</div>
                        <div style={styles.priceAmount}>
                          RWF {schedule.price.toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/app/schedules/${schedule.id}`)}
                        style={styles.bookButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(102,126,234,0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(102,126,234,0.3)';
                        }}
                      >
                        Book Now →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* Other Tabs */}
        {activeTab === 'tickets' && (
          <div style={{ marginTop: '20px' }}>
            {activeTickets.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIllustration}>
                  <Ticket style={{ width: '60px', height: '60px', color: 'white' }} />
                </div>
                <div style={styles.emptyTitle}>No Tickets</div>
                <div style={styles.emptyText}>Your tickets will appear here</div>
              </div>
            ) : (
              activeTickets.map((ticket) => (
                <div key={ticket.id} style={styles.ticketCard}>
                  <div style={styles.ticketPattern} />
                  <div style={styles.ticketHeader}>
                    <div>
                      <div style={styles.ticketRoute}>
                        {ticket.routeFrom} → {ticket.routeTo}
                      </div>
                    </div>
                    <div style={styles.seatBadge}>Seat {ticket.seatNumber}</div>
                  </div>
                  <div style={styles.ticketInfo}>
                    <div style={styles.ticketInfoItem}>
                      <div style={styles.ticketLabel}>Date</div>
                      <div style={styles.ticketValue}>
                        {ticket.scheduleDate 
                          ? new Date(ticket.scheduleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'N/A'}
                      </div>
                    </div>
                    <div style={styles.ticketInfoItem}>
                      <div style={styles.ticketLabel}>Time</div>
                      <div style={styles.ticketValue}>
                        {ticket.departureTime 
                          ? new Date(ticket.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          : 'N/A'}
                      </div>
                    </div>
                    <div style={styles.ticketInfoItem}>
                      <div style={styles.ticketLabel}>Price</div>
                      <div style={styles.ticketValue}>
                        RWF {ticket.price?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', position: 'relative', zIndex: 1 }}>
                    <Button
                      onClick={() => setRecentTicket(ticket)}
                      style={{ background: 'white', color: SAFARITIX.primary, fontWeight: '600', padding: '12px', borderRadius: '12px' }}
                    >
                      View QR
                    </Button>
                    <Button
                      onClick={() => handleCancelTicket(ticket.id)}
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: '600', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'track' && (
          <div style={{ marginTop: '20px' }}>
            {locations.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIllustration}>
                  <MapPin style={{ width: '60px', height: '60px', color: 'white' }} />
                </div>
                <div style={styles.emptyTitle}>No Live Buses</div>
                <div style={styles.emptyText}>Tracking will appear when buses are active</div>
              </div>
            ) : (
              locations.map((loc) => (
                <div key={loc.busId} style={{ ...styles.searchCard, marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${SAFARITIX.primary} 0%, ${SAFARITIX.primaryDark} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}>
                      <Bus style={{ width: '30px', height: '30px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                        Bus {loc.busId.slice(0, 8)}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        Lat: {loc.lat.toFixed(6)} • Lng: {loc.lng.toFixed(6)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                        Updated: {new Date(loc.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ ...styles.searchCard, marginTop: '20px' }}>
            <CommuterSettings />
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={styles.bottomNav}>
        <div style={styles.navContent}>
          <button
            style={{
              ...styles.navItem,
              ...(activeTab === 'home' ? styles.navItemActive : styles.navItemInactive),
            }}
            onClick={() => setActiveTab('home')}
          >
            <Search style={{ width: '22px', height: '22px' }} />
            <span style={styles.navLabel}>Home</span>
          </button>
          <button
            style={{
              ...styles.navItem,
              ...(activeTab === 'tickets' ? styles.navItemActive : styles.navItemInactive),
            }}
            onClick={() => setActiveTab('tickets')}
          >
            <Ticket style={{ width: '22px', height: '22px' }} />
            <span style={styles.navLabel}>Tickets</span>
          </button>
          <button
            style={{
              ...styles.navItem,
              ...(activeTab === 'track' ? styles.navItemActive : styles.navItemInactive),
            }}
            onClick={() => setActiveTab('track')}
          >
            <MapPin style={{ width: '22px', height: '22px' }} />
            <span style={styles.navLabel}>Track</span>
          </button>
          <button
            style={{
              ...styles.navItem,
              ...(activeTab === 'profile' ? styles.navItemActive : styles.navItemInactive),
            }}
            onClick={() => setActiveTab('profile')}
          >
            <Star style={{ width: '22px', height: '22px' }} />
            <span style={styles.navLabel}>Profile</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedSchedule && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedSchedule(null);
            setNumTickets(1);
          }}
          amount={selectedSchedule.price * numTickets}
          scheduleId={selectedSchedule.id}
          numTickets={numTickets}
          onSuccess={handlePaymentSuccess}
          title="Complete Booking"
          description={`Pay for ${numTickets} ticket${numTickets > 1 ? 's' : ''}`}
          busDetails={{
            route: `${selectedSchedule.routeFrom} → ${selectedSchedule.routeTo}`,
            date: selectedSchedule.scheduleDate 
              ? new Date(selectedSchedule.scheduleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
              : 'N/A',
            time: selectedSchedule.departureTime 
              ? new Date(selectedSchedule.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : 'N/A',
            company: selectedSchedule.companyName || 'N/A'
          }}
        />
      )}

      {recentTicket && (
        <TicketDisplay ticket={recentTicket} onClose={() => setRecentTicket(null)} />
      )}

      {/* Animations */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-20px) translateX(20px); }
          }
        `}
      </style>
    </div>
  );
}