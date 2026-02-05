import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  Bus, 
  Ticket, 
  MapPin, 
  Users, 
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  CheckCircle,
  Smartphone,
  Clock,
  Shield,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface LandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function LandingPage({ onLoginClick, onSignupClick }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Ticket,
      title: 'Easy Ticket Booking',
      description: 'Book your bus tickets in seconds with our intuitive platform. Select routes, choose seats, and pay securely.',
      color: '#0077B6'
    },
    {
      icon: MapPin,
      title: 'Live Bus Tracking',
      description: 'Track your bus in real-time. Know exactly where your bus is and when it will arrive at your location.',
      color: '#F4A261'
    },
    {
      icon: Users,
      title: 'Multi-User Platform',
      import React, { useState } from 'react';
      import { Button } from './ui/button';
      import { Card, CardContent } from './ui/card';
      import {
        Menu,
        X,
        Bus,
        Ticket,
        MapPin,
        Users,
        Facebook,
        Twitter,
        Instagram,
        Linkedin
      } from 'lucide-react';

      interface LandingPageProps {
        onLoginClick?: () => void;
        onSignupClick?: () => void;
      }

      export function LandingPage({ onLoginClick = () => {}, onSignupClick = () => {} }: LandingPageProps) {
        const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          }
        ];

        return (
          <div className="min-h-screen font-inter">
            {/* full-width deep sky blue hero */}
            <header className="relative bg-[#0077B6] text-white overflow-hidden">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-6">
                  <div className="hidden md:flex items-center gap-8 text-sm">
                    <a href="#home" className="opacity-90 hover:opacity-100">Home</a>
                    <a href="#about" className="opacity-90 hover:opacity-100">About</a>
                    <a href="#features" className="opacity-90 hover:opacity-100">Features</a>
                    <a href="#contact" className="opacity-90 hover:opacity-100">Contact</a>
                  </div>

                  <div className="flex-1 flex justify-center md:justify-start">
                    <div className="flex items-center gap-3">
                      <Bus className="w-8 h-8 text-white" />
                      <span className="text-2xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>SafariTix</span>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-3">
                    <button onClick={onLoginClick} className="text-white/90 hover:text-white">Login</button>
                    <Button onClick={onSignupClick} className="bg-white text-[#0077B6] rounded-full px-4 py-2">Sign up</Button>
                  </div>

                  <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>

                {mobileMenuOpen && (
                  <div className="md:hidden py-4 space-y-3">
                    <a href="#home" className="block">Home</a>
                    <a href="#about" className="block">About</a>
                    <a href="#features" className="block">Features</a>
                    <a href="#contact" className="block">Contact</a>
                  </div>
                )}
              </div>

              {/* hero content */}
              <div className="container mx-auto px-4 pt-12 pb-20">
                <div className="text-center max-w-3xl mx-auto">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Smart Bus Ticketing
                    <br />
                    <span className="text-[#F4A261]">Reliable. Fast. Local.</span>
                  </h1>
                  <p className="mt-4 text-white/90 text-base sm:text-lg">
                    Book tickets, track buses in real-time, and manage subscriptions with SafariTix — Rwanda’s modern bus travel platform.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button onClick={onSignupClick} className="bg-[#F4A261] text-[#2B2D42] font-semibold px-6 py-3 rounded-full shadow-lg transform hover:-translate-y-0.5 transition">Get Started</Button>
                    <Button onClick={onLoginClick} className="bg-white/20 border border-white/30 text-white px-6 py-3 rounded-full">Sign Up</Button>
                  </div>
                </div>

                {/* mockup phones - centered and side-by-side on medium+ */}
                <div className="mt-12 flex justify-center items-end gap-6 relative">
                  {/* left phone */}
                  <div className="w-48 sm:w-56 md:w-64 lg:w-72 transform md:-rotate-6 md:translate-y-6 hover:md:rotate-0 transition-transform duration-500">
                    <div className="bg-white rounded-3xl shadow-2xl p-3" style={{ borderRadius: '34px' }}>
                      <div className="h-[460px] md:h-[520px] bg-gradient-to-b from-white to-gray-100 rounded-2xl flex flex-col p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm font-semibold">SafariTix</div>
                          <div className="text-xs text-gray-500">09:41</div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-start px-2">
                          <h4 className="text-lg font-semibold">My Tickets</h4>
                          <p className="text-sm text-gray-600 mt-2">Next trip: Kigali → Butare</p>
                          <div className="mt-6 w-full bg-white rounded-lg p-3 shadow-inner">
                            <p className="text-sm font-semibold">Seat B12</p>
                            <p className="text-xs text-gray-500">Valid: Today 10:00 AM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* center phone (prominent) */}
                  <div className="w-56 sm:w-64 md:w-72 lg:w-80 transform scale-105 z-20">
                    <div className="bg-white rounded-3xl shadow-3xl p-3" style={{ borderRadius: '36px' }}>
                      <div className="h-[500px] md:h-[560px] bg-gradient-to-b from-white to-gray-100 rounded-2xl flex flex-col p-4 items-center justify-center">
                        <div className="text-sm text-gray-500 mb-2">Live Map</div>
                        <div className="w-full h-64 bg-gradient-to-br from-[#E8F7FF] to-white rounded-lg shadow-inner flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-[#0077B6]" />
                        </div>
                        <div className="mt-6 text-center">
                          <h4 className="text-lg font-semibold">Bus #A34</h4>
                          <p className="text-sm text-gray-600">Arriving in 4 min • 3.2 km away</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* right phone */}
                  <div className="w-48 sm:w-56 md:w-64 lg:w-72 transform md:rotate-6 md:translate-y-6 hover:md:rotate-0 transition-transform duration-500">
                    <div className="bg-white rounded-3xl shadow-2xl p-3" style={{ borderRadius: '34px' }}>
                      <div className="h-[460px] md:h-[520px] bg-gradient-to-b from-white to-gray-100 rounded-2xl flex flex-col p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm font-semibold">SafariTix</div>
                          <div className="text-xs text-gray-500">09:41</div>
                        </div>
                        <div className="flex-1 px-2">
                          <h4 className="text-lg font-semibold">Subscription</h4>
                          <p className="text-sm text-gray-600 mt-2">Monthly pass • Unlimited rides</p>
                          <div className="mt-6 w-full bg-white rounded-lg p-3 shadow-inner">
                            <p className="text-sm font-semibold text-[#27AE60]">Active</p>
                            <p className="text-xs text-gray-500">Renews: 1 June</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* subtle shadow area under phones */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 w-96 h-24 bg-white/10 rounded-full filter blur-3xl"></div>
                </div>

                {/* app store badges centered near bottom like reference */}
                <div className="mt-10 flex justify-center gap-4">
                  <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    <div>
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </div>
                  <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
                    <div>
                      <div className="text-xs">GET IT ON</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* left vertical social icons (absolute) */}
              <div className="hidden md:flex flex-col gap-4 absolute left-6 top-1/3 text-white">
                <a href="#" className="opacity-90 hover:opacity-100"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="opacity-90 hover:opacity-100"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="opacity-90 hover:opacity-100"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="opacity-90 hover:opacity-100"><Linkedin className="w-5 h-5" /></a>
              </div>
            </header>

            {/* Features section - clean white background */}
            <section id="features" className="bg-white py-16">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Core Features</h2>
                  <p className="mt-2 text-gray-600">Everything commuters and operators need in one platform</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((f, i) => (
                    <Card key={i} className="shadow-lg rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0077B6] text-white">
                            <f.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{f.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{f.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="bg-white/5 py-16">
              <div className="container mx-auto px-4 text-center">
                <h3 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>What Commuters Say</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg text-left">
                    <p className="italic">"Booking is instant and tracking is spot on — I never miss my bus now."</p>
                    <p className="mt-4 font-semibold">— Jean Uwimana, Commuter</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg text-left">
                    <p className="italic">"Our company streamlined operations after adopting SafariTix."</p>
                    <p className="mt-4 font-semibold">— Marie Mugabo, Operator</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg text-left">
                    <p className="italic">"Driver app is intuitive and easy to use on the road."</p>
                    <p className="mt-4 font-semibold">— Patrick Nkusi, Driver</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#2B2D42] text-white py-10">
              <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Bus className="w-7 h-7" />
                    <span className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>SafariTix</span>
                  </div>
                  <p className="text-white/70 text-sm">Modern bus ticketing, tracking and subscriptions across Rwanda.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Quick Links</h4>
                  <ul className="text-white/70 space-y-2 text-sm">
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Features</a></li>
                    <li><a href="#">Pricing</a></li>
                    <li><a href="#">Support</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">For Business</h4>
                  <ul className="text-white/70 space-y-2 text-sm">
                    <li><a href="#">Company Signup</a></li>
                    <li><a href="#">Driver Portal</a></li>
                    <li><a href="#">API</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Contact</h4>
                  <p className="text-white/70 text-sm">info@safaritix.rw</p>
                  <p className="text-white/70 text-sm mt-2">+250 788 123 456</p>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6 text-center text-white/70 text-sm">© 2026 SafariTix. All rights reserved.</div>
            </footer>
          </div>
        );
      }
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#0077B6] to-[#005a8c]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold mb-4 text-white"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              What Our Users Say
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Trusted by thousands of commuters and transport companies across Rwanda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#F4A261] text-[#F4A261]" />
                    ))}
                  </div>
                  <p className="text-white mb-6 italic">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{testimonial.name}</p>
                    <p className="text-white/70 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 text-[#0077B6]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied users. Sign up now and experience the future of bus travel.
          </p>
          <Button 
            onClick={onSignupClick}
            size="lg"
            className="bg-[#0077B6] hover:bg-[#005a8c] text-white font-bold px-12 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Create Free Account
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#2B2D42] text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Bus className="w-8 h-8" />
                <span className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>SafariTix</span>
              </div>
              <p className="text-white/70 mb-4">
                Rwanda's leading bus ticketing and tracking platform
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Quick Links</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#home" className="hover:text-[#F4A261] transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-[#F4A261] transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-[#F4A261] transition-colors">About Us</a></li>
                <li><a href="#contact" className="hover:text-[#F4A261] transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* For Business */}
            <div>
              <h3 className="font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>For Business</h3>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-[#F4A261] transition-colors">Company Registration</a></li>
                <li><a href="#" className="hover:text-[#F4A261] transition-colors">Driver Portal</a></li>
                <li><a href="#" className="hover:text-[#F4A261] transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-[#F4A261] transition-colors">API Access</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Contact Us</h3>
              <ul className="space-y-2 text-white/70">
                <li>Email: info@safaritix.rw</li>
                <li>Phone: +250 788 123 456</li>
                <li>Kigali, Rwanda</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/70 text-sm mb-4 md:mb-0">
              © 2026 SafariTix. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/70 hover:text-[#F4A261] transition-colors">Privacy Policy</a>
              <a href="#" className="text-white/70 hover:text-[#F4A261] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
