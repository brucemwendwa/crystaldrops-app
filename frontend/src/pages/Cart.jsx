import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ marginTop: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>Your cart is empty</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Browse the shop and tap &ldquo;Add to cart&rdquo; on any bottle size.</p>
        <button type="button" onClick={() => navigate('/shop')} className="btn btn-lg">Return to shop</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: 24, maxWidth: 1000 }}>
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 8, fontSize: '2rem' }}>
        Shopping <span>cart</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Review quantities and total before checkout.</p>

      <div className="cart-grid">
        <div>
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {cart.map((item, index) => (
              <div
                key={item.cartItemId}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 16,
                  padding: '1.25rem',
                  borderBottom: index < cart.length - 1 ? '1px solid var(--glass-border)' : 'none'
                }}
              >
                <img
                  src={item.image}
                  alt=""
                  width={80}
                  height={80}
                  loading="lazy"
                  style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 12, background: '#f8fafc', padding: 8 }}
                />

                <div style={{ flex: '1 1 160px' }}>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: 4, color: 'var(--text-color)' }}>{item.name} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>({item.purchaseType})</span></h2>
                  <p style={{ color: 'var(--primary)', fontWeight: 700 }}>KES {item.cartPrice} each</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    style={{ padding: '12px 18px', background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.2rem', minWidth: 48 }}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span style={{ padding: '0 12px', fontWeight: 700, minWidth: 36, textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    style={{ padding: '12px 18px', background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.2rem', minWidth: 48 }}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div style={{ fontWeight: 700, fontSize: '1.05rem', minWidth: 100, textAlign: 'right' }}>
                  KES {item.cartPrice * item.quantity}
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.cartItemId)}
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 12, marginLeft: 'auto' }}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={22} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: 28, position: 'sticky', top: 100, boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--glass-border)' }}>Order summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>KES {total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, color: 'var(--text-muted)' }}>
              <span>Delivery</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Free</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, fontSize: '1.25rem', fontWeight: 800, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>KES {total}</span>
            </div>

            <button type="button" onClick={() => navigate('/checkout')} className="btn btn-lg" style={{ width: '100%' }}>
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
