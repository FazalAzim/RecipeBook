import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Store,
  LogOut,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { seedService } from '../../services/firebase/seedService';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Signed out of admin dashboard', 'info');
    navigate('/admin/login');
  };

  const handleSeedDatabase = async () => {
    try {
      showToast('Seeding gourmet recipe books...', 'info');
      const res = await seedService.seedDatabase();
      showToast(`Successfully seeded ${res.count} recipe books!`, 'success');
      window.location.reload();
    } catch (e: any) {
      showToast(e.message || 'Seeding failed', 'error');
    }
  };

  const navItems = [
    { label: 'Inventory & Stats', path: '/admin', icon: <LayoutDashboard size={18} />, end: true },
    { label: 'Add New Book', path: '/admin/books/new', icon: <PlusCircle size={18} />, end: false },
    { label: 'Orders & Sales', path: '/admin/orders', icon: <ShoppingBag size={18} />, end: false },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F5F0' }}>
      {/* Admin Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#1C1917',
          color: '#FAF7F2',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #292524',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
        }}
        className="admin-sidebar"
      >
        {/* Admin Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #2E2825' }}>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', color: '#FFFFFF' }}>
                Admin Portal
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                RecipeBooks Market
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1.25rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#78716C', padding: '0.5rem 0.75rem', textTransform: 'uppercase' }}>
            Management
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? '#FFFFFF' : '#A8A29E',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
              })}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#78716C', padding: '1rem 0.75rem 0.5rem', textTransform: 'uppercase' }}>
            Quick Actions
          </div>

          <button
            onClick={handleSeedDatabase}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#F59F00',
              backgroundColor: 'rgba(245, 159, 0, 0.1)',
              border: '1px dashed rgba(245, 159, 0, 0.3)',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <Sparkles size={16} />
            <span>Seed Sample Books</span>
          </button>

          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#A8A29E',
              textDecoration: 'none',
            }}
          >
            <Store size={18} />
            <span>View Storefront</span>
          </Link>
        </nav>

        {/* Admin Footer & Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid #2E2825', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#78716C' }}>
              {user?.email || 'admin@recipebooks.com'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              color: '#F03E3E',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
            }}
            title="Sign out of Admin"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              RecipeBooks Management System
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" target="_blank" className="btn btn-secondary btn-sm" style={{ gap: '0.375rem' }}>
              <Store size={14} />
              <span>Live Store</span>
            </Link>
          </div>
        </header>

        {/* Admin Page Content */}
        <div style={{ padding: '2rem', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar {
            width: 72px !important;
          }
          .admin-sidebar span, .admin-sidebar .admin-logo-text {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
