import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, API } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES_EXPENSE = [
  'Food & Dining','Transportation','Housing','Utilities',
  'Entertainment','Healthcare','Shopping','Education',
  'Travel','Personal Care','Other'
];
const CATEGORIES_INCOME = ['Salary','Freelance','Business','Investment','Other'];

const fmt = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

function ExpenseModal({ expense, onClose, onSaved, currency }) {
  const [form, setForm] = useState(expense || {
    title: '', amount: '', type: 'expense',
    category: 'Food & Dining', date: new Date().toISOString().split('T')[0], notes: ''
  });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm(f => {
      const updated = { ...f, [field]: e.target.value };
      if (field === 'type') updated.category = e.target.value === 'income' ? 'Salary' : 'Food & Dining';
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (expense?._id) {
        await API.put(`/expenses/${expense._id}`, form);
        toast.success('Transaction updated');
      } else {
        await API.post('/expenses', form);
        toast.success('Transaction added');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const categories = form.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{expense?._id ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="toggle-group">
          <button
            type="button"
            className={`toggle-btn ${form.type === 'expense' ? 'active-expense' : ''}`}
            onClick={() => setForm(f => ({ ...f, type: 'expense', category: 'Food & Dining' }))}
          >Expense</button>
          <button
            type="button"
            className={`toggle-btn ${form.type === 'income' ? 'active-income' : ''}`}
            onClick={() => setForm(f => ({ ...f, type: 'income', category: 'Salary' }))}
          >Income</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="e.g. Grocery shopping" value={form.title} onChange={set('title')} required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Amount ({currency})</label>
              <input className="form-input mono" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={set('amount')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date?.split('T')[0]} onChange={set('date')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={set('category')}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-textarea" rows={2} placeholder="Any notes..." value={form.notes} onChange={set('notes')} style={{ resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Saving...' : expense?._id ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 20, page, sort: '-date', ...filters });
      Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
      const { data } = await API.get(`/expenses?${params}`);
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await API.delete(`/expenses/${id}`);
      toast.success('Deleted');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const setFilter = (k) => (e) => {
    setFilters(f => ({ ...f, [k]: e.target.value }));
    setPage(1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{total} total records</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">Type</label>
            <select className="form-select" style={{ width: 130 }} value={filters.type} onChange={setFilter('type')}>
              <option value="">All</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">Category</label>
            <select className="form-select" style={{ width: 170 }} value={filters.category} onChange={setFilter('category')}>
              <option value="">All Categories</option>
              {[...CATEGORIES_EXPENSE, ...CATEGORIES_INCOME].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">From</label>
            <input className="form-input" type="date" style={{ width: 150 }} value={filters.startDate} onChange={setFilter('startDate')} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">To</label>
            <input className="form-input" type="date" style={{ width: 150 }} value={filters.endDate} onChange={setFilter('endDate')} />
          </div>
          {(filters.type || filters.category || filters.startDate || filters.endDate) && (
            <button
              className="btn btn-outline btn-sm"
              style={{ marginBottom: 0, alignSelf: 'flex-end' }}
              onClick={() => { setFilters({ type: '', category: '', startDate: '', endDate: '' }); setPage(1); }}
            >Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="loading-spinner" />
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
            No transactions found.
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{exp.title}</div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 12, padding: '3px 8px',
                          background: 'var(--bg-secondary)',
                          borderRadius: 6, color: 'var(--text-secondary)'
                        }}>{exp.category}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exp.notes || '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`mono badge badge-${exp.type}`}>
                          {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount, currency)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => { setEditing(exp); setShowModal(true); }}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exp._id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <button className="btn btn-outline btn-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <ExpenseModal
          expense={editing}
          currency={currency}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={fetchExpenses}
        />
      )}
    </div>
  );
}
