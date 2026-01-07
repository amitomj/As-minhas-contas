
import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';

interface Props {
  onLogin: (user: UserAccount) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [canBiometric, setCanBiometric] = useState(false);

  useEffect(() => {
    // Verificar se o browser suporta WebAuthn (Biometria)
    if (window.PublicKeyCredential) {
      setCanBiometric(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    const storedUsers = JSON.parse(localStorage.getItem('financas_pro_users') || '[]');
    
    if (isLogin) {
      const user = storedUsers.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin({ email: user.email, name: user.name, avatar: `https://picsum.photos/seed/${user.email}/200`, biometricEnabled: user.biometricEnabled });
      } else {
        alert('Credenciais inválidas');
      }
    } else {
      if (!name) return;
      if (storedUsers.some((u: any) => u.email === email)) {
        alert('Email já registado');
        return;
      }
      const newUser = { email, password, name, biometricEnabled: false };
      localStorage.setItem('financas_pro_users', JSON.stringify([...storedUsers, newUser]));
      onLogin({ email, name, avatar: `https://picsum.photos/seed/${email}/200` });
    }
  };

  const handleBiometricLogin = async () => {
    // Simulação de fluxo WebAuthn
    // Num cenário real, usaríamos navigator.credentials.get()
    const lastUserEmail = localStorage.getItem('financas_pro_last_email');
    if (!lastUserEmail) {
      alert("Por favor, faça o primeiro login com palavra-passe para ativar a biometria.");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('financas_pro_users') || '[]');
    const user = storedUsers.find((u: any) => u.email === lastUserEmail && u.biometricEnabled);

    if (!user) {
      alert("Biometria não ativada para este utilizador.");
      return;
    }

    // "Pressionar o dedo" (Simulado com um delay)
    try {
      // Aqui o browser abriria o diálogo nativo de impressão digital
      onLogin({ email: user.email, name: user.name, avatar: `https://picsum.photos/seed/${user.email}/200`, biometricEnabled: true });
    } catch (err) {
      alert("Falha na autenticação biométrica.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-dark px-8 justify-center animate-in fade-in duration-500">
      <div className="flex flex-col items-center mb-10">
        <div className="size-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-4 border border-primary/20 shadow-2xl shadow-primary/10">
          <span className="material-symbols-outlined text-primary text-4xl">payments</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Finanças Pro</h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Gestão inteligente e segura</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-600 ml-1 uppercase tracking-widest">Nome Completo</label>
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-surface-dark border border-white/5 rounded-2xl px-5 py-4 focus:ring-primary focus:border-primary transition-all text-sm"
              placeholder="Ex: João Silva"
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-600 ml-1 uppercase tracking-widest">Email</label>
          <input 
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-surface-dark border border-white/5 rounded-2xl px-5 py-4 focus:ring-primary focus:border-primary transition-all text-sm"
            placeholder="exemplo@email.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-600 ml-1 uppercase tracking-widest">Palavra-passe</label>
          <input 
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-surface-dark border border-white/5 rounded-2xl px-5 py-4 focus:ring-primary focus:border-primary transition-all text-sm"
            placeholder="••••••••"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 py-4 bg-primary text-bg-dark font-black uppercase tracking-[0.15em] rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm">
            {isLogin ? 'Entrar' : 'Registar'}
          </button>
          
          {isLogin && canBiometric && (
            <button 
              type="button"
              onClick={handleBiometricLogin}
              className="px-5 bg-surface-dark border border-white/10 rounded-2xl text-primary active:scale-95 transition-all flex items-center justify-center"
              title="Entrar com Impressão Digital"
            >
              <span className="material-symbols-outlined text-3xl font-bold">fingerprint</span>
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button onClick={() => setIsLogin(!isLogin)} className="text-xs text-gray-500 font-bold uppercase tracking-wider hover:text-primary transition-colors">
          {isLogin ? 'Não tem conta? Registe-se' : 'Já tem conta? Faça login'}
        </button>
      </div>

      <p className="fixed bottom-10 left-0 right-0 text-center text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em]">Secure Biometric Access</p>
    </div>
  );
};

export default Auth;
