
export interface Member {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  source: string;
  memberIds: string[];
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
  sources: string[];
  user: UserAccount;
}

export type View = 'home' | 'transactions' | 'household' | 'export' | 'add-expense' | 'permission' | 'stats' | 'auth' | 'settings';
