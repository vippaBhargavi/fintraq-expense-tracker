import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];
const isMobile = window.innerWidth <= 768;

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', currency: 'USD' });
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.name, form.email, form.password, form.currency);
        toast.success('Account created!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)'
    }}>
      {/* Left panel - Login form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '24px 20px' : '40px'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Logo */}
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#000',
              margin: '0 auto 14px'
            }}>₿</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Fintraq</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
            </p>
          </div>

          {/* Toggle */}
          <div className="toggle-group" style={{ marginBottom: 28 }}>
            <button
              className={`toggle-btn ${mode === 'login' ? 'active-income' : ''}`}
              onClick={() => setMode('login')}
              type="button"
            >Sign In</button>
            <button
              className={`toggle-btn ${mode === 'register' ? 'active-income' : ''}`}
              onClick={() => setMode('register')}
              type="button"
            >Register</button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="John Smith"
                  value={form.name}
                  onChange={set('name')}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
              />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-select" value={form.currency} onChange={set('currency')}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>

      {/* Right panel - hidden on mobile */}
      {!isMobile && (
        <div style={{
          width: 460,
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: 320 }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>📊</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
              Take control of your finances
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
              Track income and expenses, set budgets, and visualize where your money goes every month.
            </p>
            {['Track every transaction', 'Set category budgets', 'Visual spending charts', 'Monthly summaries'].map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 12, textAlign: 'left',
                color: 'var(--text-secondary)', fontSize: 14
              }}>
                <div style={{
                  width: 20, height: 20,
                  background: 'var(--accent-glow)',
                  border: '1px solid var(--accent)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: 'var(--accent)', flexShrink: 0
                }}>✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}