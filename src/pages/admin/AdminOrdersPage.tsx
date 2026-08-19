import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ordersService } from '../../services/firebase/ordersService';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import type { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const list = await ordersService.getOrders();
        setOrders(list);
      } catch (err) {
        console.error('Error fetching admin orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'Recent';
    if (typeof dateVal === 'object' && 'seconds' in dateVal) {
      return new Date(dateVal.seconds * 1000).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link
            to="/admin"
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
            Complete history of verified payments and recipe deliveries.
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by order ID, name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={36} />}
            title="No orders found"
            description="No customer orders match your search criteria."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-base)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8125rem', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.875rem 0.5rem' }}>Order ID & Date</th>
                  <th style={{ padding: '0.875rem 0.5rem' }}>Customer</th>
                  <th style={{ padding: '0.875rem 0.5rem' }}>Ordered Cookbooks</th>
                  <th style={{ padding: '0.875rem 0.5rem' }}>Payment</th>
                  <th style={{ padding: '0.875rem 0.5rem' }}>Total Paid</th>
                  <th style={{ padding: '0.875rem 0.5rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    {/* Order ID & Date */}
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                        {order.id}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(order.createdAt)}
                      </div>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {order.customerName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {order.customerEmail}
                      </div>
                    </td>

                    {/* Ordered Cookbooks */}
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                            <FileText size={12} color="#D91B24" />
                            <span style={{ fontWeight: 600 }}>{item.title}</span>
                            <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td style={{ padding: '1rem 0.5rem', textTransform: 'capitalize' }}>
                      <Badge variant="neutral">{order.paymentMethod.replace('_', ' ')}</Badge>
                    </td>

                    {/* Total Paid */}
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 800, color: 'var(--primary-dark)', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>
                      ${order.total.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <Badge variant="success">
                        <CheckCircle2 size={12} style={{ marginRight: '2px' }} />
                        Paid
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
};
