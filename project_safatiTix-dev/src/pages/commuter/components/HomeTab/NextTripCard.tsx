// commuter-dashboard/components/HomeTab/NextTripCard.tsx
import React from 'react';
import { Calendar, Clock, Bus, CreditCard, Navigation, QrCode } from 'lucide-react';

interface NextTripCardProps {
  trip: any;
  onViewTicket: () => void;
}

export default function NextTripCard({ trip, onViewTicket }: NextTripCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold">
            Your Next Trip
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="text-4xl font-bold mb-3">
              {trip.from} → {trip.to}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  Date
                </div>
                <div className="font-bold text-lg">
                  {new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Time
                </div>
                <div className="font-bold text-lg">{trip.time}</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                  <Bus className="w-4 h-4" />
                  Seat
                </div>
                <div className="font-bold text-lg">{trip.seat}</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/80">
                  <CreditCard className="w-4 h-4" />
                  <span>Total Fare</span>
                </div>
                <div className="font-bold text-2xl">RWF {trip.price?.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="flex lg:flex-col gap-3">
            <button
              onClick={onViewTicket}
              className="flex-1 lg:flex-initial bg-white text-[#0077B6] px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              View Ticket
            </button>
            <button className="flex-1 lg:flex-initial bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2">
              <Navigation className="w-5 h-5" />
              Track Bus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}