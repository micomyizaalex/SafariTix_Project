import React, { useState, useEffect } from 'react';
import {
  Home,
  Ticket,
  MapPin,
  User,
  Bell,
  Search,
  Calendar,
  Clock,
  Bus,
  ArrowRight,
  QrCode,
  CreditCard,
  History,
  Star,
  Settings,
  LogOut,
  X,
  Check,
  AlertCircle,
  ChevronRight,
  Navigation,
  Download,
  Share2,
  Menu,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import SeatMap from '../../components/SeatMap';

export default function CommuterDashboard() {
  const { user, signOut, accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [selectedSeatsMap, setSelectedSeatsMap] = useState<Record<string, boolean>>({});
  const [locking, setLocking] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadSeats = async () => {
      if (!showTicketModal || !selectedTicket) return;
      // don't try to load if this is an existing confirmed ticket
      if (selectedTicket.seat || selectedTicket.qrCode) return;
      setSeatsLoading(true);
      setSeats([]);
      setSelectedSeatsMap({});
      try {
        const hdrs: Record<string,string> = { 'Content-Type': 'application/json' };
        if (accessToken) hdrs['Authorization'] = `Bearer ${accessToken}`;
        const res = await fetch(`/api/seats/schedules/${selectedTicket.id}`, { headers: hdrs });
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          setSeats(Array.isArray(json.seats) ? json.seats : []);
        } else {
          setSeats([]);
        }
      } catch (err) {
        console.error('Failed to load seats', err);
        setSeats([]);
      } finally {
        if (mounted) setSeatsLoading(false);
      }
    };

    loadSeats();
    return () => { mounted = false; };
  }, [showTicketModal, selectedTicket, accessToken]);
  // Data from backend (replaces previous mock data)
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<any[]>([]);

  const [stats, setStats] = useState({ totalTrips: 0, activeTickets: 0, favoriteRoutes: 0, rewardsPoints: 0 });
  const [loading, setLoading] = useState({ upcoming: true, popular: true, stats: true, recent: true, notifs: true });

  // Search state
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const hdrs: Record<string,string> = { 'Content-Type': 'application/json' };
    if (accessToken) hdrs['Authorization'] = `Bearer ${accessToken}`;

    const fetchUpcoming = async () => {
      try {
        const res = await fetch('/api/commuter/upcoming', { headers: hdrs });
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          setUpcomingTrips(Array.isArray(json) ? json : json.upcoming || []);
        } else {
          setUpcomingTrips([]);
        }
      } catch (e) {
        setUpcomingTrips([]);
      } finally {
        if (mounted) setLoading((s) => ({ ...s, upcoming: false }));
      }
    };

    const fetchPopular = async () => {
      try {
        const res = await fetch('/api/commuter/popular-routes', { headers: hdrs });
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          setPopularRoutes(Array.isArray(json) ? json : json.routes || []);
        } else {
          setPopularRoutes([]);
        }
      } catch (e) {
        setPopularRoutes([]);
      } finally {
        if (mounted) setLoading((s) => ({ ...s, popular: false }));
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/commuter/summary', { headers: hdrs });
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          setStats({
            totalTrips: json.totalTrips ?? json.total_trips ?? 0,
            activeTickets: json.activeTickets ?? json.active_tickets ?? 0,
            favoriteRoutes: json.favoriteRoutes ?? json.favorite_routes ?? 0,
            rewardsPoints: json.rewardsPoints ?? json.rewards_points ?? 0,
          });
        }
      } catch (e) {
        // keep defaults
      } finally {
        if (mounted) setLoading((s) => ({ ...s, stats: false }));
      }
    };

    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/commuter/recent-bookings', { headers: hdrs });
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          setRecentBookings(Array.isArray(json) ? json : json.bookings || []);
        } else {
          setRecentBookings([]);
        }
      } catch (e) {
        setRecentBookings([]);
      } finally {
        if (mounted) setLoading((s) => ({ ...s, recent: false }));
      }
    };

    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications', { headers: hdrs });
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          setNotifications(Array.isArray(json) ? json : json.notifications || []);
        } else {
          setNotifications([]);
        }
      } catch (e) {
        setNotifications([]);
      } finally {
        if (mounted) setLoading((s) => ({ ...s, notifs: false }));
      }
    };

    fetchUpcoming();
    fetchPopular();
    fetchStats();
    fetchRecent();
    fetchNotifs();

    return () => { mounted = false; };
  }, [accessToken]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError(null);
    const from = fromInput.trim();
    const to = toInput.trim();
    if (!from || !to) return setSearchError('Enter both departure and arrival cities');

    setSearchPerformed(true);

    setSearchLoading(true);
    try {
      const hdrs: Record<string,string> = { 'Content-Type': 'application/json' };
      if (accessToken) hdrs['Authorization'] = `Bearer ${accessToken}`;
      const qs = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const res = await fetch(`/api/schedules/search${qs}`, { headers: hdrs });
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (!res.ok) {
        // Try fallback PG endpoint
        console.warn('Primary schedules search failed, trying fallback /api/schedules/search-pg', res.status);
        const alt = await fetch(`/api/schedules/search-pg${qs}`, { headers: hdrs });
        const altCt = (alt.headers.get('content-type') || '').toLowerCase();
        if (alt.ok && altCt.includes('application/json')) {
          const jsonAlt = await alt.json();
          const list = Array.isArray(jsonAlt) ? jsonAlt : (jsonAlt.schedules || jsonAlt.schedules || jsonAlt);
          setSearchResults(list || []);
        } else if (alt.ok) {
          const text = await alt.text();
          console.error('Fallback /search-pg returned non-JSON:', text);
          setSearchResults([]);
          setSearchError('Failed to search schedules');
        } else {
          setSearchResults([]);
          setSearchError('Failed to search schedules');
        }
      } else if (!contentType.includes('application/json')) {
        const txt = await res.text();
        console.error('Primary /search returned non-JSON response:', txt);
        // Try fallback
        const alt = await fetch(`/api/schedules/search-pg${qs}`, { headers: hdrs });
        const altCt = (alt.headers.get('content-type') || '').toLowerCase();
        if (alt.ok && altCt.includes('application/json')) {
          const jsonAlt = await alt.json();
          setSearchResults(Array.isArray(jsonAlt) ? jsonAlt : jsonAlt.schedules || []);
        } else {
          setSearchResults([]);
          setSearchError('Failed to search schedules');
        }
      } else {
        const json = await res.json();
        setSearchResults(Array.isArray(json) ? json : json.schedules || []);
      }
    } catch (err) {
      console.error('Search schedules error:', err);
      setSearchResults([]);
      setSearchError('Failed to search schedules');
    } finally {
      setSearchLoading(false);
    }
  };

  const formatCurrency = (n?: number) => `RWF ${Number(n || 0).toLocaleString()}`;

  const calcDuration = (dep?: string | Date, arr?: string | Date) => {
    if (!dep || !arr) return null;
    const d = new Date(dep);
    const a = new Date(arr);
    if (isNaN(d.getTime()) || isNaN(a.getTime())) return null;
    const diff = Math.max(0, a.getTime() - d.getTime());
    const mins = Math.round(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`;
  };

  const renderHome = () => (
    <div className="space-y-6">
      {/* Hero Section - Next Trip */}
      {upcomingTrips.length > 0 && (
        <div className="bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold">
                Your Next Trip
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  {upcomingTrips[0].from} → {upcomingTrips[0].to}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      Date
                    </div>
                    <div className="font-bold text-lg">
                      {new Date(upcomingTrips[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      Time
                    </div>
                    <div className="font-bold text-lg">{upcomingTrips[0].time}</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                      <Bus className="w-4 h-4" />
                      Seat
                    </div>
                    <div className="font-bold text-lg">{upcomingTrips[0].seat}</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                      <CreditCard className="w-4 h-4" />
                      Price
                    </div>
                    <div className="font-bold text-lg">RWF {upcomingTrips[0].price.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex lg:flex-col gap-3">
                <button
                  onClick={() => {
                    setSelectedTicket(upcomingTrips[0]);
                    setShowTicketModal(true);
                  }}
                  className="flex-1 lg:flex-initial bg-white text-[#0077B6] px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  View Ticket
                </button>
                <button className="flex-1 lg:flex-initial bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Track Bus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Search */}
      <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0077B6]/10 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-[#0077B6]" />
          </div>
          Find Your Next Trip
        </h3>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Departure city"
                  value={fromInput}
                  onChange={(e) => setFromInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#0077B6] focus:outline-none transition-all text-gray-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Arrival city"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#0077B6] focus:outline-none transition-all text-gray-900 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-2">
            <button
              type="submit"
              className="w-full md:w-1/2 lg:w-1/3 bg-[#0077B6] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#005F8E] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Search Buses
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        {searchError && (
          <div className="mt-3 flex items-center gap-3">
            <div className="text-sm text-red-600">{searchError}</div>
            <button onClick={() => handleSearch()} className="text-sm px-3 py-1 bg-[#0077B6] text-white rounded">Try again</button>
          </div>
        )}

        {searchLoading && <div className="mt-3 text-sm text-gray-600">Searching for schedules...</div>}

        {searchLoading && <div className="mt-4 text-sm text-gray-600">Searching...</div>}

        {!searchLoading && searchPerformed && searchResults.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">No schedules available for this route at the moment.</div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 grid gap-3">
            {searchResults.map((s: any) => {
              const duration = calcDuration(s.departureTime || s.departure_time, s.arrivalTime || s.arrival_time);
              const from = s.routeFrom || s.from_location || s.from || s.from_location;
              const to = s.routeTo || s.to_location || s.to || s.to_location;
              const seats = s.seatsAvailable ?? s.available_seats ?? s.availableSeats ?? 0;
              const price = s.price ?? s.fare ?? s.price_per_seat ?? 0;
              return (
                <div key={s.id || `${from}-${to}-${s.departureTime}`} className="bg-white rounded-xl p-4 border shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{from} → {to}</div>
                    <div className="text-sm text-gray-500">{duration ? `${duration} • ${new Date(s.departureTime || s.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : (s.departureTime || s.departure_time)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#0077B6]">{formatCurrency(price)}</div>
                    <div className="text-sm text-gray-500">{seats} seats</div>
                    <div className="mt-2">
                      <button onClick={() => { setSelectedTicket(s); setShowTicketModal(true); }} className="bg-[#0077B6] text-white px-3 py-1 rounded">Book</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Popular Routes */}
      <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0077B6]/10 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-[#0077B6]" />
            </div>
            Popular Routes
          </h3>
          <button className="text-[#0077B6] font-semibold hover:underline">View All</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularRoutes.map((route, index) => (
            <div
              key={index}
              className="group border-2 border-gray-100 rounded-xl p-5 hover:border-[#0077B6] hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0077B6]/10 rounded-xl flex items-center justify-center group-hover:bg-[#0077B6] transition-all duration-300">
                    <Bus className="w-6 h-6 text-[#0077B6] group-hover:text-white transition-all duration-300" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-900">
                      {route.from} → {route.to}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {route.duration}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#0077B6] transition-all duration-300" />
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Starting from</div>
                  <div className="text-xl font-bold text-[#0077B6]">
                    RWF {route.price.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Available</div>
                  <div className="text-lg font-bold text-gray-900">{route.available} seats</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="text-blue-600 text-sm font-semibold mb-2">Total Trips</div>
          <div className="text-3xl font-bold text-blue-900">{loading.stats ? '—' : Number(stats.totalTrips || 0).toLocaleString()}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="text-green-600 text-sm font-semibold mb-2">Active Tickets</div>
          <div className="text-3xl font-bold text-green-900">{loading.stats ? '—' : Number(stats.activeTickets ?? upcomingTrips.length).toLocaleString()}</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="text-purple-600 text-sm font-semibold mb-2">Favorite Routes</div>
          <div className="text-3xl font-bold text-purple-900">{loading.stats ? '—' : Number(stats.favoriteRoutes || 0).toLocaleString()}</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
          <div className="text-orange-600 text-sm font-semibold mb-2">Rewards Points</div>
          <div className="text-3xl font-bold text-orange-900">{loading.stats ? '—' : Number(stats.rewardsPoints || 0).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">My Tickets</h2>
        <button className="bg-[#0077B6] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#005F8E] transition-all duration-300 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Book New Ticket
        </button>
      </div>

      {/* Upcoming Tickets */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Ticket className="w-6 h-6 text-[#0077B6]" />
          Upcoming Trips
        </h3>
        
        <div className="space-y-4">
          {upcomingTrips.map((trip) => (
            <div
              key={trip.id}
              className="border-2 border-gray-100 rounded-xl p-6 hover:border-[#0077B6] hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => {
                setSelectedTicket(trip);
                setShowTicketModal(true);
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#0077B6]/10 rounded-xl flex items-center justify-center">
                      <Bus className="w-6 h-6 text-[#0077B6]" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {trip.from} → {trip.to}
                      </div>
                      <div className="text-sm text-gray-500">Bus #{trip.bus}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Date</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Time</div>
                      <div className="font-semibold text-gray-900">{trip.time}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Seat</div>
                      <div className="font-semibold text-gray-900">#{trip.seat}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Price</div>
                      <div className="font-semibold text-[#0077B6]">
                        RWF {trip.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex lg:flex-col gap-2">
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold text-sm">
                    <Check className="w-4 h-4" />
                    Confirmed
                  </span>
                  <button className="bg-[#0077B6]/10 text-[#0077B6] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0077B6] hover:text-white transition-all duration-300 flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    View QR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-6 h-6 text-[#0077B6]" />
          Recent Bookings
        </h3>
        
        <div className="space-y-3">
          {recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Bus className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{booking.route}</div>
                  <div className="text-sm text-gray-500">{booking.date}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-gray-900">RWF {booking.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500 capitalize">{booking.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Profile Settings</h2>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
            <User className="w-12 h-12" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h3 className="text-2xl font-bold mb-2">{user?.name || 'John Doe'}</h3>
            <p className="text-white/80 mb-1">{user?.email || 'john.doe@example.com'}</p>
            <p className="text-white/80">+250 788 123 456</p>
          </div>
          <button className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#0077B6]" />
            Account Settings
          </h3>
          
          <div className="space-y-3">
            {[
              { label: 'Personal Information', icon: User },
              { label: 'Payment Methods', icon: CreditCard },
              { label: 'Notifications', icon: Bell },
              { label: 'Privacy & Security', icon: Settings },
            ].map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#0077B6] hover:shadow-md transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0077B6]/10 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#0077B6]" />
                  </div>
                  <span className="font-semibold text-gray-900">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-[#0077B6]" />
            Rewards & Benefits
          </h3>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 mb-4 border border-yellow-200">
            <div className="text-yellow-700 text-sm font-semibold mb-2">Total Points</div>
            <div className="text-4xl font-bold text-yellow-900 mb-2">1,250</div>
            <div className="text-sm text-yellow-600">Redeem for discounts and free trips!</div>
          </div>
          
          <button className="w-full bg-[#0077B6] text-white py-3 rounded-xl font-semibold hover:bg-[#005F8E] transition-all duration-300">
            View Rewards Catalog
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 transition-all duration-300 border-2 border-red-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
        <button className="text-[#0077B6] font-semibold hover:underline">Mark all as read</button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#0077B6] hover:shadow-md transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                notif.type === 'info' ? 'bg-blue-100' :
                notif.type === 'success' ? 'bg-green-100' :
                'bg-yellow-100'
              }`}>
                {notif.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
                {notif.type === 'success' && <Check className="w-5 h-5 text-green-600" />}
                {notif.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
              </div>
              
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">{notif.message}</p>
                <p className="text-sm text-gray-500">{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#0077B6] to-[#005F8E] bg-clip-text text-transparent">
                SafariTix
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'tickets', label: 'My Tickets', icon: Ticket },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'profile', label: 'Profile', icon: User },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-[#0077B6] text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.id === 'notifications' && (
                    <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                      {notifications.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'tickets', label: 'My Tickets', icon: Ticket },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'profile', label: 'Profile', icon: User },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-[#0077B6] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'tickets' && renderTickets()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'notifications' && renderNotifications()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 safe-bottom z-50">
        <div className="flex items-center justify-around">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'tickets', icon: Ticket, label: 'Tickets' },
            { id: 'notifications', icon: Bell, label: 'Alerts', badge: notifications.length },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 relative ${
                activeTab === item.id
                  ? 'text-[#0077B6]'
                  : 'text-gray-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Ticket Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-scale-in">
            <button
              onClick={() => setShowTicketModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-300"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* If selectedTicket already has a confirmed seat/qrCode (existing ticket), show ticket details. Otherwise show seat map for booking */}
            {(selectedTicket.qrCode || selectedTicket.seat) ? (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Ticket</h3>
                  <p className="text-gray-600">{selectedTicket.from} → {selectedTicket.to}</p>
                </div>

                <div className="bg-gradient-to-br from-[#0077B6]/10 to-[#005F8E]/10 rounded-2xl p-8 mb-6 border-2 border-dashed border-[#0077B6]/30">
                  <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-[#0077B6]" />
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-4 font-mono">{selectedTicket.qrCode}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Date</span>
                    <span className="font-bold text-gray-900">{new Date(selectedTicket.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Time</span>
                    <span className="font-bold text-gray-900">{selectedTicket.time}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Seat</span>
                    <span className="font-bold text-gray-900">#{selectedTicket.seat}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Bus</span>
                    <span className="font-bold text-gray-900">{selectedTicket.bus}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 bg-[#0077B6] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#005F8E] transition-all duration-300">
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Select Seat</h3>
                  <p className="text-sm text-gray-600">{selectedTicket.from} → {selectedTicket.to}</p>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-3 justify-center flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-white border border-gray-300"></div>
                      <div className="text-sm text-gray-600">Available</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-[#0077B6]"></div>
                      <div className="text-sm text-gray-600">Selected</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-gray-300"></div>
                      <div className="text-sm text-gray-600">Occupied</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-yellow-100 border border-yellow-300"></div>
                      <div className="text-sm text-gray-600">Locked</div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <SeatMap scheduleId={selectedTicket.id} price={selectedTicket.price || 0} selectedSeatsMap={selectedSeatsMap} setSelectedSeatsMap={setSelectedSeatsMap} accessToken={accessToken} />
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Selected seat(s): <span className="font-semibold text-gray-900">{Object.keys(selectedSeatsMap).filter(k=>selectedSeatsMap[k]).join(', ') || 'None'}</span></div>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        const picks = Object.keys(selectedSeatsMap).filter(k=>selectedSeatsMap[k]);
                        if (picks.length === 0) {
                          setLockError('Select at least one seat');
                          return;
                        }
                        setLockError(null);
                        setLocking(true);
                        try {
                          const hdrs: Record<string,string> = { 'Content-Type': 'application/json' };
                          if (accessToken) hdrs['Authorization'] = `Bearer ${accessToken}`;
                          // lock each seat sequentially
                          const results = [];
                          for (const seatNum of picks) {
                            const body = { seat_number: seatNum, passenger_id: user?.id, price: selectedTicket.price || 0 };
                            const res = await fetch(`/api/seats/schedules/${selectedTicket.id}/lock`, { method: 'POST', headers: hdrs, body: JSON.stringify(body) });
                            if (!res.ok) {
                              const txt = await res.text();
                              throw new Error(txt || 'Failed to lock seat');
                            }
                            const json = await res.json();
                            results.push(json);
                          }
                          // success - close modal and refresh available seats / show confirmation
                          setShowTicketModal(false);
                          // optional: refresh lists
                        } catch (err: any) {
                          console.error('Lock error', err);
                          setLockError(err.message || 'Failed to lock seats');
                        } finally {
                          setLocking(false);
                        }
                      }}
                      className="bg-[#0077B6] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#005F8E] transition-all duration-200"
                      disabled={locking}
                    >
                      {locking ? 'Booking…' : 'Confirm Booking'}
                    </button>
                    <button onClick={() => { setSelectedSeatsMap({}); setShowTicketModal(false); }} className="bg-gray-100 text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200">
                      Cancel
                    </button>
                  </div>
                  {lockError && <div className="text-sm text-red-600 mt-2">{lockError}</div>}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .safe-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}