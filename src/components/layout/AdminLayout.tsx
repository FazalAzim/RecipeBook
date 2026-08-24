import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Store,
  LogOut,
  ShieldCheck,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { seedService } from '../../services/firebase/seedService';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

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

  const sidebarContent = (
    <>
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #2E2825' }}>
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              flexShrink: 0,
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

      <nav style={{ padding: '1.25rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1, overflowY: 'auto' }}>
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
              padding: '0.75rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? '#FFFFFF' : '#A8A29E',
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              transition: 'all var(--transition-fast)',
              textDecoration: 'none',
              minHeight: '44px',
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
            padding: '0.75rem 0.875rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#F59F00',
            backgroundColor: 'rgba(245, 159, 0, 0.1)',
            border: '1px dashed rgba(245, 159, 0, 0.3)',
            textAlign: 'left',
            width: '100%',
            minHeight: '44px',
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
            padding: '0.75rem 0.875rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#A8A29E',
            textDecoration: 'none',
            minHeight: '44px',
          }}
        >
          <Store size={18} />
          <span>View Storefront</span>
        </Link>
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid #2E2825', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.name || 'Administrator'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#78716C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            flexShrink: 0,
          }}
          title="Sign out of Admin"
        >
          <LogOut size={18} />
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F5F0' }}>
      {/* Desktop Sidebar */}
      <aside
        className="admin-sidebar-desktop"
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
          flexShrink: 0,
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <>
          <div
            onClick={() => setMobileNavOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(28, 25, 23, 0.45)',
              zIndex: 80,
            }}
            className="admin-drawer-overlay"
          />
          <aside
            className="admin-drawer"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 'min(280px, 86vw)',
              backgroundColor: '#1C1917',
              color: '#FAF7F2',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 90,
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <button
              onClick={() => setMobileNavOpen(false)}
              style={{
                position: 'absolute',
                top: '0.875rem',
                right: '0.875rem',
                color: '#A8A29E',
                padding: '0.375rem',
                zIndex: 1,
              }}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main Admin Content Body */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          className="admin-topbar"
          style={{
            minHeight: '56px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 1rem',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <button
              className="admin-menu-btn"
              onClick={() => setMobileNavOpen(true)}
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-base)',
                color: 'var(--text-primary)',
                flexShrink: 0,
              }}
              aria-label="Open admin menu"
            >
              <Menu size={20} />
            </button>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              RecipeBooks Management
            </span>
          </div>

          <Link to="/" target="_blank" className="btn btn-secondary btn-sm" style={{ gap: '0.375rem', flexShrink: 0 }}>
            <Store size={14} />
            <span className="admin-live-label">Live Store</span>
          </Link>
        </header>

        <div className="admin-page-body" style={{ padding: '1.25rem', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar-desktop {
            display: none !important;
          }
          .admin-menu-btn {
            display: flex !important;
          }
        }
        @media (min-width: 901px) {
          .admin-drawer,
          .admin-drawer-overlay {
            display: none !important;
          }
          .admin-topbar {
            padding: 0 2rem !important;
            min-height: 64px !important;
          }
          .admin-page-body {
            padding: 2rem !important;
          }
        }
        @media (max-width: 480px) {
          .admin-live-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
