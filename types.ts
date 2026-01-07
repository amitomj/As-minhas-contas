
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
  memberId: string; // "all" or specific member ID
  notes?: string;
  timestamp: number;
}

export interface AppData {
  balance: number;
  expenses: Expense[];
  members: Member[];
  sources: string[];
  user: {
    name: string;
    avatar: string;
  };
}

export type View = 'home' | 'transactions' | 'household' | 'export' | 'add-expense' | 'permission';
