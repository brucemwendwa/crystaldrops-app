import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../api';
import { formatApiError } from '../utils/apiError';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const data = await login(email, password);
        if (!data?.token) {
          setError('Invalid response from server (no token). Check the API and try again.');
          return;
        }
        localStorage.setItem('token', data.token);
        if (data.isAdmin) localStorage.setItem('isAdmin', 'true');
        navigate(data.isAdmin ? '/admin' : '/dashboard');
      } else {
        const data = await signup(email, password);
        if (!data?.token) {
          setError('Invalid response from server (no token). Is /api proxied to the backend?');
          return;
        }
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="form-container" style={{ width: '100%' }}>
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p style={{ color: '#94A3B8', marginBottom: '30px' }}>
          {isLogin ? 'Sign in to manage your water orders.' : 'Sign up to order Crystal Drops.'}
        </p>

        {error && <div style={{ color: '#ef4444', marginBottom: '20px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: '20px', color: '#94A3B8' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: '#00D4FF', cursor: 'pointer', fontWeight: '500' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}
