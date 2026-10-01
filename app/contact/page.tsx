'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Clock } from 'lucide-react';
import { SiteContentPage } from '@/components/layout/SiteContentPage';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useToast } from '@/contexts/ToastContext';

const SUPPORT_EMAIL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPPORT_EMAIL) ||
  'hello@recipebooksmarket.com';

export default function ContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order / download help');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      '',
      message.trim(),
    ].join('\n');

    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      `[RecipeBooks] ${subject}`
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    showToast('Opening your email app to send the message…', 'info');
  };

  return (
    <SiteContentPage
      title="Contact us"
      subtitle="We are happy to help with orders, downloads, Lifetime All-Access, or general questions about RecipeBooks Market."
    >
      <h2>How to reach us</h2>
      <p>
        Email is the best way to get support. Include your checkout email and order reference if your
        question is about a purchase or missing download.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(243, 237, 228, 0.06)',
            border: '1px solid rgba(243, 237, 228, 0.1)',
          }}
        >
          <Mail size={18} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>Email</div>
          <a href={`mailto:${SUPPORT_EMAIL}`} style={{ fontSize: '0.875rem', wordBreak: 'break-all' }}>
            {SUPPORT_EMAIL}
          </a>
        </div>
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(243, 237, 228, 0.06)',
            border: '1px solid rgba(243, 237, 228, 0.1)',
          }}
        >
          <Clock size={18} color="var(--accent-olive)" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>Response time</div>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>We aim to reply within 1–2 business days.</p>
        </div>
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(243, 237, 228, 0.06)',
            border: '1px solid rgba(243, 237, 228, 0.1)',
          }}
        >
          <MessageSquare size={18} color="var(--secondary)" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>Topics we help with</div>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Downloads, library access, billing questions, catalog feedback.</p>
        </div>
      </div>

      <h2>Send a message</h2>
      <p>
        Fill in the form below. It opens your email app with the details filled in so you can send us a
        note directly.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '520px' }}>
        <Input
          label="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Full name"
        />
        <Input
          label="Your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
        <div>
          <label className="form-label" style={{ display: 'block', marginBottom: '0.375rem' }}>
            Subject
          </label>
          <select
            className="form-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%' }}
          >
            <option>Order / download help</option>
            <option>Lifetime All-Access</option>
            <option>Account access</option>
            <option>Cookbook feedback</option>
            <option>Privacy or data request</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="form-label" style={{ display: 'block', marginBottom: '0.375rem' }}>
            Message
          </label>
          <textarea
            className="form-input"
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your question. Include your checkout email if this is about an order."
            style={{ width: '100%', resize: 'vertical', minHeight: '140px' }}
          />
        </div>
        <Button type="submit" variant="primary" style={{ alignSelf: 'flex-start' }}>
          Open email to send
        </Button>
      </form>

      <h2>Before you write</h2>
      <ul>
        <li>
          Check <Link href="/library">My Library</Link> while signed in with the same email used at
          checkout.
        </li>
        <li>
          Read <Link href="/about">About</Link> for how purchases and downloads work.
        </li>
        <li>
          Review <Link href="/privacy">Privacy</Link> and <Link href="/terms">Terms</Link> for data and
          license details.
        </li>
      </ul>
    </SiteContentPage>
  );
}
