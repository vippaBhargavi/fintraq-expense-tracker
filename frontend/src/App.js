import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import BudgetsPage from './pages/BudgetsPage';
import Sidebar from './components/Sidebar';
import './App.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading your finances...</p>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'expenses' && <ExpensesPage />}
        {activePage === 'budgets' && <BudgetsPage />}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e2a3a',
            color: '#e2e8f0',
            border: '1px solid #2d3f55',
            borderRadius: '10px',
            fontSize: '14px'
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1e2a3a' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1e2a3a' } }
        }}
      />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
