'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, UserPlus, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password, 'customer');
      showToast('Account created successfully! Welcome to RecipeBooks Market.', 'success');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: '1.5rem 1rem',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="surface-card animate-pop-in"
        style={{
          width: '100%',
          maxWidth: '480px',
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
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>Create Free Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Store and download your purchased digital recipe books forever.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--accent-berry-light)',
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
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Amina Zahir"
            leftIcon={<User size={18} />}
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            leftIcon={<Mail size={18} />}
          />

          <Input
            label="Password (min. 6 characters)"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
          />

          <Input
            label="Confirm Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            leftIcon={<UserPlus size={18} />}
          >
            Create Account
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
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
