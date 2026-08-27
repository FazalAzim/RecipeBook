'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Flame, Sparkles, ChefHat } from 'lucide-react';
import { BookGrid } from '@/components/books/BookGrid';
import { BookFilters } from '@/components/books/BookFilters';
import { Button } from '@/components/common/Button';
import { ErrorState } from '@/components/common/ErrorState';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

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
    } catch (err: any) {
      console.error('Error loading books:', err);
      setError(err.message || 'Failed to fetch cookbooks from database.');
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

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #FFF8F0 0%, var(--bg-app) 100%)',
          padding: '2.5rem 0 3rem',
          borderBottom: '1px solid var(--border-light)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hero-section"
      >
        <div
          className="container hero-grid"
          style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}
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
              <Flame size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>Chef-Crafted Digital Cookbooks in PDF</span>
            </div>

            <h1 style={{ marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: 1.15 }}>
              Master Authentic Cuisines with <span style={{ color: 'var(--primary)' }}>Instant PDF</span> Cookbooks.
            </h1>

            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
                lineHeight: 1.6,
                maxWidth: '540px',
              }}
            >
              Explore chef-curated recipe guides, authentic global secret techniques, and printable weeknight meal plans. Buy once, download instantly, keep forever.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="#cookbook-catalog" style={{ flex: '1 1 auto', minWidth: 'min(100%, 180px)' }}>
                <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={18} />}>
                  Explore Cookbooks
                </Button>
              </a>
              <Link href="/library" style={{ flex: '1 1 auto', minWidth: 'min(100%, 140px)' }}>
                <Button variant="secondary" size="lg" fullWidth leftIcon={<BookOpen size={18} />}>
                  My Library
                </Button>
              </Link>
            </div>

            {/* Quick stats ribbon */}
            <div
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
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>100%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tested Recipes</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Instant</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF Downloads</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Lifetime</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Library Access</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div style={{ position: 'relative' }} className="hero-image-wrap">
            <div
              className="surface-card"
              style={{
                padding: '1.25rem',
                transform: 'rotate(-2deg)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80"
                alt="Culinary Masterclass Cookbook"
                style={{
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                  height: '320px',
                  objectFit: 'cover',
                }}
              />
              <div style={{ marginTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', margin: 0 }}>Traditional Royal Curries & Biryani</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chef Ayla Farooq • 148 Pages PDF</span>
                </div>
                <span className="badge badge-pdf">PDF</span>
              </div>
            </div>

            {/* Backing decorative card */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '-15px',
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--secondary-light)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #FDE68A',
                transform: 'rotate(4deg)',
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
              gap: 2rem !important;
            }
            .hero-image-wrap {
              max-width: 440px;
              margin: 0 auto;
            }
          }
        `}</style>
      </section>

      {/* Catalog & Filter Section */}
      <section className="page-section" style={{ padding: '2.5rem 0 4rem' }}>
        <div className="container">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Explore Digital Recipe Books</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Handpicked step-by-step masterclasses formatted for easy reading on kitchen tablets and phones.
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
    </div>
  );
}
