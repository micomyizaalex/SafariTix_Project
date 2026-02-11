import React, { CSSProperties } from 'react';

export const Card: React.FC<{ style?: CSSProperties; children?: React.ReactNode }> = ({ style, children }) => {
  const base: CSSProperties = {
    background: 'white',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
  };
  return <div style={{ ...base, ...(style || {}) }}>{children}</div>;
};

export default Card;
