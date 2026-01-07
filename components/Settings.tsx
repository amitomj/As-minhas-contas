
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
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    if (pin && pin.length !== 4) {
      alert("O PIN deve ter exatamente 4 dígitos.");
      return;
    }
    onUpdateUser({ ...user, name, pin });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="h-full bg-bg-dark flex flex-col p-6 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between pt-8 pb-4 shrink-0">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Definições</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 space-y-8 pt-10">
        <div className="flex flex-col items-center gap-4">
          <img src={user.avatar} className="size-24 rounded-3xl border-4 border-primary/20 shadow-2xl" alt="Avatar" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{user.email}</p>
        </div>

        <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-8 shadow-2xl">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-600 uppercase ml-1 tracking-widest">Nome do Perfil</label>
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-bg-dark border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary transition-all text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-600 uppercase ml-1 tracking-widest">Alterar PIN (4 dígitos)</label>
            <input 
              type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-bg-dark border border-white/10 rounded-2xl px-5 py-4 text-lg font-black tracking-[1em] text-center focus:border-primary transition-all text-white"
              placeholder="••••"
            />
            <p className="text-[9px] text-gray-500 italic mt-1 ml-1">O PIN é usado para o acesso rápido na entrada da aplicação.</p>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-5 bg-gradient-to-r from-secondary to-accent text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-secondary/20 active:scale-95 transition-all mt-4"
          >
            Guardar Alterações
          </button>

          {success && (
            <div className="flex items-center justify-center gap-2 text-primary font-bold animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined">check_circle</span>
              <span className="text-sm">Perfil atualizado com sucesso!</span>
            </div>
          )}
        </div>

        <div className="pt-4 px-2 space-y-4">
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Sobre a Aplicação</h3>
          <div className="bg-surface-dark/50 rounded-2xl p-4 border border-white/5">
             <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs text-gray-400">Versão</span>
                <span className="text-xs font-bold text-white">2.5.1-pro</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs text-gray-400">Armazenamento</span>
                <span className="text-xs font-bold text-white">JSON Local</span>
             </div>
             <div className="flex justify-between items-center py-2">
                <span className="text-xs text-gray-400">Segurança</span>
                <span className="text-xs font-bold text-green-400">Encriptação Local</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
