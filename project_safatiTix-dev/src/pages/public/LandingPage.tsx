// pages/public/LandingPage.tsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from './header';
import { PhoneMockups } from '../../components/PhoneMockups';
import {
  Ticket,
  MapPin,
  Users,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronRight,
  Star,
  Clock,
  Shield,
  Smartphone,
  Bus
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Ticket,
      title: 'Instant Ticket Booking',
      description: 'Book seats quickly with secure checkout and mobile ticketing.'
    },
    {
      icon: MapPin,
      title: 'Real-Time Bus Tracking',
      description: 'See live bus locations and accurate arrival times on the map.'
    },
    {
      icon: Users,
      title: 'Subscription & Passes',
      description: 'Buy monthly passes and manage subscriptions for frequent travel.'
    },
    {
      icon: Clock,
      title: 'Smart Scheduling',
      description: 'View all routes and schedules in real-time with instant updates.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and encrypted payment processing for all transactions.'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Optimized for mobile with native apps for iOS and Android.'
    }
  ];

  const testimonials = [
    {
      name: 'Jean Uwimana',
      role: 'Daily Commuter',
      comment: 'Booking is instant and tracking is spot on — I never miss my bus now.',
      rating: 5
    },
    {
      name: 'Marie Mugabo',
      role: 'Transport Operator',
      comment: 'Our company streamlined operations after adopting SafariTix.',
      rating: 5
    },
    {
      name: 'Patrick Nkusi',
      role: 'Bus Driver',
      comment: 'Driver app is intuitive and easy to use on the road.',
      rating: 5
    }
  ];

  const footerLinks = {
    quick: [
      { name: 'Home', to: '/' },
      { name: 'Features', to: '#features' },
      { name: 'Pricing', to: '/pricing' },
      { name: 'Support', to: '/support' }
    ],
    business: [
      { name: 'Company Signup', to: '/app/signup?type=company' },
      { name: 'Driver Portal', to: '/driver/login' },
      { name: 'API', to: '/developers' }
    ]
  };

  return (
    <div className="font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-[#0077B6] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="pt-20 pb-20">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-extrabold font-montserrat leading-tight">
                Smart Bus Ticketing
                <br />
                <span className="text-[#F4A261]">Reliable. Fast. Local.</span>
              </h1>
              <p className="mt-4 text-white/90 text-base md:text-lg leading-relaxed">
                Book tickets, track buses in real-time, and manage subscriptions with SafariTix — Rwanda's modern bus travel platform.
              </p>

              <div className="mt-8 flex flex-row items-center justify-center gap-4 flex-wrap">
                <Link
                  to="/app/signup"
                  className="bg-[#F4A261] text-[#2B2D42] border-none rounded-full px-6 py-3 font-semibold shadow-lg hover:scale-105 transition-all duration-200 inline-block"
                >
                  Get Started
                </Link>
                <Link
                  to="/app/login"
                  className="bg-white/20 border border-white/30 text-white rounded-full px-6 py-3 hover:bg-white/30 transition-all duration-200 inline-block"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <PhoneMockups />

            {/* App Store Badges */}
            <div className="mt-10 flex justify-center gap-4 flex-wrap">
              <a
                href="https://apps.apple.com/rw/app/safaritix/id123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg cursor-pointer hover:scale-105 transition-transform"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.safaritix.app"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg cursor-pointer hover:scale-105 transition-transform"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div>
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>

          {/* Social Icons */}
          <div className="hidden md:flex flex-col gap-4 absolute left-6 top-1/3 text-white">
            <a
              href="https://facebook.com/safaritix"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-90 hover:opacity-100 transition-opacity"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com/safaritix"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-90 hover:opacity-100 transition-opacity"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/safaritix"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-90 hover:opacity-100 transition-opacity"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com/company/safaritix"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-90 hover:opacity-100 transition-opacity"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold font-montserrat text-center mb-2">Core Features</h2>
          <p className="text-center text-gray-500 text-lg mb-12">Everything commuters and operators need in one platform</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0077B6] text-white flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold font-montserrat mb-2 text-lg">{feature.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#0077B6] to-[#005a8c]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl md:text-5xl font-semibold font-montserrat text-center text-white mb-2">What Commuters Say</h3>
          <p className="text-center text-white/80 text-lg mb-12">Trusted by thousands across Rwanda</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#F4A261] text-[#F4A261]" />
                  ))}
                </div>
                <p className="text-white italic mb-6 leading-relaxed">"{testimonial.comment}"</p>
                <div>
                  <p className="text-white font-bold font-montserrat mb-1">{testimonial.name}</p>
                  <p className="text-white/70 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0077B6] font-montserrat mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-500 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied users. Sign up now and experience the future of bus travel.
          </p>
          <Link
            to="/app/signup"
            className="bg-[#0077B6] text-white border-none rounded-full px-12 py-4 text-lg font-bold shadow-xl hover:scale-105 hover:bg-[#005a8c] transition-all duration-300 inline-flex items-center gap-2"
          >
            Create Free Account
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#2B2D42] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4">
                <Bus className="w-8 h-8" />
                <span className="text-xl font-semibold font-montserrat">SafariTix</span>
              </Link>
              <p className="text-white/70 text-sm">
                Modern bus ticketing, tracking and subscriptions across Rwanda.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold font-montserrat mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {footerLinks.quick.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="text-white/70 hover:text-[#F4A261] text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Business */}
            <div>
              <h4 className="font-bold font-montserrat mb-4">For Business</h4>
              <ul className="space-y-2">
                {footerLinks.business.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="text-white/70 hover:text-[#F4A261] text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold font-montserrat mb-4">Contact</h4>
              <a
                href="mailto:info@safaritix.rw"
                className="text-white/70 hover:text-[#F4A261] text-sm block mb-2 transition-colors"
              >
                info@safaritix.rw
              </a>
              <a
                href="tel:+250793216602"
                className="text-white/70 hover:text-[#F4A261] text-sm block transition-colors"
              >
                +250 793 216 602
              </a>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm">© 2026 SafariTix. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="text-white/70 hover:text-[#F4A261] text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-white/70 hover:text-[#F4A261] text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}