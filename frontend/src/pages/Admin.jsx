import React, { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus } from '../api';
import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import { formatApiError } from '../utils/apiError';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const data = await getAdminOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders');
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleOrderUpdate = (updatedOrder) => {
      setOrders(prev => {
        const exists = prev.find(o => o._id === updatedOrder._id);
        if (exists) {
          return prev.map(o => o._id === updatedOrder._id ? { ...o, status: updatedOrder.status } : o);
        } else {
          return [updatedOrder, ...prev];
        }
      });
    };

    socket.on('orderCreated', handleOrderUpdate);
    socket.on('orderUpdated', handleOrderUpdate);

    return () => {
      socket.off('orderCreated', handleOrderUpdate);
      socket.off('orderUpdated', handleOrderUpdate);
    };
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
    } catch (err) {
      alert(formatApiError(err));
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;
  const pendingDeliveries = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="admin-body">
      {/* Sidebar */}
      <aside className="admin-sidebar">
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <img src="/images/logo.png" alt="" width="28" height="28" style={{ width: 28, height: 28, objectFit: 'contain' }} />
              Crystal<span>Drops</span>
          </div>
          
          <nav className="nav-menu">
              <a href="#" className="nav-item active">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                  Dashboard
              </a>
              <a href="#" className="nav-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  Orders
              </a>
              <a href="#" className="nav-item" onClick={() => navigate('/')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  Go to Store
              </a>
          </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
          <header className="admin-header">
              <div className="search-bar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" placeholder="Search orders, customers..." />
              </div>
              
              <div className="header-actions">
                  <div className="profile">
                      <div className="avatar">AD</div>
                      <div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Admin User</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Super Admin</div>
                      </div>
                  </div>
              </div>
          </header>

          <div className="content-area">
              <div className="page-header">
                  <h1 className="page-title">Overview</h1>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                  <div className="stat-card">
                      <div className="stat-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                      </div>
                      <div className="stat-value">KES {totalRevenue.toLocaleString()}</div>
                      <div className="stat-label">Total Revenue</div>
                  </div>
                  
                  <div className="stat-card">
                      <div className="stat-icon purple">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                      </div>
                      <div className="stat-value">{totalOrders}</div>
                      <div className="stat-label">Total Orders</div>
                  </div>
                  
                  <div className="stat-card">
                      <div className="stat-icon orange">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <div className="stat-value">{pendingDeliveries}</div>
                      <div className="stat-label">Pending Deliveries</div>
                  </div>
              </div>

              {/* Recent Orders Table */}
              <div className="table-container">
                  <div className="table-header">
                      <h2 className="table-title">Recent Orders</h2>
                      <div style={{ display: 'flex', alignItems: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>
                          <span className="realtime-pulse" style={{ marginRight: '8px' }}></span> Live System Active
                      </div>
                  </div>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer Phone</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                              <tr key={order._id}>
                                  <td style={{ fontWeight: 500, color: '#94A3B8' }}>{order._id.substring(18)}</td>
                                  <td>{order.phone}</td>
                                  <td style={{ fontWeight: 600 }}>KES {order.total}</td>
                                  <td><span className={`status ${order.status}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                                  <td>
                                    <select 
                                      value={order.status} 
                                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                      style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="processing">Processing</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </td>
                              </tr>
                            ))}
                            {orders.length === 0 && (
                              <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94A3B8' }}>No orders found.</td></tr>
                            )}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      </main>
    </div>
  );
}
