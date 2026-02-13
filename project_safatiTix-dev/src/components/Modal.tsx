import React, { useEffect, useState } from 'react';

type ModalProps = {
  title?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
};

/**
 * Reusable SafariTix Modal
 * - Accepts `title`, `children` (dynamic content), `isOpen`, and `onClose`.
 * - Centers with semi-transparent dark overlay.
 * - Closes when overlay or close button clicked.
 * - Tailwind-styled to match SafariTix theme and animates open/close.
 */
export default function Modal({ title, children, isOpen, onClose, size = 'md' }: ModalProps) {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // delay to allow mount -> transition
      requestAnimationFrame(() => setVisible(true));
    } else {
      // start close animation
      setVisible(false);
      // unmount after animation completes
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  }[size];

  return (
    <div
      aria-modal
      role="dialog"
      className={`fixed inset-0 z-50 flex items-center justify-center ${visible ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onMouseDown={onClose}
      />

      {/* Panel */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`relative w-full ${sizeClass} mx-4 rounded-lg bg-white shadow-xl transform transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-[#2B2D42]">{title || 'Notice'}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-500 hover:text-white hover:bg-[#0077B6] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body / dynamic content */}
        <div className="px-6 py-5 max-h-[70vh] overflow-auto">{children}</div>
      </div>
    </div>
  );
}
