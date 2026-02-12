import React, { CSSProperties } from 'react';
import { Outlet } from 'react-router-dom';

const SAFARITIX = {
  primary: '#0077B6',
  soft: '#E6F4FB',
};

export default function CompanyLayout() {
  const styles: Record<string, CSSProperties> = {
    wrapper: { display: 'flex', minHeight: '100vh', background: '#F8FAFC' },
    content: { flex: 1, padding: 20 },
  };

  return (
    <div style={styles.wrapper}>
      {/* <Header /> removed */}
      <div style={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
