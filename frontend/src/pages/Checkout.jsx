import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { createOrder, initiatePayment } from '../api';
import { formatApiError } from '../utils/apiError';

const LAST_ORDER_KEY = 'lastOrderSnapshot';

function normalizePhone(v) {
  return String(v || '').replace(/\D/g, '');
}

function isValidKePhone(v) {
  const p = normalizePhone(v);
  return /^2547\d{8}$/.test(p) || /^07\d{8}$/.test(p) || /^7\d{8}$/.test(p);
}

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', location: '' });
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ marginTop: 40, textAlign: 'center' }}>
        <h1 style={{ marginBottom: 16 }}>No items to checkout</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Your cart is empty.</p>
        <button type="button" onClick={() => navigate('/shop')} className="btn btn-lg">Go to shop</button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) nextErrors.name = 'Enter your full name (at least 3 characters).';
    if (!isValidKePhone(formData.phone)) nextErrors.phone = 'Use a valid Kenya number e.g. 254712345678 or 0712345678.';
    if (!formData.location.trim() || formData.location.trim().length < 3) nextErrors.location = 'Enter a delivery location (at least 3 characters).';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total,
        phone: formData.phone,
        deliveryName: formData.name,
        deliveryLocation: formData.location,
        paymentMethod
      };

      const order = await createOrder(orderData);

      if (paymentMethod === 'mpesa') {
        await initiatePayment({
          phone: formData.phone,
          amount: total,
          orderId: order._id
        });
        window.alert('Order placed. Check your phone for the M-Pesa STK push.');
      }

      localStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify(cart.map((i) => ({ id: i.id, quantity: i.quantity })))
      );
      clearCart();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        window.alert('Please log in to complete your order.');
        navigate('/login');
        return;
      }
      window.alert(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: 24, maxWidth: 900 }}>
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 8, fontSize: '2rem' }}>
        Checkout
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Simple delivery details and payment—nothing extra.</p>

      <div className="checkout-grid">
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 20 }}>Delivery details</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="co-name">Full name</label>
              <input
                id="co-name"
                type="text"
                placeholder="Emily Ndanu"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <div style={{ marginTop: 8, color: '#dc2626', fontSize: '0.9rem' }}>{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="co-phone">Phone (M-Pesa number if paying by M-Pesa)</label>
              <input
                id="co-phone"
                type="text"
                placeholder="254712345678"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && <div style={{ marginTop: 8, color: '#dc2626', fontSize: '0.9rem' }}>{errors.phone}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="co-loc">Delivery location</label>
              <input
                id="co-loc"
                type="text"
                placeholder="e.g. Westlands, Nairobi"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                aria-invalid={Boolean(errors.location)}
              />
              {errors.location && <div style={{ marginTop: 8, color: '#dc2626', fontSize: '0.9rem' }}>{errors.location}</div>}
            </div>

            <fieldset style={{ marginTop: 24, border: '1px solid var(--glass-border)', borderRadius: 16, padding: 20 }}>
              <legend style={{ fontWeight: 700, padding: '0 8px', color: 'var(--text-color)' }}>Payment</legend>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, cursor: 'pointer', minHeight: 44 }}>
                <input
                  type="radio"
                  name="pay"
                  checked={paymentMethod === 'mpesa'}
                  onChange={() => setPaymentMethod('mpesa')}
                  style={{ width: 20, height: 20 }}
                />
                <span>M-Pesa (STK push on place order)</span>
              </label>
            </fieldset>

            <button type="submit" className="btn btn-lg" style={{ width: '100%', marginTop: 28 }} disabled={loading}>
              {loading ? 'Processing…' : 'Place order'}
            </button>
          </form>
        </div>

        <div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 100 }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: 20 }}>Order summary</h2>

            <ul style={{ listStyle: 'none', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--glass-border)' }}>
              {cart.map((item) => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.95rem' }}>
                  <span>{item.quantity}× {item.name}</span>
                  <span>KES {item.price * item.quantity}</span>
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: 'var(--text-muted)' }}>
              <span>Delivery</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Free</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem', fontWeight: 800, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>KES {total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
