
import React, { useState, useMemo } from 'react';
import { Expense, Member } from '../types';

interface Props {
  expenses: Expense[];
  members: Member[];
  onBack: () => void;
}

const DetailModal: React.FC<{ date: string; dayExpenses: Expense[]; members: Member[]; onClose: () => void }> = ({ date, dayExpenses, members, onClose }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
    <div className="bg-surface-dark w-full max-w-sm rounded-[3rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
           <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">Detalhe do Dia</h3>
           <p className="text-white text-sm font-black uppercase mt-1">{new Date(date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}</p>
        </div>
        <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full bg-bg-dark border border-white/5"><span className="material-symbols-outlined text-gray-500">close</span></button>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
        {dayExpenses.map(exp => (
          <div key={exp.id} className="p-4 bg-bg-dark/40 rounded-2xl border border-white/5 flex justify-between items-center">
            <div className="overflow-hidden pr-2">
              <p className="text-xs font-black text-white uppercase truncate">{exp.source}</p>
              <p className="text-[9px] text-gray-500 uppercase font-black">{exp.paymentMethod}</p>
            </div>
            <p className="text-sm font-black text-primary shrink-0">€{exp.amount.toFixed(2)}</p>
          </div>
        ))}
      </div>
      
      <div className="pt-6 shrink-0 border-t border-white/5 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-500 uppercase">Total do Dia</span>
          <span className="text-xl font-black text-white">€{dayExpenses.reduce((a,c) => a+c.amount, 0).toFixed(2)}</span>
        </div>
        <button onClick={onClose} className="w-full mt-6 py-4 bg-primary text-bg-dark font-black rounded-2xl uppercase text-[11px] tracking-widest shadow-lg shadow-primary/10">Fechar</button>
      </div>
    </div>
  </div>
);

const Stats: React.FC<Props> = ({ expenses, members, onBack }) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [period, setPeriod] = useState<'7d' | '30d' | 'year' | 'all'>('30d');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

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

    return { bySource, byMember, byDay, total: filtered.reduce((a,c) => a+c.amount,0), rawFiltered: filtered };
  }, [expenses, period, members]);

  const maxMemberVal = Math.max(...(Object.values(statsData.byMember) as number[]), 1);
  const maxSourceVal = Math.max(...(Object.values(statsData.bySource) as number[]), 1);

  const renderLineChart = () => {
    const sortedDays = Object.keys(statsData.byDay).sort();
    if (sortedDays.length < 1) return <div className="h-40 flex items-center justify-center opacity-20"><p className="text-[10px] font-black uppercase tracking-widest">Sem dados no período</p></div>;

    const maxVal = Math.max(...(Object.values(statsData.byDay) as number[]), 1);
    const width = 300;
    const height = 150;
    const padding = 20;

    const points = sortedDays.length > 1 
      ? sortedDays.map((day, i) => {
          const x = (i / (sortedDays.length - 1)) * (width - padding * 2) + padding;
          const y = height - ((statsData.byDay[day] / maxVal) * (height - padding * 2) + padding);
          return `${x},${y}`;
        }).join(' ')
      : "";

    return (
      <div className="flex flex-col items-center">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Linha do Tempo (Clique nos pontos)</h3>
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
            {sortedDays.length > 1 && (
              <polyline
                fill="none"
                stroke="#13ec5b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                className="opacity-40"
              />
            )}
            {sortedDays.map((day, i) => {
              const x = sortedDays.length > 1 ? (i / (sortedDays.length - 1)) * (width - padding * 2) + padding : width/2;
              const y = height - ((statsData.byDay[day] / maxVal) * (height - padding * 2) + padding);
              return (
                <g key={i} className="cursor-pointer group" onClick={() => setSelectedDay(day)}>
                  <circle cx={x} cy={y} r="12" fill="transparent" />
                  <circle 
                    cx={x} cy={y} r="5" 
                    fill={selectedDay === day ? "#13ec5b" : "#0a1a14"} 
                    stroke="#13ec5b" 
                    strokeWidth="3" 
                    className="transition-all group-active:scale-150"
                  />
                  {selectedDay === day && (
                    <text x={x} y={y - 12} textAnchor="middle" fill="#13ec5b" className="text-[8px] font-black uppercase">€{statsData.byDay[day].toFixed(0)}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between w-full mt-4 px-4 border-t border-white/5 pt-4">
           <div className="text-left">
             <p className="text-[7px] font-black text-gray-500 uppercase">Início</p>
             <p className="text-[9px] font-black text-white">{new Date(sortedDays[0]).toLocaleDateString('pt-PT')}</p>
           </div>
           {sortedDays.length > 1 && (
             <div className="text-right">
                <p className="text-[7px] font-black text-gray-500 uppercase">Fim</p>
                <p className="text-[9px] font-black text-white">{new Date(sortedDays[sortedDays.length-1]).toLocaleDateString('pt-PT')}</p>
             </div>
           )}
        </div>
      </div>
    );
  };

  const selectedDayExpenses = useMemo(() => {
    if (!selectedDay) return [];
    return statsData.rawFiltered.filter(e => e.date === selectedDay);
  }, [selectedDay, statsData.rawFiltered]);

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar pb-32">
      <header className="flex items-center gap-4 pt-10 pb-6 shrink-0">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 active:scale-90 transition-all">
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Estatísticas</h2>
      </header>

      <div className="space-y-6">
        <div className="bg-surface-dark rounded-[3rem] p-8 border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-all">
            <span className="material-symbols-outlined text-8xl">analytics</span>
          </div>
          <div className="flex gap-2 items-center mb-6">
             {['7d', '30d', 'year', 'all'].map(p => (
               <button 
                key={p} 
                onClick={() => setPeriod(p as any)}
                className={`flex-1 py-2 text-[8px] font-black rounded-lg border uppercase tracking-widest transition-all ${period === p ? 'bg-primary border-primary text-bg-dark' : 'bg-bg-dark/50 border-white/5 text-gray-500'}`}
               >
                 {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : p === 'year' ? 'Este Ano' : 'Tudo'}
               </button>
             ))}
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Total Utilizado</p>
          <h1 className="text-5xl font-black text-white tracking-tighter">€{statsData.total.toFixed(2)}</h1>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'bar', label: 'CATEGORIAS', icon: 'shopping_bag' },
            { id: 'pie', label: 'MEMBROS', icon: 'person' },
            { id: 'line', label: 'EVOLUÇÃO', icon: 'timeline' }
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setChartType(t.id as any)} 
              className={`py-6 rounded-[2.5rem] border flex flex-col items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${chartType === t.id ? 'bg-primary border-primary text-bg-dark' : 'bg-surface-dark border-white/5 text-gray-500'}`}
            >
              <span className={`material-symbols-outlined text-3xl font-black`}>{t.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-center">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-surface-dark rounded-[3.5rem] p-8 border border-white/5 min-h-[400px] shadow-2xl relative overflow-hidden">
          {chartType === 'pie' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 text-center">Peso por Membro</h3>
              {(Object.entries(statsData.byMember) as [string, number][]).sort((a,b) => b[1] - a[1]).map(([name, val]) => (
                <div key={name} className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="uppercase text-white/80">{name}</span>
                    <span className="text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">€{val.toFixed(2)}</span>
                  </div>
                  <div className="h-4 bg-bg-dark rounded-full overflow-hidden border border-white/5 p-1">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${(val / maxMemberVal) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : chartType === 'bar' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 text-center">Maiores Categorias</h3>
              {(Object.entries(statsData.bySource) as [string, number][]).sort((a,b) => b[1] - a[1]).map(([source, val]) => (
                <div key={source} className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="uppercase text-white/80 truncate pr-4">{source}</span>
                    <span className="text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20 shrink-0">€{val.toFixed(2)}</span>
                  </div>
                  <div className="h-4 bg-bg-dark rounded-full overflow-hidden border border-white/5 p-1">
                    <div className="h-full bg-secondary rounded-full transition-all duration-1000 ease-out" style={{ width: `${(val / maxSourceVal) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderLineChart()}
            </div>
          )}
        </div>
      </div>

      {selectedDay && (
        <DetailModal 
          date={selectedDay} 
          dayExpenses={selectedDayExpenses} 
          members={members} 
          onClose={() => setSelectedDay(null)} 
        />
      )}
    </div>
  );
};

export default Stats;
