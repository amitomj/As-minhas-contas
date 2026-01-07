
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
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [sendByEmail, setSendByEmail] = useState(false);

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const handleExport = async () => {
    let filtered = [...expenses];
    const now = new Date();

    if (period === 'year') {
      filtered = filtered.filter(e => new Date(e.date).getFullYear() === now.getFullYear());
    } else if (period === 'month') {
      filtered = filtered.filter(e => new Date(e.date).getMonth() === selectedMonth && new Date(e.date).getFullYear() === now.getFullYear());
    } else if (period === 'member' && selectedMember !== 'all') {
      filtered = filtered.filter(e => e.memberIds.includes(selectedMember));
    }

    // Ordenação especial: Mesma origem juntas, depois cronológica
    filtered.sort((a, b) => {
      const sourceCompare = a.source.localeCompare(b.source);
      if (sourceCompare !== 0) return sourceCompare;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const reportTitle = `RELATÓRIO FINANCEIRO PRO - ${format.toUpperCase()}`;
    const reportDate = new Date().toLocaleDateString('pt-PT');
    
    let reportContent = `${reportTitle}\nData de Emissão: ${reportDate}\n\n`;
    reportContent += `DATA | ORIGEM | VALOR | RESPONSÁVEL | NOTAS\n`;
    reportContent += `------------------------------------------------------------\n`;

    filtered.forEach(e => {
      const resp = e.memberIds.length === 0 ? 'Agregado' : e.memberIds.map(id => members.find(m => m.id === id)?.name).join(', ');
      reportContent += `${e.date} | ${e.source.padEnd(15)} | €${e.amount.toFixed(2).padStart(8)} | ${resp.padEnd(15)} | ${e.notes || '-'}\n`;
    });

    const total = filtered.reduce((acc, curr) => acc + curr.amount, 0);
    reportContent += `------------------------------------------------------------\n`;
    reportContent += `TOTAL NO PERÍODO: €${total.toFixed(2)}\n`;

    const fileName = `Financas_Pro_${reportDate.replace(/\//g, '-')}.${format === 'excel' ? 'csv' : 'doc'}`;
    const blob = new Blob([reportContent], { type: format === 'excel' ? 'text/csv' : 'text/plain' });
    const url = URL.createObjectURL(blob);

    if (sendByEmail) {
      const subject = encodeURIComponent(`Exportação Financeira Pro - ${reportDate}`);
      const body = encodeURIComponent(`Olá,\n\nSegue abaixo o resumo da exportação em formato ${format.toUpperCase()}:\n\n${reportContent}\n\nEnviado via Finanças Pro.`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      alert("A preparar email com os dados exportados...");
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      alert(`Exportação concluída com sucesso: ${fileName}`);
    }
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar pb-24">
      <header className="flex items-center justify-between pt-8 pb-4 shrink-0">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black text-white">Exportar Dados</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 space-y-8 pt-6">
        {/* Formato */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Formato do Documento</h3>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => setFormat('excel')} className={`flex flex-col items-center gap-3 py-6 rounded-3xl border transition-all shadow-lg ${format === 'excel' ? 'bg-secondary/20 text-secondary border-secondary scale-105' : 'bg-surface-dark border-white/5 text-gray-600'}`}>
               <span className="material-symbols-outlined text-4xl">grid_on</span>
               <span className="text-[10px] font-black tracking-widest">EXCEL (CSV)</span>
             </button>
             <button onClick={() => setFormat('word')} className={`flex flex-col items-center gap-3 py-6 rounded-3xl border transition-all shadow-lg ${format === 'word' ? 'bg-accent/20 text-accent border-accent scale-105' : 'bg-surface-dark border-white/5 text-gray-600'}`}>
               <span className="material-symbols-outlined text-4xl">article</span>
               <span className="text-[10px] font-black tracking-widest">WORD (DOC)</span>
             </button>
          </div>
        </section>

        {/* Período */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Seleção de Dados</h3>
          <div className="space-y-3">
            {[
              { id: 'all', label: 'Todo o histórico civil', icon: 'all_inclusive' },
              { id: 'year', label: 'Ano civil atual', icon: 'calendar_today' },
              { id: 'month', label: 'Mês específico', icon: 'calendar_month' },
              { id: 'member', label: 'Por membro do agregado', icon: 'person_search' }
            ].map(opt => (
              <div key={opt.id} className="space-y-2">
                <button 
                  onClick={() => setPeriod(opt.id as any)} 
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${period === opt.id ? 'bg-primary/5 border-primary text-white ring-1 ring-primary/20' : 'bg-surface-dark border-white/5 text-gray-500'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined">{opt.icon}</span>
                    <span className="text-sm font-bold">{opt.label}</span>
                  </div>
                  {period === opt.id && <span className="material-symbols-outlined text-primary">check_circle</span>}
                </button>
                
                {period === 'month' && opt.id === 'month' && (
                  <div className="grid grid-cols-3 gap-2 p-2 bg-surface-dark/50 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    {months.map((m, i) => (
                      <button key={m} onClick={() => setSelectedMonth(i)} className={`py-2 text-[9px] font-black rounded-lg border transition-all ${selectedMonth === i ? 'bg-secondary text-white border-secondary' : 'bg-bg-dark border-white/5 text-gray-600'}`}>
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}

                {period === 'member' && opt.id === 'member' && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar p-2 bg-surface-dark/50 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => setSelectedMember('all')} className={`px-4 py-2 shrink-0 text-[10px] font-black rounded-lg border transition-all ${selectedMember === 'all' ? 'bg-secondary text-white border-secondary' : 'bg-bg-dark border-white/5 text-gray-600'}`}>TODOS</button>
                    {members.map(m => (
                      <button key={m.id} onClick={() => setSelectedMember(m.id)} className={`px-4 py-2 shrink-0 text-[10px] font-black rounded-lg border transition-all ${selectedMember === m.id ? 'bg-secondary text-white border-secondary' : 'bg-bg-dark border-white/5 text-gray-600'}`}>{m.name.toUpperCase()}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Email Toggle */}
        <section className="pt-2">
          <label className="flex items-center justify-between p-6 bg-surface-dark rounded-[2rem] border border-white/5 cursor-pointer shadow-xl active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all ${sendByEmail ? 'bg-secondary/20 text-secondary' : 'bg-bg-dark/50 text-gray-600'}`}>
                <span className="material-symbols-outlined">alternate_email</span>
              </div>
              <div>
                <span className="text-sm font-bold block">Enviar por Email</span>
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-tighter">Como anexo direto</span>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${sendByEmail ? 'bg-secondary' : 'bg-bg-dark'}`}>
              <div className={`absolute top-1 size-4 rounded-full bg-white transition-all shadow-md ${sendByEmail ? 'left-7' : 'left-1'}`} />
              <input type="checkbox" checked={sendByEmail} onChange={() => setSendByEmail(!sendByEmail)} className="hidden" />
            </div>
          </label>
        </section>
      </main>

      <div className="pt-6 shrink-0">
        <button 
          onClick={handleExport} 
          className="w-full py-5 bg-gradient-to-r from-secondary via-accent to-primary text-white font-black uppercase tracking-[0.2em] rounded-[1.8rem] shadow-2xl shadow-secondary/20 active:scale-95 transition-all"
        >
          Gerar Exportação
        </button>
      </div>
    </div>
  );
};

export default ExportData;
