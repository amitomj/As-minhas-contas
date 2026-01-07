
import React, { useState } from 'react';
import { Expense, Member } from '../types';

interface Props {
  expenses: Expense[];
  members: Member[];
  onBack: () => void;
}

const ExportData: React.FC<Props> = ({ expenses, members, onBack }) => {
  const [format, setFormat] = useState<'excel' | 'word'>('excel');
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    
    setTimeout(() => {
      const grouped: Record<string, Expense[]> = {};
      expenses.forEach(e => {
        if (!grouped[e.source]) grouped[e.source] = [];
        grouped[e.source].push(e);
      });

      Object.keys(grouped).forEach(source => {
        grouped[source].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });

      let content = "";
      if (format === 'excel') {
        // Formato CSV compatível com Excel Europeu (separado por ponto e vírgula)
        content = "Data;Origem;Valor;Membros\n";
        expenses.forEach(e => {
          const mNames = e.memberIds.length === 0 
            ? 'Agregado' 
            : e.memberIds.map(id => members.find(m => m.id === id)?.name).join('|');
          content += `${e.date};${e.source};${e.amount.toFixed(2).replace('.', ',')};${mNames}\n`;
        });
      } else {
        content = `RELATÓRIO DE FINANÇAS - ${new Date().toLocaleDateString()}\n`;
        content += `==========================================\n\n`;
        Object.entries(grouped).forEach(([source, items]) => {
          content += `ORIGEM: ${source.toUpperCase()}\n`;
          items.forEach(item => {
            const mNames = item.memberIds.length === 0 ? 'Agregado' : item.memberIds.map(id => members.find(m => m.id === id)?.name).join(', ');
            content += `${item.date} | €${item.amount.toFixed(2)} | Membros: ${mNames}\n`;
          });
          content += `\n`;
        });
      }

      const mimeType = format === 'excel' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8';
      const fileName = `financas_pro_${format}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'csv' : 'txt'}`;
      
      const blob = new Blob([format === 'excel' ? "\uFEFF" + content : content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setExporting(false);
      alert("Ficheiro gerado! Verifique a sua pasta de Downloads.");
    }, 800);
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 pt-10 pb-6 shrink-0">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Exportar Dados</h2>
      </header>

      <div className="space-y-8 flex-1">
        <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-6 shadow-2xl">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Escolha o Formato</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setFormat('excel')} 
              className={`py-8 rounded-3xl border transition-all flex flex-col items-center gap-3 ${format === 'excel' ? 'border-primary text-primary bg-primary/10' : 'border-white/5 text-gray-600 bg-bg-dark/50'}`}
            >
              <span className="material-symbols-outlined text-4xl">table_view</span>
              <span className="text-[11px] font-black">EXCEL (.csv)</span>
            </button>
            <button 
              onClick={() => setFormat('word')} 
              className={`py-8 rounded-3xl border transition-all flex flex-col items-center gap-3 ${format === 'word' ? 'border-primary text-primary bg-primary/10' : 'border-white/5 text-gray-600 bg-bg-dark/50'}`}
            >
              <span className="material-symbols-outlined text-4xl">description</span>
              <span className="text-[11px] font-black">WORD (.txt)</span>
            </button>
          </div>

          <button 
            onClick={handleExport}
            disabled={exporting || expenses.length === 0}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all ${exporting || expenses.length === 0 ? 'bg-gray-800 text-gray-600 opacity-50' : 'bg-gradient-to-r from-secondary to-primary text-white active:scale-95'}`}
          >
            {exporting ? "A gerar..." : "Descarregar Agora"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
