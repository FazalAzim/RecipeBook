import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Download,
  BookOpen,
  FileText,
  Eye,
  ArrowRight,
  Calendar,
  Mail,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { libraryService } from '../../services/firebase/libraryService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import type { LibraryItem } from '../../types';

export const LibraryPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [guestEmail, setGuestEmail] = useState('');
  const [searchedEmail, setSearchedEmail] = useState('');
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchLibrary = async (emailToSearch?: string) => {
    const activeUserId = user?.id;
    const activeEmail = emailToSearch || user?.email;

    if (!activeUserId && !activeEmail) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await libraryService.getUserLibrary(activeUserId, activeEmail);
      setLibraryItems(data);
      setHasSearched(true);
    } catch (err: any) {
      console.error('Error fetching library:', err);
      setError(err.message || 'Failed to retrieve your recipe book library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLibrary(user.email);
    }
  }, [user]);

  const handleGuestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) return;
    setSearchedEmail(guestEmail.trim());
    fetchLibrary(guestEmail.trim());
  };

  const handleDownloadPdf = async (item: LibraryItem) => {
    const identifier = user?.id || searchedEmail || item.customerEmail || 'guest';
    setDownloadingId(item.id);
    try {
      await libraryService.downloadBookPdf(identifier, item.bookId, item.customerEmail || searchedEmail);
      showToast(`Downloading "${item.title}" PDF...`, 'success');
      // Refresh library metrics
      fetchLibrary(searchedEmail || user?.email);
    } catch (err: any) {
      showToast(err.message || 'Download failed. Access denied.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'Recently';
    if (typeof dateVal === 'object' && 'seconds' in dateVal) {
      return new Date(dateVal.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return new Date(dateVal).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Opening your digital recipe bookshelf..." />;
  }

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Badge variant="primary" style={{ marginBottom: '0.5rem' }}>
              Personal Cookbook Vault
            </Badge>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>My Recipe Library</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              {user
                ? `Logged in as ${user.email} — Access all your purchased cookbooks.`
                : 'Access your purchased recipe books anytime with your email or account.'}
            </p>
          </div>

          <Link to="/">
            <Button variant="secondary" rightIcon={<ArrowRight size={16} />}>
              Explore More Books
            </Button>
          </Link>
        </div>

        {/* Guest Lookup Form if Not Logged In */}
        {!user && (
          <div
            className="surface-card"
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--bg-surface)',
              marginBottom: '2.5rem',
              border: '1.5px solid var(--primary-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Mail size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1875rem' }}>Find Purchased Recipe Books by Email</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Purchased as a guest without creating an account? Enter the email address you used at checkout to immediately unlock all your downloadable PDFs.
            </p>

            <form onSubmit={handleGuestSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', maxWidth: '540px' }}>
              <div style={{ flex: '1 1 280px' }}>
                <Input
                  placeholder="Enter your checkout email..."
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  leftIcon={<Search size={16} />}
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                Find My Cookbooks
              </Button>
            </form>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>Already have an account with us?</span>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Sign In to automatically sync your library →
              </Link>
            </div>
          </div>
        )}

        {error && <ErrorState message={error} onRetry={() => fetchLibrary(searchedEmail || user?.email)} />}

        {/* Empty State */}
        {!error && ((user && libraryItems.length === 0) || (!user && hasSearched && libraryItems.length === 0)) && (
          <EmptyState
            icon={<BookOpen size={36} />}
            title="No purchased recipe books found"
            description={
              user
                ? "You haven't purchased any recipe books on this account yet. Explore our marketplace to start cooking!"
                : `We could not find any paid orders for "${searchedEmail}". Please check your email spelling or explore our cookbooks.`
            }
            actionText="Browse Cookbook Market"
            onAction={() => navigate('/')}
          />
        )}

        {/* Unsearched guest initial state */}
        {!user && !hasSearched && (
          <div
            className="surface-card"
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              backgroundColor: 'var(--bg-subtle)',
            }}
          >
            <BookOpen size={40} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Your Lifetime Recipe Downloads</h3>
            <p style={{ maxWidth: '460px', margin: '0 auto 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Every cookbook you purchase on RecipeBooks Market includes unlimited lifetime PDF re-downloads for phone, tablet, and print.
            </p>
            <Link to="/">
              <Button variant="primary">
                Browse Popular Cookbooks
              </Button>
            </Link>
          </div>
        )}

        {/* Library Books Grid */}
        {!error && libraryItems.length > 0 && (
          <div>
            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                Your Cookbooks ({libraryItems.length})
              </h3>
              {searchedEmail && !user && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Showing orders for <strong>{searchedEmail}</strong>
                </span>
              )}
            </div>

            <div
              className="library-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: '1.25rem',
              }}
            >
              {libraryItems.map((item) => (
                <div
                  key={item.id}
                  className="surface-card animate-fade-in"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  {/* Book Cover + Overlay */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '65%', overflow: 'hidden', backgroundColor: 'var(--bg-subtle)' }}>
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                      <Badge variant="pdf" icon={<FileText size={12} />}>
                        PDF Ready
                      </Badge>
                    </div>
                  </div>

                  {/* Library Content Details */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h4
                      style={{
                        fontSize: '1.0625rem',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </h4>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      By {item.author}
                    </div>

                    {/* Metadata Pills */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.375rem',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Calendar size={12} /> Purchased
                        </span>
                        <strong style={{ color: 'var(--text-primary)' }}>{formatDate(item.purchasedAt)}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Download size={12} /> Downloads
                        </span>
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {item.downloadCount || 0} times
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>File Size</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{item.fileSize}</strong>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                      <Button
                        variant="primary"
                        fullWidth
                        leftIcon={<Download size={16} />}
                        isLoading={downloadingId === item.id}
                        onClick={() => handleDownloadPdf(item)}
                      >
                        Download PDF
                      </Button>
                      <Link to={`/books/${item.bookId}`}>
                        <Button variant="secondary" className="btn-icon" title="View Book Information">
                          <Eye size={18} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
