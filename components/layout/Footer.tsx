import React from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, Download, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="site-footer"
      style={{
        backgroundColor: 'rgba(16, 12, 10, 0.55)',
        backdropFilter: 'blur(18px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.1)',
        color: '#FAF7F2',
        paddingTop: '2.5rem',
        paddingBottom: '2rem',
        marginTop: '3rem',
        borderTop: '1px solid rgba(243, 237, 228, 0.1)',
      }}
    >
      <div className="container">
        {/* Value Proposition Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
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
              <li><Link href="/?category=Italian%20%26%20European" style={{ color: '#A8A29E' }}>Italian & European</Link></li>
              <li><Link href="/?category=Mediterranean%20%26%20Healthy" style={{ color: '#A8A29E' }}>Mediterranean & Healthy</Link></li>
              <li><Link href="/?category=Desserts%20%26%20Baking" style={{ color: '#A8A29E' }}>Desserts & Patisserie</Link></li>
              <li><Link href="/?category=British%20%26%20American%20Classics" style={{ color: '#A8A29E' }}>British & American Classics</Link></li>
              <li><Link href="/?category=Quick%20%26%20Family%20Meals" style={{ color: '#A8A29E' }}>Quick Family Meals</Link></li>
              <li><Link href="/?category=International%20%2F%20Western" style={{ color: '#A8A29E' }}>International / Western</Link></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '0.9375rem' }}>Quick Navigation</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link href="/" style={{ color: '#A8A29E' }}>Browse All Recipe Books</Link></li>
              <li><Link href="/library" style={{ color: '#A8A29E' }}>My Download Library</Link></li>
              <li><Link href="/cart" style={{ color: '#A8A29E' }}>Shopping Cart</Link></li>
              <li><Link href="/login" style={{ color: '#A8A29E' }}>Customer Login</Link></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '0.9375rem' }}>Company &amp; Legal</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link href="/about" style={{ color: '#A8A29E' }}>About Us</Link></li>
              <li><Link href="/contact" style={{ color: '#A8A29E' }}>Contact</Link></li>
              <li><Link href="/privacy" style={{ color: '#A8A29E' }}>Privacy Policy</Link></li>
              <li><Link href="/terms" style={{ color: '#A8A29E' }}>Terms of Service</Link></li>
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

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
            <Link href="/privacy" style={{ color: '#78716C' }}>Privacy</Link>
            <span>•</span>
            <Link href="/terms" style={{ color: '#78716C' }}>Terms</Link>
            <span>•</span>
            <Link href="/contact" style={{ color: '#78716C' }}>Contact</Link>
            <span>•</span>
            <span>Instant Digital Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
