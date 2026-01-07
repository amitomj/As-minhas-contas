
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

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <div className="h-full flex flex-col pb-32 overflow-y-auto no-scrollbar relative z-10">
      <header className="flex items-center justify-between px-6 pt-12 pb-4 shrink-0 z-50">
        <div className="flex items-center gap-3 active:opacity-70 transition-opacity cursor-pointer" onClick={() => setView('settings')}>
          <img src={data.user.avatar} className="h-10 w-10 rounded-xl border-2 border-primary/20 shadow-lg" alt="Avatar" />
          <div>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Olá,</p>
            <h2 className="text-sm font-black text-white">{data.user.name}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick} 
              className="h-11 px-4 flex items-center gap-2 rounded-xl bg-primary/10 text-primary active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">install_mobile</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Instalar</span>
            </button>
          )}
          <button onClick={onLogout} className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-red-400 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-lg font-black">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 space-y-10 relative z-20">
        <section className="mt-4">
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
            onClick={(e) => { e.preventDefault(); setView('add-expense'); }} 
            className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-gradient-to-br from-secondary to-primary text-white shadow-2xl shadow-primary/20 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-4xl mb-2 font-black">add_circle</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-center">Novo Gasto</span>
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); setView('export'); }} 
            className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-surface-dark border border-white/5 text-white active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-4xl mb-2 text-secondary">file_export</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-center">Exportar</span>
          </button>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Últimos Gastos</h3>
            <button 
              onClick={(e) => { e.preventDefault(); setView('transactions'); }} 
              className="text-[10px] text-primary font-black uppercase tracking-widest py-2 px-3 bg-primary/5 rounded-lg active:scale-95 transition-all cursor-pointer"
            >
              Ver Tudo
            </button>
          </div>
          
          <div className="space-y-3">
            {data.expenses.slice(0, 5).map(exp => (
              <div key={exp.id} className="relative group">
                <div 
                  className={`flex items-center justify-between p-5 bg-surface-dark rounded-[1.8rem] border transition-all active:scale-[0.98] cursor-pointer ${actionMenuId === exp.id ? 'border-primary' : 'border-white/5'}`}
                  onClick={() => setActionMenuId(actionMenuId === exp.id ? null : exp.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex items-center justify-center bg-bg-dark/60 rounded-2xl text-secondary">
                      <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{exp.source}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                        {new Date(exp.date).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-white">€{exp.amount.toFixed(2)}</p>
                </div>

                {actionMenuId === exp.id && (
                  <div className="absolute right-4 top-16 bg-bg-dark border border-white/10 rounded-2xl shadow-2xl z-50 p-2 min-w-[140px] animate-in fade-in zoom-in-95">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(exp); setActionMenuId(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-blue-400 hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span> Editar
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm("Apagar?")) onDelete(exp.id); setActionMenuId(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-red-400 hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
