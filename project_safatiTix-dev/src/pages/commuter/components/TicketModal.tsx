// commuter-dashboard/components/TicketModal.tsx
import React, { useEffect } from 'react';
import { X, QrCode, Download, Share2, Ban, Loader2, Check, AlertCircle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import SeatMap from '../../../components/SeatMap';
import { useAuthStore } from '../../../stores/authStore';
import { useTicketsStore } from '../../../stores/ticketsStore';
import { useSeatsStore } from '../../../stores/seatsStore';
import { cancelTicket } from '../../../services/tickets';

interface TicketModalProps {
  ticket: any;
  selectedSeatsMap: Record<string, boolean>;
  setSelectedSeatsMap: (seats: Record<string, boolean>) => void;
  onClose: () => void;
  onBookingComplete?: () => void;
}

export default function TicketModal({ 
  ticket, 
  selectedSeatsMap, 
  setSelectedSeatsMap,
  onClose,
  onBookingComplete 
}: TicketModalProps) {
  const { user } = useAuthStore();
  const { cancelTicket: cancelTicketInStore } = useTicketsStore();
  const { 
    seats, 
    loading: seatsLoading, 
    locking,
    error: seatsError,
    fetchSeats, 
    lockSeats,
    clearError 
  } = useSeatsStore();
  
  const [cancelling, setCancelling] = React.useState(false);

  // Load seats if this is a new booking (no seat assigned yet)
  useEffect(() => {
    if (!ticket.seat && !ticket.qrCode && ticket.id) {
      fetchSeats(ticket.id);
    }
  }, [ticket]);

  const canCancelTicket = (): { canCancel: boolean; reason?: string } => {
    if (ticket?.status === 'CANCELLED') {
      return { canCancel: false, reason: 'Ticket already cancelled' };
    }
    if (ticket?.status === 'CHECKED_IN') {
      return { canCancel: false, reason: 'Cannot cancel checked-in ticket' };
    }
    if (!ticket?.time || !ticket?.date) {
      return { canCancel: true };
    }

    const departureTime = new Date(`${ticket.date}T${ticket.time}`);
    const now = new Date();
    const timeDiffMinutes = (departureTime.getTime() - now.getTime()) / (1000 * 60);

    if (timeDiffMinutes < 10) {
      return { 
        canCancel: false, 
        reason: `Cannot cancel: departure in ${Math.max(0, Math.round(timeDiffMinutes))} minute(s)` 
      };
    }

    return { canCancel: true };
  };

  const handleCancelTicket = async () => {
    const cancelCheck = canCancelTicket();
    if (!cancelCheck.canCancel) {
      alert(cancelCheck.reason);
      return;
    }

    if (!confirm('Are you sure you want to cancel this ticket?')) return;

    setCancelling(true);
    try {
      await cancelTicket(ticket.id);
      await cancelTicketInStore(ticket.id);
      alert('Ticket cancelled successfully');
      onClose();
    } catch (error: any) {
      alert(error.message || 'Failed to cancel ticket');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmBooking = async () => {
    const picks = Object.keys(selectedSeatsMap).filter(k => selectedSeatsMap[k]);
    if (picks.length === 0) {
      alert('Select at least one seat');
      return;
    }

    const success = await lockSeats(ticket.id, picks, ticket.price || 0, user?.id);
    
    if (success) {
      onClose();
      onBookingComplete?.();
    }
  };

  const downloadTicket = () => {
    try {
      // Create ticket HTML content
      const ticketHtml = `
        <html>
          <head>
            <title>SafariTix Ticket - ${ticket.reference || ticket.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .ticket { max-width: 400px; margin: 0 auto; border: 2px solid #0077B6; border-radius: 12px; padding: 20px; }
              .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
              .route { font-size: 24px; font-weight: bold; color: #0077B6; }
              .details { margin: 15px 0; }
              .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
              .qr { text-align: center; margin: 20px 0; }
              .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="header">
                <h2>SafariTix</h2>
                <div class="route">${ticket.from} → ${ticket.to}</div>
              </div>
              <div class="qr">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.reference || ticket.id}" />
              </div>
              <div class="details">
                <div class="row"><span>Reference:</span> <strong>${ticket.reference || 'N/A'}</strong></div>
                <div class="row"><span>Date:</span> <strong>${new Date(ticket.date).toLocaleDateString()}</strong></div>
                <div class="row"><span>Time:</span> <strong>${ticket.time}</strong></div>
                <div class="row"><span>Seat:</span> <strong>#${ticket.seat}</strong></div>
                <div class="row"><span>Bus:</span> <strong>${ticket.bus}</strong></div>
                <div class="row"><span>Price:</span> <strong>RWF ${ticket.price?.toLocaleString()}</strong></div>
              </div>
              <div class="footer">
                Present this ticket when boarding
              </div>
            </div>
          </body>
        </html>
      `;

      // Create download link
      const blob = new Blob([ticketHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safaritix-ticket-${ticket.reference || ticket.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download ticket');
    }
  };

  const shareTicket = async () => {
    const shareData = {
      title: 'SafariTix Ticket',
      text: `My ticket from ${ticket.from} to ${ticket.to} on ${new Date(ticket.date).toLocaleDateString()} at ${ticket.time}. Seat #${ticket.seat}`,
      url: window.location.origin + `/tickets/${ticket.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(
        `${shareData.text}\n${shareData.url}`
      );
      alert('Ticket details copied to clipboard!');
    }
  };

  // If this is an existing ticket with seat assigned
  const isExistingTicket = ticket.seat || ticket.qrCode;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-300"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {isExistingTicket ? (
          // Existing Ticket View
          <>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Ticket</h3>
              <p className="text-gray-600">{ticket.from} → {ticket.to}</p>
            </div>

            <div className="bg-gradient-to-br from-[#0077B6]/10 to-[#005F8E]/10 rounded-2xl p-8 mb-6 border-2 border-dashed border-[#0077B6]/30">
              <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center shadow-md">
                {ticket.qrData ? (
                  <QRCodeCanvas value={ticket.qrData} size={160} bgColor="#ffffff" fgColor="#0077B6" />
                ) : (
                  <QrCode className="w-32 h-32 text-[#0077B6]" />
                )}
              </div>
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500 mb-1">Booking Reference</p>
                <p className="text-sm font-bold text-gray-900 font-mono">{ticket.reference || ticket.id?.slice(-8) || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <DetailRow label="Status" value={
                <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                  ticket.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                  ticket.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700' :
                  ticket.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {ticket.status || 'Pending'}
                </span>
              } />
              <DetailRow label="Date" value={new Date(ticket.date).toLocaleDateString()} />
              <DetailRow label="Time" value={ticket.time} />
              <DetailRow label="Seat" value={`#${ticket.seat}`} />
              <DetailRow label="Bus" value={ticket.bus || 'N/A'} />
              <DetailRow label="Price" value={`RWF ${ticket.price?.toLocaleString() || '0'}`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={downloadTicket} 
                className="flex items-center justify-center gap-2 bg-[#0077B6] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#005F8E] transition-colors"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
              <button 
                onClick={shareTicket} 
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Cancel Button */}
            <div className="mt-3">
              <CancelButton 
                canCancel={canCancelTicket().canCancel}
                reason={canCancelTicket().reason}
                onCancel={handleCancelTicket}
                isCancelling={cancelling}
              />
            </div>
          </>
        ) : (
          // New Booking - Seat Selection
          <>
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Select Seat</h3>
              <p className="text-sm text-gray-600">{ticket.from} → {ticket.to}</p>
            </div>

            <SeatLegend />

            {seatsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#0077B6] animate-spin" />
              </div>
            ) : (
              <div className="mb-4">
                <SeatMap 
                  scheduleId={ticket.id} 
                  price={ticket.price || 0} 
                  selectedSeatsMap={selectedSeatsMap} 
                  setSelectedSeatsMap={setSelectedSeatsMap} 
                />
              </div>
            )}

            {seatsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {seatsError}
              </div>
            )}

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                Selected seat(s): <span className="font-semibold text-gray-900">
                  {Object.keys(selectedSeatsMap).filter(k => selectedSeatsMap[k]).join(', ') || 'None'}
                </span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmBooking}
                  disabled={locking || seatsLoading || Object.keys(selectedSeatsMap).filter(k => selectedSeatsMap[k]).length === 0}
                  className="flex-1 bg-[#0077B6] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#005F8E] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {locking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
                <button 
                  onClick={onClose} 
                  className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Helper Components
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
    <span className="text-gray-600">{label}</span>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);

const SeatLegend = () => (
  <div className="mb-3 flex items-center gap-3 justify-center flex-wrap">
    <LegendItem color="bg-white border border-gray-300" label="Available" />
    <LegendItem color="bg-[#0077B6]" label="Selected" />
    <LegendItem color="bg-gray-300" label="Occupied" />
    <LegendItem color="bg-yellow-100 border border-yellow-300" label="Locked" />
  </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-5 h-5 rounded ${color}`}></div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const CancelButton = ({ canCancel, reason, onCancel, isCancelling }: any) => (
  <button
    onClick={onCancel}
    disabled={!canCancel || isCancelling}
    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
      canCancel && !isCancelling
        ? 'bg-red-500 text-white hover:bg-red-600'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
    }`}
    title={reason}
  >
    {isCancelling ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        Cancelling...
      </>
    ) : (
      <>
        <Ban className="w-5 h-5" />
        Cancel Ticket
      </>
    )}
  </button>
);