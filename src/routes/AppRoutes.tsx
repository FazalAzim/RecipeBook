import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

// Route Guards
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminRoute } from '../components/auth/AdminRoute';
import { GuestRoute } from '../components/auth/GuestRoute';

// Customer Pages
import { HomePage } from '../pages/customer/HomePage';
import { BookDetailPage } from '../pages/customer/BookDetailPage';
import { CartPage } from '../pages/customer/CartPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { PaymentPage } from '../pages/customer/PaymentPage';
import { OrderConfirmationPage } from '../pages/customer/OrderConfirmationPage';
import { LibraryPage } from '../pages/customer/LibraryPage';
import { LoginPage } from '../pages/customer/LoginPage';
import { RegisterPage } from '../pages/customer/RegisterPage';
import { ForgotPasswordPage } from '../pages/customer/ForgotPasswordPage';

// Admin Pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminNewBookPage } from '../pages/admin/AdminNewBookPage';
import { AdminEditBookPage } from '../pages/admin/AdminEditBookPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';

// General
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books/:bookId" element={<BookDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        
        {/* Protected Customer Library */}
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          }
        />

        {/* Guest Auth Pages with Customer Layout */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Login Route (Separate Utilitarian Layout) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="books/new" element={<AdminNewBookPage />} />
        <Route path="books/:bookId/edit" element={<AdminEditBookPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
      </Route>
    </Routes>
  );
};
