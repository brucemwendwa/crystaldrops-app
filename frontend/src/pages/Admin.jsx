import React, { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus } from '../api';
import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Factory, Truck, Store, Users, DollarSign, LogOut } from 'lucide-react';
import './Admin.css';
import { formatApiError } from '../utils/apiError';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'production', label: 'Factory Production', icon: Factory },
    { id: 'dispatch', label: 'Logistics & Dispatch', icon: Truck },
    { id: 'depots', label: 'Depot Management', icon: Store },
    { id: 'employees', label: 'HR & Attendance', icon: Users },
    { id: 'payroll', label: 'Payroll & Bonuses', icon: DollarSign }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <div className="admin-body">
      {/* Sidebar */}
      <aside className="admin-sidebar">
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <img src="/images/logo.png" alt="" width="32" height="32" style={{ width: 32, height: 32, objectFit: 'contain' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>CrystalDrops <span style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 'normal' }}>ERP</span></span>
              </div>
          </div>
          
          <nav className="nav-menu">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                >
                    <item.icon size={22} />
                    {item.label}
                </button>
              ))}
              <button
                onClick={() => navigate('/')}
                className="nav-item"
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', marginTop: 'auto' }}
              >
                  <ShoppingCart size={22} />
                  Go to Store
              </button>
              <button
                onClick={handleLogout}
                className="nav-item"
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#ef4444' }}
              >
                  <LogOut size={22} />
                  Logout
              </button>
          </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
          <header className="admin-header">
              <div className="search-bar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" placeholder="Search operations, orders, staff..." />
              </div>
              
              <div className="header-actions">
                  <div className="profile">
                      <div className="avatar">AD</div>
                      <div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>System Admin</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Management</div>
                      </div>
                  </div>
              </div>
          </header>

          <div className="content-area">
              {activeTab === 'dashboard' && <DashboardTab orders={orders} handleStatusUpdate={handleStatusUpdate} />}
              {activeTab === 'production' && <ProductionTab />}
              {activeTab === 'dispatch' && <DispatchTab />}
              {activeTab === 'depots' && <DepotsTab />}
              {activeTab === 'employees' && <EmployeesTab />}
              {activeTab === 'payroll' && <PayrollTab />}
          </div>
      </main>
    </div>
  );
}

function DashboardTab({ orders, handleStatusUpdate }) {
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;
  const pendingDeliveries = orders.filter(o => o.status === 'pending').length;

  return (
    <>
      <div className="page-header">
          <h1 className="page-title">Executive Dashboard</h1>
      </div>
      <div className="stats-grid">
          <div className="stat-card">
              <div className="stat-icon">
                  <DollarSign size={24} />
              </div>
              <div className="stat-value">KES {totalRevenue.toLocaleString()}</div>
              <div className="stat-label">E-Commerce Revenue</div>
          </div>
          <div className="stat-card">
              <div className="stat-icon purple">
                  <ShoppingCart size={24} />
              </div>
              <div className="stat-value">{totalOrders}</div>
              <div className="stat-label">Total Online Orders</div>
          </div>
          <div className="stat-card">
              <div className="stat-icon orange">
                  <Truck size={24} />
              </div>
              <div className="stat-value">{pendingDeliveries}</div>
              <div className="stat-label">Pending Deliveries</div>
          </div>
      </div>
      <div className="table-container">
          <div className="table-header">
              <h2 className="table-title">Recent Online Orders</h2>
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
    </>
  );
}

function ProductionTab() {
  return (
    <>
      <div className="page-header"><h1 className="page-title">Factory Production</h1></div>
      <div className="table-container">
        <h2 className="table-title" style={{ marginBottom: 20 }}>Log Daily Production</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {['0.5L', '1L', '1.5L', '5L', '10L', '20L'].map(size => (
            <div key={size} style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <label style={{ display: 'block', color: '#94A3B8', marginBottom: 8 }}>{size} (Parcels/Bottles)</label>
              <input type="number" placeholder="0" style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ marginTop: 24, width: '200px', justifyContent: 'center' }}>Submit Production Log</button>
      </div>
    </>
  );
}

function DispatchTab() {
  return (
    <>
      <div className="page-header"><h1 className="page-title">Logistics & Dispatch</h1></div>
      <div className="table-container">
        <h2 className="table-title" style={{ marginBottom: 20 }}>Dispatch to Lorry</h2>
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#94A3B8', display: 'block', marginBottom: 8 }}>Select Driver</label>
          <select style={{ width: '100%', maxWidth: 300, padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
            <option>John Doe (Lorry KCE 123X)</option>
            <option>Peter Kamau (Lorry KBC 456Y)</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {['0.5L', '1L', '1.5L', '5L', '10L', '20L'].map(size => (
            <div key={size} style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <label style={{ display: 'block', color: '#94A3B8', marginBottom: 8 }}>{size} Loaded</label>
              <input type="number" placeholder="0" style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ marginTop: 24, width: '200px', justifyContent: 'center' }}>Record Dispatch</button>
      </div>
    </>
  );
}

function DepotsTab() {
  return (
    <>
      <div className="page-header"><h1 className="page-title">Depot Management</h1></div>
      <div className="table-container">
        <h2 className="table-title" style={{ marginBottom: 20 }}>Westlands Depot Stock</h2>
        <table>
          <thead>
            <tr><th>Size</th><th>Received</th><th>Sold</th><th>Remaining Stock</th></tr>
          </thead>
          <tbody>
            {['0.5L', '1L', '1.5L', '5L', '10L', '20L'].map(size => (
              <tr key={size}>
                <td>{size}</td>
                <td style={{ color: '#10B981' }}>100</td>
                <td style={{ color: '#F59E0B' }}>60</td>
                <td style={{ fontWeight: 'bold' }}>40</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
          <h2 className="table-title" style={{ marginBottom: 20 }}>Log Depot Sale</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
             <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ color: '#94A3B8', display: 'block', marginBottom: 8 }}>Product Size</label>
              <select style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <option>0.5L</option><option>1L</option><option>1.5L</option>
                <option>5L</option><option>10L</option><option>20L</option>
              </select>
             </div>
             <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ color: '#94A3B8', display: 'block', marginBottom: 8 }}>Purchase Type</label>
              <select style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <option>Parcel</option><option>Single</option><option>Refill</option>
              </select>
             </div>
             <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ color: '#94A3B8', display: 'block', marginBottom: 8 }}>Quantity</label>
              <input type="number" placeholder="1" style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
             </div>
             <button className="btn-primary" style={{ padding: '10px 24px', height: 42 }}>Add Sale</button>
          </div>
        </div>
      </div>
    </>
  );
}

function EmployeesTab() {
  return (
    <>
      <div className="page-header"><h1 className="page-title">HR & Attendance</h1></div>
      <div className="table-container">
        <h2 className="table-title" style={{ marginBottom: 20 }}>Scan QR Attendance</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
           <div style={{ width: 200, height: 200, border: '2px dashed var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', flexDirection: 'column', gap: 12 }}>
              <Users size={48} />
              <span>Waiting for QR Scan...</span>
           </div>
        </div>
        
        <h2 className="table-title" style={{ marginBottom: 20 }}>Today's Shifts</h2>
        <table>
          <thead>
            <tr><th>Employee</th><th>Time In</th><th>Time Out</th><th>Shift Type</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>James Worker</td>
              <td>08:00 AM</td>
              <td>--</td>
              <td><span className="status processing">Day Shift</span></td>
            </tr>
            <tr>
              <td>Mary Omondi</td>
              <td>06:00 PM</td>
              <td>--</td>
              <td><span className="status pending">Night Shift</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function PayrollTab() {
  return (
    <>
      <div className="page-header"><h1 className="page-title">Payroll & Production Bonuses</h1></div>
      <div className="table-container">
        <h2 className="table-title" style={{ marginBottom: 20 }}>Weekly Summary (Current Week)</h2>
        <table>
          <thead>
            <tr><th>Employee</th><th>Shifts Logged</th><th>Base Pay (KES 350/shift)</th><th>Production Bonus (10% &gt; 200)</th><th>Total Due</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>James Worker</td>
              <td>6</td>
              <td>KES 2,100</td>
              <td style={{ color: '#10B981' }}>+ KES 450 (From 50 extra parcels)</td>
              <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>KES 2,550</td>
            </tr>
            <tr>
              <td>Mary Omondi</td>
              <td>5</td>
              <td>KES 1,750</td>
              <td style={{ color: '#10B981' }}>+ KES 450 (From 50 extra parcels)</td>
              <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>KES 2,200</td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ marginTop: 24, padding: 16, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 12 }}>
           <p style={{ color: '#10B981', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
             <DollarSign size={20} />
             <strong>Bonus Logic Active:</strong> Total factory production exceeded 200 parcels this week. 10% bonus calculated automatically per worker.
           </p>
        </div>
      </div>
    </>
  );
}
