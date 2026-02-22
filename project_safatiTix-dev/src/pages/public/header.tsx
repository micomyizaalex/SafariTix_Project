// pages/public/header.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, ChevronDown, Menu, X, HelpCircle, Headphones, User, LogIn, UserPlus } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    { label: 'Home', to: '/' },
    { 
      label: 'Why SafariTix', 
      to: '#why',
      dropdown: [
        { label: 'For Commuters', to: '/commuters' },
        { label: 'For Transport Companies', to: '/companies' },
        { label: 'For Drivers', to: '/drivers' }
      ]
    },
    { 
      label: 'Solutions', 
      to: '#solutions',
      dropdown: [
        { label: 'Bus Tracking', to: '/solutions/tracking' },
        { label: 'Ticketing System', to: '/solutions/ticketing' },
        { label: 'Subscription Management', to: '/solutions/subscriptions' },
        { label: 'Driver App', to: '/solutions/driver-app' },
        { label: 'Company Dashboard', to: '/solutions/dashboard' }
      ]
    },
    { 
      label: 'Resources', 
      to: '#resources',
      dropdown: [
        { label: 'Documentation', to: '/docs' },
        { label: 'Blog', to: '/blog' },
        { label: 'Help Center', to: '/help' },
        { label: 'API Reference', to: '/developers' }
      ]
    },
    { label: 'Pricing', to: '/pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-[#2B2D42] text-white py-2 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>Kigali, Rwanda</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/faq"
              className="flex items-center gap-1.5 text-white/90 hover:text-[#F4A261] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </Link>
            <Link
              to="/support"
              className="flex items-center gap-1.5 text-white/90 hover:text-[#F4A261] transition-colors"
            >
              <Headphones className="w-4 h-4" />
              <span>Support</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 cursor-pointer text-[#0077B6] font-semibold hover:text-[#F4A261] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center cursor-pointer gap-1.5 text-[#0077B6] font-semibold hover:text-[#F4A261] transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <Bus className="w-9 h-9 text-[#0077B6]" />
            <div>
              <div className="text-2xl font-bold text-[#2B2D42] font-montserrat">SAFARITIX</div>
              <div className="text-[0.625rem] text-gray-500 tracking-wider">WE ARE PROFESSIONAL</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.dropdown ? (
                  <>
                    <button
                      className="flex items-center gap-1 text-gray-600 hover:text-[#0077B6] font-medium text-sm py-2"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {activeDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl min-w-[220px] py-2 z-50">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.label}
                            to={subItem.to}
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-[#F5F7FA] hover:text-[#0077B6] transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.to}
                    className="text-gray-600 hover:text-[#0077B6] font-medium text-sm py-2 inline-block"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search Services..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0077B6] focus:outline-none focus:ring-1 focus:ring-[#0077B6] w-48"
              />
            </div>

            {/* Get A Quote Button */}
            <button
              onClick={() => navigate('/app/signup')}
              className="bg-[#F4A261] text-[#2B2D42] border-none rounded-lg px-6 py-2.5 text-sm font-semibold shadow-md hover:bg-[#E76F51] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              <span>Get A Quote</span>
              <span>→</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-[#0077B6]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-6 py-4">
          {navItems.map((item) => (
            <div key={item.label} className="py-3 border-b border-gray-100 last:border-0">
              {item.dropdown ? (
                <>
                  <div className="text-gray-600 font-medium text-sm mb-2">{item.label}</div>
                  <div className="ml-4 space-y-2">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.label}
                        to={subItem.to}
                        className="block text-sm text-gray-500 hover:text-[#0077B6]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={item.to}
                  className="text-gray-600 hover:text-[#0077B6] font-medium text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}

          <div className="mt-4 space-y-3">
            <button
              onClick={() => {
                navigate('/app/login');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#0077B6] text-white font-semibold py-2 rounded-lg hover:bg-[#005a8c] transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => {
                navigate('/app/signup');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 border-2 border-[#0077B6] text-[#0077B6] font-semibold py-2 rounded-lg hover:bg-[#0077B6] hover:text-white transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
            <button
              onClick={() => {
                navigate('/app/signup');
                setMobileMenuOpen(false);
              }}
              className="w-full bg-[#F4A261] text-[#2B2D42] rounded-lg px-4 py-2 font-semibold hover:bg-[#E76F51] transition-colors flex items-center justify-center gap-2"
            >
              <span>Get A Quote</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}