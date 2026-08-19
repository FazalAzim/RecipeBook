import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Download,
  BookOpen,
  FileText,
  Eye,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { libraryService } from '../../services/firebase/libraryService';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import type { LibraryItem } from '../../types';

export const LibraryPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchLibrary = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await libraryService.getUserLibrary(user.id);
      setLibraryItems(data);
    } catch (err: any) {
      console.error('Error fetching library:', err);
      setError(err.message || 'Failed to retrieve your recipe book library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [user]);

  const handleDownloadPdf = async (item: LibraryItem) => {
    if (!user) return;
    setDownloadingId(item.id);
    try {
      await libraryService.downloadBookPdf(user.id, item.bookId);
      showToast(`Downloading "${item.title}" PDF...`, 'success');
      // Refresh library metrics
      fetchLibrary();
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Badge variant="primary" style={{ marginBottom: '0.5rem' }}>
              Personal Cookbook Vault
            </Badge>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>My Recipe Library</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              All your purchased culinary e-books. Download or view them anytime on any device.
            </p>
          </div>

          <Link to="/">
            <Button variant="secondary" rightIcon={<ArrowRight size={16} />}>
              Explore More Books
            </Button>
          </Link>
        </div>

        {error && <ErrorState message={error} onRetry={fetchLibrary} />}

        {!error && libraryItems.length === 0 && (
          <EmptyState
            icon={<BookOpen size={36} />}
            title="You haven't purchased any recipe books yet"
            description="Explore our curated collection of authentic digital cookbooks. Once purchased, your books and PDF download links will appear here immediately."
            actionText="Browse Cookbook Market"
            onAction={() => navigate('/')}
          />
        )}

        {!error && libraryItems.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem',
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
        )}
      </div>
    </div>
  );
};
