import React, { useMemo } from 'react';
import { Bus, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type SearchResult = {
  id: number | string;
  routeFrom?: string;
  routeTo?: string;
  from?: string;
  to?: string;
  departureTime?: string; // ISO or time string
  arrivalTime?: string; // ISO
  date?: string; // ISO date
  duration?: string;
  price?: number;
  seatsAvailable?: number;
  availableSeats?: number;
  totalSeats?: number;
  soldSeats?: number;
  busType?: string; // e.g. 'B' => Business
  company?: string;
};

type Props = {
  results: SearchResult[];
  onSelect?: (r: SearchResult) => void;
  className?: string;
};

const formatCurrency = (n?: number) => `RWF ${Number(n || 0).toLocaleString()}`;

const parseDateLabel = (iso?: string) => {
  if (!iso) return '';
  try {
    // Accept ISO date or ISO datetime; if time-only provided, return '' (time handled separately)
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const today = new Date();
    const td = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diff = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - td.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

const formatTime = (value?: string) => {
  if (!value) return '—';
  // If value looks like an ISO datetime or contains 'T' or 'Z' parse as date
  if (value.includes('T') || value.toUpperCase().endsWith('Z') || value.match(/\d{4}-\d{2}-\d{2}/)) {
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {}
  }
  // If it's already a time string like '08:15' or '08:15 AM', normalize/return
  const t = value.trim();
  // If it contains AM/PM, return as-is
  if (/\bAM\b|\bPM\b/i.test(t)) return t;
  // If matches HH:MM, return as-is
  if (/^\d{1,2}:\d{2}$/.test(t)) return t;
  // Fallback: try parsing with Date
  try {
    const d = new Date(t);
    if (!isNaN(d.getTime())) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {}
  return value;
};

const calcDuration = (dep?: string | Date, arr?: string | Date) => {
  if (!dep || !arr) return null;
  const d = new Date(dep);
  const a = new Date(arr);
  if (isNaN(d.getTime()) || isNaN(a.getTime())) return null;
  const diff = Math.max(0, a.getTime() - d.getTime());
  const mins = Math.round(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`;
};

const mapBusType = (t?: string) => {
  if (!t) return '';
  const tt = String(t).toLowerCase();
  if (tt === 'b' || tt.includes('business')) return 'Business';
  if (tt === 'p' || tt.includes('premium')) return 'Premium';
  if (tt === 's' || tt.includes('standard')) return 'Standard';
  return t;
};

export default function SearchResults({ results, onSelect, className = '' }: Props) {
  const navigate = useNavigate();

  const list = useMemo(() => results || [], [results]);

  if (!list.length) return <div className={`text-center py-6 text-slate-500 ${className}`}>No schedules found.</div>;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {list.map((s) => {
        const total = Number(s.totalSeats ?? s.total_seats ?? s.capacity ?? 0);
        const available = Number(s.seatsAvailable ?? s.availableSeats ?? s.available_seats ?? s.available ?? s.seats ?? 0);
        const filled = Math.max(0, total - available);
        const sold = Number(s.soldSeats ?? s.sold_seats ?? filled);
        const percentSold = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;
        const low = available > 0 && available < 5;
        const plenty = available >= 20;
        const soldOut = available <= 0;
        // robust route/location extraction
        const from = s.routeFrom || s.from || s.from_location || s.origin || (s.departure && s.departure.location) || s.from_location_name || s.start || s.origin_name || '';
        const to = s.routeTo || s.to || s.to_location || s.destination || (s.arrival && s.arrival.location) || s.to_location_name || s.end || s.destination_name || '';
        const company = s.company || (s.operator && String(s.operator)) || s.companyName || '';

        // date/time handling: prefer explicit date field, else extract from departureTime if it contains a date
        const dateIso = s.date || s.schedule_date || s.departureDate || (s.departureTime && /\d{4}-\d{2}-\d{2}/.test(String(s.departureTime)) ? String(s.departureTime) : undefined);
        const dateLabel = parseDateLabel(dateIso);
        const timeLabel = formatTime(s.departureTime || s.departure_time || s.time || '');
        const duration = s.duration || calcDuration(s.departureTime || s.date, s.arrivalTime || s.arrival_time) || s.duration || '—';

        return (
          <article key={s.id} className={`relative bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 ${soldOut ? 'opacity-60' : ''}`}>
            {soldOut && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white text-xl font-bold">Sold Out</div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg lg:text-xl font-extrabold text-slate-900">
                  {(from || 'Unknown')} <span className="mx-2 text-slate-400">→</span> {(to || 'Unknown')}
                </h3>
                <div className="text-xs text-slate-500 mt-1">{company}</div>
              </div>
              <div className="flex items-start gap-2">
                {plenty && <span className="text-xs font-bold bg-[#27AE60] text-white px-2 py-0.5 rounded-full">✓ Plenty available</span>}
                {low && <span className="text-xs font-bold bg-[#E63946] text-white px-2 py-0.5 rounded-full">⚠️ Only {available} left!</span>}
                <div className="w-10 h-10 rounded-lg bg-[#0077B6]/10 flex items-center justify-center">
                  <Bus className="w-5 h-5 text-[#0077B6]" />
                </div>
              </div>
            </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0077B6]" />
                    <span className="font-semibold text-slate-900">{dateLabel || '—'}</span>
              </div>
            </div>

                <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0077B6]" />
                    <span className="font-semibold text-slate-900">{timeLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-slate-400">•</span>
                    <span>{duration}</span>
              </div>
              {s.busType && (
                <div className="ml-auto text-sm text-slate-500">{mapBusType(s.busType)}</div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Price</div>
                <div className="text-lg font-extrabold text-slate-900">{formatCurrency(s.price)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Availability</div>
                <div className="text-lg font-extrabold text-slate-900">{available} of {total} seats</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className={`${available > 15 ? 'bg-emerald-500' : (available >= 5 ? 'bg-amber-500' : 'bg-red-500')} h-2 rounded-full transition-all duration-300`} style={{ width: `${percentSold}%` }} />
              </div>
              <div className="mt-2 text-sm text-slate-600 flex items-center justify-between">
                <div className="text-slate-900 font-semibold">{percentSold}% sold</div>
                <div className="text-slate-500">{available} seats available</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => onSelect ? onSelect(s) : navigate(`/booking?scheduleId=${s.id}`)}
                disabled={soldOut}
                className={`flex items-center gap-2 ${soldOut ? 'bg-slate-300 text-slate-600' : 'bg-gradient-to-r from-[#0077B6] to-[#00A8E8] text-white'} px-4 py-2 rounded-lg font-bold transition`}
              >
                Select Seats & Book
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="text-sm text-slate-600">{s.busType ? mapBusType(s.busType) : ''}</div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
