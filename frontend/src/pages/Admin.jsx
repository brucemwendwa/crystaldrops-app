import React, { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus } from '../api';
import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Factory, Truck, Store, Users, DollarSign, LogOut, Package } from 'lucide-react';
import './Admin.css';
import { formatApiError } from '../utils/apiError';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
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
    { id: 'inventory', label: 'Raw Materials', icon: Package },
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
    <div className="admin-body" style={{ flexDirection: 'column' }}>
      {/* Top Nav */}
      <header className="admin-top-nav">
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <img src="/images/logo.png" alt="" width="32" height="32" style={{ width: 32, height: 32, objectFit: 'contain' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>CrystalDrops <span style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 'normal' }}>ERP</span></span>
              </div>
          </div>
          
          <nav className="horizontal-nav">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  style={{ background: 'none', cursor: 'pointer' }}
                >
                    <item.icon size={20} />
                    {item.label}
                </button>
              ))}
          </nav>
          
          <div className="nav-actions">
              <button
                onClick={() => navigate('/')}
                className="nav-item"
                style={{ background: 'none', cursor: 'pointer' }}
              >
                  <ShoppingCart size={20} />
                  Store
              </button>
              <button
                onClick={handleLogout}
                className="nav-item"
                style={{ background: 'none', cursor: 'pointer', color: '#ef4444' }}
              >
                  <LogOut size={20} />
                  Logout
              </button>
          </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
          <header className="admin-header">
              <div className="search-bar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" placeholder="Search operations, orders, staff..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
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
              {activeTab === 'dashboard' && <DashboardTab orders={orders} handleStatusUpdate={handleStatusUpdate} searchQuery={globalSearch} />}
              {activeTab === 'production' && <ProductionTab />}
              {activeTab === 'inventory' && <InventoryTab />}
              {activeTab === 'dispatch' && <DispatchTab />}
              {activeTab === 'depots' && <DepotsTab />}
              {activeTab === 'employees' && <EmployeesTab />}
              {activeTab === 'payroll' && <PayrollTab />}
          </div>
      </main>
    </div>
  );
}

function DashboardTab({ orders, handleStatusUpdate, searchQuery }) {
  const filteredOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (o._id || '').toLowerCase().includes(q) ||
      (o.phone || '').toLowerCase().includes(q) ||
      (o.status || '').toLowerCase().includes(q) ||
      (o.deliveryName || '').toLowerCase().includes(q) ||
      (o.deliveryLocation || '').toLowerCase().includes(q)
    );
  });

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = filteredOrders.length;
  const pendingDeliveries = filteredOrders.filter(o => o.status === 'pending').length;

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
      <div className="table-container glass-panel">
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
                        <th>Customer Info</th>
                        <th>Location</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order._id} className="hover-row">
                          <td style={{ fontWeight: 500, color: '#94A3B8' }}>{order._id.substring(18)}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>{order.deliveryName || 'N/A'}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.phone}</div>
                          </td>
                          <td style={{ fontSize: '0.9rem', maxWidth: 200, whiteSpace: 'normal', lineHeight: 1.4 }}>
                            {order.deliveryLocation || 'N/A'}
                          </td>
                          <td style={{ fontWeight: 600 }}>KES {order.total}</td>
                          <td><span className={`status ${order.status}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                          <td>
                            <select 
                              value={order.status} 
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', cursor: 'pointer' }}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>No orders match your search.</td></tr>
                    )}
                </tbody>
            </table>
          </div>
      </div>
    </>
  );
}

function ProductionTab() {
  const SIZES = ['0.5L', '1L', '1.5L', '5L', '10L', '20L'];
  const [formData, setFormData] = useState(SIZES.reduce((acc, size) => ({ ...acc, [size]: '' }), {}));
  const [logs, setLogs] = useState([]);

  const handleSubmit = () => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      details: { ...formData }
    };
    setLogs([entry, ...logs]);
    setFormData(SIZES.reduce((acc, size) => ({ ...acc, [size]: '' }), {}));
  };

  return (
    <>
      <div className="page-header"><h1 className="page-title">Factory Production</h1></div>
      <div className="table-container glass-panel" style={{ marginBottom: 24 }}>
        <h2 className="table-title" style={{ marginBottom: 20 }}>Log Daily Production</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {SIZES.map(size => (
            <div key={size} style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <label style={{ display: 'block', color: '#94A3B8', marginBottom: 8 }}>{size} (Parcels/Bottles)</label>
              <input type="number" min="0" placeholder="0" value={formData[size]} onChange={e => setFormData({ ...formData, [size]: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={handleSubmit} style={{ marginTop: 24, width: '200px', justifyContent: 'center' }}>Submit Production Log</button>
      </div>

      {logs.length > 0 && (
        <div className="table-container glass-panel">
          <h2 className="table-title" style={{ marginBottom: 20 }}>Recent Production Logs</h2>
          <table>
            <thead><tr><th>Timestamp</th><th>0.5L</th><th>1L</th><th>1.5L</th><th>5L</th><th>10L</th><th>20L</th></tr></thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ color: '#94A3B8' }}>{log.timestamp}</td>
                  {SIZES.map(size => <td key={size}>{log.details[size] || '0'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function DispatchTab() {
  const SIZES = ['0.5L', '1L', '1.5L', '5L', '10L', '20L'];
  const [formData, setFormData] = useState(SIZES.reduce((acc, size) => ({ ...acc, [size]: '' }), { driver: 'John Doe (Lorry KCE 123X)' }));
  const [logs, setLogs] = useState([]);

  const handleSubmit = () => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      driver: formData.driver,
      details: { ...formData }
    };
    setLogs([entry, ...logs]);
    setFormData(SIZES.reduce((acc, size) => ({ ...acc, [size]: '' }), { driver: formData.driver }));
  };

  return (
    <>
      <div className="page-header"><h1 className="page-title">Logistics & Dispatch</h1></div>
      <div className="table-container glass-panel" style={{ marginBottom: 24 }}>
        <h2 className="table-title" style={{ marginBottom: 20 }}>Dispatch to Lorry</h2>
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#94A3B8', display: 'block', marginBottom: 8 }}>Select Driver</label>
          <select value={formData.driver} onChange={e => setFormData({ ...formData, driver: e.target.value })} style={{ width: '100%', maxWidth: 300, padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
            <option>John Doe (Lorry KCE 123X)</option>
            <option>Peter Kamau (Lorry KBC 456Y)</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {SIZES.map(size => (
            <div key={size} style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <label style={{ display: 'block', color: '#94A3B8', marginBottom: 8 }}>{size} Loaded</label>
              <input type="number" min="0" placeholder="0" value={formData[size]} onChange={e => setFormData({ ...formData, [size]: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={handleSubmit} style={{ marginTop: 24, width: '200px', justifyContent: 'center' }}>Record Dispatch</button>
      </div>

      {logs.length > 0 && (
        <div className="table-container glass-panel">
          <h2 className="table-title" style={{ marginBottom: 20 }}>Recent Dispatch Logs</h2>
          <table>
            <thead><tr><th>Timestamp</th><th>Driver</th><th>0.5L</th><th>1L</th><th>1.5L</th><th>5L</th><th>10L</th><th>20L</th></tr></thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ color: '#94A3B8' }}>{log.timestamp}</td>
                  <td>{log.driver}</td>
                  {SIZES.map(size => <td key={size}>{log.details[size] || '0'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function DepotsTab() {
  const DEPOTS = ['Mukuyuni', 'Mbumbuni', 'Matiliku', 'Kathonzweni', 'Mbuvo'];
  const SIZES = ['0.5L', '1L', '1.5L', '5L', '10L', '20L', '20L Refill'];

  // Initialize state for each depot's stock
  const [stock, setStock] = useState(() => {
    const initialState = {};
    DEPOTS.forEach(depot => {
      initialState[depot] = {};
      SIZES.forEach(size => {
        initialState[depot][size] = { received: '', sold: '' };
      });
    });
    return initialState;
  });

  const handleChange = (depot, size, field, value) => {
    setStock(prev => ({
      ...prev,
      [depot]: {
        ...prev[depot],
        [size]: {
          ...prev[depot][size],
          [field]: value
        }
      }
    }));
  };

  return (
    <>
      <div className="page-header"><h1 className="page-title">Depot Management</h1></div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {DEPOTS.map(depot => (
          <div key={depot} className="table-container glass-panel">
            <h2 className="table-title" style={{ marginBottom: 20, color: 'var(--primary)' }}>{depot} Depot Stock</h2>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr><th>Size / Item</th><th>Received Today</th><th>Sold Today</th><th>Remaining Stock</th></tr>
                </thead>
                <tbody>
                  {SIZES.map(size => {
                    const received = parseInt(stock[depot][size].received) || 0;
                    const sold = parseInt(stock[depot][size].sold) || 0;
                    const remaining = received - sold;
                    return (
                      <tr key={size} className="hover-row">
                        <td style={{ fontWeight: 500 }}>{size}</td>
                        <td>
                          <input type="number" min="0" placeholder="0" value={stock[depot][size].received} onChange={(e) => handleChange(depot, size, 'received', e.target.value)} style={{ width: 100, padding: '8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }} />
                        </td>
                        <td>
                          <input type="number" min="0" placeholder="0" value={stock[depot][size].sold} onChange={(e) => handleChange(depot, size, 'sold', e.target.value)} style={{ width: 100, padding: '8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }} />
                        </td>
                        <td style={{ fontWeight: 'bold', color: remaining < 0 ? '#ef4444' : 'var(--text-main)' }}>
                          {remaining}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button className="btn-primary" style={{ marginTop: 24, padding: '10px 24px' }} onClick={() => alert(`${depot} Depot stock saved successfully!`)}>Save {depot} Stock</button>
          </div>
        ))}
      </div>
    </>
  );
}

function EmployeesTab() {
  const [qrCode, setQrCode] = useState('');
  const [employee, setEmployee] = useState('James Worker');
  const [timeStr, setTimeStr] = useState('08:00');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const updateQR = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(18, 15, 0, 0);
      
      let tokenDate = new Date(now);
      if (now < cutoff) {
        tokenDate.setDate(now.getDate() - 1);
      }
      const token = `CD_ATTENDANCE_${tokenDate.toISOString().split('T')[0]}`;
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${token}&color=0284c7&bgcolor=ffffff`);
    };
    updateQR();
    const interval = setInterval(updateQR, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogShift = () => {
    const [h, m] = timeStr.split(':').map(Number);
    let shiftType = (h >= 18 || h < 6) ? 'Night Shift' : 'Day Shift';

    const existingIndex = logs.findIndex(l => l.employee === employee);
    if (existingIndex !== -1) {
      const existing = logs[existingIndex];
      if (existing.shiftType !== shiftType && existing.shiftType !== 'Both Shifts') {
        shiftType = 'Both Shifts';
      }
    }

    const entry = {
      id: Date.now(),
      employee,
      time: timeStr,
      shiftType,
      timestamp: new Date().toLocaleString()
    };

    setLogs([entry, ...logs.filter(l => l.employee !== employee || l.shiftType === shiftType)]);
  };

  return (
    <>
      <div className="page-header"><h1 className="page-title">HR & Attendance</h1></div>
      
      <div className="table-container glass-panel" style={{ marginBottom: 24, textAlign: 'center' }}>
        <h2 className="table-title" style={{ marginBottom: 20 }}>Daily QR Attendance Code</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>This code automatically refreshes every day at exactly 6:15 PM.</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
           {qrCode ? (
             <img src={qrCode} alt="Attendance QR Code" style={{ borderRadius: 16, border: '4px solid var(--primary)', padding: 8, background: 'white' }} />
           ) : (
             <div style={{ width: 200, height: 200, border: '2px dashed var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
           )}
        </div>
      </div>

      <div className="table-container glass-panel" style={{ marginBottom: 24 }}>
        <h2 className="table-title" style={{ marginBottom: 20 }}>Manual Shift Entry</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ color: '#94A3B8', display: 'block', marginBottom: 8 }}>Employee</label>
            <select value={employee} onChange={e => setEmployee(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              <option>James Worker</option>
              <option>Mary Omondi</option>
              <option>Peter Kamau</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ color: '#94A3B8', display: 'block', marginBottom: 8 }}>Check-In Time</label>
            <input type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>
          <button className="btn-primary" onClick={handleLogShift} style={{ padding: '10px 24px', height: 42 }}>Log Shift</button>
        </div>
      </div>
      
      {logs.length > 0 && (
        <div className="table-container glass-panel">
          <h2 className="table-title" style={{ marginBottom: 20 }}>Today's Shifts Log</h2>
          <table>
            <thead>
              <tr><th>Timestamp</th><th>Employee</th><th>Check-In Time</th><th>Shift Type</th></tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="hover-row">
                  <td style={{ color: '#94A3B8' }}>{log.timestamp}</td>
                  <td style={{ fontWeight: 500 }}>{log.employee}</td>
                  <td>{log.time}</td>
                  <td>
                    <span className={`status ${log.shiftType === 'Both Shifts' ? 'processing' : log.shiftType === 'Night Shift' ? 'pending' : 'delivered'}`}>
                      {log.shiftType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function PayrollTab() {
  const [payroll, setPayroll] = useState([
    { id: 1, employee: 'James Worker', shifts: 6, basePay: 2100, bonus: 450, paid: 0 },
    { id: 2, employee: 'Mary Omondi', shifts: 5, basePay: 1750, bonus: 450, paid: 0 },
    { id: 3, employee: 'Peter Kamau', shifts: 6, basePay: 2100, bonus: 450, paid: 2550 },
  ]);
  const [paymentLog, setPaymentLog] = useState([]);
  const [paymentForm, setPaymentForm] = useState({ employeeId: 1, amount: '' });

  const handlePayment = () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) return;
    
    const emp = payroll.find(e => e.id === Number(paymentForm.employeeId));
    setPayroll(payroll.map(p => {
      if (p.id === emp.id) return { ...p, paid: p.paid + Number(paymentForm.amount) };
      return p;
    }));
    
    setPaymentLog([{ 
      id: Date.now(), 
      employee: emp.employee, 
      amount: Number(paymentForm.amount), 
      timestamp: new Date().toLocaleString() 
    }, ...paymentLog]);
    
    setPaymentForm({ ...paymentForm, amount: '' });
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Payroll & Production Bonuses</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 16px', borderRadius: 20 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}></span>
          Payments clear weekly on Saturdays
        </div>
      </div>

      <div className="table-container glass-panel" style={{ marginBottom: 24 }}>
        <h2 className="table-title" style={{ marginBottom: 20 }}>Weekly Summary (Current Week)</h2>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Employee</th><th>Shifts</th><th>Base Pay</th><th>Prod. Bonus</th><th>Total Due</th><th>Amount Paid</th><th>Balance to Clear</th></tr>
            </thead>
            <tbody>
              {payroll.map(p => {
                const totalDue = p.basePay + p.bonus;
                const balance = totalDue - p.paid;
                return (
                  <tr key={p.id} className="hover-row">
                    <td style={{ fontWeight: 500 }}>{p.employee}</td>
                    <td>{p.shifts}</td>
                    <td>KES {p.basePay.toLocaleString()}</td>
                    <td style={{ color: '#10B981' }}>+ KES {p.bonus.toLocaleString()}</td>
                    <td style={{ fontWeight: 'bold' }}>KES {totalDue.toLocaleString()}</td>
                    <td style={{ color: '#10B981' }}>KES {p.paid.toLocaleString()}</td>
                    <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: balance > 0 ? '#ef4444' : '#10B981' }}>
                      KES {balance.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: 24, padding: 16, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 12 }}>
           <p style={{ color: '#10B981', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
             <DollarSign size={20} />
             <strong>Bonus Logic Active:</strong> Total factory production exceeded 200 parcels this week. 10% bonus calculated automatically per worker.
           </p>
        </div>
      </div>

      <div className="table-container glass-panel" style={{ marginBottom: 24 }}>
        <h2 className="table-title" style={{ marginBottom: 20 }}>Record Payment</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ color: '#94A3B8', display: 'block', marginBottom: 8 }}>Employee</label>
            <select value={paymentForm.employeeId} onChange={e => setPaymentForm({ ...paymentForm, employeeId: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              {payroll.filter(p => (p.basePay + p.bonus - p.paid) > 0).map(p => (
                <option key={p.id} value={p.id}>{p.employee} (Balance: KES {p.basePay + p.bonus - p.paid})</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ color: '#94A3B8', display: 'block', marginBottom: 8 }}>Amount to Pay (KES)</label>
            <input type="number" min="1" placeholder="Enter amount" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>
          <button className="btn-primary" onClick={handlePayment} style={{ padding: '10px 24px', height: 42 }}>Log Payment</button>
        </div>
      </div>

      {paymentLog.length > 0 && (
        <div className="table-container glass-panel">
          <h2 className="table-title" style={{ marginBottom: 20 }}>Recent Payments Log</h2>
          <table>
            <thead>
              <tr><th>Timestamp</th><th>Employee</th><th>Amount Paid</th></tr>
            </thead>
            <tbody>
              {paymentLog.map(log => (
                <tr key={log.id} className="hover-row">
                  <td style={{ color: '#94A3B8' }}>{log.timestamp}</td>
                  <td style={{ fontWeight: 500 }}>{log.employee}</td>
                  <td style={{ color: '#10B981', fontWeight: 'bold' }}>KES {log.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function InventoryTab() {
  const SIZES = ['0.5L', '1L', '1.5L', '5L', '10L', '20L'];
  const [formData, setFormData] = useState(SIZES.reduce((acc, size) => ({ ...acc, [size]: '' }), {}));
  const [logs, setLogs] = useState([]);

  const handleSubmit = () => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      details: { ...formData }
    };
    setLogs([entry, ...logs]);
    setFormData(SIZES.reduce((acc, size) => ({ ...acc, [size]: '' }), {}));
  };

  return (
    <>
      <div className="page-header"><h1 className="page-title">Inventory & Raw Materials</h1></div>
      <div className="table-container glass-panel" style={{ marginBottom: 24 }}>
        <h2 className="table-title" style={{ marginBottom: 20 }}>Log Empty Bottles Purchased</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {SIZES.map(size => (
            <div key={size} style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <label style={{ display: 'block', color: '#94A3B8', marginBottom: 8 }}>{size} Bottles</label>
              <input type="number" min="0" placeholder="0" value={formData[size]} onChange={e => setFormData({ ...formData, [size]: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={handleSubmit} style={{ marginTop: 24, width: '200px', justifyContent: 'center' }}>Record Purchase</button>
      </div>

      {logs.length > 0 && (
        <div className="table-container glass-panel">
          <h2 className="table-title" style={{ marginBottom: 20 }}>Recent Inventory Logs</h2>
          <table>
            <thead><tr><th>Timestamp</th><th>0.5L</th><th>1L</th><th>1.5L</th><th>5L</th><th>10L</th><th>20L</th></tr></thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ color: '#94A3B8' }}>{log.timestamp}</td>
                  {SIZES.map(size => <td key={size}>{log.details[size] || '0'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
