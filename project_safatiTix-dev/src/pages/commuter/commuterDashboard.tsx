// pages/commuter/CommuterDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useTabStore } from '../../stores/tabStore';
import { useTicketsStore } from '../../stores/ticketsStore';
import { useSchedulesStore } from '../../stores/schedulesStore';
import { useNotificationsStore } from '../../stores/notificationsStore';
import { useTrackingStore } from '../../stores/trackingStore';
import { useStatsStore } from '../../stores/statsStore';
import DashboardLayout from './components/DashboardLayout';
import HomeTab from './components/HomeTab';
import TicketsTab from './components/TicketsTab';
import LiveMapTab from './components/LiveMapTab';
import ProfileTab from './components/ProfileTab';
import TicketModal from './components/TicketModal';

export default function CommuterDashboard() {
  const { user, logout } = useAuthStore();
  const { activeTab } = useTabStore();
  
  const { 
    upcomingTrips, 
    recentBookings, 
    fetchTickets,
    loading: ticketsLoading 
  } = useTicketsStore();
  
  const { 
    popularRoutes, 
    searchResults,
    search,
    loading: schedulesLoading,
    error: searchError,
    clearSearch
  } = useSchedulesStore();
  
  const { 
    notifications,
    unreadCount,
    fetchNotifications 
  } = useNotificationsStore();
  
  const { 
    stats, 
    fetchStats,
    loading: statsLoading 
  } = useStatsStore();
  
  const { 
    driverLocations, 
    fetchLocations,
    loading: mapLoading 
  } = useTrackingStore();
  
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedSeatsMap, setSelectedSeatsMap] = useState({});
  
  // Search state
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Map ref
  const mapContainer = useRef(null);

  // Initial data fetch
  useEffect(() => {
    fetchTickets();
    fetchStats();
    fetchNotifications();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!fromInput.trim() || !toInput.trim()) return;
    
    setSearchPerformed(true);
    await search(fromInput, toInput, dateInput || undefined);
  };

  const calcDuration = (dep?: string | Date, arr?: string | Date) => {
    if (!dep || !arr) return null;
    const diff = new Date(arr).getTime() - new Date(dep).getTime();
    if (isNaN(diff)) return null;
    const mins = Math.round(diff / 60000);
    return mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  };

  return (
    <DashboardLayout notificationCount={unreadCount}>
      {activeTab === 'home' && (
        <HomeTab
          upcomingTrips={upcomingTrips}
          popularRoutes={popularRoutes}
          stats={stats}
          loading={{ 
            upcoming: ticketsLoading, 
            popular: schedulesLoading, 
            stats: statsLoading 
          }}
          fromInput={fromInput}
          toInput={toInput}
          dateInput={dateInput}
          searchResults={searchResults}
          searchLoading={schedulesLoading}
          searchError={searchError}
          searchPerformed={searchPerformed}
          setFromInput={setFromInput}
          setToInput={setToInput}
          setDateInput={setDateInput}
          handleSearch={handleSearch}
          setSelectedTicket={setSelectedTicket}
          setShowTicketModal={setShowTicketModal}
          calcDuration={calcDuration}
        />
      )}
      
      {activeTab === 'tickets' && (
        <TicketsTab
          upcomingTrips={upcomingTrips}
          recentBookings={recentBookings}
          onViewTicket={(ticket) => {
            setSelectedTicket(ticket);
            setShowTicketModal(true);
          }}
          onBookNew={() => {
            useTabStore.getState().setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
      
      {activeTab === 'map' && (
        <LiveMapTab
          mapContainer={mapContainer}
        />
      )}
      
      {activeTab === 'profile' && (
        <ProfileTab />
      )}
      
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <button 
                onClick={() => useNotificationsStore.getState().markAllAsRead()}
                className="text-[#0077B6] font-semibold hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notif: any) => (
                <div 
                  key={notif.id} 
                  className={`p-4 border-b last:border-0 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                  onClick={() => useNotificationsStore.getState().markAsRead(notif.id)}
                >
                  <p className="font-medium">{notif.message}</p>
                  <p className="text-sm text-gray-500 mt-1">{notif.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showTicketModal && selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          selectedSeatsMap={selectedSeatsMap}
          setSelectedSeatsMap={setSelectedSeatsMap}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedSeatsMap({});
          }}
          onBookingComplete={() => {
            fetchTickets();
          }}
        />
      )}
    </DashboardLayout>
  );
}