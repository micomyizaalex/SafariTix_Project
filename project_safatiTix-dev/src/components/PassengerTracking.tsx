import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Loader2, AlertCircle, Bus, RefreshCw } from 'lucide-react';

interface PassengerTrackingProps {
  scheduleId: string;
  ticketId: string;
}

interface BusLocation {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  timestamp: string;
}

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZmIiBzdHJva2U9IiMxRTQwQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNOCAzaDhhNCAEIDAgMCAxIDQgNHYxMGEyIDIgMCAwIDEtMiAySDZhMiAyIDAgMCAxLTItMlY3YTQgNCAwIDAgMSA0LTR6Ii8+PHBhdGggZD0ibTggNS01IDUtNSA1IDUtNXptMCAwaDh2M0g4eiIvPjxjaXJjbGUgY3g9IjgiIGN5PSIxOCIgcj0iMSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTgiIHI9IjEiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Default center (Kigali, Rwanda)
const defaultCenter: [number, number] = [-1.9441, 30.0619];

// Component to handle map centering
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(center);
  }, [center, map]);
  return null;
};

const PassengerTracking: React.FC<PassengerTrackingProps> = ({ scheduleId, ticketId }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const startTracking = () => {
    try {
      setError(null);
      setIsTracking(true);

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      // Initialize Socket.IO connection
      const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
        auth: {
          token: accessToken,
        },
      });

      setConnectionStatus('connecting');

      socket.on('connect', () => {
        console.log('✅ Socket connected');
        setConnectionStatus('connected');
        
        // Join schedule room
        socket.emit('passenger:joinSchedule', { scheduleId, ticketId });
      });

      socket.on('bus:currentLocation', (data: BusLocation) => {
        console.log('📍 Received current bus location:', data);
        setBusLocation(data);
        setLastUpdateTime(new Date());
        setMapCenter([data.latitude, data.longitude]);
      });

      socket.on('bus:locationUpdate', (data: BusLocation) => {
        console.log('🚌 Bus location updated:', data);
        setBusLocation(data);
        setLastUpdateTime(new Date());
        setMapCenter([data.latitude, data.longitude]);
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnectionStatus('disconnected');
      });

      socket.on('error', (data: { message: string }) => {
        console.error('Socket error:', data.message);
        setError(data.message);
        setConnectionStatus('error');
      });

      socketRef.current = socket;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      console.error('Error starting tracking:', err);
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsTracking(false);
    setConnectionStatus('disconnected');
    setBusLocation(null);
    setLastUpdateTime(null);
    setMapCenter(defaultCenter);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const formatTimeDifference = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bus className="w-6 h-6" />
          Track Your Bus
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Connection Status */}
      {isTracking && (
        <div className="m-4 mb-0">
          <div className={`px-4 py-2 rounded-lg border ${getConnectionStatusColor()} flex items-center justify-between`}>
            <span className="text-sm font-medium">Status: {connectionStatus}</span>
            {lastUpdateTime && (
              <span className="text-xs">{formatTimeDifference(lastUpdateTime)}</span>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      {isTracking ? (
        <div className="relative">
          <MapContainer
            center={mapCenter}
            zoom={15}
            style={{ height: '500px', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} />
            {busLocation && (
              <Marker
                position={[busLocation.latitude, busLocation.longitude]}
                icon={busIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Bus Location</strong>
                    <br />
                    {busLocation.speed !== null && busLocation.speed > 0 && (
                      <>Speed: {busLocation.speed.toFixed(1)} km/h<br /></>
                    )}
                    Last updated: {lastUpdateTime?.toLocaleTimeString()}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Location Info Overlay */}
          {busLocation && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Current Bus Location</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Coordinates:</span>
                  <p className="font-mono text-xs">
                    {busLocation.latitude.toFixed(6)}, {busLocation.longitude.toFixed(6)}
                  </p>
                </div>
                {busLocation.speed !== null && busLocation.speed > 0 && (
                  <div>
                    <span className="text-gray-600">Speed:</span>
                    <p className="font-medium">{busLocation.speed.toFixed(1)} km/h</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Track Your Bus in Real-Time
            </h3>
            <p className="text-gray-600 mb-6">
              See your bus's live location on the map during your journey.
            </p>
            <button
              onClick={startTracking}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <Bus className="w-5 h-5" />
              Start Tracking
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isTracking && (
        <div className="p-4 border-t flex gap-3">
          <button
            onClick={stopTracking}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Stop Tracking
          </button>
          <button
            onClick={() => {
              if (busLocation) {
                setMapCenter([busLocation.latitude, busLocation.longitude]);
              }
            }}
            disabled={!busLocation}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Re-center
          </button>
        </div>
      )}

      {/* Info */}
      {!isTracking && (
        <div className="p-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-600 text-center">
            <strong>Note:</strong> Tracking is only available when the bus is actively on the road. Your ticket must be confirmed to access live tracking.
          </p>
        </div>
      )}
    </div>
  );
};

export default PassengerTracking;
