import { useState } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { ScannedTicketPage } from './components/ScannedTicketPage';
import { Settings } from './components/Settings';
import { AdminDashboard } from './components/AdminDashboard';
import { CompanyDashboard } from './components/CompanyDashboard';
import { CommuterDashboard } from './components/CommuterDashboard';
import { DriverDashboard } from './components/DriverDashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  

  // Lightweight route detection via query params (no react-router) for scanned ticket view
  const params = new URLSearchParams(window.location.search);
  if (params.get('payload') || params.get('ticketId') || params.get('id')) {
    return <ScannedTicketPage />;
  }

  // Show settings if requested by logged-in user
  if (user && showSettings) {
    return <Settings onBack={() => setShowSettings(false)} />;
  }

  // Show login/signup modals
  if (!user && (showLogin || showSignup)) {
    return <Login onBack={() => { setShowLogin(false); setShowSignup(false); }} />;
  }

  // Show landing page if not logged in
  if (!user) {
    return (
      <LandingPage
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => setShowSignup(true)}
      />
    );
  }

  // Route based on user role - pass onSettings callback to all dashboards
  switch (user.role) {
    case 'admin':
      return <AdminDashboard onSettings={() => setShowSettings(true)} />;
    case 'company_admin':
      return <CompanyDashboard onSettings={() => setShowSettings(true)} />;
    case 'commuter':
      return <CommuterDashboard onSettings={() => setShowSettings(true)} />;
    case 'driver':
      return <DriverDashboard onSettings={() => setShowSettings(true)} />;
    default:
      return <LandingPage onLoginClick={() => setShowLogin(true)} onSignupClick={() => setShowSignup(true)} />;
  }
}



export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
