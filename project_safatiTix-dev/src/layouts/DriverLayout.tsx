import React, { CSSProperties } from 'react';
import { Outlet } from 'react-router-dom';
import { DriverHeader } from '../components/DriverHeader';

export default function DriverLayout() {
  const styles: Record<string, CSSProperties> = {
    wrapper: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FFFFFF' },
    main: { flex: 1, padding: 20 },
  };

  return (
    <div style={styles.wrapper}>
      <DriverHeader />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
