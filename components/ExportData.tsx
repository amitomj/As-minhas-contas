
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
    let filtered = [...expenses];
    if (period === 'member' && selectedMember !== 'all') {
      filtered = filtered.filter(e => e.memberIds.includes(selectedMember));
    }

    // Ordenação: Todas as despesas da mesma origem juntas e ordem cronológica
    filtered.sort((a, b) => {
      if (a.source.toLowerCase() < b.source.toLowerCase()) return -1;
      if (a.source.toLowerCase() > b.source.toLowerCase()) return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financas_pro_export_${new Date().getTime()}.${format === 'excel' ? 'xlsx' : 'docx'}`;
    link.click();
    alert(`Relatório exportado com sucesso em ${format.toUpperCase()}!`);
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4">
      <header className="flex items-center justify-between pt-8 pb-4">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Relatórios Profissionais</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar space-y-8 pt-6">
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] ml-1">Formato do Ficheiro</h3>
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={() => setFormat('excel')}
               className={`flex flex-col items-center justify-center gap-3 py-6 rounded-3xl border transition-all ${format === 'excel' ? 'bg-primary/20 text-primary border-primary' : 'bg-surface-dark text-gray-600 border-white/5'}`}
             >
               <span className="material-symbols-outlined text-3xl">table_view</span>
               <span className="text-[11px] font-black uppercase">MS Excel</span>
             </button>
             <button 
               onClick={() => setFormat('word')}
               className={`flex flex-col items-center justify-center gap-3 py-6 rounded-3xl border transition-all ${format === 'word' ? 'bg-primary/20 text-primary border-primary' : 'bg-surface-dark text-gray-600 border-white/5'}`}
             >
               <span className="material-symbols-outlined text-3xl">description</span>
               <span className="text-[11px] font-black uppercase">MS Word</span>
             </button>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] ml-1">Filtragem de Dados</h3>
          <div className="space-y-2">
            {[
              { id: 'all', label: 'Todo o Histórico JSON', icon: 'history' },
              { id: 'year', label: 'Ano Civil Atual', icon: 'calendar_today' },
              { id: 'month', label: 'Mês em Curso', icon: 'calendar_month' },
              { id: 'member', label: 'Membro Específico', icon: 'person' }
            ].map(opt => (
              <label 
                key={opt.id}
                className={`flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer ${period === opt.id ? 'bg-primary/5 border-primary' : 'bg-surface-dark border-white/5'}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined ${period === opt.id ? 'text-primary' : 'text-gray-600'}`}>{opt.icon}</span>
                  <span className={`text-sm font-bold ${period === opt.id ? 'text-white' : 'text-gray-500'}`}>{opt.label}</span>
                </div>
                <input 
                  type="radio" 
                  className="hidden" 
                  name="period" 
                  checked={period === opt.id}
                  onChange={() => setPeriod(opt.id as any)}
                />
                {period === opt.id && <span className="material-symbols-outlined text-primary text-xl">check_circle</span>}
              </label>
            ))}
          </div>
        </section>

        {period === 'member' && (
           <section className="space-y-3 animate-in fade-in slide-in-from-top-2">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Selecionar Membro do Agregado</h3>
             <select 
               value={selectedMember}
               onChange={e => setSelectedMember(e.target.value)}
               className="w-full bg-surface-dark border border-white/10 rounded-2xl p-5 text-sm font-bold appearance-none"
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
          className="w-full py-5 bg-primary text-bg-dark font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-primary/30 active:scale-95 transition-all border-4 border-bg-dark"
        >
          Gerar Exportação
        </button>
        <p className="text-[10px] text-gray-600 text-center mt-5 px-6 leading-relaxed">As despesas de mesma origem serão agrupadas e ordenadas por data no ficheiro final.</p>
      </div>
    </div>
  );
};

export default ExportData;
