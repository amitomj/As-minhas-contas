
import React, { useState } from 'react';
import { Expense, Member } from '../types';

interface Props {
  expenses: Expense[];
  members: Member[];
  onBack: () => void;
}

const ExportData: React.FC<Props> = ({ expenses, members, onBack }) => {
  const [format, setFormat] = useState<'excel' | 'word'>('excel');

  const handleExport = () => {
    if (expenses.length === 0) {
      alert("Não existem dados para exportar.");
      return;
    }
    
    // IMPORTANTE: No telemóvel, NÃO usar setTimeout. O download deve ser imediato ao clique.
    let content = "";
    if (format === 'excel') {
      content = "Data;Origem;Valor;Membros;Notas\n";
      expenses.forEach(e => {
        const mNames = e.memberIds.length === 0 
          ? 'Agregado' 
          : e.memberIds.map(id => members.find(m => m.id === id)?.name).join('|');
        content += `${e.date};${e.source};${e.amount.toFixed(2).replace('.', ',')};${mNames};${e.notes || ''}\n`;
      });
    } else {
      content = `RELATÓRIO DE FINANÇAS - ${new Date().toLocaleDateString('pt-PT')}\n`;
      content += `==========================================\n\n`;
      const grouped: Record<string, Expense[]> = {};
      expenses.forEach(e => {
        if (!grouped[e.source]) grouped[e.source] = [];
        grouped[e.source].push(e);
      });
      Object.entries(grouped).forEach(([source, items]) => {
        content += `ORIGEM: ${source.toUpperCase()}\n`;
        items.forEach(item => {
          const mNames = item.memberIds.length === 0 ? 'Agregado' : item.memberIds.map(id => members.find(m => m.id === id)?.name).join(', ');
          content += `${item.date} | €${item.amount.toFixed(2)} | Membros: ${mNames}\n`;
        });
        content += `\n`;
      });
    }

    try {
      const mimeType = format === 'excel' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8';
      const fileName = `financas_${new Date().getTime()}.${format === 'excel' ? 'csv' : 'txt'}`;
      const blob = new Blob([format === 'excel' ? "\uFEFF" + content : content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erro ao exportar no telemóvel. Verifique as permissões do browser.");
    }
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 pt-10 pb-6 shrink-0">
        <button onClick={onBack} className="h-14 w-14 flex items-center justify-center rounded-full bg-surface-dark border border-white/5">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Exportar</h2>
      </header>

      <div className="space-y-8 flex-1 px-2">
        <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-6 shadow-2xl">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setFormat('excel')} 
              className={`py-8 rounded-3xl border flex flex-col items-center gap-3 ${format === 'excel' ? 'border-primary text-primary bg-primary/10' : 'border-white/5 text-gray-600 bg-bg-dark/50'}`}
            >
              <span className="material-symbols-outlined text-4xl">table_view</span>
              <span className="text-[11px] font-black uppercase">Excel</span>
            </button>
            <button 
              onClick={() => setFormat('word')} 
              className={`py-8 rounded-3xl border flex flex-col items-center gap-3 ${format === 'word' ? 'border-primary text-primary bg-primary/10' : 'border-white/5 text-gray-600 bg-bg-dark/50'}`}
            >
              <span className="material-symbols-outlined text-4xl">description</span>
              <span className="text-[11px] font-black uppercase">Word</span>
            </button>
          </div>

          <button 
            onClick={handleExport}
            className="w-full py-6 bg-primary text-bg-dark font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
          >
            Descarregar Ficheiro
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
