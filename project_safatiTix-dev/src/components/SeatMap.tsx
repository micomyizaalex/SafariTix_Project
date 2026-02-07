import React, { useState } from "react";

// SafariTix Bus Seat Map - Fixed for Tailwind v4
// Top-down view with proper styling

enum SeatStatus {
  AVAILABLE = "available",
  SELECTED = "selected",
  BOOKED = "booked",
}

interface Seat {
  id: number;
  status: SeatStatus;
  passenger: string | null;
}

interface BusSeatProps {
  seat: Seat | undefined;
  onClick: (id: number) => void;
}

interface PassengerLabelProps {
  seat: Seat | undefined;
  position: "left" | "right";
}

interface LegendItemProps {
  color: string;
  label: string;
}

const passengerNames: string[] = [
  "John Doe",
  "Jane Smith",
  "Peter Brown",
  "Mary Johnson",
  "David Lee",
  "Sarah Wilson",
  "Michael Chen",
];

const seatsData: Seat[] = Array.from({ length: 44 }, (_, i) => {
  const isBooked = i % 9 === 0;
  return {
    id: i + 1,
    status: isBooked ? SeatStatus.BOOKED : SeatStatus.AVAILABLE,
    passenger: isBooked
      ? passengerNames[Math.floor(i / 9) % passengerNames.length]
      : null,
  };
});

export default function BusSeatMap(): JSX.Element {
  const [seats, setSeats] = useState<Seat[]>(seatsData);

  const toggleSeat = (id: number): void => {
    setSeats((prev) =>
      prev.map((seat) => {
        if (seat.id !== id || seat.status === SeatStatus.BOOKED) return seat;
        return {
          ...seat,
          status:
            seat.status === SeatStatus.SELECTED
              ? SeatStatus.AVAILABLE
              : SeatStatus.SELECTED,
        };
      })
    );
  };

  const selectedSeats = seats.filter((s) => s.status === SeatStatus.SELECTED);
  const totalPrice = selectedSeats.length * 3500;

  const driverSeat = seats[0];
  const passengerSeats = seats.slice(1);
  const rows: (Seat | undefined)[][] = [];

  for (let i = 0; i < passengerSeats.length; i += 4) {
    rows.push(passengerSeats.slice(i, i + 4));
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
      padding: "24px"
    }}>
      <div style={{ maxWidth: "1536px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          padding: "32px",
          marginBottom: "0"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <h1 style={{
                fontSize: "3rem",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "8px",
                margin: "0"
              }}>
                BUS SEATING CHART
              </h1>
              <p style={{
                fontSize: "1.125rem",
                color: "#374151",
                fontWeight: "600",
                margin: "8px 0 0 0"
              }}>
                Kigali → Musanze • 08:30 AM Departure
              </p>
            </div>
            <div>
              <div style={{
                background: "rgba(255, 255, 255, 0.9)",
                padding: "16px 32px",
                borderRadius: "16px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}>
                <p style={{
                  fontSize: "0.875rem",
                  color: "#4b5563",
                  margin: "0 0 4px 0"
                }}>Price per seat</p>
                <p style={{
                  fontSize: "1.875rem",
                  fontWeight: "bold",
                  color: "#f59e0b",
                  margin: "0"
                }}>RWF 3,500</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Bus Layout */}
        <div style={{
          background: "white",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          borderRadius: "0 0 24px 24px",
          padding: "40px"
        }}>
          <div style={{
            display: "flex",
            gap: "40px",
            alignItems: "flex-start",
            justifyContent: "center"
          }}>
            {/* Left Passenger List */}
            <div style={{ width: "208px" }}>
              <div style={{ height: "64px" }} />
              {rows.map((row, idx) => (
                <React.Fragment key={`left-${idx}`}>
                  {row[0] && <PassengerLabel seat={row[0]} position="left" />}
                  {row[1] && <PassengerLabel seat={row[1]} position="left" />}
                </React.Fragment>
              ))}
            </div>

            {/* Bus Structure */}
            <div style={{ position: "relative" }}>
              <div style={{
                position: "relative",
                background: "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)",
                borderRadius: "140px 140px 40px 40px",
                padding: "40px",
                border: "10px solid #d1d5db",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}>
                {/* Windshield */}
                <div style={{
                  position: "absolute",
                  top: "0",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "160px",
                  height: "112px",
                  background: "linear-gradient(180deg, #bfdbfe 0%, #dbeafe 100%)",
                  borderRadius: "120px 120px 0 0",
                  border: "6px solid #d1d5db",
                  marginTop: "-12px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute",
                    inset: "0",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 50%, transparent 100%)",
                    borderRadius: "120px 120px 0 0"
                  }} />
                </div>

                {/* Driver Seat */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "40px",
                  marginTop: "80px"
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #f9a8d4 0%, #f472b6 100%)",
                    border: "3px solid #ec4899",
                    width: "128px",
                    height: "56px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}>
                    <span style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.75rem"
                    }}>🚗 DRIVER</span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div>
                  {rows.map((row, rowIdx) => (
                    <div key={rowIdx} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      marginBottom: "16px"
                    }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <BusSeat seat={row[0]} onClick={toggleSeat} />
                        <BusSeat seat={row[1]} onClick={toggleSeat} />
                      </div>
                      <div style={{
                        width: "64px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <div style={{
                          width: "2px",
                          height: "48px",
                          background: "linear-gradient(180deg, transparent 0%, #d1d5db 50%, transparent 100%)"
                        }} />
                      </div>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <BusSeat seat={row[2]} onClick={toggleSeat} />
                        <BusSeat seat={row[3]} onClick={toggleSeat} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rear wheels */}
                <Wheel style={{ bottom: "-28px", left: "40px" }} />
                <Wheel style={{ bottom: "-28px", right: "40px" }} />
              </div>

              {/* Front wheels */}
              <Wheel style={{ top: "112px", left: "-28px" }} size="small" />
              <Wheel style={{ top: "112px", right: "-28px" }} size="small" />
            </div>

            {/* Right Passenger List */}
            <div style={{ width: "208px" }}>
              <div style={{ height: "64px" }} />
              {rows.map((row, idx) => (
                <React.Fragment key={`right-${idx}`}>
                  {row[2] && <PassengerLabel seat={row[2]} position="right" />}
                  {row[3] && <PassengerLabel seat={row[3]} position="right" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{
            marginTop: "64px",
            paddingTop: "32px",
            borderTop: "1px solid #e5e7eb"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "48px"
            }}>
              <LegendItem color="#3b82f6" label="Available" />
              <LegendItem color="#10b981" label="Selected" />
              <LegendItem color="#eab308" label="Booked" />
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        {selectedSeats.length > 0 && (
          <div style={{
            marginTop: "32px",
            background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
            borderRadius: "24px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            padding: "32px",
            color: "white"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "24px"
            }}>
              <div>
                <p style={{ fontSize: "0.875rem", opacity: 0.9, margin: "0 0 8px 0" }}>
                  Selected Seats
                </p>
                <p style={{ fontSize: "1.875rem", fontWeight: "bold", margin: "0" }}>
                  {selectedSeats.map((s) => s.id).join(", ")}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.875rem", opacity: 0.9, margin: "0 0 8px 0" }}>
                  Total Amount
                </p>
                <p style={{ fontSize: "2.25rem", fontWeight: "bold", margin: "0" }}>
                  RWF {totalPrice.toLocaleString()}
                </p>
              </div>
              <button style={{
                background: "white",
                color: "#059669",
                padding: "16px 40px",
                borderRadius: "16px",
                fontWeight: "bold",
                fontSize: "1.125rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s"
              }}>
                Book Now →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BusSeat({ seat, onClick }: BusSeatProps): JSX.Element {
  if (!seat) return <div style={{ width: "56px", height: "56px" }} />;

  const getStyles = () => {
    const base = {
      width: "56px",
      height: "56px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold" as const,
      fontSize: "0.875rem",
      transition: "all 0.2s",
      cursor: "pointer",
      position: "relative" as const,
      border: "3px solid",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    };

    if (seat.status === SeatStatus.AVAILABLE) {
      return {
        ...base,
        background: "#3b82f6",
        borderColor: "#1d4ed8",
        color: "white",
      };
    } else if (seat.status === SeatStatus.SELECTED) {
      return {
        ...base,
        background: "#10b981",
        borderColor: "#047857",
        color: "white",
        transform: "scale(1.1)",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(16, 185, 129, 0.3)",
      };
    } else {
      return {
        ...base,
        background: "#eab308",
        borderColor: "#a16207",
        color: "#1f2937",
        cursor: "not-allowed",
      };
    }
  };

  return (
    <div
      onClick={() => seat.status !== SeatStatus.BOOKED && onClick(seat.id)}
      style={getStyles()}
      title={seat.passenger || `Seat ${seat.id}`}
    >
      <span style={{ position: "relative", zIndex: 10 }}>{seat.id}</span>
      {seat.status === SeatStatus.SELECTED && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.1)",
          borderRadius: "12px"
        }}>
          <span style={{ fontSize: "1.5rem" }}>✓</span>
        </div>
      )}
    </div>
  );
}

function PassengerLabel({ seat, position }: PassengerLabelProps): JSX.Element {
  if (!seat) return <div style={{ height: "56px" }} />;

  const isBooked = seat.status === SeatStatus.BOOKED;
  const isSelected = seat.status === SeatStatus.SELECTED;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      height: "56px",
      ...(position === "right" ? { flexDirection: "row-reverse" as const, textAlign: "right" as const } : {})
    }}>
      <div style={{
        width: "16px",
        height: "16px",
        borderRadius: "4px",
        border: "2px solid",
        background: isBooked ? "#eab308" : isSelected ? "#10b981" : "#3b82f6",
        borderColor: isBooked ? "#a16207" : isSelected ? "#047857" : "#1d4ed8"
      }} />
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: "0.875rem",
          fontWeight: "bold",
          color: isBooked ? "#374151" : isSelected ? "#059669" : "#6b7280",
          margin: "0 0 2px 0"
        }}>
          {isBooked ? seat.passenger : isSelected ? "Your Seat" : "Available"}
        </p>
        <p style={{
          fontSize: "0.75rem",
          color: "#9ca3af",
          fontWeight: "500",
          margin: "0"
        }}>
          Seat {seat.id}
        </p>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: LegendItemProps): JSX.Element {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: color,
        border: "3px solid #9ca3af",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }} />
      <span style={{
        fontSize: "1rem",
        fontWeight: "bold",
        color: "#374151"
      }}>{label}</span>
    </div>
  );
}

function Wheel({ style, size = "normal" }: { style: React.CSSProperties; size?: "normal" | "small" }): JSX.Element {
  const wheelSize = size === "small" ? "48px" : "56px";
  const innerInset = size === "small" ? "6px" : "8px";

  return (
    <div style={{
      position: "absolute",
      width: wheelSize,
      height: wheelSize,
      background: "linear-gradient(135deg, #1f2937 0%, #000000 100%)",
      borderRadius: "50%",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      border: "5px solid #374151",
      ...style
    }}>
      <div style={{
        position: "absolute",
        inset: innerInset,
        borderRadius: "50%",
        border: "2px solid #6b7280"
      }} />
    </div>
  );
}