
import React, { useState } from 'react';
import { Member } from '../types';

interface Props {
  members: Member[];
  onUpdate: (m: Member[]) => void;
  onBack: () => void;
}

const HouseholdManagement: React.FC<Props> = ({ members, onUpdate, onBack }) => {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleSave = () => {
    if (!name) return;
    if (editingMember) {
      onUpdate(members.map(m => m.id === editingMember.id ? { ...m, name, role: role || 'Membro' } : m));
    } else {
      const next: Member = { id: Math.random().toString(36).substr(2, 9), name, role: role || 'Membro' };
      onUpdate([...members, next]);
    }
    setEditingMember(null);
    setName('');
    setRole('');
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 pt-10 pb-6 shrink-0">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Agregado</h2>
      </header>

      <div className="space-y-6 flex-1">
        <div className="bg-surface-dark rounded-[2rem] p-6 border border-white/5">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Membros Atuais</h3>
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-bg-dark/50 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/20 text-primary flex items-center justify-center rounded-xl font-black">{m.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-bold text-white">{m.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{m.role}</p>
                  </div>
                </div>
                <button onClick={() => onUpdate(members.filter(x => x.id !== m.id))} className="text-red-500 material-symbols-outlined">delete</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-dark rounded-[2rem] p-6 border border-white/5 space-y-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{editingMember ? 'Editar' : 'Adicionar'} Membro</h3>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-primary" />
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="Papel (ex: Pai, Filho)" className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-primary" />
          <button onClick={handleSave} className="w-full py-4 bg-primary text-bg-dark font-black uppercase tracking-widest rounded-xl">Salvar Membro</button>
        </div>
      </div>
    </div>
  );
};

export default HouseholdManagement;
