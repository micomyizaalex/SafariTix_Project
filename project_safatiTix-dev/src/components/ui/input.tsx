import React, { CSSProperties } from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(props, ref) {
  const base: CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#0f172a',
    fontSize: 14,
    outline: 'none',
  };

  return <input ref={ref} {...props} style={{ ...base, ...(props.style as CSSProperties) }} />;
});

export default Input;
