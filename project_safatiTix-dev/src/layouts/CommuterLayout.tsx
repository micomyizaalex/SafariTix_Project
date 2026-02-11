import React, { CSSProperties } from 'react';
import { Outlet } from 'react-router-dom';

const SAFARITIX = { primary: '#0077B6' };

export default function CommuterLayout() {
  const styles: Record<string, CSSProperties> = {
    wrapper: { display: 'flex', minHeight: '100vh', background: '#FBFDFF' },
    main: { flex: 1, padding: 20 },
  };

  return (
    <div style={styles.wrapper}>
      {/* Header removed */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
