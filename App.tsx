
import React, { useState, useEffect, useCallback } from 'react';
import { View, AppData, Expense, Member, UserAccount } from './types';
import { INITIAL_DATA } from './constants';
import Home from './components/Home';
import AddExpense from './components/AddExpense';
import HouseholdManagement from './components/HouseholdManagement';
import ExportData from './components/ExportData';
import PermissionScreen from './components/PermissionScreen';
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
    const hasPermission = localStorage.getItem('financas_pro_permission') === 'granted';
    
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        setCurrentUser(user);
        
        const userData = localStorage.getItem(`financas_pro_data_${user.email}`);
        if (userData) {
          setData(JSON.parse(userData));
          setView(hasPermission ? 'home' : 'permission');
        } else {
          const newData = { ...INITIAL_DATA, user };
          setData(newData);
          localStorage.setItem(`financas_pro_data_${user.email}`, JSON.stringify(newData));
          setView('permission');
        }
      } catch (e) {
        setView('auth');
      }
    } else {
      setView('auth');
    }
    setInitialized(true);
  }, []);

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
      const newData = { ...INITIAL_DATA, user, expenses: [], balance: 0 };
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

  const handleUpdateUser = useCallback((updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('financas_pro_session', JSON.stringify(updatedUser));
    setData(prev => ({ ...prev, user: updatedUser }));
    
    const storedUsers = JSON.parse(localStorage.getItem('financas_pro_users') || '[]');
    const updatedUsers = storedUsers.map((u: any) => 
      u.email === updatedUser.email ? { ...u, ...updatedUser } : u
    );
    localStorage.setItem('financas_pro_users', JSON.stringify(updatedUsers));
  }, []);

  const grantPermission = useCallback(() => {
    localStorage.setItem('financas_pro_permission', 'granted');
    setView('home');
  }, []);

  const saveExpense = useCallback((expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    if (editingExpense) {
      setData(prev => {
        const oldAmount = prev.expenses.find(e => e.id === editingExpense.id)?.amount || 0;
        const newExpenses = prev.expenses.map(e => 
          e.id === editingExpense.id ? { ...expenseData, id: e.id, timestamp: e.timestamp } : e
        );
        return {
          ...prev,
          expenses: newExpenses,
          balance: prev.balance + oldAmount - expenseData.amount,
          sources: prev.sources.includes(expenseData.source) ? prev.sources : [...prev.sources, expenseData.source]
        };
      });
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      };
      setData(prev => ({
        ...prev,
        expenses: [newExpense, ...prev.expenses],
        balance: prev.balance - newExpense.amount,
        sources: prev.sources.includes(expenseData.source) ? prev.sources : [...prev.sources, expenseData.source]
      }));
    }
    setEditingExpense(undefined);
    setView('home');
  }, [editingExpense]);

  const deleteExpense = useCallback((id: string) => {
    if (confirm("Tem certeza que deseja eliminar esta despesa?")) {
      setData(prev => {
        const amount = prev.expenses.find(e => e.id === id)?.amount || 0;
        return {
          ...prev,
          expenses: prev.expenses.filter(e => e.id !== id),
          balance: prev.balance + amount
        };
      });
    }
  }, []);

  const updateMembers = useCallback((members: Member[]) => {
    setData(prev => ({ ...prev, members }));
  }, []);

  const startEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setView('add-expense');
  };

  const renderView = () => {
    if (view === 'auth') return <Auth onLogin={handleLogin} />;
    
    switch (view) {
      case 'permission': return <PermissionScreen onGrant={grantPermission} />;
      case 'home': return <Home data={data} setView={setView} onLogout={handleLogout} onEdit={startEditExpense} onDelete={deleteExpense} onUpdateUser={handleUpdateUser} />;
      case 'add-expense': return (
        <AddExpense 
          sources={data.sources} 
          members={data.members} 
          onSave={saveExpense} 
          onBack={() => { setView('home'); setEditingExpense(undefined); }} 
          editingExpense={editingExpense}
        />
      );
      case 'household': return <HouseholdManagement members={data.members} onUpdate={updateMembers} onBack={() => setView('home')} />;
      case 'export': return <ExportData expenses={data.expenses} members={data.members} onBack={() => setView('home')} />;
      case 'stats': return <Stats expenses={data.expenses} members={data.members} onBack={() => setView('home')} />;
      case 'transactions': return <Transactions expenses={data.expenses} members={data.members} onBack={() => setView('home')} onEdit={startEditExpense} onDelete={deleteExpense} />;
      case 'settings': return <Settings user={data.user} onUpdateUser={handleUpdateUser} onBack={() => setView('home')} />;
      default: return <Home data={data} setView={setView} onLogout={handleLogout} onEdit={startEditExpense} onDelete={deleteExpense} onUpdateUser={handleUpdateUser} />;
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
