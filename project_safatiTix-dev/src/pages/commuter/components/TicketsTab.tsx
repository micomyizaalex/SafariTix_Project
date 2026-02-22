// commuter-dashboard/components/TicketsTab.tsx
import React from 'react';
import { Plus, Ticket, History, Bus, Check, QrCode, Calendar, Clock } from 'lucide-react';

interface TicketsTabProps {
  upcomingTrips: any[];
  recentBookings: any[];
  onViewTicket: (ticket: any) => void;
  onBookNew: () => void;
}

export default function TicketsTab({ upcomingTrips, recentBookings, onViewTicket, onBookNew }: TicketsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">My Tickets</h2>
        <button
          onClick={onBookNew}
          className="bg-[#0077B6] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#005F8E] transition-all duration-300 flex items-center gap-2"
        >
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
        
        {upcomingTrips.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No upcoming trips. Book your next adventure!
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingTrips.map((trip) => (
              <div
                key={trip.id}
                className="border-2 border-gray-100 rounded-xl p-6 hover:border-[#0077B6] hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => onViewTicket(trip)}
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
                        <div className="text-sm text-gray-500">Bus #{trip.bus || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Date</div>
                        <div className="font-semibold text-gray-900">
                          {new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Time</div>
                        <div className="font-semibold text-gray-900">{trip.time}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Seat</div>
                        <div className="font-semibold text-gray-900">#{trip.seat || 'TBD'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Price</div>
                        <div className="font-semibold text-[#0077B6]">
                          RWF {trip.price?.toLocaleString() || '0'}
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
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-6 h-6 text-[#0077B6]" />
          Recent Bookings
        </h3>
        
        <div className="space-y-3">
          {recentBookings.slice(0, 5).map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => onViewTicket(booking)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Bus className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{booking.from} → {booking.to}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(booking.date).toLocaleDateString()} • {booking.time}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-gray-900">RWF {booking.price?.toLocaleString() || '0'}</div>
                <div className={`text-xs font-semibold ${
                  booking.status === 'CONFIRMED' ? 'text-green-600' :
                  booking.status === 'CANCELLED' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {booking.status || 'Pending'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}