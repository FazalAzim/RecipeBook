import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Download,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { ordersService } from '../../services/firebase/ordersService';
import { libraryService } from '../../services/firebase/libraryService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { Order } from '../../types';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);

  useEffect(() => {
    // Launch celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E8590C', '#D97706', '#2B8A3E', '#FFD8A8'],
      });
    } catch {
      // Confetti fallback safely ignored
    }

    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await ordersService.getOrderById(orderId);
        if (!data) {
          setError('Order details could not be found.');
        } else {
          setOrder(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve order confirmation.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleDownload = async (bookId: string, title: string) => {
    const activeUserId = user?.id || order?.userId || 'guest';
    setDownloadingBookId(bookId);
    try {
      await libraryService.downloadBookPdf(activeUserId, bookId);
      showToast(`Downloading "${title}" PDF...`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Download failed', 'error');
    } finally {
      setDownloadingBookId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Retrieving order receipt..." />;
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <ErrorState message={error || 'Order not found'} />
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Success Banner */}
        <div
          className="surface-card animate-pop-in"
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            backgroundColor: 'var(--bg-surface)',
            borderColor: '#B2F2BB',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-olive-light)',
              color: 'var(--accent-olive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <Badge variant="success" style={{ marginBottom: '0.75rem' }}>
            Payment Successful
          </Badge>

          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Your Order Has Been Confirmed!
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Thank you, <strong>{order.customerName}</strong>! Your recipe book PDFs are ready to download immediately below and have also been saved to your personal library.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/library">
              <Button variant="primary" leftIcon={<BookOpen size={16} />}>
                Go to My Library
              </Button>
            </Link>
            <Link to="/">
              <Button variant="secondary" rightIcon={<ArrowRight size={16} />}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Receipt Card */}
        <div className="surface-card" style={{ padding: '2rem', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Order Number
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {order.id}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Payment Method
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {order.paymentMethod.replace('_', ' ')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status
              </div>
              <Badge variant="success">Completed</Badge>
            </div>
          </div>

          {/* Purchased Books List with Direct Download Button */}
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Purchased Digital Cookbooks</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {order.items.map((item) => (
              <div
                key={item.bookId}
                className="surface-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 280px' }}>
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    style={{ width: '56px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{item.fileSize}</span>
                      <span>•</span>
                      <span>${item.unitPrice.toFixed(2)} × {item.quantity}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    ${item.subtotal.toFixed(2)}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Download size={14} />}
                    isLoading={downloadingBookId === item.bookId}
                    onClick={() => handleDownload(item.bookId, item.title)}
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals Breakdown */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
              <span>Items Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
              <span>Digital PDF Delivery</span>
              <span style={{ color: 'var(--accent-olive)', fontWeight: 600 }}>FREE</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                borderTop: '1px solid var(--border-base)',
                paddingTop: '0.75rem',
              }}
            >
              <span>Grand Total Paid</span>
              <span style={{ color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
