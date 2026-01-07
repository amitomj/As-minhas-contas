
import React, { useState } from 'react';
import { Expense, Member } from '../types';

interface Props {
  expenses: Expense[];
  members: Member[];
  onBack: () => void;
}

const ExportData: React.FC<Props> = ({ expenses, members, onBack }) => {
  const [format, setFormat] = useState<'excel' | 'word'>('excel');
  const [period, setPeriod] = useState<'all' | 'year' | 'month' | 'member'>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');

  const handleExport = () => {
    // Process expenses as requested: grouped by source and chronological
    let filtered = [...expenses];
    if (period === 'member' && selectedMember !== 'all') {
      filtered = filtered.filter(e => e.memberId === selectedMember);
    }

    // Sorting: Grouped by source, then chronological within each source
    filtered.sort((a, b) => {
      if (a.source < b.source) return -1;
      if (a.source > b.source) return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financas_pro_export_${new Date().getTime()}.${format === 'excel' ? 'xlsx' : 'docx'}`; // Simulated extension
    link.click();
    alert(`Relatório exportado em ${format.toUpperCase()}! (Simulado como JSON para download web)`);
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4">
      <header className="flex items-center justify-between pt-8 pb-4">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Relatórios e Exportação</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar space-y-8 pt-6">
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase">Formato</h3>
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={() => setFormat('excel')}
               className={`flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${format === 'excel' ? 'bg-primary text-bg-dark border-primary' : 'bg-surface-dark text-gray-400 border-white/5'}`}
             >
               <span className="material-symbols-outlined">table_view</span>
               <span className="font-bold">Excel</span>
             </button>
             <button 
               onClick={() => setFormat('word')}
               className={`flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${format === 'word' ? 'bg-primary text-bg-dark border-primary' : 'bg-surface-dark text-gray-400 border-white/5'}`}
             >
               <span className="material-symbols-outlined">description</span>
               <span className="font-bold">Word</span>
             </button>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase">Período / Filtro</h3>
          <div className="space-y-3">
            {[
              { id: 'all', label: 'Todo o Histórico' },
              { id: 'year', label: 'Ano Civil Completo' },
              { id: 'month', label: 'Mês Específico' },
              { id: 'member', label: 'Por Membro do Agregado' }
            ].map(opt => (
              <label 
                key={opt.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${period === opt.id ? 'bg-primary/5 border-primary' : 'bg-surface-dark border-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${period === opt.id ? 'border-primary' : 'border-gray-500'}`}>
                    {period === opt.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className={`text-sm font-bold ${period === opt.id ? 'text-white' : 'text-gray-400'}`}>{opt.label}</span>
                </div>
                <input 
                  type="radio" 
                  className="hidden" 
                  name="period" 
                  checked={period === opt.id}
                  onChange={() => setPeriod(opt.id as any)}
                />
              </label>
            ))}
          </div>
        </section>

        {period === 'member' && (
           <section className="space-y-3 animate-in fade-in slide-in-from-top-2">
             <h3 className="text-sm font-bold text-gray-500 uppercase">Selecionar Membro</h3>
             <select 
               value={selectedMember}
               onChange={e => setSelectedMember(e.target.value)}
               className="w-full bg-surface-dark border border-white/10 rounded-2xl p-4 text-sm"
             >
                <option value="all">Todos os Membros</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
             </select>
           </section>
        )}
      </main>

      <div className="mt-4 pb-24">
        <button 
          onClick={handleExport}
          className="w-full py-4 bg-primary text-bg-dark font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Exportar Dados
        </button>
        <p className="text-[10px] text-gray-500 text-center mt-3">Todas as despesas da mesma origem aparecerão juntas e por ordem cronológica.</p>
      </div>
    </div>
  );
};

export default ExportData;
