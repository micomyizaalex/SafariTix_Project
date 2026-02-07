import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { API_URL, supabase } from '../utils/supabase-client';
import { publicAnonKey } from '../utils/supabase/info';
import { ThemeToggle } from './ThemeToggle';
import { PaymentModal } from './PaymentModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Bus, Ticket, MapPin, LogOut, Search, Calendar, Clock, ArrowRight, Users, Check, Settings } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
  const [companies, setCompanies] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [numTickets, setNumTickets] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [recentTicket, setRecentTicket] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    // fetchData can run on mount for public endpoints; protected endpoints are skipped if no accessToken
    fetchData();
    const interval = setInterval(fetchLocations, 5000);
    return () => clearInterval(interval);
  }, [accessToken]);

  // Auto-search with debouncing when from/to fields change
  useEffect(() => {
    if (!searchFrom || !searchTo) {
      setFilteredSchedules([]);
      return;
    }

    // Set a timer to debounce the search (wait 800ms after user stops typing)
    const searchTimer = setTimeout(() => {
      performSearch();
    }, 800);

    // Cleanup timer if component unmounts or search fields change again
    return () => clearTimeout(searchTimer);
  }, [searchFrom, searchTo]);

  /**
   * Search schedules using the new PostgreSQL-based backend endpoint
   * Uses parameterized SQL queries via /api/schedules/search-pg
   */
  async function performSearch() {
    if (!searchFrom || !searchTo) {
      setSearchError('Please enter both From and To');
      setFilteredSchedules([]);
      return;
    }

    setSearchError(null);
    setSearchLoading(true);
    
    try {
      // Call the new backend endpoint using pg Pool
      const response = await fetch(
        `${API_URL}/schedules/search-pg?from=${encodeURIComponent(searchFrom.trim())}&to=${encodeURIComponent(searchTo.trim())}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: Failed to search schedules`;
        console.error('Search API error:', errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle empty results
      if (!data.schedules || data.schedules.length === 0) {
        setFilteredSchedules([]);
        setSearchError('No schedules available for this route');
        return;
      }

      // Map the response to match the existing UI structure
      const mapped = data.schedules.map((s: any) => ({
        id: s.id,
        routeFrom: s.from_location,
        routeTo: s.to_location,
        departureTime: s.departure_time,
        scheduleDate: s.schedule_date, // Travel date from database
        seatsAvailable: s.available_seats,
        bookedSeats: s.booked_seats || 0,
        price: Number(s.price) || 0,
        companyName: s.company_name || 'N/A',
        companyId: s.company_id,
        busPlateNumber: s.bus_plate_number || 'N/A',
        driverName: s.driver_name || 'No driver assigned',
        status: 'scheduled'
      }));

      setFilteredSchedules(mapped);
      setSearchError(null);
    } catch (error: any) {
      console.error('Schedule search error:', error);
      // Show user-friendly error message
      const errorMessage = error.message || 'Unable to fetch schedules right now. Please try again.';
      setSearchError(errorMessage);
      setFilteredSchedules([]);
    } finally {
      setSearchLoading(false);
    }
  }

  async function searchSchedulesByRoute() {
    if (!searchFrom || !searchTo) {
      alert('Please enter both departure and destination cities');
      return;
    }
    performSearch();
  }

  async function fetchData() {
    try {
      const [schedulesRes, ticketsRes, locationsRes] = await Promise.all([
        fetch(`${API_URL}/schedules`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }).catch(() => null),
        (accessToken ? fetch(`${API_URL}/tickets`, { headers: { 'Authorization': `Bearer ${accessToken}` } }).catch(() => null) : Promise.resolve(null)),
        fetch(`${API_URL}/tracking`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }).catch(() => null)
      ]);

      if (schedulesRes && schedulesRes.ok) {
        const data = await schedulesRes.json();
        setSchedules(data.schedules);
      }

      if (ticketsRes && ticketsRes.ok) {
        const data = await ticketsRes.json();
        setTickets(data.tickets);
      }

      if (locationsRes && locationsRes.ok) {
        const data = await locationsRes.json();
        setLocations(data.locations);
      }

      // Mock drivers data
      setDrivers([
        { id: '1', name: 'John Mukiza' },
        { id: '2', name: 'Peter Uwase' },
        { id: '3', name: 'Grace Umutoni' },
        { id: '4', name: 'David Niyonzima' }
      ]);
    } catch (error) {
      // Commuter data fetch errors are handled silently
    } finally {
      setLoading(false);
    }
  }

  async function fetchLocations() {
    try {
      const res = await fetch(`${API_URL}/tracking`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations);
      }
    } catch (error) {
      // Network errors are expected if backend endpoint doesn't exist yet - handle silently
    }
  }

  async function handleCancelTicket(ticketId: string) {
    if (!confirm('Are you sure you want to cancel this ticket?')) return;

    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      // Ticket cancellation errors are handled silently
    }
  }

  async function handlePaymentSuccess() {
    // Payment and booking are now handled in PaymentModal
    // Just refresh data and reset state
    setShowPaymentModal(false);
    setSelectedSchedule(null);
    setNumTickets(1);
    await fetchData();
    
    // Switch to My Tickets tab to show the new ticket
    // Note: You may need to add tab switching logic if you have tab state
  }

  // Sort tickets by creation date (newest first) and limit to last 5 if not showing all
  const sortedTickets = [...tickets].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA; // Newest first
  });
  
  const displayedTickets = showAllTickets ? sortedTickets : sortedTickets.slice(0, 5);
  const hasMoreTickets = tickets.length > 5;

  // Get company, bus, and driver info for schedule
  const getScheduleDetails = (schedule: any) => {
    const company = companies.find(c => c.id === schedule.companyId);
    const bus = buses.find(b => b.id === schedule.busId);
    const driver = drivers.find(d => d.id === bus?.driverId);
    return { company, bus, driver };
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bus className="w-6 h-6 text-[#0077B6]" />
            <div>
              <h1 style={{ fontFamily: 'Montserrat, sans-serif' }}>SafariTix</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">My Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {tickets.filter(t => t.status !== 'cancelled').length}
              </div>
              <p className="text-xs text-muted-foreground">Active bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Available Trips</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {schedules.length}
              </div>
              <p className="text-xs text-muted-foreground">Ready to book</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Live Buses</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {locations.length}
              </div>
              <p className="text-xs text-muted-foreground">Tracking now</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="book" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="book">Book Ticket</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="track">Track Bus</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Search & Book</CardTitle>
                <CardDescription>Find and book your bus tickets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Input
                      placeholder="Departure city (e.g., Kigali)"
                      value={searchFrom}
                      onChange={(e) => setSearchFrom(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input
                      placeholder="Destination city (e.g., Musanze)"
                      value={searchTo}
                      onChange={(e) => setSearchTo(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
                
                {searchLoading && (searchFrom || searchTo) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin h-4 w-4 border-2 border-[#0077B6] border-t-transparent rounded-full"></div>
                    Searching for available schedules...
                  </div>
                )}

                {searchError && (
                  <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                    {searchError}
                  </div>
                )}

                {!searchFrom && !searchTo && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg text-center space-y-2">
                    <Bus className="w-12 h-12 mx-auto text-[#0077B6]" />
                    <h4 className="font-semibold text-[#0077B6]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Find Your Bus Journey
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Enter your departure city and destination above to search for available bus schedules with seats.
                      Results will appear automatically as you type.
                    </p>
                  </div>
                )}

                {(searchFrom || searchTo) && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Available Schedules ({filteredSchedules.length})
                    </h3>
                    
                    {filteredSchedules.length === 0 && !searchLoading ? (
                      <div className="text-center py-8 space-y-2">
                        <p className="text-muted-foreground">No schedules found with available seats</p>
                        {searchFrom && searchTo && (
                          <p className="text-sm text-muted-foreground">
                            Try searching for different dates or routes
                          </p>
                        )}
                      </div>
                    ) : (
                      filteredSchedules.map((schedule) => {
                        const isLowSeats = schedule.seatsAvailable <= 5 && schedule.seatsAvailable > 0;
                        const totalSeats = schedule.seatsAvailable + schedule.bookedSeats;
                        const seatPercentage = totalSeats > 0 ? (schedule.seatsAvailable / totalSeats) * 100 : 0;
                        
                        // Format travel date safely
                        const formatTravelDate = (dateStr: string | null | undefined) => {
                          if (!dateStr) return 'N/A';
                          try {
                            const date = new Date(dateStr);
                            if (isNaN(date.getTime())) return 'N/A';
                            return date.toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            });
                          } catch {
                            return 'N/A';
                          }
                        };
                        
                        // Format departure time safely
                        const formatDepartureTime = (timeStr: string | null | undefined) => {
                          if (!timeStr) return 'N/A';
                          try {
                            const date = new Date(timeStr);
                            if (isNaN(date.getTime())) return 'N/A';
                            return date.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              hour12: true 
                            });
                          } catch {
                            return 'N/A';
                          }
                        };
                        
                        return (
                          <Card key={schedule.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-[#0077B6]">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                <div className="flex-1 space-y-3 w-full">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Transport Company</p>
                                      <p className="font-semibold text-lg">{schedule.companyName}</p>
                                    </div>
                                    <Badge className={isLowSeats ? "bg-orange-500 text-white" : "bg-[#0077B6] text-white"}>
                                      {isLowSeats && "⚠️ "}{schedule.seatsAvailable} seat{schedule.seatsAvailable !== 1 ? 's' : ''} left
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Bus Plate Number</p>
                                      <p className="font-semibold font-mono text-base">
                                        {schedule.busPlateNumber && schedule.busPlateNumber !== 'N/A' 
                                          ? schedule.busPlateNumber 
                                          : 'Not assigned'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Driver Assigned</p>
                                      <p className="font-semibold flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {schedule.driverName && schedule.driverName !== 'No driver assigned'
                                          ? schedule.driverName
                                          : <span className="text-muted-foreground italic">No driver assigned</span>}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Available Seats</p>
                                      <p className={`font-semibold ${isLowSeats ? 'text-orange-600' : 'text-green-600'}`}>
                                        {schedule.seatsAvailable} / {totalSeats} seats
                                      </p>
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                                        <div 
                                          className={`h-2 rounded-full transition-all ${
                                            seatPercentage > 50 ? 'bg-green-500' : 
                                            seatPercentage > 20 ? 'bg-orange-500' : 
                                            'bg-red-500'
                                          }`}
                                          style={{ width: `${seatPercentage}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Booked Seats</p>
                                      <p className="font-semibold text-muted-foreground">
                                        {schedule.bookedSeats} seats
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Route</p>
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold">{schedule.routeFrom}</span>
                                        <ArrowRight className="w-4 h-4 text-[#0077B6]" />
                                        <span className="font-semibold">{schedule.routeTo}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Departure Time</p>
                                      <p className="font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#0077B6]" />
                                        {formatDepartureTime(schedule.departureTime)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Travel Date</p>
                                      <p className="font-semibold flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#0077B6]" />
                                        {formatTravelDate(schedule.scheduleDate || schedule.departureTime)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right space-y-3 min-w-[200px]">
                                  <div className="bg-[#0077B6]/10 dark:bg-[#0077B6]/20 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Ticket Price</p>
                                    <p className="text-3xl font-bold text-[#0077B6]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                      RWF {schedule.price.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">per person</p>
                                  </div>
                                  
                                  {selectedSchedule?.id === schedule.id ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Label className="text-sm">Tickets:</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max={schedule.seatsAvailable}
                                          value={numTickets}
                                          onChange={(e) => setNumTickets(Math.max(1, Math.min(schedule.seatsAvailable, parseInt(e.target.value) || 1)))}
                                          className="w-20"
                                        />
                                      </div>
                                      <div className="bg-gradient-to-r from-[#27AE60]/10 to-[#27AE60]/5 border-2 border-[#27AE60] p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">💰 Total Amount to Pay</p>
                                        <p className="text-2xl font-bold text-[#27AE60]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                          RWF {(schedule.price * numTickets).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {numTickets} ticket{numTickets > 1 ? 's' : ''} × RWF {schedule.price.toLocaleString()}
                                        </p>
                                      </div>
                                      <Button
                                        className="w-full bg-[#27AE60] hover:bg-[#1e8c4d]"
                                        onClick={() => setShowPaymentModal(true)}
                                      >
                                        <Ticket className="w-4 h-4 mr-2" />
                                        Book Bus
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      className="w-full"
                                      onClick={() => navigate(`/schedules/${schedule.id}`)}
                                    >
                                      <Ticket className="w-4 h-4 mr-2" />
                                      Select Seat
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>My Tickets</CardTitle>
                <CardDescription>View and manage your bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {tickets.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No tickets booked yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Departure</TableHead>
                        <TableHead>Seat</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Ticket Status</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">{ticket.routeFrom}</span>
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              <span className="font-semibold">{ticket.routeTo}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {ticket.departureTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  {new Date(ticket.departureTime).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit', 
                                    hour12: true 
                                  })}
                                </div>
                              )}
                              {ticket.scheduleDate && (
                                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(ticket.scheduleDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>Seat {ticket.seatNumber}</TableCell>
                          <TableCell>RWF {ticket.price?.toLocaleString() || '0'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {ticket.paymentMethod === 'mobile_money' ? 'MTN MoMo' :
                               ticket.paymentMethod === 'airtel_money' ? 'Airtel Money' :
                               ticket.paymentMethod === 'card_payment' ? 'Card' :
                               ticket.paymentMethod || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                ticket.paymentStatus === 'SUCCESS' ? 'bg-[#27AE60] text-white' :
                                ticket.paymentStatus === 'PENDING' ? 'bg-orange-500 text-white' :
                                'bg-red-500 text-white'
                              }
                            >
                              {ticket.paymentStatus || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                ticket.status === 'booked' ? 'default' :
                                ticket.status === 'checked_in' ? 'default' :
                                ticket.status === 'cancelled' ? 'secondary' :
                                'outline'
                              }
                              className={
                                ticket.status === 'booked' ? 'bg-[#0077B6] text-white' :
                                ticket.status === 'checked_in' ? 'bg-[#27AE60] text-white' :
                                ''
                              }
                            >
                              {ticket.status || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRecentTicket(ticket)}
                            >
                              View
                            </Button>
                          </TableCell>
                          <TableCell className="space-x-2">
                            {ticket.status !== 'cancelled' && !ticket.scanned && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelTicket(ticket.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {hasMoreTickets && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center">
                            {showAllTickets ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAllTickets(false)}
                              >
                                See Less
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAllTickets(true)}
                              >
                                See More
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="track">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Live Bus Tracking</CardTitle>
                <CardDescription>Real-time locations of buses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {locations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No buses tracking at the moment</p>
                  ) : (
                    locations.map((loc) => (
                      <div key={loc.busId} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-[#0077B6] mt-0.5" />
                          <div className="flex-1">
                            <p>Bus ID: {loc.busId.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Latitude: {loc.lat.toFixed(6)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Longitude: {loc.lng.toFixed(6)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last updated: {new Date(loc.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Account Settings</CardTitle>
                <CardDescription>Manage your profile, security, and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <CommuterSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
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
          title="Complete Your Booking"
          description={`Pay for ${numTickets} ticket${numTickets > 1 ? 's' : ''}`}
          busDetails={{
            route: `${selectedSchedule.routeFrom} → ${selectedSchedule.routeTo}`,
            date: selectedSchedule.scheduleDate 
              ? new Date(selectedSchedule.scheduleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
              : selectedSchedule.departureTime 
                ? new Date(selectedSchedule.departureTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : 'N/A',
            time: selectedSchedule.departureTime 
              ? new Date(selectedSchedule.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
              : 'N/A',
            company: selectedSchedule.companyName || 'N/A'
          }}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardContent className="text-center py-12">
              <div className="bg-[#27AE60] text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Booked Successfully!
              </h2>
              <p className="text-muted-foreground mb-2">
                Your {numTickets} ticket{numTickets > 1 ? 's have' : ' has'} been booked.
              </p>
              <p className="text-sm text-muted-foreground">
                Check "My Tickets" tab for your QR codes.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ticket View Modal */}
      {recentTicket && !showSuccessModal && (
        <TicketDisplay ticket={recentTicket} onClose={() => setRecentTicket(null)} />
      )}
    </div>
  );
}