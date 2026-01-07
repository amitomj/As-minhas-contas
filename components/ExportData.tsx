
import React, { useState } from 'react';
import { Expense, Member } from '../types';

interface Props {
  expenses: Expense[];
  members: Member[];
  onBack: () => void;
}

const ExportData: React.FC<Props> = ({ expenses, members, onBack }) => {
  const [format, setFormat] = useState<'excel' | 'word'>('excel');

  const handleExportDirect = () => {
    if (expenses.length === 0) {
      alert("Não existem dados para exportar.");
      return;
    }
    
    // NO MOBILE: O download DEVE ser síncrono para não ser bloqueado como pop-up.
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
      const fileName = `financas_pro_${new Date().getTime()}.${format === 'excel' ? 'csv' : 'txt'}`;
      
      // Criar Blob com UTF-8 BOM para garantir compatibilidade com o Excel Mobile
      const blob = new Blob([format === 'excel' ? "\uFEFF" + content : content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      
      // Criação e clique direto no link (compatível com Android/iOS)
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Limpeza suave
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 500);
      
      alert("Ficheiro gerado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar. Tente abrir a app no Chrome normal.");
    }
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 pt-10 pb-6 shrink-0">
        <button onClick={onBack} className="h-14 w-14 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 active:bg-white/10">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Exportar Relatórios</h2>
      </header>

      <div className="space-y-8 flex-1 px-2">
        <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-6 shadow-2xl">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setFormat('excel')} 
              className={`py-8 rounded-3xl border flex flex-col items-center gap-3 ${format === 'excel' ? 'border-primary text-primary bg-primary/10' : 'border-white/5 text-gray-600'}`}
            >
              <span className="material-symbols-outlined text-4xl pointer-events-none">table_view</span>
              <span className="text-[11px] font-black uppercase pointer-events-none">Excel (.csv)</span>
            </button>
            <button 
              onClick={() => setFormat('word')} 
              className={`py-8 rounded-3xl border flex flex-col items-center gap-3 ${format === 'word' ? 'border-primary text-primary bg-primary/10' : 'border-white/5 text-gray-600'}`}
            >
              <span className="material-symbols-outlined text-4xl pointer-events-none">description</span>
              <span className="text-[11px] font-black uppercase pointer-events-none">Texto (.txt)</span>
            </button>
          </div>

          <button 
            onClick={handleExportDirect}
            className="w-full py-6 bg-primary text-bg-dark font-black uppercase tracking-widest rounded-2xl shadow-xl active:bg-white"
          >
            Transferir Ficheiro
          </button>
        </div>
        
        <div className="p-6 bg-surface-dark/40 rounded-3xl border border-white/5 text-center">
           <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-widest">
             O ficheiro será guardado na pasta de "Downloads" do seu dispositivo.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
