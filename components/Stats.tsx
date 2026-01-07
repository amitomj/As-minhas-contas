
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
  const [filterSource, setFilterSource] = useState('all');
  const [filterMember, setFilterMember] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const sources = useMemo(() => Array.from(new Set(expenses.map(e => e.source))), [expenses]);

  const statsData = useMemo(() => {
    const now = new Date();
    
    const filtered = expenses.filter(e => {
      const eDate = new Date(e.date);
      
      // Filtro de Período Pré-definido ou Customizado
      let matchesDate = true;
      if (period === '7d') matchesDate = (now.getTime() - eDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
      else if (period === '30d') matchesDate = (now.getTime() - eDate.getTime()) < 30 * 24 * 60 * 60 * 1000;
      else if (period === 'year') matchesDate = eDate.getFullYear() === now.getFullYear();
      else if (period === 'custom') {
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).getTime() : Infinity;
        matchesDate = eDate.getTime() >= start && eDate.getTime() <= end;
      }

      // Filtro de Origem
      const matchesSource = filterSource === 'all' || e.source === filterSource;

      // Filtro de Membro
      const matchesMember = filterMember === 'all' || 
                            e.memberIds.includes(filterMember) || 
                            (filterMember === 'none' && e.memberIds.length === 0);

      return matchesDate && matchesSource && matchesMember;
    });

    const bySource: Record<string, number> = {};
    const byMember: Record<string, number> = {};
    const byDay: Record<string, number> = {};

    filtered.forEach(e => {
      // Gastos por Origem
      bySource[e.source] = (bySource[e.source] || 0) + e.amount;
      
      // Gastos por Membro
      if (e.memberIds.length === 0) {
        byMember['Agregado'] = (byMember['Agregado'] || 0) + e.amount;
      } else {
        const splitAmount = e.amount / e.memberIds.length;
        e.memberIds.forEach(id => {
          const m = members.find(mem => mem.id === id);
          const name = m ? m.name : 'Outro';
          byMember[name] = (byMember[name] || 0) + splitAmount;
        });
      }

      // Gastos por Dia
      byDay[e.date] = (byDay[e.date] || 0) + e.amount;
    });

    return { 
      bySource, 
      byMember, 
      byDay, 
      total: filtered.reduce((acc, curr) => acc + curr.amount, 0),
      count: filtered.length 
    };
  }, [expenses, period, members, filterSource, filterMember, startDate, endDate]);

  // Fix: Explicitly cast Object.values to number[] to resolve 'unknown' type errors (lines 83, 84)
  const maxSourceVal = Math.max(...(Object.values(statsData.bySource) as number[]), 1);
  const maxDayVal = Math.max(...(Object.values(statsData.byDay) as number[]), 1);

  return (
    <div className="h-full bg-[#050c09] flex flex-col p-4 pb-24 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between pt-8 pb-4 shrink-0">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full bg-[#11291f] border border-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Análise</h2>
        <button onClick={() => setShowFilters(!showFilters)} className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${showFilters ? 'bg-primary border-primary text-bg-dark' : 'bg-[#11291f] border-white/5 text-gray-500'}`}>
          <span className="material-symbols-outlined">tune</span>
        </button>
      </header>

      {showFilters && (
        <div className="bg-[#11291f] rounded-3xl p-6 border border-white/10 mb-6 space-y-4 animate-in fade-in slide-in-from-top-4 shadow-2xl">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Membro</label>
              <select value={filterMember} onChange={e => setFilterMember(e.target.value)} className="w-full bg-[#050c09] border border-white/10 rounded-xl px-3 py-3 text-xs text-white">
                <option value="all">Todos</option>
                <option value="none">Agregado</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Loja/Fonte</label>
              <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="w-full bg-[#050c09] border border-white/10 rounded-xl px-3 py-3 text-xs text-white">
                <option value="all">Todas</option>
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Desde</label>
                <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPeriod('custom'); }} className="w-full bg-[#050c09] border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Até</label>
                <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPeriod('custom'); }} className="w-full bg-[#050c09] border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
             </div>
          </div>
          
          <button 
            onClick={() => { setFilterSource('all'); setFilterMember('all'); setStartDate(''); setEndDate(''); setPeriod('30d'); }}
            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-400 tracking-widest hover:text-white transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: '7d', label: '7 Dias' },
          { id: '30d', label: '30 Dias' },
          { id: 'year', label: 'Este Ano' },
          { id: 'custom', label: 'Custom' }
        ].map(p => (
          <button 
            key={p.id} onClick={() => setPeriod(p.id as any)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border shrink-0 transition-all ${period === p.id ? 'bg-primary text-bg-dark border-primary shadow-lg shadow-primary/20' : 'bg-[#11291f] text-gray-500 border-white/5'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-[#11291f] to-[#050c09] rounded-[2.5rem] p-8 border border-white/5 mb-8 shadow-2xl flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Filtrado</p>
          <h3 className="text-4xl font-black text-white">€{statsData.total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h3>
          <p className="text-[10px] text-primary font-bold">{statsData.count} transações encontradas</p>
        </div>
        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-3xl font-black">payments</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { id: 'bar', icon: 'grid_view', label: 'FONTES' },
          { id: 'pie', icon: 'group', label: 'MEMBROS' },
          { id: 'line', icon: 'monitoring', label: 'TEMPO' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setChartType(t.id as any)}
            className={`flex flex-col items-center gap-2 py-5 rounded-3xl border transition-all ${chartType === t.id ? 'bg-secondary/20 border-secondary text-secondary scale-105' : 'bg-[#11291f] border-white/5 text-gray-500'}`}
          >
            <span className="material-symbols-outlined text-2xl">{t.icon}</span>
            <span className="text-[9px] font-black tracking-widest">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Chart Visualization */}
      <div className="flex-1 min-h-[350px] bg-[#11291f] rounded-[2.5rem] p-8 border border-white/5 relative shadow-2xl mb-8">
        {statsData.count === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-4 opacity-50">
             <span className="material-symbols-outlined text-6xl">query_stats</span>
             <p className="text-xs font-black uppercase tracking-widest">Sem dados para este filtro</p>
          </div>
        ) : (
          <>
            {chartType === 'bar' && (
              <div className="h-full flex flex-col justify-start gap-6 overflow-y-auto no-scrollbar">
                {(Object.entries(statsData.bySource) as [string, number][]).sort((a,b) => b[1] - a[1]).map(([source, amount]) => (
                  <div key={source} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-black text-white uppercase tracking-tight truncate max-w-[150px]">{source}</span>
                      <span className="text-[11px] font-black text-primary">€{amount.toLocaleString('pt-PT')}</span>
                    </div>
                    <div className="h-2.5 bg-[#050c09] rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-1000" 
                        style={{ width: `${(amount / maxSourceVal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {chartType === 'pie' && (
              <div className="h-full flex flex-col items-center justify-center gap-10">
                <div className="relative size-56">
                  <svg viewBox="0 0 32 32" className="size-full -rotate-90">
                    {(Object.entries(statsData.byMember) as [string, number][]).reduce((acc: { elements: any[], offset: number }, [label, value], i: number) => {
                      const total = statsData.total;
                      const percent = total > 0 ? (value / total) * 100 : 0;
                      const strokeDasharray = `${percent} ${100 - percent}`;
                      const offset = acc.offset;
                      acc.offset -= percent;
                      acc.elements.push(
                        <circle 
                          key={label} r="16" cx="16" cy="16" fill="transparent" 
                          stroke={['#13ec5b', '#0ea5e9', '#8b5cf6', '#f43f5e', '#f59e0b'][i % 5]} 
                          strokeWidth="8" strokeDasharray={strokeDasharray} 
                          strokeDashoffset={offset} className="transition-all duration-1000"
                        />
                      );
                      return acc;
                    }, { elements: [] as any[], offset: 25 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col text-center px-4">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-tight">Divisão Família</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full max-h-32 overflow-y-auto no-scrollbar">
                  {(Object.entries(statsData.byMember) as [string, number][]).map(([label, value], i) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: ['#13ec5b', '#0ea5e9', '#8b5cf6', '#f43f5e', '#f59e0b'][i % 5] }}></div>
                      <span className="text-[10px] text-gray-400 font-bold truncate uppercase">{label}</span>
                      <span className="text-[9px] text-white font-black ml-auto">€{value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {chartType === 'line' && (
              <div className="h-full flex flex-col">
                 <div className="flex-1 flex items-end gap-1.5 px-2">
                   {(Object.entries(statsData.byDay) as [string, number][]).sort((a,b) => a[0].localeCompare(b[0])).slice(-15).map(([day, val]) => (
                     <div key={day} className="flex-1 flex flex-col items-center gap-3 group">
                       <div 
                        className="w-full bg-gradient-to-t from-secondary/40 to-secondary hover:from-primary hover:to-primary transition-all rounded-t-lg relative" 
                        style={{ height: `${(val / maxDayVal) * 100}%`, minHeight: '6px' }}
                       >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-bg-dark text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">€{val.toFixed(0)}</div>
                       </div>
                       <span className="text-[8px] text-gray-600 font-black rotate-45 origin-left">{day.split('-')[2]}/{day.split('-')[1]}</span>
                     </div>
                   ))}
                 </div>
                 <p className="text-center text-[10px] text-gray-600 mt-10 font-black uppercase tracking-widest">Gastos diários (últimos registos)</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {statsData.total > 0 && (
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] flex items-center gap-5 animate-in slide-in-from-bottom-4 shadow-xl shadow-primary/5">
          <div className="size-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-2xl">lightbulb</span>
          </div>
          <div>
            <p className="text-[11px] text-primary leading-tight font-medium">
              O maior foco de gasto atual é <span className="font-bold underline">
                {(Object.entries(statsData.bySource) as [string, number][]).sort((a,b)=>b[1]-a[1])[0]?.[0].toUpperCase() || '---'}
              </span>.
            </p>
            {/* Fix: Explicitly cast Object.values to number[] to resolve arithmetic operation and type errors (line 279) */}
            <p className="text-[9px] text-primary/60 mt-1 uppercase font-black tracking-tighter">Representa {(((Object.values(statsData.bySource) as number[]).sort((a,b)=>b-a)[0] || 0) / statsData.total * 100).toFixed(1)}% do total filtrado.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
