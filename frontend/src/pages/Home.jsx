import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import {
  Award,
  Clock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Truck,
  Wallet
} from 'lucide-react';

const SIZE_LINKS = [
  { size: '0.5L', id: 'cd-05l', label: 'On the go' },
  { size: '1L', id: 'cd-1l', label: 'Daily use' },
  { size: '1.5L', id: 'cd-15l', label: 'Desk & gym' },
  { size: '5L', id: 'cd-5l', label: 'Small household' },
  { size: '10L', id: 'cd-10l', label: 'Bigger home needs' },
  { size: '20L', id: 'cd-20l', label: 'Dispenser refill' }
];

const WHY = [
  {
    title: 'Purity certification',
    text: 'Every batch is filtered through reverse osmosis and UV treatment, then sealed under hygienic conditions you can trust.',
    icon: ShieldCheck
  },
  {
    title: 'Fast delivery',
    text: 'Scheduled and on-demand drops across Nairobi, Machakos, and Makueni—so you are never without safe water at home or at work.',
    icon: Truck
  },
  {
    title: 'Affordable pricing',
    text: 'Premium hydration at prices that work for families and teams, because clean water should not be a luxury.',
    icon: Wallet
  }
];

const TESTIMONIALS = [
  {
    name: 'Sarah K.',
    text: 'The delivery is incredibly fast, and the water tastes so pure. It is the only brand my family drinks now.'
  },
  {
    name: 'David M.',
    text: 'I love the 20L refill service. Customer support is excellent and M-Pesa checkout is seamless.'
  },
  {
    name: 'Grace W.',
    text: 'CrystalDrops keeps our office stocked. Clean, affordable, and always on time.'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { repeatLastOrder, hasLastOrder } = useCart();
  const [subscribeEmail, setSubscribeEmail] = useState('');

  const handleRepeatOrder = () => {
    const result = repeatLastOrder();
    if (result.ok) {
      navigate('/cart');
    } else {
      window.alert(result.message);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    const key = 'cd_weekly_subscribers';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    if (!prev.includes(subscribeEmail.trim())) {
      prev.push(subscribeEmail.trim());
      localStorage.setItem(key, JSON.stringify(prev));
    }
    window.alert('Thank you. We will contact you about weekly delivery options.');
    setSubscribeEmail('');
  };

  const cardStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--glass-border)',
    borderRadius: 20,
    padding: '2rem',
    boxShadow: 'var(--shadow-sm)'
  };

  return (
    <>
      <a
        href="https://wa.me/254700000000?text=Hi%20CrystalDrops%2C%20I%27d%20like%20to%20order%20water"
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float"
        aria-label="Order on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden>
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825 0 6.938 3.112 6.938 6.937 0 3.825-3.113 6.938-6.938 6.938z" />
        </svg>
      </a>

      <header className="hero" id="home">
        <div className="hero-bg" style={{ backgroundImage: 'url(/images/hero.png)' }} aria-hidden />
        <div className="hero-content">
          <h1>Pure, Safe Drinking Water Delivered to Your Door</h1>
          <p>
            Health and safety start with what you drink. CrystalDrops is bottled in a controlled, sanitary
            environment—so every sip is clean, refreshing, and safe for your family.
          </p>
          <button type="button" onClick={() => navigate('/shop')} className="btn btn-lg">
            Order Now
          </button>
        </div>
      </header>

      <section className="features" id="why-us" aria-labelledby="why-heading">
        <h2 id="why-heading" className="section-title" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
          Why choose <span>us</span>
        </h2>
        {WHY.map(({ title, text, icon: Icon }) => (
          <div key={title} className="feature">
            <div className="feature-icon">
              <Icon size={36} strokeWidth={1.75} aria-hidden />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <section className="products" id="highlights" aria-labelledby="sizes-heading">
        <h2 id="sizes-heading" className="section-title">
          Product <span>highlights</span>
        </h2>
        <p
          style={{
            textAlign: 'center',
            maxWidth: 640,
            margin: '-2rem auto 3rem',
            color: 'var(--text-muted)',
            fontSize: '1.05rem'
          }}
        >
          Bottled water sizes for every need—from pocket-friendly 0.5L to office-ready 20L refillable bottles.
        </p>
        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {products.map((product) => (
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
              <h3 style={{ fontSize: '1.25rem', marginBottom: 6, color: 'var(--text-color)' }}>{product.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 8 }}>{product.size}</p>
              <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>Parcel: KES {product.prices.parcel}</p>
              <button type="button" onClick={() => navigate(`/product/${product.id}`)} className="btn btn-outline" style={{ width: '100%' }}>
                View product
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '4rem 5%', background: 'var(--bg-color)' }} aria-label="Trust and quality">
        <div style={{ ...cardStyle, maxWidth: 960, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
          <div style={{ flex: '1 1 220px' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: 12, color: 'var(--text-color)' }}>Certified cleanliness</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.65 }}>
              Sealed bottles, monitored sourcing, and lab-aligned processes—because water is about health and safety first.
            </p>
          </div>
          <ul style={{ flex: '1 1 280px', listStyle: 'none', display: 'grid', gap: 16 }}>
            <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <img src="/images/logo.png" alt="" width={22} height={22} style={{ width: 22, height: 22, objectFit: 'contain', marginTop: 2 }} />
              <span style={{ color: 'var(--text-color)' }}><strong>Controlled bottling</strong> — minimal handling from purification to your door.</span>
            </li>
            <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Award className="trust-li-icon" color="var(--primary)" size={22} aria-hidden />
              <span style={{ color: 'var(--text-color)' }}><strong>Quality you can see</strong> — crystal-clear water, neutral taste, consistent standards.</span>
            </li>
            <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Clock className="trust-li-icon" color="var(--primary)" size={22} aria-hidden />
              <span style={{ color: 'var(--text-color)' }}><strong>Fresh rotation</strong> — stock moves quickly so you always get a recent batch.</span>
            </li>
          </ul>
        </div>
      </section>

      <section style={{ padding: '4rem 5%', background: 'var(--bg-secondary)' }} aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="section-title">
          What our <span>customers</span> say
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            maxWidth: 1200,
            margin: '0 auto'
          }}
        >
          {TESTIMONIALS.map((t) => (
            <blockquote key={t.name} style={{ ...cardStyle, margin: 0 }}>
              <p style={{ fontStyle: 'italic', marginBottom: 16, color: 'var(--text-color)', lineHeight: 1.6 }}>&ldquo;{t.text}&rdquo;</p>
              <footer style={{ fontWeight: 700, color: 'var(--primary)' }}>— {t.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section style={{ padding: '4rem 5%', background: 'var(--bg-color)' }} aria-labelledby="subscribe-heading">
        <div style={{ ...cardStyle, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 id="subscribe-heading" style={{ fontSize: '1.75rem', marginBottom: 12 }}>Subscribe for weekly delivery</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Save time with a recurring drop. Leave your email and we will set up a plan that fits you.
          </p>
          <form onSubmit={handleSubscribe} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <label htmlFor="sub-email" className="visually-hidden">
              Email
            </label>
            <input
              id="sub-email"
              type="email"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                flex: '1 1 220px',
                maxWidth: 320,
                padding: '14px 16px',
                borderRadius: 12,
                border: '1px solid var(--glass-border)',
                fontSize: '1rem'
              }}
            />
            <button type="submit" className="btn">Request weekly plan</button>
          </form>
        </div>
      </section>

      <section style={{ padding: '3rem 5%', background: 'var(--bg-secondary)' }} aria-label="Quick actions">
        <div className="home-bonus-grid">
          <div className="home-bonus-card">
            <RefreshCw style={{ margin: '0 auto 12px', color: 'var(--primary)' }} size={28} aria-hidden />
            <h3 style={{ marginBottom: 8, fontSize: '1.15rem' }}>Repeat last order</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Rebuild your cart from your last successful checkout in one tap.
            </p>
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%' }}
              disabled={!hasLastOrder()}
              onClick={handleRepeatOrder}
            >
              {hasLastOrder() ? 'Add last order to cart' : 'No past order yet'}
            </button>
          </div>
          <div className="home-bonus-card">
            <MapPin style={{ margin: '0 auto 12px', color: 'var(--primary)' }} size={28} aria-hidden />
            <h3 style={{ marginBottom: 8, fontSize: '1.15rem' }}>Delivery tracking</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Follow order status in your account as we prepare and dispatch your water.
            </p>
            <Link to="/dashboard" className="btn" style={{ display: 'block', width: '100%', textAlign: 'center' }}>
              View orders
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-final" style={{ padding: '4rem 5%', background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-color) 100%)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 16, color: 'var(--text-color)' }}>
          Ready for pure, safe hydration?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: 32, maxWidth: 560, marginInline: 'auto' }}>
          Order now for doorstep delivery across Nairobi, Machakos, and Makueni. Big, tappable buttons on mobile—built for how Kenyans shop today.
        </p>
        <button type="button" onClick={() => navigate('/shop')} className="btn btn-lg">
          Order Now
        </button>
      </section>

      <footer>
        <p>&copy; 2026 CrystalDrops. Pure water. Safe delivery.</p>
      </footer>

      <style>{`
        .wa-float {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #25d366;
          color: #fff;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          z-index: 900;
        }
        .wa-float:hover { filter: brightness(1.05); }
        @media (max-width: 768px) {
          .wa-float { width: 52px; height: 52px; bottom: 20px; right: 20px; }
        }
      `}</style>
    </>
  );
}
