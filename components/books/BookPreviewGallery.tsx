'use client';

import React, { useState } from 'react';
import { BookOpen, Lock } from 'lucide-react';
import type { BookPreviewPage } from '@/lib/book-previews';

interface BookPreviewGalleryProps {
  pages: BookPreviewPage[];
  bookTitle: string;
  onBuyClick: () => void;
  buyLabel: string;
  offerPercent?: number;
}

export function BookPreviewGallery({
  pages,
  bookTitle,
  onBuyClick,
  buyLabel,
  offerPercent,
}: BookPreviewGalleryProps) {
  const [active, setActive] = useState(0);

  if (pages.length === 0) return null;

  const current = pages[Math.min(active, pages.length - 1)];

  return (
    <section
      style={{
        marginTop: '2.75rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border-light)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '0.35rem',
            }}
          >
            <BookOpen size={14} />
            Look inside
          </div>
          <h3 style={{ margin: 0, fontSize: '1.35rem' }}>Real pages from {bookTitle}</h3>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            See the layout, photos, and step-by-step style before you buy.
          </p>
        </div>
        {offerPercent != null && offerPercent > 0 && (
          <span
            style={{
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            {offerPercent}% OFF · Limited offer
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(220px, 0.7fr)',
          gap: '1.25rem',
          alignItems: 'start',
        }}
        className="preview-gallery-grid"
      >
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid #2E2825',
            background: '#0C0A09',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
          }}
        >
          <img
            src={current.src}
            alt={current.alt}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              maxHeight: '720px',
              objectFit: 'contain',
              background: '#0C0A09',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: '0.75rem 1rem',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
              color: '#fff',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            {current.caption}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
            }}
          >
            {pages.map((page, index) => (
              <button
                key={page.src}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Preview page: ${page.caption}`}
                aria-pressed={index === active}
                style={{
                  padding: 0,
                  border:
                    index === active
                      ? '2px solid var(--primary)'
                      : '1px solid #2E2825',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#0C0A09',
                }}
              >
                <img
                  src={page.src}
                  alt=""
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '110px',
                    objectFit: 'cover',
                    objectPosition: 'top',
                  }}
                />
              </button>
            ))}
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid #2E2825',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                marginBottom: '0.65rem',
              }}
            >
              <Lock size={14} />
              Full cookbook unlocks after purchase
            </div>
            <button
              type="button"
              onClick={onBuyClick}
              style={{
                width: '100%',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1rem',
                fontWeight: 800,
                fontSize: '0.9375rem',
                color: '#fff',
                background: 'linear-gradient(135deg, #F06A22 0%, #C22500 100%)',
              }}
            >
              {buyLabel}
            </button>
            <p
              style={{
                margin: '0.65rem 0 0',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
              }}
            >
              Instant PDF · Lifetime re-downloads
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .preview-gallery-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
