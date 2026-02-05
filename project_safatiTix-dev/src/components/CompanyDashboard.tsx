import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/supabase-client';
import { ThemeToggle } from './ThemeToggle';
import { PaymentModal } from './PaymentModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Bus, Ticket, Calendar, DollarSign, Users, Plus, LogOut, AlertCircle, CheckCircle, UserPlus, Download, XCircle, Settings } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const SUBSCRIPTION_FEE = 50000; // RWF 50,000 monthly subscription

interface CompanyDashboardProps {
  onSettings?: () => void;
}

export function CompanyDashboard({ onSettings }: CompanyDashboardProps) {
  const { user, accessToken, signOut } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [buses, setBuses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBus, setShowAddBus] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showEditDriver, setShowEditDriver] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState('');
  const [editDriverName, setEditDriverName] = useState('');
  const [editDriverLicense, setEditDriverLicense] = useState('');
  const [editDriverPhone, setEditDriverPhone] = useState('');
  const [showAssignDriver, setShowAssignDriver] = useState(false);
  const [showEditBus, setShowEditBus] = useState(false);
  const [editingBusId, setEditingBusId] = useState('');
  const [editPlateNumber, setEditPlateNumber] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editSeatLayout, setEditSeatLayout] = useState('30');
  const [editModel, setEditModel] = useState('');
  const [showSubscriptionPayment, setShowSubscriptionPayment] = useState(false);
  const [subscriptionPaid, setSubscriptionPaid] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);

  // Driver form
  const [driverName, setDriverName] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  // Add bus form
  const [plateNumber, setPlateNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [seatLayout, setSeatLayout] = useState('30');
  const [model, setModel] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Assign driver dialog
  const [assignBusId, setAssignBusId] = useState('');
  const [assignDriverId, setAssignDriverId] = useState('');

  // Add schedule form
  const [selectedBus, setSelectedBus] = useState('');
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [price, setPrice] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleDriver, setScheduleDriver] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    fetchData();
  }, [accessToken]);

  async function fetchData() {
    try {
      const [companyRes, busesRes, schedulesRes, ticketsRes, driversRes] = await Promise.all([
        fetch(`${API_URL}/company`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${API_URL}/company/buses`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${API_URL}/company/schedules`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${API_URL}/company/tickets`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${API_URL}/company/drivers`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ]);

      if (companyRes.ok) {
        const data = await companyRes.json();
        setCompany(data.company);
        setSubscriptionPaid(data.company?.subscriptionPaid || false);
      }

      if (busesRes.ok) {
        const data = await busesRes.json();
        setBuses(data.buses);
      }

      if (schedulesRes.ok) {
        const data = await schedulesRes.json();
        setSchedules(data.schedules);
      }

      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        setTickets(data.tickets);
      }

      if (driversRes.ok) {
        const data = await driversRes.json();
        setDrivers(data.drivers);
      }
    } catch (error) {
      // Network errors are expected if backend isn't fully configured - handle silently
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBus(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/company/buses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plateNumber,
          capacity: parseInt(capacity),
          model,
          seatLayout,
          driverId: selectedDriver || null
        })
      });

      if (res.ok) {
        setShowAddBus(false);
        setPlateNumber('');
        setCapacity('');
        setModel('');
        setSelectedDriver('');
        await fetchData();
      } else {
        // Show backend error if available
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || data?.message || 'Unable to add bus. Please ensure the backend is properly configured.';
        alert(msg);
      }
    } catch (error) {
      // Network errors are expected if backend endpoint doesn't exist yet - handle gracefully
      alert(error?.message || 'Unable to connect to server. Please check your connection or try again later.');
    }
  }

  async function handleAssignDriver(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/company/buses/${assignBusId}/assign-driver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ driverId: assignDriverId || null })
      });

      if (res.ok) {
        setShowAssignDriver(false);
        setAssignBusId('');
        setAssignDriverId('');
        await fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || 'Unable to assign driver. Please ensure the backend is properly configured.';
        alert(msg);
      }
    } catch (error) {
      alert(error?.message || 'Unable to connect to server. Please check your connection or try again later.');
    }
  }

  async function handleEditBus(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBusId) return;
    try {
      const res = await fetch(`${API_URL}/company/buses/${editingBusId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plateNumber: editPlateNumber,
          capacity: parseInt(editCapacity),
          model: editModel,
          seatLayout: editSeatLayout
        })
      });

      if (res.ok) {
        setShowEditBus(false);
        setEditingBusId('');
        await fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Unable to update bus');
      }
    } catch (error) {
      alert(error?.message || 'Unable to connect to server');
    }
  }

  async function handleDeleteBus(id: string) {
    if (!confirm('Are you sure you want to delete/deactivate this bus? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/company/buses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (res.ok) {
        await fetchData();
        alert('Bus deactivated');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Unable to delete bus');
      }
    } catch (error) {
      alert('Unable to connect to server');
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'INACTIVE' : 'ACTIVE';
    if (!confirm(`Change status to ${newStatus}?`)) return;
    try {
      const res = await fetch(`${API_URL}/company/buses/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Unable to change status');
      }
    } catch (error) {
      alert('Unable to connect to server');
    }
  }

  async function handleAddSchedule(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/company/schedules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          busId: selectedBus,
          routeFrom,
          routeTo,
          departureTime,
          arrivalTime,
          price: parseFloat(price),
          date: scheduleDate,
          driverId: scheduleDriver || null
        })
      });

      if (res.ok) {
        setShowAddSchedule(false);
        setSelectedBus('');
        setRouteFrom('');
        setRouteTo('');
        setDepartureTime('');
        setArrivalTime('');
        setPrice('');
        setScheduleDate('');
        setScheduleDriver('');
        await fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Unable to add schedule. Please ensure the backend is properly configured.';
        alert(errorMessage);
      }
    } catch (error) {
      alert('Unable to connect to server. Please check your connection or try again later.');
    }
  }

  async function handleSubscriptionPayment() {
    // Mark subscription as paid (in production, this would update the backend)
    setSubscriptionPaid(true);
    setShowSubscriptionPayment(false);
    
    // Update company with subscription payment
    try {
      await fetch(`${API_URL}/admin/companies/${company.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscriptionStatus: 'pending_approval'
        })
      });
    } catch (error) {
      // Subscription update errors are handled silently
    }
  }

  async function handleAddDriver(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/company/drivers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: driverName,
          license: driverLicense,
          phone: driverPhone
        })
      });

      if (res.ok) {
        setShowAddDriver(false);
        setDriverName('');
        setDriverLicense('');
        setDriverPhone('');
        await fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Unable to add driver. Please ensure the backend is properly configured.';
        alert(errorMessage);
      }
    } catch (error) {
      alert('Unable to connect to server. Please check your connection or try again later.');
    }
  }

  async function handleEditDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!editingDriverId) return;
    try {
      const res = await fetch(`${API_URL}/company/drivers/${editingDriverId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editDriverName, license: editDriverLicense, phone: editDriverPhone })
      });

      if (res.ok) {
        setShowEditDriver(false);
        setEditingDriverId('');
        await fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Unable to update driver');
      }
    } catch (error) {
      alert('Unable to connect to server');
    }
  }

  async function handleDeleteDriver(id: string) {
    if (!confirm('Delete this driver? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/company/drivers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (res.ok) {
        await fetchData();
        alert('Driver deleted');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Unable to delete driver');
      }
    } catch (error) {
      alert('Unable to connect to server');
    }
  }

  async function handleCancelTicket(ticketId: string) {
    if (!confirm('Are you sure you want to cancel this ticket? This will refund the commuter.')) return;

    try {
      const res = await fetch(`${API_URL}/company/tickets/${ticketId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        await fetchData();
        alert('Ticket cancelled successfully');
      } else {
        alert('Failed to cancel ticket');
      }
    } catch (error) {
      alert('An error occurred while cancelling the ticket');
    }
  }

  function downloadReports() {
    // Company Summary Report
    const companyInfo = [
      ['===== COMPANY INFORMATION ====='],
      ['Company Name', company.name],
      ['Status', company.status],
      ['Subscription Status', company.subscriptionStatus],
      ['Total Revenue', `RWF ${totalRevenue.toLocaleString()}`],
      ['Report Generated', new Date().toLocaleString()],
      [''],
      ['']
    ];

    // Buses Report
    const busesHeader = [
      ['===== BUSES FLEET REPORT ====='],
      ['Total Buses', buses.length.toString()],
      [''],
      ['Plate Number', 'Model', 'Capacity', 'Driver', 'Status']
    ];
    const busesData = buses.map(bus => {
      const driver = drivers.find(d => d.id === bus.driverId);
      return [
        bus.plateNumber,
        bus.model,
        `${bus.capacity} seats`,
        driver?.name || 'Unassigned',
        bus.status
      ];
    });

    // Drivers Report
    const driversHeader = [
      [''],
      [''],
      ['===== DRIVERS REPORT ====='],
      ['Total Drivers', drivers.length.toString()],
      ['Available Drivers', drivers.filter(d => d.available).length.toString()],
      [''],
      ['Name', 'License Number', 'Phone', 'Status', 'Assigned Bus']
    ];
    const driversData = drivers.map(driver => {
      const assignedBus = buses.find(b => b.driverId === driver.id);
      return [
        driver.name,
        driver.license,
        driver.phone,
        driver.available ? 'Available' : 'On Duty',
        assignedBus?.plateNumber || 'Unassigned'
      ];
    });

    // Schedules Report
    const schedulesHeader = [
      [''],
      [''],
      ['===== SCHEDULES & REVENUE REPORT ====='],
      ['Total Schedules', schedules.length.toString()],
      [''],
      ['Route', 'Date', 'Departure', 'Arrival', 'Price', 'Total Seats', 'Available', 'Sold', 'Revenue']
    ];
    const schedulesData = scheduleRevenue.map(s => [
      `${s.routeFrom} → ${s.routeTo}`,
      s.date,
      s.departureTime,
      s.arrivalTime || 'N/A',
      `RWF ${s.price}`,
      s.totalSeats,
      s.seatsAvailable,
      s.soldSeats,
      `RWF ${s.revenue.toLocaleString()}`
    ]);

    // Tickets Report
    const ticketsHeader = [
      [''],
      [''],
      ['===== TICKETS SALES REPORT ====='],
      ['Total Tickets Sold', tickets.length.toString()],
      ['Paid Tickets', tickets.filter(t => t.paymentStatus === 'paid').length.toString()],
      ['Cancelled Tickets', tickets.filter(t => t.status === 'cancelled').length.toString()],
      ['Scanned Tickets', tickets.filter(t => t.scanned).length.toString()],
      [''],
      ['Ticket ID', 'QR Code', 'Seat', 'Price', 'Status', 'Payment Status', 'Scanned', 'Created At']
    ];
    const ticketsData = tickets.map(t => [
      t.id.slice(0, 8),
      t.qrCode,
      `Seat ${t.seatNumber}`,
      `RWF ${t.price}`,
      t.status,
      t.paymentStatus,
      t.scanned ? 'Yes' : 'No',
      t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'
    ]);

    // Combine all sections
    const csvContent = [
      ...companyInfo,
      ...busesHeader,
      ...busesData,
      ...driversHeader,
      ...driversData,
      ...schedulesHeader,
      ...schedulesData,
      ...ticketsHeader,
      ...ticketsData
    ].map(row => row.join(',')).join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafariTix_Comprehensive_Report_${company.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Calculate total revenue from sold tickets
  const totalRevenue = tickets
    .filter(t => t.paymentStatus === 'paid')
    .reduce((sum, t) => sum + (t.price || 0), 0);

  // Calculate revenue by schedule
  const scheduleRevenue = schedules.map(schedule => {
    const scheduleTickets = tickets.filter(t => t.scheduleId === schedule.id && t.paymentStatus === 'paid');
    const bookedSeatsFromBackend = Number.isFinite(schedule.bookedSeats) ? schedule.bookedSeats : scheduleTickets.length;
    const seatsAvailable = Number.isFinite(schedule.seatsAvailable) ? schedule.seatsAvailable : Math.max(0, (schedule.totalSeats || 0) - bookedSeatsFromBackend);
    const price = schedule.price || 0;
    const revenueFromBackend = Number.isFinite(schedule.revenue) ? schedule.revenue : bookedSeatsFromBackend * price;
    const revenueFromTickets = scheduleTickets.reduce((sum, t) => sum + (t.price || 0), 0);
    const revenue = revenueFromBackend || revenueFromTickets;

    return { ...schedule, revenue, soldSeats: bookedSeatsFromBackend, seatsAvailable };
  });

  // Sort tickets by creation date (newest first) and limit to last 5 if not showing all
  const sortedTickets = [...tickets].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA; // Newest first
  });
  
  const displayedTickets = showAllTickets ? sortedTickets : sortedTickets.slice(0, 5);
  const hasMoreTickets = tickets.length > 5;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No company found. Please create a company in settings or contact support.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // If subscription not paid, show payment screen
  if (!subscriptionPaid && company.status === 'pending') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="bg-[#0077B6] text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="w-8 h-8" />
            </div>
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Subscription Required
            </CardTitle>
            <CardDescription>
              Pay the monthly subscription fee to activate your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#F5F7FA] dark:bg-[#2B2D42] p-6 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Monthly Subscription</p>
              <p className="text-4xl font-bold text-[#0077B6]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                RWF {SUBSCRIPTION_FEE.toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                Unlimited bus management
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                Schedule and route creation
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                Real-time ticket sales tracking
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                Revenue analytics and reports
              </p>
            </div>

            <Button
              className="w-full bg-[#0077B6] hover:bg-[#005a8c]"
              onClick={() => setShowSubscriptionPayment(true)}
            >
              Pay Subscription
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              After payment, your subscription will be activated immediately.
            </p>
          </CardContent>
        </Card>

        <PaymentModal
          open={showSubscriptionPayment}
          onClose={() => setShowSubscriptionPayment(false)}
          amount={SUBSCRIPTION_FEE}
          onSuccess={handleSubscriptionPayment}
          title="Pay Subscription Fee"
          description="Monthly subscription for SafariTix platform"
        />
      </div>
    );
  }

  // If subscription paid but account has non-approved status, allow access but show a neutral message (no admin approval required)
  if (subscriptionPaid && company.status === 'pending') {
    // we'll proceed to render the dashboard but the subscription status will reflect in the UI
  }

  // Do not block access based on company.status; dashboard will render regardless of approval flags

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bus className="w-6 h-6 text-[#0077B6]" />
            <div>
              <h1 style={{ fontFamily: 'Montserrat, sans-serif' }}>{company.name}</h1>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={company.subscriptionStatus === 'active' ? 'default' : 'secondary'} className="bg-[#27AE60]">
              {company.subscriptionStatus}
            </Badge>
            {onSettings && (
              <Button variant="outline" size="sm" onClick={onSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            )}
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Buses</CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {buses.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Schedules</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {schedules.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Tickets Sold</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {tickets.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#27AE60]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                RWF {totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mb-4">
          <Button onClick={downloadReports} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download Reports
          </Button>
        </div>

        <Tabs defaultValue="buses" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="buses">Buses</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="buses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Buses Management</CardTitle>
                    <CardDescription>Manage your fleet of buses</CardDescription>
                  </div>
                  <Dialog open={showAddBus} onOpenChange={setShowAddBus}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#0077B6] hover:bg-[#005a8c]">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Bus
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Bus</DialogTitle>
                        <DialogDescription>Enter bus details and assign a driver</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddBus} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="plate">Plate Number</Label>
                          <Input
                            id="plate"
                            value={plateNumber}
                            onChange={(e) => setPlateNumber(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="seat-layout">Seat Layout</Label>
                            <Select value={seatLayout} onValueChange={(val) => { setSeatLayout(val); setCapacity(val); }}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select layout" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="25">25 seats</SelectItem>
                                <SelectItem value="30">30 seats</SelectItem>
                                <SelectItem value="50">50 seats</SelectItem>
                              </SelectContent>
                            </Select>

                            <Label htmlFor="capacity" className="mt-2">Capacity</Label>
                            <Input
                              id="capacity"
                              type="number"
                              value={capacity}
                              onChange={(e) => setCapacity(e.target.value)}
                              required
                            />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model">Model</Label>
                          <Input
                            id="model"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="driver">Assign Driver (Optional)</Label>
                          <Select value={selectedDriver || "none"} onValueChange={(val) => setSelectedDriver(val === "none" ? "" : val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a driver" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-muted-foreground">⚠️ No driver assigned</span>
                              </SelectItem>
                              {drivers.filter(d => d.available).map((driver) => (
                                <SelectItem key={driver.id} value={driver.id}>
                                  <span className="flex items-center gap-2">
                                    ✅ {driver.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            {drivers.filter(d => d.available).length} available driver{drivers.filter(d => d.available).length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005a8c]">
                          Add Bus
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Input placeholder="Search plate number" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Seat Layout</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buses
                      .filter(b => {
                        if (statusFilter !== 'all' && b.status !== statusFilter) return false;
                        if (searchTerm && !b.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                        return true;
                      })
                      .map((bus) => {
                      const driver = drivers.find(d => d.id === bus.driverId);
                      return (
                        <TableRow key={bus.id}>
                          <TableCell>{bus.plateNumber}</TableCell>
                          <TableCell>{bus.model}</TableCell>
                          <TableCell>{bus.capacity} seats</TableCell>
                          <TableCell>{bus.seatLayout}</TableCell>
                          <TableCell>{driver?.name || 'Unassigned'}</TableCell>
                          <TableCell>
                            <Badge className={bus.status === 'active' ? 'bg-[#27AE60]' : 'bg-[#94A3B8]'}>
                              {bus.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingBusId(bus.id);
                              setEditPlateNumber(bus.plateNumber);
                              setEditCapacity(String(bus.capacity));
                              setEditSeatLayout(bus.seatLayout);
                              setEditModel(bus.model || '');
                              setShowEditBus(true);
                            }}>Edit</Button>

                            <Button size="sm" variant="outline" onClick={() => handleToggleStatus(bus.id, bus.status)}>
                              {bus.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>

                            <Button size="sm" variant="destructive" onClick={() => handleDeleteBus(bus.id)}>
                              Delete
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAssignBusId(bus.id);
                                setAssignDriverId(bus.driverId || '');
                                setShowAssignDriver(true);
                              }}
                            >
                              {bus.driverId ? 'Change Driver' : 'Assign Driver'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Driver Management</CardTitle>
                    <CardDescription>Add and assign drivers to your buses</CardDescription>
                  </div>
                  <Dialog open={showAddDriver} onOpenChange={setShowAddDriver}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#0077B6] hover:bg-[#005a8c]">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Driver
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Driver</DialogTitle>
                        <DialogDescription>Enter driver details</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddDriver} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="driver-name">Full Name</Label>
                          <Input
                            id="driver-name"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            placeholder="e.g., John Mukiza"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="driver-license">License Number</Label>
                          <Input
                            id="driver-license"
                            value={driverLicense}
                            onChange={(e) => setDriverLicense(e.target.value)}
                            placeholder="e.g., DL-001234"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="driver-phone">Phone Number</Label>
                          <Input
                            id="driver-phone"
                            value={driverPhone}
                            onChange={(e) => setDriverPhone(e.target.value)}
                            placeholder="+250 XXX XXX XXX"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005a8c]">
                          Add Driver
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>License Number</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Bus</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver) => {
                      const assignedBuses = driver.buses && driver.buses.length > 0 
                        ? driver.buses.map(b => `${b.plate_number} (${b.model})`).join(', ')
                        : 'Unassigned';
                      return (
                        <TableRow key={driver.id}>
                          <TableCell>{driver.name}</TableCell>
                          <TableCell className="font-mono">{driver.license}</TableCell>
                          <TableCell>{driver.phone}</TableCell>
                          <TableCell>
                            <Badge className={driver.available ? 'bg-[#27AE60]' : 'bg-[#F4A261]'}>
                              {driver.available ? 'Available' : 'On Duty'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{assignedBuses}</span>
                          </TableCell>
                          <TableCell className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingDriverId(driver.id);
                              setEditDriverName(driver.name || '');
                              setEditDriverLicense(driver.license || '');
                              setEditDriverPhone(driver.phone || '');
                              setShowEditDriver(true);
                            }}>Edit</Button>

                            <Button size="sm" variant="destructive" onClick={() => handleDeleteDriver(driver.id)}>
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Schedules</CardTitle>
                    <CardDescription>Manage bus schedules and routes</CardDescription>
                  </div>
                  <Dialog open={showAddSchedule} onOpenChange={setShowAddSchedule}>
                    <DialogTrigger asChild>
                      <Button disabled={buses.length === 0} className="bg-[#0077B6] hover:bg-[#005a8c]">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Schedule
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Schedule</DialogTitle>
                        <DialogDescription>Set up a new bus schedule</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddSchedule} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bus">Select Bus</Label>
                            <Select value={selectedBus} onValueChange={setSelectedBus} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a bus" />
                              </SelectTrigger>
                              <SelectContent>
                                {buses.map((bus) => (
                                  <SelectItem key={bus.id} value={bus.id}>
                                    {bus.plateNumber} - {bus.model}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="from">From</Label>
                            <Input
                              id="from"
                              value={routeFrom}
                              onChange={(e) => setRouteFrom(e.target.value)}
                              placeholder="e.g., Kigali"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="to">To</Label>
                            <Input
                              id="to"
                              value={routeTo}
                              onChange={(e) => setRouteTo(e.target.value)}
                              placeholder="e.g., Musanze"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="departure">Departure</Label>
                            <Input
                              id="departure"
                              type="time"
                              value={departureTime}
                              onChange={(e) => setDepartureTime(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="arrival">Arrival</Label>
                            <Input
                              id="arrival"
                              type="time"
                              value={arrivalTime}
                              onChange={(e) => setArrivalTime(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Price (RWF)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="driver">Assign Driver (Optional)</Label>
                          <Select value={scheduleDriver || "none"} onValueChange={(val) => setScheduleDriver(val === "none" ? "" : val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a driver" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-muted-foreground">⚠️ No driver assigned</span>
                              </SelectItem>
                              {drivers.filter(d => d.available).map((driver) => (
                                <SelectItem key={driver.id} value={driver.id}>
                                  <span className="flex items-center gap-2">
                                    ✅ {driver.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            {drivers.filter(d => d.available).length} available driver{drivers.filter(d => d.available).length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005a8c]">
                          Create Schedule
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Price/Seat</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleRevenue.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.routeFrom} → {schedule.routeTo}</TableCell>
                        <TableCell>{new Date(schedule.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                        <TableCell>{new Date(schedule.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</TableCell>
                        <TableCell>RWF {schedule.price.toLocaleString()}</TableCell>
                        <TableCell>{schedule.seatsAvailable} seats</TableCell>
                        <TableCell>
                          <Badge className="bg-[#0077B6]">{schedule.soldSeats}</Badge>
                        </TableCell>
                        <TableCell className="text-[#27AE60] font-bold">
                          RWF {(schedule.revenue || (schedule.soldSeats * schedule.price)).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Ticket Sales</CardTitle>
                <CardDescription>View all tickets booked for your schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Seat</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scanned</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-sm">{ticket.id.slice(0, 8)}</TableCell>
                        <TableCell>{ticket.seatNumber}</TableCell>
                        <TableCell className="font-mono">{ticket.qrCode}</TableCell>
                        <TableCell>RWF {ticket.price}</TableCell>
                        <TableCell>
                          <Badge variant={ticket.status === 'cancelled' ? 'secondary' : 'default'} className={ticket.status === 'cancelled' ? '' : 'bg-[#27AE60]'}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.scanned ? '✓' : '—'}
                        </TableCell>
                        <TableCell>
                          {ticket.status !== 'cancelled' && !ticket.scanned && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelTicket(ticket.id)}
                              className="bg-[#E63946] hover:bg-[#c72e3a]"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {hasMoreTickets && (
                  <div className="flex justify-center mt-4">
                    {showAllTickets ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAllTickets(false)}
                      >
                        See Less
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAllTickets(true)}
                      >
                        See More
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assign Driver Dialog */}
      <Dialog open={showAssignDriver} onOpenChange={setShowAssignDriver}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
            <DialogDescription>Select a driver to assign to this bus.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignDriver} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assign-driver">Driver</Label>
              <Select value={assignDriverId || 'none'} onValueChange={(val) => setAssignDriverId(val === 'none' ? '' : val)}>
                <SelectTrigger id="assign-driver">
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">⚠️ No driver assigned</span>
                  </SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} ({driver.license})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005a8c]">
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Driver Dialog */}
      <Dialog open={showEditDriver} onOpenChange={setShowEditDriver}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>Update driver details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDriver} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-driver-name">Full Name</Label>
              <Input id="edit-driver-name" value={editDriverName} onChange={(e) => setEditDriverName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-driver-license">License Number</Label>
              <Input id="edit-driver-license" value={editDriverLicense} onChange={(e) => setEditDriverLicense(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-driver-phone">Phone Number</Label>
              <Input id="edit-driver-phone" value={editDriverPhone} onChange={(e) => setEditDriverPhone(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005a8c]">Save</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Bus Dialog */}
      <Dialog open={showEditBus} onOpenChange={setShowEditBus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bus</DialogTitle>
            <DialogDescription>Update bus details and save changes</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditBus} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-plate">Plate Number</Label>
              <Input id="edit-plate" value={editPlateNumber} onChange={(e) => setEditPlateNumber(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-seat-layout">Seat Layout</Label>
              <Select value={editSeatLayout} onValueChange={(val) => { setEditSeatLayout(val); setEditCapacity(val); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 seats</SelectItem>
                  <SelectItem value="30">30 seats</SelectItem>
                  <SelectItem value="50">50 seats</SelectItem>
                </SelectContent>
              </Select>

              <Label htmlFor="edit-capacity" className="mt-2">Capacity</Label>
              <Input id="edit-capacity" type="number" value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-model">Model</Label>
              <Input id="edit-model" value={editModel} onChange={(e) => setEditModel(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005a8c]">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}