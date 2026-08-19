import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, LogIn, Lock, Mail, Sparkles, Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const profile = await login(email, password);
      if (profile.role !== 'admin') {
        throw new Error('Access denied: This account does not have administrator privileges.');
      }
      showToast('Admin authenticated successfully!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@recipebooks.com');
    setPassword('admin123');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1917', padding: '2rem 1.25rem' }}>
      <div
        className="surface-card animate-pop-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          backgroundColor: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-primary)',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>Admin Portal Login</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Authorized management access for RecipeBooks Market.
          </p>
        </div>

        {/* Demo Admin Auto Fill */}
        <div
          onClick={handleDemoFill}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.625rem 0.875rem',
            backgroundColor: 'var(--primary-light)',
            border: '1px dashed var(--primary-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
            <Sparkles size={16} />
            <span>Click to autofill Demo Admin</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline' }}>Auto-Fill</span>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FFF5F5',
              border: '1px solid #FFC9C9',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: 'var(--accent-berry)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Admin Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@recipebooks.com"
            leftIcon={<Mail size={18} />}
          />

          <Input
            label="Admin Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            leftIcon={<LogIn size={18} />}
          >
            Sign In as Admin
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            <Store size={16} />
            <span>Return to Customer Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
