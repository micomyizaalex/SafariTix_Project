import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/supabase-client';
import { ThemeToggle } from './ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bus, MapPin, QrCode, LogOut, CheckCircle, XCircle, AlertCircle, Navigation, Camera, Keyboard, Settings } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Label } from './ui/label';

interface DriverDashboardProps {
  onSettings?: () => void;
}

export function DriverDashboard({ onSettings }: DriverDashboardProps) {
  const { user, accessToken, signOut } = useAuth();
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'manual' | 'camera'>('manual');
  
  // GPS tracking
  const [selectedBusId, setSelectedBusId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  
  // Video scanning
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Mock bus assignment
  const [assignedBuses] = useState([
    { id: crypto.randomUUID(), plateNumber: 'RAC 123 A', route: 'Kigali - Musanze' },
  ]);

  useEffect(() => {
    let watchId: number | null = null;
    let intervalId: number | null = null;

    if (isTracking && selectedBusId && !useManualLocation) {
      if ('geolocation' in navigator) {
        setGpsError(null);
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setGpsError(null);
            updateLocation(latitude, longitude);
          },
          (error) => {
            // Geolocation errors are expected in iframe/embedded environments - handle silently
            let errorMsg = 'GPS not available in this environment. ';
            
            if (error.message?.includes('permissions policy')) {
              errorMsg = 'GPS is disabled in this environment. Please use Manual Location mode.';
              setUseManualLocation(true);
            } else if (error.code === 1) {
              errorMsg = 'Location permission denied. Use Manual Location mode.';
              setUseManualLocation(true);
            } else if (error.code === 2) {
              errorMsg = 'Location unavailable. Use Manual Location mode.';
            } else if (error.code === 3) {
              errorMsg = 'Location request timed out. Use Manual Location mode.';
            }
            setGpsError(errorMsg);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
          }
        );
      } else {
        setGpsError('Geolocation not supported. Use Manual Location mode.');
        setUseManualLocation(true);
      }
    }

    if (isTracking && selectedBusId && useManualLocation && currentLocation) {
      intervalId = window.setInterval(() => {
        updateLocation(currentLocation.lat, currentLocation.lng);
      }, 5000);
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, selectedBusId, useManualLocation, currentLocation]);

  async function updateLocation(lat: number, lng: number) {
    try {
      await fetch(`${API_URL}/driver/location`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          busId: selectedBusId,
          lat,
          lng
        })
      });
    } catch (error) {
      // Location update errors are handled silently
    }
  }

  async function handleScanTicket(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!qrInput.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await fetch(`${API_URL}/driver/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qrCode: qrInput.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
        if (cameraActive) {
          stopCamera();
        }
      }
    } catch (error) {
      // Ticket scan errors are handled with user-friendly message
      setScanResult({
        valid: false,
        message: 'Error scanning ticket'
      });
    } finally {
      setIsScanning(false);
    }
  }

  async function startCamera() {
    setCameraError(null);
    
    // Check if camera API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API not supported in this environment');
      setScanMode('manual');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setCameraError(null);
      }
    } catch (error: any) {
      // Camera errors are expected in iframe/embedded environments - handle gracefully
      let errorMessage = 'Camera access not available. ';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access is blocked in this environment. Please use manual entry below.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device. Please use manual entry below.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Camera access blocked due to security restrictions. Use manual entry below.';
      } else {
        errorMessage = 'Camera not available. Please use manual entry below.';
      }
      
      setCameraError(errorMessage);
      setScanMode('manual');
    }
  }

  function stopCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }

  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
      setCameraError(null);
    }
    return () => stopCamera();
  }, [scanMode]);

  function startTracking() {
    if (!selectedBusId) {
      alert('Please select a bus first');
      return;
    }
    setIsTracking(true);
  }

  function stopTracking() {
    setIsTracking(false);
    setCurrentLocation(null);
    setGpsError(null);
  }

  function handleManualLocationSet() {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180');
      return;
    }
    
    setCurrentLocation({ lat, lng });
    updateLocation(lat, lng);
    setGpsError(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bus className="w-6 h-6 text-[#0077B6]" />
            <div>
              <h1 style={{ fontFamily: 'Montserrat, sans-serif' }}>Driver Portal</h1>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scanner">Ticket Verification</TabsTrigger>
            <TabsTrigger value="tracking">GPS Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <QrCode className="w-5 h-5" />
                  Scan & Verify Tickets
                </CardTitle>
                <CardDescription>
                  Choose your preferred scanning method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scan Mode Toggle */}
                {cameraError && (
                  <Alert className="border-[#F4A261] bg-orange-50 dark:bg-orange-950">
                    <AlertCircle className="h-5 w-5 text-[#F4A261]" />
                    <AlertDescription>
                      <p className="text-sm">{cameraError}</p>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    variant={scanMode === 'manual' ? 'default' : 'outline'}
                    onClick={() => setScanMode('manual')}
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

                {scanMode === 'manual' ? (
                  <form onSubmit={handleScanTicket} className="space-y-4">
                    <div className="space-y-2">
                      <Label>QR Code</Label>
                      <Input
                        placeholder="Enter QR Code (e.g., STIX-12345678)"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        className="text-lg"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005a8c]" disabled={isScanning}>
                      {isScanning ? 'Verifying...' : 'Verify Ticket'}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-[#0077B6] rounded-lg p-4 bg-[#F5F7FA] dark:bg-[#2B2D42]">
                      {cameraActive ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full rounded-lg"
                          style={{ maxHeight: '300px' }}
                        />
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="mb-2">Camera not available</p>
                          <p className="text-xs">
                            {cameraError ? 'Use manual entry below' : 'Initializing camera...'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Or enter QR code manually</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="QR Code"
                          value={qrInput}
                          onChange={(e) => setQrInput(e.target.value)}
                        />
                        <Button onClick={() => handleScanTicket()} className="bg-[#0077B6] hover:bg-[#005a8c]">
                          Verify
                        </Button>
                      </div>
                    </div>

                    {cameraActive ? (
                      <p className="text-sm text-muted-foreground text-center">
                        Point camera at QR code or enter code manually above
                      </p>
                    ) : (
                      <Alert className="bg-[#F5F7FA] dark:bg-[#2B2D42]">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Camera scanning is not available in this environment. 
                          Please use manual entry for ticket verification.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {scanResult && (
                  <div className="pt-4 border-t">
                    {scanResult.valid ? (
                      <Alert className="border-[#27AE60] bg-green-50 dark:bg-green-950">
                        <CheckCircle className="h-5 w-5 text-[#27AE60]" />
                        <AlertDescription>
                          <div className="space-y-3">
                            <p className="font-bold text-[#27AE60] text-lg">✅ Ticket Verified</p>
                            <div className="bg-white dark:bg-[#2B2D42] p-4 rounded-lg space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Passenger:</span>
                                <span className="font-semibold">{scanResult.ticket?.commuter?.name || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Seat Number:</span>
                                <span className="font-semibold">{scanResult.ticket?.seatNumber}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Route:</span>
                                <span className="font-semibold">
                                  {scanResult.ticket?.schedule?.routeFrom} → {scanResult.ticket?.schedule?.routeTo}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Departure:</span>
                                <span className="font-semibold">{scanResult.ticket?.schedule?.departureTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Ticket ID:</span>
                                <span className="font-mono text-xs">{scanResult.ticket?.qrCode}</span>
                              </div>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="border-[#E63946] bg-red-50 dark:bg-red-950">
                        <XCircle className="h-5 w-5 text-[#E63946]" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-bold text-[#E63946] text-lg">❌ {scanResult.message}</p>
                            {scanResult.ticket && (
                              <p className="text-sm">
                                This ticket has already been used or is invalid.
                              </p>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => {
                        setScanResult(null);
                        setQrInput('');
                      }}
                    >
                      Scan Another Ticket
                    </Button>
                  </div>
                )}

                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Verification Methods
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <Keyboard className="w-4 h-4 mt-0.5 text-[#0077B6]" />
                      <span><strong>Manual Entry:</strong> Type or paste the QR code from passenger's ticket</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Camera className="w-4 h-4 mt-0.5 text-[#0077B6]" />
                      <span><strong>Camera Scan:</strong> Point camera at QR code for instant verification</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Navigation className="w-5 h-5" />
                  GPS Location Sharing
                </CardTitle>
                <CardDescription>
                  Share your real-time location with passengers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Your Bus</Label>
                    <select
                      className="w-full p-2 border rounded-md bg-background"
                      value={selectedBusId}
                      onChange={(e) => setSelectedBusId(e.target.value)}
                      disabled={isTracking}
                    >
                      <option value="">Choose a bus</option>
                      {assignedBuses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          {bus.plateNumber} - {bus.route}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant={useManualLocation ? 'outline' : 'default'}
                      onClick={() => setUseManualLocation(false)}
                      disabled={isTracking}
                    >
                      Auto GPS
                    </Button>
                    <Button
                      className="flex-1"
                      variant={useManualLocation ? 'default' : 'outline'}
                      onClick={() => setUseManualLocation(true)}
                      disabled={isTracking}
                    >
                      Manual
                    </Button>
                  </div>

                  {useManualLocation && !isTracking && (
                    <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm">Enter location coordinates manually</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Latitude</Label>
                          <Input
                            type="number"
                            step="0.000001"
                            placeholder="-1.9536"
                            value={manualLat}
                            onChange={(e) => setManualLat(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Longitude</Label>
                          <Input
                            type="number"
                            step="0.000001"
                            placeholder="30.0606"
                            value={manualLng}
                            onChange={(e) => setManualLng(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-[#0077B6] hover:bg-[#005a8c]" 
                        onClick={handleManualLocationSet}
                        variant="default"
                      >
                        Set Location
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Example: Kigali is at -1.9536, 30.0606
                      </p>
                    </div>
                  )}

                  {!isTracking ? (
                    <Button 
                      className="w-full bg-[#27AE60] hover:bg-[#1e8c4d]" 
                      onClick={startTracking}
                      disabled={useManualLocation && !currentLocation}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {useManualLocation ? 'Start Sharing Location' : 'Start GPS Tracking'}
                    </Button>
                  ) : (
                    <Button className="w-full bg-[#E63946] hover:bg-[#c62f3a]" onClick={stopTracking}>
                      Stop Tracking
                    </Button>
                  )}
                </div>

                {gpsError && isTracking && !useManualLocation && (
                  <Alert className="border-[#F4A261] bg-orange-50 dark:bg-orange-950">
                    <AlertCircle className="h-5 w-5 text-[#F4A261]" />
                    <AlertDescription>
                      <p className="text-[#F4A261]">{gpsError}</p>
                    </AlertDescription>
                  </Alert>
                )}

                {isTracking && currentLocation && (
                  <Alert className="border-[#0077B6] bg-blue-50 dark:bg-blue-950">
                    <MapPin className="h-5 w-5 text-[#0077B6]" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-bold text-[#0077B6]">
                          📍 {useManualLocation ? 'Location Sharing Active' : 'GPS Tracking Active'}
                        </p>
                        <div className="text-sm space-y-1">
                          <p>Your location is being shared with passengers</p>
                          <p className="font-mono text-xs">
                            Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                          </p>
                          {useManualLocation && (
                            <p className="text-xs italic">Using manual location mode</p>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {isTracking && !currentLocation && (
                  <Alert className="border-[#0077B6] bg-blue-50 dark:bg-blue-950">
                    <MapPin className="h-5 w-5 text-[#0077B6]" />
                    <AlertDescription>
                      <p>Waiting for location data...</p>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Location Tracking Info
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>Auto GPS Mode:</strong></p>
                    <p>• Uses your device's GPS (requires location permission)</p>
                    <p>• Updates automatically in real-time</p>
                    <p className="text-xs">Note: GPS may not work in embedded environments</p>
                    
                    <p className="pt-2"><strong>Manual Mode:</strong></p>
                    <p>• Enter coordinates manually for demo/testing</p>
                    <p>• Perfect for prototyping or when GPS is unavailable</p>
                    <p>• Location updates every 5 seconds once set</p>
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
