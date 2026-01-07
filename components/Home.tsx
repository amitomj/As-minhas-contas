
import React from 'react';
import { AppData, View } from '../types';

interface HomeProps {
  data: AppData;
  setView: (v: View) => void;
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ data, setView, onLogout }) => {
  const currentMonth = "Janeiro 2025";
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col pb-32 overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <img src={data.user.avatar} className="h-10 w-10 rounded-full border-2 border-white/10" alt="Avatar" />
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Olá, de novo</p>
            <h2 className="text-sm font-bold">{data.user.name}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('stats')} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5">
            <span className="material-symbols-outlined text-white text-xl">analytics</span>
          </button>
          <button onClick={onLogout} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-red-400">
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      {/* Balance Card */}
      <div className="px-6 py-4">
        <div className="bg-gradient-to-br from-primary to-green-800 p-6 rounded-[32px] text-bg-dark shadow-2xl shadow-primary/20">
          <p className="text-[10px] font-bold uppercase opacity-70 mb-1">Saldo Disponível</p>
          <h1 className="text-4xl font-black mb-6">€{data.balance.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h1>
          <div className="flex justify-between items-end">
            <div className="flex -space-x-3">
              {data.members.map((m, i) => (
                <div key={m.id} className="size-8 rounded-full border-2 border-primary bg-bg-dark flex items-center justify-center text-[10px] font-black text-white" style={{ zIndex: 10 - i }}>
                  {m.name.charAt(0)}
                </div>
              ))}
            </div>
            <button className="px-4 py-2 bg-bg-dark/10 rounded-full text-[10px] font-black uppercase border border-bg-dark/10">Ver Detalhes</button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-4 mt-2">
        <div className="bg-surface-dark rounded-3xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4 px-2">
            <button className="material-symbols-outlined text-sm text-gray-500">chevron_left</button>
            <h3 className="text-xs font-bold tracking-widest uppercase">{currentMonth}</h3>
            <button className="material-symbols-outlined text-sm text-gray-500">chevron_right</button>
          </div>
          <div className="grid grid-cols-7 gap-y-2">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(d => (
              <div key={d} className="text-center text-[9px] font-black text-gray-600">{d}</div>
            ))}
            {days.slice(0, 14).map(d => (
              <div key={d} className="flex justify-center">
                <div className={`size-8 flex items-center justify-center rounded-xl text-[11px] font-bold transition-all ${d === 5 ? 'bg-primary text-bg-dark shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-white/5'}`}>
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 px-6 flex items-center justify-between">
        <h3 className="text-lg font-bold">Histórico Recente</h3>
        <button onClick={() => setView('transactions')} className="text-[10px] font-black text-primary uppercase tracking-widest">Ver Tudo</button>
      </div>

      <div className="mt-4 px-4 flex flex-col gap-3">
        {data.expenses.slice(0, 3).map(exp => (
          <div key={exp.id} className="flex items-center justify-between p-4 bg-surface-dark rounded-2xl border border-white/5 group active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 flex items-center justify-center bg-white/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-primary">shopping_bag</span>
              </div>
              <div>
                <p className="text-sm font-bold">{exp.source}</p>
                <p className="text-[10px] text-gray-500 font-medium">{new Date(exp.date).toLocaleDateString('pt-PT')}</p>
              </div>
            </div>
            <p className="text-sm font-black">-€{exp.amount.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setView('add-expense')}
        className="fixed bottom-28 right-6 h-16 w-16 bg-primary text-bg-dark rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-transform z-50 border-4 border-bg-dark"
      >
        <span className="material-symbols-outlined text-3xl font-black">add</span>
      </button>
    </div>
  );
};

export default Home;
