import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/supabase-client';
import { QrReader } from 'react-qr-reader';
import { ThemeToggle } from './ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Bus, MapPin, QrCode, LogOut, CheckCircle, XCircle, AlertCircle, Navigation, Camera, Keyboard, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type Bus = {
  id: number;
  plateNumber?: string;
  scheduleId?: number | null;
  routeFrom?: string | null;
  routeTo?: string | null;
};

type ScanResult = {
  valid: boolean;
  message?: string;
  ticket?: any;
};

type RecentScan = {
  id: string;
  passengerName: string;
  seatNumber: string;
  timestamp: Date;
  valid: boolean;
};

export function DriverDashboard() {
  const { user, accessToken, loading, signOut } = useAuth();
  const token = accessToken || localStorage.getItem('token');

  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);

  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<boolean | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObjRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [liveSharing, setLiveSharing] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('manual');

  // Fetch driver context (buses)
  useEffect(() => {
    async function fetchContext() {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/driver/context`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const fetchedBuses: Bus[] = (data.buses || []).map((b: any) => ({
          id: b.id,
          plateNumber: b.plateNumber || b.plate_number || null,
          scheduleId: b.scheduleId || b.schedule_id || null,
          routeFrom: b.routeFrom || b.route_from || null,
          routeTo: b.routeTo || b.route_to || null,
        }));
        setBuses(fetchedBuses);
        if (fetchedBuses.length > 0) setSelectedBusId(fetchedBuses[0].id);
      } catch {}
    }
    fetchContext();
  }, [token]);

  // Google Maps script loader + init
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) return;
    if ((window as any).google && (window as any).google.maps) {
      setMapLoaded(true);
      return;
    }
    const id = 'safaritix-google-maps';
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&v=weekly`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // initialize map once loaded and we have a container
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const g = (window as any).google;
    if (!g || !g.maps) return;
    const center = position ? { lat: position.lat, lng: position.lng } : { lat: 0, lng: 0 };
    mapObjRef.current = new g.maps.Map(mapRef.current, {
      center,
      zoom: position ? 15 : 2,
      disableDefaultUI: true,
    });
    markerRef.current = new g.maps.Marker({
      position: center,
      map: mapObjRef.current,
      title: 'Your location',
    });
  }, [mapLoaded, position]);

  // update marker + center when position changes
  useEffect(() => {
    if (!position || !mapObjRef.current) return;
    const g = (window as any).google;
    const pos = { lat: position.lat, lng: position.lng };
    mapObjRef.current.setCenter(pos);
    mapObjRef.current.setZoom(15);
    if (markerRef.current) {
      markerRef.current.setPosition(pos);
    } else {
      markerRef.current = new g.maps.Marker({ position: pos, map: mapObjRef.current });
    }
  }, [position]);

  function showStatus(message: string, success: boolean) {
    setStatusMessage(message);
    setStatusSuccess(success);
    setTimeout(() => {
      setStatusMessage(null);
      setStatusSuccess(null);
    }, 4000);
  }

  async function validateTicket(code: string) {
    if (!code) {
      showStatus('Ticket code is empty', false);
      return;
    }
    const payload = { qrCode: code };
    try {
      const res = await fetch(`${API_URL}/driver/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data: ScanResult = await res.json().catch(() => ({} as ScanResult));
      if (res.ok && data.valid) {
        showStatus(data.message || 'Ticket validated', true);
        // Add to recent scans
        if (data.ticket) {
          const newScan: RecentScan = {
            id: code,
            passengerName: data.ticket.commuter?.name || 'Unknown',
            seatNumber: data.ticket.seatNumber || 'N/A',
            timestamp: new Date(),
            valid: true
          };
          setRecentScans(prev => [newScan, ...prev].slice(0, 5));
        }
      } else {
        showStatus(data.message || (data as any).error || 'Validation failed', false);
        // Add failed scan to recent scans
        const newScan: RecentScan = {
          id: code,
          passengerName: 'Invalid Ticket',
          seatNumber: '-',
          timestamp: new Date(),
          valid: false
        };
        setRecentScans(prev => [newScan, ...prev].slice(0, 5));
      }
      return data;
    } catch (err: any) {
      showStatus(err?.message || 'Network error', false);
      return null;
    }
  }

  async function onQrResult(result: any, error: any) {
    if (!!result) {
      const code = typeof result === 'string' ? result : result?.text ?? '';
      if (code) {
        setScanning(false);
        await validateTicket(code);
      }
    }
  }

  async function handleManualSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!manualCode.trim()) {
      showStatus('Enter a ticket code', false);
      return;
    }
    await validateTicket(manualCode.trim());
    setManualCode('');
  }

  async function getCurrentPositionOnce() {
    if (!navigator.geolocation) {
      showStatus('Geolocation not supported', false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
      },
      (err) => {
        showStatus(err.message || 'Failed to get location', false);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

  async function shareLocation(payload: {
    busId: number | null;
    lat: number;
    lng: number;
    speed?: number | null;
    heading?: number | null;
    accuracy?: number | null;
  }) {
    const body = {
      busId: payload.busId,
      lat: payload.lat,
      lng: payload.lng,
      speed: payload.speed,
      heading: payload.heading,
      accuracy: payload.accuracy,
    };
    try {
      const res = await fetch(`${API_URL}/driver/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showStatus('Location updated', true);
      } else {
        const bodyErr = await res.json().catch(() => ({}));
        showStatus(bodyErr?.message || 'Failed to update location', false);
      }
    } catch (err: any) {
      showStatus(err?.message || 'Network error', false);
    }
  }

  function startLiveSharing() {
    if (!navigator.geolocation) {
      showStatus('Geolocation not supported', false);
      return;
    }
    if (!selectedBusId) {
      showStatus('Select a bus to share location', false);
      return;
    }
    getCurrentPositionOnce();
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const speed = pos.coords.speed ?? null;
        const heading = pos.coords.heading ?? null;
        const accuracy = pos.coords.accuracy ?? null;
        setPosition({ lat, lng });
        shareLocation({ busId: selectedBusId, lat, lng, speed, heading, accuracy });
      },
      (err) => {
        showStatus(err.message || 'Geolocation error', false);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    watchIdRef.current = id as unknown as number;
    setLiveSharing(true);
  }

  function stopLiveSharing() {
    if (watchIdRef.current !== null && navigator.geolocation.clearWatch) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
    setLiveSharing(false);
    showStatus('Stopped sharing location', true);
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 16 }}>Please sign in.</div>;
  if (user.role !== 'driver') return <div style={{ padding: 16 }}>Access denied: Driver only.</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bus className="w-6 h-6 text-[#0077B6]" />
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Driver Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user.name || user.email}</p>
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

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Bus Selection Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Bus className="w-5 h-5" />
              Active Bus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedBusId?.toString() || ''} onValueChange={(val: string) => setSelectedBusId(val ? Number(val) : null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.plateNumber ? `${b.plateNumber}` : `Bus ${b.id}`}{' '}
                    {b.routeFrom ? `— ${b.routeFrom} → ${b.routeTo}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="scanner" className="text-base">
              <QrCode className="w-4 h-4 mr-2" />
              Ticket Scanner
            </TabsTrigger>
            <TabsTrigger value="tracking" className="text-base">
              <Navigation className="w-4 h-4 mr-2" />
              Location Tracking
            </TabsTrigger>
          </TabsList>

          {/* Ticket Scanner Tab */}
          <TabsContent value="scanner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Scan & Verify Tickets</CardTitle>
                <CardDescription>Use camera or enter ticket code manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scan Mode Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={scanMode === 'manual' ? 'default' : 'outline'}
                    onClick={() => { setScanMode('manual'); setScanning(false); }}
                    className={scanMode === 'manual' ? 'bg-[#0077B6] hover:bg-[#005a8c]' : ''}
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    Manual Entry
                  </Button>
                  <Button
                    variant={scanMode === 'camera' ? 'default' : 'outline'}
                    onClick={() => setScanMode('camera')}
                    className={scanMode === 'camera' ? 'bg-[#0077B6] hover:bg-[#005a8c]' : ''}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Camera Scan
                  </Button>
                </div>

                {/* QR Scanner Section */}
                {scanMode === 'camera' && (
                  <div className="space-y-4">
                    {!scanning ? (
                      <Button
                        onClick={() => setScanning(true)}
                        className="w-full bg-[#0077B6] hover:bg-[#005a8c] h-12"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Start QR Scanner
                      </Button>
                    ) : (
                      <>
                        <div className="relative border-4 border-[#0077B6] rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                          <QrReader
                            onResult={onQrResult}
                            constraints={{ facingMode: 'environment' }}
                            containerStyle={{ width: '100%', height: '400px' }}
                            videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <p className="text-white text-center font-semibold">Point camera at ticket QR code</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setScanning(false)}
                          variant="outline"
                          className="w-full h-12"
                        >
                          Close Scanner
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Manual Entry Section */}
                {scanMode === 'manual' && (
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ticketCode" className="text-base font-semibold">Ticket Code</Label>
                      <Input
                        id="ticketCode"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Enter ticket code (e.g., STIX-12345678)"
                        className="h-12 text-lg"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#F4A261] hover:bg-[#e89350] h-12 text-base font-semibold">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Validate Ticket
                    </Button>
                  </form>
                )}

                {/* Status Messages */}
                {statusMessage && (
                  <Alert className={statusSuccess ? 'border-[#27AE60] bg-green-50 dark:bg-green-950' : 'border-[#E63946] bg-red-50 dark:bg-red-950'}>
                    {statusSuccess ? (
                      <CheckCircle className="h-5 w-5 text-[#27AE60]" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[#E63946]" />
                    )}
                    <AlertDescription className="text-base font-semibold">
                      {statusMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Recent Scans */}
            {recentScans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Recent Scans</CardTitle>
                  <CardDescription>Last 5 ticket validations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentScans.map((scan, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {scan.valid ? (
                            <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                          ) : (
                            <XCircle className="w-5 h-5 text-[#E63946]" />
                          )}
                          <div>
                            <p className="font-semibold">{scan.passengerName}</p>
                            <p className="text-sm text-muted-foreground">Seat: {scan.seatNumber}</p>
                          </div>
                        </div>
                        <Badge variant={scan.valid ? 'default' : 'destructive'} className={scan.valid ? 'bg-[#27AE60]' : 'bg-[#E63946]'}>
                          {scan.valid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Location Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>GPS Location Sharing</CardTitle>
                <CardDescription>Share your real-time location with passengers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!liveSharing ? (
                  <Button
                    onClick={startLiveSharing}
                    disabled={!selectedBusId}
                    className="w-full bg-[#27AE60] hover:bg-[#1e8c4d] h-14 text-base font-bold"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Start Sharing Location
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-[#27AE60] bg-green-50 dark:bg-green-950">
                      <MapPin className="h-5 w-5 text-[#27AE60]" />
                      <AlertDescription>
                        <p className="font-bold text-[#27AE60] text-base mb-2">Location Sharing Active</p>
                        <p className="text-sm">Your location is being shared with passengers in real-time</p>
                        {position && (
                          <p className="text-xs font-mono mt-2">
                            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={stopLiveSharing}
                      variant="destructive"
                      className="w-full h-14 text-base font-bold bg-[#E63946] hover:bg-[#c62f3a]"
                    >
                      Stop Sharing Location
                    </Button>
                  </div>
                )}

                {/* Map Display */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Current Location</h3>
                    <Button
                      onClick={getCurrentPositionOnce}
                      variant="outline"
                      size="sm"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Update Now
                    </Button>
                  </div>
                  <div className="border-2 border-muted rounded-lg overflow-hidden" style={{ height: '350px' }}>
                    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
