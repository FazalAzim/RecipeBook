'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowLeft, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/common/Button';

export default function PaymentPage() {
  const { user } = useAuth();
  const { items, total } = useCart();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('recipebooks_checkout_customer');
      if (user) {
        setCustomerInfo({ name: user.name, email: user.email });
      } else if (stored) {
        setCustomerInfo(JSON.parse(stored));
      }
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleLemonSqueezyCheckout = async () => {
    setErrorMessage(null);
    if (!customerInfo?.email) {
      setErrorMessage('Missing customer billing email. Please return to Checkout.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/lemon-squeezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            bookId: i.bookId,
            quantity: i.quantity,
          })),
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize Lemon Squeezy checkout.');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned by payment gateway.');
      }
    } catch (err: unknown) {
      console.error('Lemon Squeezy redirect error:', err);
      const message =
        err instanceof Error ? err.message : 'Lemon Squeezy payment initialization failed.';
      setErrorMessage(message);
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href="/checkout"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Order Review</span>
          </Link>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Secure Payment</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Total Amount Due:{' '}
            <strong style={{ color: 'var(--primary-dark)', fontSize: '1.125rem' }}>
              ${total.toFixed(2)}
            </strong>
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              backgroundColor: '#FFF5F5',
              border: '1.5px solid #FFC9C9',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              color: 'var(--accent-berry)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.875rem' }}>{errorMessage}</span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="payment-layout-grid"
        >
          <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary-border)',
              }}
            >
              <ShieldCheck size={22} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  Lemon Squeezy Secure Checkout
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Pay with credit card, debit card, Apple Pay, or Google Pay
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              You will be redirected to Lemon Squeezy&apos;s encrypted checkout page to complete your payment securely.
              Your recipe books will be available for download immediately after payment is confirmed.
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <Lock size={16} color="var(--accent-olive)" />
              <span>Payments are processed by Lemon Squeezy. Card details are never stored on our servers.</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isProcessing}
              rightIcon={<ExternalLink size={18} />}
              onClick={handleLemonSqueezyCheckout}
            >
              Pay ${total.toFixed(2)} Securely
            </Button>
          </div>

          <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
              Summary of Items ({items.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {items.map((item) => (
                <div key={item.bookId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                    {item.title}
                  </span>
                  <span style={{ fontWeight: 600 }}>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 800 }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary-dark)' }}>${total.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-olive)', marginTop: '0.25rem' }}>
                Includes instant download delivery
              </div>
            </div>

            {customerInfo && (
              <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>Delivering to:</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{customerInfo.email}</div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 800px) {
            .payment-layout-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
