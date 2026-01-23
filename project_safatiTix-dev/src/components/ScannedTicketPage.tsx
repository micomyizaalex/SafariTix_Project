import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/supabase-client';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Printer } from 'lucide-react';

interface EnrichedTicket {
  id: string;
  seatNumber?: number | string;
  passengerName?: string;
  passengerEmail?: string;
  routeFrom?: string;
  routeTo?: string;
  departureTime?: string;
  arrivalTime?: string;
  travelDate?: string;
  busPlateNumber?: string;
  busModel?: string;
  price?: number | string;
  bookedAt?: string;
  qrCode?: string;
}

// Helper: safe fallback
function safe(val: any, fb: string = 'N/A') {
  return val === undefined || val === null || val === '' ? fb : val;
}

export function ScannedTicketPage() {
  const { accessToken, user } = useAuth();
  const [ticket, setTicket] = useState<EnrichedTicket | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Parse query params manually (no react-router in app)
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError('');

      const payloadParam = params.get('payload'); // base64 or URI-encoded JSON
      const idParam = params.get('ticketId') || params.get('id');
      let parsed: EnrichedTicket | null = null;

      // Try parse payload first
      if (payloadParam) {
        try {
          let raw = payloadParam;
          // Try base64 decode if it looks like base64
          if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
            try {
              raw = atob(raw);
            } catch (_) {
              // ignore
            }
          } else {
            try {
              raw = decodeURIComponent(raw);
            } catch (_) {
              // ignore
            }
          }
          parsed = JSON.parse(raw);
          // Normalize expected fields naming
          setTicket(parsed);
          setLoading(false);
          return;
        } catch (e: any) {
          setError('Unable to parse QR payload.');
        }
      }

      // If we have an id, fetch from backend
      if (idParam) {
        if (!accessToken) {
          setError('Please login to view ticket details.');
          setLoading(false);
          return;
        }
        try {
          // Backend does not have single-ticket endpoint: fetch all and filter
          const res = await fetch(`${API_URL}/tickets`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (!res.ok) {
            setError('Failed to load tickets from server.');
            setLoading(false);
            return;
          }
          const data = await res.json();
          const found = (data.tickets || []).find((t: any) => t.id === idParam || t.qrCode === idParam);
          if (!found) {
            setError('Ticket not found.');
            setLoading(false);
            return;
          }
          // Map schedule fields if previously enriched; attempt fallback names
          const enriched: EnrichedTicket = {
            id: found.id,
            seatNumber: found.seatNumber,
            passengerName: found.passengerName || user?.name,
            passengerEmail: found.passengerEmail || user?.email,
            routeFrom: found.routeFrom,
            routeTo: found.routeTo,
            departureTime: found.departureTime,
            arrivalTime: found.arrivalTime,
            travelDate: found.travelDate || found.date,
            busPlateNumber: found.busPlateNumber,
            busModel: found.busModel,
            price: found.price,
            bookedAt: found.bookedAt || found.createdAt,
            qrCode: found.qrCode
          };
          setTicket(enriched);
        } catch (e: any) {
          setError('Unexpected error loading ticket.');
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!payloadParam && !idParam) {
        setError('No ticket payload or ID provided in URL.');
      }
      setLoading(false);
    }
    init();
  }, [accessToken, params, user]);

  const qrData = useMemo(() => ticket ? JSON.stringify({
    id: ticket.id,
    seatNumber: ticket.seatNumber,
    passengerName: ticket.passengerName,
    passengerEmail: ticket.passengerEmail,
    routeFrom: ticket.routeFrom,
    routeTo: ticket.routeTo,
    departureTime: ticket.departureTime,
    arrivalTime: ticket.arrivalTime,
    travelDate: ticket.travelDate,
    busPlateNumber: ticket.busPlateNumber,
    busModel: ticket.busModel,
    price: ticket.price,
    bookedAt: ticket.bookedAt
  }) : '', [ticket]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading ticket...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>SafariTix Ticket</CardTitle>
          <CardDescription>Scanned Ticket Details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!error && ticket && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Ticket ID</p>
                  <p className="font-mono text-sm">{safe(ticket.id)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Seat Number</p>
                  <p className="font-semibold">{safe(ticket.seatNumber)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Passenger</p>
                  <p className="font-semibold break-words">{safe(ticket.passengerName)}</p>
                  <p className="text-xs text-muted-foreground break-words">{safe(ticket.passengerEmail)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold">RWF {typeof ticket.price === 'number' ? ticket.price.toLocaleString() : safe(ticket.price)}</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Route</p>
                  <p className="font-semibold">{safe(ticket.routeFrom)} → {safe(ticket.routeTo)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Travel Date</p>
                  <p className="font-semibold">{safe(ticket.travelDate)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Departure Time</p>
                  <p className="font-semibold">{safe(ticket.departureTime)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Arrival Time</p>
                  <p className="font-semibold">{safe(ticket.arrivalTime)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Bus</p>
                  <p className="font-semibold">{safe(ticket.busModel, 'Bus')} ({safe(ticket.busPlateNumber)})</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Booked At</p>
                  <p className="font-semibold">{ticket.bookedAt ? new Date(ticket.bookedAt).toLocaleString() : 'Unknown'}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t">
                <div className="space-y-2 w-full md:w-auto text-center md:text-left">
                  <p className="text-xs text-muted-foreground">Scan Again</p>
                  <p className="text-sm">Show this QR at boarding</p>
                </div>
                <div className="flex items-center justify-center">
                  <QRCodeCanvas value={qrData} size={180} bgColor="#fff" fgColor="#000" level="M" includeMargin={true} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 print:hidden">
                <Button onClick={() => window.print()} className="bg-[#006AFF] hover:bg-[#0056cc]">
                  <Printer className="w-4 h-4 mr-2" />
                  Print / Save PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                      const link = document.createElement('a');
                      link.href = (canvas as HTMLCanvasElement).toDataURL('image/png');
                      link.download = `ticket-${safe(ticket.id)}.png`;
                      link.click();
                    }
                  }}
                >
                  Download QR
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
