
import React from 'react';
import { AppData, View } from '../types';

interface HomeProps {
  data: AppData;
  setView: (v: View) => void;
}

const Home: React.FC<HomeProps> = ({ data, setView }) => {
  const currentMonth = "Outubro 2023";
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col pb-24 overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <img src={data.user.avatar} className="h-10 w-10 rounded-full border-2 border-white/10" alt="Avatar" />
          <div>
            <p className="text-xs text-gray-400">Boa tarde,</p>
            <h2 className="text-sm font-bold">{data.user.name}</h2>
          </div>
        </div>
        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 relative">
          <span className="material-symbols-outlined text-white">notifications</span>
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full"></span>
        </button>
      </header>

      {/* Balance */}
      <div className="px-6 py-2">
        <p className="text-xs text-gray-400 mb-1">Saldo Total</p>
        <h1 className="text-3xl font-bold">€{data.balance.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h1>
      </div>

      {/* Calendar */}
      <div className="px-4 mt-6">
        <div className="bg-card-dark rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
            <h3 className="text-sm font-bold tracking-wide">{currentMonth}</h3>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </div>
          <div className="grid grid-cols-7 gap-y-3">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-500">{d}</div>
            ))}
            {/* Simple Mock Calendar */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`prev-${i}`} className="text-center text-sm text-gray-700">2{8 + i}</div>
            ))}
            {days.slice(0, 15).map(d => (
              <div key={d} className="flex justify-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${d === 5 ? 'bg-primary text-bg-dark font-bold' : ''}`}>
                  {d}
                  {d === 3 && <span className="absolute bottom-1 h-1 w-1 bg-red-500 rounded-full mt-6"></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 px-6 flex items-center justify-between">
        <h3 className="text-lg font-bold">Transações Recentes</h3>
        <button className="text-xs font-bold text-primary">VER TUDO</button>
      </div>

      <div className="mt-4 px-4 flex flex-col gap-3">
        {data.expenses.slice(0, 5).map(exp => (
          <div key={exp.id} className="flex items-center justify-between p-4 bg-card-dark rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 flex items-center justify-center bg-white/5 rounded-xl">
                <span className="material-symbols-outlined text-primary">shopping_bag</span>
              </div>
              <div>
                <p className="text-sm font-bold">{exp.source}</p>
                <p className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString('pt-PT')}</p>
              </div>
            </div>
            <p className="text-sm font-bold">-€{exp.amount.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setView('add-expense')}
        className="fixed bottom-24 right-5 h-14 w-14 bg-primary text-bg-dark rounded-full shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform z-50"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>
    </div>
  );
};

export default Home;
