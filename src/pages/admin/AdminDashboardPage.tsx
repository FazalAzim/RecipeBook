import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { booksService } from '../../services/firebase/booksService';
import { ordersService } from '../../services/firebase/ordersService';
import { seedService } from '../../services/firebase/seedService';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import type { Book, Order } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    booksSold: 0,
    totalRevenue: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Deletion modal state
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [allBooks, allOrders, calculatedStats] = await Promise.all([
        booksService.getBooks(undefined, true),
        ordersService.getOrders(),
        ordersService.getAdminStats(),
      ]);
      setBooks(allBooks);
      setOrders(allOrders.slice(0, 5)); // 5 most recent orders
      setStats(calculatedStats);
    } catch (err: any) {
      console.error('Error loading admin stats:', err);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleTogglePublish = async (book: Book) => {
    const newStatus = !book.isPublished;
    try {
      await booksService.togglePublishStatus(book.id, newStatus);
      setBooks(prev => prev.map(b => b.id === book.id ? { ...b, isPublished: newStatus } : b));
      showToast(`Book ${newStatus ? 'published' : 'unpublished'} successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update publish status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      const result = await booksService.deleteBook(bookToDelete.id);
      if (result.softDeleted) {
        showToast(`Book has past sales: Unpublished safely to preserve customer libraries.`, 'info');
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

  const handleSeed = async () => {
    try {
      showToast('Populating cookbook library...', 'info');
      const res = await seedService.seedDatabase();
      showToast(`Seeded ${res.count} recipe books!`, 'success');
      loadDashboardData();
    } catch (e: any) {
      showToast(e.message || 'Seeding failed', 'error');
    }
  };

  // Filtered books for admin table
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(books.map(b => b.category)))];

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading admin metrics & books inventory..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Real-time sales analytics and cookbook catalog management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            leftIcon={<Sparkles size={16} />}
            onClick={handleSeed}
          >
            Seed Sample Books
          </Button>
          <Link to="/admin/books/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Add New Book
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="surface-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Books</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {stats.totalBooks}
            </div>
          </div>
        </div>

        <div className="surface-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Books Sold</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {stats.booksSold}
            </div>
          </div>
        </div>

        <div className="surface-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Revenue</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="surface-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#EDE9FE',
              color: '#6D28D9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Orders</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {stats.totalOrders}
            </div>
          </div>
        </div>
      </div>

      {/* Book Inventory Management Table */}
      <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Cookbook Inventory</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Manage publication status, pricing, and downloadable PDF assets.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', fontSize: '0.875rem' }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ width: '180px', fontSize: '0.875rem' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        {filteredBooks.length === 0 ? (
          <EmptyState
            title="No books match your criteria"
            description="Try changing the search query or category filter."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-base)', color: 'var(--text-secondary)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.875rem 0.5rem' }}>Cover & Title</th>
                  <th style={{ padding: '0.875rem 0.5rem' }}>Category</th>
                  <th style={{ padding: '0.875rem 0.5rem' }}>Price</th>
                  <th style={{ padding: '0.875rem 0.5rem' }}>PDF File</th>
                  <th style={{ padding: '0.875rem 0.5rem' }}>Sales</th>
                  <th style={{ padding: '0.875rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.875rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr
                    key={book.id}
                    style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color var(--transition-fast)' }}
                  >
                    {/* Cover & Title */}
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          style={{ width: '44px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                            {book.title}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            By {book.author}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>
                      <Badge variant="neutral">{book.category}</Badge>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--primary-dark)' }}>
                      ${book.price.toFixed(2)}
                    </td>

                    {/* PDF Asset info */}
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <FileText size={14} color="#D91B24" />
                        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={book.pdfFileName}>
                          {book.pdfFileName || 'recipe_book.pdf'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.fileSize} • {book.pageCount}p</span>
                    </td>

                    {/* Sales */}
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                      {book.salesCount || 0} sold
                    </td>

                    {/* Status Toggle Switch */}
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <button
                        onClick={() => handleTogglePublish(book)}
                        className={`badge ${book.isPublished ? 'badge-success' : 'badge-neutral'}`}
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                        title="Click to toggle publish status"
                      >
                        {book.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{book.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <Link to={`/books/${book.id}`} target="_blank">
                          <button className="btn-icon btn-ghost" title="Preview on store" style={{ color: 'var(--text-secondary)' }}>
                            <ArrowUpRight size={18} />
                          </button>
                        </Link>
                        <Link to={`/admin/books/${book.id}/edit`}>
                          <button className="btn-icon btn-ghost" title="Edit book details" style={{ color: 'var(--primary)' }}>
                            <Edit size={18} />
                          </button>
                        </Link>
                        <button
                          onClick={() => setBookToDelete(book)}
                          className="btn-icon btn-ghost"
                          title="Delete book"
                          style={{ color: 'var(--accent-berry)' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Orders Overview */}
      <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Recent Customer Orders</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Completed purchases and paid digital deliveries.
            </p>
          </div>
          <Link to="/admin/orders">
            <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight size={14} />}>
              View All Orders
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
            No orders placed yet. Orders will show here automatically after customer checkout.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-base)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Items</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Total</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Payment</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', fontWeight: 600 }}>
                      {order.id}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {order.items.length} book{order.items.length > 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                      ${order.total.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textTransform: 'capitalize' }}>
                      {order.paymentMethod.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <Badge variant="success">Paid</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Book Deletion */}
      <Modal
        isOpen={Boolean(bookToDelete)}
        onClose={() => setBookToDelete(null)}
        title="Confirm Deletion"
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-berry-light)',
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
            <h4 style={{ marginBottom: '0.375rem' }}>Are you sure you want to delete this book?</h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <strong>{bookToDelete?.title}</strong>
              {bookToDelete && bookToDelete.salesCount > 0 ? (
                <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--accent-olive)', fontWeight: 600 }}>
                  ℹ️ This book has {bookToDelete.salesCount} customer purchase(s). Deleting will safely unpublish it from the storefront while keeping customer library download access intact.
                </span>
              ) : (
                <span style={{ display: 'block', marginTop: '0.5rem' }}>
                  This will permanently delete the book document, cover image, and PDF files.
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setBookToDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={isDeleting}
            onClick={handleConfirmDelete}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
