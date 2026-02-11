import React, { CSSProperties } from 'react';

export const Alert: React.FC<{ children?: React.ReactNode; title?: string; variant?: 'info'|'warning'|'danger'|'success'; style?: CSSProperties; className?: string }> = ({ children, title, variant = 'info', style, className }) => {
  const colors: Record<string,string> = {
    info: '#0ea5e9',
    warning: '#f59e0b',
    danger: '#ef4444',
    success: '#10b981'
  };
  const baseStyle: CSSProperties = {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    padding: '12px 14px',
    borderRadius: 10,
    background: `${colors[variant]}22`,
    border: `1px solid ${colors[variant]}33`,
    color: '#0f172a',
  };
  return (
    <div style={{ ...baseStyle, ...(style || {}) } as any} className={className} role="alert">
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export const AlertDescription: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ color: '#475569', fontSize: 14 }}>{children}</div>
);

export default Alert;
