
import React, { useState, useMemo } from 'react';
import { Expense, Member } from '../types';

interface Props {
  expenses: Expense[];
  members: Member[];
  onBack: () => void;
}

const Stats: React.FC<Props> = ({ expenses, members, onBack }) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [period, setPeriod] = useState<'7d' | '30d' | 'year'>('30d');

  const statsData = useMemo(() => {
    const now = new Date();
    const filtered = expenses.filter(e => {
      const date = new Date(e.date);
      if (period === '7d') return (now.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
      if (period === '30d') return (now.getTime() - date.getTime()) < 30 * 24 * 60 * 60 * 1000;
      return date.getFullYear() === now.getFullYear();
    });

    const bySource: Record<string, number> = {};
    const byMember: Record<string, number> = {};
    const byDay: Record<string, number> = {};

    filtered.forEach(e => {
      bySource[e.source] = (bySource[e.source] || 0) + e.amount;
      const mName = e.memberId === 'all' ? 'Agregado' : (members.find(m => m.id === e.memberId)?.name || 'Outro');
      byMember[mName] = (byMember[mName] || 0) + e.amount;
      const day = e.date;
      byDay[day] = (byDay[day] || 0) + e.amount;
    });

    return { bySource, byMember, byDay, total: filtered.reduce((acc, curr) => acc + curr.amount, 0) };
  }, [expenses, period, members]);

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 pb-24 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between pt-8 pb-4">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Análise Financeira</h2>
        <div className="w-10"></div>
      </header>

      <div className="flex gap-2 mb-6">
        {['7d', '30d', 'year'].map(p => (
          <button 
            key={p} onClick={() => setPeriod(p as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${period === p ? 'bg-primary text-bg-dark border-primary' : 'bg-surface-dark text-gray-500 border-white/5'}`}
          >
            {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : 'Este Ano'}
          </button>
        ))}
      </div>

      <div className="bg-surface-dark rounded-3xl p-6 border border-white/5 mb-6">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Gasto no Período</p>
        <h3 className="text-3xl font-bold text-white">€{statsData.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-8">
        {[
          { id: 'bar', icon: 'bar_chart', label: 'Fontes' },
          { id: 'pie', icon: 'pie_chart', label: 'Membros' },
          { id: 'line', icon: 'show_chart', label: 'Tempo' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setChartType(t.id as any)}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${chartType === t.id ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-dark border-white/5 text-gray-500'}`}
          >
            <span className="material-symbols-outlined">{t.icon}</span>
            <span className="text-[10px] font-bold">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Chart Visualization */}
      <div className="flex-1 min-h-[300px] bg-surface-dark rounded-3xl p-6 border border-white/5 relative">
        {chartType === 'bar' && (
          <div className="h-full flex flex-col justify-end gap-4">
            {/* Added explicit type casting for Object.entries to handle numeric sort and property access */}
            {(Object.entries(statsData.bySource) as [string, number][]).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([source, amount]) => (
              <div key={source} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                  <span>{source}</span>
                  <span>€{amount.toFixed(0)}</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000" 
                    // Added explicit type casting for Object.values
                    style={{ width: `${(amount / Math.max(...(Object.values(statsData.bySource) as number[]))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {chartType === 'pie' && (
          <div className="h-full flex items-center justify-center flex-col gap-8">
            <div className="relative size-48">
              <svg viewBox="0 0 32 32" className="size-full -rotate-90">
                {/* Fixed arithmetic errors by explicitly typing the reduce accumulator and parameters */}
                {(Object.entries(statsData.byMember) as [string, number][]).reduce((acc: { elements: any[], offset: number }, [label, value], i: number) => {
                  const total = statsData.total;
                  const percent = total > 0 ? (value / total) * 100 : 0;
                  const strokeDasharray = `${percent} ${100 - percent}`;
                  const offset = acc.offset;
                  acc.offset -= percent;
                  acc.elements.push(
                    <circle 
                      key={label} r="16" cx="16" cy="16" fill="transparent" 
                      stroke={['#13ec5b', '#22c55e', '#166534', '#14532d'][i % 4]} 
                      strokeWidth="8" strokeDasharray={strokeDasharray} 
                      strokeDashoffset={offset} className="transition-all duration-1000"
                    />
                  );
                  return acc;
                }, { elements: [] as any[], offset: 25 }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Membros</span>
                <span className="text-xs font-bold">{Object.keys(statsData.byMember).length}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
              {/* Added explicit type casting for Object.entries to resolve index arithmetic inference */}
              {(Object.entries(statsData.byMember) as [string, number][]).map(([label, value], i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="size-2 rounded-full" style={{ backgroundColor: ['#13ec5b', '#22c55e', '#166534', '#14532d'][i % 4] }}></div>
                  <span className="text-[10px] text-gray-400 font-medium truncate">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {chartType === 'line' && (
          <div className="h-full flex flex-col">
             <div className="flex-1 flex items-end gap-1 px-2">
               {/* Fixed type inference for map callback parameters in line chart */}
               {(Object.entries(statsData.byDay) as [string, number][]).sort((a,b) => a[0].localeCompare(b[0])).slice(-7).map(([day, val]) => (
                 <div key={day} className="flex-1 flex flex-col items-center gap-2">
                   <div 
                    className="w-full bg-primary/40 hover:bg-primary transition-all rounded-t-lg" 
                    // Added explicit type casting for Object.values
                    style={{ height: `${(val / Math.max(...(Object.values(statsData.byDay) as number[]))) * 100}%`, minHeight: '4px' }}
                   />
                   <span className="text-[8px] text-gray-500 font-bold">{day.split('-')[2]}</span>
                 </div>
               ))}
             </div>
             <p className="text-center text-[10px] text-gray-500 mt-4 font-bold">Gastos diários (últimos registros)</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
        <span className="material-symbols-outlined text-primary">tips_and_updates</span>
        <p className="text-[11px] text-primary leading-tight font-medium">O seu gasto maior este mês foi em <span className="font-bold underline">
          {/* Added explicit type casting for Object.entries */}
          {(Object.entries(statsData.bySource) as [string, number][]).sort((a,b)=>b[1]-a[1])[0]?.[0] || '---'}
        </span>. Tente reduzir 10% no próximo mês para atingir o seu objetivo.</p>
      </div>
    </div>
  );
};

export default Stats;
