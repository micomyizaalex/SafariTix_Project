// commuter-dashboard/components/HomeTab/index.tsx
import React from 'react';
import NextTripCard from './NextTripCard';
import QuickSearch from './QuickSearch';
import PopularRoutes from '../../../../components/PopularRoutes';
import StatsGrid from './StatsGrid';

interface HomeTabProps {
  upcomingTrips: any[];
  popularRoutes: any[];
  stats: any;
  loading: any;
  fromInput: string;
  toInput: string;
  dateInput: string;
  searchResults: any[];
  searchLoading: boolean;
  searchError: string | null;
  searchPerformed: boolean;
  setFromInput: (value: string) => void;
  setToInput: (value: string) => void;
  setDateInput: (value: string) => void;
  handleSearch: (e?: React.FormEvent) => void;
  setSelectedTicket: (ticket: any) => void;
  setShowTicketModal: (show: boolean) => void;
  calcDuration: (dep?: string | Date, arr?: string | Date) => string | null;
}

export default function HomeTab({
  upcomingTrips,
  popularRoutes,
  stats,
  loading,
  fromInput,
  toInput,
  dateInput,
  searchResults,
  searchLoading,
  searchError,
  searchPerformed,
  setFromInput,
  setToInput,
  setDateInput,
  handleSearch,
  setSelectedTicket,
  setShowTicketModal,
  calcDuration
}: HomeTabProps) {
  return (
    <div className="space-y-6">
      {upcomingTrips.length > 0 && (
        <NextTripCard
          trip={upcomingTrips[0]}
          onViewTicket={() => {
            setSelectedTicket(upcomingTrips[0]);
            setShowTicketModal(true);
          }}
        />
      )}

      <QuickSearch
        fromInput={fromInput}
        toInput={toInput}
        dateInput={dateInput}
        searchError={searchError}
        searchLoading={searchLoading}
        searchPerformed={searchPerformed}
        searchResults={searchResults}
        onFromChange={setFromInput}
        onToChange={setToInput}
        onDateChange={setDateInput}
        onSearch={handleSearch}
      />

      <PopularRoutes
        routes={popularRoutes.map((s: any) => ({
          id: s.id,
          from: s.from || s.origin || 'Unknown',
          to: s.to || s.destination || 'Unknown',
          departureDate: s.date || s.departureDate,
          departureTime: s.time || s.departureTime || '08:00',
          duration: s.duration || calcDuration(s.departureTime, s.arrivalTime),
          price: Number(s.price ?? s.fare ?? 0),
          availableSeats: Number(s.availableSeats ?? s.seatsAvailable ?? 0),
          totalSeats: Number(s.totalSeats ?? s.capacity ?? 0),
          company: s.company || s.operator || '',
        }))}
        onSelect={(r) => {
          setSelectedTicket(r);
          setShowTicketModal(true);
        }}
      />

      <StatsGrid stats={stats} loading={loading} />
    </div>
  );
}