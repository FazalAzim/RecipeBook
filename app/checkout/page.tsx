'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, ArrowRight, UserCheck, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';

export default function CheckoutPage() {
  const { user, login } = useAuth();
  const { items, subtotal, total, totalItems } = useCart();
  const router = useRouter();

  // Guest login accordion/form if not yet authenticated
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Customer contact info (pre-filled if logged in)
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [formErrors, setFormErrors] = useState<{ fullName?: string; email?: string }>({});

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmittingAuth(true);
    try {
      const loggedUser = await login(loginEmail, loginPassword);
      setFullName(loggedUser.name);
      setEmail(loggedUser.email);
      setShowAuthForm(false);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const validateAndProceed = () => {
    const errors: { fullName?: string; email?: string } = {};
    const nameToValidate = user ? user.name : fullName;
    const emailToValidate = user ? user.email : email;

    if (!nameToValidate || nameToValidate.trim().length < 2) {
      errors.fullName = 'Please enter your full name.';
    }

    if (!emailToValidate || !/^\S+@\S+\.\S+$/.test(emailToValidate)) {
      errors.email = 'Please provide a valid email address to receive your receipt and download access.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'recipebooks_checkout_customer',
        JSON.stringify({
          name: nameToValidate.trim(),
          email: emailToValidate.trim(),
        })
      );
    }

    router.push('/payment');
  };

  if (items.length === 0) return null;

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href="/cart"
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
            <span>Back to Shopping Cart</span>
          </Link>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Checkout & Order Review</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Verify your contact information and ordered recipe books before payment.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 420px',
            gap: '2.5rem',
            alignItems: 'start',
          }}
          className="checkout-layout-grid"
        >
          {/* Left Column: Customer Details & Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Auth Notification or Login Prompt */}
            {!user && (
              <div
                className="surface-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  backgroundColor: 'var(--bg-highlight)',
                  border: '1px solid var(--primary-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                      Already have an account?
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Sign in for instant checkout and automatic sync with your recipe library.
                    </p>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowAuthForm(!showAuthForm)}
                  >
                    {showAuthForm ? 'Close Login' : 'Quick Sign In'}
                  </Button>
                </div>

                {showAuthForm && (
                  <form onSubmit={handleQuickLogin} style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                    {authError && (
                      <div
                        style={{
                          backgroundColor: 'var(--accent-berry-light)',
                          color: 'var(--accent-berry)',
                          padding: '0.625rem 0.875rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          marginBottom: '1rem',
                        }}
                      >
                        {authError}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }} className="stack-sm">
                      <Input
                        label="Email Address"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                      <Input
                        label="Password"
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingAuth}>
                      Log In & Apply Details
                    </Button>
                  </form>
                )}
              </div>
            )}

            {user && (
              <div
                className="surface-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  backgroundColor: 'var(--accent-olive-light)',
                  border: '1px solid #B2F2BB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                }}
              >
                <UserCheck size={24} color="var(--accent-olive)" />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-olive)' }}>
                    Authenticated as {user.name} ({user.email})
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Your purchased cookbooks will be tied directly to your user account library.
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information Card */}
            <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                Digital Delivery & Contact Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  label="Full Name"
                  required
                  disabled={Boolean(user)}
                  value={user ? user.name : fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Amina Zahir"
                  error={formErrors.fullName}
                  hint="Required for official receipt issuance"
                />

                <Input
                  label="Email Address for PDF Access"
                  type="email"
                  required
                  disabled={Boolean(user)}
                  value={user ? user.email : email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  error={formErrors.email}
                  hint="We will email download instructions and grant instant library lookup to this address"
                />
              </div>
            </div>

            {/* Delivery Guarantee Card */}
            <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-subtle)' }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Instant Digital Delivery Promise
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Upon completing payment on the next screen, you will immediately receive full PDF download buttons and a receipt on your screen. You can also re-access all your recipe books anytime using your email on the <strong>My Library</strong> page.
              </p>
            </div>
          </div>

          {/* Right Column: Order Review */}
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
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
              Order Review ({totalItems} Item{totalItems > 1 ? 's' : ''})
            </h3>

            {/* Item List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem', maxHeight: '280px', overflowY: 'auto' }}>
              {items.map((item) => (
                <div key={item.bookId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    style={{
                      width: '48px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} • ${item.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Instant Download Delivery</span>
                <span style={{ color: 'var(--accent-olive)', fontWeight: 600 }}>$0.00</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  marginTop: '0.25rem',
                  borderTop: '2px dashed var(--border-base)',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: '1.125rem', fontWeight: 800 }}>Total Due</span>
                <span style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight size={18} />}
              onClick={validateAndProceed}
            >
              Continue to Payment
            </Button>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .checkout-layout-grid {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
