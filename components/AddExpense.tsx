
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

  const numberWords: Record<string, number> = {
    'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'quatro': 4, 'cinco': 5,
    'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10, 'onze': 11, 'doze': 12,
    'treze': 13, 'catorze': 14, 'quinze': 15, 'dezasseis': 16, 'dezassete': 17,
    'dezoito': 18, 'dezanove': 19, 'vinte': 20, 'vinte e um': 21, 'vinte e dois': 22,
    'vinte e três': 23, 'vinte e quatro': 24, 'vinte e cinco': 25, 'vinte e seis': 26,
    'vinte e sete': 27, 'vinte e oito': 28, 'vinte e nove': 29, 'trinta': 30, 'trinta e um': 31
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Comandos de voz não suportados neste telemóvel.");
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
      console.log("Comando reconhecido:", transcript);
      
      // 1. VALOR - Tenta capturar números ou decimais
      const valueMatch = transcript.match(/(\d+(?:\s?e\s?|\s?com\s?|[,.]\s?)\d+|\d+)/);
      if (valueMatch) {
        let valStr = valueMatch[1].replace(/\s?e\s?|\s?com\s?/, '.').replace(',', '.').replace(/\s/g, '');
        setAmount(valStr);
      }
      
      // 2. DATA - "dia 25", "dia vinte e cinco", "hoje", "ontem"
      if (transcript.includes('hoje')) {
        setDate(new Date().toISOString().split('T')[0]);
      } else if (transcript.includes('ontem')) {
        const d = new Date(); d.setDate(d.getDate() - 1);
        setDate(d.toISOString().split('T')[0]);
      } else if (transcript.includes('dia')) {
        let dayFound = "";
        // Tenta número direto: "dia 25"
        const numericMatch = transcript.match(/dia\s?(\d{1,2})/);
        if (numericMatch) {
          dayFound = numericMatch[1].padStart(2, '0');
        } else {
          // Tenta extenso: "dia vinte e cinco"
          for (const [word, num] of Object.entries(numberWords)) {
            if (transcript.includes(`dia ${word}`)) {
              dayFound = num.toString().padStart(2, '0');
              break;
            }
          }
        }

        if (dayFound) {
          let targetMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
          for (const [mName, mNum] of Object.entries(months)) {
            if (transcript.includes(mName)) { targetMonth = mNum; break; }
          }
          setDate(`${new Date().getFullYear()}-${targetMonth}-${dayFound}`);
        }
      }

      // 3. ORIGEM - Procura nas fontes conhecidas
      const foundSource = sources.find(s => transcript.includes(s.toLowerCase()));
      if (foundSource) {
        setSource(foundSource);
        setShowNewSourceInput(false);
      }

      // 4. MEMBROS - Procura nomes de membros
      const foundMemberIds: string[] = [];
      members.forEach(m => {
        const nameParts = m.name.toLowerCase().split(' ');
        const isMentioned = nameParts.some(part => part.length > 2 && transcript.includes(part));
        if (isMentioned) {
          foundMemberIds.push(m.id);
        }
      });
      if (foundMemberIds.length > 0) {
        setSelectedMemberIds(foundMemberIds);
      }
    };
    
    recognition.onerror = (e: any) => {
      console.error("Erro voz:", e);
      setIsListening(false);
    };
    recognition.start();
  }, [sources, members]);

  const handleSaveInternal = () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor, introduza um valor válido.');
      return;
    }
    const finalSource = showNewSourceInput ? newSourceName : source;
    if (!finalSource) {
      alert('Por favor, indique a origem.');
      return;
    }
    onSave({ amount: numAmount, date, source: finalSource, memberIds: selectedMemberIds, notes });
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar pb-32">
      <header className="flex items-center justify-between pt-8 pb-4 shrink-0">
        <button onClick={onBack} className="h-14 w-14 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 shadow-lg active:bg-white/10">
          <span className="material-symbols-outlined text-2xl font-black">arrow_back</span>
        </button>
        <h2 className="text-lg font-black">Adicionar Gasto</h2>
        <button onClick={handleSaveInternal} className="text-primary font-black px-8 py-3 bg-primary/10 rounded-full active:bg-primary/30">OK</button>
      </header>

      <main className="flex-1 space-y-8 pt-6">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Valor Total</span>
          <div className="flex items-center gap-6">
            <input 
              type="number" inputMode="decimal" value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="0,00" 
              className="bg-transparent text-6xl font-black w-64 text-center border-none focus:ring-0 text-white placeholder-white/5" 
            />
            <button 
              onClick={handleVoiceInput} 
              className={`h-16 w-16 rounded-full flex items-center justify-center shadow-2xl ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-primary text-bg-dark'}`}
            >
              <span className="material-symbols-outlined text-3xl font-bold">{isListening ? 'graphic_eq' : 'mic'}</span>
            </button>
          </div>
        </div>

        <div className="bg-surface-dark rounded-[2.5rem] p-7 border border-white/5 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">calendar_month</span>
              <span className="text-sm font-bold">Data</span>
            </div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent border-none text-sm text-gray-300 font-bold p-2 text-right focus:ring-0" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">store</span>
                <span className="text-sm font-bold">Origem / Loja</span>
              </div>
              <button onClick={() => setShowNewSourceInput(!showNewSourceInput)} className="text-[10px] text-secondary font-black uppercase tracking-widest p-4">Nova</button>
            </div>
            {showNewSourceInput ? (
              <input type="text" value={newSourceName} onChange={e => setNewSourceName(e.target.value)} placeholder="Nome da loja..." className="w-full bg-bg-dark border border-white/10 rounded-2xl p-5 text-sm text-white" />
            ) : (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {sources.map(s => (
                  <button key={s} onClick={() => setSource(s)} className={`px-5 py-4 rounded-2xl text-[10px] font-black shrink-0 border ${source === s ? 'bg-primary text-bg-dark border-primary' : 'bg-bg-dark border-white/5 text-gray-500'}`}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">group</span>
              <span className="text-sm font-bold">Atribuir Membros</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSelectedMemberIds([])} className={`px-4 py-5 rounded-2xl text-[10px] font-bold border ${selectedMemberIds.length === 0 ? 'bg-primary/20 border-primary text-primary' : 'bg-bg-dark border-white/5 text-gray-500'}`}>TODOS (AGREGADO)</button>
              {members.map(m => (
                <button key={m.id} onClick={() => toggleMember(m.id)} className={`px-4 py-5 rounded-2xl text-[10px] font-bold border truncate ${selectedMemberIds.includes(m.id) ? 'bg-primary/20 border-primary text-primary' : 'bg-bg-dark border-white/5 text-gray-500'}`}>
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
