import React from 'react';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading gourmet recipe books...',
  size = 'md',
  fullHeight = false,
}) => {
  const sizePx = {
    sm: 24,
    md: 40,
    lg: 56,
  }[size];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '3rem 1.5rem',
        minHeight: fullHeight ? '60vh' : 'auto',
      }}
    >
      <div
        style={{
          width: sizePx,
          height: sizePx,
          border: '3px solid var(--primary-border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {message && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500 }}>
          {message}
        </p>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
