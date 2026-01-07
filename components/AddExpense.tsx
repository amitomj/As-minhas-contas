
import React, { useState, useEffect } from 'react';
import { Member } from '../types';

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

  const handleVoiceInput = () => {
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
      console.log('Voz:', transcript);
      
      // Basic heuristic: "dez euros no continente"
      const valueMatch = transcript.match(/(\d+)/);
      if (valueMatch) setAmount(valueMatch[1]);
      
      const foundSource = sources.find(s => transcript.includes(s.toLowerCase()));
      if (foundSource) setSource(foundSource);
    };
    recognition.start();
  };

  const handleSave = () => {
    const finalSource = showNewSourceInput ? newSourceName : source;
    if (!amount || !finalSource) return;
    onSave({ 
      amount: parseFloat(amount), 
      date, 
      source: finalSource, 
      memberId, 
      notes 
    });
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4">
      <header className="flex items-center justify-between pt-8 pb-4">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Adicionar Despesa</h2>
        <button onClick={handleSave} className="text-primary font-bold px-4 py-2 bg-primary/10 rounded-full">Guardar</button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar space-y-8 pt-6">
        {/* Amount Hero */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Valor da despesa</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="text-4xl text-gray-500 font-bold">€</span>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
                className="bg-transparent text-6xl font-bold w-48 text-center border-none focus:ring-0 placeholder-white/20"
              />
            </div>
            <button 
              onClick={handleVoiceInput}
              className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-primary/20 text-primary border-2 border-primary/20'}`}
            >
              <span className="material-symbols-outlined text-3xl">mic</span>
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-6 px-2">
          <div className="bg-surface-dark rounded-2xl p-4 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                <span className="text-sm font-medium">Data</span>
              </div>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-transparent border-none text-sm text-gray-400 focus:ring-0 p-0 text-right"
              />
            </div>

            <div className="h-px bg-white/5"></div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">store</span>
                  <span className="text-sm font-medium">Origem</span>
                </div>
                <button 
                  onClick={() => setShowNewSourceInput(!showNewSourceInput)}
                  className="text-xs text-primary font-bold"
                >
                  {showNewSourceInput ? 'VOLTAR' : 'NOVA ORIGEM'}
                </button>
              </div>
              
              {!showNewSourceInput ? (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                  {sources.map(s => (
                    <button 
                      key={s}
                      onClick={() => setSource(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all ${source === s ? 'bg-primary text-bg-dark border-primary' : 'bg-white/5 text-gray-400 border-white/5'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <input 
                  type="text"
                  value={newSourceName}
                  onChange={e => setNewSourceName(e.target.value)}
                  placeholder="Nome da nova origem..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary"
                />
              )}
            </div>

            <div className="h-px bg-white/5"></div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-500 uppercase">Associar a</span>
              <div className="flex p-1 bg-bg-dark rounded-xl">
                <button 
                  onClick={() => setMemberId('all')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${memberId === 'all' ? 'bg-primary text-bg-dark' : 'text-gray-500'}`}
                >
                  Todo o Agregado
                </button>
                <button 
                  onClick={() => setMemberId(members[0]?.id || '')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${memberId !== 'all' ? 'bg-primary text-bg-dark' : 'text-gray-500'}`}
                >
                  Membro Específico
                </button>
              </div>

              {memberId !== 'all' && (
                <select 
                  value={memberId}
                  onChange={e => setMemberId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="bg-surface-dark rounded-2xl p-4 border border-white/5 flex gap-3">
             <span className="material-symbols-outlined text-gray-500">description</span>
             <textarea 
               value={notes}
               onChange={e => setNotes(e.target.value)}
               placeholder="Adicionar nota (opcional)..."
               className="flex-1 bg-transparent border-none text-sm p-0 focus:ring-0 resize-none h-20"
             />
          </div>
        </div>
      </main>

      <div className="mt-4 pb-6">
        <button 
          onClick={handleSave}
          className="w-full py-4 bg-primary text-bg-dark font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Guardar Despesa
        </button>
      </div>
    </div>
  );
};

export default AddExpense;
