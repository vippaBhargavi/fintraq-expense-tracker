import React from 'react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'expenses', label: 'Transactions', icon: '⇄' },
  { id: 'budgets', label: 'Budgets', icon: '◎' },
];

export default function Sidebar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '0',
      zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#000'
          }}>₿</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Fintraq</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>expense tracker</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '11px 12px',
              border: 'none', borderRadius: 9,
              background: activePage === item.id ? 'var(--accent-glow)' : 'transparent',
              color: activePage === item.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 14, fontWeight: activePage === item.id ? 600 : 400,
              cursor: 'pointer', textAlign: 'left',
              marginBottom: 2, transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
            {activePage === item.id && (
              <div style={{
                marginLeft: 'auto', width: 4, height: 4,
                background: 'var(--accent)', borderRadius: '50%'
              }} />
            )}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{
        padding: '16px 10px',
        borderTop: '1px solid var(--border)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px',
          borderRadius: 10,
          background: 'var(--bg-card)'
        }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.currency}</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: 14, padding: '4px',
              borderRadius: 5
            }}
          >→</button>
        </div>
      </div>
    </aside>
  );
}
