import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { StickyMobileCart } from '../cart/StickyMobileCart';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <StickyMobileCart />
      <Footer />
    </div>
  );
};
