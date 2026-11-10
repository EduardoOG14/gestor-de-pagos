import type { Person, Transaction, PersonWithBalance, AppSettings } from '../types';

const STORAGE_KEY_PERSONS = 'gestor_pagos_persons_v1';
const STORAGE_KEY_TRANSACTIONS = 'gestor_pagos_transactions_v1';
const STORAGE_KEY_SETTINGS = 'gestor_pagos_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  autoCheckUpdates: true,
  githubRepo: 'EduardoOG14/gestor-de-pagos',
  currencySymbol: '$',
};

// Seed initial data matching the user's explicit example
function getInitialSeed(): { persons: Person[]; transactions: Transaction[] } {
  const initialPersonId = 'seed-carlos-mecanico';
  const now = new Date().toISOString();

  const persons: Person[] = [
    {
      id: initialPersonId,
      name: 'Carlos Mecánico',
      phone: '',
      notes: 'Control interno de taller / repuestos',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: 'tx-seed-1',
      personId: initialPersonId,
      type: 'DEBT',
      amount: 360,
      concept: 'Reparación y repuestos',
      date: now,
      createdAt: now,
    },
  ];

  return { persons, transactions };
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function loadPersons(): Person[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERSONS);
    if (raw) {
      return JSON.parse(raw);
    }
    // Initialize seed data
    const seed = getInitialSeed();
    localStorage.setItem(STORAGE_KEY_PERSONS, JSON.stringify(seed.persons));
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(seed.transactions));
    return seed.persons;
  } catch (e) {
    console.error('Error loading persons', e);
    return [];
  }
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (raw) {
      return JSON.parse(raw);
    }
    const seed = getInitialSeed();
    return seed.transactions;
  } catch (e) {
    console.error('Error loading transactions', e);
    return [];
  }
}

export function savePersons(persons: Person[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PERSONS, JSON.stringify(persons));
  } catch (e) {
    console.error('Error saving persons', e);
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions', e);
  }
}

export function calculatePersonsWithBalances(
  persons: Person[],
  transactions: Transaction[]
): PersonWithBalance[] {
  return persons.map((person) => {
    const personTxs = transactions.filter((t) => t.personId === person.id);
    let totalDebt = 0;

    for (const tx of personTxs) {
      if (tx.type === 'DEBT') {
        totalDebt += Number(tx.amount) || 0;
      } else if (tx.type === 'PAYMENT') {
        totalDebt -= Number(tx.amount) || 0;
      }
    }

    // Sort transactions by date descending to find latest
    const sortedTxs = [...personTxs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      ...person,
      totalDebt: Math.round(totalDebt * 100) / 100,
      lastTransaction: sortedTxs[0],
      transactionCount: personTxs.length,
    };
  });
}

export function createPerson(name: string, phone = '', notes = '', initialDebt = 0, initialConcept = ''): { person: Person; tx?: Transaction } {
  const now = new Date().toISOString();
  const person: Person = {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    phone: phone.trim(),
    notes: notes.trim(),
    createdAt: now,
    updatedAt: now,
  };

  let tx: Transaction | undefined;
  if (initialDebt > 0) {
    tx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      personId: person.id,
      type: 'DEBT',
      amount: initialDebt,
      concept: initialConcept.trim() || 'Deuda inicial',
      date: now,
      createdAt: now,
    };
  }

  return { person, tx };
}

export function createTransaction(
  personId: string,
  type: 'DEBT' | 'PAYMENT',
  amount: number,
  concept: string,
  customDate?: string
): Transaction {
  const now = new Date().toISOString();
  return {
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    personId,
    type,
    amount: Math.abs(amount),
    concept: concept.trim() || (type === 'DEBT' ? 'Nueva deuda' : 'Abono recibido'),
    date: customDate || now,
    createdAt: now,
  };
}

export function exportBackupData(): string {
  const persons = loadPersons();
  const transactions = loadTransactions();
  const settings = loadSettings();
  const data = {
    app: 'GestorDePagos',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    persons,
    transactions,
    settings,
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data.persons) || !Array.isArray(data.transactions)) {
      throw new Error('Formato de respaldo no válido');
    }
    savePersons(data.persons);
    saveTransactions(data.transactions);
    if (data.settings) {
      saveSettings(data.settings);
    }
    return true;
  } catch (e) {
    console.error('Error importing backup', e);
    return false;
  }
}
