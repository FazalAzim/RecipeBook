import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Download, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#1C1917',
        color: '#FAF7F2',
        paddingTop: '4rem',
        paddingBottom: '2.5rem',
        marginTop: '5rem',
        borderTop: '1px solid #292524',
      }}
    >
      <div className="container">
        {/* Value Proposition Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '3rem',
            marginBottom: '3rem',
            borderBottom: '1px solid #2E2825',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(232, 89, 12, 0.15)',
                color: '#FF922B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Download size={22} />
            </div>
            <div>
              <h5 style={{ color: '#FFFFFF', marginBottom: '0.25rem' }}>Instant PDF Access</h5>
              <p style={{ color: '#A8A29E', fontSize: '0.875rem' }}>
                Download purchased high-res cookbooks directly to your tablet, phone, or laptop forever.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(43, 138, 62, 0.15)',
                color: '#51CF66',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h5 style={{ color: '#FFFFFF', marginBottom: '0.25rem' }}>Chef-Tested Recipes</h5>
              <p style={{ color: '#A8A29E', fontSize: '0.875rem' }}>
                Every single cookbook contains culinary-approved measurements, photos, and secrets.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(217, 119, 6, 0.15)',
                color: '#FCC419',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h5 style={{ color: '#FFFFFF', marginBottom: '0.25rem' }}>Secure Checkout</h5>
              <p style={{ color: '#A8A29E', fontSize: '0.875rem' }}>
                Encrypted transactions and reliable personal recipe library storage.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
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
                <BookOpen size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                RecipeBooks<span style={{ color: 'var(--primary)' }}>.</span>
              </span>
            </div>
            <p style={{ color: '#A8A29E', fontSize: '0.875rem', lineHeight: 1.6 }}>
              The curated digital cookbook marketplace. Bring Michelin-level and authentic home-style flavors to your personal kitchen.
            </p>
          </div>

          <div>
            <h5 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '0.9375rem' }}>Culinary Categories</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/" style={{ color: '#A8A29E' }}>Pakistani & South Asian</Link></li>
              <li><Link to="/" style={{ color: '#A8A29E' }}>Italian Homemade Pasta</Link></li>
              <li><Link to="/" style={{ color: '#A8A29E' }}>Mediterranean Diet</Link></li>
              <li><Link to="/" style={{ color: '#A8A29E' }}>Asian Wok & Street Food</Link></li>
              <li><Link to="/" style={{ color: '#A8A29E' }}>Desserts & Patisserie</Link></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '0.9375rem' }}>Quick Navigation</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/" style={{ color: '#A8A29E' }}>Browse All Recipe Books</Link></li>
              <li><Link to="/library" style={{ color: '#A8A29E' }}>My Download Library</Link></li>
              <li><Link to="/cart" style={{ color: '#A8A29E' }}>Shopping Cart</Link></li>
              <li><Link to="/login" style={{ color: '#A8A29E' }}>Customer Login</Link></li>
              <li><Link to="/admin/login" style={{ color: '#A8A29E' }}>Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingTop: '2rem',
            borderTop: '1px solid #2E2825',
            fontSize: '0.8125rem',
            color: '#78716C',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>© {new Date().getFullYear()} RecipeBooks Market. Built with</span>
            <Heart size={14} color="#E8590C" fill="#E8590C" />
            <span>for food lovers everywhere.</span>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Link to="/admin/login" style={{ color: '#78716C' }}>Administrator</Link>
            <span>•</span>
            <span>PDF Format E-Books</span>
            <span>•</span>
            <span>Instant Digital Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
