import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Calendar, Clock, ChevronRight } from 'lucide-react';

export type PopularRoute = {
  id: number;
  from: string;
  to: string;
  departureDate: string; // ISO date e.g. 2024-02-15
  departureTime: string; // e.g. "08:00 AM"
  duration?: string; // e.g. "2h 30min"
  price: number; // in RWF
  availableSeats: number;
  totalSeats: number;
  company?: string;
  popular?: boolean;
};

type Props = {
  routes?: PopularRoute[];
  className?: string;
  onSelect?: (r: PopularRoute) => void;
};

// Small date helpers
const fmtDate = (isoDate: string) => {
  try {
    const d = new Date(isoDate + 'T00:00:00');
    const today = new Date();
    const td = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diff = Math.floor((d.getTime() - td.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return isoDate;
  }
};

const formatPrice = (p: number) => `RWF ${p.toLocaleString()}`;

export default function PopularRoutes({ routes = [], className = '', onSelect }: Props) {
  const navigate = useNavigate();

  const list = useMemo(() => routes, [routes]);

  const onBook = (r: PopularRoute) => {
    if (typeof onSelect === 'function') {
      onSelect(r);
      return;
    }
    // fallback: navigate to booking with preselected route id
    navigate(`/booking?routeId=${r.id}`);
  };

  if (!list || list.length === 0) {
    return (
      <div className={`max-w-7xl mx-auto ${className}`}>
        <div className="text-center py-12 text-slate-500">No popular routes found.</div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((r) => {
          const filled = Math.max(0, r.totalSeats - r.availableSeats);
          const percent = r.totalSeats > 0 ? Math.round((filled / r.totalSeats) * 100) : 0;
          const urgency = r.availableSeats < 5;
          const occupancyColor = r.availableSeats > 15 ? 'bg-emerald-500' : (r.availableSeats >= 5 ? 'bg-amber-500' : 'bg-red-500');

          return (
            <article
              key={r.id}
              className="relative bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
              aria-labelledby={`route-${r.id}`}
            >
              {/* Top row: route + optional bus icon */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 id={`route-${r.id}`} className="text-lg lg:text-xl font-extrabold text-slate-900">
                    {r.from} <span className="mx-2 text-slate-400">→</span> {r.to}
                  </h3>
                  {r.company && <div className="text-xs text-slate-500 mt-1">{r.company}</div>}
                </div>
                <div className="flex items-start gap-2">
                  {r.popular && (
                    <span className="text-xs font-bold bg-[#0077B6] text-white px-2 py-0.5 rounded-full">Popular</span>
                  )}
                  {urgency && (
                    <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">Only {r.availableSeats} left!</span>
                  )}
                  <div className="w-10 h-10 rounded-lg bg-[#0077B6]/10 flex items-center justify-center">
                    <Bus className="w-5 h-5 text-[#0077B6]" />
                  </div>
                </div>
              </div>

              {/* Date and time */}
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0077B6]" />
                  <span className="font-semibold text-slate-900">{fmtDate(r.departureDate)}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0077B6]" />
                  <span className="font-semibold text-slate-900">{r.departureTime}</span>
                </div>
                {r.duration && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">•</span>
                    <span className="text-sm">{r.duration}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Price</div>
                  <div className="text-lg font-extrabold text-slate-900">{formatPrice(r.price)} <span className="text-sm font-medium text-slate-500">/ seat</span></div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Seats</div>
                  <div className="text-lg font-extrabold text-slate-900">{r.availableSeats}/{r.totalSeats}</div>
                </div>
              </div>

              {/* Occupancy progress */}
              <div className="mt-4">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${occupancyColor} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percent}%` }}
                    aria-hidden
                  />
                </div>
                <div className="mt-2 text-sm text-slate-600 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900">{filled}/{r.totalSeats}</span>
                    <span className="text-slate-500"> filled</span>
                  </div>
                  <div className="text-sm text-slate-500">{r.availableSeats} seats available</div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => onBook(r)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#0077B6] to-[#00A8E8] text-white px-4 py-2 rounded-lg font-bold hover:opacity-95 transition"
                >
                  Book Now
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/routes/${r.id}`)}
                  className="text-sm text-slate-600 hover:text-[#0077B6] transition"
                >
                  View Details
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
