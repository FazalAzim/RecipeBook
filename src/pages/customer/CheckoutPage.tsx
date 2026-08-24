import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ArrowRight, UserCheck, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';

export const CheckoutPage: React.FC = () => {
  const { user, login } = useAuth();
  const { items, subtotal, total, totalItems } = useCart();
  const navigate = useNavigate();

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

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

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

    // Save temporary customer details in sessionStorage if guest
    sessionStorage.setItem('recipebooks_checkout_customer', JSON.stringify({
      name: nameToValidate.trim(),
      email: emailToValidate.trim(),
    }));

    navigate('/payment');
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to="/cart"
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
            gridTemplateColumns: '1fr 400px',
            gap: '2.5rem',
            alignItems: 'start',
          }}
          className="checkout-layout-grid"
        >
          {/* Left Column: Customer Information & Items Review */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Account / Contact Card */}
            <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
              <div className="checkout-customer-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={20} color="var(--primary)" />
                  <span>Customer Information</span>
                </h3>
                {user ? (
                  <Badge variant="success">Logged in as {user.name.split(' ')[0]}</Badge>
                ) : (
                  <button
                    onClick={() => setShowAuthForm(prev => !prev)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--primary)', fontWeight: 600, whiteSpace: 'normal', textAlign: 'right' }}
                  >
                    {showAuthForm ? 'Close Login' : 'Already have an account? Log In'}
                  </button>
                )}
              </div>

              {/* Login box if guest clicks to login */}
              {showAuthForm && !user && (
                <form
                  onSubmit={handleQuickLogin}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--border-base)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    Quick Sign-In to your Account
                  </div>
                  {authError && (
                    <div style={{ color: 'var(--accent-berry)', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                      {authError}
                    </div>
                  )}
                  <div className="checkout-login-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
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
                    Sign In & Continue
                  </Button>
                </form>
              )}

              {user ? (
                <div className="checkout-user-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF Delivery Email</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.email}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Input
                    label="Full Name"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: undefined });
                    }}
                    placeholder="e.g. John Smith"
                    error={formErrors.fullName}
                  />
                  <Input
                    label="Email Address (Where PDF download links are delivered)"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                    }}
                    placeholder="e.g. john@example.com"
                    error={formErrors.email}
                    hint="We will link this order to your email so you can re-download anytime."
                  />
                </div>
              )}
            </div>

            {/* Order Items Review */}
            <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
              <h3 style={{ fontSize: '1.1875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={20} color="var(--primary)" />
                <span>Recipe Books in this Order ({items.length})</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.map((item) => (
                  <div
                    key={item.bookId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          ${item.unitPrice.toFixed(2)} × {item.quantity} {item.quantity > 1 ? 'copies' : 'copy'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Action */}
          <div
            className="surface-card"
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--bg-surface)',
              position: 'sticky',
              top: '90px',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Payment Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                <span>Subtotal ({totalItems} items)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                <span>Instant PDF Download</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-olive)' }}>FREE</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  marginTop: '0.5rem',
                  borderTop: '1px solid var(--border-base)',
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.125rem' }}>Total Due</span>
                <span style={{ fontWeight: 800, fontSize: '1.375rem', color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
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
              <Lock size={14} color="var(--accent-olive)" />
              <span>Next step: Select Payment Method & Finalize</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .checkout-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
        @media (max-width: 560px) {
          .checkout-login-fields,
          .checkout-user-fields {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
