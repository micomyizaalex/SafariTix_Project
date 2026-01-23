const statsLoading = false; // Simulated loading state
import { Bus, Ticket, TrendingUp, Users } from 'lucide-react';
const stats={
    
    activeUsers: 0,
    activeBuses: 0,
    totalTicketsBooked: 0,
    growthRate: 0
  
}
export const statsDisplay = [
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



  export const teamMembers = [
    {
      name: 'Alexis',
      role: 'Project Manager',
      photo: '/images/alexis.jpg',
      bio: 'Leading the team with strategic vision and excellence, ensuring every milestone is achieved on time and every stakeholder is aligned with our goals.'
    },
    {
      name: 'Caleb',
      role: 'Frontend Developer',
      photo: '/images/karebu.jpg',
      bio: 'Crafting pixel-perfect user experiences with modern frameworks, bringing designs to life with clean, maintainable code.'
    },
    {
      name: 'Oscar',
      role: 'Backend Developer',
      photo: '/images/oscar.jpg',
      bio: 'Building robust and scalable server infrastructure, optimizing databases, and ensuring secure, high-performance APIs.'
    },
    {
      name: 'Girbert',
      role: 'UI/UX Designer',
      photo: '/images/girbert.jpg',
      bio: 'Designing intuitive and beautiful interfaces that delight users, focusing on usability and aesthetic excellence.'
    },
    {
      name: 'Nikita',
      role: 'Project Assistant',
      photo: '/images/nikita.jpg',
      bio: 'Coordinating project activities and supporting team success, ensuring smooth communication and efficient workflows.'
    }
  ];