
import React, { useState, useEffect, useCallback } from 'react';
import { View, AppData, Expense, Member, UserAccount } from './types';
import { INITIAL_DATA } from './constants';
import Home from './components/Home';
import AddExpense from './components/AddExpense';
import HouseholdManagement from './components/HouseholdManagement';
import ExportData from './components/ExportData';
import Stats from './components/Stats';
import Transactions from './components/Transactions';
import Auth from './components/Auth';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [view, setView] = useState<View>('auth');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [initialized, setInitialized] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  useEffect(() => {
    const savedSession = localStorage.getItem('financas_pro_session');
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        setCurrentUser(user);
        const userData = localStorage.getItem(`fin_data_${user.email}`);
        if (userData) setData(JSON.parse(userData));
      } catch (e) { console.error(e); }
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized && currentUser) {
      localStorage.setItem(`fin_data_${currentUser.email}`, JSON.stringify(data));
    }
  }, [data, initialized, currentUser]);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('financas_pro_session', JSON.stringify(user));
    const userData = localStorage.getItem(`fin_data_${user.email}`);
    if (userData) setData(JSON.parse(userData));
    else setData({ ...INITIAL_DATA, user, expenses: [], balance: 0 });
    setView('home');
  };

  const saveExpense = (expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense = { ...expenseData, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
    setData(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      balance: prev.balance - newExpense.amount,
      sources: prev.sources.includes(expenseData.source) ? prev.sources : [...prev.sources, expenseData.source]
    }));
    setView('home');
  };

  const renderView = () => {
    if (view === 'auth') return <Auth onLogin={handleLogin} />;
    switch (view) {
      case 'home': return <Home data={data} setView={setView} onLogout={() => setView('auth')} onEdit={()=>{}} onDelete={()=>{}} onUpdateUser={()=>{}} deferredPrompt={null} setDeferredPrompt={()=>{}} />;
      case 'add-expense': return <AddExpense sources={data.sources} members={data.members} onSave={saveExpense} onBack={() => setView('home')} />;
      case 'household': return <HouseholdManagement members={data.members} onUpdate={(m) => setData(prev => ({ ...prev, members: m }))} onBack={() => setView('home')} />;
      case 'export': return <ExportData expenses={data.expenses} members={data.members} onBack={() => setView('home')} />;
      case 'stats': return <Stats expenses={data.expenses} members={data.members} onBack={() => setView('home')} />;
      case 'transactions': return <Transactions expenses={data.expenses} members={data.members} onBack={() => setView('home')} onEdit={()=>{}} onDelete={()=>{}} />;
      case 'settings': return <Settings user={data.user} onUpdateUser={()=>{}} onBack={() => setView('home')} />;
      default: return <Home data={data} setView={setView} onLogout={() => setView('auth')} onEdit={()=>{}} onDelete={()=>{}} onUpdateUser={()=>{}} deferredPrompt={null} setDeferredPrompt={()=>{}} />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-bg-dark overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden relative">{renderView()}</div>
      {view !== 'auth' && (
        <nav className="shrink-0 bg-bg-dark border-t border-white/5 flex justify-around items-center z-[999] relative min-h-[70px]">
          <button onClick={() => setView('home')} className={`flex-1 py-4 flex flex-col items-center btn-active ${view === 'home' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="material-symbols-outlined text-3xl">home</span>
            <span className="text-[10px] font-bold">INÍCIO</span>
          </button>
          <button onClick={() => setView('transactions')} className={`flex-1 py-4 flex flex-col items-center btn-active ${view === 'transactions' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="material-symbols-outlined text-3xl">receipt_long</span>
            <span className="text-[10px] font-bold">EXTRATO</span>
          </button>
          <button onClick={() => setView('stats')} className={`flex-1 py-4 flex flex-col items-center btn-active ${view === 'stats' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="material-symbols-outlined text-3xl">monitoring</span>
            <span className="text-[10px] font-bold">GRÁFICO</span>
          </button>
          <button onClick={() => setView('household')} className={`flex-1 py-4 flex flex-col items-center btn-active ${view === 'household' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="material-symbols-outlined text-3xl">group</span>
            <span className="text-[10px] font-bold">AGREGADO</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
