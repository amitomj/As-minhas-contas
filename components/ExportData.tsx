
import React from 'react';
import { Expense, Member, Project } from '../types';

interface Props {
  expenses: Expense[];
  members: Member[];
  projects: Project[];
  onBack: () => void;
}

const ExportData: React.FC<Props> = ({ expenses, members, projects, onBack }) => {
  
  const generateReport = () => {
    let report = "RELATÓRIO FINANCEIRO PRO\n";
    report += "Data: " + new Date().toLocaleDateString('pt-PT') + " " + new Date().toLocaleTimeString('pt-PT') + "\n";
    report += "=".repeat(50) + "\n\n";

    const separator = ";";
    const header = `dia${separator}membro${separator}tipo${separator}valor\n`;

    const getMemberNames = (ids: string[]) => {
      if (ids.length === 0) return "Agregado";
      return ids.map(id => members.find(m => m.id === id)?.name || "N/A").join(", ");
    };

    // --- CAPÍTULO 1: CRONOLÓGICO ---
    report += "CAPÍTULO 1: DESPESAS POR ORDEM CRONOLÓGICA\n";
    report += header;
    let totalGeral = 0;
    const sortedExpenses = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
    
    sortedExpenses.forEach(e => {
      const memName = getMemberNames(e.memberIds);
      report += `${e.date}${separator}${memName}${separator}${e.source}${separator}${e.amount.toFixed(2)}€\n`;
      totalGeral += e.amount;
    });
    report += `TOTAL GERAL: ${totalGeral.toFixed(2)}€\n\n`;

    // --- CAPÍTULO 2: POR MEMBRO ---
    report += "CAPÍTULO 2: DESPESAS POR MEMBRO DO AGREGADO\n";
    const membersWithAgregado = [...members, { id: 'agregado_virtual', name: 'Agregado', role: '' }];
    
    membersWithAgregado.forEach(m => {
      const mExpenses = m.id === 'agregado_virtual' 
        ? expenses.filter(e => e.memberIds.length === 0)
        : expenses.filter(e => e.memberIds.includes(m.id));
      
      if (mExpenses.length > 0) {
        report += `\n> MEMBRO: ${m.name.toUpperCase()}\n`;
        report += header;
        let subtotal = 0;
        mExpenses.forEach(e => {
          report += `${e.date}${separator}${m.name}${separator}${e.source}${separator}${e.amount.toFixed(2)}€\n`;
          subtotal += e.amount;
        });
        report += `TOTAL ${m.name}: ${subtotal.toFixed(2)}€\n`;
      }
    });
    report += "\n";

    // --- CAPÍTULO 3: POR TIPO ---
    report += "CAPÍTULO 3: DESPESAS POR TIPO (ORIGEM)\n";
    // Fix: Cast allSources to string[] to ensure 's' is recognized as string for toUpperCase()
    const allSources = Array.from(new Set(expenses.map(e => e.source))) as string[];
    
    allSources.forEach(s => {
      const sExpenses = expenses.filter(e => e.source === s);
      report += `\n> TIPO: ${s.toUpperCase()}\n`;
      report += header;
      let subtotal = 0;
      sExpenses.forEach(e => {
        const memName = getMemberNames(e.memberIds);
        report += `${e.date}${separator}${memName}${separator}${s}${separator}${e.amount.toFixed(2)}€\n`;
        subtotal += e.amount;
      });
      report += `TOTAL ${s}: ${subtotal.toFixed(2)}€\n`;
    });
    report += "\n";

    // --- CAPÍTULO 4: POR PROJETO ---
    report += "CAPÍTULO 4: DESPESAS POR PROJETO\n";
    if (projects.length === 0) {
      report += "Nenhum projeto registado.\n";
    } else {
      projects.forEach(p => {
        const pExpenses = expenses.filter(e => e.projectId === p.id);
        if (pExpenses.length > 0) {
          report += `\n> PROJETO: ${p.name.toUpperCase()}\n`;
          report += header;
          let subtotal = 0;
          pExpenses.forEach(e => {
            const memName = getMemberNames(e.memberIds);
            report += `${e.date}${separator}${memName}${separator}${e.source}${separator}${e.amount.toFixed(2)}€\n`;
            subtotal += e.amount;
          });
          report += `TOTAL PROJETO ${p.name}: ${subtotal.toFixed(2)}€\n`;
        }
      });
    }

    report += "\n" + "=".repeat(50) + "\n";
    report += "FIM DO RELATÓRIO";
    return report;
  };

  const handleShare = async () => {
    const reportText = generateReport();
    if (navigator.share) {
      try {
        const file = new File([reportText], "Relatorio_Financas_Pro.txt", { type: 'text/plain' });
        await navigator.share({
          title: 'Relatório Financeiro',
          text: 'Partilha do relatório detalhado.',
          files: [file]
        });
      } catch (error) {
        // Fallback for text share
        try {
          await navigator.share({ title: 'Relatório Financeiro', text: reportText });
        } catch (e) { handleDownload(); }
      }
    } else { handleDownload(); }
  };

  const handleEmail = () => {
    const reportText = generateReport();
    const subject = encodeURIComponent("Relatório Financeiro Pro");
    const body = encodeURIComponent(reportText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDownload = () => {
    const reportText = generateReport();
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Financas_Pro_Export.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-6 overflow-y-auto no-scrollbar pb-32">
      <header className="flex items-center gap-4 pt-8 pb-10">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 btn-active">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Exportar</h2>
      </header>

      <div className="space-y-6">
        <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-primary">description</span>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            Relatório gerado com 4 capítulos detalhados por cronologia, membros, tipos e projetos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button onClick={handleShare} className="flex items-center justify-between px-8 py-6 bg-primary text-bg-dark font-black rounded-3xl btn-active uppercase tracking-widest text-[11px]">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined">share</span>
              <span>Partilhar / WhatsApp</span>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <button onClick={handleEmail} className="flex items-center justify-between px-8 py-6 bg-secondary text-white font-black rounded-3xl btn-active uppercase tracking-widest text-[11px]">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined">mail</span>
              <span>Enviar por E-mail</span>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <button onClick={handleDownload} className="flex items-center justify-between px-8 py-6 bg-surface-dark border border-white/10 text-white font-black rounded-3xl btn-active uppercase tracking-widest text-[11px]">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined">download</span>
              <span>Descarregar Ficheiro</span>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
