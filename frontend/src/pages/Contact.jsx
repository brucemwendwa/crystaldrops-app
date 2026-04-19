import React, { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 12,
  border: '1px solid var(--glass-border)',
  background: 'var(--surface)',
  color: 'var(--text-color)',
  fontFamily: 'Inter, sans-serif',
  fontSize: '1rem'
};

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 3) next.name = 'Enter your full name (at least 3 characters).';
    const email = form.email.trim();
    if (!email) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!form.message.trim() || form.message.trim().length < 10) next.message = 'Message must be at least 10 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <div className="container" style={{ marginTop: 24, maxWidth: 1000 }}>
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 8, fontSize: '2rem' }}>
        Contact <span>us</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 40, maxWidth: 560 }}>
        Questions about purity, delivery zones, or corporate accounts? Reach out—we respond quickly on phone and WhatsApp.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Direct lines</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--glass-bg)', padding: 20, borderRadius: 16, border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ background: 'rgba(2, 132, 199, 0.12)', padding: 14, borderRadius: '50%', color: 'var(--primary)' }}>
                <Phone size={24} aria-hidden />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Phone / WhatsApp</h3>
                <p style={{ color: 'var(--text-color)', fontWeight: 700 }}>+254 700 000000</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--glass-bg)', padding: 20, borderRadius: 16, border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ background: 'rgba(2, 132, 199, 0.12)', padding: 14, borderRadius: '50%', color: 'var(--primary)' }}>
                <Mail size={24} aria-hidden />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Email</h3>
                <p style={{ color: 'var(--text-color)', fontWeight: 700 }}>support@crystaldrops.co.ke</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--glass-bg)', padding: 20, borderRadius: 16, border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ background: 'rgba(2, 132, 199, 0.12)', padding: 14, borderRadius: '50%', color: 'var(--primary)' }}>
                <MapPin size={24} aria-hidden />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Location</h3>
                <p style={{ color: 'var(--text-color)', fontWeight: 700 }}>Westlands, Nairobi, Kenya</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: 32, boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 20 }}>Send a message</h2>

          {sent ? (
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>Thanks—we will get back to you shortly.</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!validate()) return;
                setSent(true);
              }}
            >
              <div className="form-group">
                <label htmlFor="c-name">Full name</label>
                <input
                  id="c-name"
                  type="text"
                  placeholder="Emily Ndanu"
                  required
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <div style={{ marginTop: 8, color: '#dc2626', fontSize: '0.9rem' }}>{errors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="c-email">Email</label>
                <input
                  id="c-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  style={inputStyle}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <div style={{ marginTop: 8, color: '#dc2626', fontSize: '0.9rem' }}>{errors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="c-msg">Message</label>
                <textarea
                  id="c-msg"
                  placeholder="How can we help?"
                  required
                  style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && <div style={{ marginTop: 8, color: '#dc2626', fontSize: '0.9rem' }}>{errors.message}</div>}
              </div>

              <button type="submit" className="btn btn-lg" style={{ width: '100%', marginTop: 8 }}>
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
