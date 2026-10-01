import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function SiteContentPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.75rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft size={16} />
          Back to store
        </Link>

        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', marginBottom: '0.5rem' }}>{title}</h1>
          {subtitle && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.6, margin: 0 }}>
              {subtitle}
            </p>
          )}
        </header>

        <article
          className="glass-panel site-content-prose"
          style={{
            padding: 'clamp(1.5rem, 3vw, 2.25rem)',
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            lineHeight: 1.75,
          }}
        >
          {children}
        </article>

        <style>{`
          .site-content-prose h2 {
            font-size: 1.25rem;
            margin: 1.75rem 0 0.75rem;
            color: var(--text-primary);
          }
          .site-content-prose h2:first-child {
            margin-top: 0;
          }
          .site-content-prose h3 {
            font-size: 1.0625rem;
            margin: 1.25rem 0 0.5rem;
            color: var(--text-primary);
          }
          .site-content-prose p {
            margin: 0 0 1rem;
          }
          .site-content-prose ul {
            margin: 0 0 1rem;
            padding-left: 1.25rem;
          }
          .site-content-prose li {
            margin-bottom: 0.4rem;
          }
          .site-content-prose a {
            color: var(--primary-dark);
            text-decoration: underline;
            text-underline-offset: 2px;
          }
          .site-content-prose strong {
            color: var(--text-primary);
            font-weight: 600;
          }
        `}</style>
      </div>
    </div>
  );
}
