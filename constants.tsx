
import { AppData } from './types';

export const INITIAL_DATA: AppData = {
  balance: 1250.00,
  user: {
    name: "João Silva",
    avatar: "https://picsum.photos/seed/joao/200"
  },
  members: [
    { id: '1', name: 'Ana Silva', role: 'Parceiro' },
    { id: '2', name: 'Pedro Silva', role: 'Filho' }
  ],
  sources: ['Continente', 'Galp Energia', 'Cinema NOS', 'Millennium BCP', 'Dinheiro'],
  expenses: [
    { id: '1', amount: 45.50, date: '2023-10-24', source: 'Continente', memberId: 'all', timestamp: Date.now() - 3600000 },
    { id: '2', amount: 62.00, date: '2023-10-23', source: 'Galp Energia', memberId: '1', timestamp: Date.now() - 86400000 },
    { id: '3', amount: 14.50, date: '2023-10-22', source: 'Cinema NOS', memberId: 'all', timestamp: Date.now() - 172800000 }
  ]
};
