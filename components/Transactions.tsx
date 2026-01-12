
import React, { useState, useMemo } from 'react';
import { Expense, Member, Project } from '../types';

interface Props {
  expenses: Expense[];
  members: Member[];
  projects?: Project[];
  onBack: () => void;
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
}

const NoteModal: React.FC<{ title: string; content: string; onClose: () => void }> = ({ title, content, onClose }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
    <div className="bg-surface-dark w-full max-w-sm rounded-[3rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">Observações</h3>
        <button onClick={onClose} className="material-symbols-outlined text-gray-500">close</button>
      </div>
      <p className="text-gray-400 text-xs font-black uppercase tracking-widest leading-relaxed mb-8">{title}</p>
      <div className="bg-bg-dark/50 p-6 rounded-2xl border border-white/5 min-h-[150px] max-h-[300px] overflow-y-auto no-scrollbar">
        <p className="text-white text-sm whitespace-pre-wrap">{content || 'Sem notas adicionais.'}</p>
      </div>
      <button onClick={onClose} className="w-full mt-8 py-4 bg-primary text-bg-dark font-black rounded-2xl uppercase text-[11px] tracking-widest">Fechar</button>
    </div>
  </div>
);

const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const fuzzyMatch = (text: string, query: string) => {
  if (!query) return true;
  const nText = normalizeString(text);
  const nQuery = normalizeString(query);
  if (nText.includes(nQuery)) return true;
  let qIdx = 0;
  for (let tIdx = 0; tIdx < nText.length && qIdx < nQuery.length; tIdx++) {
    if (nText[tIdx] === nQuery[qIdx]) qIdx++;
  }
  return qIdx / nQuery.length >= 0.8;
};

const Transactions: React.FC<Props> = ({ expenses = [], members = [], projects = [], onBack, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filterMember, setFilterMember] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<Expense | null>(null);

  const sources = useMemo(() => Array.from(new Set(expenses.map(e => e.source))), [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const matchesSearch = !search.trim() || fuzzyMatch(e.source, search) || fuzzyMatch(e.notes || '', search);
        const matchesMember = filterMember === 'all' || (filterMember === 'none' && e.memberIds.length === 0) || (filterMember !== 'all' && filterMember !== 'none' && e.memberIds.includes(filterMember));
        const matchesSource = filterSource === 'all' || e.source === filterSource;
        const matchesProject = filterProject === 'all' || (filterProject === 'none' && !e.projectId) || (filterProject !== 'all' && filterProject !== 'none' && e.projectId === filterProject);
        const matchesDateStart = !filterDateStart || e.date >= filterDateStart;
        const matchesDateEnd = !filterDateEnd || e.date <= filterDateEnd;
        return matchesSearch && matchesMember && matchesSource && matchesProject && matchesDateStart && matchesDateEnd;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, search, filterMember, filterSource, filterProject, filterDateStart, filterDateEnd]);

  const handleDelete = (id: string) => {
    if (confirm("Deseja eliminar este registo?")) {
      onDelete(id);
      setActionMenuId(null);
    }
  };

  const selectClasses = "w-full bg-[#050c09] border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white uppercase font-black tracking-widest appearance-none";

  return (
    <div className="h-full bg-[#050c09] flex flex-col pb-24 overflow-hidden relative">
      <header className="px-6 pt-12 pb-4 space-y-4 shrink-0 bg-[#050c09]/90 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-[#11291f] border border-white/5 active:scale-90 transition-all">
              <span className="material-symbols-outlined text-2xl font-black text-white">arrow_back</span>
            </button>
            <h2 className="text-2xl font-black text-white">Histórico</h2>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`h-12 w-12 flex items-center justify-center rounded-xl border transition-all ${showFilters ? 'bg-primary border-primary text-bg-dark' : 'bg-[#11291f] border-white/5 text-gray-500'}`}>
            <span className="material-symbols-outlined">{showFilters ? 'close' : 'tune'}</span>
          </button>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
          <input 
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisa inteligente..."
            className="w-full bg-[#11291f] border border-white/5 rounded-[1.5rem] pl-12 pr-4 py-4 text-sm focus:ring-primary focus:border-primary text-white font-bold"
          />
        </div>
      </header>

      {/* Filtros em Modal Overlay para não prender o scroll */}
      {showFilters && (
        <div className="absolute inset-0 top-[180px] z-40 bg-black/60 backdrop-blur-sm p-6 overflow-y-auto no-scrollbar" onClick={() => setShowFilters(false)}>
           <div className="bg-[#11291f] rounded-[3rem] p-8 border border-white/10 space-y-5 animate-in slide-in-from-top-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Membro</label>
                  <div className="relative">
                    <select value={filterMember} onChange={e => setFilterMember(e.target.value)} className={selectClasses}>
                      <option value="all">TODOS</option>
                      <option value="none">AGREGADO</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-xs pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Loja</label>
                  <div className="relative">
                    <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className={selectClasses}>
                      <option value="all">TODAS</option>
                      {sources.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-xs pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Projeto</label>
                <div className="relative">
                  <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className={selectClasses}>
                    <option value="all">TODOS OS PROJETOS</option>
                    <option value="none">SEM PROJETO</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-xs pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Início</label>
                  <input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} className={selectClasses} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Fim</label>
                  <input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} className={selectClasses} />
                </div>
              </div>

              <button onClick={() => setShowFilters(false)} className="w-full py-4 bg-primary text-bg-dark font-black rounded-2xl uppercase text-[11px] tracking-widest shadow-xl">
                Aplicar Filtros
              </button>
           </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 gap-4">
            <span className="material-symbols-outlined text-6xl opacity-20">history</span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Sem resultados</p>
          </div>
        ) : (
          filteredExpenses.map(exp => (
            <div key={exp.id} className="relative">
              <div 
                className={`flex items-center justify-between p-5 bg-[#11291f] rounded-[2rem] border transition-all active:scale-[0.98] ${actionMenuId === exp.id ? 'border-primary ring-1 ring-primary/20' : 'border-white/5'}`}
                onClick={() => setActionMenuId(actionMenuId === exp.id ? null : exp.id)}
              >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className="h-12 w-12 flex items-center justify-center bg-bg-dark/60 rounded-2xl text-secondary shrink-0 relative">
                    <span className="material-symbols-outlined text-2xl font-black">shopping_bag</span>
                    {exp.notes && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setViewingNote(exp); }}
                        className="absolute -top-1 -right-1 bg-primary text-bg-dark size-5 rounded-full flex items-center justify-center border-2 border-[#11291f] shadow-lg animate-pulse"
                      >
                        <span className="material-symbols-outlined text-[10px] font-black">sticky_note_2</span>
                      </button>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-black truncate text-white uppercase tracking-widest">{exp.source}</p>
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">
                      {new Date(exp.date).toLocaleDateString('pt-PT')} • {exp.memberIds.length === 0 ? 'AGREGADO' : (
                        exp.memberIds.map(id => members.find(m => m.id === id)?.name).filter(Boolean).join(', ').toUpperCase()
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="text-sm font-black text-white">€{exp.amount.toFixed(2)}</p>
                  <span className={`material-symbols-outlined text-gray-700 transition-transform ${actionMenuId === exp.id ? 'rotate-90 text-primary' : ''}`}>chevron_right</span>
                </div>
              </div>
              
              {actionMenuId === exp.id && (
                <div className="absolute right-4 top-16 bg-black border-[3px] border-black rounded-3xl shadow-2xl z-50 p-2 min-w-[160px] animate-in fade-in zoom-in-95">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(exp); setActionMenuId(null); }}
                    className="w-full flex items-center gap-3 px-5 py-4 text-[10px] font-black text-blue-400 hover:bg-white/5 rounded-2xl transition-colors uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span> Editar
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
                    className="w-full flex items-center gap-3 px-5 py-4 text-[10px] font-black text-red-400 hover:bg-white/5 rounded-2xl transition-colors uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      {viewingNote && (
        <NoteModal 
          title={viewingNote.source} 
          content={viewingNote.notes || ''} 
          onClose={() => setViewingNote(null)} 
        />
      )}
    </div>
  );
};

export default Transactions;
