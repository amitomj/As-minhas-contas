
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
  const [isListening, setIsListening] = useState(false);
  const [showNewSourceInput, setShowNewSourceInput] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const handleVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) { alert("Voz não suportada."); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-PT';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("VOZ:", transcript);
      
      // 1. Valor: Procura números (ex: "vinte e cinco", "25", "25.5")
      const numMatch = transcript.match(/\d+(?:[,.]\d+)?/);
      if (numMatch) setAmount(numMatch[0].replace(',', '.'));

      // 2. Data: "hoje", "ontem" ou "dia X"
      if (transcript.includes('hoje')) {
        setDate(new Date().toISOString().split('T')[0]);
      } else if (transcript.includes('ontem')) {
        const d = new Date(); d.setDate(d.getDate() - 1);
        setDate(d.toISOString().split('T')[0]);
      } else {
        const dayMatch = transcript.match(/dia\s?(\d+)/);
        if (dayMatch) {
          const day = dayMatch[1].padStart(2, '0');
          const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
          setDate(`${new Date().getFullYear()}-${month}-${day}`);
        }
      }

      // 3. Membro: Procura por nomes de membros no texto
      const foundMembers = members.filter(m => transcript.includes(m.name.toLowerCase().split(' ')[0]));
      if (foundMembers.length > 0) setSelectedMemberIds(foundMembers.map(m => m.id));

      // 4. Origem
      const foundSrc = sources.find(s => transcript.includes(s.toLowerCase()));
      if (foundSrc) { setSource(foundSrc); setShowNewSourceInput(false); }
    };
    recognition.start();
  }, [sources, members]);

  const handleSave = () => {
    const val = parseFloat(amount.replace(',', '.'));
    const finalSource = showNewSourceInput ? newSourceName : source;
    if (isNaN(val) || !finalSource) { alert("Preencha valor e origem."); return; }
    onSave({ amount: val, date, source: finalSource, memberIds: selectedMemberIds, notes: '' });
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto pb-32">
      <header className="flex items-center justify-between pt-8 pb-4">
        <button onClick={onBack} className="h-14 w-14 flex items-center justify-center rounded-full bg-surface-dark btn-active">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-bold">Registar Gasto</h2>
        <button onClick={handleSave} className="bg-primary text-bg-dark font-black px-6 py-3 rounded-full btn-active">OK</button>
      </header>

      <div className="flex-1 space-y-8 pt-10">
        <div className="flex flex-col items-center gap-6">
          <input 
            type="number" inputMode="decimal" value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="0.00" 
            className="bg-transparent text-6xl font-black w-full text-center border-none focus:ring-0 text-white" 
          />
          <button 
            onClick={handleVoiceInput} 
            className={`h-20 w-20 rounded-full flex items-center justify-center shadow-2xl ${isListening ? 'bg-red-500 animate-pulse' : 'bg-primary text-bg-dark'}`}
          >
            <span className="material-symbols-outlined text-4xl">{isListening ? 'graphic_eq' : 'mic'}</span>
          </button>
        </div>

        <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-8">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold">Data</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent border-none text-right text-gray-400 font-bold" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-bold">Origem</span>
              <button onClick={() => setShowNewSourceInput(!showNewSourceInput)} className="text-secondary text-[10px] font-black uppercase">Nova</button>
            </div>
            {showNewSourceInput ? (
              <input type="text" value={newSourceName} onChange={e => setNewSourceName(e.target.value)} placeholder="Loja..." className="w-full bg-bg-dark border border-white/10 rounded-2xl p-4 text-white" />
            ) : (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                {sources.map(s => (
                  <button key={s} onClick={() => setSource(s)} className={`px-5 py-3 rounded-2xl text-[10px] font-black border shrink-0 ${source === s ? 'bg-primary text-bg-dark' : 'bg-bg-dark border-white/5 text-gray-500'}`}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <span className="text-sm font-bold">Atribuir a:</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSelectedMemberIds([])} className={`py-4 rounded-2xl text-[10px] font-bold border ${selectedMemberIds.length === 0 ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-gray-500'}`}>AGREGADO</button>
              {members.map(m => (
                <button key={m.id} onClick={() => setSelectedMemberIds([m.id])} className={`py-4 rounded-2xl text-[10px] font-bold border truncate ${selectedMemberIds.includes(m.id) ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 text-gray-500'}`}>
                  {m.name.split(' ')[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
