'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import { Button } from '../common/Button';
import { useCart } from '@/contexts/CartContext';
import type { Book } from '@/lib/types';

export interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(book.id);

  const benefitLine =
    book.description?.trim().split(/[.!?\n]/).filter(Boolean)[0]?.trim() ||
    `${book.pageCount} pages · Instant PDF download`;

  const handleAdd = () => {
    addItem(book, 1);
  };

  return (
    <div
      className="surface-card surface-card-interactive book-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      {/* Clean cover — no overlay badges so artwork sells the book */}
      <Link
        href={`/books/${book.id}`}
        className="book-card-cover"
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '133%',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
          display: 'block',
        }}
      >
        <img
          src={book.coverImageUrl}
          alt={book.title}
          loading="lazy"
          className="book-card-img"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            transition: 'transform 0.4s ease',
          }}
        />
        {book.featured && (
          <span
            style={{
              position: 'absolute',
              bottom: '0.625rem',
              left: '0.625rem',
              backgroundColor: 'rgba(26, 22, 19, 0.95)',
              color: '#FBBF24',
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid rgba(232, 163, 23, 0.35)',
            }}
          >
            Featured
          </span>
        )}
      </Link>

      <div className="book-card-body" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {book.category}
          </span>
          <span style={{ color: 'var(--border-dark)' }}>·</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF</span>
          <span
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            <Star size={12} fill="#F59F00" color="#F59F00" />
            {book.rating || 4.9}
          </span>
        </div>

        <Link href={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
          <h4
            className="book-card-title"
            style={{
              fontSize: '1.0625rem',
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              marginBottom: '0.25rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            title={book.title}
          >
            {book.title}
          </h4>
        </Link>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          By {book.author}
        </p>

        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            marginBottom: '0.875rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {benefitLine}
        </p>

        <div style={{ marginTop: 'auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 800,
                  color: 'var(--primary-dark)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                ${book.price.toFixed(2)}
              </span>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Instant download · {book.pageCount} pages
              </span>
            </div>
          </div>

          <div
            className="book-card-actions"
            style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.25fr', gap: '0.5rem' }}
          >
            <Link href={`/books/${book.id}`} style={{ width: '100%' }}>
              <Button variant="secondary" size="sm" fullWidth>
                Details
              </Button>
            </Link>
            <Button
              variant={inCart ? 'secondary' : 'primary'}
              size="sm"
              fullWidth
              leftIcon={<ShoppingBag size={14} />}
              onClick={handleAdd}
            >
              {inCart ? 'Add More' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .book-card-img:hover {
            transform: scale(1.03);
          }
        }
        @media (max-width: 479px) {
          .book-card-actions {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
