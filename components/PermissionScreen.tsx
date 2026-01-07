
import React from 'react';

interface Props {
  onGrant: () => void;
}

const PermissionScreen: React.FC<Props> = ({ onGrant }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-bg-dark">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
        <div className="relative size-32 bg-surface-dark rounded-3xl border border-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-6xl">folder_managed</span>
        </div>
        <div className="absolute -top-2 -right-2 bg-white text-bg-dark p-1 rounded-full border-4 border-bg-dark">
          <span className="material-symbols-outlined text-sm font-bold">lock</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Permissão de<br/>Armazenamento</h1>
      <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-xs">
        Para começarmos, a aplicação precisa da sua permissão para criar e gerir um ficheiro <span className="font-mono text-xs bg-white/10 px-1 py-0.5 rounded">JSON</span> no armazenamento do seu telemóvel para guardar o seu histórico.
      </p>

      <div className="w-full bg-white/5 border border-dashed border-white/20 p-4 rounded-xl flex items-center gap-3 mb-12">
        <span className="material-symbols-outlined text-gray-500">description</span>
        <div className="text-left">
          <p className="text-xs font-mono text-gray-400">financas_pessoais.json</p>
          <p className="text-[10px] text-gray-600">Armazenamento Local</p>
        </div>
        <span className="material-symbols-outlined text-primary ml-auto text-sm">check_circle</span>
      </div>

      <button 
        onClick={onGrant}
        className="w-full py-4 bg-primary text-bg-dark font-bold rounded-xl shadow-lg shadow-primary/20"
      >
        Permitir Acesso
      </button>
      <p className="text-[10px] text-gray-600 mt-4">
        Os seus dados permanecem sempre no seu telemóvel e nunca são enviados para a nuvem.
      </p>
    </div>
  );
};

export default PermissionScreen;
