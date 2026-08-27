'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import type { ToastType } from '@/lib/types';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--accent-olive)" />;
      case 'error':
        return <AlertCircle size={18} color="var(--accent-berry)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--secondary)" />;
      case 'info':
      default:
        return <Info size={18} color="var(--primary)" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'var(--accent-olive)';
      case 'error':
        return 'var(--accent-berry)';
      case 'warning':
        return 'var(--secondary)';
      case 'info':
      default:
        return 'var(--primary)';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '380px',
        width: 'calc(100% - 3rem)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="surface-card animate-slide-up"
          style={{
            pointerEvents: 'auto',
            padding: '0.875rem 1.125rem',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: `4px solid ${getBorderColor(toast.type)}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ flexShrink: 0, marginTop: '2px' }}>{getIcon(toast.type)}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {toast.title && (
              <h5 style={{ fontSize: '0.875rem', marginBottom: '0.125rem', color: 'var(--text-primary)' }}>
                {toast.title}
              </h5>
            )}
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            style={{
              flexShrink: 0,
              color: 'var(--text-muted)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
