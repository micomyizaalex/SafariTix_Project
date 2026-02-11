import React, { useEffect, useMemo, useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';

type SeatState = 'AVAILABLE' | 'LOCKED' | 'BOOKED';

type Seat = {
  id?: number | string;
  seat_number: string;
  row?: number;
  col?: number;
  side?: 'L' | 'R' | 'l' | 'r';
  state: SeatState;
  lock_expires_at?: string | null;
};

type SeatMapProps = {
  scheduleId: string | number;
  price?: number;
  className?: string;
  onBooked?: (result: any) => void;
};

export default function SeatMap({ scheduleId, price = 0, className = '', onBooked }: SeatMapProps) {
  const { user, accessToken } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [locking, setLocking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchSeats = async () => {
    setLoading(true);
    setError(null);
    try {
      const hdrs: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) hdrs['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch(`/api/seats/schedules/${scheduleId}`, { headers: hdrs });
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed to load seats (${res.status})`);
      }
      if (!ct.includes('application/json')) {
        throw new Error('Seat endpoint returned non-JSON response');
      }
      const json = await res.json();
      const returned: Seat[] = Array.isArray(json.seats) ? json.seats : json.seats || [];
      
      const seatMap = new Map<string, Seat>();
      returned.forEach((s) => seatMap.set(String(s.seat_number), s));

      const organized: Seat[] = [];
      
      for (let i = 1; i <= 29; i++) {
        const seatNum = String(i);
        const existing = seatMap.get(seatNum);
        
        if (existing) {
          organized.push(existing);
        } else {
          organized.push({
            seat_number: seatNum,
            state: 'BOOKED'
          } as Seat);
        }
      }

      setSeats(organized);
    } catch (err: any) {
      console.error('fetchSeats error', err);
      setError(err.message || 'Failed to load seats');
      
      const fallback: Seat[] = [];
      for (let i = 1; i <= 29; i++) {
        fallback.push({ seat_number: String(i), state: 'BOOKED' } as Seat);
      }
      setSeats(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!scheduleId) return;
    fetchSeats();
  }, [scheduleId, accessToken]);

  const toggleSelect = (seatNum: string, seatState: SeatState) => {
    if (seatState !== 'AVAILABLE') return;
    setSelected((s) => ({ ...s, [seatNum]: !s[seatNum] }));
  };

  const handleKey = (e: React.KeyboardEvent, seatNum: string, state: SeatState) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSelect(seatNum, state);
    }
  };

  const confirmBooking = async () => {
    const picks = Object.keys(selected).filter(k => selected[k]);
    if (picks.length === 0) {
      setError('Select at least one seat');
      return;
    }
    setError(null);
    setLocking(true);
    const results: any[] = [];
    const errs: string[] = [];
    try {
      const hdrs: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) hdrs['Authorization'] = `Bearer ${accessToken}`;
      for (const seatNum of picks) {
        const body = { seat_number: seatNum, passenger_id: user?.id, price };
        try {
          const res = await fetch(`/api/seats/schedules/${scheduleId}/lock`, {
            method: 'POST',
            headers: hdrs,
            body: JSON.stringify(body)
          });
          if (!res.ok) {
            const txt = await res.text();
            errs.push(`Seat ${seatNum}: ${txt || res.statusText}`);
            continue;
          }
          const json = await res.json();
          results.push({ seat: seatNum, ...json });
        } catch (err: any) {
          errs.push(`Seat ${seatNum}: ${err.message || 'Failed'}`);
        }
      }

      if (errs.length > 0) {
        setError(errs.join('; '));
      }
      setResult({ results, errors: errs });
      if (onBooked) onBooked({ results, errors: errs });
      
      await fetchSeats();
      
      const successSeats = results.map((r) => String(r.ticket_id || r.lock_id || r.seat_number));
      setSelected((prev) => {
        const copy = { ...prev };
        for (const s of successSeats) delete copy[s];
        return copy;
      });
    } finally {
      setLocking(false);
    }
  };

  const layout = useMemo(() => {
    const seatsByNum = new Map<number, Seat>();
    seats.forEach(s => seatsByNum.set(parseInt(s.seat_number), s));

    return {
      frontRight: seatsByNum.get(1),
      rows: [
        { left: [2, 3], right: [4, 5] },
        { left: [6, 7], right: [8, 9] },
        { left: [10, 11], right: [12, 13] },
        { left: [14, 15], right: [16, 17] },
        { left: [18, 19], right: [20, 21] },
        { left: [22, 23], right: [24, 25] },
        { left: [26, 27], right: [28, 29] },
      ].map(row => ({
        left: row.left.map(n => seatsByNum.get(n)).filter(Boolean) as Seat[],
        right: row.right.map(n => seatsByNum.get(n)).filter(Boolean) as Seat[],
      }))
    };
  }, [seats]);

  const selectedSeats = Object.keys(selected).filter(k => selected[k]);
  const selectedCount = selectedSeats.length;
  const totalPrice = selectedCount * price;

  const renderSeat = (seat: Seat | undefined) => {
    if (!seat) return null;
    
    const id = String(seat.seat_number);
    const st = seat.state;
    const isSelected = !!selected[id];
    
    return (
      <button
        key={id}
        onClick={() => toggleSelect(id, st)}
        onKeyDown={(e) => handleKey(e, id, st)}
        disabled={st !== 'AVAILABLE'}
        aria-pressed={isSelected}
        aria-label={`Seat ${id} ${st.toLowerCase()}`}
        className={`
          w-full aspect-square rounded-lg flex items-center justify-center
          font-bold text-xs transition-all duration-150
          ${st === 'BOOKED'
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : st === 'LOCKED'
            ? 'bg-yellow-100 border-2 border-yellow-400 text-yellow-700 cursor-not-allowed'
            : isSelected
            ? 'bg-[#0077B6] text-white shadow-md scale-105 ring-1 ring-[#0077B6]/30'
            : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-[#0077B6] hover:shadow-sm hover:scale-105 active:scale-95'
          }
        `}
      >
        {id}
      </button>
    );
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Header - ULTRA COMPACT */}
      <div className="bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-t-xl p-2 text-white">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
          <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center text-xs">
            🚌
          </div>
          Select Seat
        </h3>
        
        <div className="grid grid-cols-4 gap-1 text-[10px]">
          <div className="flex items-center gap-1 bg-white/10 rounded p-1">
            <div className="w-3 h-3 rounded bg-white"></div>
            <span>Free</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 rounded p-1">
            <div className="w-3 h-3 rounded bg-[#0077B6] border border-white"></div>
            <span>Pick</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 rounded p-1">
            <div className="w-3 h-3 rounded bg-gray-400"></div>
            <span>Taken</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 rounded p-1">
            <div className="w-3 h-3 rounded bg-yellow-400"></div>
            <span>Lock</span>
          </div>
        </div>
      </div>

      {/* Bus Interior - ULTRA COMPACT */}
      <div className="bg-gradient-to-b from-gray-50 to-white rounded-b-xl shadow-lg border-x-2 border-b-2 border-gray-300">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-[#0077B6] animate-spin mb-2" />
            <p className="text-gray-600 text-xs">Loading...</p>
          </div>
        ) : (
          <div className="p-2.5">
            {/* Windshield */}
            <div className="mb-2">
              <div className="h-1.5 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded-t-full mx-4"></div>
            </div>

            {/* Front Row - Driver + Seat 1 */}
            <div className="mb-2.5">
              <div className="flex items-center gap-2 justify-center">
                {/* Driver */}
                <div className="w-11">
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center shadow-md border border-gray-700">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-center text-[9px] font-semibold text-gray-600 mt-0.5">
                    Driver
                  </div>
                </div>

                {/* Aisle */}
                <div className="w-12 h-11 flex items-center justify-center">
                  <div className="w-px h-full bg-gray-300"></div>
                </div>

                {/* Seat 1 */}
                <div className="w-11">
                  {renderSeat(layout.frontRight)}
                </div>
              </div>
            </div>

            {/* Passenger Rows - TIGHTER */}
            <div className="space-y-1.5">
              {layout.rows.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2 justify-center">
                  {/* Left Seats */}
                  <div className="flex gap-1">
                    {row.left.map(seat => (
                      <div key={seat.seat_number} className="w-11">
                        {renderSeat(seat)}
                      </div>
                    ))}
                  </div>

                  {/* Aisle */}
                  <div className="w-12 h-11 flex items-center justify-center">
                    <div className="w-px h-full bg-gray-300"></div>
                  </div>

                  {/* Right Seats */}
                  <div className="flex gap-1">
                    {row.right.map(seat => (
                      <div key={seat.seat_number} className="w-11">
                        {renderSeat(seat)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bus Back */}
            <div className="mt-2">
              <div className="h-2 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-lg mx-4"></div>
            </div>
          </div>
        )}
      </div>

      {/* Selection Summary - ULTRA COMPACT */}
      {selectedCount > 0 && (
        <div className="mt-2.5 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-lg p-2.5 text-white shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] opacity-90 mb-0.5">Seats</div>
              <div className="text-sm font-bold mb-0.5 truncate">{selectedSeats.join(', ')}</div>
              <div className="text-xs">
                <span className="font-bold">RWF {totalPrice.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex gap-1.5">
              <button
                onClick={() => setSelected({})}
                className="bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-white/30 transition-all border border-white/30"
              >
                Clear
              </button>
              <button
                onClick={confirmBooking}
                disabled={locking}
                className="bg-white text-[#0077B6] px-4 py-1.5 rounded-md text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {locking ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Wait...
                  </>
                ) : (
                  'Book'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refresh - ULTRA COMPACT */}
      {!selectedCount && !loading && (
        <div className="mt-2.5 flex justify-center">
          <button
            onClick={fetchSeats}
            className="bg-gray-100 text-gray-900 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-200 transition-all flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      )}

      {/* Messages - ULTRA COMPACT */}
      {error && (
        <div className="mt-2.5 bg-red-50 border border-red-200 rounded-lg p-2">
          <div className="flex items-start gap-1.5">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">!</span>
            </div>
            <div>
              <div className="font-semibold text-red-900 text-xs">Error</div>
              <div className="text-[10px] text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {result && result.errors && result.errors.length > 0 && (
        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <div className="flex items-start gap-1.5">
            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">!</span>
            </div>
            <div>
              <div className="font-semibold text-yellow-900 text-xs">Warning</div>
              <div className="text-[10px] text-yellow-700">{result.errors.join('; ')}</div>
            </div>
          </div>
        </div>
      )}

      {result && result.results && result.results.length > 0 && !result.errors?.length && (
        <div className="mt-2.5 bg-green-50 border border-green-200 rounded-lg p-2">
          <div className="flex items-start gap-1.5">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-green-900 text-xs">Success!</div>
              <div className="text-[10px] text-green-700">
                {result.results.length} seat(s) booked
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}