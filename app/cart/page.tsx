'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/common/Button';
import { QuantitySelector } from '@/components/books/QuantitySelector';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, total, totalItems } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <EmptyState
          icon={<ShoppingBag size={36} />}
          title="Your cart is empty"
          description="Looks like you haven't added any chef-crafted recipe books yet. Discover exciting authentic recipes for your next meal."
          actionText="Explore Recipe Books"
          onAction={() => router.push('/')}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Breadcrumb / Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Your Shopping Cart</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Review your selected digital recipe books ({totalItems} item{totalItems > 1 ? 's' : ''})
            </p>
          </div>

          <button
            onClick={clearCart}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--accent-berry)', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <Trash2 size={16} />
            <span>Clear Cart</span>
          </button>
        </div>

        {/* Cart Grid: Items on Left, Summary on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '2.5rem',
            alignItems: 'start',
          }}
          className="cart-layout-grid"
        >
          {/* Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => (
              <div
                key={item.bookId}
                className="surface-card cart-line-item"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                {/* Book Thumbnail */}
                <Link href={`/books/${item.bookId}`} style={{ flexShrink: 0 }}>
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    style={{
                      width: '80px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  />
                </Link>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Badge variant="pdf" icon={<FileText size={10} />}>
                      PDF
                    </Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.fileSize}</span>
                  </div>

                  <Link href={`/books/${item.bookId}`} style={{ textDecoration: 'none' }}>
                    <h4
                      style={{
                        fontSize: '1rem',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.title}
                    </h4>
                  </Link>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    By {item.author}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <QuantitySelector
                      size="sm"
                      quantity={item.quantity}
                      onChange={(q) => updateQuantity(item.bookId, q)}
                    />

                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      ${item.unitPrice.toFixed(2)} each
                    </span>
                  </div>
                </div>

                {/* Price & Delete */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                    ${item.subtotal.toFixed(2)}
                  </div>

                  <button
                    onClick={() => removeItem(item.bookId)}
                    style={{
                      color: 'var(--text-muted)',
                      padding: '0.375rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '1rem' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                }}
              >
                <ArrowLeft size={16} />
                <span>Continue Shopping & Discover More Cookbooks</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary Box */}
          <div
            className="surface-card"
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--bg-surface)',
              position: 'sticky',
              top: 'calc(var(--header-height) + 1.5rem)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cookbooks ({totalItems})</span>
                <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery</span>
                <span style={{ color: 'var(--accent-olive)', fontWeight: 600 }}>Free Instant PDF</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Applicable Taxes</span>
                <span style={{ fontWeight: 600 }}>$0.00</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  marginTop: '0.5rem',
                  borderTop: '2px dashed var(--border-base)',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: '1.125rem', fontWeight: 800 }}>Total Due</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight size={18} />}
              onClick={() => router.push('/checkout')}
              style={{ marginBottom: '1.25rem' }}
            >
              Proceed to Checkout
            </Button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <ShieldCheck size={16} color="var(--accent-olive)" />
              <span>Encrypted 256-Bit SSL Checkout Security</span>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .cart-layout-grid {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
