
import React, { useState, useEffect, useCallback } from 'react';
import { View, AppData, Expense, Member, UserAccount } from './types.ts';
import { INITIAL_DATA } from './constants.tsx';
import Home from './components/Home.tsx';
import AddExpense from './components/AddExpense.tsx';
import HouseholdManagement from './components/HouseholdManagement.tsx';
import ExportData from './components/ExportData.tsx';
import PermissionScreen from './components/PermissionScreen.tsx';
import Stats from './components/Stats.tsx';
import Transactions from './components/Transactions.tsx';
import Auth from './components/Auth.tsx';

const App: React.FC = () => {
  const [view, setView] = useState<View>('permission');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [initialized, setInitialized] = useState(false);

  // Load persistence logic
  useEffect(() => {
    const hasPermission = localStorage.getItem('financas_pro_permission') === 'granted';
    const savedUser = localStorage.getItem('financas_pro_session');
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        const userData = localStorage.getItem(`financas_pro_data_${user.email}`);
        if (userData) {
          setData(JSON.parse(userData));
        }
        setView(hasPermission ? 'home' : 'permission');
      } catch (e) {
        console.error("Erro ao carregar sessão:", e);
        setView('auth');
      }
    } else {
      setView('auth');
    }
    setInitialized(true);
  }, []);

  // Sync data to "JSON" (localStorage)
  useEffect(() => {
    if (initialized && currentUser) {
      localStorage.setItem(`financas_pro_data_${currentUser.email}`, JSON.stringify(data));
    }
  }, [data, initialized, currentUser]);

  const handleLogin = useCallback((user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('financas_pro_session', JSON.stringify(user));
    const userData = localStorage.getItem(`financas_pro_data_${user.email}`);
    if (userData) {
      setData(JSON.parse(userData));
    } else {
      const newData = { ...INITIAL_DATA, user };
      setData(newData);
      localStorage.setItem(`financas_pro_data_${user.email}`, JSON.stringify(newData));
    }
    const hasPermission = localStorage.getItem('financas_pro_permission') === 'granted';
    setView(hasPermission ? 'home' : 'permission');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('financas_pro_session');
    setCurrentUser(null);
    setView('auth');
  }, []);

  const grantPermission = useCallback(() => {
    localStorage.setItem('financas_pro_permission', 'granted');
    setView('home');
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setData(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      balance: prev.balance - newExpense.amount,
      sources: prev.sources.includes(expense.source) ? prev.sources : [...prev.sources, expense.source]
    }));
    setView('home');
  }, []);

  const updateMembers = useCallback((members: Member[]) => {
    setData(prev => ({ ...prev, members }));
  }, []);

  const renderView = () => {
    if (view === 'auth') return <Auth onLogin={handleLogin} />;
    
    switch (view) {
      case 'permission': return <PermissionScreen onGrant={grantPermission} />;
      case 'home': return <Home data={data} setView={setView} onLogout={handleLogout} />;
      case 'add-expense': return <AddExpense sources={data.sources} members={data.members} onSave={addExpense} onBack={() => setView('home')} />;
      case 'household': return <HouseholdManagement members={data.members} onUpdate={updateMembers} onBack={() => setView('home')} />;
      case 'export': return <ExportData expenses={data.expenses} members={data.members} onBack={() => setView('home')} />;
      case 'stats': return <Stats expenses={data.expenses} members={data.members} onBack={() => setView('home')} />;
      case 'transactions': return <Transactions expenses={data.expenses} members={data.members} onBack={() => setView('home')} />;
      default: return <Home data={data} setView={setView} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen relative bg-bg-dark overflow-hidden font-sans border-x border-white/5 flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        {renderView()}
      </div>
      
      {view !== 'permission' && view !== 'add-expense' && view !== 'auth' && (
        <nav className="shrink-0 bg-bg-dark/95 backdrop-blur-xl border-t border-white/5 pb-8 pt-3 z-50">
          <div className="flex justify-around items-center px-4">
            <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'home' ? 'text-primary' : 'text-gray-500'}`}>
              <span className={`material-symbols-outlined text-[28px] ${view === 'home' ? 'fill-1' : ''}`}>home</span>
              <span className="text-[10px] font-semibold">Início</span>
            </button>
            <button onClick={() => setView('transactions')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'transactions' ? 'text-primary' : 'text-gray-500'}`}>
              <span className={`material-symbols-outlined text-[28px] ${view === 'transactions' ? 'fill-1' : ''}`}>receipt_long</span>
              <span className="text-[10px] font-semibold">Extrato</span>
            </button>
            <button onClick={() => setView('stats')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'stats' ? 'text-primary' : 'text-gray-500'}`}>
              <span className={`material-symbols-outlined text-[28px] ${view === 'stats' ? 'fill-1' : ''}`}>analytics</span>
              <span className="text-[10px] font-semibold">Gráficos</span>
            </button>
            <button onClick={() => setView('household')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'household' ? 'text-primary' : 'text-gray-500'}`}>
              <span className={`material-symbols-outlined text-[28px] ${view === 'household' ? 'fill-1' : ''}`}>group</span>
              <span className="text-[10px] font-semibold">Agregado</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
