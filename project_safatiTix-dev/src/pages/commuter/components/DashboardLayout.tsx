// commuter-dashboard/components/DashboardLayout.tsx
import React, { ReactNode } from 'react';
import { Bus, Home, Ticket, MapPin, Bell, User, Menu } from 'lucide-react';
import { useTabStore } from '../../../stores/tabStore';
import MobileBottomNav from '../MobileBottomNav';

interface DashboardLayoutProps {
  children: ReactNode;
  notificationCount: number;
}

export default function DashboardLayout({ children, notificationCount }: DashboardLayoutProps) {
  const { activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen } = useTabStore();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-xl flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#0077B6] to-[#005F8E] bg-clip-text text-transparent">
                SafariTix
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-[#0077B6] text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.id === 'notifications' && notificationCount > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-[#0077B6] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>

      <MobileBottomNav notificationCount={notificationCount} />
    </div>
  );
}