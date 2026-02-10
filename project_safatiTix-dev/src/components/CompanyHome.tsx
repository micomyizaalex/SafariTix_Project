const SAFARITIX = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  primarySoft: '#E6F4FB',
};

import { useState, useEffect, CSSProperties } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/supabase-client';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  MoreVertical,
} from 'lucide-react';

interface Sale {
  id: string;
  customerName: string;
  customerAvatar: string;
  amount: number;
  timestamp: string;
}

interface Order {
  id: string;
  customerName: string;
  customerAvatar: string;
  amount: number;
  status: 'chargeback' | 'completed';
  date: string;
}

export function CompanyHome() {
  const { accessToken } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(56874);
  const [sales, setSales] = useState(24575);
  const [totalProfit, setTotalProfit] = useState(76356);

  const weekData = [
    { day: 'Mon', value: 15000 },
    { day: 'Tue', value: 33567 },
    { day: 'Wed', value: 28000 },
    { day: 'Thu', value: 18000 },
    { day: 'Fri', value: 12000 },
    { day: 'Sat', value: 30000 },
    { day: 'Sun', value: 26000 },
  ];

  const maxValue = Math.max(...weekData.map(d => d.value));

  const recentSales: Sale[] = [
    { id: '1', customerName: 'Steven Summer', customerAvatar: '👤', amount: 52.00, timestamp: '02 Minutes Ago' },
    { id: '2', customerName: 'Jordan Maizee', customerAvatar: '👤', amount: 83.00, timestamp: '02 Minutes Ago' },
    { id: '3', customerName: 'Jessica Alba', customerAvatar: '👤', amount: 61.60, timestamp: '05 Minutes Ago' },
    { id: '4', customerName: 'Anna Armas', customerAvatar: '👤', amount: 2351.00, timestamp: '05 Minutes Ago' },
    { id: '5', customerName: 'Angelina Boo', customerAvatar: '👤', amount: 152.00, timestamp: '10 Minutes Ago' },
    { id: '6', customerName: 'Anastasia Koss', customerAvatar: '👤', amount: 542.00, timestamp: '12 Minutes Ago' },
  ];

  const lastOrders: Order[] = [
    { id: '1', customerName: 'David Astee', customerAvatar: '👤', amount: 1456, status: 'chargeback', date: '11 Sep 2022' },
    { id: '2', customerName: 'Maria Hularna', customerAvatar: '👤', amount: 42438, status: 'completed', date: '11 Sep 2022' },
    { id: '3', customerName: 'Arnold Swarz', customerAvatar: '👤', amount: 3412, status: 'completed', date: '11 Sep 2022' },
  ];

  useEffect(() => {
    if (!accessToken) return;
    fetchData();
  }, [accessToken]);

  async function fetchData() {
    try {
      const companyRes = await fetch(`${API_URL}/company`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (companyRes.ok) {
        const data = await companyRes.json();
        setCompany(data.company);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const styles: Record<string, CSSProperties> = {
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginBottom: '32px',
    },
    statCard: {
      borderRadius: '16px',
      padding: '24px',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    },
    balanceCard: {
      background: 'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)',
    },
    salesCard: {
      background: 'linear-gradient(135deg, #FFE082 0%, #FFD54F 100%)',
    },
    upgradeCard: {
      background: 'linear-gradient(135deg, #B39DDB 0%, #9575CD 100%)',
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
    },
    statLabel: {
      fontSize: '14px',
      fontWeight: '500',
    },
    statBadge: {
      marginLeft: 'auto',
      fontSize: '11px',
      fontWeight: '600',
      padding: '4px 8px',
      borderRadius: '4px',
    },
    statValue: {
      fontSize: '30px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '12px',
    },
    miniChart: {
      height: '48px',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '2px',
    },
    miniBar: {
      flex: 1,
      borderRadius: '2px 2px 0 0',
    },
    upgradeTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: 'white',
      marginBottom: '8px',
    },
    upgradeText: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.9)',
      marginBottom: '16px',
    },
    upgradeButton: {
      background: 'white',
      color: '#7C3AED',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
    },
    chartCard: {
      gridColumn: 'span 2',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '4px',
    },
    growthBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#10B981',
    },
    growthText: {
      fontSize: '24px',
      fontWeight: '700',
    },
    chartContainer: {
      position: 'relative' as const,
      height: '256px',
    },
    yAxis: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      bottom: '32px',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#9CA3AF',
    },
    barsContainer: {
      marginLeft: '48px',
      height: '100%',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: '12px',
      paddingBottom: '32px',
    },
    barWrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    },
    bar: {
      width: '100%',
      borderRadius: '8px 8px 0 0',
      transition: 'all 0.2s',
      cursor: 'pointer',
      position: 'relative' as const,
    },
    barTooltip: {
      position: 'absolute' as const,
      top: '-40px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#111827',
      color: 'white',
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px',
      whiteSpace: 'nowrap' as const,
    },
    barLabel: {
      fontSize: '12px',
      color: '#6B7280',
      marginTop: '8px',
    },
    donutChart: {
      width: '128px',
      height: '128px',
      margin: '0 auto',
      position: 'relative' as const,
    },
    donutCenter: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center' as const,
    },
    donutValue: {
      fontSize: '24px',
      fontWeight: '700',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
    },
    legendLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    legendDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
    },
    legendText: {
      fontSize: '14px',
      color: '#6B7280',
    },
    legendValue: {
      fontSize: '14px',
      fontWeight: '600',
    },
    totalBox: {
      marginTop: '24px',
      padding: '16px',
      background: '#F9FAFB',
      borderRadius: '12px',
    },
    totalLabel: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '4px',
    },
    totalValue: {
      fontSize: '20px',
      fontWeight: '700',
    },
    ordersCard: {
      gridColumn: 'span 2',
    },
    ordersHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    updatesBadge: {
      fontSize: '11px',
      color: '#6B7280',
      background: '#F3F4F6',
      padding: '6px 12px',
      borderRadius: '8px',
    },
    viewAllButton: {
      fontSize: '14px',
      color: '#6B7280',
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
    },
    orderItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      paddingBottom: '16px',
      borderBottom: '1px solid #F3F4F6',
      marginBottom: '16px',
    },
    orderAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: '#E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
    },
    orderName: {
      flex: 1,
      fontWeight: '600',
      fontSize: '14px',
    },
    orderAmount: {
      fontWeight: '600',
      fontSize: '14px',
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: '500',
    },
    orderDate: {
      fontSize: '14px',
      color: '#6B7280',
    },
    saleItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
    },
    saleAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: '#111827',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
    },
    saleInfo: {
      flex: 1,
      minWidth: 0,
    },
    saleName: {
      fontWeight: '600',
      fontSize: '14px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    saleTime: {
      fontSize: '12px',
      color: '#6B7280',
    },
    saleAmount: {
      fontSize: '14px',
      fontWeight: '600',
    },
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: `4px solid ${SAFARITIX.primary}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: '#6B7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.balanceCard }}>
          <div style={styles.statHeader}>
            <DollarSign style={{ width: '16px', height: '16px', color: '#166534' }} />
            <span style={{ ...styles.statLabel, color: '#166534' }}>Balance</span>
            <span style={{ ...styles.statBadge, background: '#DCFCE7', color: '#166534' }}>+17%</span>
          </div>
          <div style={styles.statValue}>${balance.toLocaleString()}</div>
          <div style={styles.miniChart}>
            {[30, 50, 40, 60, 45, 70, 55, 65, 50, 75, 60, 80].map((height, i) => (
              <div key={i} style={{ ...styles.miniBar, height: `${height}%`, background: 'rgba(22,101,52,0.3)' }} />
            ))}
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.salesCard }}>
          <div style={styles.statHeader}>
            <CreditCard style={{ width: '16px', height: '16px', color: '#92400E' }} />
            <span style={{ ...styles.statLabel, color: '#92400E' }}>Sales</span>
            <span style={{ ...styles.statBadge, background: '#FEF3C7', color: '#92400E' }}>+23%</span>
          </div>
          <div style={styles.statValue}>${sales.toLocaleString()}</div>
          <div style={styles.miniChart}>
            {[50, 40, 60, 45, 70, 55, 65, 50, 75, 60, 80, 70].map((height, i) => (
              <div key={i} style={{ ...styles.miniBar, height: `${height}%`, background: 'rgba(146,64,14,0.3)' }} />
            ))}
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.upgradeCard }}>
          <h3 style={styles.upgradeTitle}>Upgrade</h3>
          <p style={styles.upgradeText}>Get more information and opportunities</p>
          <button style={styles.upgradeButton}>Go Pro</button>
        </div>
      </div>

      {/* Content Grid */}
      <div style={styles.contentGrid}>
        {/* Chart Card */}
        <div style={{ ...styles.card, ...styles.chartCard }}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>User in The Last Week</h2>
              <div style={styles.growthBadge}>
                <TrendingUp style={{ width: '16px', height: '16px' }} />
                <span style={styles.growthText}>+ 3,2%</span>
              </div>
            </div>
          </div>

          <div style={styles.chartContainer}>
            <div style={styles.yAxis}>
              <span>40 K</span>
              <span>30 K</span>
              <span>20 K</span>
              <span>10 K</span>
              <span>0 K</span>
            </div>

            <div style={styles.barsContainer}>
              {weekData.map((item, index) => {
                const height = (item.value / maxValue) * 100;
                const isActive = index === 1;

                return (
                  <div key={item.day} style={styles.barWrapper}>
                    <div style={{ width: '100%', position: 'relative' as const }}>
                      {isActive && (
                        <div style={styles.barTooltip}>
                          ${item.value.toLocaleString()}
                        </div>
                      )}
                      <div
                        style={{
                          ...styles.bar,
                          height: `${height}%`,
                          background: isActive ? '#111827' : '#E5E7EB',
                        }}
                        onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = '#D1D5DB')}
                        onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = '#E5E7EB')}
                      />
                    </div>
                    <span style={styles.barLabel}>{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Profits */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Monthly Profits</h2>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
              <MoreVertical style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Total Profit Growth of 26%</p>
            <div style={styles.donutChart}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#A5D6A7" strokeWidth="12" strokeDasharray="150.8 251.2" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#CE93D8" strokeWidth="12" strokeDasharray="60.3 341.7" strokeDashoffset="-150.8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#90CAF9" strokeWidth="12" strokeDasharray="40.2 361.8" strokeDashoffset="-211.1" />
              </svg>
              <div style={styles.donutCenter}>
                <div style={styles.donutValue}>60%</div>
              </div>
            </div>
          </div>

          <div>
            <div style={styles.legendItem}>
              <div style={styles.legendLabel}>
                <div style={{ ...styles.legendDot, background: '#A5D6A7' }} />
                <span style={styles.legendText}>Giveaway</span>
              </div>
              <span style={styles.legendValue}>60%</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendLabel}>
                <div style={{ ...styles.legendDot, background: '#CE93D8' }} />
                <span style={styles.legendText}>Affiliate</span>
              </div>
              <span style={styles.legendValue}>24%</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendLabel}>
                <div style={{ ...styles.legendDot, background: '#90CAF9' }} />
                <span style={styles.legendText}>Offline Sales</span>
              </div>
              <span style={styles.legendValue}>16%</span>
            </div>
          </div>

          <div style={styles.totalBox}>
            <div style={styles.totalLabel}>Total</div>
            <div style={styles.totalValue}>${totalProfit.toLocaleString()}</div>
          </div>
        </div>

        {/* Last Orders */}
        <div style={{ ...styles.card, ...styles.ordersCard }}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Last Orders</h2>
            <div style={styles.ordersHeader}>
              <span style={styles.updatesBadge}>Data Updates Every 3 Hours</span>
              <button style={styles.viewAllButton}>View All Orders</button>
            </div>
          </div>

          <div>
            {lastOrders.map((order) => (
              <div key={order.id} style={styles.orderItem}>
                <div style={styles.orderAvatar}>{order.customerAvatar}</div>
                <div style={styles.orderName}>{order.customerName}</div>
                <div style={styles.orderAmount}>${order.amount.toLocaleString()}</div>
                <span style={{
                  ...styles.statusBadge,
                  background: order.status === 'completed' ? '#F3F4F6' : '#DBEAFE',
                  color: order.status === 'completed' ? '#374151' : '#1E40AF',
                }}>
                  {order.status === 'completed' ? '● Completed' : '● Chargeback'}
                </span>
                <span style={styles.orderDate}>{order.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Recent Sales</h2>
            <button style={styles.viewAllButton}>See All</button>
          </div>

          <div>
            {recentSales.map((sale) => (
              <div key={sale.id} style={styles.saleItem}>
                <div style={styles.saleAvatar}>{sale.customerAvatar}</div>
                <div style={styles.saleInfo}>
                  <p style={styles.saleName}>{sale.customerName}</p>
                  <p style={styles.saleTime}>{sale.timestamp}</p>
                </div>
                <div style={styles.saleAmount}>+ ${sale.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
