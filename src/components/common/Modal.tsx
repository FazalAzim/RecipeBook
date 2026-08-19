import React, { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '540px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(28, 25, 23, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        className="surface-card animate-pop-in"
        style={{
          width: '100%',
          maxWidth,
          backgroundColor: 'var(--bg-surface)',
          padding: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          {title ? <h3>{title}</h3> : <div />}
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{
              padding: '0.375rem',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--text-muted)',
              display: 'flex',
            }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
