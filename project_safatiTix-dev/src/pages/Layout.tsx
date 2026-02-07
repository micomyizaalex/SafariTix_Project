import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LandingPage } from '../components/LandingPage';
import Footer from '../components/Footer';

const Layout = ({ showLanding = false }: { showLanding?: boolean }) => {
  const location = useLocation();
  const hideFooter = location.pathname === '/app/login' || location.pathname === '/app/signup';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* If landing page, render its hero content */}
      {showLanding && <LandingPage />}

      {/* Main content for other pages */}
      {!showLanding && (
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      )}

      {/* Footer - Hidden on login/signup pages */}
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
