/**
 * GPS TRACKING INTEGRATION EXAMPLES
 * 
 * This file shows how to integrate the DriverTracking and PassengerTracking
 * components into your existing SafariTix dashboards.
 */

// ============================================================================
// EXAMPLE 1: Driver Dashboard Integration
// ============================================================================

/**
 * File: src/pages/driver/DriverDashboard.tsx
 */

import React, { useState, useEffect } from 'react';
import DriverTracking from '../../components/DriverTracking';

const DriverDashboard = () => {
  const [activeSchedule, setActiveSchedule] = useState(null);
  
  useEffect(() => {
    // Fetch driver's active schedule
    fetchActiveSchedule();
  }, []);

  const fetchActiveSchedule = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:5000/api/driver/today-schedule', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    setActiveSchedule(data.schedule);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Driver Dashboard</h1>
      
      {/* Active Schedule Info */}
      {activeSchedule && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <p><strong>Route:</strong> {activeSchedule.origin} → {activeSchedule.destination}</p>
            <p><strong>Departure:</strong> {activeSchedule.departure_time}</p>
            <p><strong>Bus:</strong> {activeSchedule.bus_plate}</p>
            <p><strong>Status:</strong> {activeSchedule.status}</p>
          </div>
        </div>
      )}

      {/* GPS Tracking Component */}
      {activeSchedule && (
        <DriverTracking
          scheduleId={activeSchedule.id}
          onTripStarted={() => {
            console.log('Trip started successfully');
            fetchActiveSchedule(); // Refresh schedule data
          }}
          onTripEnded={() => {
            console.log('Trip ended successfully');
            fetchActiveSchedule(); // Refresh schedule data
          }}
        />
      )}

      {!activeSchedule && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">No active schedule for today.</p>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;


// ============================================================================
// EXAMPLE 2: Passenger Ticket Display Integration
// ============================================================================

/**
 * File: src/pages/commuter/MyTickets.tsx
 */

import React, { useState, useEffect } from 'react';
import PassengerTracking from '../../components/PassengerTracking';
import { MapPin } from 'lucide-react';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  
  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:5000/api/tickets', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    setTickets(data.tickets || []);
  };

  const canTrackBus = (ticket) => {
    // Only allow tracking if:
    // 1. Ticket is PAID/CONFIRMED
    // 2. Schedule is ACTIVE
    return (
      (ticket.status === 'CONFIRMED' || ticket.status === 'PAID') &&
      ticket.schedule_status === 'ACTIVE'
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Tickets</h1>
      
      {/* Tickets List */}
      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {ticket.origin} → {ticket.destination}
                </h3>
                <p className="text-gray-600">
                  {new Date(ticket.departure_date).toLocaleDateString()} at {ticket.departure_time}
                </p>
                <p className="text-sm text-gray-500">Seat #{ticket.seat_number}</p>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium mt-2
                  ${ticket.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                    ticket.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'}`}
                >
                  {ticket.status}
                </span>
              </div>
              
              {/* Track Bus Button */}
              {canTrackBus(ticket) && (
                <button
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setShowTracking(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Track Bus
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tracking Modal */}
      {showTracking && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Live Bus Tracking</h2>
              <button
                onClick={() => setShowTracking(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <PassengerTracking
              scheduleId={selectedTicket.schedule_id}
              ticketId={selectedTicket.id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;


// ============================================================================
// EXAMPLE 3: Inline Tracking in Commuter Dashboard
// ============================================================================

/**
 * File: src/pages/commuter/commuterDashboard.tsx
 * 
 * Add this section to show tracking for active trips
 */

const CommuterDashboardSection = () => {
  const [activeTrips, setActiveTrips] = useState([]);

  // Fetch tickets with ACTIVE schedules
  useEffect(() => {
    const fetchActiveTrips = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/tickets', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      
      // Filter for confirmed tickets with active schedules
      const active = (data.tickets || []).filter(
        t => t.status === 'CONFIRMED' && t.schedule_status === 'ACTIVE'
      );
      setActiveTrips(active);
    };
    
    fetchActiveTrips();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveTrips, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Active Trips Section */}
      {activeTrips.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">🚌 Your Active Trips</h2>
          
          {activeTrips.map((trip) => (
            <div key={trip.id} className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {trip.origin} → {trip.destination}
                  </h3>
                  <p className="text-sm opacity-90">
                    Departure: {trip.departure_time} • Seat #{trip.seat_number}
                  </p>
                </div>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              
              {/* Embedded Tracking */}
              <PassengerTracking
                scheduleId={trip.schedule_id}
                ticketId={trip.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// ============================================================================
// EXAMPLE 4: Conditional Rendering Based on Schedule Status
// ============================================================================

/**
 * Show different UI based on trip phase
 */

const TripStatusDisplay = ({ schedule, ticket }) => {
  // PENDING: Show countdown to departure
  if (schedule.status === 'PENDING') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          🕐 Trip starts at {schedule.departure_time}
        </p>
        <p className="text-sm text-yellow-600 mt-1">
          GPS tracking will be available once the driver starts the trip.
        </p>
      </div>
    );
  }

  // ACTIVE: Show live tracking
  if (schedule.status === 'ACTIVE') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 mb-3">
          🚌 Your bus is on the way! Track it live:
        </p>
        <PassengerTracking
          scheduleId={schedule.id}
          ticketId={ticket.id}
        />
      </div>
    );
  }

  // COMPLETED: Show trip history
  if (schedule.status === 'COMPLETED') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800">
          ✅ Trip completed successfully!
        </p>
        <p className="text-sm text-green-600 mt-1">
          Thank you for traveling with SafariTix.
        </p>
      </div>
    );
  }

  return null;
};


// ============================================================================
// BACKEND UTILITIES
// ============================================================================

/**
 * File: backend/utils/scheduleHelper.js
 * 
 * Helper functions for managing schedule status
 */

const updateScheduleStatus = async (scheduleId, status, pool) => {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE schedules SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, scheduleId]
    );
    console.log(`Schedule ${scheduleId} status updated to ${status}`);
  } finally {
    client.release();
  }
};

// Auto-complete trips that are past their arrival time
const autoCompleteOldTrips = async (pool) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      UPDATE schedules
      SET status = 'COMPLETED', updated_at = NOW()
      WHERE status = 'ACTIVE'
        AND (schedule_date + arrival_time::time) < NOW()
      RETURNING id
    `);
    
    if (result.rowCount > 0) {
      console.log(`Auto-completed ${result.rowCount} old trip(s)`);
      
      // Clean up location data
      await client.query(`
        DELETE FROM live_bus_locations
        WHERE schedule_id IN (
          SELECT unnest($1::uuid[])
        )
      `, [result.rows.map(r => r.id)]);
    }
  } finally {
    client.release();
  }
};

// Run every hour
setInterval(() => autoCompleteOldTrips(pool), 60 * 60 * 1000);


// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * Manual Testing Steps:
 * 
 * DRIVER SIDE:
 * 1. Login as driver
 * 2. Navigate to today's schedule
 * 3. Click "Start Trip" button
 * 4. Grant location permission when prompted
 * 5. Verify:
 *    - Green "Connected" status appears
 *    - Current coordinates displayed
 *    - Speed/heading shown (when moving)
 * 6. Click "End Trip" button
 * 7. Verify schedule status changed to COMPLETED
 * 
 * PASSENGER SIDE:
 * 1. Login as passenger (different browser/incognito)
 * 2. Ensure ticket status = CONFIRMED/PAID
 * 3. Navigate to tickets page
 * 4. Click "Track Bus" button
 * 5. Verify:
 *    - Map loads with OpenStreetMap tiles
 *    - Blue bus marker appears at driver's location
 *    - Marker moves in real-time as driver moves
 *    - Info overlay shows coordinates & speed
 * 6. Try "Re-center" button → map centers on bus
 * 7. Click "Stop Tracking" → disconnects socket
 * 
 * SECURITY TESTS:
 * 1. Try tracking without authentication → Should fail
 * 2. Try tracking with PENDING ticket → Should fail
 * 3. Try tracking PENDING schedule → Should fail
 * 4. Try emitting location as non-owner driver → Should fail
 * 
 * EDGE CASES:
 * 1. Driver loses internet → Should show disconnected status
 * 2. Passenger loses internet → Should show connection error
 * 3. Driver ends trip → Passengers should see disconnection
 * 4. Multiple passengers tracking same bus → All should see updates
 */

console.log('GPS Tracking integration examples ready!');
console.log('Refer to LEAFLET_GPS_TRACKING.md for complete documentation');
