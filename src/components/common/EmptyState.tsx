import React, { type ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionLink?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
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
        padding: '3.5rem 1.5rem',
        margin: '1.5rem 0',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        {icon || <BookOpen size={32} />}
      </div>
      <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ maxWidth: '440px', color: 'var(--text-secondary)', marginBottom: actionText ? '1.5rem' : 0 }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
