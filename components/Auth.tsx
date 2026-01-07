
import React, { useState } from 'react';
import { UserAccount } from '../types';

interface Props {
  onLogin: (user: UserAccount) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (isLogin) {
      const storedUsers = JSON.parse(localStorage.getItem('financas_pro_users') || '[]');
      const user = storedUsers.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin({ email: user.email, name: user.name, avatar: `https://picsum.photos/seed/${user.email}/200` });
      } else {
        alert('Credenciais inválidas');
      }
    } else {
      if (!name) return;
      const storedUsers = JSON.parse(localStorage.getItem('financas_pro_users') || '[]');
      if (storedUsers.some((u: any) => u.email === email)) {
        alert('Email já registado');
        return;
      }
      const newUser = { email, password, name };
      localStorage.setItem('financas_pro_users', JSON.stringify([...storedUsers, newUser]));
      onLogin({ email, name, avatar: `https://picsum.photos/seed/${email}/200` });
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-dark px-8 justify-center">
      <div className="flex flex-col items-center mb-12">
        <div className="size-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-4 border border-primary/20">
          <span className="material-symbols-outlined text-primary text-4xl">payments</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Finanças Pro</h1>
        <p className="text-gray-500 text-sm mt-2">Gira a sua economia com inteligência</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">NOME COMPLETO</label>
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary transition-all"
              placeholder="Ex: João Silva"
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">EMAIL</label>
          <input 
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary transition-all"
            placeholder="exemplo@email.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">PALAVRA-PASSE</label>
          <input 
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary transition-all"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="w-full py-4 bg-primary text-bg-dark font-bold rounded-xl mt-4 shadow-lg shadow-primary/20 active:scale-95 transition-all">
          {isLogin ? 'Entrar' : 'Criar Conta'}
        </button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)} className="mt-8 text-sm text-gray-400 font-medium hover:text-primary transition-colors">
        {isLogin ? 'Não tem conta? Registe-se' : 'Já tem conta? Faça login'}
      </button>
    </div>
  );
};

export default Auth;
