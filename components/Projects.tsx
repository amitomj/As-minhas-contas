
import React, { useState, useMemo } from 'react';
import { Project, Expense, Member } from '../types';

interface Props {
  projects: Project[];
  expenses: Expense[];
  members: Member[];
  onUpdate: (p: Project[]) => void;
  onDeleteProject: (id: string) => void;
  onBack: () => void;
  onAddExpenseInProject: (projectId: string) => void;
  onEditExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onAddProject: (name: string, desc?: string, notes?: string) => void;
}

// Modal Component for showing notes
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

const ProjectsView: React.FC<Props> = ({ 
  projects, expenses, members, onUpdate, onDeleteProject, 
  onBack, onAddExpenseInProject, onEditExpense, onDeleteExpense, onAddProject 
}) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<{ title: string; content: string } | null>(null);

  const handleAdd = () => {
    if(!name) return;
    onAddProject(name, desc, notes);
    setName(''); setDesc(''); setNotes('');
  };

  const projectStats = useMemo(() => {
    const stats: Record<string, number> = {};
    projects.forEach(p => {
      stats[p.id] = expenses.filter(e => e.projectId === p.id).reduce((acc, curr) => acc + curr.amount, 0);
    });
    return stats;
  }, [projects, expenses]);

  const selectedProjectExpenses = useMemo(() => {
    if (!selectedProjectId) return [];
    return expenses
      .filter(e => e.projectId === selectedProjectId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedProjectId, expenses]);

  const renderProjectDetail = (p: Project) => (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-primary/20 space-y-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-white uppercase">{p.name}</h3>
              {p.notes && (
                <button 
                  onClick={() => setViewingNote({ title: p.name, content: p.notes || '' })}
                  className="bg-primary/20 text-primary size-7 rounded-full flex items-center justify-center animate-pulse"
                >
                  <span className="material-symbols-outlined text-sm font-black">sticky_note_2</span>
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-500 mt-2 uppercase font-black tracking-widest leading-relaxed">{p.description}</p>
          </div>
          <button onClick={() => setSelectedProjectId(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-bg-dark border border-white/5 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-gray-500">close</span>
          </button>
        </div>

        <div className="bg-bg-dark/50 p-6 rounded-[2rem] border border-white/5">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Acumulado</p>
          <p className="text-3xl font-black text-primary">€{projectStats[p.id]?.toFixed(2)}</p>
        </div>

        <div className="flex gap-3">
           <button onClick={() => onAddExpenseInProject(p.id)} className="flex-1 py-5 bg-primary text-bg-dark font-black rounded-2xl uppercase text-[11px] flex items-center justify-center gap-3 tracking-widest">
             <span className="material-symbols-outlined text-lg">add_circle</span> Lançar Gasto
           </button>
           <button onClick={() => { if(confirm('Eliminar projeto e desassociar gastos?')) { onDeleteProject(p.id); setSelectedProjectId(null); } }} className="h-14 w-14 bg-red-500/10 text-red-500 font-black rounded-2xl border border-red-500/20 flex items-center justify-center transition-all active:scale-90">
             <span className="material-symbols-outlined">delete</span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col px-1">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Despesas deste Agrupador</h4>
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-20">
          {selectedProjectExpenses.length === 0 ? (
            <div className="py-20 flex flex-col items-center opacity-20">
              <span className="material-symbols-outlined text-5xl mb-2">inventory_2</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Sem despesas</p>
            </div>
          ) : (
            selectedProjectExpenses.map(exp => (
              <div key={exp.id} className="flex items-center justify-between p-5 bg-surface-dark/50 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                   <div className="relative shrink-0">
                     <div className="h-10 w-10 flex items-center justify-center bg-bg-dark/40 rounded-xl text-secondary">
                        <span className="material-symbols-outlined text-xl">receipt_long</span>
                     </div>
                     {exp.notes && (
                       <button 
                        onClick={() => setViewingNote({ title: exp.source, content: exp.notes || '' })}
                        className="absolute -top-1 -right-1 bg-primary text-bg-dark size-4 rounded-full flex items-center justify-center border border-bg-dark"
                       >
                         <span className="material-symbols-outlined text-[8px] font-black">sticky_note_2</span>
                       </button>
                     )}
                   </div>
                   <div className="overflow-hidden">
                    <p className="text-xs font-black text-white truncate uppercase tracking-widest">{exp.source}</p>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-tighter">{new Date(exp.date).toLocaleDateString('pt-PT')} • {exp.paymentMethod}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-2 shrink-0">
                  <p className="text-sm font-black text-white">€{exp.amount.toFixed(2)}</p>
                  <div className="flex gap-1">
                    <button onClick={() => onEditExpense(exp)} className="text-blue-400 p-2 hover:bg-white/5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-hidden relative">
      <header className="flex items-center gap-4 pt-10 pb-6 shrink-0 px-2">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 active:scale-90 transition-all">
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Área de Projetos</h2>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-2">
        {selectedProjectId ? (
          renderProjectDetail(projects.find(p => p.id === selectedProjectId)!)
        ) : (
          <div className="space-y-10 pb-32 animate-in fade-in duration-500">
            <div className="bg-surface-dark rounded-[3rem] p-8 border border-white/5 space-y-6 shadow-xl">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center mb-2">Novo Agrupador / Projeto</h3>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="NOME DO PROJETO" className="w-full bg-bg-dark border border-white/10 rounded-2xl px-6 py-5 text-xs text-white focus:border-primary uppercase font-black tracking-widest" />
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="DESCRIÇÃO CURTA" className="w-full bg-bg-dark border border-white/10 rounded-2xl px-6 py-5 text-xs text-white focus:border-primary uppercase font-black tracking-widest" />
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="NOTAS DETALHADAS E PLANEAMENTO" 
                className="w-full bg-bg-dark border border-white/10 rounded-[2rem] px-6 py-5 text-xs text-white focus:border-primary font-black min-h-[100px] no-scrollbar placeholder-white/10 uppercase" 
              />
              <button onClick={handleAdd} className="w-full py-5 bg-primary text-bg-dark font-black rounded-2xl uppercase text-[11px] tracking-[0.2em] active:scale-95 transition-all shadow-lg shadow-primary/10">Criar Projeto</button>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Os Meus Projetos Ativos</h3>
              {projects.map(p => (
                <div key={p.id} onClick={() => setSelectedProjectId(p.id)} className="flex items-center justify-between p-6 bg-surface-dark rounded-[2.5rem] border border-white/5 active:scale-[0.98] transition-all cursor-pointer shadow-lg group">
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className="size-14 rounded-2xl bg-bg-dark flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all relative">
                      <span className="material-symbols-outlined text-secondary text-2xl">folder</span>
                      {p.notes && (
                         <div className="absolute -top-1 -right-1 size-4 bg-primary rounded-full border border-bg-dark flex items-center justify-center">
                           <span className="material-symbols-outlined text-[8px] font-black text-bg-dark">sticky_note_2</span>
                         </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-white uppercase text-sm tracking-widest truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-500 font-black tracking-tighter">€{projectStats[p.id]?.toFixed(2)} ACUMULADOS</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary ml-2">chevron_right</span>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="py-20 flex flex-col items-center opacity-10">
                  <span className="material-symbols-outlined text-7xl mb-4">folder_open</span>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em]">Sem projetos ativos</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {viewingNote && (
        <NoteModal 
          title={viewingNote.title} 
          content={viewingNote.content} 
          onClose={() => setViewingNote(null)} 
        />
      )}
    </div>
  );
};

export default ProjectsView;
