
import React, { useState } from 'react';
import { AppData, View, Expense, UserAccount } from '../types';

interface HomeProps {
  data: AppData;
  setView: (v: View) => void;
  onLogout: () => void;
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
  onUpdateUser: (u: UserAccount) => void;
  deferredPrompt: any;
  setDeferredPrompt: (p: any) => void;
}

const Home: React.FC<HomeProps> = ({ data, setView, onLogout, onEdit, onDelete, onUpdateUser, deferredPrompt, setDeferredPrompt }) => {
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  // Função centralizada para mudar de vista sem interferência de eventos
  const handleNav = (v: View) => {
    setActionMenuId(null);
    setView(v);
  };

  return (
    <div className="h-full flex flex-col pb-32 overflow-y-auto no-scrollbar relative">
      <header className="flex items-center justify-between px-6 pt-12 pb-4 shrink-0 z-50">
        <div className="flex items-center gap-3 p-2 cursor-pointer" onClick={() => handleNav('settings')}>
          <img src={data.user.avatar} className="h-10 w-10 rounded-xl border-2 border-primary/20" alt="Avatar" />
          <div className="pointer-events-none">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Olá,</p>
            <h2 className="text-sm font-black text-white">{data.user.name}</h2>
          </div>
        </div>
        <button onClick={() => onLogout()} className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-red-400 active:bg-red-500/10">
          <span className="material-symbols-outlined text-lg font-black">logout</span>
        </button>
      </header>

      <main className="flex-1 px-6 space-y-10 relative">
        <section className="mt-4 pointer-events-none">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Saldo Disponível</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-primary/40">€</span>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              {data.balance.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
            </h1>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleNav('add-expense')} 
            className="flex flex-col items-center justify-center py-10 rounded-[2.5rem] bg-gradient-to-br from-secondary to-primary text-white shadow-2xl active:opacity-80"
          >
            <span className="material-symbols-outlined text-4xl mb-2 font-black pointer-events-none">add_circle</span>
            <span className="text-[10px] font-black uppercase tracking-widest pointer-events-none">Novo Gasto</span>
          </button>
          <button 
            onClick={() => handleNav('export')} 
            className="flex flex-col items-center justify-center py-10 rounded-[2.5rem] bg-surface-dark border border-white/5 text-white shadow-lg active:bg-white/5"
          >
            <span className="material-symbols-outlined text-4xl mb-2 text-secondary pointer-events-none">file_export</span>
            <span className="text-[10px] font-black uppercase tracking-widest pointer-events-none">Exportar</span>
          </button>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Últimos Gastos</h3>
            <button 
              onClick={() => handleNav('transactions')} 
              className="text-[10px] text-primary font-black uppercase tracking-widest px-6 py-4 bg-primary/5 rounded-xl active:bg-primary/20"
            >
              Ver Tudo
            </button>
          </div>
          
          <div className="space-y-3">
            {data.expenses.slice(0, 5).map(exp => (
              <div key={exp.id} className="relative">
                <div 
                  className={`flex items-center justify-between p-5 bg-surface-dark rounded-[1.8rem] border ${actionMenuId === exp.id ? 'border-primary bg-primary/5' : 'border-white/5'}`}
                  onClick={() => setActionMenuId(actionMenuId === exp.id ? null : exp.id)}
                >
                  <div className="flex items-center gap-4 overflow-hidden pointer-events-none">
                    <div className="h-12 w-12 flex items-center justify-center bg-bg-dark/60 rounded-2xl text-secondary shrink-0">
                      <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-white truncate">{exp.source}</p>
                      <p className="text-[10px] text-gray-500 font-bold">{new Date(exp.date).toLocaleDateString('pt-PT')}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-white ml-2 shrink-0 pointer-events-none">€{exp.amount.toFixed(2)}</p>
                </div>

                {actionMenuId === exp.id && (
                  <div className="absolute right-4 top-16 bg-bg-dark border border-white/10 rounded-2xl shadow-2xl z-50 p-2 min-w-[140px] animate-in fade-in zoom-in-95">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(exp); setActionMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-4 text-[11px] font-bold text-blue-400 active:bg-white/5 rounded-xl">
                      <span className="material-symbols-outlined text-sm">edit</span> Editar
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if(confirm("Apagar este registo?")) onDelete(exp.id); setActionMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-4 text-[11px] font-bold text-red-400 active:bg-white/5 rounded-xl">
                      <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
            {data.expenses.length === 0 && (
              <div className="py-20 text-center opacity-20">
                <p className="text-xs font-black uppercase tracking-widest">Sem despesas registadas</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
