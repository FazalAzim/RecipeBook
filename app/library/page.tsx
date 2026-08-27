'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Download,
  BookOpen,
  FileText,
  Calendar,
  Mail,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import type { LibraryItem } from '@/lib/types';

export default function LibraryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [guestEmail, setGuestEmail] = useState('');
  const [searchedEmail, setSearchedEmail] = useState('');
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchLibrary = useCallback(async (emailToSearch?: string) => {
    const activeEmail = emailToSearch || user?.email;

    if (!user && !activeEmail) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = activeEmail
        ? `/api/library?email=${encodeURIComponent(activeEmail)}`
        : '/api/library';

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to retrieve your recipe book library.');
      }
      const data = await res.json();
      setLibraryItems(data.items || []);
      setHasSearched(true);
    } catch (err: any) {
      console.error('Error fetching library:', err);
      setError(err.message || 'Failed to retrieve your recipe book library.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchLibrary(user.email);
    }
  }, [user, fetchLibrary]);

  const handleGuestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) return;
    setSearchedEmail(guestEmail.trim());
    fetchLibrary(guestEmail.trim());
  };

  const handleDownloadPdf = async (item: LibraryItem) => {
    setDownloadingId(item.id);
    try {
      const emailQuery = item.customerEmail || searchedEmail || user?.email || '';
      const downloadUrl = `/api/download/${item.bookId}${emailQuery ? `?email=${encodeURIComponent(emailQuery)}` : ''}`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.pdfFileName || `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Downloading "${item.title}" PDF...`, 'success');

      // Update metrics locally
      setTimeout(() => {
        fetchLibrary(searchedEmail || user?.email);
      }, 1000);
    } catch (err: any) {
      showToast(err.message || 'Download failed. Access denied.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'Recently';
    return new Date(dateVal).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.375rem' }}>My Recipe Library</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Access and download all your purchased high-resolution digital cookbooks anytime.
          </p>
        </div>

        {/* Guest Access Search Banner if Not Logged In */}
        {!user && (
          <div
            className="surface-card"
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1.5px solid var(--primary-border)',
              marginBottom: '2.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Mail size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Guest Order Retrieval</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Did you purchase cookbooks as a guest? Enter the billing email address you used during checkout to immediately retrieve your PDF downloads.
              </p>

              <form onSubmit={handleGuestSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 280px' }}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your checkout email address..."
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
                <Button type="submit" variant="primary" leftIcon={<Search size={16} />}>
                  Find My Cookbooks
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner fullHeight message="Retrieving your recipe book collection..." />}

        {/* Error State */}
        {error && !loading && <ErrorState message={error} onRetry={() => fetchLibrary(searchedEmail || user?.email)} />}

        {/* Empty State */}
        {!loading && !error && (user || hasSearched) && libraryItems.length === 0 && (
          <EmptyState
            icon={<BookOpen size={36} />}
            title="No cookbooks found"
            description={
              user
                ? "You haven't purchased any recipe cookbooks yet. Explore our chef-curated catalogue to start cooking!"
                : `No verified orders found associated with "${searchedEmail}". Please verify the email address or explore cookbooks.`
            }
            actionText="Explore Recipe Cookbooks"
            onAction={() => router.push('/')}
          />
        )}

        {/* Not Logged In Initial State */}
        {!user && !hasSearched && !loading && (
          <div
            className="surface-card"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            <BookOpen size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Sign In to View Your Library</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Log in to your account or enter your checkout email above to access and download your purchased digital cookbooks.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link href="/login">
                <Button variant="primary">Log In to Account</Button>
              </Link>
              <Link href="/">
                <Button variant="secondary">Browse Catalog</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Library Items Grid */}
        {!loading && libraryItems.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                You have {libraryItems.length} cookbook{libraryItems.length > 1 ? 's' : ''} in your collection
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                gap: '1.5rem',
              }}
            >
              {libraryItems.map((item) => (
                <div
                  key={item.id}
                  className="surface-card surface-card-interactive"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      style={{
                        width: '80px',
                        height: '105px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        flexShrink: 0,
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                        <Badge variant="pdf" icon={<FileText size={10} />}>
                          PDF
                        </Badge>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.fileSize}</span>
                      </div>

                      <h4
                        style={{
                          fontSize: '1rem',
                          lineHeight: 1.35,
                          marginBottom: '0.25rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.title}
                      </h4>

                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        By {item.author}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Calendar size={12} />
                        <span>Purchased: {formatDate(item.purchasedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Download Controls & Telemetry */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '0.875rem',
                      borderTop: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Downloaded: <strong>{item.downloadCount || 0} times</strong>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Download size={14} />}
                      isLoading={downloadingId === item.id}
                      onClick={() => handleDownloadPdf(item)}
                    >
                      Download PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
