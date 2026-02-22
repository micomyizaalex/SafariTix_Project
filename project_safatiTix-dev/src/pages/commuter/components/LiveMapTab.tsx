// commuter-dashboard/components/LiveMapTab.tsx
import React, { useEffect, useRef } from 'react';
import { Bus, User, MapPin, Loader2, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTrackingStore } from '../../../stores/trackingStore';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface LiveMapTabProps {
  mapContainer: React.RefObject<HTMLDivElement>;
}

export default function LiveMapTab({ mapContainer }: LiveMapTabProps) {
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  const { 
    driverLocations, 
    fetchLocations, 
    loading: mapLoading,
    lastUpdated 
  } = useTrackingStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [30.0619, -1.9403], // Rwanda
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Initial fetch
    fetchLocations();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Fetch locations periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLocations();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchLocations]);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add new markers
    driverLocations.forEach(loc => {
      if (loc.latitude !== 0 && loc.longitude !== 0) {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.borderRadius = '50%';
        el.style.background = loc.status === 'active' ? '#0077B6' : '#94A3B8';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;">🚌</div>';

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 12px; min-width: 200px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px;">${loc.plateNumber}</div>
            <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;">
              <strong>Driver:</strong> ${loc.driverName}
            </div>
            <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;">
              <strong>Model:</strong> ${loc.model}
            </div>
            <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;">
              <strong>Speed:</strong> ${loc.speed.toFixed(1)} km/h
            </div>
            <div style="font-size: 12px; color: #4b5563;">
              <strong>Status:</strong> 
              <span style="color: ${loc.status === 'active' ? '#10b981' : '#6b7280'}; font-weight: 500;">
                ${loc.status === 'active' ? 'On Trip' : 'Idle'}
              </span>
            </div>
          </div>
        `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([loc.longitude, loc.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        markers.current[loc.id] = marker;
      }
    });

    // Fit map to show all markers
    if (driverLocations.length > 0) {
      const validLocations = driverLocations.filter(l => l.latitude !== 0 && l.longitude !== 0);
      if (validLocations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        validLocations.forEach(loc => {
          bounds.extend([loc.longitude, loc.latitude]);
        });
        map.current?.fitBounds(bounds, { padding: 50, maxZoom: 14 });
      }
    }
  }, [driverLocations]);

  const activeCount = driverLocations.filter(d => d.status === 'active').length;
  const trackingCount = driverLocations.filter(d => d.latitude !== 0 && d.longitude !== 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Live Driver Tracking</h2>
          <p className="text-gray-600 mt-1">Track active buses in real-time</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-[#0077B6] rounded-full animate-pulse"></div>
          <span className="text-gray-600">Live Updates</span>
          {lastUpdated && (
            <span className="text-xs text-gray-400 ml-2">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-600 text-sm font-semibold mb-1">Active Buses</div>
              <div className="text-3xl font-bold text-blue-900">
                {mapLoading ? '—' : activeCount}
              </div>
            </div>
            <Bus className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-600 text-sm font-semibold mb-1">Total Drivers</div>
              <div className="text-3xl font-bold text-green-900">
                {mapLoading ? '—' : driverLocations.length}
              </div>
            </div>
            <User className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-600 text-sm font-semibold mb-1">Tracking</div>
              <div className="text-3xl font-bold text-purple-900">
                {mapLoading ? '—' : trackingCount}
              </div>
            </div>
            <MapPin className="w-10 h-10 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#0077B6]" />
            Live Map View
          </h3>
        </div>

        {mapLoading && !map.current && driverLocations.length === 0 ? (
          <div className="h-[500px] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#0077B6] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : (
          <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />
        )}
      </div>

      {/* Driver List */}
      {driverLocations.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bus className="w-6 h-6 text-[#0077B6]" />
              Active Drivers ({driverLocations.length})
            </h3>
            <button
              onClick={() => fetchLocations()}
              className="text-sm text-[#0077B6] hover:underline"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {driverLocations.map((driver) => (
              <div
                key={driver.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#0077B6] hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    driver.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    🚌
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{driver.plateNumber}</div>
                    <div className="text-sm text-gray-600">{driver.driverName}</div>
                    <div className="text-xs text-gray-500">{driver.model}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    driver.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      driver.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    {driver.status === 'active' ? 'On Trip' : 'Idle'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {driver.speed?.toFixed(1) || 0} km/h
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Trips</h3>
            <p className="text-gray-600 mb-4">
              No drivers are currently sharing their location.
            </p>
            <button
              onClick={() => fetchLocations()}
              className="px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#005F8E] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}