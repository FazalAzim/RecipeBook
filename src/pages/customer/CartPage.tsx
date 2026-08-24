import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/common/Button';
import { QuantitySelector } from '../../components/books/QuantitySelector';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';

export const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal, total, totalItems } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <EmptyState
          icon={<ShoppingBag size={36} />}
          title="Your cart is empty"
          description="Looks like you haven't added any chef-crafted recipe books yet. Discover exciting authentic recipes for your next meal."
          actionText="Explore Recipe Books"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Breadcrumb / Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
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
                <Link to={`/books/${item.bookId}`} style={{ flexShrink: 0 }}>
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
                    <Badge variant="pdf" icon={<FileText size={10} />}>PDF</Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.fileSize}</span>
                  </div>

                  <Link to={`/books/${item.bookId}`} style={{ textDecoration: 'none' }}>
                    <h4
                      style={{
                        fontSize: '1rem',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.title}
                    </h4>
                  </Link>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    By {item.author || 'Master Chef'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <QuantitySelector
                      quantity={item.quantity}
                      onChange={(newQty) => updateQuantity(item.bookId, newQty)}
                      size="sm"
                      min={1}
                    />

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        ${item.unitPrice.toFixed(2)} each
                      </span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeItem(item.bookId)}
                  style={{
                    padding: '0.5rem',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignSelf: 'flex-start',
                  }}
                  title="Remove from cart"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--primary)',
                marginTop: '1rem',
              }}
            >
              <ArrowLeft size={16} />
              <span>Continue browsing recipe books</span>
            </Link>
          </div>

          {/* Cart Summary Card */}
          <div
            className="surface-card"
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--bg-surface)',
              position: 'sticky',
              top: '90px',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                <span>Subtotal ({totalItems} items)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                <span>Digital Delivery</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-olive)' }}>FREE (Instant)</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  marginTop: '0.5rem',
                  borderTop: '1px solid var(--border-base)',
                  fontSize: '1.125rem',
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Grand Total</span>
                <span style={{ fontWeight: 800, fontSize: '1.375rem', color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <Link to="/checkout" style={{ width: '100%', textDecoration: 'none' }}>
              <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={18} />}>
                Proceed to Checkout
              </Button>
            </Link>

            <div
              style={{
                marginTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <ShieldCheck size={16} color="var(--accent-olive)" />
              <span>Encrypted 256-Bit SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .cart-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
        @media (max-width: 520px) {
          .cart-line-item {
            flex-wrap: wrap !important;
            align-items: flex-start !important;
          }
          .cart-line-item > a:first-child {
            order: 0;
          }
          .cart-line-item > div {
            flex: 1 1 calc(100% - 100px) !important;
          }
        }
      `}</style>
    </div>
  );
};
