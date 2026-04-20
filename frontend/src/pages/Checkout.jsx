import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { createOrder, initiatePayment } from '../api';
import { formatApiError } from '../utils/apiError';

const LAST_ORDER_KEY = 'lastOrderSnapshot';

const KENYA_LOCATIONS = {
  "Nairobi": {
    "Nairobi City": ["Westlands", "Kilimani", "Kileleshwa", "Lavington", "CBD", "Karen", "Lang'ata", "Kasarani", "Embakasi"]
  },
  "Makueni": {
    "Makueni": ["Wote", "Mtito Andei", "Kibwezi", "Makindu", "Mukuyuni", "Mbumbuni", "Kathonzweni", "Mbuvo", "Kitise", "Matiliku"]
  },
  "Machakos": {
    "Machakos Town": ["Mlolongo", "Athi River", "Syokimau"]
  }
};

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
  const [formData, setFormData] = useState({ name: '', phone: '', county: '', town: '', area: '', landmark: '' });
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
    const nameWords = formData.name.trim().split(' ');
    if (nameWords.length < 2 || /\d/.test(formData.name)) nextErrors.name = 'Enter at least 2-3 words, no numbers.';
    if (!isValidKePhone(formData.phone)) nextErrors.phone = 'Use a valid Kenya number e.g. 254712345678 or 0712345678.';
    
    if (!formData.county) nextErrors.county = 'Please select a county';
    if (!formData.town) nextErrors.town = 'Please select a town';
    if (!formData.area) nextErrors.area = 'Please select an area';
    
    const l = formData.landmark.trim().toLowerCase();
    if (l.length < 5) nextErrors.landmark = 'Address must be at least 5 characters.';
    if (l === 'home' || l === 'nairobi') nextErrors.landmark = 'Please provide a more specific landmark.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setLoading(true);

    try {
      const fullLocation = `${formData.county}, ${formData.town}, ${formData.area} - ${formData.landmark}`;
      const orderData = {
        items: cart.map(item => ({ name: `${item.name} (${item.purchaseType})`, quantity: item.quantity, price: item.cartPrice })),
        total,
        phone: formData.phone,
        deliveryName: formData.name,
        deliveryLocation: fullLocation,
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
              <label htmlFor="co-county">County</label>
              <select id="co-county" value={formData.county} onChange={(e) => setFormData({ ...formData, county: e.target.value, town: '', area: '' })} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface)', marginBottom: 12 }}>
                <option value="">Select County</option>
                {Object.keys(KENYA_LOCATIONS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.county && <div style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: 12 }}>{errors.county}</div>}

              {formData.county && (
                <>
                  <label htmlFor="co-town">Town</label>
                  <select id="co-town" value={formData.town} onChange={(e) => setFormData({ ...formData, town: e.target.value, area: '' })} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface)', marginBottom: 12 }}>
                    <option value="">Select Town</option>
                    {Object.keys(KENYA_LOCATIONS[formData.county]).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.town && <div style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: 12 }}>{errors.town}</div>}
                </>
              )}

              {formData.town && (
                <>
                  <label htmlFor="co-area">Area</label>
                  <select id="co-area" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface)', marginBottom: 12 }}>
                    <option value="">Select Area</option>
                    {KENYA_LOCATIONS[formData.county][formData.town].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  {errors.area && <div style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: 12 }}>{errors.area}</div>}
                </>
              )}

              <label htmlFor="co-landmark">Specific Landmark / Address Details</label>
              <input
                id="co-landmark"
                type="text"
                placeholder="e.g. Next to Total Gas Station, Blue Gate"
                required
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                aria-invalid={Boolean(errors.landmark)}
              />
              {errors.landmark && <div style={{ marginTop: 8, color: '#dc2626', fontSize: '0.9rem' }}>{errors.landmark}</div>}
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
                <li key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.95rem' }}>
                  <span>{item.quantity}× {item.name} ({item.purchaseType})</span>
                  <span>KES {item.cartPrice * item.quantity}</span>
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
