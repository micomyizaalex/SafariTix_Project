import React, { CSSProperties, SelectHTMLAttributes } from 'react';

export const Select: React.FC<{ children?: React.ReactNode; style?: CSSProperties }> = ({ children, style }) => {
  return <div style={{ display: 'inline-block', position: 'relative', ...style }}>{children}</div>;
};

export const SelectTrigger: React.FC<{ children?: React.ReactNode; style?: CSSProperties }> = ({ children, style }) => {
  return <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...style }}>{children}</div>;
};

export const SelectValue: React.FC<{ children?: React.ReactNode; style?: CSSProperties }> = ({ children, style }) => {
  return <span style={{ fontWeight: 600, ...style }}>{children}</span>;
};

export const SelectContent: React.FC<SelectHTMLAttributes<HTMLSelectElement> & { style?: CSSProperties }> = ({ children, style, ...rest }) => {
  const base: CSSProperties = {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#0f172a',
    fontSize: 14,
  };
  return (
    <select {...rest} style={{ ...base, ...(style || {}) }}>
      {children}
    </select>
  );
};

export const SelectItem: React.FC<{ value: string; children?: React.ReactNode }> = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

export default Select;
