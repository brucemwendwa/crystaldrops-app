import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import { LogOut, ShoppingCart, User, Menu, X } from 'lucide-react';
import { socket } from './socket';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setMenuOpen(false);
    navigate('/login');
  };

  const linkStyle = { position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px' };

  return (
    <nav>
        <Link to="/home" className="logo" onClick={() => setMenuOpen(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-mark" aria-hidden>
              <img src="/images/logo.png" alt="" width={42} height={42} />
            </span>
            <span className="brand-word">
              Crystal<span>Drops</span>
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: 4 }}>
            'clarity in every sip'
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
          <Link to="/home">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/contact">Contact</Link>

          <Link to="/cart" style={linkStyle}>
            <ShoppingCart size={22} aria-hidden />
            <span>Cart</span>
            {cartCount > 0 && (
              <span style={{
                marginLeft: 4,
                background: 'var(--primary)', color: '#fff',
                borderRadius: '999px', padding: '2px 8px',
                fontSize: '0.75rem', fontWeight: 700
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {token ? (
            <>
              <Link to="/dashboard" style={linkStyle}>
                <User size={22} aria-hidden />
                <span>Account</span>
              </Link>
              {isAdmin && <Link to="/admin">Admin</Link>}
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', fontSize: '0.95rem' }}
              >
                <LogOut size={18} aria-hidden /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-login" style={{ padding: '12px 24px', fontSize: '0.95rem' }} onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
    </nav>
  );
}

function App() {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
