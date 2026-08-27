'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingBag,
  BookOpen,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Library,
  ChevronDown,
  User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || '';

  // Close mobile drawer and user menu on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    router.push('/');
  };

  const navLinks = [
    { label: 'Explore Books', path: '/' },
    { label: 'My Library', path: '/library', authOnly: false },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 253, 249, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-base)',
      }}
    >
      <div
        className="container header-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 'var(--header-height)',
          gap: '0.5rem',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="header-brand"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', minWidth: 0 }}
        >
          <div className="header-brand-icon">
            <BookOpen className="header-brand-icon-svg" size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <span className="header-brand-name">
              RecipeBooks<span style={{ color: 'var(--primary)' }}>.</span>
            </span>
            <span className="header-tagline">Digital Cookbook Market</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  paddingBottom: '4px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls: Cart & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {/* Shopping Cart Button */}
          <Link
            href="/cart"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-base)',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast)',
            }}
            aria-label="View Shopping Cart"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  width: '20px',
                  height: '20px',
                  borderRadius: 'var(--radius-pill)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* User Profile / Auth State */}
          {user ? (
            <div style={{ position: 'relative' }} className="header-desktop-auth">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-base)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary-dark)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {userDropdownOpen && (
                <div
                  className="surface-card animate-pop-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    padding: '0.5rem',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 110,
                  }}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                  </div>

                  <div style={{ padding: '0.25rem 0' }}>
                    <Link
                      href="/library"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Library size={16} color="var(--primary)" />
                      <span>My Library</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.875rem',
                          color: '#C92A2A',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <ShieldCheck size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.25rem' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        color: 'var(--accent-berry)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'left',
                      }}
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="header-desktop-auth">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-base)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: 'var(--header-height)',
            backgroundColor: 'var(--bg-surface)',
            zIndex: 99,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            overflowY: 'auto',
          }}
          className="animate-slide-up"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: pathname === '/' ? 'var(--primary)' : 'var(--text-primary)',
                borderBottom: '1px solid var(--border-light)',
              }}
            >
              Explore Cookbooks
            </Link>
            <Link
              href="/library"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: pathname === '/library' ? 'var(--primary)' : 'var(--text-primary)',
                borderBottom: '1px solid var(--border-light)',
              }}
            >
              My Recipe Library
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: pathname === '/cart' ? 'var(--primary)' : 'var(--text-primary)',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Shopping Cart</span>
              {totalItems > 0 && <span className="badge badge-primary">{totalItems}</span>}
            </Link>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {user ? (
              <>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700 }}>{user.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>

                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" fullWidth leftIcon={<ShieldCheck size={18} />}>
                      Admin Dashboard
                    </Button>
                  </Link>
                )}

                <Button variant="danger" fullWidth leftIcon={<LogOut size={18} />} onClick={handleLogout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" fullWidth>
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  Admin Portal Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
