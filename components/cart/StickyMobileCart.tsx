'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '../common/Button';

export const StickyMobileCart: React.FC = () => {
  const { totalItems, total } = useCart();
  const pathname = usePathname() || '';

  // Hide sticky bar on cart, checkout, payment, and admin pages
  const isExcludedPage = ['/cart', '/checkout', '/payment', '/admin'].some((path) =>
    pathname.startsWith(path)
  );

  if (totalItems === 0 || isExcludedPage) {
    return null;
  }

  return (
    <div className="sticky-mobile-cart animate-slide-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <ShoppingBag size={20} />
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'var(--primary-dark)',
              color: '#fff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-pill)',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {totalItems}
          </span>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {totalItems} item{totalItems > 1 ? 's' : ''} in cart
          </div>
          <div
            style={{
              fontSize: '1.0625rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            ${total.toFixed(2)}
          </div>
        </div>
      </div>

      <Link href="/checkout">
        <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
          Checkout · ${total.toFixed(2)}
        </Button>
      </Link>
    </div>
  );
};
