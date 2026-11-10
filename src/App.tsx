import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, BookOpen } from 'lucide-react';
import type {
  Person,
  Transaction,
  PersonWithBalance,
  AppSettings,
  ThemeMode,
  TransactionType,
  GitHubRelease,
} from './types';
import {
  loadSettings,
  saveSettings,
  loadPersons,
  savePersons,
  loadTransactions,
  saveTransactions,
  calculatePersonsWithBalances,
  createPerson,
  createTransaction,
} from './services/storageService';
import {
  fetchLatestRelease,
  isNewerVersion,
  CURRENT_APP_VERSION,
} from './services/updateService';
import { Header } from './components/Header';
import { SummaryCard } from './components/SummaryCard';
import { SearchBar, type FilterStatus } from './components/SearchBar';
import { PersonCard } from './components/PersonCard';
import { PersonDetailModal } from './components/PersonDetailModal';
import { AddPersonModal } from './components/AddPersonModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { SettingsModal } from './components/SettingsModal';
import { UpdateDialog } from './components/UpdateDialog';

export const App: React.FC = () => {
  // Persistent Settings
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Persistent Data
  const [persons, setPersons] = useState<Person[]>(loadPersons);
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

  // Modals & Navigation
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [transactionModalTarget, setTransactionModalTarget] = useState<{
    personId: string;
    type: TransactionType;
  } | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [updateRelease, setUpdateRelease] = useState<GitHubRelease | null>(null);

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Save changes to LocalStorage
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateSettings({ theme: nextTheme });
  };

  // Auto-check updates on app open
  useEffect(() => {
    if (settings.autoCheckUpdates) {
      const checkOnLaunch = async () => {
        try {
          const release = await fetchLatestRelease(settings.githubRepo);
          if (release && isNewerVersion(release.tagName, CURRENT_APP_VERSION)) {
            setUpdateRelease(release);
          }
        } catch {
          // Silent catch on automatic background check so user is never interrupted by network glitches
        }
      };

      // Slight delay so the UI renders smoothly first
      const timer = setTimeout(checkOnLaunch, 1200);
      return () => clearTimeout(timer);
    }
  }, [settings.autoCheckUpdates, settings.githubRepo]);

  // Compute persons with balances
  const personsWithBalances = useMemo(() => {
    return calculatePersonsWithBalances(persons, transactions);
  }, [persons, transactions]);

  // Global totals
  const totalPendingDebt = useMemo(() => {
    return personsWithBalances.reduce((sum, p) => (p.totalDebt > 0 ? sum + p.totalDebt : sum), 0);
  }, [personsWithBalances]);

  const debtorCount = useMemo(() => {
    return personsWithBalances.filter((p) => p.totalDebt > 0).length;
  }, [personsWithBalances]);

  const clearedCount = useMemo(() => {
    return personsWithBalances.filter((p) => p.totalDebt <= 0).length;
  }, [personsWithBalances]);

  // Filtered persons
  const filteredPersons = useMemo(() => {
    return personsWithBalances.filter((person) => {
      // Status filter
      if (filterStatus === 'PENDING' && person.totalDebt <= 0) return false;
      if (filterStatus === 'CLEARED' && person.totalDebt > 0) return false;

      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = person.name.toLowerCase().includes(query);
        const matchesNotes = (person.notes || '').toLowerCase().includes(query);
        const matchesPhone = (person.phone || '').toLowerCase().includes(query);
        return matchesName || matchesNotes || matchesPhone;
      }

      return true;
    });
  }, [personsWithBalances, filterStatus, searchTerm]);

  // Selected person for detail view
  const currentSelectedPerson = useMemo(() => {
    if (!selectedPersonId) return null;
    return personsWithBalances.find((p) => p.id === selectedPersonId) || null;
  }, [selectedPersonId, personsWithBalances]);

  const currentPersonTransactions = useMemo(() => {
    if (!selectedPersonId) return [];
    return transactions.filter((t) => t.personId === selectedPersonId);
  }, [selectedPersonId, transactions]);

  // Actions
  const handleSavePerson = (
    name: string,
    phone: string,
    notes: string,
    initialDebt: number,
    initialConcept: string
  ) => {
    const { person, tx } = createPerson(name, phone, notes, initialDebt, initialConcept);
    const newPersons = [person, ...persons];
    setPersons(newPersons);
    savePersons(newPersons);

    if (tx) {
      const newTxs = [tx, ...transactions];
      setTransactions(newTxs);
      saveTransactions(newTxs);
    }

    setShowAddPersonModal(false);
  };

  const handleSaveTransaction = (
    type: TransactionType,
    amount: number,
    concept: string
  ) => {
    if (!transactionModalTarget) return;

    const tx = createTransaction(transactionModalTarget.personId, type, amount, concept);
    const newTxs = [tx, ...transactions];
    setTransactions(newTxs);
    saveTransactions(newTxs);
    setTransactionModalTarget(null);
  };

  const handleQuickSettle = (person: PersonWithBalance) => {
    if (person.totalDebt <= 0) return;
    const tx = createTransaction(
      person.id,
      'PAYMENT',
      person.totalDebt,
      'Saldado total de la cuenta'
    );
    const newTxs = [tx, ...transactions];
    setTransactions(newTxs);
    saveTransactions(newTxs);
  };

  const handleDeleteTransaction = (txId: string) => {
    const newTxs = transactions.filter((t) => t.id !== txId);
    setTransactions(newTxs);
    saveTransactions(newTxs);
  };

  const handleDeletePerson = (personId: string) => {
    const newPersons = persons.filter((p) => p.id !== personId);
    const newTxs = transactions.filter((t) => t.personId !== personId);
    setPersons(newPersons);
    setTransactions(newTxs);
    savePersons(newPersons);
    saveTransactions(newTxs);
    setSelectedPersonId(null);
  };

  const handleDataReload = () => {
    setPersons(loadPersons());
    setTransactions(loadTransactions());
    setSettings(loadSettings());
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-24">
      {/* Top App Bar */}
      <Header
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setShowSettingsModal(true)}
        pendingCount={debtorCount}
      />

      {/* Main Container */}
      <main className="max-w-2xl w-full mx-auto px-4 pt-4 space-y-4 flex-1">
        {/* Global Pending Summary Banner */}
        <SummaryCard
          totalPendingDebt={totalPendingDebt}
          debtorCount={debtorCount}
          clearedCount={clearedCount}
          currencySymbol={settings.currencySymbol}
        />

        {/* Search & Filter Tabs */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilter={filterStatus}
          onFilterChange={setFilterStatus}
          totalCount={personsWithBalances.length}
          pendingCount={debtorCount}
          clearedCount={clearedCount}
        />

        {/* Debtor List */}
        <div className="space-y-3 pt-1">
          {filteredPersons.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-gray-800 dark:text-gray-200">
                {searchTerm
                  ? 'No se encontraron resultados'
                  : 'Tu cuaderno está vacío'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                {searchTerm
                  ? 'Prueba con otro nombre o limpia el filtro de búsqueda.'
                  : 'Toca el botón verde abajo para registrar a la primera persona y su deuda.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddPersonModal(true)}
                  className="mt-2 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition inline-flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Anotar Primer Deudor</span>
                </button>
              )}
            </div>
          ) : (
            filteredPersons.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                currencySymbol={settings.currencySymbol}
                onClick={() => setSelectedPersonId(person.id)}
                onAddDebt={() =>
                  setTransactionModalTarget({ personId: person.id, type: 'DEBT' })
                }
                onAddPayment={() =>
                  setTransactionModalTarget({ personId: person.id, type: 'PAYMENT' })
                }
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button (Don't Make Me Think: Always accessible, obvious and huge) */}
      <div className="fixed bottom-5 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
        <button
          onClick={() => setShowAddPersonModal(true)}
          className="pointer-events-auto py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-full shadow-2xl shadow-emerald-700/50 flex items-center gap-2.5 transition transform active:scale-95 border-2 border-white/20"
          title="Añadir nueva persona al cuaderno"
        >
          <UserPlus className="w-5 h-5 text-emerald-100" />
          <span>+ Registrar Persona / Deuda</span>
        </button>
      </div>

      {/* Modal: Add Person */}
      {showAddPersonModal && (
        <AddPersonModal
          currencySymbol={settings.currencySymbol}
          onClose={() => setShowAddPersonModal(false)}
          onSave={handleSavePerson}
        />
      )}

      {/* Modal: Person Details & Full History */}
      {currentSelectedPerson && (
        <PersonDetailModal
          person={currentSelectedPerson}
          transactions={currentPersonTransactions}
          currencySymbol={settings.currencySymbol}
          onClose={() => setSelectedPersonId(null)}
          onAddDebt={() =>
            setTransactionModalTarget({
              personId: currentSelectedPerson.id,
              type: 'DEBT',
            })
          }
          onAddPayment={() =>
            setTransactionModalTarget({
              personId: currentSelectedPerson.id,
              type: 'PAYMENT',
            })
          }
          onQuickSettle={() => handleQuickSettle(currentSelectedPerson)}
          onDeleteTransaction={handleDeleteTransaction}
          onDeletePerson={() => handleDeletePerson(currentSelectedPerson.id)}
        />
      )}

      {/* Modal: Add Debt or Payment for specific Person */}
      {transactionModalTarget && (
        <AddTransactionModal
          person={
            personsWithBalances.find((p) => p.id === transactionModalTarget.personId)!
          }
          initialType={transactionModalTarget.type}
          currencySymbol={settings.currencySymbol}
          onClose={() => setTransactionModalTarget(null)}
          onSave={handleSaveTransaction}
        />
      )}

      {/* Modal: Settings & Updates */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettingsModal(false)}
          onDataImported={handleDataReload}
        />
      )}

      {/* Dialog: New GitHub Release Found on Startup */}
      {updateRelease && (
        <UpdateDialog
          release={updateRelease}
          onDismiss={() => setUpdateRelease(null)}
        />
      )}
    </div>
  );
};

export default App;
