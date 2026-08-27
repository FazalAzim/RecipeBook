'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, LogIn, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      showToast('Logged in successfully! Welcome back.', 'success');
      router.push(from);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
        padding: '1.75rem',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, #C22500 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: 'var(--shadow-primary)',
          }}
        >
          <BookOpen size={28} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Sign in to access your purchased recipe books and library.
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
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          leftIcon={<Mail size={18} />}
        />

        <div>
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
          />
          <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
            <Link href="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          leftIcon={<LogIn size={18} />}
        >
          Log In
        </Button>
      </form>

      <div
        style={{
          textAlign: 'center',
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-light)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}
      >
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
          Register for free
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link
          href="/admin/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}
        >
          <ShieldCheck size={14} />
          Admin Login
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      style={{
        padding: '1.5rem 1rem',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className="auth-page"
    >
      <Suspense fallback={<LoadingSpinner fullHeight message="Loading sign in..." />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
