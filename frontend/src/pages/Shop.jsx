import React, { useMemo, useState } from 'react';
import { products } from '../data/products';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const SIZES = ['All', '0.5L', '1L', '1.5L', '5L', '10L', '20L'];
const PRICE_SORTS = [
  { id: 'default', label: 'Default' },
  { id: 'low', label: 'Price: low to high' },
  { id: 'high', label: 'Price: high to low' }
];

export default function Shop() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [filter, setFilter] = useState('All');
  const [priceSort, setPriceSort] = useState('default');

  const filteredProducts = useMemo(() => {
    let list = filter === 'All' ? [...products] : products.filter((p) => p.size === filter);
    if (priceSort === 'low') list.sort((a, b) => a.price - b.price);
    if (priceSort === 'high') list.sort((a, b) => b.price - a.price);
    return list;
  }, [filter, priceSort]);

  return (
    <div className="container" style={{ marginTop: 24 }}>
      <h1 className="section-title" style={{ marginBottom: 12 }}>Shop <span>our water</span></h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 2rem' }}>
        Browse sizes, compare prices, and add to cart in one tap.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 28
        }}
      >
        <span style={{ width: '100%', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Size</span>
        {SIZES.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn' : 'btn btn-outline'}
            style={{ padding: '12px 18px', fontSize: '0.95rem', minHeight: 48 }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 36 }}>
        <span style={{ width: '100%', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sort by price</span>
        {PRICE_SORTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setPriceSort(s.id)}
            className={priceSort === s.id ? 'btn' : 'btn btn-outline'}
            style={{ padding: '12px 18px', fontSize: '0.95rem', minHeight: 48 }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <button
              type="button"
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ border: 'none', background: 'transparent', padding: 0, width: '100%', cursor: 'pointer' }}
              aria-label={`View ${product.name}`}
            >
              <img
                src={product.image}
                alt=""
                className="product-img"
                loading="lazy"
                width={280}
                height={220}
              />
            </button>
            <h2 className="product-title" style={{ fontSize: '1.25rem' }}>{product.name}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 18 }}>
              {product.prices.single && <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Single: KES {product.prices.single}</p>}
              <p className="product-price" style={{ margin: 0, fontSize: '1.2rem' }}>Parcel: KES {product.prices.parcel}</p>
              {product.prices.refill && <p style={{ fontSize: '1rem', color: 'var(--primary)' }}>Refill: KES {product.prices.refill}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" onClick={() => navigate(`/product/${product.id}`)} className="btn btn-outline" style={{ width: '100%', padding: '12px' }}>
                Select Options
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
