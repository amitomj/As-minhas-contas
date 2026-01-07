
import React, { useState } from 'react';
import { Member } from '../types';

interface Props {
  members: Member[];
  onUpdate: (m: Member[]) => void;
  onBack: () => void;
}

const HouseholdManagement: React.FC<Props> = ({ members, onUpdate, onBack }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  const addMember = () => {
    if (!newName) return;
    const next: Member = { id: Math.random().toString(36).substr(2, 9), name: newName, role: newRole || 'Membro' };
    onUpdate([...members, next]);
    setNewName('');
    setNewRole('');
  };

  const removeMember = (id: string) => {
    onUpdate(members.filter(m => m.id !== id));
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4">
      <header className="flex items-center justify-between pt-8 pb-4">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Gestão de Agregado</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar space-y-6 pt-6">
        <div className="px-2">
          <h3 className="text-sm font-bold text-gray-400 mb-4">Membros da Família</h3>
          <div className="space-y-3">
             {members.map(m => (
               <div key={m.id} className="flex items-center justify-between p-4 bg-surface-dark rounded-2xl border border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                     {m.name.substring(0, 2).toUpperCase()}
                   </div>
                   <div>
                     <p className="text-sm font-bold">{m.name}</p>
                     <p className="text-xs text-gray-500">{m.role}</p>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <button className="text-gray-500"><span className="material-symbols-outlined text-sm">edit</span></button>
                   <button onClick={() => removeMember(m.id)} className="text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="px-2 pt-6">
          <h3 className="text-sm font-bold text-gray-400 mb-4">Novo Membro</h3>
          <div className="bg-surface-dark rounded-2xl p-4 border border-white/5 space-y-4">
             <input 
               placeholder="Nome..."
               value={newName}
               onChange={e => setNewName(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-primary"
             />
             <input 
               placeholder="Parentesco (ex: Filho, Parceiro)..."
               value={newRole}
               onChange={e => setNewRole(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-primary"
             />
             <button 
               onClick={addMember}
               className="w-full py-3 bg-primary text-bg-dark font-bold rounded-xl active:scale-95 transition-all"
             >
               Adicionar Membro
             </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HouseholdManagement;
