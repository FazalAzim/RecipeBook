import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, FileText, Star, Eye } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useCart } from '../../contexts/CartContext';
import type { Book } from '../../types';

export interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(book.id);

  return (
    <div
      className="surface-card surface-card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      {/* Cover Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '125%', overflow: 'hidden', backgroundColor: 'var(--bg-subtle)' }}>
        <img
          src={book.coverImageUrl}
          alt={book.title}
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          className="book-card-img"
        />

        {/* Badges on Cover */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          <Badge variant="pdf" icon={<FileText size={12} />}>
            PDF
          </Badge>
          {book.featured && (
            <Badge variant="amber">
              Featured
            </Badge>
          )}
        </div>

        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
          <Badge variant="neutral">
            {book.category}
          </Badge>
        </div>
      </div>

      {/* Book Information */}
      <div style={{ padding: '1.125rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
          <div style={{ display: 'flex', color: '#F59F00' }}>
            <Star size={14} fill="#F59F00" />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {book.rating || 4.9}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({book.reviewCount || 48})
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {book.pageCount} pages
          </span>
        </div>

        <Link to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
          <h4
            style={{
              fontSize: '1.0625rem',
              color: 'var(--text-primary)',
              lineHeight: 1.35,
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

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
          By {book.author}
        </p>

        {/* Price & Actions */}
        <div style={{ marginTop: 'auto', paddingTop: '0.875rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Instant Download</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                ${book.price.toFixed(2)}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {book.fileSize}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <Link to={`/books/${book.id}`} style={{ width: '100%' }}>
              <Button variant="secondary" size="sm" fullWidth leftIcon={<Eye size={14} />}>
                Details
              </Button>
            </Link>
            <Button
              variant={inCart ? 'secondary' : 'primary'}
              size="sm"
              fullWidth
              leftIcon={<ShoppingBag size={14} />}
              onClick={() => addItem(book, 1)}
            >
              {inCart ? 'Add More' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .book-card-img:hover {
          transform: scale(1.04);
        }
      `}</style>
    </div>
  );
};
