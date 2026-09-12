'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { VisitorsAnalyticsPanel, type VisitDayPoint } from '@/components/admin/VisitorsAnalyticsPanel';
import type { Book, Order } from '@/lib/types';

export default function AdminDashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    booksSold: 0,
    totalRevenue: 0,
    totalOrders: 0,
    pageViewsAllTime: 0,
    pageViewsToday: 0,
    uniqueVisitorsAllTime: 0,
    uniqueVisitorsLast7Days: 0,
    uniqueVisitorsToday: 0,
    series: [] as VisitDayPoint[],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Deletion modal state
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [booksRes, ordersRes, statsRes] = await Promise.all([
        fetch('/api/books?includeUnpublished=true'),
        fetch('/api/orders'),
        fetch('/api/admin/stats'),
      ]);

      if (booksRes.ok) {
        const data = await booksRes.json();
        setBooks(data.books || []);
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders((data.orders || []).slice(0, 5)); // 5 most recent
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(
          data.stats || {
            totalBooks: 0,
            booksSold: 0,
            totalRevenue: 0,
            totalOrders: 0,
            pageViewsAllTime: 0,
            pageViewsToday: 0,
            uniqueVisitorsAllTime: 0,
            uniqueVisitorsLast7Days: 0,
            uniqueVisitorsToday: 0,
            series: [],
          }
        );
      }
    } catch (err: any) {
      console.error('Error loading admin stats:', err);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleTogglePublish = async (book: Book) => {
    const newStatus = !book.isPublished;
    try {
      const res = await fetch(`/api/books/${book.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, isPublished: newStatus } : b))
      );
      showToast(`Book ${newStatus ? 'published' : 'unpublished'} successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update publish status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/books/${bookToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      if (data.softDeleted) {
        showToast('Book has past sales: Unpublished safely to preserve customer libraries.', 'info');
      } else {
        showToast('Book removed from database.', 'success');
      }
      setBookToDelete(null);
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete book', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(books.map((b) => b.category)))];

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading admin dashboard & analytics..." />;
  }

  return (
    <div>
      {/* Title + Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Management Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Catalogue inventory, sales analytics, visits, and customer delivery overview.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/books/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Add New Cookbook
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="surface-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Cookbooks in Catalog</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalBooks}</div>
          </div>
        </div>

        <div className="surface-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-olive-light)',
              color: 'var(--accent-olive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total PDF Copies Sold</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.booksSold}</div>
          </div>
        </div>

        <div className="surface-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--secondary-light)',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Revenue</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="surface-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(28, 25, 23, 0.08)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Completed Orders</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalOrders}</div>
          </div>
        </div>
      </div>

      <VisitorsAnalyticsPanel
        pageViewsAllTime={stats.pageViewsAllTime}
        pageViewsToday={stats.pageViewsToday}
        uniqueVisitorsAllTime={stats.uniqueVisitorsAllTime}
        uniqueVisitorsLast7Days={stats.uniqueVisitorsLast7Days}
        uniqueVisitorsToday={stats.uniqueVisitorsToday}
        series={stats.series || []}
      />

      {/* Main Table: Cookbook Catalog Management */}
      <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Cookbook Inventory ({filteredBooks.length})</h3>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.875rem' }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ height: '38px', fontSize: '0.875rem' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border-base)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem', fontWeight: 700 }}>Cover</th>
                <th style={{ padding: '0.75rem', fontWeight: 700 }}>Title & Cuisine</th>
                <th style={{ padding: '0.75rem', fontWeight: 700 }}>Category</th>
                <th style={{ padding: '0.75rem', fontWeight: 700 }}>Price</th>
                <th style={{ padding: '0.75rem', fontWeight: 700 }}>Copies Sold</th>
                <th style={{ padding: '0.75rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.75rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} style={{ borderBottom: '1px solid var(--border-light)', verticalAlign: 'middle' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      style={{
                        width: '44px',
                        height: '56px',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        backgroundColor: '#1a1a1a',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', maxWidth: '240px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {book.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      By {book.author} • {book.cuisine}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{book.category}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                    ${book.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{book.salesCount}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <Badge variant={book.isPublished ? 'success' : 'neutral'}>
                      {book.isPublished ? 'Published' : 'Draft / Hidden'}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                      <button
                        onClick={() => handleTogglePublish(book)}
                        className="btn btn-ghost btn-sm btn-icon"
                        title={book.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {book.isPublished ? <EyeOff size={16} /> : <Eye size={16} color="var(--primary)" />}
                      </button>

                      <Link href={`/admin/books/${book.id}/edit`}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Edit book">
                          <Edit size={16} />
                        </button>
                      </Link>

                      <button
                        onClick={() => setBookToDelete(book)}
                        className="btn btn-ghost btn-sm btn-icon"
                        style={{ color: 'var(--accent-berry)' }}
                        title="Delete book"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBooks.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No cookbooks found matching filters.
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Customer Orders</h3>
          <Link href="/admin/orders" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>
            View All Orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No recent customer orders recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-base)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem' }}>Items</th>
                  <th style={{ padding: '0.75rem' }}>Total</th>
                  <th style={{ padding: '0.75rem' }}>Payment</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{o.id}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{o.items.length} book{o.items.length > 1 ? 's' : ''}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                      ${o.total.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant="primary">{o.paymentMethod}</Badge>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge variant={o.paymentStatus === 'paid' ? 'success' : 'amber'}>
                        {o.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={Boolean(bookToDelete)} onClose={() => setBookToDelete(null)} title="Confirm Book Removal">
        {bookToDelete && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: '#FFE3E3',
                  color: 'var(--accent-berry)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Are you sure you want to remove this book?</h4>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  &ldquo;{bookToDelete.title}&rdquo; by {bookToDelete.author}
                </p>
              </div>
            </div>

            {bookToDelete.salesCount > 0 ? (
              <div style={{ backgroundColor: 'var(--secondary-light)', padding: '0.875rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: '#FBBF24', marginBottom: '1.5rem' }}>
                <strong>Safe Soft-Delete Notice:</strong> This cookbook has {bookToDelete.salesCount} prior purchase(s). To protect your customers&apos; library download rights, it will be safely unpublished from the storefront rather than permanently deleted.
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                This cookbook has zero sales and will be permanently removed from the database.
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setBookToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleConfirmDelete}>
                Confirm Removal
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
