
import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';

interface Props {
  onLogin: (user: UserAccount) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'pin'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [enteredPin, setEnteredPin] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedUsers = JSON.parse(localStorage.getItem('financas_pro_users') || '[]');
    
    if (mode === 'login') {
      const user = storedUsers.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin({ ...user, avatar: `https://picsum.photos/seed/${user.email}/200` });
      } else {
        alert('Credenciais inválidas');
      }
    } else {
      if (!email || !password || !name || !pin) {
        alert('Preencha todos os campos, incluindo o PIN de 4 dígitos');
        return;
      }
      if (storedUsers.some((u: any) => u.email === email)) {
        alert('Email já registado');
        return;
      }
      const newUser = { email, password, name, pin };
      localStorage.setItem('financas_pro_users', JSON.stringify([...storedUsers, newUser]));
      onLogin({ email, name, pin, avatar: `https://picsum.photos/seed/${email}/200` });
    }
  };

  const handlePinInput = (num: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const verifyPin = (p: string) => {
    const lastEmail = localStorage.getItem('financas_pro_last_email');
    const storedUsers = JSON.parse(localStorage.getItem('financas_pro_users') || '[]');
    const user = storedUsers.find((u: any) => u.email === lastEmail && u.pin === p);

    if (user) {
      onLogin({ ...user, avatar: `https://picsum.photos/seed/${user.email}/200` });
    } else {
      alert('PIN Incorreto');
      setEnteredPin('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-dark px-8 justify-center animate-in fade-in duration-500 relative overflow-hidden">
      <div className="flex flex-col items-center mb-10">
        <div className="size-24 bg-gradient-to-br from-secondary via-accent to-primary rounded-[2rem] flex items-center justify-center mb-4 shadow-2xl shadow-secondary/20">
          <span className="material-symbols-outlined text-white text-5xl font-black">trending_up</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-white">Finanças Pro</h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Segurança & Organização</p>
      </div>

      {mode === 'pin' ? (
        <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
          <p className="text-sm font-bold text-gray-400 mb-8">Introduza o seu PIN</p>
          <div className="flex gap-4 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`size-4 rounded-full border-2 transition-all duration-300 ${enteredPin.length > i ? 'bg-primary border-primary scale-125' : 'border-white/10'}`}></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0].map((n, i) => (
              n === '' ? <div key={i}></div> : (
                <button 
                  key={i} onClick={() => handlePinInput(n.toString())}
                  className="size-16 rounded-2xl bg-surface-dark border border-white/5 text-2xl font-black hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center text-white"
                >
                  {n}
                </button>
              )
            ))}
            <button onClick={() => setEnteredPin('')} className="size-16 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors">
              <span className="material-symbols-outlined text-3xl">backspace</span>
            </button>
          </div>
          <button onClick={() => setMode('login')} className="mt-10 text-xs text-gray-600 font-bold uppercase hover:text-white transition-colors">Login com Password</button>
        </div>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Nome Completo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface-dark border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-secondary transition-all" placeholder="Ex: João Silva" />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-surface-dark border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-secondary transition-all" placeholder="exemplo@email.com" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Palavra-passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-surface-dark border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-secondary transition-all" placeholder="••••••••" />
          </div>
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Definir PIN (4 dígitos)</label>
              <input type="tel" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,''))} className="w-full bg-surface-dark border border-white/5 rounded-2xl px-5 py-4 text-sm tracking-[1em] text-center font-black focus:border-secondary transition-all" placeholder="0000" />
            </div>
          )}
          
          <button type="submit" className="w-full py-5 bg-gradient-to-r from-secondary to-accent text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-secondary/20 mt-4 active:scale-95 transition-all">
            {mode === 'login' ? 'Entrar' : 'Finalizar Registo'}
          </button>

          <div className="flex flex-col items-center gap-4 mt-8">
            <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-xs text-gray-500 font-bold uppercase hover:text-white transition-colors">
              {mode === 'login' ? 'Não tem conta? Registe-se' : 'Já tem conta? Login'}
            </button>
            {mode === 'login' && localStorage.getItem('financas_pro_last_email') && (
              <button type="button" onClick={() => setMode('pin')} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-primary font-black text-[10px] uppercase hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-sm">dialpad</span> Entrar com PIN
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default Auth;
