
import React, { useState, useRef } from 'react';
import { AppData, View, Expense, UserAccount, Project } from '../types';

interface HomeProps {
  data: AppData;
  setView: (v: View) => void;
  onLogout: () => void;
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
  onUpdateUser: (u: UserAccount) => void;
  onUpdateSources: (s: string[]) => void;
  onDeleteSource: (s: string) => void;
  onUpdateMethods: (m: string[]) => void;
  onDeleteMethod: (m: string) => void;
  onAddProject: (name: string, desc?: string) => void;
  onUpdateProjects: (p: Project[]) => void;
  onDeleteProject: (id: string) => void;
  deferredPrompt: any;
  setDeferredPrompt: (p: any) => void;
}

const Home: React.FC<HomeProps> = ({ 
  data, setView, onLogout, onUpdateUser, onUpdateSources, onDeleteSource, 
  onUpdateMethods, onDeleteMethod, onAddProject, onUpdateProjects, onDeleteProject 
}) => {
  const [activeManager, setActiveManager] = useState<'source' | 'method' | 'project' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSpent = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...data.user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderManagerContent = (type: 'source' | 'method' | 'project') => {
    return (
      <div className="space-y-4 bg-[#050c09] p-6 rounded-3xl border border-white/5 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl mt-4">
        <div className="flex gap-2">
          <input 
            value={newItemName} 
            onChange={e => setNewItemName(e.target.value)} 
            placeholder={`Novo ${type === 'project' ? 'projeto' : 'item'}...`} 
            className="flex-1 bg-bg-dark border border-white/10 rounded-xl px-4 text-xs h-12 text-white placeholder-white/20 uppercase font-black" 
          />
          <button 
            onClick={() => { 
              if(!newItemName) return;
              if(type === 'source') onUpdateSources([...data.sources, newItemName]);
              else if(type === 'method') onUpdateMethods([...data.paymentMethods, newItemName]);
              else onAddProject(newItemName);
              setNewItemName(''); 
            }} 
            className="bg-primary text-bg-dark px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest"
          >
            ADD
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto space-y-2 no-scrollbar">
          {type === 'project' ? (
            data.projects.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-black text-white/70">{p.name}</span>
                <button onClick={() => onDeleteProject(p.id)} className="text-red-400 material-symbols-outlined text-sm">delete</button>
              </div>
            ))
          ) : (
            (type === 'source' ? data.sources : data.paymentMethods).map(item => (
              <div key={item} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-black text-white/70">{item}</span>
                <button onClick={() => type === 'source' ? onDeleteSource(item) : onDeleteMethod(item)} className="text-red-400 material-symbols-outlined text-sm">delete</button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const ActionButton = ({ icon, label, onClick, color = "bg-[#11291f]" }: { icon: string, label: string, onClick: () => void, color?: string }) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 rounded-[2.8rem] border border-white/5 text-white shadow-lg btn-active ${color} transition-all`}
    >
      <span className="material-symbols-outlined text-4xl mb-2">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
    </button>
  );

  return (
    <div className="h-full flex flex-col pb-32 overflow-y-auto no-scrollbar relative bg-[#050c09]">
      <header className="flex items-center justify-between px-6 pt-12 pb-4 shrink-0 z-50">
        <div className="flex items-center gap-3 p-2 cursor-pointer" onClick={handleAvatarClick}>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <div className="relative">
            <img src={data.user.avatar} className="h-10 w-10 rounded-xl border-2 border-primary/20 object-cover" alt="Avatar" />
            <div className="absolute -bottom-1 -right-1 bg-primary size-4 rounded-full flex items-center justify-center border-2 border-[#050c09]">
              <span className="material-symbols-outlined text-[10px] text-bg-dark font-black">add</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 font-black uppercase leading-none mb-1">Olá,</p>
            <h2 className="text-sm font-black text-white">{data.user.name}</h2>
          </div>
        </div>
        <button onClick={onLogout} className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 text-red-400 btn-active">
          <span className="material-symbols-outlined text-lg font-black">logout</span>
        </button>
      </header>

      <main className="flex-1 px-6 space-y-10">
        <section className="mt-4">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Saldo Utilizado</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-primary">€</span>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              -{totalSpent.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
            </h1>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-5">
          <button 
            onClick={() => setView('add-expense')} 
            className="flex flex-col items-center justify-center py-10 rounded-[3.5rem] bg-gradient-to-br from-primary via-[#13ec5b] to-secondary text-bg-dark shadow-2xl active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-5xl mb-3 font-black">add_circle</span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Novo Gasto</span>
          </button>
          <button 
            onClick={() => setView('export')} 
            className="flex flex-col items-center justify-center py-10 rounded-[3.5rem] bg-[#11291f] border border-white/10 text-white shadow-xl active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-5xl mb-3 text-primary">file_export</span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Exportar</span>
          </button>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Área de Gestão</h3>
            <button 
              onClick={() => setView('transactions')} 
              className="text-[10px] text-primary font-black uppercase tracking-widest px-6 py-4 bg-primary/5 rounded-xl active:scale-95 transition-all"
            >
              Ver Tudo
            </button>
          </div>

          <div className="bg-[#11291f]/40 rounded-[3.5rem] p-8 border border-white/5 backdrop-blur-sm shadow-2xl">
            <div className="grid grid-cols-2 gap-5 mb-10">
              <ActionButton icon="receipt_long" label="Histórico" onClick={() => setView('transactions')} />
              <ActionButton icon="folder" label="Projetos" onClick={() => setView('projects')} />
              <ActionButton icon="group" label="Agregado" onClick={() => setView('household')} />
              <ActionButton icon="monitoring" label="Gráfico" onClick={() => setView('stats')} />
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gerir Itens</span>
                <div className="flex gap-3">
                   <button 
                    onClick={() => setActiveManager(activeManager === 'source' ? null : 'source')} 
                    className={`text-[9px] font-black uppercase tracking-widest transition-all px-3 py-2 rounded-xl ${activeManager === 'source' ? 'bg-primary text-bg-dark' : 'text-primary border border-primary/20'}`}
                   >
                    {activeManager === 'source' ? 'FECHAR' : 'ORIGENS'}
                   </button>
                   <button 
                    onClick={() => setActiveManager(activeManager === 'method' ? null : 'method')} 
                    className={`text-[9px] font-black uppercase tracking-widest transition-all px-3 py-2 rounded-xl ${activeManager === 'method' ? 'bg-primary text-bg-dark' : 'text-primary border border-primary/20'}`}
                   >
                    {activeManager === 'method' ? 'FECHAR' : 'PAGAMENTOS'}
                   </button>
                </div>
              </div>
              
              {activeManager === 'source' && renderManagerContent('source')}
              {activeManager === 'method' && renderManagerContent('method')}
              
              {!activeManager && (
                 <div className="bg-[#050c09]/50 p-6 rounded-[2.5rem] border border-white/5 text-center">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Listas de Categorias e Cartões</p>
                 </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
