'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 1rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Enter your account email to receive a password reset link.
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

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--accent-olive-light)',
                color: 'var(--accent-olive)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Reset Instructions Sent</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              If an account exists with <strong>{email}</strong>, we have dispatched instructions to reset your password.
            </p>
            <Link href="/login">
              <Button variant="primary" fullWidth>
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Account Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail size={18} />}
            />

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              Send Reset Link
            </Button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
