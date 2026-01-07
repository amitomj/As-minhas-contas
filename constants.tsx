
import { AppData } from './types';

export const INITIAL_DATA: AppData = {
  balance: 1250.00,
  user: {
    email: "utilizador@exemplo.com",
    name: "Utilizador",
    avatar: "https://picsum.photos/seed/user/200"
  },
  members: [
    { id: '1', name: 'Ana Silva', role: 'Parceiro' },
    { id: '2', name: 'Pedro Silva', role: 'Filho' }
  ],
  sources: ['Continente', 'Galp Energia', 'Cinema NOS', 'Millennium BCP', 'Dinheiro'],
  expenses: [
    { id: '1', amount: 45.50, date: '2023-10-24', source: 'Continente', memberIds: ['1', '2'], timestamp: Date.now() - 3600000 },
    { id: '2', amount: 62.00, date: '2023-10-23', source: 'Galp Energia', memberIds: ['1'], timestamp: Date.now() - 86400000 },
    { id: '3', amount: 14.50, date: '2023-10-22', source: 'Cinema NOS', memberIds: [], timestamp: Date.now() - 172800000 }
  ]
};
