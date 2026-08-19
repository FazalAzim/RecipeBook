import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../common/Button';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullHeight message="Checking administrator privileges..." />;
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-berry-light)',
            color: 'var(--accent-berry)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ maxWidth: '460px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          This portal is reserved strictly for RecipeBooks Market administrators. Your current account ({user.email}) does not have administrative permissions.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/">
            <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>
              Back to Storefront
            </Button>
          </Link>
          <Link to="/admin/login">
            <Button variant="primary">
              Log in as Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
