import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  BookOpen,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Library,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Explore Books', path: '/' },
    { label: 'My Library', path: '/library', authOnly: true },
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
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, #C22500 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-primary)',
            }}
          >
            <BookOpen size={24} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1.1 }}>
              RecipeBooks<span style={{ color: 'var(--primary)' }}>.</span>
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Digital Cookbook Market
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {navLinks.map((link) => {
            if (link.authOnly && !user) return null;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  position: 'relative',
                  padding: '0.375rem 0',
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary-border)',
              }}
            >
              <ShieldCheck size={16} />
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>

        {/* Right Side Actions: Cart + User Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {/* Cart Trigger */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-base)',
              backgroundColor: 'var(--bg-surface)',
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
                  fontWeight: 800,
                  width: '20px',
                  height: '20px',
                  borderRadius: 'var(--radius-pill)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(232, 89, 12, 0.4)',
                }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* User Profile or Login CTA */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(prev => !prev)}
                className="btn btn-secondary"
                style={{ padding: '0.4375rem 0.875rem', gap: '0.5rem' }}
                aria-expanded={userDropdownOpen}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 110,
                  }}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                  </div>

                  <Link
                    to="/library"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.625rem 0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                    className="btn-ghost"
                  >
                    <Library size={16} color="var(--primary)" />
                    <span>My Recipe Library</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0.625rem 0.75rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                      className="btn-ghost"
                    >
                      <ShieldCheck size={16} color="var(--primary)" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--accent-berry)',
                      borderRadius: 'var(--radius-sm)',
                      borderTop: '1px solid var(--border-light)',
                      marginTop: '0.25rem',
                    }}
                    className="btn-ghost"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register" className="hide-on-mobile">
                <Button variant="primary" size="sm">
                  Join Free
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="mobile-menu-btn"
            style={{
              padding: '0.5rem',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="surface-card animate-slide-up"
          style={{
            borderTop: '1px solid var(--border-base)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Explore Cookbooks
          </Link>
          {user && (
            <Link
              to="/library"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              My Library
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}
            >
              Admin Dashboard
            </Link>
          )}
          {!user && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" fullWidth size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" fullWidth size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
};
