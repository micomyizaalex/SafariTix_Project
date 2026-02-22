// commuter-dashboard/components/MobileBottomNav.tsx
import React from 'react';
import { Home, Ticket, MapPin, Bell, User } from 'lucide-react';
import { useTabStore } from '../../stores/tabStore';

interface MobileBottomNavProps {
  notificationCount: number;
}

export default function MobileBottomNav({ notificationCount }: MobileBottomNavProps) {
  const { activeTab, setActiveTab } = useTabStore();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tickets', icon: Ticket, label: 'Tickets' },
    { id: 'map', icon: MapPin, label: 'Map' },
    { id: 'notifications', icon: Bell, label: 'Alerts', badge: notificationCount },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 safe-bottom z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 relative ${
                activeTab === item.id ? 'text-[#0077B6]' : 'text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}