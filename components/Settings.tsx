
import React from 'react';
import { UserAccount } from '../types';

interface Props {
  user: UserAccount;
  onBack: () => void;
  onPCFile: () => void;
  hasFile: boolean;
}

const Settings: React.FC<Props> = ({ user, onBack, onPCFile, hasFile }) => {
  return (
    <div className="h-full bg-bg-dark flex flex-col p-4 overflow-y-auto no-scrollbar pb-32">
      <header className="flex items-center gap-4 pt-10 pb-6 shrink-0">
        <button onClick={onBack} className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-dark btn-active">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">Definições</h2>
      </header>

      <div className="space-y-8">
        <div className="bg-surface-dark rounded-[2rem] p-8 border border-white/5 space-y-6">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sincronização PC</h3>
           <p className="text-[10px] text-gray-400 uppercase leading-relaxed font-bold">Guarde os seus dados num ficheiro local para maior segurança e portabilidade no computador.</p>
           <button onClick={onPCFile} className={`w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${hasFile ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-white/5 border border-white/10 text-white'}`}>
             {hasFile ? 'Ficheiro Sincronizado' : 'Escolher Ficheiro JSON'}
           </button>
        </div>

        <div className="bg-surface-dark rounded-[2rem] p-8 border border-white/5 space-y-4">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Perfil</h3>
           <div className="flex items-center gap-4">
              <img src={user.avatar} className="size-16 rounded-2xl border-2 border-primary/20" alt="Avatar" />
              <div>
                <p className="font-black text-white text-sm">{user.name}</p>
                <p className="text-[10px] text-gray-500">{user.email}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
