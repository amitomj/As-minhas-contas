
import React, { useState, useMemo } from 'react';
import { Expense, Member } from '../types';

interface Props {
  expenses: Expense[];
  members: Member[];
  onBack: () => void;
}

const Stats: React.FC<Props> = ({ expenses, members, onBack }) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [period, setPeriod] = useState<'7d' | '30d' | 'year' | 'custom'>('30d');

  const statsData = useMemo(() => {
    const now = new Date();
    const filtered = expenses.filter(e => {
      const eDate = new Date(e.date);
      if (period === '7d') return (now.getTime() - eDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
      if (period === '30d') return (now.getTime() - eDate.getTime()) < 30 * 24 * 60 * 60 * 1000;
      if (period === 'year') return eDate.getFullYear() === now.getFullYear();
      return true;
    });

    const bySource: Record<string, number> = {};
    const byMember: Record<string, number> = {};
    const byDay: Record<string, number> = {};

    filtered.forEach(e => {
      bySource[e.source] = (bySource[e.source] || 0) + e.amount;
      if (e.memberIds.length === 0) {
        byMember['Agregado'] = (byMember['Agregado'] || 0) + e.amount;
      } else {
        const split = e.amount / e.memberIds.length;
        e.memberIds.forEach(id => {
          const name = members.find(m => m.id === id)?.name || 'Outro';
          byMember[name] = (byMember[name] || 0) + split;
        });
      }
      byDay[e.date] = (byDay[e.date] || 0) + e.amount;
    });

    return { bySource, byMember, byDay, total: filtered.reduce((a,c) => a+c.amount,0) };
  }, [expenses, period, members]);

  // Fix: Explicitly cast to number[] to avoid "unknown" error when spreading in Math.max
  const maxMemberVal = Math.max(...(Object.values(statsData.byMember) as number[]), 1);
  const maxSourceVal = Math.max(...(Object.values(statsData.bySource) as number[]), 1);

  const renderLineChart = () => {
    const sortedDays = Object.keys(statsData.byDay).sort();
    if (sortedDays.length < 2) return <p className="text-center py-20 text-[10px] text-gray-500 font-black uppercase">Dados insuficientes para linha do tempo</p>;

    // Fix: Added explicit cast to number[] for Object.values result to resolve type error on line 53
    const maxVal = Math.max(...(Object.values(statsData.byDay) as number[]), 1);
    const width = 300;
    const height = 150;
    const padding = 20;

    const points = sortedDays.map((day, i) => {
      const x = (i / (sortedDays.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((statsData.byDay[day] / maxVal) * (height - padding * 2) + padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="flex flex-col items-center">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Evolução dos Gastos</h3>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
          <polyline
            fill="none"
            stroke="#13ec5b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="animate-[dash_2s_ease-in-out]"
          />
          {sortedDays.map((day, i) => {
            const x = (i / (sortedDays.length - 1)) * (width - padding * 2) + padding;
            const y = height - ((statsData.byDay[day] / maxVal) * (height - padding * 2) + padding);
            return (
              <circle key={i} cx={x} cy={y} r="4" fill="#0a1a14" stroke="#13ec5b" strokeWidth="2" />
            );
          })}
        </svg>
        <div className="flex justify-between w-full mt-4 px-4">
           <span className="text-[8px] font-black text-gray-500">{sortedDays[0]}</span>
           <span className="text-[8px] font-black text-gray-500">{sortedDays[sortedDays.length-1]}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar pb-32">
      <header className="flex items-center gap-4 pt-10 pb-6">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark btn-active">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Estatísticas</h2>
      </header>

      <div className="space-y-6">
        <div className="bg-surface-dark rounded-[2rem] p-8 border border-white/5">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total no período</p>
          <h1 className="text-4xl font-black">€{statsData.total.toFixed(2)}</h1>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'bar', label: 'TIPOS', icon: 'leaderboard' },
            { id: 'pie', label: 'MEMBROS', icon: 'group' },
            { id: 'line', label: 'TEMPO', icon: 'show_chart' }
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setChartType(t.id as any)} 
              className={`py-5 rounded-[1.5rem] border flex flex-col items-center justify-center gap-2 transition-all ${chartType === t.id ? 'bg-primary border-primary text-bg-dark' : 'bg-[#11291f] border-white/5 text-gray-500'}`}
            >
              <span className={`material-symbols-outlined text-2xl font-black`}>{t.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-widest">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 min-h-[350px] shadow-2xl">
          {chartType === 'pie' ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 text-center">Gastos por Membro</h3>
              {(Object.entries(statsData.byMember) as [string, number][]).sort((a,b) => b[1] - a[1]).map(([name, val]) => (
                <div key={name} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className="uppercase">{name}</span>
                    <span className="text-primary">€{val.toFixed(2)}</span>
                  </div>
                  <div className="h-3 bg-bg-dark rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-primary transition-all duration-700" style={{ width: `${(val / maxMemberVal) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : chartType === 'bar' ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 text-center">Gastos por Origem</h3>
              {(Object.entries(statsData.bySource) as [string, number][]).sort((a,b) => b[1] - a[1]).map(([source, val]) => (
                <div key={source} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className="uppercase">{source}</span>
                    <span className="text-secondary">€{val.toFixed(2)}</span>
                  </div>
                  <div className="h-3 bg-bg-dark rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-secondary transition-all duration-700" style={{ width: `${(val / maxSourceVal) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              {renderLineChart()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
