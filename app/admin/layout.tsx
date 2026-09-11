'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Store,
  LogOut,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading, isAdmin } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/admin/login' || loading) return;
    if (!user || !isAdmin) {
      router.replace('/admin/login?error=access_denied');
    }
  }, [pathname, loading, user, isAdmin, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading || !user || !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--background)' }}>
        <p style={{ color: 'var(--muted)' }}>Checking admin access…</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    showToast('Signed out of admin dashboard', 'info');
    router.push('/admin/login');
  };

  const handleSeedDatabase = async () => {
    try {
      showToast('Initializing database...', 'info');
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Initialization failed');
      showToast('Legacy demo books removed.', 'success');
      window.location.reload();
    } catch (e: any) {
      showToast(e.message || 'Cleanup failed', 'error');
    }
  };

  const navItems = [
    { label: 'Inventory & Stats', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Add New Book', path: '/admin/books/new', icon: <PlusCircle size={18} /> },
    { label: 'Orders & Sales', path: '/admin/orders', icon: <ShoppingBag size={18} /> },
  ];

  const sidebarContent = (
    <>
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #2E2825' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
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

        {navItems.map((item) => {
          const isActive = item.path === '/admin' ? pathname === '/admin' : pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6875rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? '#FFFFFF' : '#A8A29E',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#78716C', padding: '1.25rem 0.75rem 0.5rem', textTransform: 'uppercase' }}>
          Shortcuts
        </div>

        <Link
          href="/"
          target="_blank"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6875rem 0.875rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            color: '#A8A29E',
            textDecoration: 'none',
          }}
        >
          <Store size={18} />
          <span>View Live Storefront</span>
        </Link>

        <button
          onClick={handleSeedDatabase}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6875rem 0.875rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            color: '#F59F00',
            textAlign: 'left',
            cursor: 'pointer',
            backgroundColor: 'rgba(245, 159, 0, 0.08)',
            marginTop: '0.5rem',
          }}
        >
          <Sparkles size={18} />
          <span>Clean Legacy Demo Books</span>
        </button>
      </nav>

      {/* Admin User Footer */}
      <div style={{ padding: '1rem', borderTop: '1px solid #2E2825', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--primary-dark)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem',
              flexShrink: 0,
            }}
          >
            A
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#78716C' }}>Administrator</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{ color: '#A8A29E', padding: '0.375rem', display: 'flex', alignItems: 'center' }}
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }} className="admin-portal-wrapper">
      {/* Desktop Left Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#1C1917',
          color: '#FAF7F2',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 90,
        }}
        className="admin-desktop-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
          }}
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            style={{
              width: '280px',
              backgroundColor: '#1C1917',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
            className="animate-slide-up"
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Right Column: Top Bar + Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '60px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-light)',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 80,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMobileNavOpen(true)}
              className="admin-mobile-toggle"
              style={{
                padding: '0.375rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Open Admin Menu"
            >
              <Menu size={20} />
            </button>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Catalog & Sales Management
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              href="/"
              target="_blank"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--primary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <Store size={14} /> Storefront Preview
            </Link>
          </div>
        </header>

        {/* Dynamic Admin View */}
        <main style={{ padding: '2rem 1.5rem', flex: 1 }}>
          <div className="container-wide" style={{ padding: 0 }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-desktop-sidebar {
            display: none !important;
          }
          .admin-mobile-toggle {
            display: flex !important;
          }
        }
        @media (min-width: 901px) {
          .admin-mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
