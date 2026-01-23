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


const Footer = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

     const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  
  return (

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#006AFF] text-white p-2 rounded-lg">
                  <Bus className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  SafariTix
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Revolutionizing bus travel across Rwanda with modern technology and exceptional service.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('home')} className="text-gray-400 hover:text-[#006AFF]">Home</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="text-gray-400 hover:text-[#006AFF]">How it Works</button></li>
                <li><button onClick={() => scrollToSection('achievements')} className="text-gray-400 hover:text-[#006AFF]">Achievements</button></li>
                <li><button onClick={() => scrollToSection('team')} className="text-gray-400 hover:text-[#006AFF]">Team</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#006AFF]">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#006AFF]">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#006AFF]">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#006AFF]">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Connect</h4>
              <div className="flex gap-3 mb-4">
                <a href="#" className="p-2 bg-gray-800 hover:bg-[#006AFF] rounded-lg transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 hover:bg-[#006AFF] rounded-lg transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 hover:bg-[#006AFF] rounded-lg transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <p className="text-gray-400 text-sm">support@safaritix.rw</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 SafariTix. All rights reserved.</p>
          </div>
        </div>
      </footer>

  )
}

export default Footer