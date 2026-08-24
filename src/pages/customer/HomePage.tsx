import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChefHat, ArrowRight, Flame } from 'lucide-react';
import { booksService } from '../../services/firebase/booksService';
import { BookGrid } from '../../components/books/BookGrid';
import { BookFilters } from '../../components/books/BookFilters';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import type { Book, FilterState } from '../../types';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  category: '',
  cuisine: '',
  selectedTag: '',
  sortBy: 'featured',
};

export const HomePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await booksService.getBooks(filters, false);
      setBooks(data);
    } catch (err: any) {
      console.error('Error loading books:', err);
      setError(err.message || 'Failed to fetch cookbooks from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #FFF8F0 0%, var(--bg-app) 100%)',
          padding: '2rem 0 2.5rem',
          borderBottom: '1px solid var(--border-light)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hero-section"
      >
        <div className="container hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
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

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '540px' }}>
              Explore chef-curated recipe guides, authentic global secret techniques, and printable weeknight meal plans. Buy once, download instantly, keep forever.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="#cookbook-catalog" style={{ flex: '1 1 auto', minWidth: 'min(100%, 180px)' }}>
                <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={18} />}>
                  Explore Cookbooks
                </Button>
              </a>
              <Link to="/library" style={{ flex: '1 1 auto', minWidth: 'min(100%, 140px)' }}>
                <Button variant="secondary" size="lg" fullWidth leftIcon={<BookOpen size={18} />}>
                  My Library
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div
              className="hero-metrics"
              style={{
                display: 'flex',
                gap: '1.25rem',
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-base)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: '90px' }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  100%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF Instant Access</div>
              </div>
              <div style={{ minWidth: '90px' }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  Chef
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tested & Verified</div>
              </div>
              <div style={{ minWidth: '90px' }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  Lifetime
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Re-Download Anytime</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Imagery */}
          <div style={{ position: 'relative' }} className="hero-image-wrapper">
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '4px solid #FFFFFF',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80"
                alt="Culinary cookbook preparation with fresh herbs and spices"
                className="hero-img"
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
              />
            </div>

            {/* Floating Highlight Card */}
            <div
              className="surface-card animate-slide-up hero-float-card"
              style={{
                position: 'absolute',
                bottom: '-1.5rem',
                left: '1rem',
                right: '1rem',
                maxWidth: '320px',
                padding: '0.875rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                boxShadow: 'var(--shadow-lg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-olive-light)',
                  color: 'var(--accent-olive)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChefHat size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  Master Chef Tested
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Detailed step-by-step PDF instructions
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filter Section */}
      <section id="cookbook-catalog" style={{ padding: '2.5rem 0' }} className="catalog-section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                Featured Recipe Books & Culinary Guides
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Search by cuisine, author, or dietary preference.
              </p>
            </div>
          </div>

          {/* Interactive Filters Component */}
          <BookFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            totalResults={books.length}
          />

          {/* Catalog Grid or Error State */}
          {error ? (
            <ErrorState message={error} onRetry={fetchBooks} />
          ) : (
            <BookGrid
              books={books}
              isLoading={loading}
              onClearFilters={handleResetFilters}
            />
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .hero-img {
            height: 240px !important;
          }
          .hero-float-card {
            bottom: 0.75rem !important;
            left: 0.75rem !important;
            right: auto !important;
          }
        }
        @media (min-width: 768px) {
          .hero-section {
            padding: 3.5rem 0 4rem !important;
          }
          .catalog-section {
            padding: 3.5rem 0 !important;
          }
          .hero-img {
            height: 420px !important;
          }
        }
      `}</style>
    </div>
  );
};
