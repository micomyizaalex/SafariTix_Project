import React from 'react';
import { MapPin } from 'lucide-react';
import { BusLocation } from './types';

interface Props {
  busLocations: BusLocation[];
}

export const LiveFleetMap: React.FC<Props> = ({ busLocations }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#0077B6]" />
          Live Fleet Tracking
        </h2>
      </div>
      <div className="p-6">
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 relative overflow-hidden" style={{ height: '300px' }}>
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,30 50,50 T100,50" stroke="currentColor" fill="none" strokeWidth="0.5" />
              <path d="M0,60 Q25,40 50,60 T100,60" stroke="currentColor" fill="none" strokeWidth="0.5" />
              <path d="M0,70 Q25,50 50,70 T100,70" stroke="currentColor" fill="none" strokeWidth="0.5" />
            </svg>
          </div>

          {busLocations.map((bus, index) => (
            <div
              key={bus.id}
              className="absolute bg-white rounded-lg shadow-lg p-3 cursor-pointer hover:shadow-xl transition-all group"
              style={{ left: `${20 + index * 25}%`, top: `${30 + index * 15}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  bus.status === 'active' ? 'bg-green-500 animate-pulse' :
                  bus.status === 'delayed' ? 'bg-yellow-500' :
                  bus.status === 'full' ? 'bg-blue-500' :
                  'bg-gray-300'
                }`} />
                <span className="text-xs font-bold text-gray-900">{bus.busNumber}</span>
              </div>

              <div className="hidden group-hover:block absolute left-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-2 w-48 z-10">
                <p className="font-bold mb-1">{bus.busNumber}</p>
                <p>Driver: {bus.driver}</p>
                <p>Route: {bus.route}</p>
                <p>Next: {bus.nextStop}</p>
                <p className="mt-1 pt-1 border-t border-gray-700">Status: <span className={
                  bus.status === 'active' ? 'text-green-400' :
                  bus.status === 'delayed' ? 'text-yellow-400' :
                  'text-blue-400'
                }>{bus.status}</span></p>
              </div>
            </div>
          ))}

          <div className="absolute bottom-4 left-4 flex gap-3 text-xs">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Active</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Delayed</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Full</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveFleetMap;
