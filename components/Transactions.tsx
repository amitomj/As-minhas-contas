
import React, { useState, useMemo } from 'react';
import { Expense, Member } from '../types';

interface Props {
  expenses: Expense[];
  members: Member[];
  onBack: () => void;
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
}

const Transactions: React.FC<Props> = ({ expenses, members, onBack, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filterMember, setFilterMember] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const sources = useMemo(() => Array.from(new Set(expenses.map(e => e.source))), [expenses]);

  const filteredExpenses = useMemo(() => {
    // Garantir que trabalhamos com uma cópia ordenada por data (mais recente primeiro)
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(e => {
        // Busca textual (apenas se houver texto)
        const matchesSearch = !search.trim() || 
                              e.source.toLowerCase().includes(search.toLowerCase()) || 
                              (e.notes || '').toLowerCase().includes(search.toLowerCase());
        
        // Membro
        const matchesMember = filterMember === 'all' || 
                              e.memberIds.includes(filterMember) || 
                              (filterMember === 'none' && e.memberIds.length === 0);
        
        // Origem
        const matchesSource = filterSource === 'all' || e.source === filterSource;
        
        // Datas
        const matchesDateStart = !filterDateStart || e.date >= filterDateStart;
        const matchesDateEnd = !filterDateEnd || e.date <= filterDateEnd;
        
        return matchesSearch && matchesMember && matchesSource && matchesDateStart && matchesDateEnd;
      });
  }, [expenses, search, filterMember, filterSource, filterDateStart, filterDateEnd]);

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja eliminar esta despesa?")) {
      onDelete(id);
      setActionMenuId(null);
    }
  };

  return (
    <div className="h-full bg-[#050c09] flex flex-col pb-24 overflow-hidden">
      <header className="px-6 pt-12 pb-4 space-y-4 shrink-0 bg-[#050c09]/80 backdrop-blur-md z-10 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full bg-[#11291f] border border-white/5">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <h2 className="text-2xl font-black">Histórico</h2>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-xl border transition-all ${showFilters ? 'bg-primary border-primary text-bg-dark' : 'bg-[#11291f] border-white/5 text-gray-500'}`}>
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
          <input 
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar loja..."
            className="w-full bg-[#11291f] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-primary focus:border-primary text-white"
          />
        </div>

        {showFilters && (
          <div className="p-5 bg-[#11291f] rounded-3xl border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-4 shadow-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Membro</label>
                <select value={filterMember} onChange={e => setFilterMember(e.target.value)} className="w-full bg-[#050c09] border border-white/10 rounded-xl px-4 py-3 text-xs text-white">
                  <option value="all">Todos</option>
                  <option value="none">Agregado</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Loja</label>
                <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="w-full bg-[#050c09] border border-white/10 rounded-xl px-4 py-3 text-xs text-white">
                  <option value="all">Todas</option>
                  {sources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Início</label>
                <input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} className="w-full bg-[#050c09] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Fim</label>
                <input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} className="w-full bg-[#050c09] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" />
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 gap-4">
            <span className="material-symbols-outlined text-6xl opacity-20">history</span>
            <p className="text-sm font-black uppercase tracking-widest opacity-30">Sem registos encontrados</p>
          </div>
        ) : (
          filteredExpenses.map(exp => (
            <div key={exp.id} className="relative group">
              <div 
                className={`flex items-center justify-between p-5 bg-[#11291f] rounded-[1.8rem] border transition-all active:scale-[0.98] ${actionMenuId === exp.id ? 'border-primary ring-1 ring-primary/20' : 'border-white/5'}`}
                onClick={() => setActionMenuId(actionMenuId === exp.id ? null : exp.id)}
              >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className="h-12 w-12 flex items-center justify-center bg-bg-dark/60 rounded-2xl text-secondary">
                    <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate text-white">{exp.source}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                      {new Date(exp.date).toLocaleDateString('pt-PT')} • {exp.memberIds.length === 0 ? 'Agregado' : (
                        exp.memberIds.map(id => members.find(m => m.id === id)?.name).filter(Boolean).join(', ')
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="text-sm font-black text-white">€{exp.amount.toFixed(2)}</p>
                  <span className="material-symbols-outlined text-gray-700">chevron_right</span>
                </div>
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
                    onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-red-400 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Transactions;
