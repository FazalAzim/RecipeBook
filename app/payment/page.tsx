'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { PaymentMethod } from '@/lib/types';

export default function PaymentPage() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardErrors, setCardErrors] = useState<{ number?: string; holder?: string; expiry?: string; cvv?: string }>({});

  // Recover customer info from session or Auth
  const [customerInfo, setCustomerInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('recipebooks_checkout_customer');
      if (user) {
        setCustomerInfo({ name: user.name, email: user.email });
        if (!cardHolder) setCardHolder(user.name);
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

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setExpiry(val);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvv(val);
  };

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';
    return 'Card';
  };

  const handleStripeCheckout = async () => {
    setErrorMessage(null);
    if (!customerInfo?.email) {
      setErrorMessage('Missing customer billing email. Please return to Checkout.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/stripe/checkout-session', {
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
        throw new Error(data.error || 'Failed to initialize Stripe checkout session.');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned by payment gateway.');
      }
    } catch (err: any) {
      console.error('Stripe redirect error:', err);
      setErrorMessage(err.message || 'Stripe payment initialization failed.');
      setIsProcessing(false);
    }
  };

  const handleSubmitPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (paymentMethod === 'stripe') {
      return handleStripeCheckout();
    }

    // Validate if Credit Card selected
    if (paymentMethod === 'credit_card') {
      const errors: typeof cardErrors = {};
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) errors.number = 'Please enter a valid 16-digit card number.';
      if (!cardHolder || cardHolder.trim().length < 2) errors.holder = 'Cardholder name is required.';
      if (!expiry || expiry.length < 5) errors.expiry = 'MM/YY required.';
      if (!cvv || cvv.length < 3) errors.cvv = 'CVV required.';

      if (Object.keys(errors).length > 0) {
        setCardErrors(errors);
        return;
      }
    }

    if (!customerInfo || !customerInfo.email) {
      setErrorMessage('Missing customer billing details. Please return to Checkout.');
      return;
    }

    setIsProcessing(true);

    try {
      // Direct server-side verified order processing
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          items: items,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment processing failed.');
      }

      // Clear the shopping cart
      clearCart();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('recipebooks_checkout_customer');
      }

      showToast('Payment verified successfully!', 'success');
      router.push(`/order-confirmation/${data.order.id}`);
    } catch (err: any) {
      console.error('Payment processing failed:', err);
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        {/* Title */}
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
          {/* Left Column: Payment Form */}
          <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
            {/* Payment Method Selector */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                SELECT PAYMENT METHOD
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'credit_card' ? '2px solid var(--primary)' : '1px solid var(--border-base)',
                    backgroundColor: paymentMethod === 'credit_card' ? 'var(--primary-light)' : 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <CreditCard size={22} color={paymentMethod === 'credit_card' ? 'var(--primary)' : 'var(--text-secondary)'} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: paymentMethod === 'credit_card' ? 'var(--primary-dark)' : 'var(--text-primary)' }}>
                    Credit / Debit Card
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Visa, Mastercard, Amex</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'stripe' ? '2px solid var(--primary)' : '1px solid var(--border-base)',
                    backgroundColor: paymentMethod === 'stripe' ? 'var(--primary-light)' : 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Sparkles size={20} color={paymentMethod === 'stripe' ? 'var(--primary)' : 'var(--text-secondary)'} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>Stripe</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: paymentMethod === 'stripe' ? 'var(--primary-dark)' : 'var(--text-primary)' }}>
                    Stripe Checkout
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Hosted Payment Page</span>
                </button>
              </div>
            </div>

            {/* Credit Card Input Form */}
            {paymentMethod === 'credit_card' && (
              <form onSubmit={handleSubmitPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  label="Card Number"
                  required
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  error={cardErrors.number}
                  leftIcon={<CreditCard size={18} />}
                  rightIcon={
                    cardNumber.length > 0 && (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)', padding: '2px 6px', backgroundColor: 'var(--primary-light)', borderRadius: '4px' }}>
                        {getCardBrand(cardNumber)}
                      </span>
                    )
                  }
                />

                <Input
                  label="Cardholder Full Name"
                  required
                  placeholder="e.g. Amina Zahir"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  error={cardErrors.holder}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Expiry Date"
                    required
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    error={cardErrors.expiry}
                  />

                  <Input
                    label="CVV / CVC"
                    required
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    error={cardErrors.cvv}
                    rightIcon={<Lock size={14} />}
                  />
                </div>

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
                  }}
                >
                  <Lock size={16} color="var(--accent-olive)" />
                  <span>256-Bit SSL Encrypted & Verified Digital Delivery</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isProcessing}
                  leftIcon={<CheckCircle2 size={18} />}
                >
                  Pay ${total.toFixed(2)} & Download Books
                </Button>
              </form>
            )}

            {/* Stripe Hosted Checkout Prompt */}
            {paymentMethod === 'stripe' && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  You will be securely redirected to Stripe’s official encrypted checkout page to complete payment via Card, Apple Pay, or Google Pay.
                </p>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isProcessing}
                  rightIcon={<ExternalLink size={18} />}
                  onClick={handleStripeCheckout}
                >
                  Proceed to Stripe Checkout (${total.toFixed(2)})
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Mini Summary */}
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
