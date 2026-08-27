'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import type { Order } from '@/lib/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching admin orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'Recent';
    return new Date(dateVal).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading customer transaction records..." />;
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <Link
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Customer Orders & Sales</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Complete history of verified payments and digital recipe book deliveries.
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search order ID or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={32} />}
            title="No orders found"
            description={
              searchQuery
                ? `No orders matching "${searchQuery}".`
                : 'Customer transactions and sales will appear here in real-time as they complete checkout.'
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-base)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.875rem 0.75rem', fontWeight: 700 }}>Order ID</th>
                  <th style={{ padding: '0.875rem 0.75rem', fontWeight: 700 }}>Date & Time</th>
                  <th style={{ padding: '0.875rem 0.75rem', fontWeight: 700 }}>Customer Info</th>
                  <th style={{ padding: '0.875rem 0.75rem', fontWeight: 700 }}>Purchased Cookbooks</th>
                  <th style={{ padding: '0.875rem 0.75rem', fontWeight: 700 }}>Total Paid</th>
                  <th style={{ padding: '0.875rem 0.75rem', fontWeight: 700 }}>Payment Method</th>
                  <th style={{ padding: '0.875rem 0.75rem', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.875rem 0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {order.id}
                    </td>

                    <td style={{ padding: '0.875rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {formatDate(order.createdAt)}
                    </td>

                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                    </td>

                    <td style={{ padding: '0.875rem 0.75rem', maxWidth: '300px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            • <strong>{item.title}</strong> (x{item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: '0.875rem 0.75rem', fontWeight: 800, color: 'var(--primary-dark)', fontSize: '0.9375rem' }}>
                      ${order.total.toFixed(2)}
                    </td>

                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      <Badge variant="neutral">{order.paymentMethod}</Badge>
                    </td>

                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'amber'}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
