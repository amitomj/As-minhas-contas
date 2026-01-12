
import React, { useState } from 'react';
import { Member } from '../types';

interface Props {
  members: Member[];
  onUpdate: (m: Member[]) => void;
  onBack: () => void;
}

const HouseholdManagement: React.FC<Props> = ({ members = [], onUpdate, onBack }) => {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleStartEdit = (m: Member) => {
    setEditingMember(m);
    setName(m.name);
    setRole(m.role);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingMember) {
      onUpdate(members.map(m => m.id === editingMember.id ? { ...m, name: name.trim(), role: role.trim() || 'Membro' } : m));
    } else {
      const next: Member = { id: Math.random().toString(36).substr(2, 9), name: name.trim(), role: role.trim() || 'Membro' };
      onUpdate([...members, next]);
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setName('');
    setRole('');
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar pb-32">
      <header className="flex items-center gap-4 pt-10 pb-6 shrink-0">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Agregado</h2>
      </header>

      <div className="space-y-6 flex-1">
        <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-4 shadow-xl">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] text-center mb-2">
            {editingMember ? 'Editar Membro' : 'Novo Membro'}
          </h3>
          <div className="space-y-3">
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="NOME DO MEMBRO" 
              className="w-full bg-bg-dark border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-primary uppercase font-black tracking-widest" 
            />
            <input 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              placeholder="PAPEL (EX: PAI, FILHO...)" 
              className="w-full bg-bg-dark border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-primary uppercase font-black tracking-widest" 
            />
          </div>
          <div className="flex gap-3">
             <button onClick={handleSave} className="flex-1 py-5 bg-primary text-bg-dark font-black uppercase tracking-widest rounded-2xl text-[11px] shadow-lg shadow-primary/10">
               {editingMember ? 'Atualizar' : 'Adicionar'}
             </button>
             {editingMember && (
               <button onClick={cancelEdit} className="px-6 bg-white/5 text-white font-black rounded-2xl border border-white/10">
                 X
               </button>
             )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-4">Membros Atuais</h3>
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between p-6 bg-surface-dark/50 rounded-[2.5rem] border border-white/5 group active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="size-14 bg-primary/10 text-primary flex items-center justify-center rounded-2xl font-black text-xl border border-primary/5">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-widest">{m.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">{m.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleStartEdit(m)} className="p-3 text-blue-400 bg-white/5 rounded-xl hover:bg-white/10"><span className="material-symbols-outlined text-lg">edit</span></button>
                <button onClick={() => { if(confirm('Eliminar membro?')) onUpdate(members.filter(x => x.id !== m.id)) }} className="p-3 text-red-500 bg-white/5 rounded-xl hover:bg-white/10"><span className="material-symbols-outlined text-lg">delete</span></button>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="py-20 flex flex-col items-center opacity-10">
              <span className="material-symbols-outlined text-7xl mb-4">group_add</span>
              <p className="text-[11px] font-black uppercase tracking-[0.4em]">Agregado vazio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseholdManagement;
