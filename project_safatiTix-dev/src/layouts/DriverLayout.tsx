import React, { CSSProperties } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../pages/public/header';

const SAFARITIX = { primary: '#0077B6' };

export default function DriverLayout() {
  const styles: Record<string, CSSProperties> = {
    wrapper: { display: 'flex', minHeight: '100vh', background: '#FFFFFF' },
    main: { flex: 1, padding: 20 },
  };

  return (
    <div style={styles.wrapper}>
      <Header />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
