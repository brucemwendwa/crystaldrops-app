import React, { useState, useEffect } from 'react';
import { getOrders } from '../api';
import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Trash2 } from 'lucide-react';

const ADDR_KEY = 'savedAddresses';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ADDR_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [newAddr, setNewAddr] = useState('');
  const navigate = useNavigate();

  const persistAddresses = (next) => {
    setAddresses(next);
    localStorage.setItem(ADDR_KEY, JSON.stringify(next));
  };

  const addAddress = (e) => {
    e.preventDefault();
    const v = newAddr.trim();
    if (!v) return;
    if (addresses.includes(v)) {
      setNewAddr('');
      return;
    }
    persistAddresses([...addresses, v]);
    setNewAddr('');
  };

  const removeAddress = (addr) => {
    persistAddresses(addresses.filter((a) => a !== addr));
  };

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders');
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleOrderUpdate = (updatedOrder) => {
      setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
    };

    socket.on('orderUpdated', handleOrderUpdate);
    socket.on('orderCreated', handleOrderUpdate);

    return () => {
      socket.off('orderUpdated', handleOrderUpdate);
      socket.off('orderCreated', handleOrderUpdate);
    };
  }, []);

  return (
    <div className="container" style={{ marginTop: 24, maxWidth: 1000 }}>
      <div className="dashboard-header">
        <h1 style={{ fontSize: '2rem', color: 'var(--text-color)' }}>My account</h1>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          <span className="realtime-pulse" aria-hidden />
          Live order updates
        </div>
      </div>

      <div style={{ display: 'grid', gap: 28 }}>
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
          <h2 style={{ marginBottom: 16, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={22} color="var(--primary)" aria-hidden />
            Saved addresses
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.95rem' }}>
            Reuse these at checkout (copy into the delivery field for now).
          </p>

          <form onSubmit={addAddress} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <input
              type="text"
              value={newAddr}
              onChange={(e) => setNewAddr(e.target.value)}
              placeholder="e.g. Kilimani, Nairobi"
              style={{
                flex: '1 1 220px',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1px solid var(--glass-border)',
                fontSize: '1rem'
              }}
            />
            <button type="submit" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Plus size={18} aria-hidden /> Add
            </button>
          </form>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {addresses.map((addr) => (
              <li
                key={addr}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 12,
                  border: '1px solid var(--glass-border)',
                  gap: 12
                }}
              >
                <span style={{ color: 'var(--text-color)' }}>{addr}</span>
                <button
                  type="button"
                  onClick={() => removeAddress(addr)}
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 8 }}
                  aria-label={`Remove ${addr}`}
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
            {addresses.length === 0 && (
              <li style={{ color: 'var(--text-muted)' }}>No saved addresses yet.</li>
            )}
          </ul>
        </div>

        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
          <h2 style={{ marginBottom: 20, fontSize: '1.25rem' }}>Order history</h2>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{order._id.slice(-8)}</td>
                    <td>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ fontSize: '0.9rem' }}>{item.quantity}× {item.name}</div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 700 }}>KES {order.total}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 40 }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>You have not placed any orders yet.</p>
                      <button type="button" onClick={() => navigate('/shop')} className="btn">Start shopping</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
