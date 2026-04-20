import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { ArrowLeft, CheckCircle, Droplets, Truck } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);

  const availableTypes = product ? Object.keys(product.prices || {}) : [];
  const defaultType = availableTypes.includes('parcel') ? 'parcel' : availableTypes[0];
  const [purchaseType, setPurchaseType] = useState(defaultType);

  if (!product) {
    return (
      <div className="container" style={{ marginTop: 100, textAlign: 'center' }}>
        <h1>Product not found</h1>
        <button type="button" className="btn" style={{ marginTop: 24 }} onClick={() => navigate('/shop')}>Back to shop</button>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product, quantity, purchaseType);
    window.alert(`Added ${quantity} ${purchaseType} of ${product.name} to cart`);
  };

  const currentPrice = product.prices[purchaseType] || product.price;

  return (
    <div className="container" style={{ marginTop: 24, maxWidth: 1000 }}>
      <button
        type="button"
        onClick={() => navigate('/shop')}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: '1rem', minHeight: 44 }}
      >
        <ArrowLeft size={20} aria-hidden /> Back to shop
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <img
            src={product.image}
            alt=""
            width={320}
            height={320}
            loading="lazy"
            style={{ width: '100%', maxWidth: 300, objectFit: 'contain' }}
          />
        </div>

        <div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', marginBottom: 8, color: 'var(--text-color)' }}>{product.name}</h1>
          <p style={{ color: 'var(--primary)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 20 }}>KES {currentPrice}</p>

          <p style={{ color: 'var(--text-color)', fontSize: '1.05rem', marginBottom: 20, lineHeight: 1.65 }}>
            {product.description}
          </p>

          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Purchase Type</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {availableTypes.map(type => {
                const price = product.prices[type];
                let displayType = type.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                if ((type === 'parcel' || type === 'customised parcel') && product.parcelQuantity) {
                  displayType += ` (${product.parcelQuantity} bottles)`;
                }
                return (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'var(--surface)', padding: '10px 16px', borderRadius: 8, border: purchaseType === type ? '2px solid var(--primary)' : '1px solid var(--glass-border)' }}>
                    <input
                      type="radio"
                      name="purchaseType"
                      value={type}
                      checked={purchaseType === type}
                      onChange={() => setPurchaseType(type)}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontWeight: 600 }}>{displayType}</span>
                    <span style={{ color: 'var(--text-muted)' }}>KES {price}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 20, padding: 18, borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
            <p style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, color: 'var(--text-color)' }}>
              <Droplets size={22} color="var(--primary)" style={{ flexShrink: 0 }} aria-hidden />
              <span><strong>Source:</strong> {product.source}</span>
            </p>
            <p style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, color: 'var(--text-color)' }}>
              <CheckCircle size={22} color="var(--primary)" style={{ flexShrink: 0 }} aria-hidden />
              <span><strong>Purification:</strong> {product.purification}</span>
            </p>
            <p style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: 0, color: 'var(--text-color)' }}>
              <CheckCircle size={22} color="var(--primary)" style={{ flexShrink: 0 }} aria-hidden />
              <span><strong>Benefits:</strong> {product.benefits}</span>
            </p>
          </div>

          <div style={{ marginBottom: 24, padding: 16, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, color: 'var(--text-muted)' }}>
              <Truck size={22} color="var(--primary)" aria-hidden />
              <span>Same-day and next-day delivery in the Nairobi area. We confirm your slot by SMS or WhatsApp.</span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Quantity</span>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 12, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '14px 22px', background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.2rem', minWidth: 48 }}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span style={{ padding: '0 20px', fontSize: '1.15rem', fontWeight: 700 }}>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '14px 22px', background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.2rem', minWidth: 48 }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <button type="button" onClick={handleAdd} className="btn btn-lg" style={{ width: '100%' }}>
            Add to cart — KES {currentPrice * quantity}
          </button>
        </div>
      </div>
    </div>
  );
}
