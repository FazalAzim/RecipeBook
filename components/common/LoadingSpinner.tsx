import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullHeight = false,
  message,
}) => {
  const pixelSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 36;

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <svg
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          animation: 'spin 0.8s linear infinite',
          color: 'var(--primary)',
        }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeOpacity="0.2"
        />
        <path
          d="M12 2a10 10 0 0110 10"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
      {message && (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {message}
        </span>
      )}
    </div>
  );

  if (fullHeight) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          width: '100%',
        }}
      >
        {content}
      </div>
    );
  }

  return <div style={{ padding: '2rem 0', display: 'flex', justifyContent: 'center' }}>{content}</div>;
};
