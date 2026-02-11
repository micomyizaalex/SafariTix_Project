import React from 'react';
import { Clock, Calendar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { UpcomingTrip } from './types';

interface Props {
  upcomingTrips: UpcomingTrip[];
}

export const UpcomingTrips: React.FC<Props> = ({ upcomingTrips }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0077B6]" />
            Upcoming Trips Today
          </h2>
          <button className="text-sm text-[#0077B6] hover:text-[#005F8E] font-medium">View All →</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {upcomingTrips.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bus #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Departure</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Seats Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {upcomingTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{trip.route}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{trip.busNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{trip.departure}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      trip.status === 'on-time' ? 'bg-green-50 text-green-700' :
                      trip.status === 'delayed' ? 'bg-yellow-50 text-yellow-700' :
                      trip.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {trip.status === 'on-time' && <CheckCircle className="w-3 h-3" />}
                      {trip.status === 'delayed' && <AlertTriangle className="w-3 h-3" />}
                      {trip.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{trip.seatsLeft}</span>
                      <span className="text-xs text-gray-500">/ {trip.totalSeats}</span>
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            (trip.seatsLeft / trip.totalSeats) > 0.5 ? 'bg-green-500' :
                            (trip.seatsLeft / trip.totalSeats) > 0.2 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${(trip.seatsLeft / trip.totalSeats) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No trips scheduled for today</p>
            <p className="text-sm mt-1">Create a new schedule to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingTrips;
