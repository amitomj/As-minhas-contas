
import React, { useState, useEffect } from 'react';
import { View, AppData, Expense, Member, UserAccount, Project } from './types';
import { INITIAL_DATA } from './constants';
import Home from './components/Home';
import AddExpense from './components/AddExpense';
import HouseholdManagement from './components/HouseholdManagement';
import ExportData from './components/ExportData';
import Stats from './components/Stats';
import Transactions from './components/Transactions';
import Auth from './components/Auth';
import Settings from './components/Settings';
import ProjectsView from './components/Projects';

const App: React.FC = () => {
  const [view, setView] = useState<View>('auth');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [initialized, setInitialized] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [preSelectedProjectId, setPreSelectedProjectId] = useState<string | undefined>(undefined);
  const [fileHandle, setFileHandle] = useState<any>(null);

  const handlePCFileAccess = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'Finanças Pro JSON', accept: { 'application/json': ['.json'] } }],
          multiple: false
        });
        setFileHandle(handle);
        const file = await handle.getFile();
        const content = await file.text();
        const parsed = JSON.parse(content);
        if (parsed.expenses) setData(parsed);
        alert("Ficheiro sincronizado com sucesso!");
      }
    } catch (e) { console.log("Acesso ao ficheiro cancelado."); }
  };

  useEffect(() => {
    const savedSession = localStorage.getItem('financas_pro_session');
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        setCurrentUser(user);
        const userDataStr = localStorage.getItem(`fin_data_${user.email}`);
        if (userDataStr) {
          let userData: AppData = JSON.parse(userDataStr);
          const currentMonth = new Date().toISOString().slice(0, 7);
          if (userData.lastResetMonth !== currentMonth) {
            userData = { ...userData, balance: 0, expenses: [], lastResetMonth: currentMonth };
          }
          setData(userData);
        }
      } catch (e) { console.error(e); }
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized && currentUser) {
      localStorage.setItem(`fin_data_${currentUser.email}`, JSON.stringify(data));
      if (fileHandle) {
        (async () => {
          const writable = await fileHandle.createWritable();
          await writable.write(JSON.stringify(data, null, 2));
          await writable.close();
        })();
      }
    }
  }, [data, initialized, currentUser, fileHandle]);

  const saveExpense = (expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    setData(prev => {
      let newExpenses;
      let balanceAdjustment = 0;
      if (editingExpense) {
        newExpenses = prev.expenses.map(e => {
          if (e.id === editingExpense.id) {
            balanceAdjustment = editingExpense.amount - expenseData.amount;
            return { ...expenseData, id: e.id, timestamp: e.timestamp };
          }
          return e;
        });
      } else {
        const newExp = { ...expenseData, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
        newExpenses = [newExp, ...prev.expenses];
        balanceAdjustment = -expenseData.amount;
      }
      return { ...prev, expenses: newExpenses, balance: prev.balance + balanceAdjustment };
    });
    setEditingExpense(undefined);
    setPreSelectedProjectId(undefined);
    setView('home');
  };

  const deleteExpense = (id: string) => {
    setData(prev => {
      const exp = prev.expenses.find(e => e.id === id);
      return { ...prev, expenses: prev.expenses.filter(e => e.id !== id), balance: prev.balance + (exp?.amount || 0) };
    });
  };

  const deleteCategory = (name: string, type: 'source' | 'method') => {
    const field = type === 'source' ? 'source' : 'paymentMethod';
    const related = data.expenses.filter(e => e[field] === name);
    if (related.length > 0) {
      if (confirm(`Existem ${related.length} despesas associadas. Quer reatribuir a "Outros"?`)) {
        setData(prev => ({
          ...prev,
          [type === 'source' ? 'sources' : 'paymentMethods']: prev[type === 'source' ? 'sources' : 'paymentMethods'].filter(x => x !== name),
          expenses: prev.expenses.map(e => e[field] === name ? { ...e, [field]: 'Outros' } : e)
        }));
      }
    } else {
      setData(prev => ({
        ...prev,
        [type === 'source' ? 'sources' : 'paymentMethods']: prev[type === 'source' ? 'sources' : 'paymentMethods'].filter(x => x !== name)
      }));
    }
  };

  const addProject = (name: string, description: string = '', notes: string = '') => {
    const newProject = { id: Math.random().toString(36).substr(2, 9), name, description, notes };
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
      sources: prev.sources.some(s => s.toLowerCase() === name.toLowerCase()) ? prev.sources : [...prev.sources, name]
    }));
  };

  const deleteProject = (id: string) => {
    const related = data.expenses.filter(e => e.projectId === id);
    if (related.length > 0) {
      if (confirm(`Existem ${related.length} despesas associadas a este projeto. Quer manter as despesas na conta geral (Sim) ou apagá-las (Não)?`)) {
        setData(prev => ({
          ...prev,
          projects: prev.projects.filter(p => p.id !== id),
          expenses: prev.expenses.map(e => e.projectId === id ? { ...e, projectId: undefined } : e)
        }));
      } else if (confirm("Tem a certeza que quer apagar as despesas deste projeto?")) {
        const totalRefund = related.reduce((acc, curr) => acc + curr.amount, 0);
        setData(prev => ({
          ...prev,
          projects: prev.projects.filter(p => p.id !== id),
          expenses: prev.expenses.filter(e => e.projectId !== id),
          balance: prev.balance + totalRefund
        }));
      }
    } else {
      setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
    }
  };

  const handleLogin = (user: UserAccount) => {
    localStorage.setItem('financas_pro_session', JSON.stringify(user));
    localStorage.setItem('financas_pro_last_email', user.email);
    const userDataStr = localStorage.getItem(`fin_data_${user.email}`);
    if (userDataStr) {
      setData(JSON.parse(userDataStr));
    } else {
      setData({ ...INITIAL_DATA, user, lastResetMonth: new Date().toISOString().slice(0, 7) });
    }
    setView('home');
  };

  const updateUser = (u: UserAccount) => {
    setCurrentUser(u);
    setData(prev => ({ ...prev, user: u }));
    localStorage.setItem('financas_pro_session', JSON.stringify(u));
  };

  const renderView = () => {
    if (view === 'auth') return <Auth onLogin={(user) => { setCurrentUser(user); handleLogin(user); }} />;
    
    switch (view) {
      case 'home': return (
        <Home 
          data={data} 
          setView={setView} 
          onLogout={() => setView('auth')} 
          onEdit={(e) => { setEditingExpense(e); setView('add-expense'); }} 
          onDelete={deleteExpense} 
          onUpdateUser={updateUser} 
          onUpdateSources={(s) => setData(p => ({...p, sources: s}))}
          onDeleteSource={(s) => deleteCategory(s, 'source')}
          onUpdateMethods={(m) => setData(p => ({...p, paymentMethods: m}))}
          onDeleteMethod={(m) => deleteCategory(m, 'method')}
          onAddProject={addProject}
          onDeleteProject={deleteProject}
          onUpdateProjects={(p) => setData(prev => ({ ...prev, projects: p }))}
          deferredPrompt={null} 
          setDeferredPrompt={()=>{}} 
        />
      );
      case 'add-expense': return (
        <AddExpense 
          sources={data.sources} 
          members={data.members} 
          projects={data.projects} 
          paymentMethods={data.paymentMethods}
          onSave={saveExpense} 
          onBack={() => { setView('home'); setEditingExpense(undefined); setPreSelectedProjectId(undefined); }} 
          editingExpense={editingExpense}
          preSelectedProjectId={preSelectedProjectId}
          onUpdateSources={(s) => setData(p => ({...p, sources: s}))}
          onDeleteSource={(s) => deleteCategory(s, 'source')}
          onUpdateMethods={(m) => setData(p => ({...p, paymentMethods: m}))}
          onDeleteMethod={(m) => deleteCategory(m, 'method')}
          onAddProject={addProject}
          onUpdateProjects={(p) => setData(prev => ({ ...prev, projects: p }))}
          onDeleteProject={deleteProject}
        />
      );
      case 'household': return <HouseholdManagement members={data.members} onUpdate={(m) => setData(p => ({ ...p, members: m }))} onBack={() => setView('home')} />;
      case 'projects': return (
        <ProjectsView 
          projects={data.projects} 
          expenses={data.expenses}
          onUpdate={(p) => setData(p_prev => ({ ...p_prev, projects: p }))} 
          onDeleteProject={deleteProject}
          onBack={() => setView('home')} 
          onAddExpenseInProject={(pid) => { setPreSelectedProjectId(pid); setView('add-expense'); }}
          onEditExpense={(e) => { setEditingExpense(e); setView('add-expense'); }}
          onDeleteExpense={deleteExpense}
          members={data.members}
          onAddProject={addProject}
        />
      );
      case 'export': return <ExportData expenses={data.expenses} members={data.members} projects={data.projects} onBack={() => setView('home')} />;
      case 'stats': return <Stats expenses={data.expenses} members={data.members} onBack={() => setView('home')} />;
      case 'transactions': return <Transactions expenses={data.expenses} members={data.members} projects={data.projects} onBack={() => setView('home')} onEdit={(e) => { setEditingExpense(e); setView('add-expense'); }} onDelete={deleteExpense} />;
      case 'settings': return <Settings user={data.user} onBack={() => setView('home')} onPCFile={handlePCFileAccess} hasFile={!!fileHandle} />;
      default: return <Home data={data} setView={setView} onLogout={() => setView('auth')} onEdit={()=>{}} onDelete={()=>{}} onUpdateUser={updateUser} onUpdateSources={()=>{}} onDeleteSource={()=>{}} onUpdateMethods={()=>{}} onDeleteMethod={()=>{}} onAddProject={()=>{}} onUpdateProjects={()=>{}} onDeleteProject={()=>{}} deferredPrompt={null} setDeferredPrompt={()=>{}} />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-bg-dark overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden relative">{renderView()}</div>
      {view !== 'auth' && (
        <nav className="shrink-0 bg-bg-dark border-t border-white/5 flex justify-around items-center min-h-[75px]">
          <button onClick={() => setView('home')} className={`flex-1 py-4 flex flex-col items-center transition-all ${view === 'home' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="material-symbols-outlined text-2xl font-black">home</span>
            <span className="text-[8px] font-bold uppercase mt-1">Início</span>
          </button>
          <button onClick={() => setView('transactions')} className={`flex-1 py-4 flex flex-col items-center transition-all ${view === 'transactions' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="material-symbols-outlined text-2xl font-black">receipt_long</span>
            <span className="text-[8px] font-bold uppercase mt-1">Extrato</span>
          </button>
          <button onClick={() => setView('projects')} className={`flex-1 py-4 flex flex-col items-center transition-all ${view === 'projects' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="material-symbols-outlined text-2xl font-black">folder</span>
            <span className="text-[8px] font-bold uppercase mt-1">Projetos</span>
          </button>
          <button onClick={() => setView('household')} className={`flex-1 py-4 flex flex-col items-center transition-all ${view === 'household' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="material-symbols-outlined text-2xl font-black">group</span>
            <span className="text-[8px] font-bold uppercase mt-1">Agregado</span>
          </button>
          <button onClick={() => setView('stats')} className={`flex-1 py-4 flex flex-col items-center transition-all ${view === 'stats' ? 'text-primary' : 'text-gray-500'}`}>
            <span className="material-symbols-outlined text-2xl font-black">monitoring</span>
            <span className="text-[8px] font-bold uppercase mt-1">Gráfico</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
