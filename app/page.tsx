'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Download,
  Infinity,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { BookGrid } from '@/components/books/BookGrid';
import { BookFilters } from '@/components/books/BookFilters';
import { Button } from '@/components/common/Button';
import { ErrorState } from '@/components/common/ErrorState';
import { useCart } from '@/contexts/CartContext';
import type { Book, FilterState } from '@/lib/types';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  category: '',
  cuisine: '',
  selectedTag: '',
  sortBy: 'featured',
};

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [featuredBook, setFeaturedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const { addItem, isInCart } = useCart();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await fetch('/api/books?sortBy=featured');
        if (!res.ok) return;
        const data = await res.json();
        const list = (data.books || []) as Book[];
        const preferred =
          list.find((b) => b.featured) ||
          list.find((b) => /dessert/i.test(b.title)) ||
          list[0] ||
          null;
        setFeaturedBook(preferred);
      } catch {
        // Hero falls back to static cover
      }
    };
    loadFeatured();
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.searchQuery) params.set('search', filters.searchQuery);
      if (filters.category && filters.category !== 'All') params.set('category', filters.category);
      if (filters.cuisine && filters.cuisine !== 'All') params.set('cuisine', filters.cuisine);
      if (filters.selectedTag) params.set('tag', filters.selectedTag);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);

      const res = await fetch(`/api/books?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch cookbooks from database.');
      }
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch cookbooks from database.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Marketing hero always uses the curated Dessert Dreams cover asset
  const heroCover = '/books/dessert-dreams-cover.jpg?v=2';
  const heroTitle = featuredBook?.title || 'Desserts Dreams';
  const heroAuthor = featuredBook?.author || 'Wellness Jar';
  const heroPrice = featuredBook?.price ?? 19.99;
  const heroInCart = featuredBook ? isInCart(featuredBook.id) : false;

  const handleHeroBuy = () => {
    if (!featuredBook) {
      document.getElementById('cookbook-catalog')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    addItem(featuredBook, 1);
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(240, 106, 34, 0.18) 0%, transparent 48%), linear-gradient(180deg, #161210 0%, var(--bg-app) 100%)',
          padding: '2.5rem 0 2.75rem',
          borderBottom: '1px solid var(--border-light)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="container hero-grid"
          style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.95fr', gap: '2.75rem', alignItems: 'center' }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary-dark)',
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '1rem',
                border: '1px solid var(--primary-border)',
                maxWidth: '100%',
              }}
            >
              <Sparkles size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>Instant download · Lifetime access</span>
            </div>

            <h1 style={{ marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: 1.12 }}>
              Cook beautiful desserts at home with{' '}
              <span style={{ color: 'var(--primary)' }}>ready-to-follow</span> recipe books.
            </h1>

            <p
              style={{
                fontSize: '1.0625rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
                lineHeight: 1.65,
                maxWidth: '540px',
              }}
            >
              Chef-crafted digital cookbooks you can open on your phone, tablet, or print for the kitchen.
              Buy once, download instantly, keep forever.
            </p>

            <div
              className="hero-cta-row"
              style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
            >
              <a href="#cookbook-catalog" style={{ flex: '1 1 auto', minWidth: 'min(100%, 180px)' }}>
                <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={18} />}>
                  Browse Cookbooks
                </Button>
              </a>
              {featuredBook ? (
                <Link
                  href={`/books/${featuredBook.id}`}
                  style={{ flex: '1 1 auto', minWidth: 'min(100%, 160px)' }}
                >
                  <Button variant="secondary" size="lg" fullWidth>
                    See What&apos;s Inside
                  </Button>
                </Link>
              ) : (
                <a href="#cookbook-catalog" style={{ flex: '1 1 auto', minWidth: 'min(100%, 160px)' }}>
                  <Button variant="secondary" size="lg" fullWidth>
                    See What&apos;s Inside
                  </Button>
                </a>
              )}
            </div>

            <div
              className="hero-stats"
              style={{
                display: 'flex',
                gap: '1.5rem',
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-light)',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Buy once</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No subscriptions</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Instant</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF after payment</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Lifetime</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Library access</div>
              </div>
            </div>
          </div>

          {/* Featured book sales card */}
          <div style={{ position: 'relative' }} className="hero-image-wrap">
            <div
              className="surface-card hero-feature-card"
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative',
                zIndex: 2,
                border: '1px solid var(--border-light)',
              }}
            >
              <div
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: '#1a1a1a',
                }}
              >
                <img
                  src={heroCover}
                  alt={heroTitle}
                  className="hero-cover-img"
                  style={{
                    width: '100%',
                    height: '340px',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />
              </div>

              <div style={{ padding: '0.875rem 0.25rem 0.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Featured cookbook
                    </div>
                    <h3
                      className="hero-cover-meta"
                      style={{ fontSize: '1.125rem', margin: 0, lineHeight: 1.25 }}
                    >
                      {heroTitle}
                    </h3>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      By {heroAuthor}
                      {featuredBook?.pageCount ? ` · ${featuredBook.pageCount} pages` : ''}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: '1.375rem',
                        fontWeight: 800,
                        color: 'var(--primary-dark)',
                        fontFamily: 'var(--font-heading)',
                        lineHeight: 1,
                      }}
                    >
                      ${heroPrice.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Instant PDF
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: featuredBook ? '1fr 1.15fr' : '1fr', gap: '0.5rem' }}>
                  {featuredBook && (
                    <Link href={`/books/${featuredBook.id}`}>
                      <Button variant="secondary" fullWidth>
                        Details
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="primary"
                    fullWidth
                    leftIcon={<ShoppingBag size={16} />}
                    onClick={handleHeroBuy}
                  >
                    {featuredBook
                      ? heroInCart
                        ? 'Add Another'
                        : 'Add to Cart'
                      : 'Browse Books'}
                  </Button>
                </div>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                top: '18px',
                right: '-12px',
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--secondary-light)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--primary-border)',
                transform: 'rotate(3deg)',
                zIndex: 1,
              }}
              className="hero-decorative-card"
            />
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              gap: 1.5rem !important;
            }
            .hero-image-wrap {
              max-width: 420px;
              margin: 0 auto;
              width: 100%;
            }
            .hero-feature-card {
              transform: none !important;
            }
          }
          @media (max-width: 767px) {
            .hero-cover-img {
              height: min(58vw, 280px) !important;
            }
          }
        `}</style>
      </section>

      {/* Trust strip */}
      <section
        className="trust-strip"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-light)',
          padding: '1.25rem 0',
        }}
      >
        <div
          className="container trust-strip-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            {
              icon: <Download size={18} color="var(--primary)" />,
              title: 'Instant PDF',
              text: 'Download right after checkout',
            },
            {
              icon: <Infinity size={18} color="var(--accent-olive)" />,
              title: 'Lifetime access',
              text: 'Re-download anytime from your library',
            },
            {
              icon: <ShieldCheck size={18} color="var(--secondary)" />,
              title: 'Secure checkout',
              text: 'Protected payments via Lemon Squeezy',
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <section
        className="page-section catalog-section"
        style={{ padding: '2.5rem 0 4rem' }}
        id="cookbook-catalog-section"
      >
        <div className="container">
          <div className="catalog-heading" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Start with these cookbooks</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Beautiful, step-by-step recipe books formatted for phones, tablets, and printing.
            </p>
          </div>

          <BookFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            totalResults={books.length}
          />

          {error ? (
            <ErrorState message={error} onRetry={fetchBooks} />
          ) : (
            <BookGrid books={books} loading={loading} onResetFilters={handleResetFilters} />
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 767px) {
          .trust-strip-grid {
            grid-template-columns: 1fr !important;
            gap: 0.875rem !important;
          }
        }
      `}</style>
    </div>
  );
}
