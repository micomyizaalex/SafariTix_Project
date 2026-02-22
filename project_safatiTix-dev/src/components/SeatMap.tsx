// components/SeatMap.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSeatsStore } from '../stores/seatsStore';
import { useNavigate } from 'react-router-dom';

type SeatState = 'AVAILABLE' | 'LOCKED' | 'BOOKED' | 'DRIVER';

type Seat = {
  id?: number | string;
  seat_number: string;
  row?: number;
  col?: number;
  side?: 'L' | 'R' | 'l' | 'r';
  state: SeatState;
  is_driver?: boolean;
  lock_expires_at?: string | null;
};

type SeatMapProps = {
  scheduleId: string | number;
  price?: number;
  className?: string;
  onBooked?: (result: any) => void;
  onSelect?: (seat: any, lock?: any) => void;
  scheduleDetails?: {
    routeFrom: string;
    routeTo: string;
    departureTime: string;
    scheduleDate: string;
    busPlateNumber: string;
    companyName: string;
  };
  selectedSeatsMap?: Record<string, boolean>;
  setSelectedSeatsMap?: (seats: Record<string, boolean>) => void;
};

export default function SeatMap({ 
  scheduleId, 
  price = 0, 
  className = '', 
  onBooked, 
  onSelect, 
  scheduleDetails,
  selectedSeatsMap = {},
  setSelectedSeatsMap
}: SeatMapProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const { 
    seats, 
    loading, 
    error: storeError,
    fetchSeats,
    lockSeats,
    clearError 
  } = useSeatsStore();
  
  const [localSeats, setLocalSeats] = useState<Seat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>(selectedSeatsMap);

  // Sync with parent component's selected seats if provided
  useEffect(() => {
    if (setSelectedSeatsMap) {
      setSelectedSeatsMap(selected);
    }
  }, [selected, setSelectedSeatsMap]);

  // Transform store seats to local format
  useEffect(() => {
    if (seats.length > 0) {
      // Derive total seats from response or default to 29
      const totalSeats = 29; // You might want to get this from props or API
      
      const seatMap = new Map<string, Seat>();
      seats.forEach(seat => {
        seatMap.set(seat.seat_number, seat);
      });

      const organized: Seat[] = [];
      for (let i = 1; i <= totalSeats; i++) {
        const seatNum = String(i);
        const existing = seatMap.get(seatNum);
        if (existing) {
          organized.push(existing);
        } else {
          organized.push({ seat_number: seatNum, state: 'AVAILABLE' } as Seat);
        }
      }

      setLocalSeats(organized);
      
      // Log state verification
      const availCount = organized.filter(s => s.state === 'AVAILABLE').length;
      const bookedCount = organized.filter(s => s.state === 'BOOKED').length;
      const lockedCount = organized.filter(s => s.state === 'LOCKED').length;
      
      console.log(`\n🎫 SEAT MAP LOADED ====================`);
      console.log(`Schedule: ${scheduleId}`);
      console.log(`Total seats: ${organized.length}`);
      console.log(`Available: ${availCount}`);
      console.log(`Booked: ${bookedCount} 🔴`);
      console.log(`Locked: ${lockedCount} 🟡`);
      if (bookedCount > 0) {
        const bookedSeats = organized.filter(s => s.state === 'BOOKED').map(s => s.seat_number).join(', ');
        console.log(`Booked seats: ${bookedSeats}`);
      }
      console.log(`======================================\n`);
    }
  }, [seats, scheduleId]);

  // Fetch seats on mount and set up auto-refresh
  useEffect(() => {
    if (!scheduleId) return;
    
    fetchSeats(String(scheduleId));
    
    // Auto-refresh every 5 seconds for real-time updates
    const intervalId = setInterval(async () => {
      setRefreshing(true);
      await fetchSeats(String(scheduleId));
      setRefreshing(false);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [scheduleId, fetchSeats]);

  // Handle store errors
  useEffect(() => {
    if (storeError) {
      setError(storeError);
    }
  }, [storeError]);

  const toggleSelect = (seatNum: string, seatState: SeatState) => {
    console.log(`👆 Clicked seat ${seatNum} (state: ${seatState})`);
    
    // Prevent selecting driver seats
    if (seatState === 'DRIVER') {
      console.log(`⛔ Cannot select driver seat ${seatNum}`);
      return;
    }
    
    if (seatState !== 'AVAILABLE') {
      console.log(`⛔ Cannot select seat ${seatNum} - Status: ${seatState}`);
      return;
    }
    
    console.log(`✅ Toggling seat ${seatNum}`);
    setSelected((prev) => {
      const newSelection = { ...prev, [seatNum]: !prev[seatNum] };
      console.log('Updated selection:', Object.keys(newSelection).filter(k => newSelection[k]));
      return newSelection;
    });
    
    // Legacy callback support
    if (onSelect) {
      const seat = localSeats.find(st => st.seat_number === seatNum);
      if (seat) {
        onSelect(seat, null);
      }
    }
  };

  const handleKey = (e: React.KeyboardEvent, seatNum: string, state: SeatState) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSelect(seatNum, state);
    }
  };

  const confirmBooking = async () => {
    const picks = Object.keys(selected).filter(k => selected[k]);
    
    console.log('🎫 Book button clicked');
    console.log('Selected seats:', picks);
    console.log('Schedule ID:', scheduleId);
    console.log('Price per seat:', price);
    
    if (picks.length === 0) {
      setError('Please select at least one seat to continue');
      console.warn('⚠️ No seats selected');
      return;
    }
    
    if (!user) {
      setError('Please login to book seats');
      console.warn('⚠️ User not authenticated');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    setError(null);
    console.log('✅ Navigating to payment page...');
    
    try {
      navigate('/dashboard/commuter/payment', {
        state: {
          selectedSeats: picks,
          scheduleId,
          price,
          scheduleDetails
        }
      });
      console.log('✅ Navigation initiated');
    } catch (err) {
      console.error('❌ Navigation error:', err);
      setError('Failed to proceed to payment. Please try again.');
    }
  };

  // Expose refresh function for external use
  useEffect(() => {
    if (onBooked) {
      (window as any).__refreshSeatMap = () => {
        setRefreshing(true);
        fetchSeats(String(scheduleId)).finally(() => setRefreshing(false));
      };
    }
    return () => {
      delete (window as any).__refreshSeatMap;
    };
  }, [onBooked, scheduleId, fetchSeats]);

  const layout = useMemo(() => {
    const seatsByNum = new Map<number, Seat>();
    localSeats.forEach(s => seatsByNum.set(parseInt(s.seat_number), s));

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
  }, [localSeats]);

  const selectedSeats = Object.keys(selected).filter(k => selected[k]);
  const selectedCount = selectedSeats.length;
  const totalPrice = selectedCount * price;

  const renderSeat = (seat: Seat | undefined) => {
    if (!seat) return null;
    
    const id = String(seat.seat_number);
    const st = seat.state;
    const isSelected = !!selected[id];
    const isDriver = seat.is_driver || st === 'DRIVER';
    
    // Define explicit styles for each state
    const getStyle = () => {
      if (isDriver) {
        return {
          background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
          color: '#F3F4F6',
          cursor: 'not-allowed',
          opacity: 0.8,
          border: '2px solid #374151'
        };
      }
      if (st === 'BOOKED') {
        return {
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          color: '#FFFFFF',
          cursor: 'not-allowed',
          opacity: 0.7,
          border: '2px solid #B91C1C'
        };
      }
      if (st === 'LOCKED') {
        return {
          background: 'linear-gradient(135deg, #FDE047 0%, #FACC15 100%)',
          color: '#78350F',
          cursor: 'not-allowed',
          border: '3px solid #EAB308',
          fontWeight: 'bold'
        };
      }
      if (isSelected) {
        return {
          background: 'linear-gradient(135deg, #0077B6 0%, #005F8E 100%)',
          color: '#FFFFFF',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 119, 182, 0.4)',
          transform: 'scale(1.05)',
          border: '2px solid #003F5C'
        };
      }
      // AVAILABLE
      return {
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        color: '#FFFFFF',
        cursor: 'pointer',
        border: '2px solid #047857'
      };
    };
    
    return (
      <button
        key={id}
        onClick={() => toggleSelect(id, st)}
        onKeyDown={(e) => handleKey(e, id, st)}
        disabled={st !== 'AVAILABLE'}
        aria-pressed={isSelected}
        aria-label={`Seat ${id} ${st.toLowerCase()}`}
        title={
          isDriver ? '🚫 Driver seat - Not available for booking' :
          st === 'BOOKED' ? '🔴 Seat is booked - Not available' :
          st === 'LOCKED' ? '🟡 Temporarily reserved by another user' :
          isSelected ? '🔵 Click to deselect' :
          '🟢 Click to select this seat'
        }
        style={{
          ...getStyle(),
          width: '100%',
          aspectRatio: '1',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '13px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (st === 'AVAILABLE' && !isSelected) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (st === 'AVAILABLE' && !isSelected) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {st === 'BOOKED' ? '✕' : id}
      </button>
    );
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-t-xl p-2 text-white">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5 justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center text-xs">
              🚌
            </div>
            Select Seat
          </div>
          {refreshing && (
            <div className="flex items-center gap-1 text-[10px] bg-white/20 px-2 py-0.5 rounded">
              <Loader2 className="w-3 h-3 animate-spin" />
              Updating
            </div>
          )}
        </h3>
        
        <div className="grid grid-cols-4 gap-1 text-[10px]">
          <div className="flex items-center gap-1 bg-white/10 rounded p-1">
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: '1px solid #047857'
            }}></div>
            <span className="font-semibold">Free</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 rounded p-1">
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: 'linear-gradient(135deg, #0077B6 0%, #005F8E 100%)',
              border: '1px solid #003F5C'
            }}></div>
            <span className="font-semibold">Pick</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 rounded p-1">
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              border: '1px solid #B91C1C'
            }}></div>
            <span className="font-semibold">Booked</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 rounded p-1">
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: 'linear-gradient(135deg, #FDE047 0%, #FACC15 100%)',
              border: '2px solid #EAB308'
            }}></div>
            <span className="font-semibold">Lock</span>
          </div>
        </div>
      </div>

      {/* Bus Interior */}
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

            {/* Passenger Rows */}
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

      {/* Selection Summary & Booking */}
      <div className="mt-2.5">
        {selectedCount > 0 ? (
          <div className="bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-lg p-2.5 text-white shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] opacity-90 mb-0.5">Selected Seats</div>
                <div className="text-sm font-bold mb-0.5 truncate">{selectedSeats.join(', ')}</div>
                <div className="text-xs">
                  <span className="font-bold">RWF {totalPrice.toLocaleString()}</span>
                  <span className="opacity-80 ml-1">({selectedCount} {selectedCount === 1 ? 'seat' : 'seats'})</span>
                </div>
              </div>
              
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSelected({})}
                  className="bg-white/20 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-white/30 transition-all border border-white/30"
                  title="Clear selection"
                >
                  Clear
                </button>
                <button
                  onClick={confirmBooking}
                  className="bg-white text-[#0077B6] px-4 py-1.5 rounded-md text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                  title="Proceed to payment"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-300">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-700 mb-0.5">
                  No seats selected
                </div>
                <div className="text-[10px] text-gray-500">
                  Select available seats above to continue
                </div>
              </div>
              <button
                onClick={confirmBooking}
                disabled={true}
                className="bg-gray-300 text-gray-500 px-4 py-1.5 rounded-md text-xs font-bold cursor-not-allowed opacity-60"
                title="Please select a seat first"
              >
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      {!loading && (
        <div className="mt-2.5 flex justify-center">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchSeats(String(scheduleId)).finally(() => setRefreshing(false));
            }}
            disabled={refreshing}
            className="bg-gray-100 text-gray-900 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-200 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh Seats'}
          </button>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="mt-2.5 bg-red-50 border-2 border-red-200 rounded-lg p-2.5">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-red-900 text-sm">Error</div>
              <div className="text-xs text-red-700 mt-0.5">{error}</div>
            </div>
            <button
              onClick={() => {
                setError(null);
                clearError();
              }}
              className="text-red-400 hover:text-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}