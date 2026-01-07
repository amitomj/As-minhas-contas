
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
  const [showFilters, setShowFilters] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const sources = useMemo(() => Array.from(new Set(expenses.map(e => e.source))), [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.source.toLowerCase().includes(search.toLowerCase()) || 
                            e.notes?.toLowerCase().includes(search.toLowerCase());
      const matchesMember = filterMember === 'all' || e.memberIds.includes(filterMember) || (filterMember === 'none' && e.memberIds.length === 0);
      const matchesSource = filterSource === 'all' || e.source === filterSource;
      return matchesSearch && matchesMember && matchesSource;
    });
  }, [expenses, search, filterMember, filterSource]);

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja eliminar esta despesa?")) {
      onDelete(id);
      setActionMenuId(null);
    }
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col pb-24">
      <header className="px-6 pt-12 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Extrato Completo</h2>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-primary border-primary text-bg-dark' : 'bg-surface-dark border-white/5 text-gray-500'}`}>
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
          <input 
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por origem ou notas..."
            className="w-full bg-surface-dark border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-primary focus:border-primary"
          />
        </div>

        {showFilters && (
          <div className="p-4 bg-surface-dark rounded-2xl border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Filtrar por Membro</label>
              <select value={filterMember} onChange={e => setFilterMember(e.target.value)} className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2 text-xs">
                <option value="all">Todos os Membros</option>
                <option value="none">Todo o Agregado</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Filtrar por Origem</label>
              <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2 text-xs">
                <option value="all">Todas as Origens</option>
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 gap-4">
            <span className="material-symbols-outlined text-6xl opacity-20">search_off</span>
            <p className="text-sm font-medium text-gray-700">Nenhuma transação encontrada</p>
          </div>
        ) : (
          filteredExpenses.map(exp => (
            <div key={exp.id} className="relative group">
              <div className={`flex items-center justify-between p-5 bg-surface-dark rounded-3xl border transition-all ${actionMenuId === exp.id ? 'border-primary' : 'border-white/5'}`}>
                <div className="flex items-center gap-4 flex-1" onClick={() => setActionMenuId(actionMenuId === exp.id ? null : exp.id)}>
                  <div className="h-11 w-11 flex items-center justify-center bg-bg-dark/50 rounded-2xl">
                    <span className="material-symbols-outlined text-primary text-xl">shopping_cart</span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{exp.source}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                      {new Date(exp.date).toLocaleDateString('pt-PT')} • {exp.memberIds.length === 0 ? 'Agregado' : (
                        exp.memberIds.map(id => members.find(m => m.id === id)?.name).filter(Boolean).join(', ')
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="text-sm font-black">-€{exp.amount.toFixed(2)}</p>
                  <button onClick={() => setActionMenuId(actionMenuId === exp.id ? null : exp.id)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/5">
                    <span className="material-symbols-outlined text-sm text-gray-600">more_vert</span>
                  </button>
                </div>
              </div>

              {actionMenuId === exp.id && (
                <div className="absolute right-2 top-14 bg-bg-dark border border-white/10 rounded-2xl shadow-2xl z-50 p-2 min-w-[120px] animate-in fade-in zoom-in-95">
                  <button 
                    onClick={() => { onEdit(exp); setActionMenuId(null); }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-[11px] font-bold text-blue-400 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span> Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(exp.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-[11px] font-bold text-red-400 hover:bg-white/5 rounded-xl transition-colors"
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
