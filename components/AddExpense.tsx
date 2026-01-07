
import React, { useState, useEffect, useCallback } from 'react';
import { Member } from '../types.ts';

interface AddExpenseProps {
  sources: string[];
  members: Member[];
  onSave: (expense: { amount: number, date: string, source: string, memberId: string, notes: string }) => void;
  onBack: () => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({ sources, members, onSave, onBack }) => {
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState<string>(sources[0] || '');
  const [memberId, setMemberId] = useState<string>('all');
  const [notes, setNotes] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [showNewSourceInput, setShowNewSourceInput] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

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
      console.log('Transcrição:', transcript);
      
      // Heurística melhorada para valores
      const valueMatch = transcript.match(/(\d+(?:[.,]\d+)?)/);
      if (valueMatch) {
        const val = valueMatch[1].replace(',', '.');
        setAmount(val);
      }
      
      // Procura por fontes existentes
      const foundSource = sources.find(s => transcript.includes(s.toLowerCase()));
      if (foundSource) {
        setSource(foundSource);
        setShowNewSourceInput(false);
      }
    };
    
    recognition.start();
  }, [sources]);

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
      memberId, 
      notes 
    });
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between pt-8 pb-4 shrink-0">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Nova Despesa</h2>
        <button onClick={handleSave} className="text-primary font-bold px-5 py-2 bg-primary/10 rounded-full active:scale-95 transition-all">Guardar</button>
      </header>

      <main className="flex-1 space-y-8 pt-6">
        {/* Amount Hero */}
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

        {/* Fields Card */}
        <div className="space-y-6 px-2">
          <div className="bg-surface-dark rounded-[2rem] p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-white/5 flex items-center justify-center">
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">store</span>
                  </div>
                  <span className="text-sm font-semibold">Origem</span>
                </div>
                <button 
                  onClick={() => setShowNewSourceInput(!showNewSourceInput)}
                  className="text-[10px] text-primary font-black uppercase tracking-wider"
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
                      className={`px-5 py-2.5 rounded-2xl text-[11px] font-black shrink-0 border transition-all ${source === s ? 'bg-primary text-bg-dark border-primary shadow-lg shadow-primary/20' : 'bg-bg-dark text-gray-500 border-white/5'}`}
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

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">group</span>
                </div>
                <span className="text-sm font-semibold">Membro</span>
              </div>
              
              <div className="flex p-1.5 bg-bg-dark rounded-[1.25rem]">
                <button 
                  onClick={() => setMemberId('all')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${memberId === 'all' ? 'bg-primary text-bg-dark shadow-md' : 'text-gray-500'}`}
                >
                  Agregado
                </button>
                <button 
                  onClick={() => setMemberId(members[0]?.id || '')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${memberId !== 'all' ? 'bg-primary text-bg-dark shadow-md' : 'text-gray-500'}`}
                >
                  Específico
                </button>
              </div>

              {memberId !== 'all' && (
                <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
                  {members.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMemberId(m.id)}
                      className={`px-4 py-3 rounded-2xl text-[11px] font-bold border transition-all truncate ${memberId === m.id ? 'bg-primary/20 border-primary text-primary' : 'bg-bg-dark border-white/5 text-gray-600'}`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
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
          className="w-full py-5 bg-primary text-bg-dark font-black uppercase tracking-[0.15em] rounded-[2rem] shadow-2xl shadow-primary/20 active:scale-95 transition-all"
        >
          Confirmar Despesa
        </button>
      </div>
    </div>
  );
};

export default AddExpense;
