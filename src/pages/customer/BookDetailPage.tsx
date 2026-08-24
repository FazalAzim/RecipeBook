import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Star,
  Download,
  Smartphone,
  Printer
} from 'lucide-react';
import { booksService } from '../../services/firebase/booksService';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { QuantitySelector } from '../../components/books/QuantitySelector';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { Book } from '../../types';

export const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await booksService.getBookById(bookId);
        if (!data) {
          setError('Recipe book not found or may have been unpublished.');
        } else {
          setBook(data);
        }
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
    navigate('/checkout');
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading recipe book masterclass..." />;
  }

  if (error || !book) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
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
          to="/"
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
            gridTemplateColumns: 'minmax(min(100%, 320px), 460px) 1fr',
            gap: '3.5rem',
            alignItems: 'start',
          }}
          className="book-detail-layout"
        >
          {/* Left Column: High-Res Book Cover */}
          <div>
            <div
              className="surface-card"
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-base)',
              }}
            >
              <img
                src={book.coverImageUrl}
                alt={book.title}
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '580px', objectFit: 'cover' }}
              />

              <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Badge variant="pdf" icon={<FileText size={14} />}>
                  PDF E-Book
                </Badge>
                {book.featured && (
                  <Badge variant="amber">
                    Editor's Choice
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Digital Specs Box */}
            <div
              className="surface-card book-detail-specs"
              style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                textAlign: 'center',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>PDF Digital</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pages</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{book.pageCount} Pages</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>File Size</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{book.fileSize}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Book Details & Actions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Badge variant="primary">{book.category}</Badge>
              <Badge variant="neutral">{book.cuisine} Cuisine</Badge>
            </div>

            <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
              {book.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                By <span style={{ color: 'var(--text-primary)' }}>{book.author}</span>
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ display: 'flex', color: '#F59F00' }}>
                  <Star size={16} fill="#F59F00" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{book.rating || 4.9}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>({book.reviewCount || 68} verified reviews)</span>
              </div>
            </div>

            {/* Price Box */}
            <div
              className="book-detail-price"
              style={{
                backgroundColor: 'var(--primary-light)',
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--primary-border)',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-dark)', display: 'block' }}>
                  Instant Download Price
                </span>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                  ${book.price.toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--accent-olive)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={16} /> Instant Access
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Includes full PDF + bonus recipes
                </span>
              </div>
            </div>

            {/* Quantity Selector and Cart CTAs */}
            <div
              className="surface-card"
              style={{
                padding: '1.5rem',
                marginBottom: '2rem',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }} className="book-detail-qty">
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                    Quantity
                  </label>
                  <QuantitySelector quantity={quantity} onChange={setQuantity} min={1} />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Item Subtotal</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    ${(book.price * quantity).toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="book-detail-ctas">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<ShoppingBag size={18} />}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>About this Recipe Book</h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {book.description}
              </p>
            </div>

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.625rem', color: 'var(--text-secondary)' }}>
                  Culinary Tags & Topics:
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {book.tags.map((tag) => (
                    <Badge key={tag} variant="neutral">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Features Guarantee Grid */}
            <div
              className="book-detail-features"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-base)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Smartphone size={20} color="var(--primary)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Optimized for iPad & Mobile screens
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Printer size={20} color="var(--primary)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  High-res print-ready pages
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Download size={20} color="var(--primary)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Download immediately after payment
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Safe & verified checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .book-detail-page {
            padding: 2.5rem 0 4rem !important;
          }
        }
        @media (max-width: 900px) {
          .book-detail-layout {
            grid-template-columns: 1fr !important;
            gap: 1.75rem !important;
          }
        }
        @media (max-width: 640px) {
          .book-detail-ctas,
          .book-detail-features {
            grid-template-columns: 1fr !important;
          }
          .book-detail-price {
            padding: 1rem !important;
          }
          .book-detail-price > div:last-child {
            text-align: left !important;
          }
        }
      `}</style>
    </div>
  );
};
