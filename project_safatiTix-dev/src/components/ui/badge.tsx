import React, { CSSProperties } from 'react';

type Variant = 'default' | 'primary' | 'success' | 'danger' | 'warning';

export const Badge: React.FC<{ children?: React.ReactNode; variant?: Variant; }> = ({ children, variant = 'default' }) => {
  const colors: Record<Variant, { bg: string; color: string }> = {
    default: { bg: '#e2e8f0', color: '#0f172a' },
    primary: { bg: '#e6f2ff', color: '#0369a1' },
    success: { bg: '#ecfdf5', color: '#065f46' },
    danger: { bg: '#fff1f2', color: '#9f1239' },
    warning: { bg: '#fff7ed', color: '#92400e' },
  };

  const style: CSSProperties = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1,
    background: colors[variant].bg,
    color: colors[variant].color,
  };

  return <span style={style}>{children}</span>;
};

export default Badge;
