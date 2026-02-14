import React, { CSSProperties } from 'react';
import { Outlet } from 'react-router-dom';

const SAFARITIX = { primary: '#0077B6' };

export default function AdminLayout() {
  const styles: Record<string, CSSProperties> = {
    wrapper: { display: 'flex', minHeight: '100vh', background: '#F7F9FC' },
    main: { flex: 1, padding: 20 },
  };

  return (
    <div style={styles.wrapper}>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
