import React, { CSSProperties } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';

export const Button: React.FC<{
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  style?: CSSProperties;
}> = ({ children, onClick, variant = 'primary', type = 'button', disabled, style }) => {
  const variants: Record<Variant, CSSProperties> = {
    primary: { background: '#0077B6', color: '#fff', border: 'none' },
    secondary: { background: '#F4A261', color: '#0f172a', border: 'none' },
    ghost: { background: 'transparent', color: '#0f172a', border: 'none' },
    outline: { background: 'transparent', color: '#0f172a', border: '1px solid #cbd5e1' },
  };

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 8,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'background .12s ease, transform .06s ease',
    ...variants[variant],
    ...style,
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={base}>
      {children}
    </button>
  );
};

export default Button;
