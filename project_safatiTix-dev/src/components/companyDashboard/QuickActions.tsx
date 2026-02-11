import React from 'react';
import { Plus, Bus, Ticket, FileText, Phone, Users } from 'lucide-react';

export const QuickActions: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl shadow-lg p-6 text-white">
      <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-center transition-all hover:scale-105">
          <Plus className="w-5 h-5 mx-auto mb-1" />
          <span className="text-xs font-semibold block">New Schedule</span>
        </button>
        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-center transition-all hover:scale-105">
          <Bus className="w-5 h-5 mx-auto mb-1" />
          <span className="text-xs font-semibold block">Add Bus</span>
        </button>
        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-center transition-all hover:scale-105">
          <Ticket className="w-5 h-5 mx-auto mb-1" />
          <span className="text-xs font-semibold block">View Tickets</span>
        </button>
        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-center transition-all hover:scale-105">
          <FileText className="w-5 h-5 mx-auto mb-1" />
          <span className="text-xs font-semibold block">Reports</span>
        </button>
        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-center transition-all hover:scale-105">
          <Phone className="w-5 h-5 mx-auto mb-1" />
          <span className="text-xs font-semibold block">Call Driver</span>
        </button>
        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-center transition-all hover:scale-105">
          <Users className="w-5 h-5 mx-auto mb-1" />
          <span className="text-xs font-semibold block">Drivers</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
