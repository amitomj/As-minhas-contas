
import { AppData } from './types';

export const INITIAL_DATA: AppData = {
  balance: 0.00,
  user: {
    email: "",
    name: "Utilizador",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=finpro"
  },
  members: [],
  sources: ['Dinheiro', 'Cartão'],
  expenses: [],
  lastResetMonth: new Date().toISOString().slice(0, 7) // Inicializa com o mês atual
};
