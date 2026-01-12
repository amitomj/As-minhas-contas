
export interface Member {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  color?: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  source: string; // Origem (ex: Comida, Gasóleo)
  paymentMethod: string; // Tipo de Pagamento (ex: Dinheiro, Cartão)
  memberIds: string[];
  projectId?: string; // Ligação opcional a um projeto
  notes?: string;
  timestamp: number;
}

export interface UserAccount {
  email: string;
  password?: string;
  pin?: string;
  name: string;
  avatar: string;
  biometricEnabled?: boolean;
}

export interface AppData {
  balance: number;
  expenses: Expense[];
  members: Member[];
  projects: Project[];
  sources: string[];
  paymentMethods: string[];
  user: UserAccount;
  lastResetMonth?: string;
}

export type View = 'home' | 'transactions' | 'household' | 'export' | 'add-expense' | 'stats' | 'auth' | 'settings' | 'projects';
