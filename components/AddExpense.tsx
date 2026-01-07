
import React, { useState, useEffect, useCallback } from 'react';
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

  const toggleMember = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Comandos de voz não suportados neste navegador.");
      return;
    }

    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'pt-PT';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Comando de voz:", transcript);
      
      // 1. Tentar encontrar valor (ex: "cinquenta euros", "vinte e cinco ponto dois")
      const valueMatch = transcript.match(/(\d+(?:[.,]\d+)?)/);
      if (valueMatch) {
        setAmount(valueMatch[1].replace(',', '.'));
      }
      
      // 2. Tentar encontrar origem entre as existentes
      const foundSource = sources.find(s => transcript.includes(s.toLowerCase()));
      if (foundSource) {
        setSource(foundSource);
        setShowNewSourceInput(false);
      }

      // 3. Tentar encontrar data
      if (transcript.includes('ontem')) {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        setDate(d.toISOString().split('T')[0]);
      } else if (transcript.includes('hoje')) {
        setDate(new Date().toISOString().split('T')[0]);
      }

      // 4. Tentar encontrar membros pelos nomes
      members.forEach(m => {
        if (transcript.includes(m.name.toLowerCase())) {
          setSelectedMemberIds(prev => prev.includes(m.id) ? prev : [...prev, m.id]);
        }
      });
    };
    
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
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between pt-8 pb-4 shrink-0">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</h2>
        <button onClick={handleSave} className="text-primary font-bold px-5 py-2 bg-primary/10 rounded-full active:scale-95 transition-all tracking-tight">Confirmar</button>
      </header>

      <main className="flex-1 space-y-8 pt-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Valor da Transação</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="text-4xl text-gray-500 font-black">€</span>
              <input 
                type="number" 
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
                className="bg-transparent text-6xl font-black w-56 text-center border-none focus:ring-0 placeholder-white/10"
              />
            </div>
            <button 
              onClick={handleVoiceInput}
              className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/30' : 'bg-primary/20 text-primary border-2 border-primary/20'}`}
            >
              <span className="material-symbols-outlined text-3xl font-bold">{isListening ? 'stop' : 'mic'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-6 px-2">
          <div className="bg-surface-dark rounded-[2.5rem] p-7 border border-white/5 space-y-7">
            {/* Data */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                </div>
                <span className="text-sm font-semibold">Data</span>
              </div>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-transparent border-none text-sm text-gray-400 font-bold focus:ring-0 p-0 text-right appearance-none"
              />
            </div>

            <div className="h-px bg-white/5"></div>

            {/* Origem */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">store</span>
                  </div>
                  <span className="text-sm font-semibold">Origem</span>
                </div>
                <button 
                  onClick={() => setShowNewSourceInput(!showNewSourceInput)}
                  className="text-[10px] text-primary font-black uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-lg"
                >
                  {showNewSourceInput ? 'Escolher Lista' : 'Nova +'}
                </button>
              </div>
              
              {!showNewSourceInput ? (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
                  {sources.map(s => (
                    <button 
                      key={s}
                      onClick={() => setSource(s)}
                      className={`px-5 py-3 rounded-2xl text-[11px] font-black shrink-0 border transition-all ${source === s ? 'bg-primary text-bg-dark border-primary shadow-lg shadow-primary/20' : 'bg-bg-dark text-gray-500 border-white/5'}`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              ) : (
                <input 
                  type="text"
                  autoFocus
                  value={newSourceName}
                  onChange={e => setNewSourceName(e.target.value)}
                  placeholder="Nome da loja ou serviço..."
                  className="w-full bg-bg-dark border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-primary focus:border-primary transition-all"
                />
              )}
            </div>

            <div className="h-px bg-white/5"></div>

            {/* Membros Selecionáveis */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">group</span>
                </div>
                <span className="text-sm font-semibold">Membros Responsáveis</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pb-2">
                <button 
                  onClick={() => setSelectedMemberIds([])}
                  className={`px-4 py-3 rounded-2xl text-[11px] font-bold border transition-all ${selectedMemberIds.length === 0 ? 'bg-primary/20 border-primary text-primary' : 'bg-bg-dark border-white/5 text-gray-500'}`}
                >
                  TODO O AGREGADO
                </button>
                {members.map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={`px-4 py-3 rounded-2xl text-[11px] font-bold border transition-all truncate flex items-center justify-center gap-2 ${selectedMemberIds.includes(m.id) ? 'bg-primary/20 border-primary text-primary' : 'bg-bg-dark border-white/5 text-gray-500'}`}
                  >
                    {selectedMemberIds.includes(m.id) && <span className="material-symbols-outlined text-xs">check_circle</span>}
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-dark rounded-[2rem] p-6 border border-white/5 flex gap-4">
             <span className="material-symbols-outlined text-gray-600">notes</span>
             <textarea 
               value={notes}
               onChange={e => setNotes(e.target.value)}
               placeholder="Adicionar nota sobre a compra..."
               className="flex-1 bg-transparent border-none text-sm p-0 focus:ring-0 resize-none h-24 placeholder-gray-700 font-medium"
             />
          </div>
        </div>
      </main>

      <div className="mt-6 pb-12 shrink-0">
        <button 
          onClick={handleSave}
          className="w-full py-5 bg-primary text-bg-dark font-black uppercase tracking-[0.15em] rounded-[2rem] shadow-2xl shadow-primary/40 active:scale-95 transition-all border-4 border-bg-dark"
        >
          {editingExpense ? 'Guardar Alterações' : 'Confirmar Despesa'}
        </button>
      </div>
    </div>
  );
};

export default AddExpense;
