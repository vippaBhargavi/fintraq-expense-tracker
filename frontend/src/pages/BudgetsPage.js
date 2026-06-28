import React, { useState, useEffect } from 'react';
import { useAuth, API } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const BUDGET_CATEGORIES = [
  'Food & Dining','Transportation','Housing','Utilities',
  'Entertainment','Healthcare','Shopping','Education',
  'Travel','Personal Care','Other'
];

const fmt = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

function BudgetModal({ onClose, onSaved, currency, month, year }) {
  const [form, setForm] = useState({ category: 'Food & Dining', amount: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/budgets', { ...form, month, year });
      toast.success('Budget saved!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <h2 className="modal-title">Set Budget</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          For {MONTHS[month - 1]} {year}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {BUDGET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Budget Amount ({currency})</label>
            <input
              className="form-input mono"
              type="number" min="0" step="1" placeholder="0"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/budgets?month=${month}&year=${year}`);
      setBudgets(data.budgets);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, [month, year]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this budget?')) return;
    try {
      await API.delete(`/budgets/${id}`);
      toast.success('Budget removed');
      fetchBudgets();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set spending limits by category</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-select" style={{ width: 100 }} value={month} onChange={e => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-select" style={{ width: 90 }} value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Set Budget</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
            <span style={{ fontSize: 18 }}>◎</span>
          </div>
          <div className="stat-value" style={{ color: '#818cf8' }}>{fmt(totalBudget, currency)}</div>
          <div className="stat-label">Total Budgeted</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: totalSpent > totalBudget ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)' }}>
            <span style={{ fontSize: 18 }}>◈</span>
          </div>
          <div className="stat-value" style={{ color: totalSpent > totalBudget ? 'var(--expense)' : 'var(--income)' }}>
            {fmt(totalSpent, currency)}
          </div>
          <div className="stat-label">Total Spent ({totalBudget > 0 ? Math.round(totalSpent / totalBudget * 100) : 0}%)</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="loading-spinner" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
          No budgets set for {MONTHS[month - 1]} {year}.
          <br />
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
            Set your first budget
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {budgets.map(b => {
            const pct = b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0;
            const over = b.spent > b.amount;
            return (
              <div key={b._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{b.category}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span className="mono">{fmt(b.spent, currency)}</span>
                      {' '}spent of{' '}
                      <span className="mono">{fmt(b.amount, currency)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mono" style={{
                      fontWeight: 600,
                      color: over ? 'var(--expense)' : pct > 80 ? 'var(--warning)' : 'var(--income)',
                      fontSize: 15
                    }}>
                      {Math.round(pct)}%
                    </span>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}>Remove</button>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: over
                        ? 'var(--expense)'
                        : pct > 80
                        ? 'var(--warning)'
                        : 'var(--accent)'
                    }}
                  />
                </div>
                {over && (
                  <div style={{ fontSize: 12, color: 'var(--expense)', marginTop: 6 }}>
                    ⚠ Over budget by {fmt(b.spent - b.amount, currency)}
                  </div>
                )}
                {!over && b.remaining > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    {fmt(b.remaining, currency)} remaining
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <BudgetModal
          currency={currency}
          month={month}
          year={year}
          onClose={() => setShowModal(false)}
          onSaved={fetchBudgets}
        />
      )}
    </div>
  );
}
