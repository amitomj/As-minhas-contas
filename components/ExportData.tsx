
import React, { useState } from 'react';
import { Expense, Member } from '../types';

interface Props {
  expenses: Expense[];
  members: Member[];
  onBack: () => void;
}

const ExportData: React.FC<Props> = ({ expenses, members, onBack }) => {
  const [format, setFormat] = useState<'excel' | 'word'>('excel');

  const doExport = () => {
    if (expenses.length === 0) { alert("Sem dados."); return; }
    
    let content = format === 'excel' ? "Data;Origem;Valor\n" : "RELATORIO\n\n";
    expenses.forEach(e => {
      content += `${e.date};${e.source};${e.amount.toFixed(2)}\n`;
    });

    try {
      const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financas.${format === 'excel' ? 'csv' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      alert("Sucesso! Verifique a pasta Downloads.");
    } catch (e) {
      alert("Erro no download: " + e);
    }
  };

  return (
    <div className="h-full bg-bg-dark p-6">
      <header className="flex items-center gap-4 pt-8 pb-10">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark btn-active">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Exportar</h2>
      </header>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setFormat('excel')} className={`py-10 rounded-3xl border flex flex-col items-center gap-3 ${format === 'excel' ? 'border-primary bg-primary/10 text-primary' : 'border-white/5'}`}>
            <span className="material-symbols-outlined text-4xl">table_view</span>
            <span className="text-[10px] font-black">EXCEL</span>
          </button>
          <button onClick={() => setFormat('word')} className={`py-10 rounded-3xl border flex flex-col items-center gap-3 ${format === 'word' ? 'border-primary bg-primary/10 text-primary' : 'border-white/5'}`}>
            <span className="material-symbols-outlined text-4xl">description</span>
            <span className="text-[10px] font-black">WORD</span>
          </button>
        </div>
        <button onClick={doExport} className="w-full py-6 bg-primary text-bg-dark font-black rounded-2xl btn-active">GERAR FICHEIRO</button>
      </div>
    </div>
  );
};

export default ExportData;
