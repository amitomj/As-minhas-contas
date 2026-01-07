
import React, { useState, useCallback } from 'react';
import { Member, Expense } from '../types';

interface AddExpenseProps {
  sources: string[];
  members: Member[];
  onSave: (expense: { amount: number, date: string, source: string, memberIds: string[], notes: string }) => void;
  onBack: () => void;
  editingExpense?: Expense;
}

const AddExpense: React.FC<AddExpenseProps> = ({ sources, members, onSave, onBack, editingExpense }) => {
  const [amount, setAmount] = useState<string>(editingExpense?.amount.toString() || '');
  const [date, setDate] = useState<string>(editingExpense?.date || new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState<string>(editingExpense?.source || sources[0] || '');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(editingExpense?.memberIds || []);
  const [notes, setNotes] = useState<string>(editingExpense?.notes || '');
  const [isListening, setIsListening] = useState(false);
  const [showNewSourceInput, setShowNewSourceInput] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const months: Record<string, string> = {
    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04', 'maio': '05', 'junho': '06',
    'julho': '07', 'agosto': '08', 'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Comandos de voz não suportados neste telemóvel ou navegador.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-PT';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Comando:", transcript);
      
      // Capturar Valor
      const valueMatch = transcript.match(/(\d+(?:\s?e\s?|\s?com\s?|[,.]\s?)\d+|\d+)/);
      if (valueMatch) {
        let valStr = valueMatch[1].replace(/\s?e\s?|\s?com\s?/, '.').replace(',', '.').replace(/\s/g, '');
        setAmount(valStr);
      }
      
      // Capturar Data (Hoje, Ontem, Dia X)
      if (transcript.includes('hoje')) {
        setDate(new Date().toISOString().split('T')[0]);
      } else if (transcript.includes('ontem')) {
        const d = new Date(); d.setDate(d.getDate() - 1);
        setDate(d.toISOString().split('T')[0]);
      } else if (transcript.includes('anteontem')) {
        const d = new Date(); d.setDate(d.getDate() - 2);
        setDate(d.toISOString().split('T')[0]);
      } else {
        // Detetar "dia X de Mês"
        const dayMatch = transcript.match(/dia\s?(\d{1,2})/);
        if (dayMatch) {
          let targetDay = dayMatch[1].padStart(2, '0');
          let targetMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
          let targetYear = new Date().getFullYear();

          for (const [mName, mNum] of Object.entries(months)) {
            if (transcript.includes(mName)) {
              targetMonth = mNum;
              break;
            }
          }
          setDate(`${targetYear}-${targetMonth}-${targetDay}`);
        }
      }

      // Detetar Origem
      const foundSource = sources.find(s => transcript.includes(s.toLowerCase()));
      if (foundSource) {
        setSource(foundSource);
        setShowNewSourceInput(false);
      }
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  }, [sources, members]);

  const handleSave = () => {
    const finalSource = showNewSourceInput ? newSourceName : source;
    if (!amount || !finalSource) {
      alert("Por favor, preencha o valor e a origem.");
      return;
    }
    onSave({ 
      amount: parseFloat(amount), 
      date, 
      source: finalSource, 
      memberIds: selectedMemberIds, 
      notes 
    });
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar pb-32">
      <header className="flex items-center justify-between pt-8 pb-4 shrink-0">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-2xl font-black">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Novo Registo</h2>
        <button onClick={handleSave} className="text-primary font-black px-6 py-2 bg-primary/10 rounded-full active:scale-95 transition-all">OK</button>
      </header>

      <main className="flex-1 space-y-8 pt-6">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Valor da Transação</span>
          <div className="flex items-center gap-6">
            <input 
              type="number" inputMode="decimal" value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="0,00" 
              className="bg-transparent text-6xl font-black w-64 text-center border-none focus:ring-0 placeholder-white/5 text-white" 
            />
            <button 
              onClick={handleVoiceInput} 
              className={`h-16 w-16 rounded-full flex items-center justify-center transition-all shadow-xl ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-primary/20 text-primary border-2 border-primary/20 active:scale-90'}`}
            >
              <span className="material-symbols-outlined text-3xl font-bold">{isListening ? 'graphic_eq' : 'mic'}</span>
            </button>
          </div>
        </div>

        <div className="bg-surface-dark rounded-[2.5rem] p-7 border border-white/5 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">calendar_month</span>
              <span className="text-sm font-bold">Data</span>
            </div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent border-none text-sm text-gray-400 font-bold p-0 text-right focus:ring-0" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">store</span>
                <span className="text-sm font-bold">Origem</span>
              </div>
              <button onClick={() => setShowNewSourceInput(!showNewSourceInput)} className="text-[10px] text-secondary font-black uppercase tracking-widest active:opacity-60">{showNewSourceInput ? 'Cancelar' : 'Criar Nova'}</button>
            </div>
            {showNewSourceInput ? (
              <input type="text" value={newSourceName} onChange={e => setNewSourceName(e.target.value)} placeholder="Nome da loja ou serviço..." className="w-full bg-bg-dark border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-secondary transition-all" />
            ) : (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {sources.map(s => (
                  <button key={s} onClick={() => setSource(s)} className={`px-5 py-3 rounded-2xl text-[10px] font-black shrink-0 border transition-all ${source === s ? 'bg-primary text-bg-dark border-primary' : 'bg-bg-dark border-white/5 text-gray-500'}`}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">group</span>
              <span className="text-sm font-bold">Atribuir a:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSelectedMemberIds([])} className={`px-4 py-3 rounded-2xl text-[10px] font-bold border transition-all active:scale-95 ${selectedMemberIds.length === 0 ? 'bg-primary/20 border-primary text-primary' : 'bg-bg-dark border-white/5 text-gray-500'}`}>GERAL / AGREGADO</button>
              {members.map(m => (
                <button key={m.id} onClick={() => toggleMember(m.id)} className={`px-4 py-3 rounded-2xl text-[10px] font-bold border transition-all truncate active:scale-95 ${selectedMemberIds.includes(m.id) ? 'bg-primary/20 border-primary text-primary' : 'bg-bg-dark border-white/5 text-gray-500'}`}>
                  {m.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddExpense;
