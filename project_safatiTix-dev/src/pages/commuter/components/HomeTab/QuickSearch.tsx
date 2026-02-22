// commuter-dashboard/components/HomeTab/QuickSearch.tsx
import React from 'react';
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';
import SearchResults from '../../../../components/SearchResults';

interface QuickSearchProps {
  fromInput: string;
  toInput: string;
  dateInput: string;
  searchError: string | null;
  searchLoading: boolean;
  searchPerformed: boolean;
  searchResults: any[];
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSearch: (e?: React.FormEvent) => void;
}

export default function QuickSearch({
  fromInput,
  toInput,
  dateInput,
  searchError,
  searchLoading,
  searchPerformed,
  searchResults,
  onFromChange,
  onToChange,
  onDateChange,
  onSearch
}: QuickSearchProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0077B6]/10 rounded-xl flex items-center justify-center">
          <Search className="w-5 h-5 text-[#0077B6]" />
        </div>
        Find Your Next Trip
      </h3>
      
      <form onSubmit={onSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Kigali"
                value={fromInput}
                onChange={(e) => onFromChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#0077B6] focus:outline-none transition-all text-gray-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Musanze"
                value={toInput}
                onChange={(e) => onToChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#0077B6] focus:outline-none transition-all text-gray-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date (Optional)</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateInput}
                onChange={(e) => onDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#0077B6] focus:outline-none transition-all text-gray-900 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-2">
          <button
            type="submit"
            disabled={searchLoading}
            className="w-full md:w-1/2 lg:w-1/3 bg-[#0077B6] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#005F8E] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searchLoading ? 'Searching...' : 'Search Buses'}
            {!searchLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {searchError && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-between">
          <span>{searchError}</span>
          <button onClick={onSearch} className="text-sm px-3 py-1 bg-red-100 rounded-lg">Try again</button>
        </div>
      )}

      {searchPerformed && !searchLoading && searchResults.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
          No schedules available for this route at the moment.
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Search Results</h4>
          <SearchResults results={searchResults} />
        </div>
      )}
    </div>
  );
}