
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
    resetForm();
  };

  const removeMember = (id: string) => {
    if (confirm("Deseja eliminar este membro do agregado?")) {
      onUpdate(members.filter(m => m.id !== id));
    }
  };

  const resetForm = () => {
    setEditingMember(null);
    setName('');
    setRole('');
  };

  const startEdit = (m: Member) => {
    setEditingMember(m);
    setName(m.name);
    setRole(m.role);
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4">
      <header className="flex items-center justify-between pt-8 pb-4">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Gestão de Agregado</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar space-y-6 pt-6 px-2">
        <div>
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Membros Ativos</h3>
          <div className="space-y-3">
             {members.length === 0 ? (
               <p className="text-xs text-gray-600 text-center py-8 border border-dashed border-white/5 rounded-3xl">Nenhum membro adicionado</p>
             ) : (
               members.map(m => (
                 <div key={m.id} className="flex items-center justify-between p-5 bg-surface-dark rounded-3xl border border-white/5 active:scale-[0.98] transition-all">
                   <div className="flex items-center gap-4">
                     <div className="size-11 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-black">
                       {m.name.substring(0, 1).toUpperCase()}
                     </div>
                     <div>
                       <p className="text-sm font-bold">{m.name}</p>
                       <p className="text-[10px] text-gray-500 uppercase font-black">{m.role}</p>
                     </div>
                   </div>
                   <div className="flex gap-1">
                     <button onClick={() => startEdit(m)} className="h-10 w-10 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-400/10">
                       <span className="material-symbols-outlined text-xl">edit</span>
                     </button>
                     <button onClick={() => removeMember(m.id)} className="h-10 w-10 flex items-center justify-center rounded-full text-red-400 hover:bg-red-400/10">
                       <span className="material-symbols-outlined text-xl">delete</span>
                     </button>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">
            {editingMember ? 'Editar Membro' : 'Novo Membro'}
          </h3>
          <div className="bg-surface-dark rounded-[2.5rem] p-7 border border-white/5 space-y-5 shadow-2xl shadow-black/40">
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-gray-600 ml-1 uppercase">Nome do Familiar</label>
               <input 
                 placeholder="Ex: Maria Pereira..."
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="w-full bg-bg-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-primary focus:border-primary transition-all"
               />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black text-gray-600 ml-1 uppercase">Grau de Parentesco</label>
               <input 
                 placeholder="Ex: Filho, Cônjuge..."
                 value={role}
                 onChange={e => setRole(e.target.value)}
                 className="w-full bg-bg-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-primary focus:border-primary transition-all"
               />
             </div>
             <div className="flex gap-2 pt-2">
               {editingMember && (
                 <button 
                   onClick={resetForm}
                   className="flex-1 py-4 bg-white/5 text-gray-400 font-bold rounded-2xl active:scale-95 transition-all"
                 >
                   Cancelar
                 </button>
               )}
               <button 
                 onClick={handleSave}
                 className="flex-[2] py-4 bg-primary text-bg-dark font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all"
               >
                 {editingMember ? 'Atualizar Membro' : 'Adicionar ao Agregado'}
               </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HouseholdManagement;
