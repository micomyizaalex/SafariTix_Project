import React,{useState} from 'react'
import { 
  Bus, 
  Search, 
  Ticket, 
  MapPin, 
  Users, 
  TrendingUp, 
  Moon, 
  Sun,
  Menu,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPinned
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { statsDisplay, teamMembers } from '../utils/data';
const HomePage = () => {

 const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [stats, setStats] = useState({
    activeUsers: 0,
    activeBuses: 0,
    totalTicketsBooked: 0,
    growthRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  
 const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
 }




  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="py-20 md:py-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Welcome to <span className="text-[#006AFF]">SafariTix</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Your hassle-free bus ticketing system. Book tickets, track buses in real-time, and travel with confidence across Rwanda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/"
                 
                >
                  <Button>Get Started</Button>
                </Link>

                <Link to="/">
                        <Button 
                      size="lg" 
                      variant="outline" 
                      
                      className="text-lg px-8"
                    >
                      Login
                    </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                    <Search className="w-6 h-6 text-[#006AFF]" />
                    <div>
                      <p className="font-semibold">Search Routes</p>
                      <p className="text-sm text-muted-foreground">Find your destination</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-gray-700 rounded-lg">
                    <Ticket className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold">Book Instantly</p>
                      <p className="text-sm text-muted-foreground">Secure your seat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-gray-700 rounded-lg">
                    <MapPin className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="font-semibold">Track Live</p>
                      <p className="text-sm text-muted-foreground">Real-time location</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>




      
      {/* How It Works Section */}
      <section id="howto" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started with SafariTix is easy. Just three simple steps to your journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-[#006AFF] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  1. Choose Route
                </h3>
                <p className="text-muted-foreground">
                  Search and select your departure and destination cities. View available schedules and prices.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-[#006AFF] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  2. Book Ticket
                </h3>
                <p className="text-muted-foreground">
                  Select your preferred seat, make secure payment, and receive your digital ticket with QR code.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-[#006AFF] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  3. Track in Real-Time
                </h3>
                <p className="text-muted-foreground">
                  Track your bus location live on the map. Know exactly when your bus will arrive.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-20 bg-gradient-to-br from-[#006AFF]/5 to-indigo-50/50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-3xl md:text-5xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Our <span className="text-[#006AFF]">Achievements</span>
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-sm">
                <div className={`w-2 h-2 rounded-full bg-green-500 ${statsLoading ? 'animate-pulse' : 'animate-ping'}`}></div>
                <span className="text-green-700 dark:text-green-400">Live Data</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by thousands across Rwanda. Here's what we've accomplished together.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsDisplay.map((stat:any, index:number) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden">
                  <CardContent className="p-6">
                    {statsLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                           style={{ 
                             backgroundSize: '200% 100%',
                             animation: 'shimmer 2s infinite'
                           }} 
                      />
                    )}
                    <div className={`${stat.color === 'text-green-600' ? 'bg-green-100 dark:bg-green-900/30' : stat.color === 'text-red-600' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-[#006AFF]/10'} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-6 h-6 ${stat.color || 'text-[#006AFF]'}`} />
                    </div>
                    <div className={`text-3xl font-bold ${stat.color || 'text-[#006AFF]'} mb-2 transition-all ${statsLoading ? 'opacity-50' : 'opacity-100'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {stat.value}
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Growth Rate Info */}
          {!statsLoading && (
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Growth rate is calculated based on ticket bookings: current month vs. previous month
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Team Section with Auto-Slide Carousel */}
      <section id="team" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Meet Our <span className="text-[#006AFF]">Team</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The talented individuals behind SafariTix, working together to revolutionize bus travel.
            </p>
          </div>

          {/* Auto-Slide Carousel */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="overflow-hidden shadow-2xl">
              <div className="relative">
                {/* Main Carousel Content */}
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left: Image */}
                  <div className="relative h-96 md:h-auto overflow-hidden">
                    <img
                      key={currentTeamIndex}
                      src={teamMembers[currentTeamIndex].photo}
                      alt={teamMembers[currentTeamIndex].name}
                      className="w-full h-full object-cover carousel-item"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Team member number indicator */}
                    <div className="absolute top-4 right-4 bg-white dark:bg-[#2B2D42] rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      <span className="font-bold text-[#006AFF]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {currentTeamIndex + 1}/{teamMembers.length}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right: Info */}
                  <CardContent className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-[#006AFF]/5 to-transparent dark:from-[#006AFF]/10">
                    <div key={`info-${currentTeamIndex}`} className="mb-6 carousel-item">
                      <div className="inline-block px-4 py-1 bg-[#006AFF] text-white rounded-full text-sm mb-4">
                        {teamMembers[currentTeamIndex].role}
                      </div>
                      <h3 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {teamMembers[currentTeamIndex].name}
                      </h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {teamMembers[currentTeamIndex].bio}
                      </p>
                    </div>

                    {/* Carousel Indicators */}
                    <div className="flex gap-2 mt-6">
                      {teamMembers.map((_:any, index:number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentTeamIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentTeamIndex 
                              ? 'w-12 bg-[#006AFF]' 
                              : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-[#006AFF]/50'
                          }`}
                          aria-label={`Go to team member ${index + 1}`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>

          {/* Team Grid (All Members) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {teamMembers.map((member:any, index:number) => (
              <button
                key={index}
                onClick={() => setCurrentTeamIndex(index)}
                className={`group relative overflow-hidden rounded-xl transition-all ${
                  index === currentTeamIndex 
                    ? 'ring-4 ring-[#006AFF] scale-105' 
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {member.name}
                    </p>
                    <p className="text-xs opacity-90">{member.role}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Get In <span className="text-[#006AFF]">Touch</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block mb-2">Name</label>
                      <Input
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Email</label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Message</label>
                      <Textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Your message..."
                        rows={5}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#006AFF] hover:bg-[#0056cc]">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-[#006AFF] mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Email</h4>
                      <p className="text-muted-foreground">support@safaritix.rw</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-[#006AFF] mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Phone</h4>
                      <p className="text-muted-foreground">+250 788 123 456</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <MapPinned className="w-6 h-6 text-[#006AFF] mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Location</h4>
                      <p className="text-muted-foreground">Kigali, Rwanda</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h4 className="font-bold mb-4">Follow Us</h4>
                  <div className="flex gap-4">
                    <a href="#" className="p-3 bg-[#006AFF]/10 hover:bg-[#006AFF] hover:text-white rounded-lg transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="#" className="p-3 bg-[#006AFF]/10 hover:bg-[#006AFF] hover:text-white rounded-lg transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href="#" className="p-3 bg-[#006AFF]/10 hover:bg-[#006AFF] hover:text-white rounded-lg transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>



    </div>
  )
}

export default HomePage