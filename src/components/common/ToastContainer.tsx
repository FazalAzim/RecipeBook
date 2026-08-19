import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '380px',
        width: 'calc(100vw - 2.5rem)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const icon = {
          success: <CheckCircle2 size={20} color="#2B8A3E" />,
          error: <AlertCircle size={20} color="#C92A2A" />,
          warning: <AlertTriangle size={20} color="#D97706" />,
          info: <Info size={20} color="#E8590C" />,
        }[toast.type];

        const borderColor = {
          success: '#B2F2BB',
          error: '#FFC9C9',
          warning: '#FDE68A',
          info: '#FFD8A8',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className="animate-slide-up"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-surface)',
              border: `1px solid ${borderColor}`,
              borderLeft: `4px solid ${borderColor}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem 1rem',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <span style={{ display: 'flex', marginTop: '2px' }}>{icon}</span>
            <div style={{ flex: 1 }}>
              {toast.title && (
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {toast.title}
                </div>
              )}
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                color: 'var(--text-muted)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
