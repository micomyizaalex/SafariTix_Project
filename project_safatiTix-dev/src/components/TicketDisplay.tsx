import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface TicketDisplayProps {
  ticket: any;
  onClose?: () => void;
}

export function TicketDisplay({ ticket, onClose }: TicketDisplayProps) {
  if (!ticket) return null;

  // Defensive fallback mapping
  const safe = (val: any, fallback: string = 'N/A') => (val === undefined || val === null || val === '' ? fallback : val);

  const qrPayload = {
    id: safe(ticket.id),
    seatNumber: safe(ticket.seatNumber),
    passengerName: safe(ticket.passengerName),
    passengerEmail: safe(ticket.passengerEmail),
    routeFrom: safe(ticket.routeFrom),
    routeTo: safe(ticket.routeTo),
    departureTime: safe(ticket.departureTime),
    arrivalTime: safe(ticket.arrivalTime),
    travelDate: safe(ticket.travelDate),
    busPlateNumber: safe(ticket.busPlateNumber),
    busModel: safe(ticket.busModel),
    price: safe(ticket.price),
    bookedAt: safe(ticket.bookedAt)
  };
  const qrData = JSON.stringify(qrPayload);
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:bg-transparent">
      <Card className="w-full max-w-xl shadow-lg border border-gray-200 print:shadow-none print:border-0 bg-white dark:bg-neutral-900">
        <CardContent className="p-6 space-y-6 text-black">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>SafariTix Ticket</h2>
              <p className="text-sm text-muted-foreground">
                Ticket ID: <span className="font-mono">{safe(ticket.id).toString().slice(0, 12)}</span>
              </p>
            </div>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose} className="print:hidden">
                Close
              </Button>
            )}
          </div>

          {/* Ticket details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Passenger</p>
              <p className="font-semibold break-words">{safe(ticket.passengerName)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seat</p>
              <p className="font-semibold">{safe(ticket.seatNumber)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-semibold">RWF {typeof ticket.price === 'number' ? ticket.price.toLocaleString() : safe(ticket.price)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Route</p>
              <p className="font-semibold">{safe(ticket.routeFrom)} → {safe(ticket.routeTo)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-semibold">{safe(ticket.travelDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Departure</p>
              <p className="font-semibold">{safe(ticket.departureTime)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Arrival</p>
              <p className="font-semibold">{safe(ticket.arrivalTime)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <p className="text-xs text-muted-foreground">Bus</p>
              <p className="font-semibold">{safe(ticket.busModel, 'Bus')} ({safe(ticket.busPlateNumber)})</p>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <QRCodeCanvas id="ticket-qr" value={qrData} size={160} bgColor="#fff" fgColor="#000" level="M" includeMargin={true} ref={qrRef} />
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-t pt-4">
            Generated at {ticket.bookedAt ? new Date(ticket.bookedAt).toLocaleString() : 'Unknown'} • Present this QR code when boarding.
          </div>

          <div className="flex gap-3 print:hidden">
            <Button onClick={() => window.print()} className="bg-[#006AFF] hover:bg-[#0056cc]">Print / Save PDF</Button>
            <Button
              variant="outline"
              onClick={() => {
                const canvas = document.getElementById('ticket-qr') as HTMLCanvasElement | null;
                if (canvas) {
                  const link = document.createElement('a');
                  link.href = canvas.toDataURL('image/png');
                  link.download = `ticket-${safe(ticket.id)}.png`;
                  link.click();
                }
              }}
            >
              Download QR
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
