
import React, { useState, useEffect, useRef } from 'react';
import { Member, Expense, Project } from '../types';

interface AddExpenseProps {
  sources: string[];
  paymentMethods: string[];
  members: Member[];
  projects: Project[];
  onSave: (expense: { amount: number, date: string, source: string, paymentMethod: string, memberIds: string[], projectId?: string, notes: string }) => void;
  onBack: () => void;
  editingExpense?: Expense;
  preSelectedProjectId?: string;
  onUpdateSources: (s: string[]) => void;
  onDeleteSource: (s: string) => void;
  onUpdateMethods: (m: string[]) => void;
  onDeleteMethod: (m: string) => void;
  onAddProject: (name: string, desc?: string, notes?: string) => void;
  onUpdateProjects: (p: Project[]) => void;
  onDeleteProject: (id: string) => void;
}

const CustomSelect: React.FC<{
  label?: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  className?: string;
}> = ({ value, options, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-black border-[4px] border-black rounded-[2.5rem] px-6 py-5 text-sm font-black text-white uppercase tracking-widest flex items-center justify-between shadow-inner ${className}`}
      >
        <span className="truncate flex-1 text-center">{selectedOption?.label || value}</span>
        <span className="material-symbols-outlined text-primary ml-2">expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute z-[100] top-full mt-2 w-full bg-black border-[4px] border-black rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-6 py-4 text-xs font-black uppercase tracking-widest text-center transition-colors border-b border-white/5 last:border-none ${
                  value === opt.value ? 'bg-primary text-bg-dark' : 'text-white hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AddExpense: React.FC<AddExpenseProps> = ({ 
  sources, paymentMethods, members, projects, onSave, onBack, 
  editingExpense, preSelectedProjectId, onUpdateSources, onDeleteSource, 
  onUpdateMethods, onDeleteMethod, onAddProject, onUpdateProjects, onDeleteProject
}) => {
  const [amount, setAmount] = useState<string>(editingExpense?.amount.toString() || '');
  const [date, setDate] = useState<string>(editingExpense?.date || new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState<string>(editingExpense?.source || (sources[0] || ''));
  const [paymentMethod, setPaymentMethod] = useState<string>(editingExpense?.paymentMethod || (paymentMethods[0] || ''));
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(editingExpense?.memberIds || []);
  const [projectId, setProjectId] = useState<string | undefined>(editingExpense?.projectId || preSelectedProjectId);
  const [notes, setNotes] = useState<string>(editingExpense?.notes || '');
  
  const [activeManager, setActiveManager] = useState<'source' | 'method' | 'project' | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    if (id) {
      const selectedProj = projects.find(p => p.id === id);
      if (selectedProj) {
        setSource(selectedProj.name);
      }
    }
  };

  const handleSave = () => {
    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || !source || !paymentMethod) { alert("Preencha valor, origem e pagamento."); return; }
    onSave({ amount: val, date, source, paymentMethod, memberIds: selectedMemberIds, projectId, notes });
  };

  const renderManager = (type: 'source' | 'method' | 'project') => {
    return (
      <div className="space-y-4 bg-[#050c09] p-5 rounded-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-200 mt-4 shadow-xl">
        <div className="flex gap-2">
          <input 
            value={newItemName} 
            onChange={e => setNewItemName(e.target.value)} 
            placeholder={`Novo ${type === 'project' ? 'projeto' : 'item'}...`} 
            className="flex-1 bg-bg-dark border border-white/10 rounded-xl px-4 text-xs h-12 text-white placeholder-white/20 uppercase font-black" 
          />
          <button 
            onClick={() => { 
              if(!newItemName) return;
              if(type === 'source') onUpdateSources([...sources, newItemName]);
              else if(type === 'method') onUpdateMethods([...paymentMethods, newItemName]);
              else onAddProject(newItemName);
              setNewItemName(''); 
            }} 
            className="bg-primary text-bg-dark px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest"
          >
            ADD
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-2 no-scrollbar">
          {type === 'project' ? (
            projects.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-black text-white/70">{p.name}</span>
                <button onClick={() => onDeleteProject(p.id)} className="text-red-400 material-symbols-outlined text-sm">delete</button>
              </div>
            ))
          ) : (
            (type === 'source' ? sources : paymentMethods).map(item => (
              <div key={item} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-black text-white/70">{item}</span>
                <button onClick={() => type === 'source' ? onDeleteSource(item) : onDeleteMethod(item)} className="text-red-400 material-symbols-outlined text-sm">delete</button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col px-6 overflow-y-auto pb-40 no-scrollbar">
      <header className="flex items-center justify-between pt-12 pb-8 shrink-0 relative">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-[#11291f] border border-white/5 active:scale-90 transition-all">
          <span className="material-symbols-outlined font-black text-white">arrow_back</span>
        </button>
        <h2 className="font-black text-lg text-white absolute left-1/2 -translate-x-1/2">Registar Gasto</h2>
        <div className="w-12"></div>
      </header>

      <div className="flex flex-col items-center py-4">
        <div className="flex flex-col items-center">
          <input 
            type="number" 
            inputMode="decimal" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="0.00" 
            className="bg-transparent text-[84px] font-black w-full text-center text-white/20 border-none focus:ring-0 placeholder-white/5 caret-primary focus:text-white transition-all leading-none" 
          />
          <span className="text-primary font-black text-sm tracking-[0.4em] uppercase mt-2">EUR</span>
        </div>
      </div>

      <div className="bg-[#11291f]/50 rounded-[3rem] p-8 border border-white/5 space-y-6 backdrop-blur-sm mb-10">
        {/* ORIGEM */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-4">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Origem / Loja</span>
            <button 
              onClick={() => setActiveManager(activeManager === 'source' ? null : 'source')} 
              className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeManager === 'source' ? 'text-primary underline' : 'text-secondary'}`}
            >
              {activeManager === 'source' ? 'TERMINAR' : 'GERIR'}
            </button>
          </div>
          {activeManager === 'source' ? renderManager('source') : (
            <CustomSelect 
              value={source} 
              onChange={setSource} 
              options={sources.map(s => ({ label: s.toUpperCase(), value: s }))} 
            />
          )}
        </div>

        {/* TIPO PAGAMENTO */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-4">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Meio de Pagamento</span>
            <button 
              onClick={() => setActiveManager(activeManager === 'method' ? null : 'method')} 
              className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeManager === 'method' ? 'text-primary underline' : 'text-secondary'}`}
            >
              {activeManager === 'method' ? 'TERMINAR' : 'GERIR'}
            </button>
          </div>
          {activeManager === 'method' ? renderManager('method') : (
            <CustomSelect 
              value={paymentMethod} 
              onChange={setPaymentMethod} 
              options={paymentMethods.map(m => ({ label: m.toUpperCase(), value: m }))} 
            />
          )}
        </div>

        {/* PROJETO */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-4">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Projeto (Férias, Obras...)</span>
            <button 
              onClick={() => setActiveManager(activeManager === 'project' ? null : 'project')} 
              className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeManager === 'project' ? 'text-primary underline' : 'text-secondary'}`}
            >
              {activeManager === 'project' ? 'TERMINAR' : 'NOVO'}
            </button>
          </div>
          {activeManager === 'project' ? renderManager('project') : (
            <CustomSelect 
              value={projectId || ''} 
              onChange={handleProjectChange} 
              options={[
                { label: 'NENHUM (CONTA GERAL)', value: '' },
                ...projects.map(p => ({ label: p.name.toUpperCase(), value: p.id }))
              ]} 
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
           <div className="space-y-3">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-4">Membro</span>
              <CustomSelect 
                value={selectedMemberIds[0] || ''} 
                onChange={(val) => setSelectedMemberIds(val ? [val] : [])} 
                className="text-[10px] px-2"
                options={[
                  { label: 'AGREGADO', value: '' },
                  ...members.map(m => ({ label: m.name.toUpperCase(), value: m.id }))
                ]} 
              />
           </div>
           <div className="space-y-3">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-4">Data</span>
              <div className="relative">
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="w-full bg-black border-[4px] border-black rounded-[2.5rem] px-4 py-5 text-[10px] font-black text-white uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all shadow-inner text-center appearance-none" 
                />
              </div>
           </div>
        </div>

        {/* NOTAS */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-4">Notas / Detalhes</span>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observações importantes..."
            className="w-full bg-black border-[4px] border-black rounded-[2.5rem] px-6 py-5 text-sm font-black text-white uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all shadow-inner min-h-[120px] no-scrollbar placeholder-white/10"
          />
        </div>
      </div>

      <div className="pb-10">
        <button 
          onClick={handleSave} 
          className="w-full py-6 bg-primary text-bg-dark font-black rounded-[2.5rem] text-[13px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined font-black">check_circle</span>
          SALVAR GASTO
        </button>
      </div>
    </div>
  );
};

export default AddExpense;
