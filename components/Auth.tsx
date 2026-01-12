
import React, { useState } from 'react';
import { UserAccount } from '../types';

interface Props {
  onLogin: (user: UserAccount) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'pin' | 'recover'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [enteredPin, setEnteredPin] = useState('');

  // Estados para Recuperação
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryName, setRecoveryName] = useState('');
  const [recoveredUser, setRecoveredUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedUsers = JSON.parse(localStorage.getItem('financas_pro_users') || '[]');
    
    if (mode === 'login') {
      const user = storedUsers.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin({ ...user, avatar: user.avatar || `https://picsum.photos/seed/${user.email}/200` });
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
      const newUser = { email, password, name, pin, avatar: `https://picsum.photos/seed/${email}/200` };
      localStorage.setItem('financas_pro_users', JSON.stringify([...storedUsers, newUser]));
      onLogin(newUser);
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedUsers = JSON.parse(localStorage.getItem('financas_pro_users') || '[]');
    const user = storedUsers.find((u: any) => 
      u.email.toLowerCase() === recoveryEmail.toLowerCase() && 
      u.name.toLowerCase() === recoveryName.toLowerCase()
    );

    if (user) {
      setRecoveredUser(user);
    } else {
      alert('Dados de recuperação não coincidem com nenhum utilizador.');
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      alert('A nova password deve ter pelo menos 4 caracteres.');
      return;
    }
    const storedUsers = JSON.parse(localStorage.getItem('financas_pro_users') || '[]');
    const updatedUsers = storedUsers.map((u: any) => 
      u.email === recoveredUser.email ? { ...u, password: newPassword } : u
    );
    localStorage.setItem('financas_pro_users', JSON.stringify(updatedUsers));
    alert('Password atualizada com sucesso!');
    setMode('login');
    setRecoveredUser(null);
    setRecoveryEmail('');
    setRecoveryName('');
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
      onLogin({ ...user, avatar: user.avatar || `https://picsum.photos/seed/${user.email}/200` });
    } else {
      alert('PIN Incorreto');
      setEnteredPin('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050c09] px-10 justify-center animate-in fade-in duration-500 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] size-[80%] bg-[#0ea5e9]/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] size-[80%] bg-[#13ec5b]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col items-center mb-12 relative z-10">
        <div className="size-28 border-2 border-[#0ea5e9]/30 flex items-center justify-center mb-6 relative rotate-45 rounded-[2rem]">
          <div className="size-16 bg-gradient-to-br from-[#0ea5e9] via-[#8b5cf6] to-[#13ec5b] rounded-2xl flex items-center justify-center shadow-2xl -rotate-45">
            <span className="material-symbols-outlined text-white text-4xl font-black">shield_person</span>
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white mb-1">Finanças Pro</h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Segurança & Organização</p>
      </div>

      <div className="relative z-10">
        {mode === 'pin' ? (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10">Introduza o seu PIN</p>
            <div className="flex gap-4 mb-14">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`size-4 rounded-full border-2 transition-all duration-300 ${enteredPin.length > i ? 'bg-[#0ea5e9] border-[#0ea5e9] scale-125' : 'border-white/10'}`}></div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0].map((n, i) => (
                n === '' ? <div key={i}></div> : (
                  <button 
                    key={i} onClick={() => handlePinInput(n.toString())}
                    className="size-16 rounded-2xl bg-[#111d18] border border-white/5 text-2xl font-black hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center text-white"
                  >
                    {n}
                  </button>
                )
              ))}
              <button onClick={() => setEnteredPin('')} className="size-16 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors">
                <span className="material-symbols-outlined text-3xl">backspace</span>
              </button>
            </div>
            <div className="mt-12 flex flex-col items-center gap-4">
              <button onClick={() => setMode('login')} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors">Login com Password</button>
              <button onClick={() => setMode('recover')} className="text-[10px] font-black text-[#0ea5e9] uppercase tracking-widest hover:underline">Esqueceu o PIN?</button>
            </div>
          </div>
        ) : mode === 'recover' ? (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            {!recoveredUser ? (
              <form onSubmit={handleRecoverySubmit} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-black text-white uppercase tracking-widest">Recuperar Acesso</h2>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-2">Valide a sua identidade</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase ml-1 tracking-widest">Email da Conta</label>
                  <input type="email" required value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} className="w-full bg-[#111d18] border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:border-[#0ea5e9] transition-all" placeholder="exemplo@email.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase ml-1 tracking-widest">Nome Completo</label>
                  <input type="text" required value={recoveryName} onChange={e => setRecoveryName(e.target.value)} className="w-full bg-[#111d18] border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:border-[#0ea5e9] transition-all" placeholder="João Silva" />
                </div>
                <button type="submit" className="w-full py-6 bg-primary text-bg-dark font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/10 active:scale-95 transition-all">
                  Verificar Identidade
                </button>
                <button type="button" onClick={() => setMode('login')} className="w-full text-center text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white pt-4">
                  Voltar ao Login
                </button>
              </form>
            ) : (
              <div className="space-y-8 animate-in zoom-in-95">
                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 text-center space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">verified_user</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Identidade Confirmada</h3>
                  <div className="py-4 border-y border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">O seu PIN atual é:</p>
                    <p className="text-4xl font-black text-primary tracking-[0.5em] ml-4">{recoveredUser.pin}</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <label className="text-[9px] font-black text-gray-500 uppercase ml-1 tracking-widest">Definir Nova Password</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-[#111d18] border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:border-[#0ea5e9] transition-all" placeholder="Mínimo 4 caracteres" />
                  <button type="submit" className="w-full py-6 bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 transition-all">
                    Guardar Nova Password
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1 tracking-widest">Nome Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#111d18] border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:border-[#0ea5e9] transition-all" placeholder="ex: João Silva" />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 uppercase ml-1 tracking-widest">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#111d18] border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:border-[#0ea5e9] transition-all" placeholder="exemplo@email.com" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1 tracking-widest">Palavra-passe</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('recover')} className="text-[8px] font-black text-[#0ea5e9] uppercase tracking-widest hover:underline mb-1">Esqueceu-se?</button>
                )}
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#111d18] border border-white/5 rounded-2xl px-6 py-5 text-sm text-white focus:border-[#0ea5e9] transition-all" placeholder="••••••••" />
            </div>
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1 tracking-widest">Definir PIN (4 dígitos)</label>
                <input type="tel" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,''))} className="w-full bg-[#111d18] border border-white/5 rounded-2xl px-6 py-5 text-sm tracking-[1em] text-center font-black focus:border-[#0ea5e9] transition-all text-white" placeholder="0000" />
              </div>
            )}
            
            <button type="submit" className="w-full py-6 bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-[#0ea5e9]/20 mt-4 active:scale-95 transition-all">
              {mode === 'login' ? 'Entrar' : 'Finalizar Registo'}
            </button>

            <div className="flex flex-col items-center gap-6 mt-10">
              <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-[10px] text-gray-600 font-black uppercase tracking-widest hover:text-white transition-colors">
                {mode === 'login' ? 'Não tem conta? Registe-se' : 'Já tem conta? Login'}
              </button>
              {mode === 'login' && localStorage.getItem('financas_pro_last_email') && (
                <button type="button" onClick={() => setMode('pin')} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[#13ec5b] font-black text-[10px] uppercase tracking-widest hover:bg-[#13ec5b]/10 transition-colors">
                  <span className="material-symbols-outlined text-lg">dialpad</span> Entrar com PIN
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
