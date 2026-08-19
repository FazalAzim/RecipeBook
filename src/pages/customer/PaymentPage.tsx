import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { ordersService } from '../../services/firebase/ordersService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import type { PaymentMethod } from '../../types';

export const PaymentPage: React.FC = () => {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

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
  const storedCustomer = sessionStorage.getItem('recipebooks_checkout_customer');
  const customerInfo = user || (storedCustomer ? JSON.parse(storedCustomer) : null);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
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

  // Card brand detector
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';
    return 'Card';
  };

  const handleSubmitPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

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
      // Simulate secure tokenized payment gateway authorization
      await new Promise(resolve => setTimeout(resolve, 1200));

      const userId = user?.id || `guest-${Date.now()}`;
      const customerName = customerInfo.name || 'Gourmet Customer';
      const customerEmail = customerInfo.email;

      // Server-verified order creation in Firestore / Backend
      const order = await ordersService.createOrder(
        userId,
        customerName,
        customerEmail,
        items,
        paymentMethod
      );

      // Clear the shopping cart
      clearCart();
      sessionStorage.removeItem('recipebooks_checkout_customer');

      showToast('Payment verified successfully!', 'success');
      navigate(`/order-confirmation/${order.id}`);
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
            to="/checkout"
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
            Total Amount Due: <strong style={{ color: 'var(--primary-dark)', fontSize: '1.125rem' }}>${total.toFixed(2)}</strong>
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              backgroundColor: '#FFF5F5',
              border: '1px solid #FFC9C9',
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
            <span>{errorMessage}</span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '2.5rem',
            alignItems: 'start',
          }}
          className="payment-layout-grid"
        >
          {/* Left Column: Payment Methods Tabs & Form */}
          <div>
            {/* Tabs Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.375rem',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                style={{
                  padding: '0.625rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  backgroundColor: paymentMethod === 'credit_card' ? 'var(--bg-surface)' : 'transparent',
                  color: paymentMethod === 'credit_card' ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: paymentMethod === 'credit_card' ? 'var(--shadow-xs)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                }}
              >
                <CreditCard size={16} />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                style={{
                  padding: '0.625rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  backgroundColor: paymentMethod === 'paypal' ? 'var(--bg-surface)' : 'transparent',
                  color: paymentMethod === 'paypal' ? '#003087' : 'var(--text-secondary)',
                  boxShadow: paymentMethod === 'paypal' ? 'var(--shadow-xs)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                }}
              >
                <span style={{ fontWeight: 800, fontStyle: 'italic' }}>P</span>
                <span>PayPal</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                style={{
                  padding: '0.625rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  backgroundColor: paymentMethod === 'apple_pay' ? 'var(--bg-surface)' : 'transparent',
                  color: paymentMethod === 'apple_pay' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: paymentMethod === 'apple_pay' ? 'var(--shadow-xs)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                }}
              >
                <Smartphone size={16} />
                <span>Apple / G Pay</span>
              </button>
            </div>

            {/* TAB 1: Credit / Debit Card */}
            {paymentMethod === 'credit_card' && (
              <form onSubmit={handleSubmitPayment} className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
                {/* Visual Card Preview */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #2B2523 0%, #1A1615 100%)',
                    color: '#FFFFFF',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '1.75rem',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid #3E3835',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8A29E' }}>
                      Digital Cookbook Express
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#FFA94D' }}>
                      {getCardBrand(cardNumber)}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.25rem', letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: '1.5rem' }}>
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#A8A29E', textTransform: 'uppercase' }}>Cardholder</div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>
                        {cardHolder || 'FULL NAME'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#A8A29E', textTransform: 'uppercase' }}>Expires</div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{expiry || 'MM/YY'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Input
                    label="Card Number"
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    error={cardErrors.number}
                    leftIcon={<CreditCard size={18} />}
                    required
                  />

                  <Input
                    label="Cardholder Name"
                    placeholder="e.g. John Smith"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    error={cardErrors.holder}
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      error={cardErrors.expiry}
                      required
                    />
                    <Input
                      label="CVV / CVC"
                      placeholder="123"
                      type="password"
                      maxLength={4}
                      value={cvv}
                      onChange={handleCvvChange}
                      error={cardErrors.cvv}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1.75rem' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isProcessing}
                    leftIcon={<Lock size={18} />}
                  >
                    Pay ${total.toFixed(2)} & Download Books
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 2: PayPal */}
            {paymentMethod === 'paypal' && (
              <div className="surface-card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: '#003087',
                    marginBottom: '1rem',
                  }}
                >
                  Pay<span style={{ color: '#0079C1' }}>Pal</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
                  You will complete your recipe book purchase securely with your PayPal account or PayPal Credit.
                </p>

                <button
                  type="button"
                  onClick={() => handleSubmitPayment()}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    backgroundColor: '#FFC439',
                    color: '#111',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <span style={{ fontWeight: 900, fontStyle: 'italic' }}>P</span>
                  <span>{isProcessing ? 'Connecting to PayPal...' : `Pay with PayPal ($${total.toFixed(2)})`}</span>
                </button>
              </div>
            )}

            {/* TAB 3: Apple Pay / Google Pay */}
            {paymentMethod === 'apple_pay' && (
              <div className="surface-card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#000',
                      color: '#fff',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                    }}
                  >
                     Pay
                  </div>
                  <div
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#fff',
                      border: '1.5px solid #ccc',
                      color: '#444',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                    }}
                  >
                    G Pay
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
                  Complete checkout instantly with biometric Touch ID, Face ID, or your default Google Wallet.
                </p>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isProcessing}
                  onClick={() => handleSubmitPayment()}
                >
                  Authorize One-Touch Payment (${total.toFixed(2)})
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Order Recalculation & Trust Info */}
          <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1.0625rem' }}>Order Details</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Recipient</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customerInfo?.name || 'Customer'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Delivery Email</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {customerInfo?.email}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Total Items</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{items.length} cookbooks</span>
              </div>
            </div>

            <div
              style={{
                paddingTop: '0.875rem',
                borderTop: '1px solid var(--border-base)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.125rem',
                marginBottom: '1.5rem',
              }}
            >
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                ${total.toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={14} color="var(--accent-olive)" />
                <span>Instant PDF file generation & download</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={14} color="var(--accent-olive)" />
                <span>Zero recurring fees or subscriptions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={14} color="var(--accent-olive)" />
                <span>256-bit encrypted secure checkout</span>
              </div>
            </div>
          </div>
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
  );
};
