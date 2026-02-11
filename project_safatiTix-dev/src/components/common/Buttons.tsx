import React, { CSSProperties } from 'react';
export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, style, ...rest }) => {
  const base: CSSProperties = {
    background: '#0077B6',
    color: 'white',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
  };
  return (
    <button style={{ ...base, ...(style as object) }} {...rest}>{children}</button>
  );
};

export default PrimaryButton;
