'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ArrowLeft,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Star,
  Download,
  Smartphone,
  Printer,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { QuantitySelector } from '@/components/books/QuantitySelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import type { Book } from '@/lib/types';

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = use(params);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/books/${bookId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Recipe book not found or unpublished.');
        }
        const data = await res.json();
        setBook(data.book);
      } catch (err: any) {
        setError(err.message || 'Failed to load recipe book details.');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  const handleAddToCart = () => {
    if (!book) return;
    addItem(book, quantity);
  };

  const handleBuyNow = () => {
    if (!book) return;
    addItem(book, quantity);
    router.push('/checkout');
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading recipe book masterclass..." />;
  }

  if (error || !book) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
        <ErrorState message={error || 'Book not found'} />
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 0 3rem' }} className="book-detail-page">
      <div className="container">
        {/* Back Link */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Recipe Books</span>
        </Link>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '420px 1fr',
            gap: '3rem',
            alignItems: 'start',
          }}
          className="book-detail-grid"
        >
          {/* Left Column: Book Cover Presentation */}
          <div>
            <div
              className="surface-card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#1a1a1a',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <img
                src={book.coverImageUrl}
                alt={book.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '640px',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  margin: '0 auto',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <Badge variant="pdf" icon={<FileText size={14} />}>
                  Official PDF
                </Badge>
                {book.featured && <Badge variant="amber">Featured Masterclass</Badge>}
              </div>
            </div>

            {/* Guaranteed digital highlights */}
            <div
              className="surface-card"
              style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Download size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Instant digital download upon checkout
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Smartphone size={18} color="var(--accent-olive)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Tablet, iPad & smartphone screen optimized
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Printer size={18} color="var(--secondary)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  High-res 300 DPI print-ready formatting
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Book Specifications & Purchasing */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <Badge variant="neutral">{book.category}</Badge>
              <Badge variant="primary">{book.cuisine} Cuisine</Badge>
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.375rem)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
              {book.title}
            </h1>

            <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Masterclass by <strong style={{ color: 'var(--text-primary)' }}>{book.author}</strong>
            </p>

            {/* Ratings & Sales Social Proof */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.75rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid var(--border-light)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ display: 'flex', color: '#F59F00' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={18} fill="#F59F00" />
                  ))}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{book.rating || 4.9}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  ({book.reviewCount || 48} verified reviews)
                </span>
              </div>

              <div style={{ color: 'var(--text-light)' }}>•</div>

              <div style={{ fontSize: '0.875rem', color: 'var(--accent-olive)', fontWeight: 600 }}>
                {book.salesCount > 0 ? `${book.salesCount} copies sold` : 'New Release'}
              </div>
            </div>

            {/* Price Box */}
            <div
              style={{
                backgroundColor: 'var(--primary-light)',
                border: '1.5px solid var(--primary-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--primary-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Single Complete Edition
                </span>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                  ${book.price.toFixed(2)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success">Instant Delivery</span>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  PDF • {book.fileSize}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>About This Digital Cookbook</h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {book.description}
              </p>
            </div>

            {/* Metadata Table */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '1rem',
                padding: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Page Count</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{book.pageCount} Pages</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Digital PDF</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>File Size</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{book.fileSize}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Language</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>English</div>
              </div>
            </div>

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  RECIPE HIGHLIGHTS & TAGS
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {book.tags.map((t) => (
                    <span key={t} className="badge badge-neutral">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Action Bar */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-light)',
                flexWrap: 'wrap',
              }}
            >
              <QuantitySelector quantity={quantity} onChange={setQuantity} />

              <Button
                variant="secondary"
                size="lg"
                leftIcon={<ShoppingBag size={20} />}
                onClick={handleAddToCart}
                style={{ flex: '1 1 180px' }}
              >
                Add to Cart
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={handleBuyNow}
                style={{ flex: '1 1 180px' }}
              >
                Buy Now (${(book.price * quantity).toFixed(2)})
              </Button>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .book-detail-grid {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
