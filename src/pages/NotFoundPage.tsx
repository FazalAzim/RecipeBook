import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '2rem 1.25rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <BookOpen size={36} />
      </div>

      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
        Recipe Page Not Found
      </h2>
      <p style={{ maxWidth: '440px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        The recipe book or page you are looking for might have been moved, removed, or does not exist.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link to="/">
          <Button variant="primary" leftIcon={<Home size={16} />}>
            Back to Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
};
