
import React, { useState, useEffect } from 'react';
import { AppData, View, Expense, UserAccount } from '../types';

interface HomeProps {
  data: AppData;
  setView: (v: View) => void;
  onLogout: () => void;
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
  onUpdateUser: (u: UserAccount) => void;
}

const Home: React.FC<HomeProps> = ({ data, setView, onLogout, onEdit, onDelete, onUpdateUser }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('financas_pro_last_email', data.user.email);
    // Mostrar prompt de biometria se o navegador suportar e ainda não estiver ativo
    if (!data.user.biometricEnabled && window.PublicKeyCredential) {
      const timer = setTimeout(() => setShowBiometricPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [data.user.biometricEnabled, data.user.email]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const enableBiometrics = async () => {
    // Simulação de registo biométrico
    // Em produção, aqui chamaríamos navigator.credentials.create(...)
    onUpdateUser({ ...data.user, biometricEnabled: true });
    setShowBiometricPrompt(false);
    alert("Acesso com Impressão Digital ativado com sucesso para esta conta!");
  };

  const currentMonth = "Janeiro 2025";
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col pb-32 overflow-y-auto no-scrollbar relative">
      {/* Biometric Prompt Overlay */}
      {showBiometricPrompt && (
        <div className="fixed inset-0 z-[100] flex items-end p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full bg-surface-dark rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-4xl font-bold">fingerprint</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Ativar Biometria?</h3>
                <p className="text-sm text-gray-500 mt-1">Aceda à sua conta de forma instantânea usando a sua impressão digital.</p>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <button onClick={() => setShowBiometricPrompt(false)} className="flex-1 py-4 bg-white/5 rounded-2xl text-xs font-bold text-gray-500">Agora não</button>
                <button onClick={enableBiometrics} className="flex-2 py-4 bg-primary text-bg-dark rounded-2xl text-xs font-black uppercase tracking-widest">Ativar Agora</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <img src={data.user.avatar} className="h-10 w-10 rounded-full border-2 border-primary/20" alt="Avatar" />
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Bem-vindo,</p>
            <h2 className="text-sm font-bold">{data.user.name}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          {deferredPrompt && (
            <button onClick={handleInstallClick} className="h-10 px-4 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 animate-bounce">
              <span className="material-symbols-outlined text-xl mr-2">install_mobile</span>
              <span className="text-[10px] font-black uppercase">Instalar</span>
            </button>
          )}
          <button onClick={onLogout} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-dark text-red-400 border border-white/5">
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      {/* Balance Card */}
      <div className="px-6 py-4">
        <div className="bg-gradient-to-br from-primary via-primary to-green-700 p-7 rounded-[2.5rem] text-bg-dark shadow-2xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-8xl font-black">wallet</span>
          </div>
          <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">Saldo na Conta JSON</p>
          <h1 className="text-4xl font-black mb-6">€{data.balance.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</h1>
          <div className="flex justify-between items-end">
            <div className="flex -space-x-2">
              {data.members.slice(0, 3).map((m, i) => (
                <div key={m.id} className="size-9 rounded-full border-2 border-primary bg-bg-dark flex items-center justify-center text-[10px] font-black text-white ring-2 ring-primary/20" style={{ zIndex: 10 - i }}>
                  {m.name.charAt(0)}
                </div>
              ))}
              {data.members.length > 3 && (
                <div className="size-9 rounded-full border-2 border-primary bg-surface-dark flex items-center justify-center text-[10px] font-black text-white" style={{ zIndex: 0 }}>
                  +{data.members.length - 3}
                </div>
              )}
            </div>
            <button onClick={() => setView('transactions')} className="px-5 py-2.5 bg-bg-dark/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-tighter border border-bg-dark/10">Histórico</button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-4 mt-2">
        <div className="bg-surface-dark rounded-[2rem] p-6 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-5 px-2">
            <button className="material-symbols-outlined text-gray-600">chevron_left</button>
            <h3 className="text-[11px] font-black tracking-[0.2em] uppercase text-gray-400">{currentMonth}</h3>
            <button className="material-symbols-outlined text-gray-600">chevron_right</button>
          </div>
          <div className="grid grid-cols-7 gap-y-3">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(d => (
              <div key={d} className="text-center text-[9px] font-black text-gray-700">{d}</div>
            ))}
            {days.slice(0, 14).map(d => (
              <div key={d} className="flex justify-center">
                <div className={`size-9 flex items-center justify-center rounded-2xl text-[11px] font-bold transition-all ${d === 5 ? 'bg-primary text-bg-dark shadow-lg shadow-primary/30 border-4 border-bg-dark' : 'text-gray-500 hover:bg-white/5'}`}>
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 px-8 flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">Atividade</h3>
        <button onClick={() => setView('transactions')} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1.5 rounded-lg">Ver Tudo</button>
      </div>

      <div className="mt-4 px-4 flex flex-col gap-3">
        {data.expenses.slice(0, 5).map(exp => (
          <div key={exp.id} className="relative">
            <div 
              className={`flex items-center justify-between p-5 bg-surface-dark rounded-[2rem] border transition-all ${actionMenuId === exp.id ? 'border-primary ring-1 ring-primary/20' : 'border-white/5'} group active:scale-[0.98]`}
              onClick={() => setActionMenuId(actionMenuId === exp.id ? null : exp.id)}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 flex items-center justify-center bg-bg-dark/50 rounded-2xl text-primary">
                  <span className="material-symbols-outlined font-bold">receipt</span>
                </div>
                <div>
                  <p className="text-sm font-bold truncate max-w-[120px]">{exp.source}</p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">{new Date(exp.date).toLocaleDateString('pt-PT')}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="text-sm font-black">-€{exp.amount.toFixed(2)}</p>
                  <p className="text-[9px] text-gray-700 font-bold uppercase">Consolidado</p>
                </div>
                <span className="material-symbols-outlined text-gray-700 text-sm">more_vert</span>
              </div>
            </div>

            {/* Action Menu */}
            {actionMenuId === exp.id && (
              <div className="absolute right-4 top-16 bg-bg-dark border border-white/10 rounded-2xl shadow-2xl z-50 p-2 min-w-[120px] animate-in fade-in zoom-in-95">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(exp); setActionMenuId(null); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-[11px] font-bold text-blue-400 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">edit</span> Editar
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(exp.id); setActionMenuId(null); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-[11px] font-bold text-red-400 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setView('add-expense')}
        className="fixed bottom-28 right-8 h-16 w-16 bg-primary text-bg-dark rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-transform z-50 border-4 border-bg-dark group"
      >
        <span className="material-symbols-outlined text-4xl font-black group-hover:rotate-90 transition-transform">add</span>
      </button>
    </div>
  );
};

export default Home;
