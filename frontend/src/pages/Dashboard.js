import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth, API } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b',
  'Transportation': '#3b82f6',
  'Housing': '#8b5cf6',
  'Utilities': '#06b6d4',
  'Entertainment': '#ec4899',
  'Healthcare': '#10b981',
  'Shopping': '#f97316',
  'Education': '#6366f1',
  'Travel': '#14b8a6',
  'Personal Care': '#e879f9',
  'Savings': '#34d399',
  'Investment': '#60a5fa',
  'Other': '#94a3b8'
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmt = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, expRes] = await Promise.all([
        API.get(`/expenses/summary?month=${month}&year=${year}`),
        API.get('/expenses?limit=5&sort=-date')
      ]);
      setSummary(sumRes.data.summary);

      // Process trend data
      const raw = sumRes.data.trend;
      const monthMap = {};
      raw.forEach(d => {
        const key = `${d._id.year}-${d._id.month}`;
        if (!monthMap[key]) monthMap[key] = { month: MONTHS[d._id.month - 1], income: 0, expense: 0 };
        if (d._id.type === 'income') monthMap[key].income = d.total;
        else monthMap[key].expense = d.total;
      });
      setTrend(Object.values(monthMap));
      setRecentExpenses(expRes.data.expenses);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const pieData = summary ? Object.entries(summary.categoryBreakdown || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) : [];

  const currency = user?.currency || 'USD';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your financial overview for {MONTHS[month - 1]} {year}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            className="form-select"
            style={{ width: 120 }}
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select
            className="form-select"
            style={{ width: 90 }}
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {[2022, 2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <span style={{ fontSize: 18 }}>↑</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--income)' }}>
            {fmt(summary?.totalIncome || 0, currency)}
          </div>
          <div className="stat-label">Total Income</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <span style={{ fontSize: 18 }}>↓</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--expense)' }}>
            {fmt(summary?.totalExpense || 0, currency)}
          </div>
          <div className="stat-label">Total Expenses</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: (summary?.balance >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)') }}>
            <span style={{ fontSize: 18 }}>◈</span>
          </div>
          <div className="stat-value" style={{ color: summary?.balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>
            {fmt(summary?.balance || 0, currency)}
          </div>
          <div className="stat-label">Net Balance</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Bar chart */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>6-Month Trend</h3>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: '#7fa3c7', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#7fa3c7', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1a2738', border: '1px solid #2a3f58', borderRadius: 8, fontSize: 13 }}
                  formatter={(v) => fmt(v, currency)}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
                <Legend wrapperStyle={{ fontSize: 12, color: '#7fa3c7' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No trend data yet
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Spending by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a2738', border: '1px solid #2a3f58', borderRadius: 8, fontSize: 13 }}
                  formatter={(v) => fmt(v, currency)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No expense data yet
            </div>
          )}
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {pieData.slice(0, 6).map((entry, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[entry.name] || '#94a3b8' }} />
                {entry.name.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Recent Transactions</h3>
        {recentExpenses.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map(exp => (
                  <tr key={exp._id}>
                    <td style={{ fontWeight: 500 }}>{exp.title}</td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{exp.category}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`mono badge badge-${exp.type}`}>
                        {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount, currency)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            No transactions yet. Add your first one!
          </div>
        )}
      </div>
    </div>
  );
}
