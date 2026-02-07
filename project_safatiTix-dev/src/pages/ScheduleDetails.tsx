import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { API_URL } from '../utils/supabase-client';
import SeatMap from '../components/SeatMap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Bus, Calendar, Clock, MapPin, DollarSign, AlertCircle } from 'lucide-react';

export default function ScheduleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [schedule, setSchedule] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [lockInfo, setLockInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/schedules/${id}` } });
      return;
    }
    fetchSchedule();
  }, [id, user]);

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`${API_URL}/schedules/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch schedule details');
      }
      const data = await res.json();
      setSchedule(data.schedule);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedule');
    }
  };

  const onSeatSelect = (seat: any, lock?: any) => {
    setSelectedSeat(seat);
    if (lock) setLockInfo(lock);
  };

  const handlePay = async () => {
    if (!lockInfo || !lockInfo.ticket_id) {
      alert('No locked ticket to pay for');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Initiate payment
      const init = await fetch(`${API_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scheduleId: schedule.id,
          paymentMethod: 'mobile_money',
          phoneOrCard: user?.phone_number || '0000000000',
          numTickets: 1
        })
      });

      if (!init.ok) {
        const errorData = await init.json().catch(() => ({}));
        throw new Error(errorData.message || 'Payment initiation failed');
      }
      const initBody = await init.json();

      // Simulate immediate confirmation for demo (call confirm)
      const confirm = await fetch(`${API_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentId: initBody.payment.id })
      });

      if (!confirm.ok) {
        throw new Error('Payment confirmation failed');
      }

      // Finalize lock -> confirm ticket
      const res = await fetch(`${API_URL}/seats/locks/${lockInfo.lock_id}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Failed to confirm seat lock');
      }

      alert('Payment successful! Your ticket has been confirmed.');
      navigate('/dashboard/commuter');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/dashboard/commuter')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-[#0077B6] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (!schedule.bookable) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" />
            <h2 className="text-xl font-semibold">Booking Unavailable</h2>
            <p className="text-muted-foreground">
              This trip is no longer available for booking. It may have departed or ticket sales have closed.
            </p>
            <Button onClick={() => navigate('/dashboard/commuter')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/commuter')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>

          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Select Your Seat
              </h1>
              <p className="text-muted-foreground mt-1">
                Choose an available seat for your journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Details */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="border-l-4 border-l-[#0077B6]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-[#0077B6]" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Route
                </p>
                <p className="font-semibold text-lg">
                  {schedule.routeFrom} → {schedule.routeTo}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Departure
                </p>
                <p className="font-semibold">
                  {new Date(schedule.departureTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </p>
                <p className="font-semibold">
                  {new Date(schedule.departureTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price
                </p>
                <p className="font-semibold text-[#0077B6] text-xl">
                  RWF {schedule.price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Bus</p>
                <p className="font-semibold font-mono">{schedule.busPlate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-semibold">{schedule.busCapacity || 'N/A'} seats</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <Badge variant={schedule.availableSeats > 5 ? 'default' : 'destructive'}>
                  {schedule.availableSeats} seats left
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seat Map */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Seat</CardTitle>
            <CardDescription>
              Tap an available seat to reserve it. You have 7 minutes to complete payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SeatMap scheduleId={schedule.id} onSelect={onSeatSelect} />
          </CardContent>
        </Card>

        {/* Payment Section */}
        {selectedSeat && lockInfo && (
          <Card className="border-2 border-[#27AE60] sticky bottom-4">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-semibold text-lg mb-1">
                    Seat {selectedSeat.seat_number} Selected
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your seat is reserved. Complete payment to confirm your booking.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-[#27AE60]">
                      RWF {schedule.price.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-[#27AE60] hover:bg-[#1e8c4d] w-full sm:w-auto"
                    onClick={handlePay}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
