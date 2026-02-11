import React from 'react';
import { Truck, Users, DollarSign, MapPin, Plus } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';

export default function CompanyDashboard() {
  const { user } = useAuth();

  // Example placeholder data
  const stats = [
    { label: 'Buses', value: 24, icon: <Truck /> },
    { label: 'Drivers', value: 18, icon: <Users /> },
    { label: 'Revenue (M)', value: 'RWF 3.4M', icon: <DollarSign /> },
  ];

  const buses = [
    { id: 'BUS-001', route: 'Kigali → Gisenyi', status: 'Active' },
    { id: 'BUS-012', route: 'Kigali → Butare', status: 'Maintenance' },
    { id: 'BUS-024', route: 'Kigali → Musanze', status: 'Active' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Company Dashboard</h1>
            <p className="text-sm text-slate-500">Overview of operations for {user?.company || user?.name || 'your company'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md shadow">
              <Plus className="w-4 h-4" />
              New Bus
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10 text-primary">
                {s.icon}
              </div>
              <div>
                <div className="text-sm text-slate-500">{s.label}</div>
                <div className="text-lg font-semibold">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-md font-semibold">Fleet</h2>
                <span className="text-sm text-slate-500">{buses.length} buses</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-600 border-b">
                    <tr>
                      <th className="py-2">ID</th>
                      <th className="py-2">Route</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {buses.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3">{b.id}</td>
                        <td className="py-3">{b.route}</td>
                        <td className="py-3">{b.status}</td>
                        <td className="py-3">
                          <button className="text-sm text-primary font-medium">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-md font-semibold">Live Tracking</h2>
                <span className="text-sm text-slate-500">Real-time bus locations</span>
              </div>
              <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <MapPin className="w-6 h-6 mr-2" /> Live map placeholder
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-sm font-semibold">Quick Actions</h4>
              <div className="mt-3 grid gap-2">
                <button className="text-left px-3 py-2 rounded-md hover:bg-slate-50">Create Schedule</button>
                <button className="text-left px-3 py-2 rounded-md hover:bg-slate-50">Assign Driver</button>
                <button className="text-left px-3 py-2 rounded-md hover:bg-slate-50">Manage Tickets</button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-sm font-semibold">Recent Activity</h4>
              <ul className="mt-3 text-sm text-slate-600 space-y-2">
                <li>Driver John assigned to BUS-012</li>
                <li>Schedule updated for Kigali → Butare</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

