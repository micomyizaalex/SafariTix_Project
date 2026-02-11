import React, { CSSProperties } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../pages/public/header';
import Footer from '../pages/public/Footer';

const SAFARITIX = {
  primary: '#0077B6',
  accent: '#F4A261',
};

export default function PublicLayout() {
  const styles: Record<string, CSSProperties> = {
    wrapper: { display: 'flex', minHeight: '100vh', flexDirection: 'column' },
    main: { flex: 1, background: '#FAFBFF', padding: 24 },
  };

  return (
    <div style={styles.wrapper}>
      <Header />
      <main style={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
