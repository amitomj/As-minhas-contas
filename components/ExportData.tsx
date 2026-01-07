
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
    
    // Simulação de processamento local
    setTimeout(() => {
      // Agrupar por origem
      const grouped: Record<string, Expense[]> = {};
      expenses.forEach(e => {
        if (!grouped[e.source]) grouped[e.source] = [];
        grouped[e.source].push(e);
      });

      // Ordenar cada grupo cronologicamente
      Object.keys(grouped).forEach(source => {
        grouped[source].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });

      let content = `RELATÓRIO DE FINANÇAS - ${new Date().toLocaleDateString()}\n`;
      content += `==========================================\n\n`;

      Object.entries(grouped).forEach(([source, items]) => {
        content += `ORIGEM: ${source.toUpperCase()}\n`;
        content += `------------------------------------------\n`;
        items.forEach(item => {
          const mNames = item.memberIds.length === 0 
            ? 'Agregado' 
            : item.memberIds.map(id => members.find(m => m.id === id)?.name).join(', ');
          content += `${item.date} | €${item.amount.toFixed(2)} | Membros: ${mNames}\n`;
        });
        const totalSource = items.reduce((acc, curr) => acc + curr.amount, 0);
        content += `Subtotal: €${totalSource.toFixed(2)}\n\n`;
      });

      const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      content += `==========================================\n`;
      content += `TOTAL GERAL: €${total.toFixed(2)}\n`;

      // Download do ficheiro gerado
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financas_pro_export_${format}_${new Date().getTime()}.${format === 'excel' ? 'csv' : 'txt'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExporting(false);
      alert(`Exportação concluída com sucesso no formato ${format.toUpperCase()}!`);
    }, 1200);
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 pt-10 pb-6 shrink-0">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Exportação</h2>
      </header>

      <div className="space-y-8 flex-1">
        <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-6 shadow-2xl">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Formato do Ficheiro</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setFormat('excel')} 
                className={`py-8 rounded-3xl border transition-all flex flex-col items-center gap-3 ${format === 'excel' ? 'border-primary text-primary bg-primary/10 shadow-lg shadow-primary/10' : 'border-white/5 text-gray-600 bg-bg-dark/50'}`}
              >
                <span className="material-symbols-outlined text-4xl">table_view</span>
                <span className="text-[11px] font-black">EXCEL</span>
              </button>
              <button 
                onClick={() => setFormat('word')} 
                className={`py-8 rounded-3xl border transition-all flex flex-col items-center gap-3 ${format === 'word' ? 'border-primary text-primary bg-primary/10 shadow-lg shadow-primary/10' : 'border-white/5 text-gray-600 bg-bg-dark/50'}`}
              >
                <span className="material-symbols-outlined text-4xl">description</span>
                <span className="text-[11px] font-black">WORD</span>
              </button>
            </div>
          </div>

          <div className="p-6 bg-bg-dark/50 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-secondary">analytics</span>
              <p className="text-[11px] text-gray-400 leading-tight">
                O relatório será organizado por <span className="text-white font-bold">categorias de origem</span> e ordenado por <span className="text-white font-bold">data</span> para facilitar a leitura.
              </p>
            </div>
          </div>

          <button 
            onClick={handleExport}
            disabled={exporting || expenses.length === 0}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all ${exporting || expenses.length === 0 ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-secondary to-primary text-white active:scale-95'}`}
          >
            {exporting ? (
              <>
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Gerando Ficheiro...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">download</span>
                Exportar agora
              </>
            )}
          </button>
          
          {expenses.length === 0 && (
            <p className="text-center text-[10px] text-red-400 font-bold uppercase tracking-tight">Não existem despesas para exportar</p>
          )}
        </div>

        <div className="bg-[#11291f] border border-white/5 rounded-[2rem] p-6 space-y-4 shadow-xl">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Resumo da Exportação</h4>
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs text-gray-400">Total de Registos:</span>
            <span className="text-xs font-bold text-white">{expenses.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Valor Total:</span>
            <span className="text-xs font-bold text-primary">€{expenses.reduce((a, b) => a + b.amount, 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
