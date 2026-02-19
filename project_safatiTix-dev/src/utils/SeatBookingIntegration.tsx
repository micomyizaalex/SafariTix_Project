/**
 * FRONTEND INTEGRATION GUIDE
 * Production-Ready Seat Booking with Concurrency Safety
 * 
 * This file shows how to integrate the new booking API into your React/TypeScript frontend.
 */

import { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

// ==================== TYPE DEFINITIONS ====================

interface SeatBookingRequest {
  scheduleId: string;
  busId: string;
  seatNumbers: string[];
  pricePerSeat?: number;
}

interface Ticket {
  id: string;
  seat_number: string;
  booking_ref: string;
  price: number;
  status: string;
  booked_at: string;
}

interface BookingResponse {
  success: boolean;
  message?: string;
  error?: string;
  booking?: {
    tickets: Ticket[];
    totalPrice: number;
    scheduleId: string;
    busId: string;
    userId: string;
  };
  schedule?: {
    available_seats: number;
    booked_seats: number;
  };
  seatMap?: Array<{
    seat_number: string;
    state: 'AVAILABLE' | 'LOCKED' | 'OCCUPIED';
    bus_id: string;
  }>;
  occupiedSeats?: string[];
  lockedSeats?: string[];
}

// ==================== API SERVICE ====================

/**
 * Service class for seat booking operations
 */
export class SeatBookingService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Book multiple seats with concurrency safety
   */
  async bookSeats(
    request: SeatBookingRequest,
    accessToken: string
  ): Promise<BookingResponse> {
    const response = await fetch(`${this.baseUrl}/seats/book-seats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(request)
    });

    const data: BookingResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Booking failed');
    }

    return data;
  }

  /**
   * Get current seat map for a schedule
   */
  async getSeatMap(scheduleId: string, accessToken?: string): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}/seats/schedules/${scheduleId}`, {
      method: 'GET',
      headers
    });

    return await response.json();
  }
}

// ==================== REACT HOOK ====================

/**
 * Custom hook for seat booking functionality
 */
export function useSeatBooking() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);

  const service = new SeatBookingService();

  const bookSeats = async (
    scheduleId: string,
    busId: string,
    seatNumbers: string[],
    pricePerSeat?: number
  ) => {
    setLoading(true);
    setError(null);
    setBookingResult(null);

    try {
      const result = await service.bookSeats(
        { scheduleId, busId, seatNumbers, pricePerSeat },
        accessToken!
      );

      setBookingResult(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to book seats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearResult = () => setBookingResult(null);

  return {
    bookSeats,
    loading,
    error,
    bookingResult,
    clearError,
    clearResult
  };
}

// ==================== COMPONENT EXAMPLE ====================

/**
 * Example component showing seat booking integration
 */
export const SeatBookingComponent: React.FC<{
  scheduleId: string;
  busId: string;
  selectedSeats: string[];
  pricePerSeat: number;
  onBookingComplete: (result: BookingResponse) => void;
}> = ({ scheduleId, busId, selectedSeats, pricePerSeat, onBookingComplete }) => {
  const { bookSeats, loading, error } = useSeatBooking();
  const navigate = useNavigate();

  const handleBooking = async () => {
    try {
      const result = await bookSeats(scheduleId, busId, selectedSeats, pricePerSeat);

      if (result.success) {
        // Show success message
        alert(`Successfully booked ${result.booking!.tickets.length} seat(s)!`);

        // Call callback
        onBookingComplete(result);

        // Navigate to booking confirmation page
        navigate('/booking-confirmation', {
          state: {
            tickets: result.booking!.tickets,
            totalPrice: result.booking!.totalPrice
          }
        });
      }
    } catch (err: any) {
      // Error is already set in the hook
      console.error('Booking failed:', err);
    }
  };

  return (
    <div className="booking-section">
      {selectedSeats.length > 0 && (
        <div className="booking-summary">
          <h3>Selected Seats</h3>
          <p>Seats: {selectedSeats.join(', ')}</p>
          <p>Total: RWF {(selectedSeats.length * pricePerSeat).toLocaleString()}</p>
        </div>
      )}

      {error && (
        <div className="error-message" style={{ 
          backgroundColor: '#fee', 
          padding: '12px', 
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <button
        onClick={handleBooking}
        disabled={loading || selectedSeats.length === 0}
        style={{
          backgroundColor: loading ? '#ccc' : '#0077B6',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {loading ? (
          <>
            <span className="spinner">⏳</span> Booking...
          </>
        ) : (
          `Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}`
        )}
      </button>
    </div>
  );
};

// ==================== INTEGRATION EXAMPLE ====================

/**
 * Example: Complete booking flow integration
 */
export const BookingFlowExample = () => {
  const [schedule] = useState({
    id: 'schedule-uuid',
    busId: 'bus-uuid',
    price: 5000
  });
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const { bookSeats, loading, error, bookingResult } = useSeatBooking();

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const handleBooking = async () => {
    try {
      const result = await bookSeats(
        schedule.id,
        schedule.busId,
        selectedSeats,
        schedule.price
      );

      console.log('Booking successful!', result);
      
      // Handle success
      if (result.success) {
        alert(`Booked seats: ${result.booking!.tickets.map(t => t.seat_number).join(', ')}`);
        setSelectedSeats([]); // Clear selection
      }
    } catch (err) {
      console.error('Booking error:', err);
    }
  };

  return (
    <div className="booking-page">
      <h1>Book Your Seats</h1>

      {/* Seat Map - pseudo code */}
      <div className="seat-map">
        {/* Your seat map component here */}
        {/* Each seat should call handleSeatSelect when clicked */}
      </div>

      {/* Selected Seats Display */}
      {selectedSeats.length > 0 && (
        <div className="selection-summary">
          <p>Selected: {selectedSeats.join(', ')}</p>
          <p>Total: RWF {(selectedSeats.length * schedule.price).toLocaleString()}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      {/* Booking Button */}
      <button
        onClick={handleBooking}
        disabled={loading || selectedSeats.length === 0}
      >
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>

      {/* Success Display */}
      {bookingResult?.success && (
        <div className="success-modal">
          <h2>Booking Confirmed!</h2>
          <ul>
            {bookingResult.booking!.tickets.map(ticket => (
              <li key={ticket.id}>
                Seat {ticket.seat_number} - Ref: {ticket.booking_ref}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ==================== ERROR HANDLING ====================

/**
 * Comprehensive error handler for booking responses
 */
export function handleBookingError(error: string, message?: string, data?: any) {
  switch (error) {
    case 'Seat not available':
      if (data?.occupiedSeats) {
        return `Seats ${data.occupiedSeats.join(', ')} are already booked. Please select different seats.`;
      }
      if (data?.lockedSeats) {
        return `Seats ${data.lockedSeats.join(', ')} are being held by another user. Please wait or select different seats.`;
      }
      return 'Selected seat(s) are not available. Please choose different seats.';

    case 'Missing required field: scheduleId':
    case 'Missing required field: busId':
    case 'Missing required field: seatNumbers (must be a non-empty array)':
      return 'Invalid booking request. Please try again.';

    case 'Authentication required. User ID not found.':
      return 'Please log in to book tickets.';

    case 'Schedule not found':
      return 'This trip is no longer available.';

    case 'Ticket sales are closed for this schedule':
    case 'Ticket sales are closed. Departure time has passed.':
      return 'Ticket sales have ended for this trip.';

    case 'Schedule is not available for booking. Current status: completed':
      return 'This trip has already departed.';

    case 'Insufficient seats available':
      return message || 'Not enough seats available for your selection.';

    case 'Service temporarily unavailable':
      return 'High traffic. Please try again in a moment.';

    default:
      return message || error || 'An unexpected error occurred. Please try again.';
  }
}

// ==================== USAGE EXAMPLE ====================

/*
// In your component:

import { useSeatBooking, handleBookingError } from './SeatBookingIntegration';

const MyComponent = () => {
  const { bookSeats, loading, error } = useSeatBooking();

  const onBook = async () => {
    try {
      await bookSeats('schedule-id', 'bus-id', ['5', '6'], 5000);
      // Success!
    } catch (err: any) {
      const userMessage = handleBookingError(err.message);
      alert(userMessage);
    }
  };

  return (
    <button onClick={onBook} disabled={loading}>
      {loading ? 'Booking...' : 'Book Seats'}
    </button>
  );
};
*/

export default {
  SeatBookingService,
  useSeatBooking,
  SeatBookingComponent,
  handleBookingError
};
