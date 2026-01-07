
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
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Comando de voz detetado:", transcript);
      
      // 1. Valor: "vinte e cinco euros", "dez com cinquenta"
      const valueMatch = transcript.match(/(\d+(?:\s?e\s?|\s?com\s?|[,.]\s?)\d+|\d+)/);
      if (valueMatch) {
        let valStr = valueMatch[1].replace(/\s?e\s?|\s?com\s?/, '.').replace(',', '.');
        setAmount(valStr);
      }
      
      // 2. Origem: "no continente", "na galp", "compras no pingo doce"
      const foundSource = sources.find(s => transcript.includes(s.toLowerCase()));
      if (foundSource) {
        setSource(foundSource);
        setShowNewSourceInput(false);
      } else {
        // Tentar detetar palavras após "no", "na", "em"
        const sourceMatch = transcript.match(/(?:no|na|em|origem|loja)\s+([a-z0-9]+)/i);
        if (sourceMatch && sourceMatch[1]) {
          setNewSourceName(sourceMatch[1]);
          setShowNewSourceInput(true);
        }
      }

      // 3. Membros: "para a ana", "com o pedro", "da maria"
      const detectedMembers: string[] = [];
      members.forEach(m => {
        const nameLower = m.name.toLowerCase();
        if (transcript.includes(nameLower) || transcript.includes(`para a ${nameLower}`) || transcript.includes(`com o ${nameLower}`)) {
          detectedMembers.push(m.id);
        }
      });
      if (detectedMembers.length > 0) setSelectedMemberIds(detectedMembers);

      // 4. Datas: "dia 20", "ontem", "hoje", "mês de maio"
      if (transcript.includes('ontem')) {
        const d = new Date(); d.setDate(d.getDate() - 1);
        setDate(d.toISOString().split('T')[0]);
      } else if (transcript.includes('hoje')) {
        setDate(new Date().toISOString().split('T')[0]);
      } else {
        const dayMatch = transcript.match(/dia (\d{1,2})/);
        if (dayMatch) {
          const d = new Date(); d.setDate(parseInt(dayMatch[1]));
          setDate(d.toISOString().split('T')[0]);
        }
        
        const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        meses.forEach((mes, idx) => {
          if (transcript.includes(mes)) {
            const d = new Date(date);
            d.setMonth(idx);
            setDate(d.toISOString().split('T')[0]);
          }
        });
      }

      // 5. Notas adicionais
      if (transcript.includes('nota') || transcript.includes('observação')) {
        const noteMatch = transcript.split(/nota|observação/);
        if (noteMatch[1]) setNotes(noteMatch[1].trim());
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Erro voz:", event.error);
      setIsListening(false);
    };

    recognition.start();
  }, [sources, members, date]);

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
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar pb-24">
      <header className="flex items-center justify-between pt-8 pb-4 shrink-0">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-all">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="text-lg font-bold">{editingExpense ? 'Editar Gasto' : 'Novo Gasto'}</h2>
        <button onClick={handleSave} className="text-primary font-black px-6 py-2 bg-primary/10 rounded-full active:scale-95 transition-all">OK</button>
      </header>

      <main className="flex-1 space-y-8 pt-6">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Valor da Transação</span>
          <div className="flex items-center gap-6">
            <input 
              type="number" inputMode="decimal" value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="0,00" 
              className="bg-transparent text-6xl font-black w-64 text-center border-none focus:ring-0 placeholder-white/5 text-white" 
            />
            <button 
              onClick={handleVoiceInput} 
              className={`h-16 w-16 rounded-full flex items-center justify-center transition-all shadow-xl ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-primary/20 text-primary border-2 border-primary/20'}`}
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
              <button onClick={() => setShowNewSourceInput(!showNewSourceInput)} className="text-[10px] text-secondary font-black uppercase tracking-widest">{showNewSourceInput ? 'Cancelar' : 'Criar Nova'}</button>
            </div>
            {showNewSourceInput ? (
              <input type="text" value={newSourceName} onChange={e => setNewSourceName(e.target.value)} placeholder="Nome da loja ou serviço..." className="w-full bg-bg-dark border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-secondary transition-all" />
            ) : (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {sources.map(s => (
                  <button key={s} onClick={() => setSource(s)} className={`px-5 py-3 rounded-2xl text-[10px] font-black shrink-0 border transition-all ${source === s ? 'bg-primary text-bg-dark border-primary' : 'bg-bg-dark border-white/5 text-gray-600'}`}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">group</span>
              <span className="text-sm font-bold">Quem gastou?</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSelectedMemberIds([])} className={`px-4 py-3 rounded-2xl text-[10px] font-bold border transition-all ${selectedMemberIds.length === 0 ? 'bg-primary/20 border-primary text-primary' : 'bg-bg-dark border-white/5 text-gray-500'}`}>GERAL / AGREGADO</button>
              {members.map(m => (
                <button key={m.id} onClick={() => toggleMember(m.id)} className={`px-4 py-3 rounded-2xl text-[10px] font-bold border transition-all truncate ${selectedMemberIds.includes(m.id) ? 'bg-primary/20 border-primary text-primary' : 'bg-bg-dark border-white/5 text-gray-500'}`}>
                  {m.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">notes</span>
              <span className="text-sm font-bold">Notas</span>
            </div>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Notas adicionais..." 
              className="w-full bg-bg-dark border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-secondary transition-all min-h-[80px] resize-none"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddExpense;
