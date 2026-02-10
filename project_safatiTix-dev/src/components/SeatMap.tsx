import React, { useState } from "react";

// SafariTix Dynamic Bus Seat Map
// Renders EXACTLY the number of seats based on bus capacity
// Layout: Driver (front-left) + Passenger (front-right) + Rows of 4 seats (2-2 with aisle)

enum SeatStatus {
  AVAILABLE = "available",
  SELECTED = "selected",
  BOOKED = "booked",
}

interface Seat {
  id: number;
  seatNumber: string;
  status: SeatStatus;
  isDriver?: boolean;
}

interface BusSeatMapProps {
  capacity?: number; // Total bus capacity (default: 30)
  bookedSeats?: number[]; // Array of pre-booked seat IDs
  onSeatSelect?: (seat: Seat) => void;
}

export default function BusSeatMap({ 
  capacity = 30, 
  bookedSeats = [1, 5, 12, 18],
  onSeatSelect 
}: BusSeatMapProps): JSX.Element {
  
  // Generate seats dynamically based on capacity
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    
    // Seat 1: Driver (not selectable)
    seats.push({
      id: 1,
      seatNumber: "DRIVER",
      status: SeatStatus.BOOKED,
      isDriver: true
    });
    
    // Remaining seats for passengers
    for (let i = 2; i <= capacity; i++) {
      seats.push({
        id: i,
        seatNumber: `${i}`,
        status: bookedSeats.includes(i) ? SeatStatus.BOOKED : SeatStatus.AVAILABLE,
        isDriver: false
      });
    }
    
    return seats;
  };

  const [seats, setSeats] = useState<Seat[]>(generateSeats());

  const toggleSeat = (seat: Seat): void => {
    if (seat.isDriver || seat.status === SeatStatus.BOOKED) return;
    
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id !== seat.id) return s;
        const newStatus = s.status === SeatStatus.SELECTED 
          ? SeatStatus.AVAILABLE 
          : SeatStatus.SELECTED;
        const updatedSeat = { ...s, status: newStatus };
        
        if (onSeatSelect && newStatus === SeatStatus.SELECTED) {
          onSeatSelect(updatedSeat);
        }
        
        return updatedSeat;
      })
    );
  };

  // Calculate layout: Front row (driver + 1 passenger) + remaining rows (4 seats per row: 2-2)
  const driver = seats[0];
  const frontPassenger = seats[1]; // Seat 2 next to driver
  const remainingSeats = seats.slice(2); // Seats 3 onwards
  const seatsPerRow = 4;
  
  // Organize remaining seats into rows of 4
  const rows: Seat[][] = [];
  for (let i = 0; i < remainingSeats.length; i += seatsPerRow) {
    rows.push(remainingSeats.slice(i, i + seatsPerRow));
  }

  const selectedSeats = seats.filter((s) => s.status === SeatStatus.SELECTED && !s.isDriver);
  const totalPrice = selectedSeats.length * 3500;

  return (
    <div style={{
      padding: "20px",
      background: "#f9fafb",
      borderRadius: "16px",
      maxWidth: "900px",
      margin: "0 auto"
    }}>
      {/* Bus Container */}
      <div style={{
        background: "white",
        borderRadius: "24px",
        padding: "32px 24px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
      }}>
        {/* Capacity Info */}
        <div style={{
          textAlign: "center",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "2px solid #e5e7eb"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#E8F7FF",
            padding: "8px 16px",
            borderRadius: "20px"
          }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#0077B6" }}>
              🚌 Bus Capacity: {capacity} seats
            </span>
          </div>
        </div>

        {/* Bus Structure */}
        <div style={{
          position: "relative",
          background: "linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)",
          borderRadius: "80px 80px 24px 24px",
          padding: "28px 20px",
          border: "6px solid #d1d5db",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)"
        }}>
          {/* Windshield */}
          <div style={{
            position: "absolute",
            top: "-2px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "120px",
            height: "70px",
            background: "linear-gradient(180deg, #DBEAFE 0%, #BFDBFE 100%)",
            borderRadius: "60px 60px 0 0",
            border: "4px solid #d1d5db",
            borderBottom: "none",
            opacity: 0.7
          }} />

          {/* Front Row: Driver + Front Passenger */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "48px",
            marginBottom: "32px",
            marginTop: "48px"
          }}>
            {/* Driver Seat (Left) */}
            <div style={{
              width: "72px",
              height: "64px",
              background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
              border: "3px solid #374151",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              cursor: "not-allowed",
              opacity: 0.8
            }}>
              <span style={{ fontSize: "20px", marginBottom: "2px" }}>🚗</span>
              <span style={{ fontSize: "10px", fontWeight: "bold", color: "white" }}>DRIVER</span>
            </div>

            {/* Front Passenger Seat (Right) */}
            {frontPassenger && (
              <SeatComponent seat={frontPassenger} onClick={() => toggleSeat(frontPassenger)} />
            )}
          </div>

          {/* Passenger Rows (2-aisle-2 configuration) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px"
              }}>
                {/* Left Side Seats */}
                <div style={{ display: "flex", gap: "10px" }}>
                  {row[0] && <SeatComponent seat={row[0]} onClick={() => toggleSeat(row[0])} />}
                  {row[1] && <SeatComponent seat={row[1]} onClick={() => toggleSeat(row[1])} />}
                </div>

                {/* Aisle */}
                <div style={{
                  width: "40px",
                  height: "2px",
                  background: "linear-gradient(90deg, transparent 0%, #d1d5db 50%, transparent 100%)"
                }} />

                {/* Right Side Seats */}
                <div style={{ display: "flex", gap: "10px" }}>
                  {row[2] && <SeatComponent seat={row[2]} onClick={() => toggleSeat(row[2])} />}
                  {row[3] && <SeatComponent seat={row[3]} onClick={() => toggleSeat(row[3])} />}
                </div>
              </div>
            ))}
          </div>

          {/* Bus Rear */}
          <div style={{
            marginTop: "24px",
            height: "20px",
            background: "linear-gradient(90deg, #9ca3af 0%, #6b7280 50%, #9ca3af 100%)",
            borderRadius: "0 0 12px 12px",
            boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.2)"
          }} />
        </div>

        {/* Legend */}
        <div style={{
          marginTop: "28px",
          paddingTop: "20px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          flexWrap: "wrap"
        }}>
          <LegendItem color="#0077B6" label="Available" />
          <LegendItem color="#005a8c" label="Selected" />
          <LegendItem color="#9ca3af" label="Booked" />
        </div>
      </div>

      {/* Booking Summary */}
      {selectedSeats.length > 0 && (
        <div style={{
          marginTop: "20px",
          background: "linear-gradient(135deg, #0077B6 0%, #0096D6 100%)",
          borderRadius: "20px",
          padding: "24px",
          color: "white",
          boxShadow: "0 10px 30px rgba(0,119,182,0.3)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <p style={{ fontSize: "13px", opacity: 0.9, margin: "0 0 6px 0" }}>
                Selected Seats
              </p>
              <p style={{ fontSize: "24px", fontWeight: "700", margin: "0", fontFamily: "Montserrat, sans-serif" }}>
                {selectedSeats.map((s) => s.seatNumber).join(", ")}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "13px", opacity: 0.9, margin: "0 0 6px 0" }}>
                Total Amount
              </p>
              <p style={{ fontSize: "32px", fontWeight: "700", margin: "0", fontFamily: "Montserrat, sans-serif" }}>
                RWF {totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Seat Component
function SeatComponent({ seat, onClick }: { seat: Seat; onClick: () => void }): JSX.Element {
  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: "64px",
      height: "56px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "700",
      fontSize: "16px",
      transition: "all 0.2s",
      cursor: "pointer",
      border: "3px solid",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      position: "relative"
    };

    if (seat.status === SeatStatus.AVAILABLE) {
      return {
        ...base,
        background: "#0077B6",
        borderColor: "#005a8c",
        color: "white"
      };
    } else if (seat.status === SeatStatus.SELECTED) {
      return {
        ...base,
        background: "#005a8c",
        borderColor: "#003d5c",
        color: "white",
        transform: "scale(1.05)",
        boxShadow: "0 6px 16px rgba(0,119,182,0.4), 0 0 0 4px rgba(0,119,182,0.2)"
      };
    } else {
      return {
        ...base,
        background: "#9ca3af",
        borderColor: "#6b7280",
        color: "#4b5563",
        cursor: "not-allowed",
        opacity: 0.6
      };
    }
  };

  return (
    <div
      onClick={onClick}
      style={getStyles()}
      title={seat.status === SeatStatus.BOOKED ? "Seat Booked" : `Seat ${seat.seatNumber}`}
    >
      <span style={{ position: "relative", zIndex: 10 }}>{seat.seatNumber}</span>
      {seat.status === SeatStatus.SELECTED && (
        <div style={{
          position: "absolute",
          top: "-8px",
          right: "-8px",
          width: "20px",
          height: "20px",
          background: "#27AE60",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          border: "2px solid white"
        }}>
          ✓
        </div>
      )}
    </div>
  );
}

// Legend Item
function LegendItem({ color, label }: { color: string; label: string }): JSX.Element {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        background: color,
        border: "2px solid #d1d5db",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }} />
      <span style={{
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151"
      }}>{label}</span>
    </div>
  );
}