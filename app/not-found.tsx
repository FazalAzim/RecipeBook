import React from 'react';
import Link from 'next/link';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function NotFoundPage() {
  return (
    <div
      style={{
        padding: '4rem 1.25rem',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="surface-card animate-pop-in"
        style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          maxWidth: '520px',
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div
          style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            fontFamily: 'var(--font-heading)',
            color: 'var(--primary)',
            lineHeight: 1,
            marginBottom: '1rem',
          }}
        >
          404
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Recipe Page Not Found</h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          The culinary masterclass or page you were looking for might have been moved, unpublished, or does not exist.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/">
            <Button variant="primary" leftIcon={<Home size={18} />}>
              Back to Home
            </Button>
          </Link>
          <Link href="/library">
            <Button variant="secondary" leftIcon={<BookOpen size={18} />}>
              My Recipe Library
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
