import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { API_URL } from '../utils/supabase-client';
import { publicAnonKey } from '../utils/supabase/info';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Building2, DollarSign, Ticket, Bus, CheckCircle, XCircle, MapPin, LogOut, TrendingUp, Users, Download, Settings } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface AdminDashboardProps {
  onSettings?: () => void;
}

export function AdminDashboard({ onSettings }: AdminDashboardProps) {
  const { user, accessToken, signOut } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetchData();
    const interval = setInterval(fetchLocations, 5000); // Update locations every 5s
    return () => clearInterval(interval);
  }, [accessToken]);

  async function fetchData() {
    try {
      const [statsRes, companiesRes, locationsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${API_URL}/admin/companies`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${API_URL}/tracking`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        })
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (companiesRes.ok) {
        const data = await companiesRes.json();
        setCompanies(data.companies);
      }

      if (locationsRes.ok) {
        const data = await locationsRes.json();
        setLocations(data.locations);
      }
    } catch (error) {
      // Admin data fetch errors are handled silently
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
      // Location fetch errors are handled silently
    }
  }

  async function updateCompanyStatus(companyId: string, status: string, subscriptionStatus?: string) {
    try {
      const res = await fetch(`${API_URL}/admin/companies/${companyId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, subscriptionStatus })
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      // Company update errors are handled silently
    }
  }

  function downloadSystemReports() {
    // Generate CSV data for system-wide analytics
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Companies', stats?.totalCompanies || 0],
      ['Active Companies', stats?.activeCompanies || 0],
      ['Total Buses', stats?.totalBuses || 0],
      ['Buses Tracking Live', locations.length],
      ['Total Tickets Sold', stats?.totalTickets || 0],
      ['Total Revenue', `RWF ${stats?.totalRevenue || 0}`],
      ['Report Generated', new Date().toLocaleString()]
    ].map(row => row.join(',')).join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafariTix_System_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bus className="w-6 h-6 text-[#0077B6]" />
            <h1 style={{ fontFamily: 'Montserrat, sans-serif' }}>SafariTix Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
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
        {/* System Growth Overview */}
        <Card className="mb-8 bg-gradient-to-br from-[#0077B6]/10 to-[#F4A261]/10 dark:from-[#0077B6]/20 dark:to-[#F4A261]/20 border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <TrendingUp className="w-6 h-6 text-[#0077B6]" />
                  System Growth Metrics
                </CardTitle>
                <CardDescription>Real-time platform analytics and performance</CardDescription>
              </div>
              <Button onClick={downloadSystemReports} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download Reports
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white dark:bg-[#2B2D42] rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-[#0077B6]" />
                <div className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {((stats?.activeCompanies || 0) / Math.max(stats?.totalCompanies || 1, 1) * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground">Company Activation</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-[#2B2D42] rounded-lg">
                <Bus className="w-8 h-8 mx-auto mb-2 text-[#27AE60]" />
                <div className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {((locations.length / Math.max(stats?.totalBuses || 1, 1)) * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground">Buses Active</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-[#2B2D42] rounded-lg">
                <Ticket className="w-8 h-8 mx-auto mb-2 text-[#F4A261]" />
                <div className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stats?.totalTickets || 0}
                </div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-[#2B2D42] rounded-lg">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-[#0077B6]" />
                <div className="text-3xl font-bold text-[#27AE60]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M
                </div>
                <p className="text-sm text-muted-foreground">Revenue (RWF)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats?.totalCompanies || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeCompanies || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Buses</CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats?.totalBuses || 0}</div>
              <p className="text-xs text-muted-foreground">
                {locations.length} tracking live
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Tickets Sold</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats?.totalTickets || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">RWF {stats?.totalRevenue || 0}</div>
              <p className="text-xs text-muted-foreground">Platform-wide</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Companies</CardTitle>
              <CardDescription>Manage transport companies and subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>
                        <Badge variant={company.status === 'approved' ? 'default' : 'secondary'}>
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={company.subscriptionStatus === 'active' ? 'default' : 'outline'}>
                          {company.subscriptionStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {company.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateCompanyStatus(company.id, 'approved', 'active')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {company.status === 'approved' && company.subscriptionStatus === 'inactive' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCompanyStatus(company.id, 'approved', 'active')}
                            >
                              Activate Sub
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Bus Tracking</CardTitle>
              <CardDescription>Real-time GPS locations of active buses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {locations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No buses tracking at the moment</p>
                ) : (
                  locations.map((loc) => (
                    <div key={loc.busId} className="flex items-start gap-3 p-3 border rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">Bus ID: {loc.busId.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          Lat: {loc.lat.toFixed(6)}, Lng: {loc.lng.toFixed(6)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Updated: {new Date(loc.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
