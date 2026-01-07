
import React, { useState } from 'react';
import { UserAccount } from '../types';

interface Props {
  user: UserAccount;
  onUpdateUser: (u: UserAccount) => void;
  onBack: () => void;
}

const Settings: React.FC<Props> = ({ user, onUpdateUser, onBack }) => {
  const [name, setName] = useState(user.name);
  const [pin, setPin] = useState(user.pin || '');

  const handleSave = () => {
    onUpdateUser({ ...user, name, pin });
    onBack();
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 pt-10 pb-6 shrink-0">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Definições</h2>
      </header>

      <div className="space-y-8 flex-1">
        <div className="flex flex-col items-center gap-4 mt-6">
          <img src={user.avatar} className="size-24 rounded-3xl border-4 border-primary/20 shadow-xl" alt="Avatar" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{user.email}</p>
        </div>

        <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Nome do Perfil</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-bg-dark border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary text-white" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Alterar PIN (4 dígitos)</label>
            <input type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} className="w-full bg-bg-dark border border-white/10 rounded-2xl px-5 py-4 text-center text-lg font-black tracking-widest focus:border-primary text-white" />
          </div>

          <button onClick={handleSave} className="w-full py-5 bg-primary text-bg-dark font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
