
import React, { useState, useEffect } from 'react';
import { AppData, View, Expense, UserAccount } from '../types';

interface HomeProps {
  data: AppData;
  setView: (v: View) => void;
  onLogout: () => void;
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
  onUpdateUser: (u: UserAccount) => void;
}

const Home: React.FC<HomeProps> = ({ data, setView, onLogout, onEdit, onDelete, onUpdateUser }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('financas_pro_last_email', data.user.email);
  }, [data.user.email]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const currentMonth = "Janeiro 2025";
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col pb-32 overflow-y-auto no-scrollbar relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('settings')}>
          <img src={data.user.avatar} className="h-10 w-10 rounded-[12px] border-2 border-primary/20 shadow-lg" alt="Avatar" />
          <div>
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Olá,</p>
            <h2 className="text-sm font-black text-white">{data.user.name}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          {deferredPrompt && (
            <button onClick={handleInstallClick} className="h-10 px-4 flex items-center justify-center rounded-xl bg-secondary/10 text-secondary border border-secondary/20 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-xl mr-2">install_mobile</span>
              <span className="text-[9px] font-black uppercase">Instalar</span>
            </button>
          )}
          <button onClick={() => setView('settings')} className="h-12 w-12 flex items-center justify-center rounded-xl bg-surface-dark text-gray-400 border border-white/5 active:scale-95 transition-all shadow-lg">
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
          <button onClick={onLogout} className="h-12 w-12 flex items-center justify-center rounded-xl bg-surface-dark text-red-500 border border-white/5 active:scale-95 transition-all shadow-lg">
            <span className="material-symbols-outlined text-xl">power_settings_new</span>
          </button>
        </div>
      </header>

      {/* Balance Card - Modern Gradient */}
      <div className="px-6 py-4">
        <div className="bg-gradient-to-br from-secondary via-accent to-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-secondary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <span className="material-symbols-outlined text-9xl font-black">finance_chip</span>
          </div>
          <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-[0.2em]">Saldo Disponível</p>
          <h1 className="text-4xl font-black mb-8">€{data.balance.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h1>
          <div className="flex justify-between items-center relative z-10">
            <div className="flex -space-x-2">
              {data.members.slice(0, 3).map((m, i) => (
                <div key={m.id} className="size-10 rounded-xl border-2 border-white bg-bg-dark flex items-center justify-center text-[11px] font-black text-white shadow-md" style={{ zIndex: 10 - i }}>
                  {m.name.charAt(0)}
                </div>
              ))}
              {data.members.length > 3 && (
                <div className="size-10 rounded-xl border-2 border-white bg-surface-dark flex items-center justify-center text-[11px] font-black text-white" style={{ zIndex: 0 }}>
                  +{data.members.length - 3}
                </div>
              )}
            </div>
            <button 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                setView('stats'); 
              }} 
              className="px-6 py-4 bg-white/20 backdrop-blur-lg rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 active:scale-90 transition-all cursor-pointer pointer-events-auto"
            >
              Estatísticas
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-4 mt-2">
        <div className="bg-surface-dark rounded-[2.2rem] p-6 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-5 px-2">
            <button className="material-symbols-outlined text-gray-700 hover:text-white">chevron_left</button>
            <h3 className="text-[11px] font-black tracking-[0.3em] uppercase text-gray-500">{currentMonth}</h3>
            <button className="material-symbols-outlined text-gray-700 hover:text-white">chevron_right</button>
          </div>
          <div className="grid grid-cols-7 gap-y-3">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(d => (
              <div key={d} className="text-center text-[9px] font-black text-gray-700">{d}</div>
            ))}
            {days.slice(0, 21).map(d => (
              <div key={d} className="flex justify-center">
                <div className={`size-9 flex items-center justify-center rounded-[12px] text-[11px] font-bold transition-all ${d === 5 ? 'bg-primary text-bg-dark shadow-xl shadow-primary/30 font-black scale-110' : 'text-gray-500 hover:bg-white/5'}`}>
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="mt-10 px-8 flex items-center justify-between relative z-10">
        <h3 className="text-xl font-black tracking-tight text-white">Atividade</h3>
        <button 
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            setView('transactions'); 
          }} 
          className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] bg-secondary/15 px-5 py-3 rounded-xl active:scale-90 transition-all cursor-pointer pointer-events-auto shadow-lg"
        >
          Ver Tudo
        </button>
      </div>

      <div className="mt-4 px-4 flex flex-col gap-3">
        {data.expenses.length === 0 ? (
          <p className="text-center py-10 text-gray-600 font-bold text-xs uppercase tracking-widest">Nenhum gasto recente</p>
        ) : (
          data.expenses.slice(0, 4).map(exp => (
            <div key={exp.id} className="relative group">
              <div 
                className={`flex items-center justify-between p-5 bg-surface-dark rounded-[1.8rem] border transition-all active:scale-[0.98] ${actionMenuId === exp.id ? 'border-primary' : 'border-white/5'}`}
                onClick={() => setActionMenuId(actionMenuId === exp.id ? null : exp.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex items-center justify-center bg-bg-dark/50 rounded-2xl text-primary shadow-inner">
                    <span className="material-symbols-outlined font-bold">receipt_long</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white truncate max-w-[140px]">{exp.source}</p>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">{new Date(exp.date).toLocaleDateString('pt-PT')}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-sm font-black text-white">-€{exp.amount.toFixed(2)}</p>
                    <p className="text-[9px] text-gray-700 font-bold uppercase">Validado</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-700 text-sm">more_horiz</span>
                </div>
              </div>

              {actionMenuId === exp.id && (
                <div className="absolute right-4 top-16 bg-bg-dark border border-white/10 rounded-2xl shadow-2xl z-50 p-2 min-w-[130px] animate-in fade-in zoom-in-95">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(exp); setActionMenuId(null); }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-[11px] font-bold text-blue-400 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span> Editar
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(exp.id); setActionMenuId(null); }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-[11px] font-bold text-red-400 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* FAB - Primary Action */}
      <button 
        onClick={() => setView('add-expense')}
        className="fixed bottom-28 right-8 h-16 w-16 bg-primary text-bg-dark rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-transform z-50 border-4 border-bg-dark group overflow-hidden"
      >
        <span className="material-symbols-outlined text-4xl font-black group-hover:rotate-90 transition-transform">add</span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>
  );
};

export default Home;
