import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Switch } from './ui/switch';
// import { SeedDataButton } from './SeedDataButton';
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

interface LandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function LandingPage({ onLoginClick, onSignupClick }: LandingPageProps) {
 

  // Auto-slide team carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTeamIndex((prevIndex) => (prevIndex + 1) % teamMembers.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [teamMembers.length]);

  // Fetch real stats from database
  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       setStatsLoading(true);
  //       const { projectId, publicAnonKey } = await import('../utils/supabase/info');
  //       const response = await fetch(
  //         `https://${projectId}.supabase.co/functions/v1/make-server-0d858e34/public/stats`,
  //         {
  //           headers: {
  //             'Authorization': `Bearer ${publicAnonKey}`
  //           }
  //         }
  //       );
        
  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log('Stats fetched from API:', data);
  //         setStats(data);
  //       } else {
  //         console.error('Stats API error:', response.status, response.statusText);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching stats:', error);
  //     } finally {
  //       setStatsLoading(false);
  //     }
  //   };

  //   fetchStats();
    
  //   // Refresh stats every 30 seconds
  //   const interval = setInterval(fetchStats, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  const statsDisplay = [
    { 
      label: 'Active Users', 
      value: statsLoading ? '...' : `${stats.activeUsers.toLocaleString()}${stats.activeUsers > 0 ? '+' : ''}`, 
      icon: Users,
      color: 'text-[#006AFF]'
    },
    { 
      label: 'Tickets Booked', 
      value: statsLoading ? '...' : `${stats.totalTicketsBooked.toLocaleString()}${stats.totalTicketsBooked > 0 ? '+' : ''}`, 
      icon: Ticket,
      color: 'text-[#006AFF]'
    },
    { 
      label: 'Active Buses', 
      value: statsLoading ? '...' : `${stats.activeBuses.toLocaleString()}${stats.activeBuses > 0 ? '+' : ''}`, 
      icon: Bus,
      color: 'text-[#006AFF]'
    },
    { 
      label: 'Growth Rate', 
      value: statsLoading ? '...' : `${stats.growthRate > 0 ? '+' : ''}${stats.growthRate}%`, 
      icon: TrendingUp,
      color: stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for your message! We will get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Navigation */}
      



     
 
    </div>
  );
}
