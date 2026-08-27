import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while retrieving the requested data. Please try again.',
  onRetry,
  actionText = 'Try Again',
}) => {
  return (
    <div
      className="surface-card animate-fade-in"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F5',
        border: '1.5px solid #FFC9C9',
        maxWidth: '540px',
        margin: '2rem auto',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: '#FFE3E3',
          color: 'var(--accent-berry)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <AlertCircle size={28} />
      </div>

      <h3 style={{ marginBottom: '0.5rem', color: '#C92A2A' }}>{title}</h3>

      <p
        style={{
          color: 'var(--text-secondary)',
          maxWidth: '420px',
          marginBottom: onRetry ? '1.5rem' : '0',
          fontSize: '0.9375rem',
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
