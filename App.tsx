
import React, { useState, useEffect, useCallback } from 'react';
import { View, AppData, Expense, Member } from './types';
import { INITIAL_DATA } from './constants';
import Home from './components/Home';
import AddExpense from './components/AddExpense';
import HouseholdManagement from './components/HouseholdManagement';
import ExportData from './components/ExportData';
import PermissionScreen from './components/PermissionScreen';

const App: React.FC = () => {
  const [view, setView] = useState<View>('permission');
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [initialized, setInitialized] = useState(false);

  // Load data from "JSON file" (Simulated with localStorage for web environment)
  useEffect(() => {
    const savedData = localStorage.getItem('financas_pro_data');
    const hasPermission = localStorage.getItem('financas_pro_permission') === 'granted';
    
    if (savedData) {
      setData(JSON.parse(savedData));
    }

    if (hasPermission) {
      setView('home');
    }
    setInitialized(true);
  }, []);

  // Save data to "JSON file" whenever it changes
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('financas_pro_data', JSON.stringify(data));
    }
  }, [data, initialized]);

  const grantPermission = () => {
    localStorage.setItem('financas_pro_permission', 'granted');
    setView('home');
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setData(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      balance: prev.balance - newExpense.amount,
      // If the source is new, add it
      sources: prev.sources.includes(expense.source) ? prev.sources : [...prev.sources, expense.source]
    }));
    setView('home');
  };

  const updateMembers = (members: Member[]) => {
    setData(prev => ({ ...prev, members }));
  };

  const renderView = () => {
    switch (view) {
      case 'permission':
        return <PermissionScreen onGrant={grantPermission} />;
      case 'home':
        return <Home data={data} setView={setView} />;
      case 'add-expense':
        return <AddExpense 
                  sources={data.sources} 
                  members={data.members} 
                  onSave={addExpense} 
                  onBack={() => setView('home')} 
                />;
      case 'household':
        return <HouseholdManagement 
                  members={data.members} 
                  onUpdate={updateMembers} 
                  onBack={() => setView('home')} 
                />;
      case 'export':
        return <ExportData 
                  expenses={data.expenses} 
                  members={data.members} 
                  onBack={() => setView('home')} 
                />;
      default:
        return <Home data={data} setView={setView} />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen relative bg-bg-dark overflow-hidden font-sans">
      {renderView()}
      
      {/* Tab Bar */}
      {view !== 'permission' && view !== 'add-expense' && (
        <nav className="absolute bottom-0 left-0 w-full bg-bg-dark/90 backdrop-blur-md border-t border-white/5 pb-6 pt-2 z-50">
          <div className="flex justify-around items-center px-2">
            <button 
              onClick={() => setView('home')}
              className={`flex flex-col items-center gap-1 p-2 ${view === 'home' ? 'text-primary' : 'text-gray-500'}`}
            >
              <span className={`material-symbols-outlined ${view === 'home' ? 'fill-1' : ''}`}>home</span>
              <span className="text-[10px] font-medium">Início</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 p-2 text-gray-500 opacity-50"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              <span className="text-[10px] font-medium">Transações</span>
            </button>
            <button 
              onClick={() => setView('household')}
              className={`flex flex-col items-center gap-1 p-2 ${view === 'household' ? 'text-primary' : 'text-gray-500'}`}
            >
              <span className={`material-symbols-outlined ${view === 'household' ? 'fill-1' : ''}`}>group</span>
              <span className="text-[10px] font-medium">Agregado</span>
            </button>
            <button 
              onClick={() => setView('export')}
              className={`flex flex-col items-center gap-1 p-2 ${view === 'export' ? 'text-primary' : 'text-gray-500'}`}
            >
              <span className={`material-symbols-outlined ${view === 'export' ? 'fill-1' : ''}`}>bar_chart</span>
              <span className="text-[10px] font-medium">Relatórios</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
