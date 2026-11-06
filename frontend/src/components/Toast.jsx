import { useEffect } from 'react';

/**
 * Simple toast notification component.
 * Props:
 *  - message: string to display
 *  - type: 'success' | 'error' | 'info' (affects color)
 *  - onClose: callback when toast auto‑closes or is clicked
 */
export const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'var(--color-success)',
    error: 'var(--color-danger)',
    info: 'var(--accent-color)',
  }[type];

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: bgColor,
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '6px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        zIndex: 1000,
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      {message}
    </div>
  );
};

export default Toast;
