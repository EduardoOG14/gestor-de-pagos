export interface Person {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'DEBT' | 'PAYMENT';

export interface Transaction {
  id: string;
  personId: string;
  type: TransactionType;
  amount: number;
  concept: string;
  date: string; // ISO string
  createdAt: string;
}

export interface PersonWithBalance extends Person {
  totalDebt: number; // sum(DEBT) - sum(PAYMENT)
  lastTransaction?: Transaction;
  transactionCount: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  autoCheckUpdates: boolean;
  githubRepo: string; // owner/repo, default: "EduardoOG14/gestor-de-pagos"
  currencySymbol: string; // default: "$"
}

export interface GitHubRelease {
  tagName: string;
  name: string;
  body: string;
  publishedAt: string;
  apkDownloadUrl?: string;
  apkSize?: number;
  htmlUrl: string;
}
