import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div
      className="surface-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        margin: '1.5rem 0',
        borderColor: '#FFC9C9',
        backgroundColor: '#FFF5F5',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-berry-light)',
          color: 'var(--accent-berry)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <AlertCircle size={30} />
      </div>
      <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ maxWidth: '440px', color: 'var(--text-secondary)', marginBottom: onRetry ? '1.25rem' : 0 }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" leftIcon={<RotateCcw size={16} />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
