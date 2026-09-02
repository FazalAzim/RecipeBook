'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Download,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import type { Order } from '@/lib/types';

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('payment_success') === 'true' || searchParams.get('stripe_success') === 'true') {
      clearCart();
      sessionStorage.removeItem('recipebooks_checkout_customer');
    }
  }, [searchParams, clearCart]);

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
      // Confetti safely ignored if not supported
    }

    const fetchOrder = async (attempt = 0) => {
      if (!orderId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          const shouldRetry =
            attempt < 8 &&
            (searchParams.get('payment_success') === 'true' || searchParams.get('stripe_success') === 'true');

          if (shouldRetry) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return fetchOrder(attempt + 1);
          }

          throw new Error('Order details could not be found.');
        }
        const data = await res.json();
        setOrder(data.order);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve order confirmation.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, searchParams]);

  const handleDownload = async (bookId: string, title: string) => {
    setDownloadingBookId(bookId);
    try {
      const downloadUrl = `/api/download/${bookId}${order?.customerEmail ? `?email=${encodeURIComponent(order.customerEmail)}` : ''}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
        <ErrorState
          title="Order Not Found"
          message={error || 'We could not locate this order receipt. Please check your email or visit your library.'}
        />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/library">
            <Button variant="primary">Go to My Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Success Header */}
        <div
          className="surface-card animate-pop-in"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '6px solid var(--accent-olive)',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-pill)',
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
            Payment Verified & Completed
          </Badge>

          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Thank You for Your Order!</h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Your digital recipe cookbook edition is ready for instant download. A copy of the receipt and lifetime access link has been dispatched to <strong>{order.customerEmail}</strong>.
          </p>

          <div
            style={{
              display: 'inline-flex',
              gap: '1.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.875rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Order ID: </span>
              <strong>{order.id}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Amount Paid: </span>
              <strong style={{ color: 'var(--primary-dark)' }}>${order.total.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Purchased Cookbooks Download Box */}
        <div className="surface-card" style={{ padding: '2rem', backgroundColor: 'var(--bg-surface)', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={20} color="var(--primary)" />
            <span>Your Purchased Digital Cookbooks</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items.map((item) => (
              <div
                key={item.bookId}
                className="surface-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  backgroundColor: 'var(--bg-highlight)',
                  flexWrap: 'wrap',
                }}
              >
                <img
                  src={item.coverImageUrl}
                  alt={item.title}
                  style={{
                    width: '64px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Badge variant="pdf" icon={<FileText size={10} />}>
                      PDF
                    </Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.fileSize}</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.title}</h4>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    By {item.author || 'Master Chef'} • Full Digital Edition
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Download size={16} />}
                  isLoading={downloadingBookId === item.bookId}
                  onClick={() => handleDownload(item.bookId, item.title)}
                  style={{ flexShrink: 0 }}
                >
                  Download PDF
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/library">
            <Button variant="secondary" leftIcon={<BookOpen size={18} />}>
              Go to My Recipe Library
            </Button>
          </Link>

          <Link href="/">
            <Button variant="primary" rightIcon={<ArrowRight size={18} />}>
              Explore More Cookbooks
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
