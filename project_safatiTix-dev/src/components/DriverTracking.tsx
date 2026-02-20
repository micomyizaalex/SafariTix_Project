import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MapPin, Navigation, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface DriverTrackingProps {
  scheduleId: string;
  initialStatus?: 'scheduled' | 'in_progress' | 'completed'; // Backend status values
  onTripStarted?: () => void;
  onTripEnded?: () => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

type TripStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const DriverTracking: React.FC<DriverTrackingProps> = ({ 
  scheduleId, 
  initialStatus = 'scheduled',
  onTripStarted, 
  onTripEnded 
}) => {
  // Map backend status to component status
  const mapBackendStatus = (status: string): TripStatus => {
    switch (status) {
      case 'in_progress':
        return 'ACTIVE';
      case 'completed':
        return 'COMPLETED';
      default:
        return 'PENDING';
    }
  };

  const [tripStatus, setTripStatus] = useState<TripStatus>(mapBackendStatus(initialStatus));
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Auto-reconnect if already active
  useEffect(() => {
    if (tripStatus === 'ACTIVE') {
      const accessToken = localStorage.getItem('token');
      if (accessToken) {
        initializeSocket(accessToken);
        startLocationTracking();
      }
    }
  }, []); // Run once on mount

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const startTrip = async () => {
    try {
      setIsStarting(true);
      setError(null);

      // Call API to update schedule status to ACTIVE (in_progress)
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/driver/start-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ scheduleId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to start trip');
      }

      console.log('✅ Trip started successfully:', data);
      setTripStatus('ACTIVE');
      onTripStarted?.();

      // Initialize Socket.IO connection
      initializeSocket(accessToken);

      // Start geolocation tracking
      startLocationTracking();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start trip');
      console.error('❌ Error starting trip:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const endTrip = async () => {
    try {
      setIsEnding(true);
      setError(null);

      // Stop geolocation tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Call API to update schedule status to COMPLETED
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/driver/end-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ scheduleId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to end trip');
      }

      console.log('✅ Trip ended successfully:', data);
      setTripStatus('COMPLETED');
      setConnectionStatus('disconnected');
      setCurrentLocation(null);
      onTripEnded?.();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end trip');
      console.error('❌ Error ending trip:', err);
      
      // Restore connection on error
      const accessToken = localStorage.getItem('token');
      if (accessToken) {
        initializeSocket(accessToken);
        startLocationTracking();
      }
    } finally {
      setIsEnding(false);
    }
  };

  const initializeSocket = (accessToken: string) => {
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
      socket.emit('driver:joinSchedule', { scheduleId });
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
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed, // m/s or null
          heading: position.coords.heading, // degrees or null
          timestamp: position.timestamp,
        };

        setCurrentLocation(locationData);

        // Emit location to socket
        if (socketRef.current && connectionStatus === 'connected') {
          socketRef.current.emit('driver:locationUpdate', {
            scheduleId,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            speed: locationData.speed ? locationData.speed * 3.6 : null, // Convert m/s to km/h
            heading: locationData.heading,
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = watchId;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'disconnected':
        return 'text-gray-600';
      case 'error':
        return 'text-red-600';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-5 h-5" />;
      case 'connecting':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Navigation className="w-6 h-6" />
        Live GPS Tracking
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Connection Status */}
      {tripStatus === 'ACTIVE' && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Connection Status:</span>
            <div className={`flex items-center gap-2 ${getConnectionStatusColor()}`}>
              {getConnectionStatusIcon()}
              <span className="text-sm font-semibold capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>
      )}

      {/* Current Location */}
      {currentLocation && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Current Location</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Latitude:</span>
              <p className="font-mono font-medium">{currentLocation.latitude.toFixed(6)}</p>
            </div>
            <div>
              <span className="text-gray-600">Longitude:</span>
              <p className="font-mono font-medium">{currentLocation.longitude.toFixed(6)}</p>
            </div>
            {currentLocation.speed !== null && (
              <div>
                <span className="text-gray-600">Speed:</span>
                <p className="font-medium">{(currentLocation.speed * 3.6).toFixed(1)} km/h</p>
              </div>
            )}
            {currentLocation.heading !== null && (
              <div>
                <span className="text-gray-600">Heading:</span>
                <p className="font-medium">{currentLocation.heading.toFixed(0)}°</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {tripStatus !== 'ACTIVE' ? (
          <button
            onClick={startTrip}
            disabled={isStarting || tripStatus === 'COMPLETED'}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Starting Trip...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Start Trip
              </>
            )}
          </button>
        ) : (
          <button
            onClick={endTrip}
            disabled={isEnding}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {isEnding ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Ending Trip...
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                End Trip
              </>
            )}
          </button>
        )}
      </div>

      {/* Status Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        {tripStatus === 'PENDING' && (
          <p>Click "Start Trip" to begin sharing your location with passengers.</p>
        )}
        {tripStatus === 'ACTIVE' && (
          <p>Your location is being shared with passengers. Click "End Trip" when the journey is complete.</p>
        )}
        {tripStatus === 'COMPLETED' && (
          <p className="text-green-700 font-medium">Trip completed successfully.</p>
        )}
      </div>
    </div>
  );
};

export default DriverTracking;
