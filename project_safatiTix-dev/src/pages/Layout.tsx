import React from 'react';
import { Outlet } from 'react-router-dom';
import { LandingPage } from './public/LandingPage';

const Layout = ({ showLanding = false }: { showLanding?: boolean }) => {
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
    </div>
  );
};

export default Layout;
