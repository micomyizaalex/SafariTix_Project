import React,{useState,useEffect} from 'react'
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


import { useTheme } from './ThemeContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Link } from 'react-router-dom';

const TopBar = () => {

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

    
         const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setMobileMenuOpen(false);
        }
      };


      
    
  return (
    <div>
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-[#006AFF] text-white p-2 rounded-lg">
                <Bus className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                SafariTix
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/">
                <button className="hover:text-[#006AFF] transition-colors">
                  Home
                </button>
              </Link>
              <Link to="/#howto">
                <button className="hover:text-[#006AFF] transition-colors">
                  How it Works
                </button>
              </Link>
              <Link to="/#achievements">
                <button onClick={() => scrollToSection('achievements')} className="hover:text-[#006AFF] transition-colors">
                Achievements
              </button>
              </Link>
              <Link to="/#team">
                <button onClick={() => scrollToSection('team')} className="hover:text-[#006AFF] transition-colors">
                  Team
                </button>
              </Link>
              <Link to="/#contact">
                <button onClick={() => scrollToSection('contact')} className="hover:text-[#006AFF] transition-colors">
                  Contact
                </button>
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                    <Button variant="outline">
                  Login
                </Button>
                </Link>
                <Link to="/signup">
                <Button 
               
                  className="bg-[#006AFF] hover:bg-[#0056cc]"
                >
                  Sign Up
                </Button>
                </Link>
              </div>

              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
              <nav className="flex flex-col gap-3">
                 <Link to="/">
                    <button className="text-left py-2 hover:text-[#006AFF]">
                        Home
                        </button>
                 </Link>
                  
                <Link to="/">
                        How it Works
                    
                </Link>
                <button onClick={() => scrollToSection('achievements')} className="text-left py-2 hover:text-[#006AFF]">
                  Achievements
                </button>
                <button onClick={() => scrollToSection('team')} className="text-left py-2 hover:text-[#006AFF]">
                  Team
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-left py-2 hover:text-[#006AFF]">
                  Contact
                </button>
                <div className="flex gap-2 mt-2">
                    <Link to="/login">
                        <Button variant="outline"  className="flex-1">
                            Login
                        </Button>
                  </Link>
                   <Link to="/signup">
                      <Button  className="flex-1 bg-[#006AFF] hover:bg-[#0056cc]">
                            Sign Up
                      </Button>
                   </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      
    </div>
  )
}

export default TopBar