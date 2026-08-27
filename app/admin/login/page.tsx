'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, LogIn, Lock, Mail, Store } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

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
      router.push(from);
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          label="Security Password"
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
          style={{ marginTop: '0.5rem' }}
        >
          Authenticate Admin
        </Button>
      </form>

      <div
        style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}
        >
          <Store size={14} /> Return to Public Storefront
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1C1917',
        padding: '2rem 1.25rem',
      }}
    >
      <Suspense fallback={<LoadingSpinner fullHeight message="Loading admin authentication..." />}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
