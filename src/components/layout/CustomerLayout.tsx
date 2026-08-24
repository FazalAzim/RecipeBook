import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { StickyMobileCart } from '../cart/StickyMobileCart';
import { useCart } from '../../contexts/CartContext';
import { useLocation } from 'react-router-dom';

export const CustomerLayout: React.FC = () => {
  const { totalItems } = useCart();
  const location = useLocation();
  const isExcludedPage = ['/cart', '/checkout', '/payment'].some((path) =>
    location.pathname.startsWith(path)
  );
  const showStickyCart = totalItems > 0 && !isExcludedPage;

  return (
    <div className={`app-container${showStickyCart ? ' has-sticky-cart' : ''}`}>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <StickyMobileCart />
      <Footer />
    </div>
  );
};
